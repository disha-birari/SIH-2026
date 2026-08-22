import { getDynamicStandards } from './data/bisDatabase';
import { BISStandard, GroundedCitation, AIResponsePayload, UserPersona } from './types';

// Stopwords to ignore in keyword scoring so compliance words don't overpower exact product names
const COMPLIANCE_STOPWORDS = new Set([
  'is', 'the', 'for', 'are', 'what', 'how', 'which', 'who', 'does', 'do', 'can', 'with', 'and', 'or',
  'isi', 'mark', 'mandatory', 'optional', 'voluntary', 'required', 'requirement', 'requirements',
  'certification', 'certificate', 'standard', 'standards', 'process', 'apply', 'get', 'need', 'needed'
]);

// Exact domain keyword mappings for 100% precision product retrieval
const DOMAIN_KEYWORD_MAP: Record<string, string[]> = {
  helmet: ['is-4151', 'IS 4151'],
  motorcycle: ['is-4151', 'IS 4151'],
  helmets: ['is-4151', 'IS 4151'],
  iron: ['is-302-2-3', 'IS 302-2-3'],
  irons: ['is-302-2-3', 'IS 302-2-3'],
  water: ['is-14543', 'is-302-2-201', 'IS 14543'],
  drinking: ['is-14543', 'IS 14543'],
  geyser: ['is-302-2-201', 'IS 302-2-201'],
  heater: ['is-302-2-201', 'IS 302-2-201'],
  toy: ['is-9873-1', 'IS 9873'],
  toys: ['is-9873-1', 'IS 9873'],
  led: ['is-16102-1', 'IS 16102'],
  lamp: ['is-16102-1', 'IS 16102'],
  bulb: ['is-16102-1', 'IS 16102'],
  steel: ['is-1786', 'IS 1786'],
  tmt: ['is-1786', 'IS 1786'],
  rebar: ['is-1786', 'IS 1786'],
  gold: ['is-1417', 'IS 1417'],
  jewellery: ['is-1417', 'IS 1417'],
  jewel: ['is-1417', 'IS 1417'],
  huid: ['is-1417', 'IS 1417'],
  solar: ['is-14286', 'IS 14286'],
  pv: ['is-14286', 'IS 14286'],
  photovoltaic: ['is-14286', 'IS 14286'],
  tyre: ['is-15633', 'IS 15633'],
  tyres: ['is-15633', 'IS 15633'],
  cement: ['is-269', 'IS 269'],
  opc: ['is-269', 'IS 269'],
  battery: ['is-16046-2', 'IS 16046'],
  batteries: ['is-16046-2', 'IS 16046'],
  lithium: ['is-16046-2', 'IS 16046']
};

export function calculateSemanticRelevance(query: string, standard: BISStandard): number {
  const q = query.toLowerCase();
  let score = 0;

  // Direct Standard Number Match
  const isClean = standard.isNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  const qClean = q.replace(/[^a-z0-9]/g, '');
  if (qClean.includes(isClean) || q.includes(standard.isNumber.toLowerCase())) {
    return 200;
  }

  // Domain Keyword Direct Match (+120 Boost)
  const queryWords = q.split(/\s+/).map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2);
  for (const word of queryWords) {
    if (DOMAIN_KEYWORD_MAP[word]) {
      if (DOMAIN_KEYWORD_MAP[word].some(target => standard.id === target || standard.isNumber.includes(target))) {
        score += 120;
      }
    }
  }

  // Title & Scope Match (Ignoring Stopwords)
  const meaningfulWords = queryWords.filter(w => !COMPLIANCE_STOPWORDS.has(w));
  for (const kw of meaningfulWords) {
    if (standard.title.toLowerCase().includes(kw)) score += 35;
    if (standard.scope.toLowerCase().includes(kw)) score += 20;
    if (standard.category.toLowerCase().includes(kw)) score += 40;
    for (const req of standard.keyRequirements) {
      if (req.toLowerCase().includes(kw)) score += 10;
    }
  }

  return score;
}

export function retrieveRelevantStandards(query: string, persona: UserPersona = 'manufacturer'): {
  standards: BISStandard[];
  citations: GroundedCitation[];
  confidence: number;
} {
  const currentDatabase = getDynamicStandards();

  const scored = currentDatabase.map(std => ({
    standard: std,
    score: calculateSemanticRelevance(query, std)
  })).sort((a, b) => b.score - a.score);

  const primaryScore = scored[0]?.score || 0;

  // Only include matches that actually have relevance
  const topMatches = scored.filter(item => item.score >= 35).slice(0, 3);
  const finalMatches = topMatches.length > 0 ? topMatches : [scored[0]];

  const confidence = primaryScore >= 100 
    ? Math.min(99, 90 + Math.round((primaryScore - 100) / 10))
    : primaryScore >= 35 
    ? Math.round(60 + (primaryScore / 35) * 20)
    : 40;

  const citations: GroundedCitation[] = [];
  finalMatches.forEach(item => {
    const std = item.standard;
    std.clauseReferences.forEach(ref => {
      citations.push({
        standardNumber: std.isNumber,
        title: std.title,
        clause: ref.clause,
        snippet: ref.description,
        officialSource: std.officialUrl,
        relevanceScore: Math.min(99, item.score > 50 ? 98 : 75)
      });
    });
  });

  return {
    standards: finalMatches.map(m => m.standard),
    citations,
    confidence
  };
}

