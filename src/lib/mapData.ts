export const MAP_SIZE = 100;
export const MAP_HALF = 50;

export const TREES: Array<{ pos: [number, number, number]; height: number; trunkRadius: number; type: 'pine' | 'oak' | 'birch' }> = [
  // Large pine trees
  { pos: [15, 0, 15], height: 12, trunkRadius: 0.8, type: 'pine' },
  { pos: [-20, 0, -15], height: 14, trunkRadius: 1.0, type: 'pine' },
  { pos: [25, 0, -20], height: 10, trunkRadius: 0.7, type: 'pine' },
  { pos: [-15, 0, 20], height: 11, trunkRadius: 0.9, type: 'pine' },
  { pos: [0, 0, -32], height: 15, trunkRadius: 1.1, type: 'pine' },
  { pos: [-32, 0, 0], height: 13, trunkRadius: 0.9, type: 'pine' },
  { pos: [35, 0, 10], height: 9, trunkRadius: 0.6, type: 'oak' },
  { pos: [-10, 0, 35], height: 8, trunkRadius: 0.7, type: 'oak' },
  { pos: [32, 0, 32], height: 12, trunkRadius: 0.8, type: 'birch' },
  { pos: [-35, 0, -30], height: 11, trunkRadius: 0.9, type: 'pine' },
  
  // Medium oak trees
  { pos: [8, 0, -8], height: 7, trunkRadius: 0.5, type: 'oak' },
  { pos: [-12, 0, 12], height: 6, trunkRadius: 0.4, type: 'oak' },
  { pos: [18, 0, 8], height: 8, trunkRadius: 0.6, type: 'oak' },
  { pos: [-8, 0, -18], height: 7, trunkRadius: 0.5, type: 'birch' },
  { pos: [28, 0, -8], height: 6, trunkRadius: 0.4, type: 'birch' },
  { pos: [-28, 0, 18], height: 9, trunkRadius: 0.7, type: 'oak' },
  
  // Small birch trees
  { pos: [5, 0, 25], height: 5, trunkRadius: 0.3, type: 'birch' },
  { pos: [-25, 0, 5], height: 4, trunkRadius: 0.3, type: 'birch' },
  { pos: [15, 0, -35], height: 6, trunkRadius: 0.4, type: 'birch' },
  { pos: [-35, 0, 15], height: 5, trunkRadius: 0.3, type: 'birch' },
  { pos: [40, 0, -40], height: 7, trunkRadius: 0.5, type: 'oak' },
  { pos: [-40, 0, 40], height: 8, trunkRadius: 0.6, type: 'pine' },
];

export const ROCKS: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
  { pos: [10, 0.5, -5], size: [2, 1, 1.5] },
  { pos: [-5, 0.8, 10], size: [1.5, 1.6, 1.2] },
  { pos: [22, 0.3, -35], size: [1.8, 0.6, 1.4] },
  { pos: [-25, 0.6, 30], size: [2.2, 1.2, 1.8] },
  { pos: [40, 0.4, -10], size: [1.6, 0.8, 1.3] },
  { pos: [-40, 0.7, -15], size: [1.9, 1.4, 1.6] },
  { pos: [5, 0.5, -20], size: [1.3, 1.0, 1.1] },
  { pos: [-15, 0.6, -5], size: [1.7, 1.2, 1.4] },
];

export const FALLEN_LOGS: Array<{ pos: [number, number, number]; size: [number, number, number]; rotation: [number, number, number] }> = [
  { pos: [5, 0.3, 5], size: [4, 0.6, 0.8], rotation: [0, 0.5, 0] },
  { pos: [-8, 0.4, 3], size: [3.5, 0.8, 1.0], rotation: [0, 1.2, 0] },
  { pos: [3, 0.3, -10], size: [4.2, 0.6, 0.9], rotation: [0, -0.8, 0] },
  { pos: [-5, 0.5, -7], size: [3.8, 1.0, 1.1], rotation: [0, 0.3, 0] },
  { pos: [28, 0.4, -12], size: [4.5, 0.8, 1.2], rotation: [0, 1.5, 0] },
  { pos: [-18, 0.3, -25], size: [3.2, 0.6, 0.9], rotation: [0, -1.1, 0] },
  { pos: [35, 0.4, 25], size: [4.0, 0.8, 1.0], rotation: [0, 0.7, 0] },
  { pos: [-28, 0.5, 20], size: [3.6, 1.0, 1.1], rotation: [0, -0.4, 0] },
];

export const BUSHES: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
  { pos: [8, 0.5, 8], size: [2, 1.5, 2] },
  { pos: [-12, 0.4, -8], size: [1.8, 1.2, 1.8] },
  { pos: [18, 0.6, -12], size: [2.2, 1.8, 2.2] },
  { pos: [-18, 0.5, 12], size: [1.6, 1.3, 1.6] },
  { pos: [30, 0.4, 30], size: [2.5, 2.0, 2.5] },
  { pos: [-30, 0.3, -30], size: [1.9, 1.1, 1.9] },
  { pos: [12, 0.5, -38], size: [2.1, 1.6, 2.1] },
  { pos: [-38, 0.4, 12], size: [1.7, 1.4, 1.7] },
  { pos: [42, 0.3, -25], size: [2.3, 1.7, 2.3] },
  { pos: [-8, 0.5, -40], size: [2.0, 1.5, 2.0] },
];

export const FOREST_LIGHTS: Array<{ pos: [number, number, number]; color: string; intensity: number }> = [
  { pos: [15, 8, 15], color: '#ffd700', intensity: 0.3 },
  { pos: [-20, 10, -15], color: '#ffaa00', intensity: 0.2 },
  { pos: [0, 12, -32], color: '#ffd700', intensity: 0.3 },
  { pos: [-32, 9, 0], color: '#ffaa00', intensity: 0.2 },
  { pos: [35, 7, 10], color: '#ffd700', intensity: 0.25 },
  { pos: [-10, 6, 35], color: '#ffaa00', intensity: 0.2 },
  { pos: [32, 8, 32], color: '#ffd700', intensity: 0.3 },
  { pos: [-35, 10, -30], color: '#ffaa00', intensity: 0.25 },
];
