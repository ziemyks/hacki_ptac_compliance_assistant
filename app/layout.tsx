import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PTAC Compliance Assistant",
  description: "AI-powered product compliance analysis for businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#f8fafc]">
          <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">P</div>
                <span className="font-bold text-slate-900">PTAC Compliance Portal</span>
              </div>
              <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-blue-600 transition-colors">Guidelines</a>
                <a href="#" className="hover:text-blue-600 transition-colors">History</a>
                <a href="#" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all">Support</a>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
