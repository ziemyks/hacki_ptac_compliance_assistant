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
    } catch (error) {
      console.error("Scan error:", error);
      alert("Error scanning product. Please check console.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Latvian PTAC Compliance Assistant
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Upload a product photo to identify it and analyze compliance with EU product safety regulations.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
            Upload Product Image
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 ${preview ? 'border-blue-400' : 'border-slate-300'}`}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
            ) : (
              <div className="py-12">
                <p className="text-slate-500 mb-2">Click to select or drag and drop</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            {scanning ? "Analyzing Product..." : "Start Compliance Scan"}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
            Scan Results
          </h2>

          {!result && !scanning && (
            <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-400">
              <p>Upload an image to see analysis</p>
            </div>
          )}

          {scanning && (
            <div className="h-[400px] flex flex-col items-center justify-center animate-pulse bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-600 font-medium">Scanning with AWS Rekognition...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{result.productName}</h3>
                    <p className="text-slate-500 mt-1">{result.description}</p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-semibold">
                    Score: {result.complianceScore}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 uppercase text-xs tracking-widest px-1">Compliance Facts</h4>
                {result.facts.map((fact) => (
                  <div key={fact.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${fact.status === 'compliant' ? 'bg-green-500' :
                          fact.status === 'warning' ? 'bg-yellow-500' :
                            fact.status === 'non-compliant' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                      <div>
                        <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fact.title}</h5>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{fact.description}</p>
                        <div className="mt-3 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono">
                          Source: {fact.source}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
