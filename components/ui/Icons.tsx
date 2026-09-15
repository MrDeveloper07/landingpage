import React from "react";

export function GithubIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FaviconIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      {...props}
    >
      <path d="M16 26C16 14 23 8 32 8C41 8 48 14 48 26C48 34 45 42 45 42H19C19 42 16 34 16 26Z" fill="#B45309" />
      <ellipse cx="32" cy="24" rx="11" ry="12" fill="#FBBF24" />
      <path d="M21 20C21 13 26 10 32 10C35 10 39 12 41 15C39 20 34 23 28 23C24 23 22 21 21 20Z" fill="#92400E" />
      <path d="M43 20C43 14 39 11 34 10C39 12 42 16 43 20Z" fill="#78350F" />
      <path d="M18 44C18 39 24 37 32 37C40 37 46 39 46 44V48H18V44Z" fill="#64748B" />
      <rect x="10" y="36" width="44" height="24" rx="4" fill="#475569" stroke="#334155" strokeWidth="1.5" />
      <rect x="12" y="38" width="40" height="20" rx="3" fill="#1E293B" />
      <path d="M24 44L20 48L24 52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 43L30 53" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 44L44 48L40 52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
