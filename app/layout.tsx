import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boka Behandling | FSA Workouts HQ",
  description:
    "Boka din behandling online hos FSA Workouts HQ. Kryoterapi, massage, Insculpt och mer.",
  keywords: [
    "FSA Workouts",
    "kryoterapi",
    "massage",
    "insculpt",
    "recovery",
    "träning",
    "boka",
  ],
  openGraph: {
    title: "Boka Behandling | FSA Workouts HQ",
    description:
      "Boka din behandling online hos FSA Workouts HQ.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={inter.variable}>
      <body className="font-sans bg-fsa-black min-h-screen text-fsa-text antialiased">
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}

        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-fsa-black via-fsa-dark to-fsa-black pointer-events-none" />

        {/* Main content */}
        <div className="relative z-10">{children}</div>

        {/* Post body height to parent so iframe embed can auto-resize.
            Squarespace snippet listens for {type:'fsa-booking-height', height}. */}
        <Script id="iframe-autoresize" strategy="afterInteractive">
          {`
            (function() {
              if (window.parent === window) return;
              var last = 0;
              function send() {
                var h = Math.max(
                  document.body.scrollHeight,
                  document.body.offsetHeight,
                  document.documentElement.scrollHeight,
                  document.documentElement.offsetHeight
                );
                if (h === last) return;
                last = h;
                var msg = { type: 'fsa-booking-height', height: h };
                try { window.parent.postMessage(msg, '*'); } catch (_) {}
                try { window.top.postMessage(msg, '*'); } catch (_) {}
                console.log('[fsa-booking] posted height', h);
              }
              send();
              new ResizeObserver(send).observe(document.body);
              window.addEventListener('load', send);
              // Keep polling every 500ms — cheap, catches lazy image loads etc.
              setInterval(send, 500);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
