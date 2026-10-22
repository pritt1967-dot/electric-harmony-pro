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
        children: `#app-splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:oklch(0.175 0.006 265);opacity:1;transition:opacity .45s ease}#app-splash.splash-hide{opacity:0;pointer-events:none}#app-splash svg{width:112px;height:112px;filter:drop-shadow(0 0 6px rgba(255,240,160,.95)) drop-shadow(0 0 20px rgba(247,207,0,.8)) drop-shadow(0 0 55px rgba(247,207,0,.45)) drop-shadow(0 0 110px rgba(247,207,0,.25));animation:splash-bolt 2.2s ease-in-out infinite}#app-splash .spark{animation:splash-spark 2.2s ease-in-out infinite}@keyframes splash-bolt{0%,100%{opacity:.45;transform:scale(1)}6%{opacity:1;transform:scale(1.05)}10%{opacity:.65}14%{opacity:1}44%{opacity:.5}50%{opacity:1;transform:scale(1.07)}54%{opacity:.7}58%{opacity:1;transform:scale(1)}}@keyframes splash-spark{0%,4%{opacity:0}6%{opacity:1}11%{opacity:0}13%{opacity:.8}17%{opacity:0}46%,48%{opacity:0}50%{opacity:1}56%{opacity:0}}@media (prefers-reduced-motion:reduce){#app-splash svg{animation:none;opacity:1}#app-splash .spark{animation:none;opacity:.5}}`,
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
            <svg viewBox="0 0 100 100" fill="none" role="presentation">
              <defs>
                <linearGradient
                  id="smSplashBolt"
                  x1="92"
                  y1="21"
                  x2="8"
                  y2="79"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FFFBEB" />
                  <stop offset="0.28" stopColor="#FFE566" />
                  <stop offset="0.55" stopColor="#F7CF00" />
                  <stop offset="1" stopColor="#B87E00" />
                </linearGradient>
                <linearGradient
                  id="smSplashShine"
                  x1="87"
                  y1="24"
                  x2="13"
                  y2="76"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Молния тонкая, направлена под 55°: срез справа вверху, остриё слева внизу. */}
              <path
                d="M91.7 20.8 41.5 50.8 42.8 52.6 8.3 79.2 60.2 48 59 46.1Z"
                fill="url(#smSplashBolt)"
                stroke="#8A5C00"
                strokeOpacity="0.45"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
              <path d="M87.4 24.2 48.3 47.5 48.5 46.9 87.6 23.5Z" fill="url(#smSplashShine)" />
              <path
                d="M12.4 76.8 39.3 56.1 38.8 55.9 11.9 76.6Z"
                fill="url(#smSplashShine)"
                opacity="0.5"
              />

              <g className="spark-group">
                <path
                  className="spark"
                  style={{ animationDelay: "0s" }}
                  d="M92 26 87 21.5"
                  stroke="#FFF3B0"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <path
                  className="spark"
                  style={{ animationDelay: "0.15s" }}
                  d="M22 26 27.5 29.5"
                  stroke="#FFE566"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <path
                  className="spark"
                  style={{ animationDelay: "0.3s" }}
                  d="M62 62 68 58"
                  stroke="#FFF3B0"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  className="spark"
                  style={{ animationDelay: "0.45s" }}
                  d="M8 62 13 66"
                  stroke="#FFE566"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  className="spark"
                  style={{ animationDelay: "0.6s" }}
                  d="M26 92 21 87"
                  stroke="#FFE566"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
                <path
                  className="spark"
                  style={{ animationDelay: "0.75s" }}
                  d="M88 72 82.5 68"
                  stroke="#FFF3B0"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.22s" }}
                  cx="90"
                  cy="34"
                  r="0.8"
                  fill="#FFF3B0"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.38s" }}
                  cx="12"
                  cy="30"
                  r="0.8"
                  fill="#FFE566"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.55s" }}
                  cx="78"
                  cy="56"
                  r="0.7"
                  fill="#FFE566"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.68s" }}
                  cx="14"
                  cy="90"
                  r="0.7"
                  fill="#FFF3B0"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.5s" }}
                  cx="30"
                  cy="10"
                  r="0.7"
                  fill="#FFE566"
                />
                <circle
                  className="spark"
                  style={{ animationDelay: "0.28s" }}
                  cx="84"
                  cy="84"
                  r="0.8"
                  fill="#FFF3B0"
                />
              </g>
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
