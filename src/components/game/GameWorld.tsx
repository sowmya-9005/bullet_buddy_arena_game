import { useRef, useReducer, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { inputState, playerState, minimapData } from '@/lib/inputState';
import { useGameStore } from '@/stores/gameStore';
import { WEAPONS, type LootData } from '@/lib/gameTypes';
import { MAP_HALF } from '@/lib/mapData';
import Environment from './Environment';

// Sound system
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createSounds();
      this.createBackgroundMusic();
    }
  }

  private createSounds() {
    if (!this.audioContext) return;

    // Enhanced player shoot sound
    const shootBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
    const shootData = shootBuffer.getChannelData(0);
    for (let i = 0; i < shootData.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Layered gunshot sound with low frequency thump and high frequency crack
      const lowFreq = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 15) * 0.4;
      const midFreq = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.3;
      const highFreq = (Math.random() - 0.5) * Math.exp(-t * 50) * 0.2;
      const click = Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t * 100) * 0.1;
      shootData[i] = lowFreq + midFreq + highFreq + click;
    }
    this.sounds.set('shoot', shootBuffer);

    // Enhanced enemy shoot sound
    const enemyShootBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.25, this.audioContext.sampleRate);
    const enemyShootData = enemyShootBuffer.getChannelData(0);
    for (let i = 0; i < enemyShootData.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Deeper enemy gunshot with more bass
      const lowFreq = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 12) * 0.5;
      const midFreq = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 20) * 0.3;
      const noise = (Math.random() - 0.5) * Math.exp(-t * 30) * 0.3;
      const tail = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 8) * 0.2;
      enemyShootData[i] = lowFreq + midFreq + noise + tail;
    }
    this.sounds.set('enemyShoot', enemyShootBuffer);

    // Enhanced hit sound (getting shot)
    const hitBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const hitData = hitBuffer.getChannelData(0);
    for (let i = 0; i < hitData.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Impact sound with multiple layers
      const impact = (Math.random() - 0.5) * Math.exp(-t * 40) * 0.4;
      const thump = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 15) * 0.3;
      const ricochet = Math.sin(2 * Math.PI * 800 * t + Math.random() * 10) * Math.exp(-t * 60) * 0.2;
      const pain = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 10) * 0.2;
      hitData[i] = impact + thump + ricochet + pain;
    }
    this.sounds.set('hit', hitBuffer);

    // Powerup sound
    const powerupBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const powerupData = powerupBuffer.getChannelData(0);
    for (let i = 0; i < powerupData.length; i++) {
      const t = i / this.audioContext.sampleRate;
      powerupData[i] = (Math.sin(2 * Math.PI * 523.25 * t) * 0.3 + 
                        Math.sin(2 * Math.PI * 659.25 * t) * 0.2 + 
                        Math.sin(2 * Math.PI * 783.99 * t) * 0.1) * 
                        Math.exp(-t * 2);
    }
    this.sounds.set('powerup', powerupBuffer);

    // Health pickup sound
    const healthBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.6, this.audioContext.sampleRate);
    const healthData = healthBuffer.getChannelData(0);
    for (let i = 0; i < healthData.length; i++) {
      const t = i / this.audioContext.sampleRate;
      healthData[i] = (Math.sin(2 * Math.PI * 440 * t) * 0.25 + 
                       Math.sin(2 * Math.PI * 554.37 * t) * 0.2 + 
                       Math.sin(2 * Math.PI * 659.25 * t) * 0.15) * 
                       Math.exp(-t * 1.5);
    }
    this.sounds.set('health', healthBuffer);
  }

  private createBackgroundMusic() {
    if (!this.audioContext) return;

    // Create a simple, calming forest ambient music loop
    const musicBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 8, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = musicBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const t = i / this.audioContext.sampleRate;
        
        // Base ambient pad (low frequency)
        const pad = Math.sin(2 * Math.PI * 55 * t) * 0.05 +
                   Math.sin(2 * Math.PI * 82.41 * t) * 0.03;
        
        // Gentle forest melody
        const melody = Math.sin(2 * Math.PI * 261.63 * t) * 0.02 * Math.sin(t * 0.5) + // C4
                      Math.sin(2 * Math.PI * 329.63 * t) * 0.015 * Math.sin(t * 0.3) + // E4
                      Math.sin(2 * Math.PI * 392 * t) * 0.01 * Math.sin(t * 0.7); // G4
        
        // Nature-inspired rhythm (like wind through trees)
        const rhythm = Math.sin(2 * Math.PI * 0.5 * t) * 0.03 +
                      Math.sin(2 * Math.PI * 0.3 * t) * 0.02;
        
        // Subtle bird-like high frequencies
        const birds = Math.sin(2 * Math.PI * 1760 * t) * 0.005 * Math.sin(t * 2.3) +
                     Math.sin(2 * Math.PI * 2093 * t) * 0.003 * Math.sin(t * 3.7);
        
        // Combine all elements
        channelData[i] = (pad + melody + rhythm + birds) * 0.3;
        
        // Add gentle fade in at start
        if (i < this.audioContext.sampleRate * 2) {
          channelData[i] *= i / (this.audioContext.sampleRate * 2);
        }
        
        // Add gentle fade out at end
        if (i > musicBuffer.length - this.audioContext.sampleRate * 2) {
          channelData[i] *= (musicBuffer.length - i) / (this.audioContext.sampleRate * 2);
        }
      }
    }
    
    this.sounds.set('music', musicBuffer);
    this.playBackgroundMusic();
  }

  private playBackgroundMusic() {
    if (!this.audioContext || !this.sounds.has('music')) return;

    // Stop existing music if playing
    if (this.musicSource) {
      this.musicSource.stop();
    }

    this.musicSource = this.audioContext.createBufferSource();
    this.musicSource.buffer = this.sounds.get('music')!;
    this.musicSource.loop = true;

    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.value = 0.15; // Low volume for background music

    this.musicSource.connect(this.musicGainNode);
    this.musicGainNode.connect(this.audioContext.destination);
    this.musicSource.start();
  }

  playSound(soundName: string) {
    if (!this.audioContext || !this.sounds.has(soundName)) return;

    const source = this.audioContext.createBufferSource();
    const buffer = this.sounds.get(soundName)!;
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.5;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  // Resume music context if suspended (for browser autoplay policies)
  resumeMusic() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

interface BulletData {
  id: string;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  damage: number;
  age: number;
  isEnemy: boolean;
}

interface EnemyData {
  id: string;
  pos: THREE.Vector3;
  health: number;
  maxHealth: number;
  shootTimer: number;
}

let nextId = 0;
const BOUND = MAP_HALF - 1;

const GameWorld = () => {
  const { camera } = useThree();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  
  // Initialize sound manager
  const soundManager = useRef<SoundManager | null>(null);
  useEffect(() => {
    soundManager.current = new SoundManager();
  }, []);

  const bullets = useRef<BulletData[]>([]);
  const enemies = useRef<EnemyData[]>([]);
  const loot = useRef<LootData[]>([]);
  const bulletMeshes = useRef(new Map<string, THREE.Group>());
  const enemyGroups = useRef(new Map<string, THREE.Group>());
  const lootGroups = useRef(new Map<string, THREE.Group>());
  const safeZoneRef = useRef<THREE.Mesh>(null);

  const playerPos = useRef(new THREE.Vector3(0, 1.6, 0));
  const playerEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const vel = useRef(new THREE.Vector3());
  const onGround = useRef(true);
  const keys = useRef(new Set<string>());
  const justPressed = useRef(new Set<string>());
  const mouseDown = useRef(false);
  const shootCD = useRef(0);
  const spawnTimer = useRef(2);
  const lootTimer = useRef(5);
  const safeZoneTimer = useRef(45);
  const reloadTimer = useRef(0);
  const zoneDmgAccum = useRef(0);

  const renderBullets = useRef<BulletData[]>([]);
  const renderEnemies = useRef<EnemyData[]>([]);
  const renderLoot = useRef<LootData[]>([]);
  const renderSafeR = useRef(48);

  const gameOver = useGameStore((s) => s.gameOver);
  const started = useGameStore((s) => s.started);

  useEffect(() => {
    if (!gameOver && started) {
      bullets.current = [];
      enemies.current = [];
      loot.current = [];
      renderBullets.current = [];
      renderEnemies.current = [];
      renderLoot.current = [];
      playerPos.current.set(0, 1.6, 0);
      playerEuler.current.set(0, 0, 0);
      vel.current.set(0, 0, 0);
      spawnTimer.current = 2;
      lootTimer.current = 5;
      safeZoneTimer.current = 45;
      reloadTimer.current = 0;
      zoneDmgAccum.current = 0;
      nextId = 0;
      // Reset wave state
      useGameStore.getState().setWave(1);
      useGameStore.getState().setWaveEnemiesLeft(3);
      useGameStore.getState().setWaveInProgress(false);
      forceUpdate();
    }
  }, [gameOver, started]);

  useEffect(() => {
    const onKD = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      justPressed.current.add(e.code);
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'KeyI'].includes(e.code))
        e.preventDefault();
    };
    const onKU = (e: KeyboardEvent) => keys.current.delete(e.code);
    const canvas = document.querySelector('canvas');
    const onClick = () => {
      if (!('ontouchstart' in window) && !document.pointerLockElement) {
        canvas?.requestPointerLock();
        // Resume music on first user interaction (browser autoplay compliance)
        soundManager.current?.resumeMusic();
      }
    };
    const onMD = (e: MouseEvent) => { if (document.pointerLockElement && e.button === 0) mouseDown.current = true; };
    const onMU = (e: MouseEvent) => { if (e.button === 0) mouseDown.current = false; };
    const onMM = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        playerEuler.current.y -= e.movementX * 0.002;
        playerEuler.current.x = Math.max(-1.4, Math.min(1.4, playerEuler.current.x - e.movementY * 0.002));
      }
    };
    const onPLC = () => { if (!document.pointerLockElement) mouseDown.current = false; };

    const onESC = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        const store = useGameStore.getState();
        if (store.started && !store.gameOver) {
          if (store.paused) {
            store.resume();
            if (!('ontouchstart' in window)) setTimeout(() => canvas?.requestPointerLock(), 100);
          } else {
            store.pause();
            document.exitPointerLock();
          }
        }
      }
    };

    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    window.addEventListener('keydown', onESC);
    canvas?.addEventListener('click', onClick);
    document.addEventListener('mousedown', onMD);
    document.addEventListener('mouseup', onMU);
    document.addEventListener('mousemove', onMM);
    document.addEventListener('pointerlockchange', onPLC);
    return () => {
      window.removeEventListener('keydown', onKD);
      window.removeEventListener('keyup', onKU);
      window.removeEventListener('keydown', onESC);
      canvas?.removeEventListener('click', onClick);
      document.removeEventListener('mousedown', onMD);
      document.removeEventListener('mouseup', onMU);
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('pointerlockchange', onPLC);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const store = useGameStore.getState();
    if (!store.started || store.gameOver || store.paused) return;
    const d = Math.min(rawDelta, 0.05);
    let dirty = false;
    const jp = justPressed.current;

    // ── ONE-SHOT KEYS ──
    if (jp.has('Digit1') || inputState.switchWeapon === 0) { store.switchWeapon(0); inputState.switchWeapon = -1; }
    if (jp.has('Digit2') || inputState.switchWeapon === 1) { store.switchWeapon(1); inputState.switchWeapon = -1; }
    if (jp.has('KeyH') || inputState.useHealthKit) { store.useHealthKit(); inputState.useHealthKit = false; }
    if (jp.has('KeyI') || jp.has('Tab') || inputState.toggleInventory) { store.toggleInventory(); inputState.toggleInventory = false; }
    jp.clear();

    // ── PLAYER MOVEMENT ──
    const kx = (keys.current.has('KeyD') || keys.current.has('ArrowRight') ? 1 : 0) - (keys.current.has('KeyA') || keys.current.has('ArrowLeft') ? 1 : 0);
    const kz = (keys.current.has('KeyW') || keys.current.has('ArrowUp') ? 1 : 0) - (keys.current.has('KeyS') || keys.current.has('ArrowDown') ? 1 : 0);
    const mx = kx + inputState.moveX;
    const mz = kz + inputState.moveZ;

    playerEuler.current.y -= inputState.lookDeltaX * 0.004;
    playerEuler.current.x = Math.max(-1.4, Math.min(1.4, playerEuler.current.x - inputState.lookDeltaY * 0.004));
    inputState.lookDeltaX = 0;
    inputState.lookDeltaY = 0;

    const speed = keys.current.has('ShiftLeft') ? 8 : 4;
    const crouching = keys.current.has('KeyC') || inputState.crouching;
    const targetH = crouching ? 1.0 : 1.6;
    const yaw = playerEuler.current.y;
    const fX = -Math.sin(yaw), fZ = -Math.cos(yaw), rX = Math.cos(yaw), rZ = -Math.sin(yaw);
    let dx = fX * mz + rX * mx, dz = fZ * mz + rZ * mx;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) { dx /= len; dz /= len; }

    playerPos.current.x = Math.max(-BOUND, Math.min(BOUND, playerPos.current.x + dx * speed * d));
    playerPos.current.z = Math.max(-BOUND, Math.min(BOUND, playerPos.current.z + dz * speed * d));

    if ((keys.current.has('Space') || inputState.jumpPressed) && onGround.current) {
      vel.current.y = 7; onGround.current = false; inputState.jumpPressed = false;
    }
    vel.current.y -= 20 * d;
    playerPos.current.y += vel.current.y * d;
    if (playerPos.current.y <= targetH) { playerPos.current.y = targetH; vel.current.y = 0; onGround.current = true; }

    camera.position.copy(playerPos.current);
    camera.rotation.copy(playerEuler.current);
    const fwd = new THREE.Vector3(0, 0, -1).applyEuler(playerEuler.current);
    playerState.x = playerPos.current.x;
    playerState.y = playerPos.current.y;
    playerState.z = playerPos.current.z;
    playerState.forwardX = fwd.x;
    playerState.forwardY = fwd.y;
    playerState.forwardZ = fwd.z;

    // ── WEAPON / SHOOTING ──
    const activeWep = store.weapons[store.activeSlot];
    const wepDef = activeWep ? WEAPONS[activeWep.weaponId] : null;

    // Reload
    if (store.isReloading) {
      reloadTimer.current -= d;
      if (reloadTimer.current <= 0) { store.finishReload(); reloadTimer.current = 0; }
    } else if (wepDef && activeWep) {
      if ((keys.current.has('KeyR') || inputState.reloadPressed) && activeWep.ammo < wepDef.maxAmmo) {
        store.startReload();
        reloadTimer.current = wepDef.reloadTime;
        inputState.reloadPressed = false;
      }
      if (activeWep.ammo <= 0) {
        store.startReload();
        reloadTimer.current = wepDef.reloadTime;
      }
    }

    shootCD.current -= d;
    const firing = mouseDown.current || inputState.isFiring;
    if (firing && shootCD.current <= 0 && wepDef && activeWep && activeWep.ammo > 0 && !store.isReloading) {
      if (store.useAmmo()) {
        shootCD.current = wepDef.fireRate;
        bullets.current.push({
          id: `b${nextId++}`, pos: playerPos.current.clone(), dir: fwd.clone(),
          speed: wepDef.bulletSpeed, damage: wepDef.damage, age: 0, isEnemy: false,
        });
        // Play shoot sound
        soundManager.current?.playSound('shoot');
        dirty = true;
      }
    }

    // ── BULLETS ──
    const prevBC = bullets.current.length;
    bullets.current = bullets.current.filter((b) => {
      b.pos.addScaledVector(b.dir, b.speed * d);
      b.age += d;
      const mesh = bulletMeshes.current.get(b.id);
      if (mesh) mesh.position.copy(b.pos);

      if (!b.isEnemy) {
        for (const e of enemies.current) {
          if (b.pos.distanceTo(e.pos) < 1.2) { 
            const prevHealth = e.health;
            e.health -= b.damage; 
            // Play hit sound
            soundManager.current?.playSound('hit');
            // Trigger hit event for visual feedback
            if (e.health <= 0 && prevHealth > 0) {
              window.dispatchEvent(new CustomEvent('enemyHit', { 
                detail: { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 } 
              }));
              // Trigger kill event for kill counter
              window.dispatchEvent(new CustomEvent('enemyKill', {
                detail: { enemyId: e.id }
              }));
            }
            return false; 
          }
        }
      } else {
        if (b.pos.distanceTo(playerPos.current) < 1) { 
          store.damagePlayer(b.damage); 
          // Play hit sound when player is hit
          soundManager.current?.playSound('hit');
          return false; 
        }
      }
      return b.age < 3;
    });
    if (bullets.current.length !== prevBC) dirty = true;

    // ── ENEMIES ──
    const prevEC = enemies.current.length;
    enemies.current = enemies.current.filter((e) => {
      if (e.health <= 0) { store.addScore(100); return false; }
      const ex = playerPos.current.x - e.pos.x, ez = playerPos.current.z - e.pos.z;
      const dist = Math.sqrt(ex * ex + ez * ez);
      if (dist > 2) {
        e.pos.x = Math.max(-BOUND, Math.min(BOUND, e.pos.x + (ex / dist) * 2.5 * d));
        e.pos.z = Math.max(-BOUND, Math.min(BOUND, e.pos.z + (ez / dist) * 2.5 * d));
      }
      const grp = enemyGroups.current.get(e.id);
      if (grp) { grp.position.copy(e.pos); grp.lookAt(playerPos.current.x, e.pos.y, playerPos.current.z); }

      e.shootTimer -= d;
      if (e.shootTimer <= 0 && dist < 25) {
        e.shootTimer = 1.5 + Math.random() * 2;
        const dir = new THREE.Vector3(ex / dist, (playerPos.current.y - e.pos.y) / dist, ez / dist).normalize();
        bullets.current.push({
          id: `b${nextId++}`, pos: e.pos.clone().add(new THREE.Vector3(0, 1, 0)),
          dir, speed: 20, damage: 8, age: 0, isEnemy: true,
        });
        // Play enemy shoot sound
        soundManager.current?.playSound('enemyShoot');
        dirty = true;
      }
      return true;
    });
    if (enemies.current.length !== prevEC) dirty = true;

    // ── WAVE-BASED SPAWN ──
    const szr = store.safeZoneRadius;
    const wave = store.wave;
    const enemiesForWave = 3 + (wave - 1) * 2;          // wave1=3, wave2=5, wave3=7 …
    const maxAlive = Math.min(wave + 2, 8);              // cap alive at once
    const enemyHp = 30 + (wave - 1) * 10;               // scale HP per wave

    // Start wave: mark in-progress and set enemies left
    if (!store.waveInProgress && enemies.current.length === 0) {
      store.setWaveInProgress(true);
      store.setWaveEnemiesLeft(enemiesForWave);
    }

    // Spawn enemies gradually while wave is in progress
    spawnTimer.current -= d;
    if (store.waveInProgress && spawnTimer.current <= 0 && enemies.current.length < maxAlive && store.waveEnemiesLeft > 0) {
      spawnTimer.current = 1.5 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const sDist = Math.min(15 + Math.random() * 15, szr - 2);
      enemies.current.push({
        id: `e${nextId++}`,
        pos: new THREE.Vector3(Math.cos(angle) * sDist, 1, Math.sin(angle) * sDist),
        health: enemyHp, maxHealth: enemyHp, shootTimer: 2 + Math.random() * 2,
      });
      store.setWaveEnemiesLeft(store.waveEnemiesLeft - 1);
      dirty = true;
    }

    // Wave complete: all spawned and all dead → advance wave after short pause
    if (store.waveInProgress && store.waveEnemiesLeft === 0 && enemies.current.length === 0) {
      store.setWaveInProgress(false);
      store.setWave(wave + 1);
      spawnTimer.current = 4; // 4s break between waves
      dirty = true;
    }

    // ── LOOT SPAWN ──
    lootTimer.current -= d;
    if (lootTimer.current <= 0 && loot.current.length < 15) {
      lootTimer.current = 8 + Math.random() * 7;
      const angle = Math.random() * Math.PI * 2;
      const lDist = 5 + Math.random() * Math.max(5, szr - 8);
      const rand = Math.random();
      const type = rand < 0.25 ? 'weapon' as const : rand < 0.6 ? 'ammo' as const : 'healthkit' as const;
      const weaponIds = ['smg', 'shotgun', 'rifle'];
      loot.current.push({
        id: `l${nextId++}`, type,
        weaponId: type === 'weapon' ? weaponIds[Math.floor(Math.random() * 3)] : undefined,
        pos: [Math.cos(angle) * lDist, 0.5, Math.sin(angle) * lDist],
      });
      dirty = true;
    }

    // ── LOOT PICKUP ──
    const prevLC = loot.current.length;
    loot.current = loot.current.filter((l) => {
      const ddx = playerPos.current.x - l.pos[0], ddz = playerPos.current.z - l.pos[2];
      if (Math.sqrt(ddx * ddx + ddz * ddz) < 2.5) {
        if (l.type === 'weapon') {
          store.addWeapon(l.weaponId!);
          store.setPickupMessage(`Picked up ${WEAPONS[l.weaponId!].name}`);
          // Play powerup sound for weapon
          soundManager.current?.playSound('powerup');
        } else if (l.type === 'ammo') {
          store.addAmmo(15);
          store.setPickupMessage('Picked up Ammo');
          // Play powerup sound for ammo
          soundManager.current?.playSound('powerup');
        } else {
          store.addHealthKit();
          store.setPickupMessage('Picked up Health Kit');
          // Play health sound for health kit
          soundManager.current?.playSound('health');
        }
        setTimeout(() => store.setPickupMessage(null), 2000);
        return false;
      }
      return true;
    });
    if (loot.current.length !== prevLC) dirty = true;

    // ── LOOT MESH UPDATE ──
    const now = Date.now();
    loot.current.forEach((l) => {
      const grp = lootGroups.current.get(l.id);
      if (grp) {
        grp.rotation.y += d * 2;
        grp.position.y = 0.5 + Math.sin(now * 0.003 + parseInt(l.id.slice(1)) * 0.7) * 0.15;
      }
    });

    // ── SAFE ZONE ──
    safeZoneTimer.current -= d;
    if (safeZoneTimer.current <= 0) {
      safeZoneTimer.current = 45;
      const newR = Math.max(8, szr - 6);
      store.setSafeZoneRadius(newR);
    }
    const pDist = Math.sqrt(playerPos.current.x ** 2 + playerPos.current.z ** 2);
    if (pDist > szr) {
      zoneDmgAccum.current += 5 * d;
      if (zoneDmgAccum.current >= 1) {
        store.damagePlayer(Math.floor(zoneDmgAccum.current));
        zoneDmgAccum.current %= 1;
      }
    } else {
      zoneDmgAccum.current = 0;
    }

    // Update safe zone visual
    renderSafeR.current = szr;
    if (safeZoneRef.current) {
      safeZoneRef.current.scale.set(szr, szr, szr);
    }

    // ── MINIMAP DATA ──
    minimapData.enemies = enemies.current.map((e) => ({ x: e.pos.x, z: e.pos.z }));
    minimapData.loot = loot.current.map((l) => ({ x: l.pos[0], z: l.pos[2], type: l.type }));

    if (dirty) {
      renderBullets.current = [...bullets.current];
      renderEnemies.current = [...enemies.current];
      renderLoot.current = [...loot.current];
      forceUpdate();
    }
  });

  return (
    <>
      <Environment />

      {/* Safe zone ring - attractive and visible */}
      <mesh ref={safeZoneRef} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.025, 12, 128]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </mesh>

      {/* Bullets */}
      {renderBullets.current.map((b) => (
        <group key={b.id} ref={(r) => { if (r) bulletMeshes.current.set(b.id, r); else bulletMeshes.current.delete(b.id); }} position={b.pos}>
          {/* Core */}
          <mesh>
            <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
            <meshStandardMaterial color={b.isEnemy ? '#ff2200' : '#00eeff'} emissive={b.isEnemy ? '#ff0000' : '#00aaff'} emissiveIntensity={3} />
          </mesh>
          {/* Glow trail */}
          <mesh>
            <sphereGeometry args={[0.09, 6, 6]} />
            <meshStandardMaterial color={b.isEnemy ? '#ff4400' : '#00ccff'} emissive={b.isEnemy ? '#ff2200' : '#0088ff'} emissiveIntensity={2} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      {/* Enemies — armored soldier */}
      {renderEnemies.current.map((e) => (
        <group key={e.id} ref={(r) => { if (r) enemyGroups.current.set(e.id, r); else enemyGroups.current.delete(e.id); }}>
          {/* Legs */}
          <mesh position={[-0.13, 0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.18]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0.13, 0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.18]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Boots */}
          <mesh position={[-0.13, 0.06, 0.04]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.28]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.8} />
          </mesh>
          <mesh position={[0.13, 0.06, 0.04]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.28]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.8} />
          </mesh>
          {/* Torso — armored vest */}
          <mesh position={[0, 0.82, 0]} castShadow>
            <boxGeometry args={[0.52, 0.58, 0.28]} />
            <meshStandardMaterial color="#2d3a1e" roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Chest plate */}
          <mesh position={[0, 0.88, 0.13]} castShadow>
            <boxGeometry args={[0.42, 0.38, 0.06]} />
            <meshStandardMaterial color="#1a2410" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Shoulder pads */}
          <mesh position={[-0.34, 0.98, 0]} castShadow>
            <boxGeometry args={[0.14, 0.18, 0.22]} />
            <meshStandardMaterial color="#3a4a28" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0.34, 0.98, 0]} castShadow>
            <boxGeometry args={[0.14, 0.18, 0.22]} />
            <meshStandardMaterial color="#3a4a28" roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Arms */}
          <mesh position={[-0.34, 0.72, 0]} castShadow>
            <boxGeometry args={[0.14, 0.44, 0.14]} />
            <meshStandardMaterial color="#2d3a1e" roughness={0.6} />
          </mesh>
          <mesh position={[0.34, 0.72, 0]} castShadow>
            <boxGeometry args={[0.14, 0.44, 0.14]} />
            <meshStandardMaterial color="#2d3a1e" roughness={0.6} />
          </mesh>
          {/* Gloves */}
          <mesh position={[-0.34, 0.5, 0]} castShadow>
            <boxGeometry args={[0.15, 0.12, 0.15]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          <mesh position={[0.34, 0.5, 0]} castShadow>
            <boxGeometry args={[0.15, 0.12, 0.15]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 1.14, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.1, 8]} />
            <meshStandardMaterial color="#c8a882" roughness={0.8} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.32, 0]} castShadow>
            <boxGeometry args={[0.3, 0.28, 0.28]} />
            <meshStandardMaterial color="#c8a882" roughness={0.7} />
          </mesh>
          {/* Helmet */}
          <mesh position={[0, 1.46, 0]} castShadow>
            <boxGeometry args={[0.34, 0.18, 0.32]} />
            <meshStandardMaterial color="#1a2410" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, 1.38, 0.14]} castShadow>
            <boxGeometry args={[0.26, 0.1, 0.04]} />
            <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={1.5} transparent opacity={0.85} />
          </mesh>
          {/* Gun */}
          <mesh position={[0.34, 0.68, 0.18]} castShadow rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.06, 0.08, 0.45]} />
            <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Gun barrel */}
          <mesh position={[0.34, 0.68, 0.42]} castShadow rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.12, 6]} />
            <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Health bar bg */}
          <mesh position={[0, 1.75, 0]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.5, 0.06]} />
            <meshBasicMaterial color="#111111" transparent opacity={0.8} />
          </mesh>
          {/* Health bar fill */}
          <mesh position={[-(0.5 - e.health/e.maxHealth * 0.5), 1.75, 0.001]}
            scale={[Math.max(0.01, e.health/e.maxHealth), 1, 1]}>
            <planeGeometry args={[0.5, 0.05]} />
            <meshBasicMaterial color={e.health > 20 ? '#22c55e' : '#ef4444'} />
          </mesh>
        </group>
      ))}

      {/* Loot items */}
      {renderLoot.current.map((l) => (
        <group key={l.id} position={[l.pos[0], l.pos[1], l.pos[2]]}
          ref={(r) => { if (r) lootGroups.current.set(l.id, r); else lootGroups.current.delete(l.id); }}>

          {/* Ground glow ring */}
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.42, 0]}>
            <ringGeometry args={[0.25, 0.45, 32]} />
            <meshBasicMaterial color={l.type==='weapon'?'#4488ff':l.type==='ammo'?'#ffcc00':'#00ff88'} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>

          {l.type === 'weapon' && (
            <group>
              {/* Receiver */}
              <mesh castShadow>
                <boxGeometry args={[0.08, 0.14, 0.5]} />
                <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Stock */}
              <mesh position={[0, 0.02, -0.28]} castShadow>
                <boxGeometry args={[0.07, 0.1, 0.18]} />
                <meshStandardMaterial color="#5c3d1e" roughness={0.8} />
              </mesh>
              {/* Barrel */}
              <mesh position={[0, 0.02, 0.3]} castShadow>
                <cylinderGeometry args={[0.025, 0.03, 0.22, 8]} />
                <meshStandardMaterial color="#111111" metalness={0.95} roughness={0.1} />
              </mesh>
              {/* Scope */}
              <mesh position={[0, 0.1, 0.05]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Emissive accent */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.09, 0.15, 0.51]} />
                <meshStandardMaterial color="#4488ff" emissive="#2255ff" emissiveIntensity={0.6} transparent opacity={0.15} />
              </mesh>
            </group>
          )}

          {l.type === 'ammo' && (
            <group>
              {/* Ammo box */}
              <mesh castShadow>
                <boxGeometry args={[0.28, 0.18, 0.22]} />
                <meshStandardMaterial color="#4a3800" roughness={0.6} metalness={0.3} />
              </mesh>
              {/* Lid */}
              <mesh position={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[0.3, 0.04, 0.24]} />
                <meshStandardMaterial color="#5a4500" roughness={0.5} metalness={0.4} />
              </mesh>
              {/* Bullets sticking out */}
              {[-0.08, 0, 0.08].map((x, i) => (
                <mesh key={i} position={[x, 0.16, 0]} castShadow>
                  <cylinderGeometry args={[0.025, 0.025, 0.12, 6]} />
                  <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
                </mesh>
              ))}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.29, 0.19, 0.23]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.4} transparent opacity={0.12} />
              </mesh>
            </group>
          )}

          {l.type === 'healthkit' && (
            <group>
              {/* Kit body */}
              <mesh castShadow>
                <boxGeometry args={[0.36, 0.14, 0.28]} />
                <meshStandardMaterial color="#cc0000" roughness={0.5} metalness={0.2} />
              </mesh>
              {/* White cross H */}
              <mesh position={[0, 0.08, 0.01]}>
                <boxGeometry args={[0.22, 0.05, 0.01]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.08, 0.01]}>
                <boxGeometry args={[0.05, 0.22, 0.01]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Handle */}
              <mesh position={[0, 0.12, 0]} castShadow>
                <boxGeometry args={[0.14, 0.06, 0.06]} />
                <meshStandardMaterial color="#880000" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.37, 0.15, 0.29]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={0.5} transparent opacity={0.15} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </>
  );
};

export default GameWorld;
