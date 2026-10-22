import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

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

function ErrorComponent({ error: rawError, reset }: { error: unknown; reset: () => void }) {
  const error = rawError instanceof Error ? rawError : new Error(String(rawError));
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
      { name: "google", content: "notranslate" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Электрик СПб — Электромонтаж, сборка электрощитов | S&M electric" },
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
      { name: "author", content: "S&M electric" },
      { property: "og:title", content: "Электрик СПб — Электромонтаж, сборка электрощитов | S&M electric" },
      {
        property: "og:description",
        content:
          "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика. Гарантия, договор, выезд по СПб и области. Бесплатный расчёт.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "S&M electric" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Электрик СПб — Электромонтаж, сборка электрощитов | S&M electric" },
      { name: "twitter:description", content: "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика. Гарантия, договор, выезд по СПб и области. Бесплатный расчёт." },
      { property: "og:url", content: "https://sm-electric.ru/" },
    ],
    styles: [
      {
        // Загрузочная анимация: мигающая молния на графитовом фоне.
        // Инлайн-CSS, чтобы работала до загрузки основного styles.css и JS.
        children: `#app-splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:oklch(0.175 0.006 265);opacity:1;transition:opacity .45s ease}#app-splash.splash-hide{opacity:0;pointer-events:none}#app-splash svg{width:38px;height:114px;filter:drop-shadow(0 0 12px oklch(0.86 0.185 95 / .55)) drop-shadow(0 0 40px oklch(0.86 0.185 95 / .3));animation:splash-bolt 2.2s ease-in-out infinite}@keyframes splash-bolt{0%,100%{opacity:.45;transform:scale(1)}6%{opacity:1;transform:scale(1.05)}10%{opacity:.65}14%{opacity:1}44%{opacity:.5}50%{opacity:1;transform:scale(1.07)}54%{opacity:.7}58%{opacity:1;transform:scale(1)}}@media (prefers-reduced-motion:reduce){#app-splash svg{animation:none;opacity:1}}`,
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
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
        // Одноразовое восстановление при устаревшем HTML/кеше:
        // если браузер не может загрузить JS-чанк (старые хэши), перезагружаем страницу без кеша.
        children: `(function(){try{var K='__stale_reload__';var done=sessionStorage.getItem(K)==='1';function rec(){if(done)return;done=true;try{sessionStorage.setItem(K,'1')}catch(e){}
if(window.caches&&caches.keys){caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).catch(function(){}).then(function(){location.reload()})}else{location.reload()}}
window.addEventListener('error',function(e){var t=e&&e.target;if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK'))rec()},true);
window.addEventListener('unhandledrejection',function(e){var m=(e&&e.reason&&(e.reason.message||e.reason))+'';if(/dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically imported/i.test(m))rec()});
window.addEventListener('load',function(){setTimeout(function(){try{sessionStorage.removeItem(K)}catch(e){}},5000)});}catch(e){}})();`,
      },
      {

        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Electrician",
          name: "S&M Electric",
          url: "https://sm-electric.ru/",
          logo: "https://sm-electric.ru/favicon.png",
          image: "https://sm-electric.ru/favicon.png",
          description:
            "Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка электрощитов, услуги электрика.",
          areaServed: ["Санкт-Петербург", "Ленинградская область"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Санкт-Петербург",
            addressCountry: "RU",
          },
          telephone: "+79817726663",
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
  // Сплэш рендерится на сервере и виден до гидратации; после монтирования
  // React плавно гаснет и убирается из DOM. Начальное состояние одинаково
  // на сервере и клиенте, поэтому несоответствия гидратации нет.
  const [splashHiding, setSplashHiding] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    setSplashHiding(true);
    const timer = window.setTimeout(() => setSplashGone(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <html lang="ru" translate="no" className="notranslate">
      <head>
        <HeadContent />
      </head>
      <body>
        {!splashGone && (
          <div
            id="app-splash"
            aria-hidden="true"
            className={splashHiding ? "splash-hide" : undefined}
          >
            <svg viewBox="4 0 32 96" fill="none" role="presentation">
              <defs>
                <linearGradient
                  id="smSplashBolt"
                  x1="19"
                  y1="4"
                  x2="19"
                  y2="92"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FFF3B0" />
                  <stop offset="0.45" stopColor="#F7CF00" />
                  <stop offset="1" stopColor="#E0A400" />
                </linearGradient>
              </defs>
              <path
                d="M24 4 8 44h10l-6 22h9L10 92l20-31h-9l6-22h-10z"
                fill="url(#smSplashBolt)"
              />
            </svg>
          </div>
        )}
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
