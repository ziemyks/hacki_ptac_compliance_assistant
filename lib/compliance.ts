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
    return TRANSLATIONS[label] || label;
}

export function analyzeCompliance(labels: any[]): ProductAnalysis {
    // Extract primary product name from labels
    const primaryLabel = labels.find(l => l.Name) || { Name: "Unknown Product" };
    const productName = translateLabel(primaryLabel.Name);

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
    const labelsText = labels.map(l => l.Name?.toLowerCase()).join(" ");

    if (labelsText.includes("toy") || labelsText.includes("child")) {
        facts.push({
            id: "toy-safety",
            title: "Rotaļlietu drošuma direktīva",
            description: "Prasības attiecībā uz fizikālajām un mehāniskajām īpašībām, uzliesmojamību, ķīmiskajām īpašībām un elektriskajām īpašībām.",
            source: "2009/48/EC",
            status: "warning"
        });
    }

    if (labelsText.includes("electronics") || labelsText.includes("electrical") || labelsText.includes("plug")) {
        facts.push({
            id: "rohs",
            title: "RoHS direktīva",
            description: "Bīstamu vielu ierobežošana elektriskajās un elektroniskajās iekārtās.",
            source: "2011/65/EU",
            status: "unknown"
        });
    }

    return {
        productName,
        description: `${productName} identificēts ar vizuālo analīzi.`,
        facts,
        complianceScore: 50 // Placeholder for scoring logic
    };
}
