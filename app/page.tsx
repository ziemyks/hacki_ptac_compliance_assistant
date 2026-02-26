"use client";

import { useState } from "react";

interface ComplianceFact {
  id: string;
  title: string;
  description: string;
  source: string;
  status: "compliant" | "warning" | "non-compliant" | "unknown";
}

interface ProductAnalysis {
  productName: string;
  description: string;
  facts: ComplianceFact[];
  complianceScore: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ProductAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Scan failed");
      const data = await response.json();
      setResult(data);
      // Scroll to results
      document.getElementById('scan-results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      alert("Error scanning product.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="bg-[#f8fafc] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Simplified Scan Section */}
        <section className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-[#19365a] mt-4">
              Preces pārbaude ar PTAC atbilstības asistentu
            </h1>
            <p className="text-slate-500 mt-2">
              Augšupielādējiet produkta fotoattēlu, lai automātiski identificētu preci un analizētu tās atbilstību ES regulām.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-[#45a2a2] ${preview ? 'border-[#45a2a2]' : 'border-slate-300'}`}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-lg shadow-md" />
            ) : (
              <div className="py-12 flex flex-col items-center text-slate-400">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border shadow-sm mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-600">Klikšķiniet, lai pievienotu attēlu</p>
                <p className="text-xs mt-1">Saderīgs ar PNG, JPG formātiem</p>
              </div>
            )}
            <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className="ptac-btn-navy w-full mt-8 py-5 text-lg shadow-lg shadow-slate-200"
          >
            {scanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Notiek analīze...
              </>
            ) : "Sākt automātisko pārbaudi"}
          </button>
        </section>

        {/* Results Rendering */}
        {result && (
          <section id="scan-results" className="mt-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-[#d1e5e5] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f7f7] -mr-16 -mt-16 rounded-full" />

              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 relative z-10">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-[#19365a]">{result.productName}</h3>
                  <p className="text-slate-500 mt-2 text-lg leading-relaxed">{result.description}</p>
                </div>
                <div className="bg-[#45a2a2] px-8 py-4 rounded-xl text-white text-center shadow-lg shadow-[#45a2a2]/20">
                  <div className="text-xs uppercase font-bold tracking-widest mb-1 opacity-80">Atbilstība</div>
                  <div className="text-4xl font-black">{result.complianceScore}%</div>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <h4 className="font-bold text-[#19365a] uppercase text-xs tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#45a2a2] rounded-full" />
                  Analīzes Rezultāti
                </h4>
                {result.facts.map((fact) => (
                  <div key={fact.id} className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-5">
                      <div className={`mt-1.5 w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm ${fact.status === 'compliant' ? 'bg-green-500' :
                        fact.status === 'warning' ? 'bg-yellow-500' :
                          fact.status === 'non-compliant' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                      <div>
                        <h5 className="font-bold text-[#19365a] text-lg">{fact.title}</h5>
                        <p className="text-slate-600 mt-2 leading-relaxed">{fact.description}</p>
                        <div className="mt-4 inline-flex px-3 py-1 bg-white text-[#19365a]/60 rounded-md border border-slate-100 text-xs font-mono">
                          Avots: {fact.source}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

