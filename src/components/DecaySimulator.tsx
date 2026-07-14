/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { IsotopeNode, CodeSnippetType } from '../types';
import LinkedListVisualizer from './LinkedListVisualizer';
import CodePanel from './CodePanel';

interface DecaySimulatorProps {
  onCodeTrace: (snippet: CodeSnippetType, line: number) => void;
}

// Initial default chain (a segment of Uranium-238 chain with scaled half-lives for real-time visualization)
const INITIAL_CHAIN: IsotopeNode[] = [
  {
    id: 'u238',
    address: '0x3F1A',
    nextAddress: '0x40BC',
    symbol: 'U',
    elementName: 'Uranium-238',
    massNumber: 238,
    atomicNumber: 92,
    halfLife: 8.0, // seconds for simulation
    halfLifeDisplay: '8.0 sec (Real: 4.5B yr)',
    decayMode: 'alpha',
    initialQty: 1000,
    currentQty: 1000,
  },
  {
    id: 'th234',
    address: '0x40BC',
    nextAddress: '0x45DF',
    symbol: 'Th',
    elementName: 'Thorium-234',
    massNumber: 234,
    atomicNumber: 90,
    halfLife: 4.0,
    halfLifeDisplay: '4.0 sec (Real: 24.1 d)',
    decayMode: 'beta_minus',
    initialQty: 0,
    currentQty: 0,
  },
  {
    id: 'pa234',
    address: '0x45DF',
    nextAddress: '0x4E92',
    symbol: 'Pa',
    elementName: 'Protactinium-234',
    massNumber: 234,
    atomicNumber: 91,
    halfLife: 2.5,
    halfLifeDisplay: '2.5 sec (Real: 6.7 hr)',
    decayMode: 'beta_minus',
    initialQty: 0,
    currentQty: 0,
  },
  {
    id: 'u234',
    address: '0x4E92',
    nextAddress: '0x50F1',
    symbol: 'U',
    elementName: 'Uranium-234',
    massNumber: 234,
    atomicNumber: 92,
    halfLife: 6.0,
    halfLifeDisplay: '6.0 sec (Real: 245K yr)',
    decayMode: 'alpha',
    initialQty: 0,
    currentQty: 0,
  },
  {
    id: 'pb206',
    address: '0x50F1',
    nextAddress: 'NULL',
    symbol: 'Pb',
    elementName: 'Lead-206',
    massNumber: 206,
    atomicNumber: 82,
    halfLife: 99999,
    halfLifeDisplay: 'Stable',
    decayMode: 'stable',
    initialQty: 0,
    currentQty: 0,
  },
];

