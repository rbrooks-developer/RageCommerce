import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 pb-4"
      style={{ borderBottom: "1px solid color-mix(in srgb, var(--site-fg) 15%, transparent)" }}
    >
      <ol className="flex items-center gap-1.5 flex-wrap text-sm font-medium">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--site-fg)", opacity: 0.4 }} aria-hidden="true" />
              )}
              {isLast || !crumb.href ? (
                <span aria-current={isLast ? "page" : undefined} style={{ color: "var(--site-fg)" }}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:underline underline-offset-2 transition-opacity hover:opacity-100"
                  style={{ color: "var(--site-fg)", opacity: 0.6 }}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
