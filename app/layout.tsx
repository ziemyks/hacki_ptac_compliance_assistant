import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PTAC Biznesam - Mērķauditorijas un Preču Saraksts",
  description: "Latvijas Patērētāju tiesību aizsardzības centra portāls komersantiem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv">
      <body className={inter.className}>
        <div className="min-h-screen">
          <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20 items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-[10px] items-center border p-1 rounded">
                    <span className="font-serif">PTAC</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Patērētāju tiesību</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">aizsardzības centrs</span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#19365a]">
                  <a href="#" className="hover:text-[#45a2a2]">Sākums</a>
                  <a href="#" className="hover:text-[#45a2a2]">Apmācības</a>
                  <a href="#" className="hover:text-[#45a2a2]">Preces</a>
                  <a href="#" className="hover:text-[#45a2a2]">Normatīvie akti</a>
                  <a href="#" className="hover:text-[#45a2a2]">Preču atsaukumi</a>
                  <a href="#" className="hover:text-[#45a2a2]">Palīgrīki</a>
                  <a href="#" className="hover:text-[#45a2a2]">Kontakti</a>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-gray-400">🇬🇧</span>
                  </div>
                  <button className="ptac-btn-teal whitespace-nowrap">
                    Piesakies konsultācijai
                  </button>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
