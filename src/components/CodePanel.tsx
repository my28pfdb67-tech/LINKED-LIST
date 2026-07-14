/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Terminal, Code2, ChevronRight } from 'lucide-react';
import { CodeSnippetType } from '../types';

interface CodePanelProps {
  activeSnippet: CodeSnippetType;
  currentLine: number; // 0-indexed line to highlight
  language?: 'python' | 'cpp' | 'ts';
}

const SNIPPETS = {
  python: {
    traverse: [
      "def traverse_decay_chain(head):",
      "    current = head",
      "    while current is not None:",
      "        # Update physical quantities, calculate isotope abundances",
      "        current.quantity = calculate_decay(current)",
      "        current = current.next",
      "    print('Chain decay simulation step complete')"
    ],
    insert: [
      "def insert_synthetic_isotope(prev_node, new_node):",
      "    # Step 1: Assign next of new node to target's next",
      "    new_node.next = prev_node.next",
      "    # Step 2: Reroute previous pointer to the new node",
      "    prev_node.next = new_node",
      "    # Atomic mass and numbers recalculate along the list",
      "    recalculate_chain_energies(head)"
    ],
    delete: [
      "def remove_transition_level(prev_node, target_node):",
      "    if prev_node is None or target_node is None:",
      "        return",
      "    # Step 1: Bridge the gap by skipping target_node",
      "    prev_node.next = target_node.next",
      "    # Step 2: Clean up the unlinked memory",
      "    target_node.next = None",
      "    free_node_resources(target_node)"
    ],
    reverse: [
      "def reverse_bubble_chamber_track(head):",
      "    prev = None",
      "    current = head",
      "    while current is not None:",
      "        next_temp = current.next",
      "        current.next = prev",
      "        prev = current",
      "        current = next_temp",
      "    return prev  # New head (reverse trajectory / antiparticle flow)"
    ],
    idle: [
      "# Laboratory Controller Idle",
      "# Select an action (Simulate, Insert, Delete, or Reverse)",
      "# to watch active code execution tracers in real-time.",
      "print('Status: Lab engine ready.')"
    ]
  },
  cpp: {
    traverse: [
      "void traverseDecayChain(IsotopeNode* head) {",
      "    IsotopeNode* current = head;",
      "    while (current != nullptr) {",
      "        // Perform decay calculations",
      "        current->quantity = calculateDecay(current);",
      "        current = current->next;",
      "    }",
      "}"
    ],
    insert: [
      "void insertSyntheticIsotope(IsotopeNode* prev, IsotopeNode* newNode) {",
      "    if (prev == nullptr || newNode == nullptr) return;",
      "    newNode->next = prev->next;",
      "    prev->next = newNode;",
      "    recalculateChainEnergies(head);",
      "}"
    ],
    delete: [
      "void removeTransitionLevel(EnergyNode* prev, EnergyNode* target) {",
      "    if (prev == nullptr || target == nullptr) return;",
      "    prev->next = target->next;",
      "    delete target;",
      "}"
    ],
    reverse: [
      "VertexNode* reverseBubbleTrack(VertexNode* head) {",
      "    VertexNode* prev = nullptr;",
      "    VertexNode* current = head;",
      "    while (current != nullptr) {",
      "        VertexNode* nextTemp = current->next;",
      "        current->next = prev;",
      "        prev = current;",
      "        current = nextTemp;",
      "    }",
      "    return prev; // Reverse trajectory flow",
      "}"
    ],
    idle: [
      "// Laboratory Controller Idle",
      "// Select an action to view C++ execution trace",
      "std::cout << \"Status: Ready.\" << std::endl;"
    ]
  },
  ts: {
    traverse: [
      "function traverseDecayChain(head: IsotopeNode | null): void {",
      "  let current = head;",
      "  while (current !== null) {",
      "    // Compute isotope concentration shifts",
      "    current.currentQty = calculateDecay(current);",
      "    current = current.next;",
      "  }",
      "}"
    ],
    insert: [
      "function insertIsotope(prev: IsotopeNode, newNode: IsotopeNode): void {",
      "  newNode.next = prev.next;",
      "  prev.next = newNode;",
      "  recalculateChainEnergies();",
      "}"
    ],
    delete: [
      "function removeNode(prev: BaseNode, target: BaseNode): void {",
      "  prev.next = target.next;",
      "  target.next = null;",
      "}"
    ],
    reverse: [
      "function reverseTrack(head: ScatteringNode | null): ScatteringNode | null {",
      "  let prev = null;",
      "  let current = head;",
      "  while (current !== null) {",
      "    let temp = current.next;",
      "    current.next = prev;",
      "    prev = current;",
      "    current = temp;",
      "  }",
      "  return prev;",
      "}"
    ],
    idle: [
      "// Lab Controller State: IDLE",
      "// Waiting for list mutation commands...",
      "console.log('Operational status: OK');"
    ]
  }
};

