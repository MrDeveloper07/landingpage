import mongoose from "mongoose";
import dns from "node:dns";
import { promisify } from "node:util";

const resolveSrvPromise = promisify(dns.resolveSrv);
const resolveTxtPromise = promisify(dns.resolveTxt);

// Configure DNS globally for public resolvers (Google / Cloudflare)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  console.warn("[MongoDB DNS] Warning setting DNS servers:", e);
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Resolves a mongodb+srv:// URI into a standard mongodb:// seed list URI
 * if local Windows / ISP DNS blocks SRV records (querySrv ECONNREFUSED).
 */
async function resolveSrvUri(srvUri: string): Promise<string> {
  if (!srvUri.startsWith("mongodb+srv://")) {
    return srvUri;
  }

  try {
    const withoutPrefix = srvUri.slice("mongodb+srv://".length);
    const atIndex = withoutPrefix.indexOf("@");

    let authPart = "";
    let restPart = withoutPrefix;

    if (atIndex !== -1) {
      authPart = withoutPrefix.slice(0, atIndex + 1);
      restPart = withoutPrefix.slice(atIndex + 1);
    }

    const slashIndex = restPart.indexOf("/");
    const questionIndex = restPart.indexOf("?");

    let host = restPart;
    let pathAndQuery = "";

    if (slashIndex !== -1) {
      host = restPart.slice(0, slashIndex);
      pathAndQuery = restPart.slice(slashIndex);
    } else if (questionIndex !== -1) {
      host = restPart.slice(0, questionIndex);
      pathAndQuery = "/" + restPart.slice(questionIndex);
    }

    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

    // Resolve SRV hostnames
    const srvRecords = await resolveSrvPromise(`_mongodb._tcp.${host}`);
    const hostList = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");

    // Resolve TXT options (e.g. replicaSet, authSource)
    let txtOptions = "";
    try {
      const txtRecords = await resolveTxtPromise(host);
      txtOptions = txtRecords.map((t) => t.join("")).join("&");
    } catch {
      // Ignore TXT resolution failure
    }

    // Combine parameters
    const delimiter = pathAndQuery.includes("?") ? "&" : "?";
    let fullPathAndQuery = pathAndQuery || "/";

    const extraParams: string[] = ["ssl=true"];
    if (txtOptions) {
      extraParams.push(txtOptions);
    }

    if (!fullPathAndQuery.includes("?")) {
      fullPathAndQuery += `?${extraParams.join("&")}`;
    } else {
      fullPathAndQuery += `${delimiter}${extraParams.join("&")}`;
    }

    const resolvedUri = `mongodb://${authPart}${hostList}${fullPathAndQuery}`;
    console.log("[MongoDB] Automatically resolved SRV URI to standard replica set seeds.");
    return resolvedUri;
  } catch (resolveErr) {
    console.warn("[MongoDB] Fallback SRV resolution error:", resolveErr);
    return srvUri;
  }
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch {}

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 50, // Maintain up to 50 socket connections for high concurrency
      minPoolSize: 5,  // Keep at least 5 warm connections ready
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
    };

    cached!.promise = (async () => {
      try {
        return await mongoose.connect(MONGODB_URI, opts);
      } catch (firstErr: unknown) {
        const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
        // If Windows DNS failed on SRV query, resolve explicitly via public DNS and retry
        if (errMsg.includes("querySrv") || errMsg.includes("ECONNREFUSED") || MONGODB_URI.startsWith("mongodb+srv://")) {
          console.warn("[MongoDB] SRV query failed with local DNS. Attempting direct resolver fallback...");
          const resolvedUri = await resolveSrvUri(MONGODB_URI);
          return await mongoose.connect(resolvedUri, opts);
        }
        throw firstErr;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
