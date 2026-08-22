'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileSearch, Upload, CheckCircle2, AlertTriangle, XCircle, Download, 
  ArrowRight, Shield, RefreshCw, FileText, CheckSquare, Sparkles
} from 'lucide-react';
import { getDynamicStandards } from '@/lib/data/bisDatabase';
import { GapAnalysisResult, GapItem } from '@/lib/types';

export default function GapAnalyzerPage() {
  const standards = getDynamicStandards();
  const [selectedStandardId, setSelectedStandardId] = useState<string>(standards[0]?.id || 'is-302-2-3');
  const [docName, setDocName] = useState<string>('Electric_Iron_Product_Spec_v2.pdf');
  const [docContent, setDocContent] = useState<string>(
    `Product Spec: 1200W Steam Iron. Mains Voltage 230V AC. Heating element with adjustable thermostat. Standard earthing pin provided. Casing made of polycarbonate plastic. High voltage insulation tested up to 1000V AC. Thermostat auto cut-off set at 180°C.`
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<GapAnalysisResult | null>(null);

  const selectedStandard = standards.find(s => s.id === selectedStandardId) || standards[0];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const keyReqs = selectedStandard.keyRequirements || [];
      const testParams = selectedStandard.testingParameters || [];
      const clauses = selectedStandard.clauseReferences || [];
      
      const allRequirementsToAudit = [
        ...keyReqs.map((req, idx) => ({
          clause: clauses[idx % Math.max(1, clauses.length)]?.clause || `Clause ${8 + idx}`,
          requirement: req,
          paramKey: req
        })),
        ...testParams.map((param, idx) => ({
          clause: clauses[(keyReqs.length + idx) % Math.max(1, clauses.length)]?.clause || `Clause ${15 + idx}`,
          requirement: `${param} (Mandatory Validation)`,
          paramKey: param
        }))
      ];

      const gapItems: GapItem[] = allRequirementsToAudit.map((item) => {
        const words = item.paramKey.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const snippetLines = docContent.split(/[\n.]+/).map(s => s.trim()).filter(Boolean);
        const matchingLine = snippetLines.find(line => {
          const lLower = line.toLowerCase();
          return words.some(w => lLower.includes(w));
        });

        if (matchingLine) {
          const hasNumber = /\d+/.test(matchingLine);
          if (hasNumber || matchingLine.length > 20) {
            return {
              clause: item.clause,
              requirement: item.requirement,
              userDocEvidence: `Matched in specification: "${matchingLine}"`,
              status: 'met',
              riskSeverity: 'Low',
              remediation: `Requirement verified in submitted spec. Keep calibration logs for ${item.clause}.`
            };
          } else {
            return {
              clause: item.clause,
              requirement: item.requirement,
              userDocEvidence: `Partial match: "${matchingLine}"`,
              status: 'partial',
              riskSeverity: 'Medium',
              remediation: `Specification details incomplete under ${item.clause}. Submit laboratory test data.`
            };
          }
        } else {
          return {
            clause: item.clause,
            requirement: item.requirement,
            userDocEvidence: `Not specified in submitted documentation text.`,
            status: 'missing',
            riskSeverity: 'High',
            remediation: `Mandatory clause requirement under ${selectedStandard.isNumber}. Conduct NABL lab test.`
          };
        }
      });

      const metCount = gapItems.filter(i => i.status === 'met').length;
      const partialCount = gapItems.filter(i => i.status === 'partial').length;
      const score = Math.round((metCount * 100 + partialCount * 50) / gapItems.length);

      setResult({
        productName: docName.replace(/\.[^/.]+$/, ""),
        standardId: selectedStandard.id,
        isNumber: selectedStandard.isNumber,
        overallComplianceScore: score,
        totalRequirements: gapItems.length,
        metCount,
        missingCount: gapItems.length - metCount - partialCount,
        partialCount,
        gaps: gapItems
      });
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* Header Banner */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#171717', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileSearch style={{ width: 24, height: 24, color: '#F28C52' }} />
          <span>BIS Compliance Gap Analyzer Workspace</span>
        </h1>
        <p style={{ fontSize: 13, color: '#686868', margin: 0, maxWidth: 760 }}>
          Upload product technical specifications to audit against official Indian Standard clause requirements.
        </p>
      </div>

      {/* Input Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#171717', marginBottom: 6 }}>
              Target Indian Standard
            </label>
            <select
              value={selectedStandardId}
              onChange={(e) => setSelectedStandardId(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', background: '#FFFCF8',
                border: '1px solid #E8E2DC', borderRadius: 6, fontSize: 13, color: '#242424',
                outline: 'none'
              }}
            >
              {standards.map((s) => (
                <option key={s.id} value={s.id}>{s.isNumber} - {s.title.slice(0, 45)}...</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#171717', marginBottom: 6 }}>
              Submitted Technical Specification Text
            </label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', background: '#FFFFFF',
                border: '1px solid #E8E2DC', borderRadius: 6, fontSize: 13, color: '#242424',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            style={{
              background: '#F28C52', color: '#FFFFFF',
              border: 'none', borderRadius: 6,
              padding: '11px 24px', fontSize: 13.5, fontWeight: 700,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <RefreshCw style={{ width: 16, height: 16, animation: isAnalyzing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isAnalyzing ? 'Analyzing Clauses...' : 'Run Gap Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Compliance Results */}
      {result && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#171717', margin: '0 0 4px' }}>
                Audit Results: {result.isNumber}
              </h2>
              <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
                Compliance audit completed for {result.isNumber}. {result.metCount} met, {result.partialCount} partial, {result.missingCount} gaps.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: '#686868' }}>Overall Score</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: result.overallComplianceScore > 75 ? '#4F7D5A' : '#C88732' }}>
                {result.overallComplianceScore}%
              </div>
            </div>
          </div>

          {/* Split Screen Requirement Comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', padding: '10px 14px', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>
              <div>STANDARD REQUIREMENT</div>
              <div>SUBMITTED SPECIFICATION</div>
              <div style={{ textAlign: 'right' }}>STATUS</div>
            </div>

            {result.gaps.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 120px',
                  padding: '14px 16px', border: '1px solid #E8E2DC', borderRadius: 6,
                  alignItems: 'center', gap: 12, background: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#E9783F', marginBottom: 2 }}>{item.clause}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#171717' }}>{item.requirement}</div>
                </div>

                <div style={{ fontSize: 12.5, color: '#686868' }}>
                  {item.userDocEvidence}
                </div>

                <div style={{ textAlign: 'right' }}>
                  {item.status === 'met' && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4F7D5A', background: '#EBF4EE', border: '1px solid #B5D5BF', borderRadius: 4, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ✓ Compliant
                    </span>
                  )}
                  {item.status === 'partial' && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#C88732', background: '#FEF7ED', border: '1px solid #F4D3A5', borderRadius: 4, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ⚠ Partial
                    </span>
                  )}
                  {item.status === 'missing' && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#B85C52', background: '#FDF2F0', border: '1px solid #E8BDB8', borderRadius: 4, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ✕ Gap
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
