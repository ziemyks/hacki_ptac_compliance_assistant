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

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "placeholder");

export async function analyzeCompliance(results: { labels: any[], textDetections: any[] }): Promise<ProductAnalysis> {
    const { labels, textDetections } = results;

    // Fallback logic if Gemini key is missing
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" || process.env.GEMINI_API_KEY === "placeholder") {
        return fallbackAnalysis(labels, textDetections);
    }

    const labelsText = labels.map((l: any) => l.Name).join(", ");
    const detectedText = textDetections.map((t: any) => t.DetectedText).join(" ");

    const prompt = `
    Analizē produktu, pamatojoties uz šādiem vizuālajiem datiem no AWS Rekognition:
    Objekti/Etiķetes: ${labelsText}
    Nolasītais teksts uz preces: ${detectedText}

    Tavs uzdevums ir atgriezt JSON objektu latviešu valodā.
    STRUKTŪRA:
    - productName: Precīzs preces nosaukums latviski (zīmols un modelis iekavās).
    - description: Plašs un profesionāls preces apraksts latviešu valodā (vismaz 2-3 teikumi).
    - facts: Saraksts ar faktiem (id, title, description, source, status).
        * status var būt: compliant, warning, non-compliant, unknown.
    - complianceScore: Atbilstības procents (0-100).

    Lūdzu, iekļauj vismaz 6-8 svarīgus faktus (tehniskie parametri, mērķis, ES regulas GPSR, CE, RoHS, drošība).
    Analīzei jābūt institūcijas līmenī (PTAC stils).
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text) as ProductAnalysis;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
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

    return {
        productName,
        description: `${categoryName} identificēts ar vizuālo analīzi. Pievienojiet GEMINI_API_KEY pilnam aprakstam.`,
        facts: [
            {
                id: "gpsr",
                title: "Vispārējā drošuma regula",
                description: "Sistēma gaida Gemini API atslēgu padziļinātai analīzei.",
                source: "EU 2023/988",
                status: "unknown"
            }
        ],
        complianceScore: 50
    };
}
