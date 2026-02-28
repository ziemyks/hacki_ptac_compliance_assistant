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
  const [analyzing, setAnalyzing] = useState(false);
  const [identification, setIdentification] = useState<{
    productName: string,
    description: string,
    predictedType?: string,
    predictedAudience?: string,
    clarifyingQuestions: { question: string, options: string[] }[]
  } | null>(null);
  const [result, setResult] = useState<ProductAnalysis | null>(null);

  // New form state
  const [productType, setProductType] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      // Reset identification and results when a new file is uploaded
      setIdentification(null);
      setResult(null);
      setAnswers({});
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setIdentification(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "identify");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Identification failed");
      const data = await response.json();
      setIdentification(data);

      // Auto-fill metadata if predicted by AI
      if (data.predictedType) setProductType(data.predictedType);
      if (data.predictedAudience) setTargetAudience(data.predictedAudience);
    } catch (error) {
      alert("Error identifying product.");
    } finally {
      setScanning(false);
    }
  };

  const handleCompliance = async () => {
    if (!file || !identification) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "analyze");
    formData.append("context", JSON.stringify({
      productName: identification.productName,
      productType: productTypes.find(t => t.id === productType)?.label || "fiziska prece",
      targetAudience: targetAudiences.find(a => a.id === targetAudience)?.label || "B2C",
      answers: answers
    }));

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Compliance analysis failed");
      const data = await response.json();
      setResult(data);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('scan-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert("Kļūda atbilstības analīzē.");
    } finally {
      setAnalyzing(false);
    }
  };

  const productTypes = [
    { id: 'physical', label: 'fiziska prece' },
    { id: 'digital_content', label: 'digitāls saturs' },
    { id: 'digital_service', label: 'digitāls pakalpojums' },
    { id: 'combined', label: 'kombinēts produkts' }
  ];

  const targetAudiences = [
    { id: 'b2b', label: 'tikai B2B' },
    { id: 'b2c', label: 'B2C (patērētājiem)' },
    { id: 'mixed', label: 'jaukts modelis' }
  ];

  const isFormComplete = productType && targetAudience && identification;

  return (
    <main className="bg-[#f8fafc] min-h-screen py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-[#19365a]">
            Preces pārbaude ar PTAC atbilstības asistentu
          </h1>
          <p className="text-slate-500 mt-2">
            Augšupielādējiet produkta fotoattēlu un norādiet detaļas precīzai analīzei.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image Upload */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
            <h2 className="text-xl font-bold text-[#19365a] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#45a2a2] rounded-full" />
              1. Pievienot attēlu
            </h2>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-[#45a2a2] min-h-[400px] flex flex-col justify-center ${preview ? 'border-[#45a2a2]' : 'border-slate-300'}`}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {preview ? (
                <div className="relative group/preview">
                  <img src={preview} alt="Preview" className="max-h-[350px] mx-auto rounded-lg shadow-md object-contain" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setIdentification(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    title="Dzēst attēlu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-slate-400">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border shadow-sm mb-4">
                    <svg className="w-8 h-8 text-[#45a2a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-600">Klikšķiniet, lai pievienotu attēlu</p>
                  <p className="text-xs mt-1 text-slate-400">Saderīgs ar PNG, JPG formātiem</p>
                </div>
              )}
              <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {!identification ? (
              <button
                onClick={handleScan}
                disabled={!file || scanning}
                className="ptac-btn-navy w-full mt-8 py-5 text-lg shadow-lg shadow-slate-200"
              >
                {scanning ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Identificē produktu...
                  </div>
                ) : "Identificēt produktu"}
              </button>
            ) : (
              <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Produkts identificēts! Aizpildiet detaļas labajā pusē.</span>
              </div>
            )}
          </section>

          {/* Right Column: Details & Form */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h2 className="text-xl font-bold text-[#19365a] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#45a2a2] rounded-full" />
              2. Produkta detaļas
            </h2>

            {identification ? (
              <div className="mb-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-[#19365a] mb-2">{identification.productName}</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base border-l-4 border-[#45a2a2]/20 pl-4 py-1 italic">
                  {identification.description}
                </p>
              </div>
            ) : (
              <div className="mb-10 p-6 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400 text-sm italic">
                {scanning ? "Notiek identificēšana..." : "Vispirms identificējiet produktu, lai šeit redzētu tā aprakstu."}
              </div>
            )}

            <div className={`space-y-8 flex-1 transition-opacity ${!identification ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {/* Product Type Section */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-[#19365a] uppercase tracking-wider mb-4">
                  Produkta veids:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {productTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setProductType(type.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${productType === type.id ? 'bg-[#45a2a2]/5 border-[#45a2a2] text-[#19365a]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${productType === type.id ? 'bg-[#45a2a2] border-[#45a2a2]' : 'bg-white border-slate-300'}`}>
                        {productType === type.id && (
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience Section */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-[#19365a] uppercase tracking-wider mb-4">
                  Vai produkts paredzēts:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {targetAudiences.map((audience) => (
                    <div
                      key={audience.id}
                      onClick={() => setTargetAudience(audience.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${targetAudience === audience.id ? 'bg-[#45a2a2]/5 border-[#45a2a2] text-[#19365a]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${targetAudience === audience.id ? 'bg-[#45a2a2] border-[#45a2a2]' : 'bg-white border-slate-300'}`}>
                        {targetAudience === audience.id && (
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{audience.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clarifying Questions Section */}
              {identification && identification.clarifyingQuestions?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <label className="block text-sm font-bold text-[#19365a] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#45a2a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Papildus precizējumi:
                  </label>
                  <div className="space-y-4">
                    {identification.clarifyingQuestions.map((q, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-3">{q.question}</p>
                        <div className="flex flex-wrap gap-2">
                          {(q.options || ['Jā', 'Nē', 'Nezinu']).map((option) => (
                            <button
                              key={option}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.question]: option }))}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${answers[q.question] === option ? 'bg-[#19365a] border-[#19365a] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCompliance}
                disabled={!isFormComplete || analyzing || (identification?.clarifyingQuestions?.length > 0 && Object.keys(answers).length < identification.clarifyingQuestions.length)}
                className="ptac-btn-teal w-full py-4 text-base font-bold shadow-lg shadow-[#45a2a2]/20 mt-4 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {analyzing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analizē atbilstību...
                  </div>
                ) : "Parādīt atbilstības prasības"}
              </button>
            </div>
          </section>
        </div>

        {/* Results Components (Facts) rendering below the two columns when ready */}
        {result && (
          <section id="scan-results" className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-[#d1e5e5] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f7f7] -mr-16 -mt-16 rounded-full" />

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h4 className="font-bold text-[#19365a] uppercase text-xs tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#45a2a2] rounded-full" />
                  Atbilstības Analīze
                </h4>
                <div className="bg-[#45a2a2] px-6 py-2 rounded-lg text-white font-bold shadow-lg shadow-[#45a2a2]/20">
                  Rezultāts: {result.complianceScore}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {result.facts.map((fact) => (
                  <div key={fact.id} className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm ring-2 ${fact.status === 'compliant' ? 'bg-green-500 ring-green-100' :
                        fact.status === 'warning' ? 'bg-yellow-500 ring-yellow-100' :
                          fact.status === 'non-compliant' ? 'bg-red-500 ring-red-100' : 'bg-slate-300 ring-slate-100'
                        }`} />
                      <div>
                        <h5 className="font-bold text-[#19365a] text-base group-hover:text-[#45a2a2] transition-colors">{fact.title}</h5>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">{fact.description}</p>
                        <div className="mt-4 inline-flex px-2 py-0.5 bg-white text-[#19365a]/50 rounded-md border border-slate-100 text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
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


