/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Binary, 
  HelpCircle, 
  Flame, 
  Layers, 
  Sparkles, 
  CircleDot, 
  ExternalLink,
  BookOpen,
  Cpu
} from 'lucide-react';
import { LabType, CodeSnippetType } from './types';
import DecaySimulator from './components/DecaySimulator';
import BohrSimulator from './components/BohrSimulator';
import BubbleSimulator from './components/BubbleSimulator';

export default function App() {
  const [activeLab, setActiveLab] = useState<LabType>('decay');
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippetType>('idle');
  const [activeLine, setActiveLine] = useState<number>(0);

  const [systemClock, setSystemClock] = useState<string>('14:20:09:022');
  const [memoryLoad, setMemoryLoad] = useState<string>('128.4 MB / 1024 MB');

  // Realistic live ticking system clock (HH:MM:SS:MS) and subtly fluctuating memory load
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0').substring(0, 3);
      setSystemClock(`${h}:${m}:${s}:${ms}`);
    }, 45);

    const memInterval = setInterval(() => {
      const base = 128.4;
      const variation = (Math.random() - 0.5) * 1.6;
      setMemoryLoad(`${(base + variation).toFixed(1)} MB / 1024 MB`);
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(memInterval);
    };
  }, []);

  const handleCodeTrace = (snippet: CodeSnippetType, line: number) => {
    setActiveSnippet(snippet);
    setActiveLine(line);
  };

  return (
    <div className="min-h-screen bg-[#0a0c0e] text-slate-300 flex flex-col font-sans border-4 sm:border-8 border-[#1a1c1e] selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Elegant Dark Top Navigation / Header */}
      <header className="bg-[#0d1012] border-b border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand matching the design spec */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20">
              <Atom className="w-6 h-6 text-black animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
                  ParticleChain Simulator
                  <span className="text-[10px] font-mono text-cyan-500 ml-2 px-2 py-0.5 border border-cyan-500/30 rounded bg-cyan-500/5">
                    v2.4.0
                  </span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium">
                Modern Physics Lab • High Energy Data Structure
              </p>
            </div>
          </div>

          {/* Quick Lab Status Readout & Live Digital Clock Metrics */}
          <div className="flex gap-6 text-sm font-mono self-start md:self-auto">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[9px] font-bold tracking-wider uppercase">SYSTEM CLOCK</span>
              <span className="text-emerald-500 font-bold tabular-nums tracking-wide">{systemClock}</span>
            </div>
            <div className="w-[1px] bg-slate-850 h-8 self-center" />
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[9px] font-bold tracking-wider uppercase">MEMORY LOAD</span>
              <span className="text-cyan-400 font-bold tabular-nums tracking-wide">{memoryLoad}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        
        {/* Lab Deck Selector Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Lab A Selector */}
          <button
            onClick={() => {
              setActiveLab('decay');
              setActiveSnippet('idle');
              setActiveLine(0);
            }}
            className={`text-left p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              activeLab === 'decay'
                ? 'bg-[#0d1012] border-cyan-500/50 shadow-[0_4px_25px_-2px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                : 'bg-[#0d1012]/40 border-slate-800 hover:border-slate-700 hover:bg-[#0d1012]/60'
            }`}
          >
            {activeLab === 'decay' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            )}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                activeLab === 'decay' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-850 text-slate-500 group-hover:text-slate-400'
              }`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">LAB DECK A</span>
                <h3 className="font-mono text-xs font-extrabold text-slate-200 uppercase mt-0.5">
                  Isotope Decay Chains
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
              Model nuclear parent-daughter decay cascades using memory pointers. Watch atom counts flow dynamically down list links.
            </p>
          </button>

          {/* Lab B Selector */}
          <button
            onClick={() => {
              setActiveLab('bohr');
              setActiveSnippet('idle');
              setActiveLine(0);
            }}
            className={`text-left p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              activeLab === 'bohr'
                ? 'bg-[#0d1012] border-cyan-500/50 shadow-[0_4px_25px_-2px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                : 'bg-[#0d1012]/40 border-slate-800 hover:border-slate-700 hover:bg-[#0d1012]/60'
            }`}
          >
            {activeLab === 'bohr' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            )}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                activeLab === 'bohr' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-850 text-slate-500 group-hover:text-slate-400'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">LAB DECK B</span>
                <h3 className="font-mono text-xs font-extrabold text-slate-200 uppercase mt-0.5">
                  Bohr Electron Cascade
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
              Model concentric orbital energy states as node values. Release electron cascades and spectrograph emitted photon wavelengths.
            </p>
          </button>

          {/* Lab C Selector */}
          <button
            onClick={() => {
              setActiveLab('bubble');
              setActiveSnippet('idle');
              setActiveLine(0);
            }}
            className={`text-left p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              activeLab === 'bubble'
                ? 'bg-[#0d1012] border-cyan-500/50 shadow-[0_4px_25px_-2px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                : 'bg-[#0d1012]/40 border-slate-800 hover:border-slate-700 hover:bg-[#0d1012]/60'
            }`}
          >
            {activeLab === 'bubble' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            )}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                activeLab === 'bubble' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-850 text-slate-500 group-hover:text-slate-400'
              }`}>
                <CircleDot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">LAB DECK C</span>
                <h3 className="font-mono text-xs font-extrabold text-slate-200 uppercase mt-0.5">
                  Bubble Chamber Tracker
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
              Model coordinates in superheated hydrogen. Reverse track lists to compute C-Symmetry (antiparticle backward time-reversals).
            </p>
          </button>

        </section>

        {/* Active Lab Viewport */}
        <section className="flex-1 bg-[#0a0c0e]">
          {activeLab === 'decay' && <DecaySimulator onCodeTrace={handleCodeTrace} />}
          {activeLab === 'bohr' && <BohrSimulator onCodeTrace={handleCodeTrace} />}
          {activeLab === 'bubble' && <BubbleSimulator onCodeTrace={handleCodeTrace} />}
        </section>

        {/* Pedagogical Bridge Table: CS Linked Lists vs Modern Physics */}
        <section className="bg-[#0d1012] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Educational Bridge: Computer Science vs Modern Physics Laws
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2.5 font-bold uppercase tracking-wide w-1/4">CS List Concept</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wide w-1/4">Data Representation</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wide w-2/5">Physical Phenomenon Mapped in Lab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 leading-relaxed">
                
                <tr>
                  <td className="py-3 font-semibold text-slate-200">List Node</td>
                  <td className="py-3 text-slate-400">Memory Allocation Card</td>
                  <td className="py-3 text-cyan-200">
                    A physical state: Radionuclide isotope (Lab A), atomic orbital shell level $n$ (Lab B), or scattering track vertex (Lab C).
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-slate-200">Pointer (`next`)</td>
                  <td className="py-3 text-slate-400">Daughter Memory Address</td>
                  <td className="py-3 text-cyan-200">
                    A physical transition path: Nuclear decay sequence vector, electron jump transition vector, or particle propagation vector.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-slate-200">List Traversal</td>
                  <td className="py-3 text-slate-400">`while current != NULL`</td>
                  <td className="py-3 text-cyan-200">
                    Simulating system evolution: Atoms flowing down decay series (Bateman curves), electron cascade producing spectrograph lines, or reconstructed particle trail drawing.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-slate-200">Node Insertion</td>
                  <td className="py-3 text-slate-400">`new_node.next = cur.next`</td>
                  <td className="py-3 text-cyan-200">
                    Splicing intermediate physical states: Synthesizing short-lived isotopes, doping semiconductors with metastable laser states, or introducing collision target obstacles (gold foil).
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-slate-200">Node Deletion</td>
                  <td className="py-3 text-slate-400">`prev.next = cur.next`</td>
                  <td className="py-3 text-cyan-200">
                    State modification: Bypassing slow-decaying isotopes, removing discrete atomic energy shells, or filtering out cryogenic chamber track noise.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-slate-200">List Reversal</td>
                  <td className="py-3 text-slate-400 font-sans">In-place arrow flipping</td>
                  <td className="py-3 text-cyan-200">
                    <strong>C-Symmetry & Time Reversal:</strong> Reversing the path of a particle in a magnetic field, perfectly mirroring the propagation trajectory of antiparticles (e.g. positrons, antiprotons).
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Lab Sub-footer */}
      <footer className="px-6 py-3 bg-[#080a0c] border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 tracking-wider font-mono gap-3">
        <div className="uppercase">EXPERIMENTAL DATA STREAM ENABLED (SECURE)</div>
        <div className="flex flex-wrap justify-center gap-4">
          <span>ENCRYPTION: AES-256</span>
          <span className="text-cyan-400 font-semibold">BUFFER: 80%</span>
          <span className="text-emerald-500 font-semibold">FPS: 60.0</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Pure React Client-Side Physics Core</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
