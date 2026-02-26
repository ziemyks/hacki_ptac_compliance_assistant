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

export function analyzeCompliance(results: { labels: any[], textDetections: any[] }): ProductAnalysis {
    const { labels, textDetections } = results;

    // 1. Extract potential brand/model from text detections
    // We look for capitalized words or lines that aren't common generic terms
    const textLines = textDetections
        .filter((t: any) => t.Type === "LINE" && t.Confidence > 85)
        .map((t: any) => t.DetectedText);

    // Simple brand/model heuristic: prioritize the most prominent text lines
    const topText = textLines.slice(0, 2).join(" ");

    // 2. Extract primary category from labels
    const primaryLabel = labels.find((l: any) => l.Name) || { Name: "Unknown Product" };
    const categoryName = translateLabel(primaryLabel.Name);

    // 3. Construct final product name
    const productName = topText ? `${categoryName} (${topText})` : categoryName;

    // Basic facts based on EU GPSR (General Product Safety Regulation)
    const facts: ComplianceFact[] = [
        {
            id: "gpsr-general-safety",
            title: "Vispārējā produktu drošuma regula (GPSR)",
            description: "Saskaņā ar Regulu (ES) 2023/988 (GPSR) visiem tirgū laistajiem produktiem ir jābūt drošiem. Ražotājiem ir jāveic iekšējā riska analīze.",
            source: "EU 2023/988",
            status: "unknown"
        },
        {
            id: "ce-marking",
            title: "CE marķējums",
            description: "Nepieciešams specifiskām produktu grupām (rotaļlietām, elektronikai, mašīnām), ko pārdod Eiropas Ekonomikas zonā (EEZ).",
            source: "EU No 765/2008",
            status: "warning"
        }
    ];

    // Specific logic based on detected labels
    const labelsText = labels.map((l: any) => l.Name?.toLowerCase()).join(" ");
    const fullContext = (labelsText + " " + textLines.join(" ").toLowerCase());

    if (fullContext.includes("toy") || fullContext.includes("child") || fullContext.includes("lego") || fullContext.includes("doll")) {
        facts.push({
            id: "toy-safety",
            title: "Rotaļlietu drošuma direktīva",
            description: "Prasības attiecībā uz fizikālajām un mehāniskajām īpašībām, uzliesmojamību, ķīmiskajām īpašībām un elektriskajām īpašībām.",
            source: "2009/48/EC",
            status: "warning"
        });
    }

    if (fullContext.includes("electronics") || fullContext.includes("electrical") || fullContext.includes("plug") || fullContext.includes("phone") || fullContext.includes("computer")) {
        facts.push({
            id: "rohs",
            title: "RoHS direktīva",
            description: "Bīstamu vielu ierobežošana elektriskajās un elektroniskajās iekārtās. Jāpārliecinās par RoHS deklarācijas esamību.",
            source: "2011/65/EU",
            status: "unknown"
        });
    }

    // Dynamic scoring logic
    let totalScore = 0;
    if (facts.length > 0) {
        const scores = facts.map(f => {
            if (f.status === "compliant") return 100;
            if (f.status === "unknown") return 75;
            if (f.status === "warning") return 50;
            if (f.status === "non-compliant") return 0;
            return 50;
        });
        totalScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    }

    return {
        productName,
        description: `${categoryName} identificēts ar vizuālo analīzi.${topText ? ` Atrasts teksts: ${topText}` : ''}`,
        facts,
        complianceScore: totalScore
    };
}
