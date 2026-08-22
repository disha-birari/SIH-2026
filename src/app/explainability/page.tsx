'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitCompare, ArrowRight, Shield, Clock, AlertTriangle, 
  CheckCircle2, HelpCircle, Sparkles, ChevronRight, Layers, 
  FileText, Scale, ExternalLink, Download, Filter, MessageSquare, 
  Play, RefreshCw, Zap, Award, CheckSquare, BookOpen, AlertOctagon, 
  Info, ArrowUpRight, Search, Building2, Sliders, RefreshCcw, Eye, Lock,
  FileCheck, XCircle, ChevronDown, Check, ArrowDown
} from 'lucide-react';
import { getDynamicStandards, getLegalTreeDataForStandard, simulateWhatIfChange } from '@/lib/data/bisDatabase';
import { BISStandard, LegalTreeData, LegalTreeNode, WhyNotComparison, HazardChainItem, LegalAuthorityChainItem } from '@/lib/types';

export default function LegalTreeRationalePage() {
  const standardsList = getDynamicStandards();
  const [selectedStandardId, setSelectedStandardId] = useState<string>(standardsList[0]?.id || 'is-302-2-3');
  const [inputMode, setInputMode] = useState<'standard' | 'product'>('standard');
  const [viewMode, setViewMode] = useState<'simple' | 'engineer' | 'legal'>('engineer');
  
  // Custom Product Inputs for "Trace My Product"
  const [productNameInput, setProductNameInput] = useState<string>('Electric Iron');
  const [productCategoryInput, setProductCategoryInput] = useState<string>('Electrical Appliances');
  const [usageInput, setUsageInput] = useState<string>('Household');
  const [voltageInput, setVoltageInput] = useState<string>('230V 1-Phase');
  const [scaleInput, setScaleInput] = useState<string>('MSME Domestic');

  // Smart Product Interview State
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewStep, setInterviewStep] = useState<number>(0);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({
    product: 'Electric Iron',
    usage: 'Household',
    voltage: '230V 1-Phase',
    role: 'Manufacturer'
  });

  // What-If Simulator State
  const [whatIfUsage, setWhatIfUsage] = useState<string>('Household');
  const [whatIfVoltage, setWhatIfVoltage] = useState<string>('230V 1-Phase');

  // Selected Node for Detail Drawer
  const [activeNodeId, setActiveNodeId] = useState<string>('node-4');

  // Load Legal Tree Data
  const [treeData, setTreeData] = useState<LegalTreeData>(() => 
    getLegalTreeDataForStandard(selectedStandardId)
  );

  useEffect(() => {
    setTreeData(getLegalTreeDataForStandard(selectedStandardId));
  }, [selectedStandardId]);

  const selectedNode = treeData.nodes.find(n => n.id === activeNodeId) || treeData.nodes[3] || treeData.nodes[0];

  // Recalculate What-If Simulation
  const whatIfResult = simulateWhatIfChange(selectedStandardId, {
    usage: whatIfUsage,
    voltage: whatIfVoltage
  });

  // Handle Smart Interview Step
  const interviewQuestions = [
    {
      id: 'q1',
      questionText: 'What product are you trying to assess for BIS compliance?',
      options: ['Electric Iron', 'Water Heater (Geyser)', 'Two-Wheeler Helmet', 'Packaged Water', 'Solar Module', 'Other Product'],
      fieldKey: 'product'
    },
    {
      id: 'q2',
      questionText: 'Is the product intended for domestic household use or commercial / industrial use?',
      options: ['Household', 'Commercial', 'Industrial'],
      fieldKey: 'usage'
    },
    {
      id: 'q3',
      questionText: 'What is the rated operating voltage requirement?',
      options: ['230V 1-Phase', '415V 3-Phase', 'Battery / Low Voltage DC'],
      fieldKey: 'voltage'
    },
    {
      id: 'q4',
      questionText: 'What is your organization role?',
      options: ['Manufacturer', 'MSME Enterprise', 'Importer / Trader', 'Consumer'],
      fieldKey: 'role'
    }
  ];

  const handleInterviewOptionSelect = (key: string, value: string) => {
    setInterviewAnswers(prev => ({ ...prev, [key]: value }));
    if (interviewStep < interviewQuestions.length - 1) {
      setInterviewStep(prev => prev + 1);
    } else {
      // Complete interview
      if (value === 'Two-Wheeler Helmet' || key === 'product' && value.includes('Helmet')) {
        setSelectedStandardId('is-4151');
      } else if (value.includes('Water Heater')) {
        setSelectedStandardId('is-302-2-201');
      } else {
        setSelectedStandardId('is-302-2-3');
      }
      setUsageInput(interviewAnswers.usage || 'Household');
      setVoltageInput(interviewAnswers.voltage || '230V 1-Phase');
      setWhatIfUsage(interviewAnswers.usage || 'Household');
      setWhatIfVoltage(interviewAnswers.voltage || '230V 1-Phase');
      setShowInterviewModal(false);
      setInterviewStep(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>

      {/* ══════════════ 1. HERO / PAGE HEADER ══════════════ */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E2DC',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(40,30,20,0.03)',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#E9783F', background: '#FFF1E8', border: '1px solid #F4C4A5', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Shield style={{ width: 12, height: 12, color: '#F28C52' }} />
              Evidence-Grounded Mode
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868' }}>
              BIS Act 2016 Legal Logic Engine
            </span>
          </div>

          {/* View Mode Switcher ([Simple] [Engineer] [Legal]) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', padding: '0 6px' }}>View Mode:</span>
            {(['simple', 'engineer', 'legal'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  background: viewMode === mode ? '#F28C52' : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : '#242424',
                  border: 'none', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#171717', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale style={{ width: 24, height: 24, color: '#F28C52' }} />
            <span>Legal &amp; Compliance Reasoning</span>
          </h1>
          <p style={{ fontSize: 13.5, color: '#686868', margin: 0, maxWidth: 880, lineHeight: 1.6 }}>
            Trace why a BIS requirement applies — from product scope and hazard risk to statutory authority under BIS Act 2016, Quality Control Orders (QCO), technical clauses, NABL test requirements, official evidence, and compliance action.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8, borderTop: '1px solid #E8E2DC' }}>
          <p style={{ fontSize: 11.5, color: '#686868', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info style={{ width: 13, height: 13, color: '#F28C52', flexShrink: 0 }} />
            <span>AI explanations are generated from retrieved BIS evidence and should not replace official legal advice.</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => { setInputMode('standard'); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
              style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>Trace a Standard</span>
            </button>

            <button
              onClick={() => { setInputMode('product'); setShowInterviewModal(true); }}
              style={{ background: '#FFF1E8', color: '#E9783F', border: '1px solid #F4C4A5', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles style={{ width: 13, height: 13 }} />
              <span>Smart Product Interview</span>
            </button>

            <Link
              href="/evidence-verifier"
              style={{ background: '#FFFFFF', color: '#242424', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>Open Evidence Verifier</span>
              <ArrowUpRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════ 2. STANDARD / PRODUCT INPUT SELECTOR ══════════════ */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
        
        {/* Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E8E2DC', paddingBottom: 14, marginBottom: 16 }}>
          <button
            onClick={() => setInputMode('standard')}
            style={{
              background: inputMode === 'standard' ? '#FFF1E8' : 'transparent',
              color: inputMode === 'standard' ? '#171717' : '#686868',
              border: `1px solid ${inputMode === 'standard' ? '#F4C4A5' : 'transparent'}`,
              borderLeft: inputMode === 'standard' ? '3px solid #F28C52' : 'transparent',
              borderRadius: 6, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <BookOpen style={{ width: 15, height: 15, color: inputMode === 'standard' ? '#F28C52' : '#686868' }} />
            <span>Tab 1: Trace a Standard</span>
          </button>

          <button
            onClick={() => setInputMode('product')}
            style={{
              background: inputMode === 'product' ? '#FFF1E8' : 'transparent',
              color: inputMode === 'product' ? '#171717' : '#686868',
              border: `1px solid ${inputMode === 'product' ? '#F4C4A5' : 'transparent'}`,
              borderLeft: inputMode === 'product' ? '3px solid #F28C52' : 'transparent',
              borderRadius: 6, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <Building2 style={{ width: 15, height: 15, color: inputMode === 'product' ? '#F28C52' : '#686868' }} />
            <span>Tab 2: Trace My Product</span>
          </button>
        </div>

        {/* Tab 1 Content: Trace a Standard Dropdown + Horizontal Pills */}
        {inputMode === 'standard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>Select Standard to Audit:</label>
              <select
                value={selectedStandardId}
                onChange={(e) => setSelectedStandardId(e.target.value)}
                style={{
                  flex: 1, minWidth: 280, background: '#FFFCF8', border: '1px solid #E8E2DC',
                  borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#171717',
                  outline: 'none', cursor: 'pointer'
                }}
              >
                {standardsList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.isNumber} - {s.title} ({s.mandatoryStatus})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Horizontal Standard Selector Pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'thin' }}>
              {standardsList.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStandardId(s.id)}
                  style={{
                    whiteSpace: 'nowrap', flexShrink: 0,
                    background: selectedStandardId === s.id ? '#FFF1E8' : '#FFFCF8',
                    color: selectedStandardId === s.id ? '#171717' : '#686868',
                    border: `1px solid ${selectedStandardId === s.id ? '#F4C4A5' : '#E8E2DC'}`,
                    borderLeft: selectedStandardId === s.id ? '3px solid #F28C52' : '1px solid #E8E2DC',
                    borderRadius: 6, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {s.isNumber} ({s.category})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2 Content: Trace My Product Inputs */}
        {inputMode === 'product' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Product Name</label>
                <input
                  type="text"
                  value={productNameInput}
                  onChange={(e) => setProductNameInput(e.target.value)}
                  placeholder="e.g. Electric Iron, Geyser"
                  style={{ width: '100%', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Intended Usage</label>
                <select
                  value={usageInput}
                  onChange={(e) => setUsageInput(e.target.value)}
                  style={{ width: '100%', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
                >
                  <option value="Household">Household / Domestic</option>
                  <option value="Commercial">Commercial / Retail</option>
                  <option value="Industrial">Industrial / Construction</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Voltage / Power Rating</label>
                <select
                  value={voltageInput}
                  onChange={(e) => setVoltageInput(e.target.value)}
                  style={{ width: '100%', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
                >
                  <option value="230V 1-Phase">230V Single Phase</option>
                  <option value="415V 3-Phase">415V Three Phase</option>
                  <option value="Low Voltage DC">Low Voltage DC / Battery</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Enterprise Scale</label>
                <select
                  value={scaleInput}
                  onChange={(e) => setScaleInput(e.target.value)}
                  style={{ width: '100%', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
                >
                  <option value="MSME Domestic">Domestic MSME Manufacturer</option>
                  <option value="Large Industry">Large Industry</option>
                  <option value="Importer">Importer / Overseas FMCS</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
              <button
                onClick={() => setShowInterviewModal(true)}
                style={{ background: '#FFF1E8', color: '#E9783F', border: '1px solid #F4C4A5', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles style={{ width: 14, height: 14 }} />
                <span>Launch Smart Product Interview Assistant</span>
              </button>

              <button
                onClick={() => { setWhatIfUsage(usageInput); setWhatIfVoltage(voltageInput); }}
                style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Start Legal Tree Reasoning
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ 3. APPLICABILITY DECISION SUMMARY CARD ══════════════ */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E2DC',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(40,30,20,0.03)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16
      }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>PRODUCT / ITEM</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#171717', marginTop: 2 }}>{treeData.standard.title.split('-')[0]}</div>
          <div style={{ fontSize: 11, color: '#686868' }}>Scope: {treeData.standard.category}</div>
        </div>

        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>SELECTED STANDARD</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#F28C52', marginTop: 2 }}>{treeData.standard.isNumber}</div>
          <div style={{ fontSize: 11, color: '#686868' }}>Status: {treeData.currentStatus}</div>
        </div>

        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>APPLICABILITY</span>
          <div style={{ marginTop: 4 }}>
            <span style={{
              background: treeData.applicabilityStatus === 'SUPPORTED' ? '#EBF4EE' : '#FEF7ED',
              color: treeData.applicabilityStatus === 'SUPPORTED' ? '#4F7D5A' : '#C88732',
              border: `1px solid ${treeData.applicabilityStatus === 'SUPPORTED' ? '#B5D5BF' : '#F4D3A5'}`,
              borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase'
            }}>
              {treeData.applicabilityStatus}
            </span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>CERTIFICATION STATUS</span>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#171717', marginTop: 3 }}>
            {treeData.certificationStatus}
          </div>
          <div style={{ fontSize: 11, color: '#686868' }}>{treeData.standard.applicableScheme}</div>
        </div>

        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>EVIDENCE STRENGTH</span>
          <div style={{ marginTop: 4 }}>
            <span style={{ background: '#FFF1E8', color: '#E9783F', border: '1px solid #F4C4A5', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 800 }}>
              {treeData.evidenceStrength} Strength ({treeData.nodes.length} Nodes)
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════ 4. MAIN INTERACTIVE LEGAL TREE & DETAIL DRAWER ══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        
        {/* Left Column: Interactive Legal Tree */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers style={{ width: 16, height: 16, color: '#F28C52' }} />
                <span>Interactive Legal &amp; Compliance Reasoning Chain</span>
              </h2>
              <span style={{ fontSize: 11.5, color: '#686868' }}>Click any node to inspect grounded determination steps, official gazette citations, and legal authority.</span>
            </div>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: '4px 8px' }}>
              11 Logical Nodes Connected
            </span>
          </div>

          {/* Node Flow Chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {treeData.nodes.map((node, index) => {
              const isSelected = node.id === activeNodeId;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setActiveNodeId(node.id)}
                    style={{
                      background: isSelected ? '#FFF1E8' : '#FFFCF8',
                      border: `1.5px solid ${isSelected ? '#F28C52' : '#E8E2DC'}`,
                      borderLeft: `5px solid ${
                        node.type === 'hazard' ? '#B85C52' :
                        node.type === 'qco' || node.type === 'legal_authority' ? '#F28C52' :
                        node.type === 'clause' || node.type === 'test' ? '#4F7D5A' : '#686868'
                      }`,
                      borderRadius: 8,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(242,140,82,0.15)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isSelected ? '#F28C52' : '#E8E2DC',
                        color: isSelected ? '#FFFFFF' : '#171717',
                        fontSize: 12, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {index + 1}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#171717' }}>{node.title}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                            background: node.evidenceStatus === 'Official Evidence' ? '#EBF4EE' : '#FFF1E8',
                            color: node.evidenceStatus === 'Official Evidence' ? '#4F7D5A' : '#E9783F',
                            border: `1px solid ${node.evidenceStatus === 'Official Evidence' ? '#B5D5BF' : '#F4C4A5'}`,
                            borderRadius: 4, padding: '1px 6px'
                          }}>
                            {node.evidenceStatus}
                          </span>
                        </div>

                        <p style={{ fontSize: 12, color: '#686868', margin: 0, lineHeight: 1.4 }}>
                          {viewMode === 'simple' ? node.shortExplanation : viewMode === 'legal' ? (node.detailedExplanation?.slice(0, 100) || node.shortExplanation) : node.shortExplanation}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveNodeId(node.id); }}
                        style={{
                          background: '#FFFFFF', border: '1px solid #E8E2DC',
                          borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#F28C52', cursor: 'pointer'
                        }}
                      >
                        Why?
                      </button>
                      <ChevronRight style={{ width: 16, height: 16, color: isSelected ? '#F28C52' : '#686868' }} />
                    </div>
                  </div>

                  {index < treeData.nodes.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                      <ArrowDown style={{ width: 14, height: 14, color: '#E8E2DC' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Detail Drawer / Side Panel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content', position: 'sticky', top: 76 }}>
          <div style={{ borderBottom: '1px solid #E8E2DC', paddingBottom: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NODE DETAILS &amp; CITATIONS</span>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: '4px 0 0' }}>{selectedNode.title}</h3>
          </div>

          {/* Plain-Language Explanation */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>WHY THIS CONCLUSION?</span>
            <p style={{ fontSize: 12.5, color: '#242424', margin: 0, lineHeight: 1.6, background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 12 }}>
              {selectedNode.detailedExplanation || selectedNode.shortExplanation}
            </p>
          </div>

          {/* Determination Steps */}
          {selectedNode.determinationSteps && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>HOW WAS IT DETERMINED?</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedNode.determinationSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, color: '#242424' }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#4F7D5A', flexShrink: 0, marginTop: 2 }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Sources & Citations */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>OFFICIAL EVIDENCE SOURCES</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedNode.sources?.map((src, idx) => (
                <div key={idx} style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 6, padding: 10, fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: '#171717' }}>{src.title}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, background: '#FFFFFF', color: '#E9783F', padding: '1px 5px', borderRadius: 4 }}>{src.type}</span>
                  </div>
                  {src.clause && <span style={{ color: '#686868' }}>Clause: <strong>{src.clause}</strong></span>}
                  {src.page && <span style={{ color: '#686868' }}>Page / Location: <strong>{src.page}</strong></span>}
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#E9783F', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <span>View Official Source PDF</span>
                      <ExternalLink style={{ width: 11, height: 11 }} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ 5. "WHY THIS?" & "WHY NOT?" COMPARISON ENGINE ══════════════ */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#171717', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitCompare style={{ width: 18, height: 18, color: '#F28C52' }} />
            <span>"Why This?" vs "Why Not Another Standard?" Scope Comparison</span>
          </h2>
          <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
            Demonstrates why candidate standards with high vector embedding similarity were excluded based on grounded scope boundaries.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FFFCF8', borderBottom: '1.5px solid #E8E2DC', color: '#686868', fontSize: 11, textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Standard Number</th>
                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Standard Title</th>
                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Match Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Vector Sim.</th>
                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Evidence-Grounded Rationale</th>
              </tr>
            </thead>
            <tbody>
              {treeData.whyNotComparisons.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E8E2DC', background: row.matchStatus === 'DIRECT_MATCH' ? '#FFF1E8' : '#FFFFFF' }}>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#171717' }}>{row.candidateIsNumber}</td>
                  <td style={{ padding: '12px', color: '#242424', maxWidth: 220 }}>{row.candidateTitle}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
                      background: row.matchStatus === 'DIRECT_MATCH' ? '#EBF4EE' : '#FFFCF8',
                      color: row.matchStatus === 'DIRECT_MATCH' ? '#4F7D5A' : '#B85C52',
                      border: `1px solid ${row.matchStatus === 'DIRECT_MATCH' ? '#B5D5BF' : '#E8BDB8'}`
                    }}>
                      {row.matchStatus === 'DIRECT_MATCH' ? '✓ Direct Match' : '✗ Scope Excluded'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#F28C52' }}>{row.retrievalSimilarity}%</td>
                  <td style={{ padding: '12px', color: '#686868', lineHeight: 1.5 }}>{row.exclusionReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════ 6. HAZARD → REQUIREMENT → TEST → PROTECTION CHAIN ══════════════ */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#171717', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: '#F28C52' }} />
            <span>Hazard &rarr; Technical Requirement &rarr; Test &rarr; Consumer Protection Chain</span>
          </h2>
          <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
            Visualizes how each identified physical hazard directly causes technical clause requirements and laboratory test methods.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {treeData.hazardChain.map((item, idx) => (
            <div key={item.id} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#B85C52', color: '#FFFFFF', fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                    HAZARD #{idx + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#171717' }}>{item.hazardName}</span>
                </div>
                <span style={{ fontSize: 11, color: '#686868', fontWeight: 600 }}>Ref: {item.clause}</span>
              </div>

              {/* 5-Stage Step Flow */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                
                <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 6, padding: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#686868', textTransform: 'uppercase' }}>1. Identified Risk</span>
                  <p style={{ fontSize: 11.5, color: '#242424', margin: '4px 0 0', fontWeight: 600 }}>{item.hazardDescription}</p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 6, padding: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#686868', textTransform: 'uppercase' }}>2. Clause Requirement</span>
                  <p style={{ fontSize: 11.5, color: '#242424', margin: '4px 0 0', fontWeight: 600 }}>{item.requirement}</p>
                </div>

                <div style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 6, padding: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>3. Compulsory Test</span>
                  <p style={{ fontSize: 11.5, color: '#171717', margin: '4px 0 0', fontWeight: 700 }}>{item.testName}</p>
                </div>

                <div style={{ background: '#EBF4EE', border: '1px solid #B5D5BF', borderRadius: 6, padding: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#4F7D5A', textTransform: 'uppercase' }}>4. Consumer Value</span>
                  <p style={{ fontSize: 11.5, color: '#171717', margin: '4px 0 0', fontWeight: 700 }}>{item.consumerProtectionValue}</p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ 7. LEGAL AUTHORITY CHAIN & MANDATORY vs VOLUNTARY ENGINE ══════════════ */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#171717', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale style={{ width: 18, height: 18, color: '#F28C52' }} />
            <span>Statutory Legal Lineage: Parliamentary Act &rarr; QCO &rarr; Standard Specification</span>
          </h2>
          <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
            Traces the official legal chain of authority causing mandatory certification enforcement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {treeData.legalAuthorityChain.map((level) => (
            <div key={level.stage} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderTop: '3.5px solid #F28C52', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>LEVEL {level.stage}: {level.levelName}</span>
                <span style={{ fontSize: 10, background: '#EBF4EE', color: '#4F7D5A', fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>{level.status}</span>
              </div>

              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#171717', margin: 0 }}>{level.authorityName}</h4>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: '#242424', margin: 0 }}>{level.referenceDoc}</p>
              <p style={{ fontSize: 11, color: '#686868', margin: 0, lineHeight: 1.5 }}>{level.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ 8. "WHAT-IF" PRODUCT SIMULATOR & COUNTERFACTUAL ANALYSIS ══════════════ */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#171717', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders style={{ width: 18, height: 18, color: '#F28C52' }} />
            <span>"What-If" Product Property Simulator &amp; Counterfactual Impact Engine</span>
          </h2>
          <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
            Modify product operational attributes in real time to observe how standard applicability and legal compliance routes change.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          
          {/* Controls */}
          <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#171717', textTransform: 'uppercase' }}>MODIFY PRODUCT PROPERTIES</span>
            
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Intended Deployment Use</label>
              <select
                value={whatIfUsage}
                onChange={(e) => setWhatIfUsage(e.target.value)}
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
              >
                <option value="Household">Household / Domestic</option>
                <option value="Industrial">Industrial / High Stress</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#686868', display: 'block', marginBottom: 4 }}>Operating Voltage</label>
              <select
                value={whatIfVoltage}
                onChange={(e) => setWhatIfVoltage(e.target.value)}
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#242424', outline: 'none' }}
              >
                <option value="230V 1-Phase">230V Single Phase</option>
                <option value="415V 3-Phase">415V Three Phase Industrial</option>
              </select>
            </div>
          </div>

          {/* Simulation Output */}
          <div style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>SIMULATION RECALCULATION RESULT</span>
              <span style={{ fontSize: 11, fontWeight: 800, background: whatIfResult.recalculatedStatus === 'SUPPORTED' ? '#EBF4EE' : '#FEF7ED', color: whatIfResult.recalculatedStatus === 'SUPPORTED' ? '#4F7D5A' : '#C88732', padding: '2px 8px', borderRadius: 4 }}>
                {whatIfResult.recalculatedStatus}
              </span>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: '#171717', margin: 0 }}>
              {whatIfResult.impactSummary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11.5, marginTop: 4 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #F4C4A5', borderRadius: 6, padding: 10 }}>
                <strong style={{ color: '#171717', display: 'block', marginBottom: 2 }}>Testing Impact:</strong>
                <span style={{ color: '#686868' }}>{whatIfResult.testingImpact}</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #F4C4A5', borderRadius: 6, padding: 10 }}>
                <strong style={{ color: '#171717', display: 'block', marginBottom: 2 }}>Counterfactual Risk:</strong>
                <span style={{ color: '#B85C52' }}>{whatIfResult.counterfactualRisk}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════ 9. EXECUTIVE SUMMARY & NEXT BEST ACTIONS ══════════════ */}
      <div style={{ background: '#171717', color: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#F28C52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COMPLIANCE REASONING EXECUTIVE SUMMARY</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0', color: '#FFFFFF' }}>
            Standard {treeData.standard.isNumber} Compliance Action Directives
          </h2>
        </div>

        <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0, lineHeight: 1.6 }}>
          Based on the official Gazette scope of <strong>{treeData.standard.isNumber}</strong> and statutory enforcement under <strong>BIS Act 2016 Section 16</strong>, the target product requires mandatory ISI licensing, high-voltage dielectric insulation testing, and quality control plan verification prior to market distribution.
        </p>

        {/* Cross-Module Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #27272A' }}>
          <Link href="/comparator" style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <GitCompare style={{ width: 14, height: 14 }} />
            <span>Compare Version Diffs</span>
          </Link>

          <Link href="/evidence-verifier" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Shield style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>Verify Evidence Authenticity</span>
          </Link>

          <Link href="/testing-mapper" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>Map Lab Equipment</span>
          </Link>

          <Link href="/checklist" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckSquare style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>Open Interactive Checklist</span>
          </Link>
        </div>
      </div>

      {/* ══════════════ SMART PRODUCT INTERVIEW MODAL ══════════════ */}
      {showInterviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, maxWidth: 520, width: '100%', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 18, height: 18, color: '#F28C52' }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: 0 }}>Smart Product Compliance Interview</h3>
              </div>
              <button onClick={() => setShowInterviewModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', color: '#686868' }}>✕</button>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#E9783F' }}>
              Step {interviewStep + 1} of {interviewQuestions.length}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#171717', margin: 0 }}>
              {interviewQuestions[interviewStep].questionText}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interviewQuestions[interviewStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleInterviewOptionSelect(interviewQuestions[interviewStep].fieldKey, opt)}
                  style={{
                    background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6,
                    padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: '#171717',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#F28C52'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E2DC'}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E8E2DC' }}>
              <button
                disabled={interviewStep === 0}
                onClick={() => setInterviewStep(prev => prev - 1)}
                style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, color: interviewStep === 0 ? '#CBD5E1' : '#686868', cursor: interviewStep === 0 ? 'default' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: 11, color: '#686868' }}>Minimum-information strategic interview</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
