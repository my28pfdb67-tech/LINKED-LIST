/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LabType = 'decay' | 'bohr' | 'bubble';
export type CodeSnippetType = 'traverse' | 'insert' | 'delete' | 'reverse' | 'idle';

export interface BaseNode {
  id: string;
  address: string; // simulated memory address e.g. "0x7f01"
  nextAddress: string; // e.g. "0x7f08" or "NULL"
  isHighlighted?: boolean;
  isTraversing?: boolean;
}

// ==========================================
// Lab A: Radioactive Decay Chain Types
// ==========================================
export interface IsotopeNode extends BaseNode {
  symbol: string;
  elementName: string;
  massNumber: number; // A
  atomicNumber: number; // Z
  halfLife: number; // in seconds for simulation speed
  halfLifeDisplay: string; // e.g., "4.5 billion years", "24 days", "3.1 mins"
  decayMode: 'alpha' | 'beta_minus' | 'stable';
  initialQty: number; // original count of atoms
  currentQty: number; // current count of atoms
}

// ==========================================
// Lab B: Bohr Electron Cascade Types
// ==========================================
export interface EnergyLevelNode extends BaseNode {
  n: number; // Principal quantum number
  energyEv: number; // Energy in eV, e.g. -13.6 / n^2
  label: string; // e.g., "K Shell", "L Shell", etc. or custom
  isMetastable?: boolean; // Laser active states
  hasElectron: boolean;
}

export interface PhotonEmission {
  id: string;
  wavelengthNm: number;
  energyEv: number;
  color: string; // Hex color or CSS color representing wavelength
  fromN: number;
  toN: number;
  timestamp: number;
}

// ==========================================
// Lab C: Bubble Chamber Particle Tracker Types
// ==========================================
export interface ScatteringNode extends BaseNode {
  x: number; // relative coordinate 0-100
  y: number; // relative coordinate 0-100
  energyMev: number; // energy of particle at this point
  eventType: 'initial' | 'ionization' | 'collision' | 'magnetic_bend' | 'decay_event';
  description: string; // e.g., "Proton entering", "Delta ray emission", "Rutherford scattering"
}

export interface LabExperimentState {
  nodes: BaseNode[];
  headId: string | null;
  activeNodeId: string | null;
  isPlaying: boolean;
  timeStep: number;
}
