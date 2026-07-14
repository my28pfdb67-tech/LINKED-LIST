/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, Activity, BookOpen, Layers } from 'lucide-react';
import { EnergyLevelNode, PhotonEmission, CodeSnippetType } from '../types';
import LinkedListVisualizer from './LinkedListVisualizer';
import CodePanel from './CodePanel';

interface BohrSimulatorProps {
  onCodeTrace: (snippet: CodeSnippetType, line: number) => void;
}

// Default Hydrogen Bohr levels (K, L, M, N, O shells)
const INITIAL_LEVELS: EnergyLevelNode[] = [
  {
    id: 'n5',
    address: '0x0A50',
    nextAddress: '0x0B40',
    n: 5,
    energyEv: -0.54,
    label: 'O Shell',
    hasElectron: true,
  },
  {
    id: 'n4',
    address: '0x0B40',
    nextAddress: '0x0C30',
    n: 4,
    energyEv: -0.85,
    label: 'N Shell',
    hasElectron: false,
  },
  {
    id: 'n3',
    address: '0x0C30',
    nextAddress: '0x0D20',
    n: 3,
    energyEv: -1.51,
    label: 'M Shell',
    hasElectron: false,
  },
  {
    id: 'n2',
    address: '0x0D20',
    nextAddress: '0x0E10',
    n: 2,
    energyEv: -3.40,
    label: 'L Shell',
    hasElectron: false,
  },
  {
    id: 'n1',
    address: '0x0E10',
    nextAddress: 'NULL',
    n: 1,
    energyEv: -13.60,
    label: 'K Shell (Ground)',
    hasElectron: false,
  }
];

