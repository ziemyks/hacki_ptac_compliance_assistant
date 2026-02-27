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

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function identifyProduct(imageBuffer: Buffer, mimeType: string): Promise<{ productName: string, description: string }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.length < 10) {
        return {
            productName: "Nezināma prece",
            description: "Nav pieejama vizuālā analīze (trūkst API atslēgas)."
        };
    }

    const prompt = `
    UZDEVUMS: Produkta IDENTIFIKĀCIJA pēc attēla.
    
    Analizē pievienoto attēlu. Noteikt, KAS tas ir par produktu, kāda ir tā UZBŪVE un funkcionālā kategorija. Ignorē mārketingu.
    
    Atgriez JSON formātā:
    {
      "productName": "Funkcionāls preces nosaukums (piem., 'Makšķerēšanas spole')",
      "description": "Tehnisks un objektīvs preces raksturojums par uzbūvi un pielietojumu (3-5 teikumi)."
    }
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error: any) {
        console.error("Gemini Identification Error:", error);
        return { productName: "Kļūda", description: error.message };
    }
}

export async function analyzeProductCompliance(
    imageBuffer: Buffer,
    mimeType: string,
    context: { productName: string, productType: string, targetAudience: string }
): Promise<ProductAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.length < 10) {
        return fallbackAnalysis(context.productName, "Trūkst API atslēgas");
    }

    const prompt = `
    UZDEVUMS: Tehniski-normatīvā analīze no PTAC skatpunkta.
     Produkts: ${context.productName}
     Produkta veids: ${context.productType}
     Mērķauditorija: ${context.targetAudience}
    
    Analizē pievienoto attēlu un ņem vērā norādīto kontekstu. Izveido detalizētu analīzi par atbilstību tirdzniecības noteikumiem un drošuma prasībām Latvijas un ES tirgū.

    STRUKTŪRA (atgriez tikai JSON):
    {
      "productName": "${context.productName}",
      "description": "Tehnisks un objektīvs preces raksturojums.",
      "facts": [
        {
          "id": "unique-id",
          "title": "Tehnisks parametrs / Regulatīvā prasība",
          "description": "Faktos balstīts skaidrojums par materiāliem, drošumu vai atbilstību ES regulām (GPSR, CE u.c.) pēc attēla un klienta sniegtajiem datiem.",
          "source": "LV/ES Normatīvie akti",
          "status": "compliant | warning | non-compliant | unknown"
        }
      ],
      "complianceScore": 0-100
    }

    Iekļauj 6-8 svarīgus faktus, īpaši fokusējoties uz:
    - Materiālu sastāvu un funkcionālo drošību.
    - Atbilstību GPSR un specifiskām direktīvām atkarībā no produkta veida (${context.productType}).
    - Marķējuma atbilstību mērķauditorijai (${context.targetAudience}).
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return JSON.parse(response.text()) as ProductAnalysis;
    } catch (error: any) {
        console.error("Gemini Compliance Error:", error);
        return fallbackAnalysis(context.productName, error.message);
    }
}

function fallbackAnalysis(categoryName: string, errorMsg?: string): ProductAnalysis {
    return {
        productName: categoryName,
        description: `${categoryName} identificēts pēc vizuālajām pazīmēm. Lai iegūtu detalizētu aprakstu un padziļinātu analīzi, nepieciešams aktīvs Gemini API savienojums.`,
        facts: [
            {
                id: "general-info",
                title: "Produkta identifikācija",
                description: `Sistēma identificēja produktu kā "${categoryName}". Kļūda: ${errorMsg || 'nav'}.`,
                source: "Vizuālā analīze",
                status: "unknown"
            },
            {
                id: "gpsr",
                title: "Vispārējais drošums",
                description: "Saskaņā ar Regulu (ES) 2023/988 (GPSR), produktam jāatbilst vispārējām drošuma prasībām. Gemini analīze pašlaik nav pieejama.",
                source: "ES 2023/988",
                status: "unknown"
            }
        ],
        complianceScore: 50
    };
}

console.log("Compliance Module Loaded - Version 2.0.3");