export default function CodePanel({
  activeSnippet,
  currentLine,
  language = 'python'
}: CodePanelProps) {
  const [selectedLang, setSelectedLang] = React.useState<'python' | 'cpp' | 'ts'>(language);
  const codeLines = SNIPPETS[selectedLang][activeSnippet] || SNIPPETS[selectedLang].idle;

  return (
    <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Code Header */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wide">
            ALGORITHM EXECUTION TRACER
          </span>
        </div>
        
        {/* Language selector */}
        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
          {(['python', 'cpp', 'ts'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all uppercase cursor-pointer ${
                selectedLang === lang
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ts' ? 'TS' : lang === 'cpp' ? 'C++' : 'Py'}
            </button>
          ))}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 flex-1 font-mono text-xs overflow-auto bg-slate-950 flex flex-col leading-relaxed min-h-[220px]">
        {codeLines.map((line, idx) => {
          const isHighlighted = idx === currentLine;
          return (
            <div
              key={idx}
              className={`flex items-start py-0.5 px-2 rounded-md transition-colors duration-150 ${
                isHighlighted
                  ? 'bg-cyan-500/10 border-l-2 border-cyan-500 text-cyan-200'
                  : 'text-slate-400 border-l-2 border-transparent'
              }`}
            >
              {/* Line indicator or chevron */}
              <div className="w-5 flex-shrink-0 text-right select-none text-slate-600 pr-1 text-[10px] font-semibold">
                {isHighlighted ? (
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 -ml-1 inline animate-pulse" />
                ) : (
                  idx + 1
                )}
              </div>
              
              {/* Actual line content */}
              <pre className="whitespace-pre overflow-x-auto text-[11px] font-mono pl-1">
                {line}
              </pre>
            </div>
          );
        })}
      </div>

      {/* Debug Console Output */}
      <div className="bg-slate-950 border-t border-slate-900 p-3">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Console log</span>
        </div>
        <div className="bg-slate-900 rounded p-2 text-[10px] font-mono text-emerald-400 border border-slate-950 h-16 overflow-y-auto">
          {activeSnippet === 'idle' ? (
            <div className="text-slate-500">
              &gt; System standby. Waiting for Linked List operation...
            </div>
          ) : activeSnippet === 'traverse' ? (
            <div>
              <span className="text-slate-500">&gt; Traversal loop started.</span>
              <br />
              <span className="text-cyan-400">&gt; current = head ({SNIPPETS[selectedLang][activeSnippet][1]?.includes('current') ? 'Initialized' : 'Traversing'})</span>
              <br />
              &gt; Simulating physics values based on node links.
            </div>
          ) : activeSnippet === 'insert' ? (
            <div>
              <span className="text-slate-500">&gt; Memory allocation successful.</span>
              <br />
              &gt; Rerouting pointer: node.next = target.next.
              <br />
              <span className="text-emerald-400">&gt; Node inserted. Chain updated successfully.</span>
            </div>
          ) : activeSnippet === 'delete' ? (
            <div>
              <span className="text-slate-500">&gt; Locating target element.</span>
              <br />
              &gt; Bridging link: prev.next = target.next.
              <br />
              <span className="text-rose-400">&gt; Node deallocated from physical simulator chain.</span>
            </div>
          ) : (
            <div>
              <span className="text-slate-500">&gt; Swapping references.</span>
              <br />
              &gt; Trajectory reverse algorithm executing.
              <br />
              <span className="text-cyan-400">&gt; Antiproton / electron-reverse trajectory computed!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
