import { create } from 'zustand';
import { WEAPONS, type InventoryWeapon } from '@/lib/gameTypes';

interface GameStore {
  health: number;
  score: number;
  gameOver: boolean;
  started: boolean;
  paused: boolean;
  weapons: (InventoryWeapon | null)[];
  activeSlot: number;
  healthKits: number;
  isReloading: boolean;
  safeZoneRadius: number;
  inventoryOpen: boolean;
  pickupMessage: string | null;
  wave: number;
  waveEnemiesLeft: number;
  waveInProgress: boolean;
  setWave: (wave: number) => void;
  setWaveEnemiesLeft: (n: number) => void;
  setWaveInProgress: (v: boolean) => void;
  damagePlayer: (dmg: number) => void;
  useAmmo: () => boolean;
  startReload: () => void;
  finishReload: () => void;
  addScore: (pts: number) => void;
  restart: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  quit: () => void;
  switchWeapon: (slot: number) => void;
  addWeapon: (weaponId: string) => void;
  addAmmo: (amount: number) => void;
  addHealthKit: () => void;
  useHealthKit: () => void;
  toggleInventory: () => void;
  setPickupMessage: (msg: string | null) => void;
  setSafeZoneRadius: (r: number) => void;
}

const INITIAL_STATE = {
  health: 100,
  score: 0,
  gameOver: false,
  weapons: [{ weaponId: 'pistol', ammo: 15 }, null] as (InventoryWeapon | null)[],
  activeSlot: 0,
  healthKits: 1,
  isReloading: false,
  safeZoneRadius: 48,
  inventoryOpen: false,
  pickupMessage: null,
  paused: false,
  wave: 1,
  waveEnemiesLeft: 3,
  waveInProgress: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,
  started: false,

  damagePlayer: (dmg) =>
    set((s) => {
      const h = Math.max(0, Math.round((s.health - dmg) * 10) / 10);
      return { health: h, gameOver: h <= 0 };
    }),

  useAmmo: () => {
    const s = get();
    const w = s.weapons[s.activeSlot];
    if (!w || w.ammo <= 0 || s.gameOver || s.isReloading) return false;
    const weapons = s.weapons.map((wp, i) =>
      i === s.activeSlot && wp ? { ...wp, ammo: wp.ammo - 1 } : wp
    );
    set({ weapons });
    return true;
  },

  startReload: () => set({ isReloading: true }),

  finishReload: () =>
    set((s) => {
      const w = s.weapons[s.activeSlot];
      if (!w) return { isReloading: false };
      const weapons = s.weapons.map((wp, i) =>
        i === s.activeSlot && wp
          ? { ...wp, ammo: WEAPONS[wp.weaponId].maxAmmo }
          : wp
      );
      return { weapons, isReloading: false };
    }),

  addScore: (pts) => set((s) => ({ score: s.score + pts })),

  restart: () => set({ ...INITIAL_STATE, weapons: [{ weaponId: 'pistol', ammo: 15 }, null] }),

  start: () => set({ started: true }),

  pause: () => set({ paused: true }),

  resume: () => set({ paused: false }),

  quit: () => set({ started: false, paused: false, ...INITIAL_STATE, weapons: [{ weaponId: 'pistol', ammo: 15 }, null] }),

  switchWeapon: (slot) =>
    set((s) => {
      if (slot < 0 || slot > 1 || !s.weapons[slot]) return {};
      return { activeSlot: slot, isReloading: false };
    }),

  addWeapon: (weaponId) =>
    set((s) => {
      const weapons = [...s.weapons];
      const empty = weapons.findIndex((w) => w === null);
      const newWep: InventoryWeapon = { weaponId, ammo: WEAPONS[weaponId].maxAmmo };
      if (empty >= 0) {
        weapons[empty] = newWep;
      } else {
        weapons[s.activeSlot] = newWep;
      }
      return { weapons, isReloading: false };
    }),

  addAmmo: (amount) =>
    set((s) => {
      const w = s.weapons[s.activeSlot];
      if (!w) return {};
      const weapons = s.weapons.map((wp, i) =>
        i === s.activeSlot && wp
          ? { ...wp, ammo: Math.min(WEAPONS[wp.weaponId].maxAmmo, wp.ammo + amount) }
          : wp
      );
      return { weapons };
    }),

  addHealthKit: () => set((s) => ({ healthKits: Math.min(5, s.healthKits + 1) })),

  useHealthKit: () =>
    set((s) => {
      if (s.healthKits <= 0 || s.health >= 100) return {};
      return { healthKits: s.healthKits - 1, health: Math.min(100, s.health + 30) };
    }),

  toggleInventory: () => set((s) => ({ inventoryOpen: !s.inventoryOpen })),

  setPickupMessage: (msg) => set({ pickupMessage: msg }),

  setSafeZoneRadius: (r) => set({ safeZoneRadius: r }),

  setWave: (wave) => set({ wave }),
  setWaveEnemiesLeft: (n) => set({ waveEnemiesLeft: n }),
  setWaveInProgress: (v) => set({ waveInProgress: v }),
}));
