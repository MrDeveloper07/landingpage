export interface Feature {
  id: string;
  title: string;
  description: string;
  badge: string;
  iconName: string;
  codeSnippet?: string;
  highlight: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  description: string;
  icon: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  shortDesc: string;
  details: string[];
  codePreview: {
    filename: string;
    language: string;
    code: string;
  };
}

export interface ShowcaseProfile {
  id: string;
  username: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  stars: string;
  tags: string[];
  category: "Full Stack" | "AI & ML" | "DevOps" | "Mobile";
  activeRecord: string;
}

export const STATS_DATA: StatItem[] = [
  {
    id: "subdomains",
    label: "Active Subdomains",
    value: 34200,
    suffix: "+",
    description: "Developers hosting live production portfolios and projects",
    icon: "Globe",
  },
  {
    id: "latency",
    label: "Global DNS Latency",
    value: 18,
    suffix: "ms",
    prefix: "<",
    description: "Powered by Cloudflare Anycast edge network spanning 300+ cities",
    icon: "Zap",
  },
  {
    id: "uptime",
    label: "Uptime SLA",
    value: 99.99,
    suffix: "%",
    description: "Enterprise-grade zero downtime DNS propagation infrastructure",
    icon: "ShieldCheck",
  },
  {
    id: "countries",
    label: "Countries Reached",
    value: 148,
    suffix: "+",
    description: "Global community of open source builders and software artisans",
    icon: "Users",
  },
];

export const FEATURES_DATA: Feature[] = [
  {
    id: "dns-anycast",
    title: "Ultra-Fast Anycast DNS",
    description: "Your domain resolves in under 20 milliseconds worldwide with multi-region DNS caching and automated health checks.",
    badge: "Cloudflare Anycast",
    iconName: "Zap",
    highlight: "< 20ms global resolution",
    codeSnippet: `;; Query time: 14 msec
alex.is-a-coder.in.  300  IN  CNAME  alex.github.io.`,
  },
  {
    id: "github-gitops",
    title: "GitOps Pull Request Workflow",
    description: "Register and manage records through simple JSON files on GitHub. Automated GitHub Actions validate and deploy instantly.",
    badge: "100% Open Source",
    iconName: "GitPullRequest",
    highlight: "CI/CD automated in 45s",
    codeSnippet: `{
  "owner": { "username": "alexdev" },
  "record": { "CNAME": "portfolio.vercel.app" }
}`,
  },
  {
    id: "full-record-support",
    title: "Complete Record Flexibility",
    description: "Support for A, AAAA, CNAME, TXT (domain verification), MX records, and URL redirections with zero restrictive barriers.",
    badge: "All Record Types",
    iconName: "Cpu",
    highlight: "A / AAAA / CNAME / TXT / MX",
    codeSnippet: `CNAME -> username.github.io
TXT   -> google-site-verification=...
A     -> 185.199.108.153`,
  },
  {
    id: "ssl-security",
    title: "Automatic SSL & DDoS Shield",
    description: "Pre-configured for Let's Encrypt and Cloudflare Universal SSL with built-in Layer 7 DDoS mitigation out of the box.",
    badge: "Enterprise Security",
    iconName: "Shield",
    highlight: "Auto TLS 1.3 & HSTS",
    codeSnippet: `SSL: Let's Encrypt Authority X3
TLS 1.3 | HTTP/3 QUIC enabled`,
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: "Fork the Repository & Add Your JSON",
    shortDesc: "Clone the official repository and create a single JSON file with your desired handle.",
    details: [
      "Navigate to domains/ directory",
      "Create yourfile as `username.json`",
      "Define your CNAME, A, or TXT routing destinations",
    ],
    codePreview: {
      filename: "domains/priya.json",
      language: "json",
      code: `{
  "description": "Priya's AI Research Portfolio",
  "repo": "https://github.com/priyadev/portfolio",
  "owner": {
    "username": "priyadev",
    "email": "priya@ml-labs.io"
  },
  "record": {
    "CNAME": "priyadev.github.io"
  }
}`,
    },
  },
  {
    step: 2,
    title: "Submit PR & Let CI Verify",
    shortDesc: "Open a Pull Request. GitHub Actions instantly inspects syntax, collisions, and DNS validity.",
    details: [
      "Automated linting and schema check runs in 15 seconds",
      "Collision detector verifies domain exclusivity",
      "PR is tagged ready for auto-merge bot",
    ],
    codePreview: {
      filename: ".github/workflows/verify-dns.yml",
      language: "yaml",
      code: `Run DNS Schema Validation...
✔ Syntax valid (domains/priya.json)
✔ Subdomain available: priya.is-a-coder.in
✔ Destination reachable: priyadev.github.io
Status: All 4 checks passed. Ready to merge.`,
    },
  },
  {
    step: 3,
    title: "Live Globally in Under 60 Seconds",
    shortDesc: "Once merged, our Cloudflare API worker pushes DNS records across 300+ global edge locations.",
    details: [
      "Automatic TLS 1.3 certificate generated",
      "Active CNAME pointing directly to your hosting provider (Vercel, GitHub Pages, Cloudflare Pages, AWS)",
      "Bragging rights with your shiny `username.is-a-coder.in` URL",
    ],
    codePreview: {
      filename: "status.log",
      language: "bash",
      code: `[DEPLOY] 2026-09-14 13:30:00 UTC
> Record created: priya.is-a-coder.in -> priyadev.github.io
> Cloudflare Edge cache refreshed (312 data centers)
> SSL certificate active. Status: 200 OK`,
    },
  },
];

