/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Link2, HelpCircle } from 'lucide-react';
import { IsotopeNode, EnergyLevelNode, ScatteringNode } from '../types';

interface LinkedListVisualizerProps {
  nodes: any[];
  headId: string | null;
  activeId: string | null;
  type: 'decay' | 'bohr' | 'bubble';
  onNodeClick?: (id: string) => void;
  onInsertAfter?: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  isActionsDisabled?: boolean;
}

export default function LinkedListVisualizer({
  nodes,
  headId,
  activeId,
  type,
  onNodeClick,
  onInsertAfter,
  onDeleteNode,
  isActionsDisabled = false,
}: LinkedListVisualizerProps) {
  
  const renderNodeData = (node: any) => {
    switch (type) {
      case 'decay': {
        const iso = node as IsotopeNode;
        const percent = iso.initialQty > 0 ? (iso.currentQty / iso.initialQty) * 100 : 0;
        return (
          <div className="flex flex-col gap-1.5 text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-400">
                <sup>{iso.massNumber}</sup>{iso.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Z={iso.atomicNumber}
              </span>
            </div>
            
            <div className="text-xs text-slate-400 font-mono truncate">
              Name: <span className="text-slate-300">{iso.elementName}</span>
            </div>
            
            <div className="text-xs text-slate-400 font-mono">
              T₁/₂: <span className="text-cyan-400">{iso.halfLifeDisplay}</span>
            </div>

            <div className="mt-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>Atoms: {Math.round(iso.currentQty)}</span>
                <span>{percent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
                <motion.div
                  className={`h-full rounded-full ${
                    iso.decayMode === 'stable' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                      : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  }`}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                iso.decayMode === 'alpha' 
                  ? 'bg-red-950/80 text-red-400 border border-red-900/60' 
                  : iso.decayMode === 'beta_minus'
                  ? 'bg-blue-950/80 text-blue-400 border border-blue-900/60'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60'
              }`}>
                {iso.decayMode === 'stable' ? 'stable' : `${iso.decayMode.replace('_', ' ')} decay`}
              </span>
            </div>
          </div>
        );
      }
      case 'bohr': {
        const level = node as EnergyLevelNode;
        return (
          <div className="flex flex-col gap-1 text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-cyan-400">
                n = {level.n}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {level.label}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-1">
              Energy: <span className="text-pink-400 font-bold">{level.energyEv.toFixed(3)} eV</span>
            </div>

            {level.isMetastable && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-900/60 font-mono inline-block w-fit mt-1">
                Metastable (laser active)
              </span>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">Electron:</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  level.hasElectron 
                    ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                    : 'bg-slate-900 border-slate-700'
                }`}>
                  {level.hasElectron && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  {level.hasElectron ? 'OCCUPIED' : 'VACANT'}
                </span>
              </div>
            </div>
          </div>
        );
      }
      case 'bubble': {
        const scat = node as ScatteringNode;
        const typeLabels: Record<string, string> = {
          initial: 'Origin Node',
          ionization: 'Ionization Track',
          collision: 'Rutherford Coll.',
          magnetic_bend: 'B-Field Curved',
          decay_event: 'Secondary Decay'
        };
        const colors: Record<string, string> = {
          initial: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50',
          ionization: 'text-slate-300 bg-slate-950/40 border-slate-800',
          collision: 'text-red-400 bg-red-950/40 border-red-900/50',
          magnetic_bend: 'text-blue-400 bg-blue-950/40 border-blue-900/50',
          decay_event: 'text-purple-400 bg-purple-950/40 border-purple-900/50'
        };
        return (
          <div className="flex flex-col gap-1 text-slate-200">
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[130px]" title={scat.description}>
                {scat.description}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-1">
              Vertex: <span className="text-green-400">({Math.round(scat.x)}, {Math.round(scat.y)})</span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Energy: <span className="text-orange-400 font-bold">{scat.energyMev.toFixed(1)} MeV</span>
            </div>

            <div className="mt-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border block w-fit truncate ${colors[scat.eventType] || colors.ionization}`}>
                {typeLabels[scat.eventType] || 'Track Point'}
              </span>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 overflow-x-auto select-none shadow-inner">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Memory Representation (Linked List Nodes)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500" />
            <span>Traversing / Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span>List Node Structure</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 py-6 px-2 min-w-max">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 w-full font-mono text-slate-500 text-sm gap-2">
            <HelpCircle className="w-8 h-8 text-slate-600 animate-bounce" />
            <span>The Linked List is currently empty.</span>
            <span>Add a node to begin the physical simulation!</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => {
              const isHead = node.id === headId;
              const isTail = node.nextAddress === 'NULL';
              const isNodeActive = node.id === activeId || node.isTraversing;

              return (
                <React.Fragment key={node.id}>
                  {/* Linked List Node Block */}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      borderColor: isNodeActive ? '#06b6d4' : '#1a1c1e'
                    }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ duration: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
                    className={`relative w-64 bg-slate-950 border rounded-xl overflow-hidden shadow-lg transition-colors flex flex-col ring-1 ${
                      isNodeActive 
                        ? 'border-cyan-500 bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-cyan-500/30' 
                        : 'border-slate-800 hover:border-slate-700 ring-white/5'
                    }`}
                    onClick={() => onNodeClick?.(node.id)}
                  >
                    {/* Node Header: Pointer Address */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-400 font-bold">Node {index}</span>
                        <span className="text-slate-500">@ {node.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isHead && (
                          <span className="px-1 bg-emerald-950 text-emerald-400 border border-emerald-900/60 rounded font-semibold text-[9px] uppercase tracking-wider">
                            HEAD
                          </span>
                        )}
                        {isTail && (
                          <span className="px-1 bg-red-950 text-red-400 border border-red-900/60 rounded font-semibold text-[9px] uppercase tracking-wider">
                            TAIL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Node Data Section */}
                    <div className="p-3 flex-1 bg-slate-950/60">
                      {renderNodeData(node)}
                    </div>

                    {/* Node Footer: Pointer Next Address Box */}
                    <div className="grid grid-cols-2 bg-slate-900/90 border-t border-slate-800 font-mono text-xs text-center">
                      <div className="py-2 border-r border-slate-800 text-slate-400 text-[10px] flex items-center justify-center gap-1">
                        <span className="font-semibold text-slate-500">DATA</span>
                      </div>
                      <div className={`py-2 text-[10px] flex items-center justify-center gap-1 font-bold ${
                        node.nextAddress === 'NULL' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        <span className="text-slate-500 font-normal">NEXT:</span>
                        <span>{node.nextAddress}</span>
                      </div>
                    </div>

                    {/* Hover Actions Panel (Insert After, Delete) */}
                    {!isActionsDisabled && (
                      <div className="absolute inset-x-0 bottom-0 top-[25px] bg-slate-950/95 flex flex-col justify-center gap-2 px-6 py-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInsertAfter?.(node.id);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono text-xs py-1.5 rounded-lg border border-indigo-500 shadow transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Insert Next Node</span>
                        </button>
                        
                        {!isHead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNode?.(node.id);
                            }}
                            className="w-full bg-rose-950/40 hover:bg-rose-900/80 active:bg-rose-950 text-rose-400 border border-rose-900/50 font-mono text-xs py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                          >
                            <span>Delete This Node</span>
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* SVG Arrow representing the Next Pointer */}
                  {index < nodes.length - 1 && (
                    <div className="flex items-center px-1">
                      <motion.div
                        animate={{ 
                          color: isNodeActive ? '#06b6d4' : '#334155',
                          scale: isNodeActive ? 1.1 : 1
                        }}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <ArrowRight className="w-5 h-5 transition-colors" />
                        <span className="text-[8px] font-mono text-slate-500 bg-slate-950/80 px-1 border border-slate-800 rounded">
                          ptr
                        </span>
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