export default function DecaySimulator({ onCodeTrace }: DecaySimulatorProps) {
  const [nodes, setNodes] = useState<IsotopeNode[]>(INITIAL_CHAIN);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [history, setHistory] = useState<{ time: number; quantities: Record<string, number> }[]>([]);
  
  // Code execution state
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippetType>('idle');
  const [currentLine, setCurrentLine] = useState(0);

  // Form state for creating a new custom node
  const [isAdding, setIsAdding] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('Np');
  const [newName, setNewName] = useState('Neptunium-239');
  const [newA, setNewA] = useState(239);
  const [newZ, setNewZ] = useState(93);
  const [newHalfLife, setNewHalfLife] = useState(3.5);
  const [newDecayMode, setNewDecayMode] = useState<'alpha' | 'beta_minus'>('beta_minus');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Synchronize top-level tracer props
  useEffect(() => {
    onCodeTrace(activeSnippet, currentLine);
  }, [activeSnippet, currentLine]);

  // Handle simulation clock
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000; // actual elapsed real-world seconds
      lastTimeRef.current = now;

      // Restrict time delta to avoid physics explosion
      const cappedDt = Math.min(dt, 0.1);

      setSimTime((prevTime) => {
        const nextTime = prevTime + cappedDt;

        setNodes((prevNodes) => {
          // Deep copy nodes to simulate updates
          const updated = prevNodes.map((n) => ({ ...n }));

          // Trace through linked list using pointers (simulated by finding next node matching nextAddress)
          // Since it's a linear chain in memory array, let's map address pointers:
          const addressMap: Record<string, IsotopeNode> = {};
          updated.forEach((node) => {
            addressMap[node.address] = node;
          });

          // Compute decay transfers for this tick
          // For each isotope, compute dN = N * lambda * dt
          const transfers: Record<string, number> = {}; // destinationAddress -> quantityToAdd

          updated.forEach((node) => {
            if (node.decayMode !== 'stable' && node.currentQty > 0) {
              const lambda = Math.log(2) / node.halfLife;
              const dN = node.currentQty * lambda * cappedDt;
              const actualDecay = Math.min(dN, node.currentQty);

              node.currentQty -= actualDecay;

              // Transfer decayed atoms to nextAddress if it's not NULL
              if (node.nextAddress !== 'NULL') {
                transfers[node.nextAddress] = (transfers[node.nextAddress] || 0) + actualDecay;
              }
            }
          });

          // Apply transfers to daughter nodes
          updated.forEach((node) => {
            if (transfers[node.address]) {
              node.currentQty += transfers[node.address];
            }
          });

          // Store history periodically
          setHistory((prevHistory) => {
            // Keep history list bounded to avoid lag
            const lastEntry = prevHistory[prevHistory.length - 1];
            if (!lastEntry || nextTime - lastEntry.time >= 0.2) {
              const currentQuantities: Record<string, number> = {};
              updated.forEach((n) => {
                currentQuantities[n.id] = n.currentQty;
              });
              return [...prevHistory.slice(-100), { time: nextTime, quantities: currentQuantities }];
            }
            return prevHistory;
          });

          return updated;
        });

        return nextTime;
      });

      // Highlight line in traversal snippet as long as the simulation is running
      setActiveSnippet('traverse');
      setCurrentLine((prev) => (prev + 1) % 6 + 1); // Cycle through loop lines (currentQty update)

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Code visual trace runner helper
  const runCodeTraceAnimation = (snippet: CodeSnippetType, totalLines: number, onComplete: () => void) => {
    setIsPlaying(false);
    setActiveSnippet(snippet);
    let line = 0;
    setCurrentLine(0);

    const interval = setInterval(() => {
      line++;
      if (line >= totalLines) {
        clearInterval(interval);
        setActiveSnippet('idle');
        setCurrentLine(0);
        onComplete();
      } else {
        setCurrentLine(line);
      }
    }, 450);
  };

  // Linked list operation: INSERT
  const handleInsertNode = (prevId: string) => {
    setInsertAfterId(prevId);
    setIsAdding(true);
  };

  const submitInsertNode = () => {
    if (!insertAfterId) return;

    // Trigger Code Panel Animation for Inserting Node
    runCodeTraceAnimation('insert', 7, () => {
      setNodes((prevNodes) => {
        const index = prevNodes.findIndex((n) => n.id === insertAfterId);
        if (index === -1) return prevNodes;

        const prevNode = prevNodes[index];
        const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        const newAddress = `0x${randomHex}`;

        const newIsotope: IsotopeNode = {
          id: `custom_${Date.now()}`,
          address: newAddress,
          nextAddress: prevNode.nextAddress,
          symbol: newSymbol,
          elementName: newName,
          massNumber: newA,
          atomicNumber: newZ,
          halfLife: newHalfLife,
          halfLifeDisplay: `${newHalfLife.toFixed(1)} sec (Custom)`,
          decayMode: newDecayMode,
          initialQty: 0,
          currentQty: 0,
        };

        // Reroute prevNode pointer to our new node
        const updatedPrevNode = {
          ...prevNode,
          nextAddress: newAddress,
        };

        const updatedNodes = [...prevNodes];
        updatedNodes[index] = updatedPrevNode;
        updatedNodes.splice(index + 1, 0, newIsotope);

        return updatedNodes;
      });

      setIsAdding(false);
      setInsertAfterId(null);
    });
  };

  // Linked list operation: DELETE
  const handleDeleteNode = (id: string) => {
    const index = nodes.findIndex((n) => n.id === id);
    if (index === -1 || index === 0) return; // Cannot delete head for stability

    runCodeTraceAnimation('delete', 6, () => {
      setNodes((prevNodes) => {
        const updated = [...prevNodes];
        const prevNode = { ...updated[index - 1] };
        const deletedNode = updated[index];

        // Reroute pointer to bridge the gap
        prevNode.nextAddress = deletedNode.nextAddress;
        updated[index - 1] = prevNode;

        // Remove from list
        updated.splice(index, 1);
        return updated;
      });
    });
  };

  // Reset simulation
  const handleReset = () => {
    setIsPlaying(false);
    setSimTime(0);
    setHistory([]);
    setActiveSnippet('idle');
    setCurrentLine(0);
    setNodes(
      INITIAL_CHAIN.map((node) => ({
        ...node,
        currentQty: node.initialQty,
      }))
    );
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
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100 uppercase">
                  Radioactive Decay Chain Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Models decay chains where isotope nodes link to their daughter isotopes. 
                Atoms decay sequentially down the linked list!
              </p>
            </div>

            {/* Operational buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto font-mono text-xs">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying) {
                    setActiveSnippet('traverse');
                  } else {
                    setActiveSnippet('idle');
                  }
                }}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all ${
                  isPlaying 
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE SIM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>RUN CHAIN</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Core Lab Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-800/60 font-mono text-center">
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Simulator Clock</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">
                {simTime.toFixed(2)}s
              </div>
            </div>
            
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Chain Length</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">
                {nodes.length} Nodes
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total Parent Mass</div>
              <div className="text-xl font-bold text-amber-500 mt-0.5">
                {Math.round(nodes[0]?.currentQty || 0)} atoms
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Stable Output (Pb)</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {Math.round(nodes[nodes.length - 1]?.currentQty || 0)} atoms
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Linked List Node Visualizer */}
        <LinkedListVisualizer
          nodes={nodes}
          headId={nodes[0]?.id || null}
          activeId={isPlaying ? null : null} // highlight during active computations
          type="decay"
          onNodeClick={() => {}}
          onInsertAfter={handleInsertNode}
          onDeleteNode={handleDeleteNode}
          isActionsDisabled={isPlaying}
        />

        {/* Real-time Bateman Concentration Curves */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                Spectrometric Abundance Chart (Bateman Curves)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Observe decay kinetics as atom counts migrate sequentially from parent to stable daughter.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 animate-pulse">
              LIVE DECAY PLOT
            </span>
          </div>

          {/* Custom SVG Decay Curve Chart */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 h-64 relative flex items-end justify-center">
            {history.length < 2 ? (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-600">
                Click "RUN CHAIN" to record and chart live atomic decays
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible">
                {/* Background grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                  <g key={idx}>
                    <line
                      x1="5%"
                      y1={`${ratio * 80 + 10}%`}
                      x2="98%"
                      y2={`${ratio * 80 + 10}%`}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="1%"
                      y={`${ratio * 80 + 12}%`}
                      fill="#475569"
                      fontSize="9px"
                      fontFamily="monospace"
                      dominantBaseline="middle"
                    >
                      {Math.round((1 - ratio) * 1000)}
                    </text>
                  </g>
                ))}

                {/* Plot curves */}
                {nodes.map((node, nodeIdx) => {
                  const colors = [
                    '#f59e0b', // amber
                    '#a855f7', // purple
                    '#3b82f6', // blue
                    '#ec4899', // pink
                    '#10b981', // emerald
                    '#f43f5e', // rose
                  ];
                  const color = colors[nodeIdx % colors.length];

                  // Map history into coordinates
                  const points = history.map((entry, hIdx) => {
                    const x = 5 + (hIdx / (history.length - 1)) * 93; // 5% to 98%
                    const qty = entry.quantities[node.id] || 0;
                    const y = 90 - (qty / 1000) * 80; // scale 0-1000 to 10%-90% height
                    return `${x}%,${y}%`;
                  });

                  return (
                    <g key={node.id}>
                      <path
                        d={`M ${points.join(' L ')}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                        style={{ filter: `drop-shadow(0px 0px 3px ${color}40)` }}
                      />
                      {/* Node indicator in legend */}
                      <g transform={`translate(${60 + nodeIdx * 75}, 10)`}>
                        <rect width="8" height="8" fill={color} rx="2" />
                        <text x="12" y="7" fill="#94a3b8" fontSize="9px" fontFamily="monospace">
                          {node.symbol}-{node.massNumber}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Code and Lab Guide Columns */}
      <div className="flex flex-col gap-6">
        
        {/* Dynamic Trace Code Console */}
        <CodePanel activeSnippet={activeSnippet} currentLine={currentLine} language="python" />

        {/* Dynamic Node Creation Dialog */}
        {isAdding && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider">
                Synthesize Artificial Isotope
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-mono">
              You are splicing a custom nuclear state after <span className="text-amber-400 font-bold">{nodes.find(n => n.id === insertAfterId)?.elementName}</span>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Isotope Symbol & Name</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.slice(0, 2))}
                    className="bg-slate-950 text-center border border-slate-800 rounded px-2 py-1 text-slate-100 font-bold focus:border-indigo-500"
                    placeholder="Symbol"
                  />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Atomic Mass (A)</label>
                  <input
                    type="number"
                    value={newA}
                    onChange={(e) => setNewA(parseInt(e.target.value) || 239)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Atomic Number (Z)</label>
                  <input
                    type="number"
                    value={newZ}
                    onChange={(e) => setNewZ(parseInt(e.target.value) || 93)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Half Life (sec)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHalfLife}
                    onChange={(e) => setNewHalfLife(parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Decay Channel</label>
                  <select
                    value={newDecayMode}
                    onChange={(e: any) => setNewDecayMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-indigo-500 font-mono text-xs"
                  >
                    <option value="alpha">Alpha (α)</option>
                    <option value="beta_minus">Beta (β-)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2.5">
                <button
                  onClick={submitInsertNode}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded transition-all cursor-pointer shadow-md uppercase text-center"
                >
                  Allocate Isotope
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors cursor-pointer"
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
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              Laboratory Manual: Decay Pointers
            </h3>
          </div>
          
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
            <p>
              In nuclear chemistry, a <strong>decay chain</strong> is a set of radionuclides that 
              sequentially transform via radioactive decay until reaching a stable nuclear state.
            </p>
            
            <div className="bg-slate-950 rounded p-2.5 border border-slate-850 font-mono text-[11px] text-slate-400">
              <span className="text-amber-500">Bateman Decay Equations:</span>
              <div className="mt-1 font-sans text-xs italic text-slate-200">
                dNᵢ/dt = λᵢ₋₁Nᵢ₋₁ - λᵢNᵢ
              </div>
            </div>

            <p>
              In our CS laboratory, each radionuclide is represented as a <strong>Linked List Node</strong>. 
              The <code>next</code> pointer mimics the decay transition path. The parent isotope flows 
              directly into its child as atoms dissolve under local half-lives.
            </p>

            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>
                <strong className="text-red-400">Alpha Decay (α):</strong> Emits a Helium-4 nucleus (two protons and two neutrons). 
                Mass number decreases by 4, atomic number decreases by 2.
              </li>
              <li>
                <strong className="text-blue-400">Beta Decay (β-):</strong> A neutron turns into a proton, emitting an electron. 
                Mass is unchanged, atomic number increases by 1.
              </li>
              <li>
                <strong className="text-emerald-400">Stable Isotopes:</strong> Terminate the linked list with a <code>NULL</code> pointer. No further decays occur.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
