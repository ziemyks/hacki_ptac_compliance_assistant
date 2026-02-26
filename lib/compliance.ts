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

export function analyzeCompliance(labels: any[]): ProductAnalysis {
    // Extract primary product name from labels
    const primaryLabel = labels.find(l => l.Name) || { Name: "Unknown Product" };
    const productName = primaryLabel.Name;

    // Basic facts based on EU GPSR (General Product Safety Regulation)
    const facts: ComplianceFact[] = [
        {
            id: "gpsr-general-safety",
            title: "General Product Safety Regulation (GPSR)",
            description: "Under Regulation (EU) 2023/988 (GPSR), all products placed on the market must be safe. Manufacturers must conduct internal risk analysis.",
            source: "EU 2023/988",
            status: "unknown"
        },
        {
            id: "ce-marking",
            title: "CE Marking",
            description: "Required for specific product groups (toys, electronics, machinery) sold within the European Economic Area (EEA).",
            source: "EU No 765/2008",
            status: "warning"
        }
    ];

    // Specific logic based on detected labels
    const labelsText = labels.map(l => l.Name?.toLowerCase()).join(" ");

    if (labelsText.includes("toy") || labelsText.includes("child")) {
        facts.push({
            id: "toy-safety",
            title: "Toy Safety Directive",
            description: "Requirements for physical and mechanical properties, flammability, chemical properties, and electrical properties.",
            source: "2009/48/EC",
            status: "warning"
        });
    }

    if (labelsText.includes("electronics") || labelsText.includes("electrical") || labelsText.includes("plug")) {
        facts.push({
            id: "rohs",
            title: "RoHS Directive",
            description: "Restriction of Hazardous Substances in electrical and electronic equipment.",
            source: "2011/65/EU",
            status: "unknown"
        });
    }

    return {
        productName,
        description: `A ${productName.toLowerCase()} identified by visual analysis.`,
        facts,
        complianceScore: 50 // Placeholder for scoring logic
    };
}
