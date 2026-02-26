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
    <main className="bg-white">
      {/* Hero Section */}
      <section className="hero-gradient py-24 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#19365a] mb-6 leading-tight max-w-3xl mx-auto">
            Informācija strukturētā, viegli uztveramā veidā, lai tirgus piedāvājums būtu drošs, atbilstošs un godīgs
          </h1>
          <p className="text-lg text-[#19365a]/80 mb-10">Administratīvā sloga atvieglojums visām iesaistītajām pusēm</p>

          <div className="max-w-3xl mx-auto bg-[#19365a] p-10 rounded-lg shadow-xl">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Meklēšana pēc atslēgas vārda, piemēram, rotaļlietas"
                className="flex-1 px-6 py-4 rounded-md text-gray-800 outline-none"
              />
              <button className="ptac-btn-teal px-10">Meklēt</button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#19365a] mb-4">Komersantu pienākumi</h2>
            <p className="text-gray-500">Normatīvo aktu prasības nosaka pienākumus komersantiem atkarībā no to statusa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AudienceCard
              title="Ražotājs"
              desc="Ražotājs ir galvenā persona, kurai ir pienākums laist apgrozībā tikai drošas preces."
            />
            <AudienceCard
              title="Importētājs"
              desc="Importētājs ir jebkura fiziska vai juridiska persona, kas veic uzņēmējdarbību Kopienā un kas laiž preci Kopienas tirgū no trešās valsts."
            />
            <AudienceCard
              title="Izplatītājs"
              desc="Izplatītājs ir jebkura fiziska vai juridiska persona, kas veic uzņēmējdarbību Kopienā un kas dara preci pieejamu Kopienas tirgū."
            />
            <AudienceCard
              title="Pilnvarotais pārstāvis"
              desc="Pilnvarotais pārstāvis ir jebkura fiziska vai juridiska persona, kas veic uzņēmējdarbību Kopienā un ir saņēmusi rakstisku ražotāja pilnvaru rīkoties tā vārdā attiecībā uz konkrētiem uzdevumiem."
            />
          </div>
        </div>
      </section>

      {/* Scan Section (AI Tool Implementation) */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="mb-4">
                <span className="bg-[#e2e8f0] px-4 py-1.5 rounded-md text-sm font-medium text-[#19365a]">AI AIZSARDZĪBAS RĪKS</span>
              </div>
              <h2 className="text-4xl font-bold text-[#19365a] mb-6 leading-tight">Līderis efektīvā tirgus uzraudzībā</h2>
              <ul className="space-y-6 text-[#1c2e45]">
                <li className="flex gap-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-2.5 shrink-0" />
                  <p><strong>Profesionalitāte un efektivitāte</strong> – strādājam atbildīgi un profesionāli sabiedrības labā, izmantojot un uzkrājot datus un zināšanas.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-2.5 shrink-0" />
                  <p><strong>Godprātība</strong> – augstu vērtējam taisnīgumu, likuma garu un ētikas principu ievērošanu.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-2.5 shrink-0" />
                  <p><strong>Sadarbība</strong> – augstu vērtējam koleģiālas attiecības, esam atvērti un atbalstoši sadarbībai vienotu mērķu sasniegšanā.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-2.5 shrink-0" />
                  <p><strong>Orientācija uz klientu</strong> – klientu vajadzību izzināšana un izpratne, sadarbība vienotu sabiedrības mērķu sasniegšanā, caurspīdīgums un atklātība.</p>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center gap-2 mt-8 text-[#45a2a2] font-semibold hover:underline">
                Uzzini vairāk par mums
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
                <h3 className="text-2xl font-bold text-[#19365a] mb-6">Pārbaudīt Preces Atbilstību</h3>

                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-[#45a2a2] ${preview ? 'border-[#45a2a2]' : 'border-slate-300'}`}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-lg shadow-md" />
                  ) : (
                    <div className="py-12 flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#f0f7f7] rounded-full flex items-center justify-center text-[#45a2a2] mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                      </div>
                      <p className="text-slate-600 font-medium">Uzklikšķiniet, lai augšupielādētu fotoattēlu</p>
                      <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Amazon Rekognition analīze</p>
                    </div>
                  )}
                  <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <button
                  onClick={handleScan}
                  disabled={!file || scanning}
                  className="ptac-btn-navy w-full mt-6 py-5 text-lg"
                >
                  {scanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analizē preci...
                    </>
                  ) : "Sākt atbilstības skenēšanu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Rendering */}
      {result && (
        <section id="scan-results" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#f0f7f7] p-10 rounded-2xl border border-[#d1e5e5]">
              <div className="flex justify-between items-start mb-8 border-b border-[#d1e5e5] pb-6">
                <div>
                  <h3 className="text-3xl font-bold text-[#19365a]">{result.productName}</h3>
                  <p className="text-[#1c2e45]/70 mt-2 text-lg">{result.description}</p>
                </div>
                <div className="bg-[#45a2a2] px-6 py-2 rounded-full text-white font-bold text-xl">
                  {result.complianceScore}%
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-[#19365a] uppercase text-sm tracking-widest">Atbilstības fakti un analīze</h4>
                {result.facts.map((fact) => (
                  <div key={fact.id} className="bg-white p-6 rounded-lg border border-[#d1e5e5] shadow-sm">
                    <div className="flex items-start gap-5">
                      <div className={`mt-1.5 w-4 h-4 rounded-full flex-shrink-0 ${fact.status === 'compliant' ? 'bg-green-500' :
                          fact.status === 'warning' ? 'bg-yellow-500' :
                            fact.status === 'non-compliant' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                      <div>
                        <h5 className="font-bold text-[#19365a] text-lg">{fact.title}</h5>
                        <p className="text-[#1c2e45] mt-2 leading-relaxed">{fact.description}</p>
                        <div className="mt-4 inline-block px-3 py-1 bg-[#f1f5f9] text-[#19365a]/60 rounded text-xs font-mono">
                          Avots: {fact.source}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategoryCard title="Rotaļlietas" img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800" />
            <CategoryCard title="Būvizstrādājumi" img="https://images.unsplash.com/photo-1504307651254-35680f3366d4?auto=format&fit=crop&q=80&w=800" />
            <CategoryCard title="Viedās preces" img="https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&q=80&w=800" />
            <CategoryCard title="Energomarķējums" img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800" />
            <CategoryCard title="Ekodizains" img="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" />
            <CategoryCard title="Piekļūstamība" img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" />
          </div>
        </div>
      </section>
    </main>
  );
}

function AudienceCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="ptac-card group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-3xl font-bold text-[#19365a] tracking-tight">{title}</h3>
        <span className="text-[#45a2a2] text-2xl font-light">+</span>
      </div>
      <p className="text-[#19365a]/70 text-lg leading-relaxed mb-10 pr-8">{desc}</p>
      <div className="absolute bottom-8 left-8">
        <svg className="w-8 h-8 text-[#45a2a2] transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </div>
    </div>
  );
}

function CategoryCard({ title, img }: { title: string, img: string }) {
  return (
    <div className="category-card group cursor-pointer border border-[#d1e5e5]">
      <img src={img} alt={title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="category-card-overlay">
        <span className="font-bold text-[#19365a] text-lg">{title}</span>
        <span className="text-[#45a2a2] text-xl">+</span>
      </div>
    </div>
  );
}
