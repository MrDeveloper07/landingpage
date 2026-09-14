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
  label: string;
  timeEst: string;
  title: string;
  shortDesc: string;
  checklist: string[];
  codePreview: {
    filename: string;
    language: string;
    code: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
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

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is is-a-coder.in really 100% free forever?",
    answer:
      "Yes! is-a-coder.in is completely free for all software engineers, open-source contributors, students, and creators. There are zero subscription costs, no hidden renewal fees, and no credit card required.",
  },
  {
    question: "How do I connect my subdomain to GitHub Pages or Vercel?",
    answer:
      "Select 'CNAME' when submitting your subdomain request and enter your target (e.g. `yourusername.github.io` for GitHub Pages or `cname.vercel-dns.com` for Vercel). Once approved, open your hosting provider's Custom Domain settings, enter `yourname.is-a-coder.in`, and save. Free SSL certificates are automatically provisioned.",
  },
  {
    question: "What DNS record types are supported?",
    answer:
      "We support all major DNS records: CNAME (pointing to GitHub Pages, Vercel, Netlify, Render), A Records (IPv4 server addresses), AAAA Records (IPv6), and TXT Records (domain ownership verification for Google, Bing, etc.).",
  },
  {
    question: "How long does it take for a subdomain to be approved and go live?",
    answer:
      "Requests are processed rapidly through our Admin Control Center. Once approved, DNS records propagate globally across edge Anycast DNS networks within 2 to 10 minutes worldwide.",
  },
  {
    question: "Can I manage multiple subdomains under one account?",
    answer:
      "Yes! Each developer account can register up to 5 active subdomains for their different projects, client portfolios, or open-source documentation sites.",
  },
  {
    question: "How do I update my destination or delete an existing subdomain?",
    answer:
      "You can log into your Developer Dashboard at any time to view all your registered subdomains, check their live status, and request destination target updates or record revocations.",
  },
];

export const STATS_DATA: StatItem[] = [
  {
    id: "subdomains",
    label: "Active Subdomains",
    value: 34200,
    suffix: "+",
    description: "Developers hosting live production portfolios and web apps",
    icon: "Globe",
  },
  {
    id: "latency",
    label: "Global DNS Latency",
    value: 18,
    suffix: "ms",
    prefix: "<",
    description: "Multi-region DNS edge resolution with instant propagation",
    icon: "Zap",
  },
  {
    id: "uptime",
    label: "Uptime SLA",
    value: 99.99,
    suffix: "%",
    description: "Enterprise-grade zero downtime DNS infrastructure",
    icon: "ShieldCheck",
  },
  {
    id: "countries",
    label: "Countries Reached",
    value: 148,
    suffix: "+",
    description: "Global community of open source builders and developers",
    icon: "Users",
  },
];

export const FEATURES_DATA: Feature[] = [
  {
    id: "web-dashboard",
    title: "Self-Service Web Dashboard",
    description: "Claim, configure, and monitor your subdomains in seconds through a beautiful developer portal with live availability checks.",
    badge: "Interactive UI",
    iconName: "Cpu",
    highlight: "10-second setup",
    codeSnippet: `Request: junior.is-a-coder.in
Type: CNAME -> junior.github.io
Status: Active 🟢`,
  },
  {
    id: "admin-workflow",
    title: "Fast Admin Review & GoDaddy Ready",
    description: "Automated queue with 1-click GoDaddy DNS copy helpers and instant approval workflows to keep the platform safe and active.",
    badge: "1-Click Workflow",
    iconName: "Shield",
    highlight: "Zero hassle review",
    codeSnippet: `📋 Copied for GoDaddy:
Type: CNAME | Name: junior
Target: junior.github.io`,
  },
  {
    id: "full-record-support",
    title: "Complete Record Flexibility",
    description: "Full support for CNAME (GitHub Pages, Vercel, Netlify), A records (VPS & cloud servers), AAAA (IPv6), and TXT verification records.",
    badge: "All Record Types",
    iconName: "Zap",
    highlight: "CNAME / A / AAAA / TXT",
    codeSnippet: `CNAME -> username.github.io
A     -> 185.199.108.153
TXT   -> google-site-verification=...`,
  },
  {
    id: "ssl-security",
    title: "Automatic SSL & Anti-Abuse Shield",
    description: "Built-in reserved name protection, anti-phishing filters, and compatibility with automatic Let's Encrypt / Cloudflare SSL.",
    badge: "Enterprise Security",
    iconName: "GitPullRequest",
    highlight: "Auto TLS 1.3 & HSTS",
    codeSnippet: `Protected: admin, api, root
SSL: Free Let's Encrypt / TLS 1.3
Status: 100% Secure`,
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    label: "Search & Claim",
    timeEst: "~10 sec",
    title: "Check Availability & Enter Your Target",
    shortDesc: "Sign in to the developer portal and search for your dream prefix. Real-time validation checks for collisions and reserved words.",
    checklist: [
      "Real-time subdomain availability checker",
      "Choose record type: CNAME, A, AAAA, or TXT",
      "Enter your target: GitHub Pages, Vercel, or custom IP",
    ],
    codePreview: {
      filename: "dashboard/new-request.tsx",
      language: "typescript",
      code: `const request = {
  subdomain: "junior",
  fullDomain: "junior.is-a-coder.in",
  recordType: "CNAME",
  target: "junior.github.io",
  status: "pending"
};`,
    },
  },
  {
    step: 2,
    label: "Admin Review",
    timeEst: "~30 sec",
    title: "Fast Review & DNS Configuration",
    shortDesc: "Your request appears in the Admin Control Center where the administrator reviews the target and enters the DNS record.",
    checklist: [
      "1-Click GoDaddy formatted DNS copy tool",
      "Anti-abuse & reserved name protection",
      "Instant status update from Pending to Active",
    ],
    codePreview: {
      filename: "admin/review-queue.log",
      language: "bash",
      code: `[QUEUE] New Request Received:
> Subdomain: junior.is-a-coder.in
> Target: junior.github.io (CNAME)
> Requester: Alex Rivera (alex@devmail.io)
> Action: 📋 Copied for DNS -> [Mark Approved]`,
    },
  },
  {
    step: 3,
    label: "Go Live",
    timeEst: "Instant",
    title: "Global Propagation & Free SSL",
    shortDesc: "Your subdomain is now active worldwide. Add it as a Custom Domain in your GitHub Pages or Vercel settings and you are live!",
    checklist: [
      "Automatic TLS 1.3 / HTTPS certificate provisioned",
      "Works with GitHub Pages, Vercel, Netlify & VPS",
      "Your new address https://junior.is-a-coder.in is live!",
    ],
    codePreview: {
      filename: "dns-status.json",
      language: "json",
      code: `{
  "domain": "junior.is-a-coder.in",
  "status": "active",
  "ssl": "enabled",
  "target": "junior.github.io",
  "latency": "14ms",
  "message": "Domain is resolving worldwide!"
}`,
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
  { name: "GoDaddy DNS", icon: "Server" },
  { name: "Vercel Fast Edge", icon: "Triangle" },
  { name: "Let's Encrypt SSL", icon: "Lock" },
  { name: "GitHub Pages", icon: "GitBranch" },
];