export default function BohrSimulator({ onCodeTrace }: BohrSimulatorProps) {
  const [levels, setLevels] = useState<EnergyLevelNode[]>(INITIAL_LEVELS);
  const [emissions, setEmissions] = useState<PhotonEmission[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  // Wavy photon wave state for animation
  const [activePhotonWave, setActivePhotonWave] = useState<{
    color: string;
    wavelength: number;
    angle: number;
  } | null>(null);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [newLevelName, setNewLevelName] = useState('Metastable Level');
  const [newEnergy, setNewEnergy] = useState(-2.0); // eV
  const [newN, setNewN] = useState(2.5); // Custom n number representing impurity state

  // Helper to map wavelengths to RGB hex colors for visualization
  const getWavelengthColor = (wavelengthNm: number): string => {
    if (wavelengthNm < 380) return '#a855f7'; // UV: Purple/violet glow
    if (wavelengthNm > 750) return '#ef4444'; // IR: Deep Red glow
    
    // Simple RGB conversion for visible range
    if (wavelengthNm >= 380 && wavelengthNm < 440) return '#6366f1'; // Indigo-blue
    if (wavelengthNm >= 440 && wavelengthNm < 490) return '#06b6d4'; // Cyan
    if (wavelengthNm >= 490 && wavelengthNm < 510) return '#10b981'; // Greenish cyan
    if (wavelengthNm >= 510 && wavelengthNm < 580) return '#22c55e'; // Green
    if (wavelengthNm >= 580 && wavelengthNm < 640) return '#eab308'; // Yellow/Orange
    return '#f43f5e'; // Red-orange/Red
  };

  const getSpectralSeriesName = (toN: number): string => {
    if (toN === 1) return 'Lyman Series (Ultraviolet)';
    if (toN === 2) return 'Balmer Series (Visible)';
    if (toN === 3) return 'Paschen Series (Infrared)';
    return 'Bracket / Other Series (Infrared)';
  };

  // Perform electron jump / linked list traversal step-by-step
  const startCascade = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Locate node holding the electron (usually n=5 head)
    let currentIdx = levels.findIndex((l) => l.hasElectron);
    if (currentIdx === -1 || currentIdx === levels.length - 1) {
      // If electron is already at ground (tail) or missing, reset it to head n=5
      setLevels((prev) => {
        const copy = prev.map((l) => ({ ...l, hasElectron: false }));
        copy[0].hasElectron = true;
        return copy;
      });
      currentIdx = 0;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    let currentIndex = currentIdx;

    onCodeTrace('traverse', 1);

    const performStep = async () => {
      if (currentIndex >= levels.length - 1) {
        setIsTransitioning(false);
        setActiveNodeId(null);
        onCodeTrace('idle', 0);
        return;
      }

      onCodeTrace('traverse', 2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fromLevel = levels[currentIndex];
      const toLevel = levels[currentIndex + 1];

      // Physical transition math: ΔE = E_initial - E_final
      const dE = fromLevel.energyEv - toLevel.energyEv;
      
      // Planck relation: lambda = hc/ΔE
      // hc = 1239.84 eV*nm
      const wavelength = 1239.84 / dE;
      const photonColor = getWavelengthColor(wavelength);

      // Trigger visual wave animation shooting outwards
      setActivePhotonWave({
        color: photonColor,
        wavelength: wavelength,
        angle: Math.random() * 360,
      });

      // Log photon emission
      const newPhoton: PhotonEmission = {
        id: `photon_${Date.now()}_${Math.random()}`,
        wavelengthNm: wavelength,
        energyEv: dE,
        color: photonColor,
        fromN: fromLevel.n,
        toN: toLevel.n,
        timestamp: Date.now(),
      };

      setEmissions((prev) => [newPhoton, ...prev].slice(0, 30));

      // Update state: shift electron position
      setLevels((prev) => {
        const copy = prev.map((l) => ({ ...l, hasElectron: false }));
        if (copy[currentIndex + 1]) {
          copy[currentIndex + 1].hasElectron = true;
        }
        return copy;
      });

      onCodeTrace('traverse', 5);
      setActiveNodeId(toLevel.id);
      
      currentIndex++;

      setTimeout(() => {
        setActivePhotonWave(null);
        performStep();
      }, 1000);
    };

    performStep();
  };

  // Node insertion: Add a custom/doped energy level in the lattice
  const handleInsertLevel = (prevId: string) => {
    setInsertAfterId(prevId);
    setIsAdding(true);
  };

  const submitInsertLevel = () => {
    if (!insertAfterId) return;

    onCodeTrace('insert', 1);
    
    setTimeout(() => {
      setLevels((prevLevels) => {
        const index = prevLevels.findIndex((l) => l.id === insertAfterId);
        if (index === -1) return prevLevels;

        const prevLevel = prevLevels[index];
        const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        const newAddress = `0x${randomHex}`;

        const newLevel: EnergyLevelNode = {
          id: `custom_${Date.now()}`,
          address: newAddress,
          nextAddress: prevLevel.nextAddress,
          n: newN,
          energyEv: newEnergy,
          label: `${newLevelName} (n=${newN})`,
          isMetastable: true,
          hasElectron: false,
        };

        // Reroute prevLevel pointer to this level
        const updatedPrev = {
          ...prevLevel,
          nextAddress: newAddress,
        };

        const updated = [...prevLevels];
        updated[index] = updatedPrev;
        updated.splice(index + 1, 0, newLevel);

        return updated;
      });

      onCodeTrace('insert', 5);
      setIsAdding(false);
      setInsertAfterId(null);
    }, 800);
  };

  // Node deletion: Remove intermediate orbital
  const handleDeleteLevel = (id: string) => {
    const index = levels.findIndex((l) => l.id === id);
    if (index === -1 || index === 0) return; // Cannot delete head n=5

    onCodeTrace('delete', 1);

    setTimeout(() => {
      setLevels((prevLevels) => {
        const updated = [...prevLevels];
        const prevLevel = { ...updated[index - 1] };
        const deletedNode = updated[index];

        // Reroute pointer to bridge the gap
        prevLevel.nextAddress = deletedNode.nextAddress;
        updated[index - 1] = prevLevel;

        // Shift electron if it was on deleted node
        if (deletedNode.hasElectron) {
          prevLevel.hasElectron = true;
          updated[index - 1] = prevLevel;
        }

        updated.splice(index, 1);
        return updated;
      });

      onCodeTrace('delete', 4);
    }, 800);
  };

  const handleReset = () => {
    setLevels(INITIAL_LEVELS.map((l, idx) => ({ ...l, hasElectron: idx === 0 })));
    setEmissions([]);
    setIsTransitioning(false);
    setActiveNodeId(null);
    setActivePhotonWave(null);
    onCodeTrace('idle', 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Simulation Workspace Panel */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Lab Deck Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
                <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100 uppercase">
                  Bohr Electron Cascade Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Models orbital energy levels as list nodes. Releasing the electron traverses pointers, 
                emitting photons with wavelengths calculated from $\Delta E$ differences!
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto font-mono text-xs">
              <button
                onClick={startCascade}
                disabled={isTransitioning}
                className="px-4 py-2 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>CASCADE TRANSITION</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET LAB</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800/60 font-mono text-center">
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Current Orbit (n)</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">
                {levels.find((l) => l.hasElectron)?.n || 'None'}
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Level Potential</div>
              <div className="text-xl font-bold text-pink-400 mt-0.5">
                {levels.find((l) => l.hasElectron)?.energyEv.toFixed(2) || '0.00'} eV
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Emitted Photon Count</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">
                {emissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Linked List Node Visualizer */}
        <LinkedListVisualizer
          nodes={levels}
          headId={levels[0]?.id || null}
          activeId={activeNodeId}
          type="bohr"
          onNodeClick={() => {}}
          onInsertAfter={handleInsertLevel}
          onDeleteNode={handleDeleteLevel}
          isActionsDisabled={isTransitioning}
        />

        {/* 2D Concentric Atomic Orbit and Photon Shooter View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Orbital Canvas (SVG representation of the Bohr Atom) */}
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider self-start mb-3">
              Interactive Bohr Orbit Shells
            </h3>
            
            <div className="w-full aspect-square max-w-[280px] bg-slate-950 rounded-xl relative border border-slate-850 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Nucleus */}
                <circle cx="100" cy="100" r="10" className="fill-red-500 animate-pulse" />
                <text x="100" y="103" fill="#ffffff" fontSize="8px" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  p+
                </text>

                {/* Orbit Tracks */}
                {levels.map((level, idx) => {
                  const radius = 25 + idx * 15; // 25 to 85 radius range
                  const isOccupied = level.hasElectron;

                  return (
                    <g key={level.id}>
                      <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={isOccupied ? '#06b6d4' : '#1e293b'}
                        strokeWidth={isOccupied ? '1.5' : '1'}
                        strokeDasharray={level.isMetastable ? '2 2' : undefined}
                        className="transition-colors duration-300"
                      />
                      {/* Level Label */}
                      <text
                        x="100"
                        y={100 - radius - 3}
                        fill="#475569"
                        fontSize="6px"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        n={level.n}
                      </text>

                      {/* Electron on orbit */}
                      {isOccupied && (
                        <circle
                          cx="100"
                          cy={100 - radius}
                          r="4"
                          className="fill-cyan-400 stroke-cyan-200 animate-bounce cursor-pointer"
                          style={{ filter: 'drop-shadow(0px 0px 4px #06b6d4)' }}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Photon Wave Animation Burst */}
                {activePhotonWave && (
                  <path
                    d={`M 100,100 Q 110,90 120,100 T 140,100 T 160,100 T 180,100`}
                    fill="none"
                    stroke={activePhotonWave.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    transform={`rotate(${activePhotonWave.angle} 100 100)`}
                    className="animate-[pulse_1s_infinite]"
                  />
                )}
              </svg>

              {activePhotonWave && (
                <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activePhotonWave.color }} />
                  <span>Emitting: <b className="text-white">{activePhotonWave.wavelength.toFixed(1)} nm</b></span>
                </div>
              )}
            </div>
          </div>

          {/* Spectrograph Analyzer Log */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Activity className="w-4 h-4 text-pink-500" />
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                Spectrograph Array
              </h3>
            </div>
            
            {/* The colored spectrum bar */}
            <div className="h-6 w-full rounded bg-gradient-to-r from-purple-600 via-blue-500 via-emerald-400 via-yellow-400 to-red-600 border border-slate-950 flex items-center relative overflow-hidden mb-3">
              <div className="absolute inset-0 bg-black/10 text-center font-mono text-[9px] text-white/40 flex items-center justify-between px-2 font-semibold">
                <span>UV (380)</span>
                <span>Visible</span>
                <span>IR (750)</span>
              </div>

              {/* Marker ticks of captured transitions */}
              {emissions.map((em) => {
                // Map 300nm-800nm to 0-100% position
                const pos = Math.max(0, Math.min(100, ((em.wavelengthNm - 300) / 500) * 100));
                return (
                  <div
                    key={em.id}
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#fff]"
                    style={{ left: `${pos}%` }}
                    title={`${em.wavelengthNm.toFixed(1)}nm`}
                  />
                );
              })}
            </div>

            {/* List of transitions */}
            <div className="flex-1 overflow-y-auto max-h-[175px] space-y-2 font-mono text-[10px]">
              {emissions.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No transitions captured yet. Trigger electron cascades!
                </div>
              ) : (
                emissions.map((em) => (
                  <div key={em.id} className="bg-slate-950 p-2 border border-slate-850 rounded flex items-center justify-between">
                    <div>
                      <div className="text-slate-300 font-bold">
                        {em.wavelengthNm.toFixed(1)} nm ({em.energyEv.toFixed(3)} eV)
                      </div>
                      <div className="text-slate-500 text-[9px]">
                        Shell jump: n={em.fromN} ➔ n={em.toN}
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: `${em.color}20`, color: em.color, border: `1px solid ${em.color}40` }}>
                      {em.wavelengthNm < 380 ? 'UV' : em.wavelengthNm > 750 ? 'IR' : 'Visible'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Code and Lab Guide Columns */}
      <div className="flex flex-col gap-6">
        
        {/* Code trace */}
        <CodePanel activeSnippet={isTransitioning ? 'traverse' : isAdding ? 'insert' : 'idle'} currentLine={0} language="cpp" />

        {/* Dynamic level creation */}
        {isAdding && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-fade-in font-mono text-xs">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider mb-2">
              Inject Custom Energy Level
            </h3>
            <p className="text-slate-400 mb-4">
              Add a doped semiconductor level or metastable impurity node.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">State Name</label>
                <input
                  type="text"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Orbit (n)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newN}
                    onChange={(e) => setNewN(parseFloat(e.target.value) || 2.5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Energy (eV)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEnergy}
                    onChange={(e) => setNewEnergy(parseFloat(e.target.value) || -2.0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={submitInsertLevel}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded cursor-pointer uppercase text-center"
                >
                  Splice Level
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Physics Laboratory Manual Reference */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              Bohr Cascades Lab Guide
            </h3>
          </div>
          
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
            <p>
              In quantum mechanics, electrons can only exist in discrete orbits around a nucleus. 
              Falling from an outer orbit $n_i$ to an inner orbit $n_f$ forces the emission of a quantized packet of electromagnetic energy (a photon).
            </p>
            
            <div className="bg-slate-950 rounded p-2.5 border border-slate-850 font-mono text-[11px] text-slate-400">
              <span className="text-cyan-400">Planck-Rydberg Formula:</span>
              <div className="mt-1 font-sans text-xs italic text-slate-200">
                E = hc / λ = E_initial - E_final
              </div>
            </div>

            <p>
              In our quantum simulator, orbital levels are connected as a <strong>linked list</strong> in order 
              of decreasing shell potential.
            </p>

            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>
                <strong>Lyman Series:</strong> Transitions ending at $n=1$ (ground state). These emit high energy 
                ultraviolet (UV) photons, invisible to the human eye.
              </li>
              <li>
                <strong>Balmer Series:</strong> Transitions ending at $n=2$. These emit visible light, resulting 
                in the characteristic hydrogen spectral bands (656.3nm Red, 486.1nm Cyan...).
              </li>
              <li>
                <strong>Paschen Series:</strong> Transitions ending at $n=3$, emitting low energy infrared (IR).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
