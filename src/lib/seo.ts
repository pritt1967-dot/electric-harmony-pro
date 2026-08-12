export const SITE_URL = "https://electric-9117335567.lovable.app";

export const canonical = (path: string) => `${SITE_URL}${path}`;

export type Crumb = { label: string; href: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: canonical(c.href),
    })),
  };
}