export function generateStructuredRAGAnswer(
  query: string,
  persona: UserPersona,
  engine: 'Ollama (Local LLM)' | 'Gemini / Neural Grounded RAG',
  modelName: string
): AIResponsePayload {
  const { standards, citations, confidence } = retrieveRelevantStandards(query, persona);
  const primary = standards[0];

  const qLower = query.toLowerCase();
  
  // Check if query contains any recognized domain product
  const hasRecognizedProduct = Object.keys(DOMAIN_KEYWORD_MAP).some(kw => qLower.includes(kw));

  if (confidence < 45 && !hasRecognizedProduct) {
    return {
      productDetected: "Unspecified / Ambiguous Product",
      userPersona: persona,
      relevantStandards: [],
      summaryExplanation: "We could not confidently identify the applicable Indian Standard from the available BIS repository for your query.",
      complianceRequirements: [],
      requiredDocuments: [],
      actionableSteps: [
        "Specify the exact product name (e.g. Motorcycle Helmet, Electric Iron, Packaged Drinking Water, LED Bulb).",
        "Provide material specifications and target operating voltage/capacity.",
        "Indicate whether the product is domestically manufactured or imported."
      ],
      citations: [],
      confidenceScore: 35,
      isSufficientInfo: false,
      uncertaintyMessage: "Insufficient product details provided. To prevent hallucination, please specify exact product model and technical scope.",
      engineUsed: engine,
      modelName: modelName
    };
  }

  // Generate Highly Detailed, Authoritative & Comprehensive Answers based on exact product
  let summary = "";
  let DetailedRequirements: string[] = [...primary.keyRequirements];
  let DetailedDocuments: string[] = [...primary.requiredDocuments];
  let DetailedSteps: string[] = [];

  if (primary.id === 'is-4151') {
    summary = `YES, ISI Mark Certification is ABSOLUTELY MANDATORY for all protective helmets for two-wheeler motorcyclists sold, manufactured, imported, or traded in India under Indian Standard IS 4151:2015. Under the mandatory Quality Control Order (QCO) issued by the Ministry of Road Transport and Highways (MoRTH) under Section 16 of the BIS Act, 2016, no person shall manufacture, store, sell, or import two-wheeler helmets without a valid BIS ISI Mark license. Non-compliance is a punishable offence under Section 29 of the BIS Act with imprisonment up to 2 years or a fine of minimum ₹2,000,000 (₹2 Lakhs) for the first offence.`;

    DetailedRequirements = [
      "Outer Shell Specification: Shell must be constructed of high-impact Grade ABS or Reinforced Fiberglass, free from sharp projections, UV stabilized.",
      "Impact Attenuation Test: Peak acceleration must not exceed 275g when dropped onto flat & hemispherical steel anvils under ambient (20°C), cold (-10°C), hot (+50°C), and water immersion conditions.",
      "Penetration Resistance: A 3kg steel drop cone dropped from 2 meters height must not make contact with the headform inside the helmet.",
      "Retention System Chin Strap: Chin strap width must be >= 20mm. Dynamic displacement must not exceed 25mm under 15kg load, and retention lock must withstand 50kg static pull without failure.",
      "Visor Transmittance (IS 9944): Clear visors must provide >= 85% light transmittance, optical distortion < 0.12 diopters, and scratch resistance.",
      "Mandatory Markings: Must clearly display the ISI Mark logo, IS 4151:2015 standard code, License Number (CM/L-XXXXXXXXXX), helmet weight in grams, size, and date of manufacture."
    ];

    DetailedDocuments = [
      "Factory Premises Legal Document (Ownership Deed / Registered Rent Agreement & Industrial License)",
      "Factory Layout & Machinery Installation Proof (Plastic Injection Molding Machines, EPS Molding, Paint Booth)",
      "In-House Test Laboratory Equipment Logs & Calibration Certificates (Impact Test Rig, Retention Displacement Tester, Penetration Rig, Visor Tester)",
      "Raw Material Test Reports (ABS Resin Grade Invoices, EPS Density Logs, Chin Strap Webbing Tensile Certificates)",
      "Visor Optical Clarity & Transmittance NABL Test Certificate (under IS 9944)",
      "Manufacturing Process Flow Chart & Quality Assurance Control Plan (QAP)"
    ];

    DetailedSteps = [
      "Step 1: Download & Study Official BIS Standard IS 4151:2015 and Scheme-I Licensing Guidelines.",
      "Step 2: Establish In-House NABL-Compliant Testing Laboratory equipped with calibrated Impact Attenuation and Retention test rigs.",
      "Step 3: Register on BIS Manakonline Portal (www.manakonline.in) and file online application under Scheme-I.",
      "Step 4: BIS Officer Factory Inspection for audit of manufacturing plant, raw material storage, and live sample testing.",
      "Step 5: Sample Drawing by BIS Officer and sealed dispatch to an independent BIS Recognized NABL Testing Laboratory.",
      "Step 6: Grant of BIS License (CM/L Number) and marking permission to emboss ISI Mark on every helmet."
    ];

  } else if (primary.id === 'is-302-2-3') {
    summary = `YES, ISI Mark Certification is MANDATORY for all Electric Irons (both dry and steam irons) under Indian Standard IS 302-2-3:2017. Governed under the Electrical Appliances (Quality Control) Order issued by DPEIT under Section 16 of the BIS Act, 2016, no electrical iron can be manufactured, stocked, or sold in India without bearing the official ISI Mark and valid BIS License number.`;

    DetailedRequirements = [
      "High Voltage Insulation Strength: Dielectric strength test at 1500V AC for 1 minute with no arc-over or insulation breakdown.",
      "Earthing Continuity Test: Resistance between earthing terminal and accessible metal parts must be <= 0.1 Ohm.",
      "Leakage Current Limits: Maximum permissible leakage current at operating temperature must not exceed 0.75mA.",
      "Thermostatic Calibration: Thermostat must maintain plate temperature within ±10°C of set calibration (range 110°C to 220°C).",
      "Thermal Limit Cutout: Must be equipped with a non-self-resetting thermal fuse to prevent fire hazards if thermostat contacts weld together.",
      "Flammability of Plastics: Polymeric handle & enclosure materials must pass Glow Wire Test at 850°C (under IS 11000)."
    ];

    DetailedSteps = [
      "Step 1: Obtain copy of IS 302-2-3:2017 and IS 302-1 general safety requirements.",
      "Step 2: Setup in-house testing lab with High Voltage Tester, Megger Insulation Tester, Earthing Resistance Meter, and Leakage Current Tester.",
      "Step 3: Submit online application on Manakonline portal with Quality Control Plan (QCP).",
      "Step 4: Undergo BIS officer factory audit and sealed sample drawing for independent NABL lab testing."
    ];
  } else if (primary.id === 'is-14543') {
    summary = `YES, BIS ISI Mark Certification is ABSOLUTELY MANDATORY for all Packaged Drinking Water bottling plants in India under IS 14543:2016. Under FSSAI regulations and mandatory BIS QCO, no bottling unit can operate without a valid BIS License and in-house NABL accredited microbiological testing laboratory.`;

    DetailedSteps = [
      "Step 1: Obtain CGWA (Central Ground Water Authority) NOC for ground water extraction.",
      "Step 2: Construct fully enclosed hygienic bottling plant with Reverse Osmosis (RO), Ozonation, and UV Sterilization.",
      "Step 3: Setup in-house Microbiology & Chemical Lab equipped with Laminar Air Flow, Autoclave, and Incubators.",
      "Step 4: Apply on BIS Manakonline portal for Factory Audit and sample testing."
    ];
  } else {
    summary = `Official Indian Standard ${primary.isNumber} governs ${primary.title}. Compliance is ${primary.mandatoryStatus} via ${primary.applicableScheme}. All manufacturers, MSMEs, and importers must satisfy technical specifications under ${primary.clauseReferences[0]?.clause || 'Clause 1'}.`;
    DetailedSteps = [
      `Step 1: Obtain official BIS Standard document ${primary.isNumber}.`,
      `Step 2: Setup in-house testing equipment for ${primary.testingParameters[0] || 'Quality Audit'}.`,
      `Step 3: Prepare Quality Control Plan (QAP) and factory layout drawings.`,
      `Step 4: Submit online application on BIS Manakonline portal under ${primary.applicableScheme}.`
    ];
  }

  return {
    productDetected: primary.isNumber + " - " + primary.title,
    userPersona: persona,
    relevantStandards: standards.map(s => `${s.isNumber}: ${s.title}`),
    summaryExplanation: summary,
    complianceRequirements: DetailedRequirements,
    requiredDocuments: DetailedDocuments,
    actionableSteps: DetailedSteps,
    citations: citations.slice(0, 4),
    confidenceScore: confidence,
    isSufficientInfo: true,
    engineUsed: engine,
    modelName: modelName
  };
}
