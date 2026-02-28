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

export async function identifyProduct(imageBuffer: Buffer, mimeType: string): Promise<{
    productName: string,
    description: string,
    predictedType: string,
    predictedAudience: string,
    clarifyingQuestions: { question: string, options: string[] }[]
}> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.length < 10) {
        return {
            productName: "Nezināma prece",
            description: "Nav pieejama vizuālā analīze (trūkst API atslēgas).",
            predictedType: "physical",
            predictedAudience: "b2c",
            clarifyingQuestions: []
        };
    }

    const prompt = `
    UZDEVUMS: Produkta IDENTIFIKĀCIJA pēc attēla un PRECIZĒJOŠU JAUTĀJUMU ģenerēšana.
    
    1. Analizē pievienoto attēlu. Noteikt, KAS tas ir par produktu, kāda ir tā UZBŪVE un funkcionālā kategorija. Ignorē mārketingu.
    2. Klasificē produktu pēc šādām kategorijām (atgriez tikai identifikatoru):
       - predictedType: "physical" (fiziska prece), "digital_content" (digitāls saturs), "digital_service" (digitāls pakalpojums), "combined" (kombinēts produkts).
       - predictedAudience: "b2b" (tikai B2B), "b2c" (B2C patērētājiem), "mixed" (jaukts modelis).
    3. Sastādi 2-3 specifiskus, tehniskus jautājumus latviešu valodā, kas ir būtiski, lai noteiktu precīzu ES/LV regulējumu šim produktam. 
    4. Katram jautājumam piedāvā 2-4 specifiskas atbilžu opcijas (options).

    Atgriez JSON formātā:
    {
      "productName": "Funkcionāls preces nosaukums",
      "description": "Tehnisks un objektīvs preces raksturojums (3-5 teikumi).",
      "predictedType": "physical | digital_content | digital_service | combined",
      "predictedAudience": "b2b | b2c | mixed",
      "clarifyingQuestions": [
        { "question": "Jautājums 1?", "options": ["Opcija A", "Opcija B"] }
      ]
    }
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
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
        return {
            productName: "Kļūda",
            description: error.message,
            predictedType: "physical",
            predictedAudience: "b2c",
            clarifyingQuestions: []
        };
    }
}

export async function analyzeProductCompliance(
    imageBuffer: Buffer,
    mimeType: string,
    context: {
        productName: string,
        productType: string,
        targetAudience: string,
        answers: Record<string, string>
    }
): Promise<ProductAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.length < 10) {
        return fallbackAnalysis(context.productName, "Trūkst API atslēgas");
    }

    const answersText = Object.entries(context.answers || {})
        .map(([q, a]) => `Jautājums: ${q}\nAtbilde: ${a}`)
        .join("\n");

    const prompt = `
    UZDEVUMS: Tehniski-normatīvā analīze no PTAC skatpunkta.
     Produkts: ${context.productName}
     Produkta veids: ${context.productType}
     Mērķauditorija: ${context.targetAudience}
    
    Lietotāja sniegtā papildinformācija:
    ${answersText}
    
    Analizē pievienoto attēlu un ņem vērā norādīto kontekstu un atbildes uz jautājumiem. Izveido detalizētu analīzi par atbilstību tirdzniecības noteikumiem un drošuma prasībām Latvijas un ES tirgū (GPSR, CE, RED, LVD u.c. direktīvas pēc vajadzības).

    STRUKTŪRA (atgriez tikai JSON):
    {
      "productName": ${JSON.stringify(context.productName)},
      "description": "Tehnisks un objektīvs preces raksturojums, ņemot vērā precizēto informāciju.",
      "facts": [
        {
          "id": "unique-id",
          "title": "Tehnisks parametrs / Regulatīvā prasība",
          "description": "Faktos balstīts skaidrojums par materiāliem, drošumu vai atbilstību ES regulām pēc attēla un klienta sniegtajiem datiem.",
          "source": "LV/ES Normatīvie akti",
          "status": "compliant | warning | non-compliant | unknown"
        }
      ],
      "complianceScore": 0-100
    }

    Iekļauj 6-8 svarīgus faktus, īpaši fokusējoties uz:
    - Materiālu sastāvu un funkcionālo drošību.
    - Atbilstību GPSR un specifiskām direktīvām atkarībā no produkta veida un sniegtajām atbildēm.
    - Marķējuma atbilstību mērķauditorijai (${context.targetAudience}).
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
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
        const text = response.text();
        const parsed = JSON.parse(text);

        // Basic validation
        return {
            productName: parsed.productName || context.productName,
            description: parsed.description || "Apraksts nav pieejams",
            facts: Array.isArray(parsed.facts) ? parsed.facts : [],
            complianceScore: typeof parsed.complianceScore === 'number' ? parsed.complianceScore : 50
        } as ProductAnalysis;
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
