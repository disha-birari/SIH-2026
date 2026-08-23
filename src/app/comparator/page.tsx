'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GitCompare, ArrowRight, Shield, Clock, AlertTriangle, 
  CheckCircle2, PlusCircle, RefreshCcw, Layers, Download
} from 'lucide-react';
import { getStandardComparisons } from '@/lib/data/bisDatabase';
import { StandardComparison } from '@/lib/types';

export default function StandardComparatorPage() {
  const initialComparisons = getStandardComparisons();
  const [comparisons, setComparisons] = useState<StandardComparison[]>(initialComparisons);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const [oldVer, setOldVer] = useState<string>('IS 302-2-3:2007');
  const [newVer, setNewVer] = useState<string>('IS 302-2-3:2017');
  const [graceMonths, setGraceMonths] = useState<number>(12);
  const [summary, setSummary] = useState<string>('Comprehensive revision introducing tighter testing limits and mandatory safety cut-off validation.');
  const [clauseNum, setClauseNum] = useState<string>('Clause 8.1');
  const [clauseTitle, setClauseTitle] = useState<string>('Protection against electric shock');
  const [oldText, setOldText] = useState<string>('Live parts shall be protected against accidental contact.');
  const [newText, setNewText] = useState<string>('Live parts shall be enclosed with IP2X probe protection and 3.0mm creepage clearance.');
  const [changeType, setChangeType] = useState<'added' | 'modified' | 'deleted'>('modified');
  const [costImpact, setCostImpact] = useState<'High' | 'Medium' | 'Low'>('High');
  const [impactDesc, setImpactDesc] = useState<string>('Requires enclosure mold re-tooling and NABL insulation testing.');

  const selected = comparisons[selectedIndex] || comparisons[0];

  const handleAddComparison = (e: React.FormEvent) => {
    e.preventDefault();
    const newComp: StandardComparison = {
      standardBaseId: `custom-${Date.now()}`,
      oldVersion: oldVer,
      newVersion: newVer,
      releaseDate: new Date().toISOString().split('T')[0],
      gracePeriodMonths: graceMonths,
      summary: summary,
      clauseDiffs: [
        {
          clauseNumber: clauseNum,
          title: clauseTitle,
          oldText: oldText,
          newText: newText,
          changeType: changeType,
          impactDescription: impactDesc,
          costImpact: costImpact
        }
      ]
    };
    setComparisons([newComp, ...comparisons]);
    setSelectedIndex(0);
    setShowAddForm(false);
  };

  const changedCount = selected.clauseDiffs.filter(d => d.changeType === 'modified').length;
  const addedCount = selected.clauseDiffs.filter(d => d.changeType === 'added').length;
  const deletedCount = selected.clauseDiffs.filter(d => d.changeType === 'deleted').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* Top Banner */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#171717', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitCompare style={{ width: 24, height: 24, color: '#F28C52' }} />
            <span>Standard Version Comparator &amp; Clause Diffs</span>
          </h1>
          <p style={{ fontSize: 13, color: '#686868', margin: 0, maxWidth: 760 }}>
            Side-by-side technical comparison of older vs newly revised Indian Standards with subtle orange diff highlights.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: '#F28C52', color: '#FFFFFF',
            border: 'none', borderRadius: 6,
            padding: '10px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
          }}
        >
          <PlusCircle style={{ width: 16, height: 16 }} />
          <span>{showAddForm ? 'Close Form' : 'Add Custom Comparison'}</span>
        </button>
      </div>

      {/* Selector Strip & Summary */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
        <div style={{ borderBottom: '1px solid #E8E2DC', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#686868', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Revision Pair ({comparisons.length})
              </span>
              
              {/* Quick Select Dropdown */}
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                style={{
                  background: '#FFFCF8', color: '#171717', border: '1px solid #E8E2DC',
                  borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', outline: 'none'
                }}
              >
                {comparisons.map((comp, idx) => (
                  <option key={idx} value={idx}>
                    {comp.oldVersion} → {comp.newVersion}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Summary Pill Stats */}
            <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 700 }}>
              <span style={{ background: '#FFF1E8', color: '#E9783F', border: '1px solid #F4C4A5', borderRadius: 6, padding: '4px 10px' }}>
                {changedCount} modified
              </span>
              <span style={{ background: '#EBF4EE', color: '#4F7D5A', border: '1px solid #B5D5BF', borderRadius: 6, padding: '4px 10px' }}>
                {addedCount} added
              </span>
              <span style={{ background: '#FDF2F0', color: '#B85C52', border: '1px solid #E8BDB8', borderRadius: 6, padding: '4px 10px' }}>
                {deletedCount} deleted
              </span>
            </div>
          </div>

          {/* Horizontal Scrollable Tabs with whiteSpace: nowrap */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, width: '100%', scrollbarWidth: 'thin' }}>
            {comparisons.map((comp, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  background: selectedIndex === idx ? '#FFF1E8' : '#FFFCF8',
                  color: selectedIndex === idx ? '#171717' : '#686868',
                  border: `1px solid ${selectedIndex === idx ? '#F4C4A5' : '#E8E2DC'}`,
                  borderLeft: selectedIndex === idx ? '3.5px solid #F28C52' : '1px solid #E8E2DC',
                  borderRadius: 6, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {comp.oldVersion} → {comp.newVersion}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: '#242424', margin: 0, lineHeight: 1.6 }}>
          <strong>Summary of Changes:</strong> {selected.summary}
        </p>
      </div>

      {/* Side-by-Side Clause Diff View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 4px', fontSize: 12, fontWeight: 700, color: '#686868', textTransform: 'uppercase' }}>
          <div>PREVIOUS VERSION ({selected.oldVersion})</div>
          <div>REVISED VERSION ({selected.newVersion})</div>
        </div>

        {selected.clauseDiffs.map((diff, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2DC',
              borderRadius: 8,
              padding: 20,
              boxShadow: '0 2px 8px rgba(40,30,20,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #E8E2DC', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>{diff.clauseNumber}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#686868' }}>{diff.title}</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', borderRadius: 4, padding: '2px 8px',
                background: diff.changeType === 'modified' ? '#FFF1E8' : diff.changeType === 'added' ? '#EBF4EE' : '#FDF2F0',
                color: diff.changeType === 'modified' ? '#E9783F' : diff.changeType === 'added' ? '#4F7D5A' : '#B85C52',
                border: `1px solid ${diff.changeType === 'modified' ? '#F4C4A5' : diff.changeType === 'added' ? '#B5D5BF' : '#E8BDB8'}`
              }}>
                {diff.changeType}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Old Clause Text */}
              <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 14, fontSize: 12.5, color: '#686868', lineHeight: 1.6 }}>
                {diff.oldText || <em style={{ color: '#686868' }}>Clause did not exist in previous version.</em>}
              </div>

              {/* New Clause Text with Orange Diff Highlight */}
              <div style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 6, padding: 14, fontSize: 12.5, color: '#171717', lineHeight: 1.6, fontWeight: 500 }}>
                {diff.newText}
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: '#686868', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>Impact: <strong style={{ color: '#171717' }}>{diff.impactDescription}</strong></span>
              <span>Cost: <strong style={{ color: '#E9783F' }}>{diff.costImpact} Impact</strong></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
