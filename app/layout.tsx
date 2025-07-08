import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Breadcrumb from "./components/Breadcrumb";
import { MobileNavBar, DesktopNavBar } from "./components/MobileNavigation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AccessibilityTools } from "./components/AccessibilityTools";
import { ThemeProvider } from "./components/ThemeProvider";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { PerformanceOptimizer } from "./components/performance/PerformanceOptimizer";
import { PageSpeedOptimizer } from "./components/performance/PageSpeedOptimizer";
import { UserExperienceEnhancer } from "./components/UserExperienceEnhancer";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { WebVitalsTracker } from "./components/performance/WebVitalsTracker";
import { SearchConsoleVerification, WebsiteStructuredData } from "./components/seo/SearchConsoleVerification";
import Script from 'next/script';

const notoSansSC = Noto_Sans_SC({ 
  subsets: ["latin"],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: "Where to Watch Studio Ghibli Movies",
  description: "Find where to stream Studio Ghibli films worldwide. Updated guide for Netflix, Max, and other platforms. Covers Spirited Away, Totoro, and the complete Ghibli collection.",
  openGraph: {
    title: "Where to Watch Studio Ghibli Movies",
    description: "Find the perfect platform to watch your favorite Studio Ghibli films. Complete streaming guide with regional availability, pricing, and free options worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBFXHW4K');`
        }} />
        
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6958408841088360"
             crossOrigin="anonymous"></script>
        <SearchConsoleVerification verificationCode={process.env.GOOGLE_SITE_VERIFICATION} />
        <WebsiteStructuredData />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ghibli Guide" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icon-192x192.png" />
      </head>
      <body className={notoSansSC.className}>
        <ThemeProvider defaultTheme="system" storageKey="ghibli-theme">
          <PageSpeedOptimizer>
            <PerformanceOptimizer>
              <UserExperienceEnhancer>
                {/* 跳转到主内容链接 */}
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>

        <header className="bg-gradient-to-r from-[#4AB1B3] to-[#76E4C4] dark:from-slate-800 dark:to-slate-700 shadow-lg">
          <div className="container mx-auto px-4 py-6 relative">
            {/* 主题切换按钮 */}
            <div className="absolute top-4 right-4">
              <DarkModeToggle variant="dropdown" size="md" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2 tracking-tight">
              Where to Watch Studio Ghibli Movies
            </h1>
            <p className="text-white/90 text-center text-lg">
              Complete streaming guide for all Ghibli films in your region
            </p>
          </div>
        </header>
        
        <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-3">
            {/* 移动端导航 */}
            <MobileNavBar>
              <Breadcrumb />
            </MobileNavBar>

            {/* 桌面端导航 */}
            <DesktopNavBar>
              <Breadcrumb />
            </DesktopNavBar>
          </div>
        </nav>

        <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>

        <footer className="bg-gray-900 dark:bg-slate-950 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Where to Watch Studio Ghibli Movies</p>
              <p className="text-gray-400 dark:text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} This website is for reference only and is not affiliated with Studio Ghibli.
              </p>
            </div>
          </div>
        </footer>

        {/* 用户体验工具 */}
        <AccessibilityTools />
        <FeedbackWidget />
        <PerformanceMonitor enableConsoleLogging={process.env.NODE_ENV === 'development'} />

        {/* Analytics and Performance Monitoring */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <WebVitalsTracker />

        {/* Microsoft Clarity Script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "r2udk1p02u");
          `}
        </Script>
              </UserExperienceEnhancer>
            </PerformanceOptimizer>
          </PageSpeedOptimizer>
        </ThemeProvider>
      </body>
    </html>
  );
}
