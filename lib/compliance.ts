export interface ComplianceFact {
    id: string;
    title: string;
    description: string;
    source: string;
    status: "compliant" | "warning" | "non-compliant" | "unknown";
}

export interface ProductAnalysis {
    productName: string;
    description: string;
    facts: ComplianceFact[];
    complianceScore: number;
}

const TRANSLATIONS: Record<string, string> = {
    "Toy": "Rotaļlieta",
    "Child": "Bērns",
    "Electronics": "Elektronika",
    "Electrical": "Elektrisks",
    "Plug": "Kontaktdakša",
    "Construction": "Būvniecība",
    "Building": "Ēka",
    "Material": "Materiāls",
    "Smart": "Vieds",
    "Device": "Ierīce",
    "Appliance": "Iekārta",
    "Furniture": "Mēbeles",
    "Clothing": "Apģērbs",
    "Food": "Pārtika",
    "Beverage": "Dzēriens",
    "Vehicle": "Transportlīdzeklis",
    "Tool": "Instruments",
    "Personal Care": "Personīgā higiēna",
    "Cosmetics": "Kosmētika",
    "Kitchen": "Virtuve",
    "Home": "Mājas",
    "Garden": "Dārzs",
    "Outdoor": "Āra",
    "Sport": "Sports",
    "Game": "Spēle",
    "Book": "Grāmata",
    "Jewelry": "Rotaslietas",
    "Watch": "Pulkstenis",
    "Phone": "Tālrunis",
    "Computer": "Dators",
    "Camera": "Kamera",
    "Light": "Gaisma",
    "Battery": "Akumulators",
    "Machine": "Mašīna",
    "Hardware": "Aperatūra",
    "Plumbing": "Santehnika",
    "Decor": "Dekors",
    "Unknown Product": "Nezināma prece"
};

function translateLabel(label: string): string {
    const translation = TRANSLATIONS[label];
    if (translation) {
        return `${translation} (${label})`;
    }
    return label;
}

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "placeholder",
});

export async function analyzeCompliance(results: { labels: any[], textDetections: any[] }): Promise<ProductAnalysis> {
    const { labels, textDetections } = results;

    // Fallback logic if OpenAI key is missing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY" || process.env.OPENAI_API_KEY === "placeholder") {
        return fallbackAnalysis(labels, textDetections);
    }

    const labelsText = labels.map((l: any) => l.Name).join(", ");
    const detectedText = textDetections.map((t: any) => t.DetectedText).join(" ");

    const prompt = `
    Analizē produktu, pamatojoties uz šādiem vizuālajiem datiem no AWS Rekognition:
    Objekti/Etiķetes: ${labelsText}
    Nolasītais teksts uz preces: ${detectedText}

    Tavs uzdevums ir atgriezt JSON objektu ar šādu struktūru:
    {
      "productName": "Precīzs preces nosaukums latviski (oriģinālais nosaukums iekavās)",
      "description": "Plašs un profesionāls preces apraksts latviešu valodā (vismaz 2-3 teikumi), balstoties uz vizuālajām pazīmēm.",
      "facts": [
        {
          "id": "unique-id",
          "title": "Fakta nosaukums (piem. Tehniskie parametri, Materiāls, Produkta mērķis, u.c.)",
          "description": "Detalizēts fakta apraksts latviski",
          "source": "Vizuālā analīze / Nozares standarti",
          "status": "compliant | warning | non-compliant | unknown"
        }
      ],
      "complianceScore": 0-100
    }

    Lūdzu, iekļauj vismaz 6-8 svarīgus faktus par produktu, padarot šo par "Rich Description":
    1. Produkta fiziskās īpašības un vizuālais stāvoklis.
    2. Lietošanas mērķis un mērķauditorija.
    3. Atbilstība ES regulām (GPSR, CE marķējums, RoHS, rotaļlietu drošums, u.c.).
    4. Drošības brīdinājumi vai riski.
    
    Atbildi TIKAI ar JSON.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        return JSON.parse(content) as ProductAnalysis;
    } catch (error) {
        console.error("OpenAI Analysis Error:", error);
        return fallbackAnalysis(labels, textDetections);
    }
}

function fallbackAnalysis(labels: any[], textDetections: any[]): ProductAnalysis {
    const textLines = textDetections
        .filter((t: any) => t.Type === "LINE" && t.Confidence > 85)
        .map((t: any) => t.DetectedText);

    const topText = textLines.slice(0, 2).join(" ");
    const primaryLabel = labels.find((l: any) => l.Name) || { Name: "Unknown Product" };
    const categoryName = translateLabel(primaryLabel.Name);
    const productName = topText ? `${categoryName} (${topText})` : categoryName;

    const facts: ComplianceFact[] = [
        {
            id: "gpsr-general-safety",
            title: "Vispārējā produktu drošuma regula (GPSR)",
            description: "Saskaņā ar Regulu (ES) 2023/988 (GPSR) visiem tirgū laistajiem produktiem ir jābūt drošiem. Sistēma gaida OpenAI API atslēgu padziļinātai analīzei.",
            source: "EU 2023/988",
            status: "unknown"
        }
    ];

    return {
        productName,
        description: `${categoryName} identificēts ar vizuālo analīzi. Atrasts teksts: ${topText || 'Nav atrasts'}. Lūdzu, pievienojiet OPENAI_API_KEY .env failā pilnai analīzei.`,
        facts,
        complianceScore: 50
    };
}
