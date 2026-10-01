import type { Metadata } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal — Product Trend Intelligence",
  description: "Search a product keyword and read its Google Trends demand signal.",
};

// Applies the persisted theme/mode to <html> before first paint, so there's
// no flash of the wrong theme. Falls back to ops/dark (the @theme defaults)
// if nothing is stored yet or localStorage is unavailable.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("signal:theme"),m=localStorage.getItem("signal:mode");if(t!=="executive"&&t!=="ops"&&t!=="stealth")t="ops";if(m!=="light"&&m!=="dark")m="dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-mode",m);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