export const SHOWCASE_PROFILES: ShowcaseProfile[] = [
  {
    id: "alex",
    username: "alex",
    name: "Alex Rivera",
    role: "Staff Full-Stack Engineer",
    bio: "Building distributed systems, Rust microservices, and reactive web applications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    stars: "2.4k",
    tags: ["Next.js", "Rust", "PostgreSQL", "Docker"],
    category: "Full Stack",
    activeRecord: "alex.is-a-coder.in -> alex-portfolio.vercel.app",
  },
  {
    id: "priya",
    username: "priya",
    name: "Priya Sharma",
    role: "AI & ML Researcher",
    bio: "Exploring diffusion models, LLM fine-tuning, and open-source scientific tools.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    stars: "4.1k",
    tags: ["PyTorch", "Transformers", "CUDA", "FastAPI"],
    category: "AI & ML",
    activeRecord: "priya.is-a-coder.in -> priyasharma.github.io",
  },
  {
    id: "marcus",
    username: "marcus",
    name: "Marcus Vance",
    role: "Cloud & DevOps Architect",
    bio: "Kubernetes enthusiast, Terraform contributor, and infrastructure as code fanatic.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    stars: "1.8k",
    tags: ["Kubernetes", "Terraform", "Go", "AWS"],
    category: "DevOps",
    activeRecord: "marcus.is-a-coder.in -> marcus-infra.pages.dev",
  },
  {
    id: "elena",
    username: "elena",
    name: "Elena Rostova",
    role: "Mobile & Web UI Artisan",
    bio: "Crafting fluid animations, React Native experiences, and design systems.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    stars: "3.7k",
    tags: ["React Native", "Swift", "Framer Motion", "Tailwind"],
    category: "Mobile",
    activeRecord: "elena.is-a-coder.in -> elenarostova.netlify.app",
  },
  {
    id: "devkiran",
    username: "kiran",
    name: "Kiran Patel",
    role: "Backend & Systems Hacker",
    bio: "High-throughput messaging queues, Raft consensus, and kernel networking.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    stars: "5.2k",
    tags: ["Go", "gRPC", "Kafka", "Linux eBPF"],
    category: "Full Stack",
    activeRecord: "kiran.is-a-coder.in -> kiranp.github.io",
  },
  {
    id: "sophia",
    username: "sophia",
    name: "Sophia Chen",
    role: "Generative AI Creative",
    bio: "Connecting generative art with WebGL shaders, Three.js, and neural latent spaces.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    stars: "1.9k",
    tags: ["Three.js", "WebGL", "TypeScript", "Python"],
    category: "AI & ML",
    activeRecord: "sophia.is-a-coder.in -> sophia-art.vercel.app",
  },
];

export const TRUST_BADGES = [
  { name: "Cloudflare DNS", icon: "Cloud" },
  { name: "GitHub Actions", icon: "GitBranch" },
  { name: "Vercel Fast Edge", icon: "Triangle" },
  { name: "Let's Encrypt SSL", icon: "Lock" },
  { name: "Fastly Network", icon: "Zap" },
];
