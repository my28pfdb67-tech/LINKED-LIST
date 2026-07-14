/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, HelpCircle, ArrowLeftRight, Magnet, BookOpen } from 'lucide-react';
import { ScatteringNode, CodeSnippetType } from '../types';
import LinkedListVisualizer from './LinkedListVisualizer';
import CodePanel from './CodePanel';

interface BubbleSimulatorProps {
  onCodeTrace: (snippet: CodeSnippetType, line: number) => void;
}

// Initial scattering track of a high-energy proton entering the chamber
const INITIAL_TRACK: ScatteringNode[] = [
  {
    id: 'pt1',
    address: '0x8110',
    nextAddress: '0x81FA',
    x: 10,
    y: 50,
    energyMev: 180,
    eventType: 'initial',
    description: 'Proton Enters Chamber',
  },
  {
    id: 'pt2',
    address: '0x81FA',
    nextAddress: '0x82C4',
    x: 30,
    y: 45,
    energyMev: 155,
    eventType: 'ionization',
    description: 'Gas Ionization Track',
  },
  {
    id: 'pt3',
    address: '0x82C4',
    nextAddress: '0x83B0',
    x: 50,
    y: 42,
    energyMev: 140,
    eventType: 'ionization',
    description: 'Ionization path',
  },
  {
    id: 'pt4',
    address: '0x83B0',
    nextAddress: '0x84D0',
    x: 70,
    y: 41,
    energyMev: 120,
    eventType: 'ionization',
    description: 'Slowing ionizing path',
  },
  {
    id: 'pt5',
    address: '0x84D0',
    nextAddress: 'NULL',
    x: 90,
    y: 41,
    energyMev: 95,
    eventType: 'ionization',
    description: 'Terminal decay vertex',
  }
];

