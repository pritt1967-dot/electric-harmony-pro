import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Электрик СПб — Электромонтаж, сборка электрощитов | ВольтПро" },
      {
        name: "description",
        content:
          "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика. Гарантия, договор, выезд по СПб и области. Бесплатный расчёт.",
      },
      {
        name: "keywords",
        content:
          "электрик Санкт-Петербург, электромонтаж СПб, сборка электрощитов, монтаж электропроводки, услуги электрика спб",
      },
      { name: "author", content: "ВольтПро" },
      { property: "og:title", content: "Электрик СПб — Электромонтаж, сборка электрощитов | ВольтПро" },
      {
        property: "og:description",
        content:
          "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика. Гарантия, договор, выезд по СПб и области. Бесплатный расчёт.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ВольтПро" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Электрик СПб — Электромонтаж, сборка электрощитов | ВольтПро" },
      { name: "twitter:description", content: "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика. Гарантия, договор, выезд по СПб и области. Бесплатный расчёт." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52369898-35f4-4259-8255-17b88877a6fe/id-preview-6d207ed3--a97cfcc1-6e84-4897-ab6b-f8f8a9da8d9d.lovable.app-1783502660562.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52369898-35f4-4259-8255-17b88877a6fe/id-preview-6d207ed3--a97cfcc1-6e84-4897-ab6b-f8f8a9da8d9d.lovable.app-1783502660562.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Electrician",
          name: "ВольтПро",
          description:
            "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика.",
          areaServed: "Санкт-Петербург",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Санкт-Петербург",
            addressCountry: "RU",
          },
          telephone: "+7 (812) 000-00-00",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
