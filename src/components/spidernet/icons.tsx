import type { IconName } from "@/lib/spidernet/types";

type IconProps = {
  name: IconName;
  className?: string;
};

export function AppIcon({ name, className = "h-5 w-5" }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    className,
  };

  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <path d="M4 5h16v5H4z" />
          <path d="M4 14h7v5H4z" />
          <path d="M14 14h6v5h-6z" />
        </svg>
      );
    case "input":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 18h14" />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <path d="m14 6 4 4" />
          <path d="m13 7 4-4 3 3-4 4" />
          <path d="m5 19 7-7" />
          <path d="m4 15 5 5" />
        </svg>
      );
    case "agents":
      return (
        <svg {...common}>
          <circle cx="7" cy="8" r="2.5" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M3.5 18c.8-2 2.3-3 3.5-3s2.7 1 3.5 3" />
          <path d="M13.5 18c.8-2 2.3-3 3.5-3s2.7 1 3.5 3" />
          <path d="M10 8h4" />
        </svg>
      );
    case "bridge":
      return (
        <svg {...common}>
          <path d="M4 18h16" />
          <path d="M6 18v-4a6 6 0 0 1 12 0v4" />
          <path d="M9 10h6" />
        </svg>
      );
    case "observatory":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M7 10h10" />
          <circle cx="12" cy="10" r="5" />
        </svg>
      );
    case "ledger":
      return (
        <svg {...common}>
          <path d="M6 4h10a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2Z" />
          <path d="M6 4v14a2 2 0 0 1 2-2h10" />
          <path d="M10 9h5" />
          <path d="M10 13h5" />
        </svg>
      );
    default:
      return null;
  }
}
