import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Breadcrumb from "./components/Breadcrumb";
import Link from "next/link";
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
      <body className={notoSansSC.className}>
        <header className="bg-gradient-to-r from-[#4AB1B3] to-[#76E4C4] shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2 tracking-tight">
              Where to Watch Studio Ghibli Movies
            </h1>
            <p className="text-white/90 text-center text-lg">
              Complete streaming guide for all Ghibli films in your region
            </p>
          </div>
        </header>
        
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Breadcrumb />
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600">Home</Link>
              <Link href="/movies" className="text-gray-700 hover:text-primary-600">Movies</Link>
              {/* Add more menu items here if needed */}
            </div>
          </div>
        </nav>

        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Where to Watch Studio Ghibli Movies</p>
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} This website is for reference only and is not affiliated with Studio Ghibli.
              </p>
            </div>
          </div>
        </footer>

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
      </body>
    </html>
  );
}