export default function BubbleSimulator({ onCodeTrace }: BubbleSimulatorProps) {
  const [nodes, setNodes] = useState<ScatteringNode[]>(INITIAL_TRACK);
  const [bFieldStrength, setBFieldStrength] = useState<number>(-4.0); // Tesla, curves negative particles
  const [isTraversing, setIsTraversing] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  // Custom states
  const [isAdding, setIsAdding] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [newEnergy, setNewEnergy] = useState(130);
  const [newType, setNewType] = useState<'collision' | 'magnetic_bend' | 'decay_event'>('collision');
  const [newDesc, setNewDesc] = useState('Delta-ray scattering');

  const [activeSnippet, setActiveSnippet] = useState<CodeSnippetType>('idle');
  const [currentLine, setCurrentLine] = useState(0);

  // Synchronize code trace
  useEffect(() => {
    onCodeTrace(activeSnippet, currentLine);
  }, [activeSnippet, currentLine]);

  // Run list traversal / particle trace draw
  const runParticleBeam = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setActiveSnippet('traverse');
    
    let line = 0;
    setCurrentLine(1); // current = head

    for (let i = 0; i < nodes.length; i++) {
      setActiveNodeId(nodes[i].id);
      setCurrentLine(2); // while current is not None:
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      setCurrentLine(4); // current = current.next
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsTraversing(false);
    setActiveNodeId(null);
    setActiveSnippet('idle');
    setCurrentLine(0);
  };

  // CS operation: REVERSE LINKED LIST!
  const reverseTrack = () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setActiveSnippet('reverse');

    // Staggered timeline simulation of the in-place pointer reversal
    let step = 0;
    const runStep = () => {
      if (step < 8) {
        setCurrentLine(step + 1);
        step++;
        setTimeout(runStep, 350);
      } else {
        // Perform actual state array reversal
        setNodes((prevNodes) => {
          const reversed = [...prevNodes].reverse();
          
          // Re-map memory pointers
          for (let i = 0; i < reversed.length; i++) {
            const current = reversed[i];
            const nextNode = reversed[i + 1];
            current.nextAddress = nextNode ? nextNode.address : 'NULL';
            
            // Re-map physical coords so the particle enters from opposite side
            // x becomes 100 - x to show opposite propagation flow
            current.x = 100 - current.x;
          }

          return reversed;
        });

        setIsTraversing(false);
        setActiveSnippet('idle');
        setCurrentLine(0);
      }
    };
    
    runStep();
  };

  // Node insertion: Add a collision event in the list
  const handleInsertScattering = (prevId: string) => {
    setInsertAfterId(prevId);
    setIsAdding(true);
  };

  const submitInsertScattering = () => {
    if (!insertAfterId) return;

    setActiveSnippet('insert');
    let step = 0;

    const interval = setInterval(() => {
      if (step < 6) {
        setCurrentLine(step + 1);
        step++;
      } else {
        clearInterval(interval);
        
        setNodes((prevNodes) => {
          const index = prevNodes.findIndex((n) => n.id === insertAfterId);
          if (index === -1) return prevNodes;

          const prevNode = prevNodes[index];
          const nextNode = prevNodes[index + 1];

          // Compute intermediate coordinate
          const midX = nextNode ? (prevNode.x + nextNode.x) / 2 : prevNode.x + 10;
          const midY = nextNode ? (prevNode.y + nextNode.y) / 2 : prevNode.y - 12;

          const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
          const newAddress = `0x${randomHex}`;

          const newVertex: ScatteringNode = {
            id: `vertex_${Date.now()}`,
            address: newAddress,
            nextAddress: prevNode.nextAddress,
            x: midX,
            y: midY,
            energyMev: newEnergy,
            eventType: newType,
            description: newDesc,
          };

          // Re-route pointer
          const updatedPrev = {
            ...prevNode,
            nextAddress: newAddress,
          };

          const updated = [...prevNodes];
          updated[index] = updatedPrev;
          updated.splice(index + 1, 0, newVertex);

          return updated;
        });

        setIsAdding(false);
        setInsertAfterId(null);
        setActiveSnippet('idle');
        setCurrentLine(0);
      }
    }, 350);
  };

  // Node deletion: Remove collision point (noise filtering)
  const handleDeleteScattering = (id: string) => {
    const index = nodes.findIndex((n) => n.id === id);
    if (index === -1 || index === 0) return; // Cannot delete head

    setActiveSnippet('delete');
    let step = 0;

    const interval = setInterval(() => {
      if (step < 5) {
        setCurrentLine(step + 1);
        step++;
      } else {
        clearInterval(interval);

        setNodes((prevNodes) => {
          const updated = [...prevNodes];
          const prevNode = { ...updated[index - 1] };
          const deletedNode = updated[index];

          // Re-route pointers
          prevNode.nextAddress = deletedNode.nextAddress;
          updated[index - 1] = prevNode;

          updated.splice(index, 1);
          return updated;
        });

        setActiveSnippet('idle');
        setCurrentLine(0);
      }
    }, 350);
  };

  const handleReset = () => {
    setNodes(INITIAL_TRACK.map(n => ({ ...n })));
    setBFieldStrength(-4.0);
    setIsTraversing(false);
    setActiveNodeId(null);
    setActiveSnippet('idle');
    setCurrentLine(0);
  };

  // Calculate coordinates factoring in B-field perpendicular curvature
  // For rendering, let's offset y values dynamically according to x positions and B-field!
  const getRenderPathPoints = () => {
    let pts = '';
    nodes.forEach((node, idx) => {
      // Calculate parabolic curvature offset based on B-field strength and distance from entry
      // Curve = B-field * (x - x_entry)^2 * scaled factor
      const entryX = nodes[0]?.x || 0;
      const xDistance = node.x - entryX;
      
      // Compute physics deflection
      const chargeSign = bFieldStrength < 0 ? -1 : 1;
      const deflection = bFieldStrength * (xDistance * xDistance) * 0.003 * chargeSign;
      
      const renderX = (node.x / 100) * 320 + 20; // Scale 0-100% to box pixels
      const renderY = ((node.y + deflection) / 100) * 160 + 20;

      pts += `${idx === 0 ? 'M' : 'L'} ${renderX} ${renderY} `;
    });
    return pts;
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
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100 uppercase">
                  Bubble Chamber Tracker Lab
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Particles collide, leaving ionization paths in superheated hydrogen. 
                Perform <b>linked list reversal</b> to model antiparticles propagating backwards in time!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto font-mono text-xs">
              <button
                onClick={runParticleBeam}
                disabled={isTraversing}
                className="px-4 py-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>FIRE BEAM</span>
              </button>

              <button
                onClick={reverseTrack}
                disabled={isTraversing}
                className="px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                title="Reverse linked list: reverses particle propagation direction and flips charge"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>REVERSE TRAJECTORY</span>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800/60 font-mono text-center">
            
            {/* Magnet Control Slider */}
            <div className="col-span-2 bg-slate-950/65 rounded-lg p-3 border border-slate-850 flex flex-col justify-center">
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1 px-1">
                <span className="flex items-center gap-1">
                  <Magnet className="w-3.5 h-3.5 text-blue-400" />
                  <b>Magnetic Field (B-Field)</b>
                </span>
                <span className="text-blue-400 font-bold">{bFieldStrength.toFixed(1)} Tesla</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                disabled={isTraversing}
                value={bFieldStrength}
                onChange={(e) => setBFieldStrength(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded h-1.5 cursor-pointer accent-blue-500 disabled:opacity-40"
              />
            </div>

            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-850">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Trace Vertices</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {nodes.length} Coordinates
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Linked List Node Visualizer */}
        <LinkedListVisualizer
          nodes={nodes}
          headId={nodes[0]?.id || null}
          activeId={activeNodeId}
          type="bubble"
          onNodeClick={() => {}}
          onInsertAfter={handleInsertScattering}
          onDeleteNode={handleDeleteScattering}
          isActionsDisabled={isTraversing}
        />

        {/* 2D Graphical Bubble Chamber Track Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                Cryogenic Bubble Chamber (2D Track Projection)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Observe the spiral helices. Moving vertices are computed sequentially by walking the pointer references.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800">
                B-Field: {bFieldStrength >= 0 ? 'OUT OF PAGE (+)' : 'INTO PAGE (-)'}
              </span>
            </div>
          </div>

          {/* Interactive SVG Particle Trajectory Canvas */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 h-64 relative overflow-hidden flex items-center justify-center">
            
            {/* Simulated bubble noise grid */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 200">
              {/* Draw trajectory curve line */}
              <path
                d={getRenderPathPoints()}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                className="opacity-40"
              />

              {/* Draw connected trajectory arrows */}
              <path
                d={getRenderPathPoints()}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(6,182,212,0.4))' }}
              />

              {/* Coordinate nodes as circles */}
              {nodes.map((node, idx) => {
                const entryX = nodes[0]?.x || 0;
                const xDistance = node.x - entryX;
                const chargeSign = bFieldStrength < 0 ? -1 : 1;
                const deflection = bFieldStrength * (xDistance * xDistance) * 0.003 * chargeSign;
                
                const cx = (node.x / 100) * 320 + 20;
                const cy = ((node.y + deflection) / 100) * 160 + 20;

                const isNodeActive = node.id === activeNodeId;

                return (
                  <g key={node.id} className="cursor-pointer group">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isNodeActive ? '7' : '4.5'}
                      className={`transition-all duration-300 ${
                        isNodeActive 
                          ? 'fill-amber-400 stroke-amber-200 shadow-md animate-ping' 
                          : node.eventType === 'collision'
                          ? 'fill-red-500 stroke-red-200'
                          : 'fill-indigo-500 stroke-indigo-300'
                      }`}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="2"
                      className="fill-white"
                    />
                    
                    {/* Tiny visual text labels for coordinate and vertex type */}
                    <text
                      x={cx}
                      y={cy - 10}
                      fill="#94a3b8"
                      fontSize="7px"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 p-0.5 rounded"
                    >
                      {node.symbol || node.description}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Code and Lab Guide Columns */}
      <div className="flex flex-col gap-6">
        
        {/* Code trace */}
        <CodePanel activeSnippet={activeSnippet} currentLine={currentLine} language="python" />

        {/* Dynamic coordinate creation */}
        {isAdding && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-fade-in font-mono text-xs">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <h3 className="font-mono text-sm font-semibold text-slate-100 uppercase tracking-wider mb-2">
              Insert Colliding Obstacle
            </h3>
            <p className="text-slate-400 mb-4">
              Place a target foil nucleus along the trace, forcing a scattering event.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Vertex Event Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Energy (MeV)</label>
                  <input
                    type="number"
                    value={newEnergy}
                    onChange={(e) => setNewEnergy(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Vertex Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-indigo-500 font-mono text-xs"
                  >
                    <option value="collision">Rutherford Foil Coll.</option>
                    <option value="magnetic_bend">Magnetic Flare</option>
                    <option value="decay_event">Meson Decay</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={submitInsertScattering}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded cursor-pointer uppercase text-center"
                >
                  Splice Vertex
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
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              Bubble Chamber Physics Manual
            </h3>
          </div>
          
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
            <p>
              In high energy physics, a <strong>bubble chamber</strong> is filled with superheated liquid hydrogen. 
              As charged particles speed through, they boil microscopic bubble trails along their trajectory.
            </p>
            
            <div className="bg-slate-950 rounded p-2.5 border border-slate-850 font-mono text-[11px] text-slate-400">
              <span className="text-emerald-400">Lorentz Magnetic Force:</span>
              <div className="mt-1 font-sans text-xs italic text-slate-200">
                F_mag = q(v × B) = mv² / r
              </div>
            </div>

            <p>
              By aligning vertices as a <strong>linked list</strong>, track reconstruction algorithms 
              compute momentum ($p = mv$) from the curvature radius $r = p / qB$.
            </p>

            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>
                <strong>Pointer Reversal (`reverse()`):</strong> Swapping head and tail pointers mathematically 
                corresponds to C-Symmetry (Charge/Time Reversal), illustrating the path of antiparticles 
                (which curve opposite to regular particles).
              </li>
              <li>
                <strong>Scattering Insertions:</strong> Inserting intermediate collision nodes allows us 
                to model scattering obstacles, nuclear reactions, and secondary meson decays.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
