export type UserPersona = 'manufacturer' | 'msme' | 'consumer' | 'importer';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'bn';

export interface BISStandard {
  id: string;
  isNumber: string; // e.g., "IS 302-2-3:2017"
  title: string;
  category: string; // e.g., "Electrical Safety", "Toys", "Cement", "Electronics"
  scope: string;
  mandatoryStatus: 'Mandatory (QCO)' | 'Voluntary' | 'CRS Mandatory';
  applicableScheme: 'Scheme-I (ISI Mark)' | 'CRS (Compulsory Registration)' | 'FMCS' | 'Hallmarking';
  targetAudience: string[];
  keyRequirements: string[];
  requiredDocuments: string[];
  testingParameters: string[];
  officialUrl: string;
  lastUpdated: string;
  clauseReferences: {
    clause: string;
    description: string;
  }[];
}

export interface GroundedCitation {
  standardNumber: string;
  title: string;
  clause: string;
  snippet: string;
  officialSource: string;
  relevanceScore: number;
}

export interface AIResponsePayload {
  productDetected: string;
  userPersona: UserPersona;
  relevantStandards: string[];
  summaryExplanation: string;
  complianceRequirements: string[];
  requiredDocuments: string[];
  actionableSteps: string[];
  citations: GroundedCitation[];
  confidenceScore: number; // 0 to 100
  isSufficientInfo: boolean;
  uncertaintyMessage?: string;
  engineUsed: 'Ollama (Local LLM)' | 'Gemini / Neural Grounded RAG';
  modelName: string;
}

export interface ComplianceCheckItem {
  id: string;
  standardId: string;
  title: string;
  category: string;
  mandatory: boolean;
  status: 'passed' | 'pending' | 'failed' | 'not_applicable';
  notes: string;
}

export interface SIHEvalMetrics {
  totalBenchmarkQuestions: number;
  retrievalAccuracy: number; // %
  answerAccuracy: number; // %
  citationAccuracy: number; // %
  hallucinationRate: number; // %
  averageLatencyMs: number;
  groundednessScore: number; // %
}

export interface GapItem {
  clause: string;
  requirement: string;
  userDocEvidence?: string;
  status: 'met' | 'missing' | 'partial';
  riskSeverity: 'High' | 'Medium' | 'Low';
  remediation: string;
}

export interface GapAnalysisResult {
  productName: string;
  standardId: string;
  isNumber: string;
  overallComplianceScore: number; // 0 to 100
  totalRequirements: number;
  metCount: number;
  missingCount: number;
  partialCount: number;
  gaps: GapItem[];
}

export interface ClauseDiff {
  clauseNumber: string;
  title: string;
  oldText: string;
  newText: string;
  changeType: 'added' | 'modified' | 'deleted' | 'unchanged';
  impactDescription: string;
  costImpact: 'High' | 'Medium' | 'Low' | 'None';
}

export interface StandardComparison {
  standardBaseId: string;
  oldVersion: string;
  newVersion: string;
  releaseDate: string;
  gracePeriodMonths: number;
  summary: string;
  clauseDiffs: ClauseDiff[];
}

export interface StandardAlert {
  id: string;
  title: string;
  isNumber: string;
  category: string;
  alertType: 'QCO Order Issued' | 'Revision Published' | 'Draft for Comments' | 'Deadline Extended';
  dateIssued: string;
  effectiveDate: string;
  summary: string;
  officialGazetteRef: string;
  urgency: 'Critical' | 'Important' | 'Info';
}

export interface TestingMapping {
  requirementId: string;
  standardId: string;
  isNumber: string;
  parameterName: string;
  clause: string;
  testMethodStandard: string; // e.g. IS 302 Part 1 Cl 13
  requiredEquipment: string;
  sampleQuantity: string;
  acceptanceCriteria: string;
  requiredEvidenceDocument: string;
}

export interface TestingLab {
  id: string;
  name: string;
  location: string;
  state: string;
  nablAccredited: boolean;
  bisRecognized: boolean;
  standardsCovered: string[];
  contactEmail: string;
  contactPhone: string;
  avgTurnaroundDays: number;
  labType: 'Government (BIS/NPL)' | 'NABL Private Accredited' | 'State Lab';
}

export interface EvidenceVerificationResult {
  claimText: string;
  isGrounded: boolean;
  authenticityScore: number; // 0 to 100
  officialReference: string;
  clauseMatched: string;
  verdict: 'Verified Authentic' | 'Unverified / Hallucination Risk' | 'Partially Supported';
  explanation: string;
}

export interface TimelineMilestone {
  stage: number;
  title: string;
  description: string;
  durationDays: number;
  deliverables: string[];
  mandatoryStep: boolean;
}

