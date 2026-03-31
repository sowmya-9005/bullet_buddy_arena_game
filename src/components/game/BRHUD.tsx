import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { scoresApi } from '@/lib/api';
import { WEAPONS } from '@/lib/gameTypes';
import { useEffect, useState, useRef } from 'react';
import { playerState, minimapData } from '@/lib/inputState';
import { TREES, ROCKS, MAP_HALF } from '@/lib/mapData';
import Scoreboard from '@/components/Scoreboard';
import LeaderboardModal from '@/components/LeaderboardModal';
import GameGuide from '@/components/GameGuide';

interface KillFeedItem {
  id: number;
  message: string;
  timestamp: number;
  type: 'kill' | 'pickup' | 'zone';
}

const BRHUD = () => {
  const health = useGameStore((s) => s.health);
  const score = useGameStore((s) => s.score);
  const gameOver = useGameStore((s) => s.gameOver);
  const started = useGameStore((s) => s.started);
  const paused = useGameStore((s) => s.paused);
  const weapons = useGameStore((s) => s.weapons);
  const activeSlot = useGameStore((s) => s.activeSlot);
  const healthKits = useGameStore((s) => s.healthKits);
  const isReloading = useGameStore((s) => s.isReloading);
  const safeZoneRadius = useGameStore((s) => s.safeZoneRadius);
  const pickupMessage = useGameStore((s) => s.pickupMessage);
  const restart = useGameStore((s) => s.restart);
  const start = useGameStore((s) => s.start);
  const resume = useGameStore((s) => s.resume);
  const quit = useGameStore((s) => s.quit);

  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [damageDirection, setDamageDirection] = useState<'left'|'right'|'front'|'back'|null>(null);
  const [kills, setKills] = useState(0);
  const [timeAlive, setTimeAlive] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [waveAnnounce, setWaveAnnounce] = useState<number | null>(null);

  const wave = useGameStore((s) => s.wave);
  const waveInProgress = useGameStore((s) => s.waveInProgress);
  const prevWaveRef = useRef(1);

  const prevHealthRef = useRef(health);
  const startTimeRef = useRef(Date.now());
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const scoreSubmittedRef = useRef(false);

  const { username, logout } = useAuthStore();
  const isMobile = 'ontouchstart' in window;
  const activeWep = weapons[activeSlot];
  const wepDef = activeWep ? WEAPONS[activeWep.weaponId] : null;

  const formatTime = (s: number) =>
    `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  useEffect(() => {
    const interval = setInterval(() => {}, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (started && !gameOver) {
      setKills(0); setTimeAlive(0); setKillFeed([]);
      startTimeRef.current = Date.now();
    }
  }, [started, gameOver]);

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimeAlive(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  useEffect(() => {
    if (!started) return;
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = 128;
    const scale = s / (MAP_HALF * 2);
    const toX = (wx: number) => (wx + MAP_HALF) * scale;
    const toY = (wz: number) => (wz + MAP_HALF) * scale;
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = 'rgba(5,10,25,0.92)'; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = 'rgba(34,139,34,0.7)';
      TREES.forEach((t) => { const tx=toX(t.pos[0])-(t.trunkRadius*scale)/2,ty=toY(t.pos[2])-(t.trunkRadius*scale)/2; ctx.fillRect(tx,ty,t.trunkRadius*scale,t.trunkRadius*scale); });
      ctx.fillStyle = 'rgba(80,80,80,0.7)';
      ROCKS.forEach((r) => { const rx=toX(r.pos[0])-(r.size[0]*scale)/2,ry=toY(r.pos[2])-(r.size[2]*scale)/2; ctx.fillRect(rx,ry,r.size[0]*scale,r.size[2]*scale); });
      const szr = useGameStore.getState().safeZoneRadius;
      ctx.strokeStyle='rgba(255,217,61,0.85)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(s/2,s/2,szr*scale,0,Math.PI*2); ctx.stroke();
      minimapData.loot.forEach((l) => { ctx.fillStyle=l.type==='weapon'?'#cc00ff':l.type==='ammo'?'#ffcc00':'#00ff88'; ctx.fillRect(toX(l.x)-2,toY(l.z)-2,4,4); });
      ctx.fillStyle='#ff3333';
      minimapData.enemies.forEach((e) => { ctx.fillRect(toX(e.x)-2,toY(e.z)-2,4,4); });
      const px=toX(playerState.x),py=toY(playerState.z);
      ctx.fillStyle='#00ffff'; ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#00ffff'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+playerState.forwardX*8,py+playerState.forwardZ*8); ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [started]);

  useEffect(() => {
    if (health < prevHealthRef.current && health > 0) {
      setDamageFlash(true);
      const damage = Math.ceil(prevHealthRef.current - health);
      const dirs: Array<'left'|'right'|'front'|'back'> = ['left','right','front','back'];
      const dir = dirs[Math.floor(Math.random()*dirs.length)];
      setDamageDirection(dir);
      setKillFeed(prev => [{ id:Date.now(), message:`-${damage} HP`, timestamp:Date.now(), type:'kill' }, ...prev.slice(0,4)]);
      setTimeout(() => { setDamageFlash(false); setDamageDirection(null); }, 800);
    }
    prevHealthRef.current = health;
  }, [health]);

  useEffect(() => {
    if (pickupMessage) setKillFeed(prev => [{ id:Date.now(), message:pickupMessage, timestamp:Date.now(), type:'pickup' }, ...prev.slice(0,4)]);
  }, [pickupMessage]);

  useEffect(() => {
    if (safeZoneRadius < 20) setKillFeed(prev => [{ id:Date.now(), message:`⚠ ZONE ${Math.round(safeZoneRadius)}m`, timestamp:Date.now(), type:'zone' }, ...prev.slice(0,4)]);
  }, [safeZoneRadius]);

  useEffect(() => {
    const handler = () => {
      setKills(p => p+1);
      setKillFeed(prev => [{ id:Date.now(), message:'🎯 ELIMINATED +100', timestamp:Date.now(), type:'kill' }, ...prev.slice(0,4)]);
    };
    window.addEventListener('enemyKill', handler as EventListener);
    return () => window.removeEventListener('enemyKill', handler as EventListener);
  }, []);

  // Wave announcement
  useEffect(() => {
    if (wave !== prevWaveRef.current && waveInProgress) {
      prevWaveRef.current = wave;
      setWaveAnnounce(wave);
      const t = setTimeout(() => setWaveAnnounce(null), 3000);
      return () => clearTimeout(t);
    }
  }, [wave, waveInProgress]);

  useEffect(() => {
    if (gameOver && !scoreSubmittedRef.current) {      scoreSubmittedRef.current = true;
      setScoreSubmitted(false);
      scoresApi.submit(score, kills, timeAlive).catch(()=>{}).finally(()=>setScoreSubmitted(true));
    }
    if (!gameOver) { scoreSubmittedRef.current = false; setScoreSubmitted(false); }
  }, [gameOver, score, kills, timeAlive]);

  if (!started) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(10,20,55,1) 0%, rgba(4,5,18,1) 100%)' }}>
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage:'linear-gradient(rgba(100,200,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(100,200,255,0.5) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 blur-3xl pointer-events-none rounded-full"
            style={{ background:'radial-gradient(ellipse,rgba(100,200,255,1),transparent)' }} />
          <div className="relative text-center w-full max-w-lg">
            <div className="mb-6">
              <div className="text-5xl sm:text-7xl font-black tracking-tight leading-none"
                style={{ background:'linear-gradient(135deg,#64c8ff 0%,#a855f7 50%,#ec4899 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 30px rgba(100,200,255,0.35))' }}>
                BULLET BUDDY
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-[0.5em] mt-1"
                style={{ background:'linear-gradient(135deg,#f97316,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 15px rgba(249,115,22,0.4))' }}>
                ARENA
              </div>
              <div className="h-0.5 w-48 mx-auto mt-3 rounded-full"
                style={{ background:'linear-gradient(90deg,transparent,#64c8ff,#a855f7,transparent)' }} />
            </div>
            <div className="rounded-2xl overflow-hidden mb-5"
              style={{ background:'linear-gradient(135deg,rgba(15,20,50,0.9),rgba(10,12,35,0.95))', border:'1px solid rgba(100,200,255,0.12)' }}>
              <div className="h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(100,200,255,0.4),transparent)' }} />
              <div className="grid grid-cols-2 divide-x divide-white/5 p-4 sm:p-5">
                {[
                  { title:'🎮 CONTROLS', color:'#64c8ff', items:[['MOVE','WASD'],['AIM','MOUSE'],['SHOOT','CLICK'],['JUMP','SPACE'],['SPRINT','SHIFT']] },
                  { title:'⚔️ COMBAT', color:'#fbbf24', items:[['WEAPONS','1 / 2'],['RELOAD','R'],['HEAL','H'],['INVENTORY','I']] },
                ].map(({ title, color, items }) => (
                  <div key={title} className="px-3 sm:px-4 text-left">
                    <div className="text-xs font-black tracking-widest mb-3" style={{ color }}>{title}</div>
                    <div className="space-y-1.5">
                      {items.map(([k,v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 tracking-wider">{k}</span>
                          <span className="text-xs font-bold text-white px-2 py-0.5 rounded"
                            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => {
                const isNew = localStorage.getItem('bb_new_user') === 'true';
                if (isNew) { setShowGuide(true); return; }
                start(); startTimeRef.current=Date.now(); if(!isMobile) document.querySelector('canvas')?.requestPointerLock();
              }}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-widest transition-all duration-300 hover:scale-105 mb-4"
              style={{ background:'linear-gradient(135deg,rgba(100,200,255,0.2),rgba(168,85,247,0.2))', border:'2px solid rgba(100,200,255,0.45)', color:'#64c8ff', boxShadow:'0 0 40px rgba(100,200,255,0.2)' }}>
              ⚡ DEPLOY TO BATTLE
            </button>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background:'rgba(100,200,255,0.06)', border:'1px solid rgba(100,200,255,0.12)' }}>
                <span className="text-xs font-black" style={{ color:'#64c8ff' }}>👤 {username}</span>
                <span className="text-gray-700">|</span>
                <button onClick={logout} className="text-xs font-bold text-gray-600 hover:text-red-400 transition-colors tracking-wider">LOGOUT</button>
              </div>
              <button onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs tracking-widest transition-all hover:scale-105"
                style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', color:'#fbbf24', boxShadow:'0 0 20px rgba(251,191,36,0.1)' }}>
                🏆 LEADERBOARD
              </button>
            </div>
            <div className="mt-3 text-xs font-black tracking-widest animate-pulse" style={{ color:'rgba(251,191,36,0.6)' }}>
              ⚠️ SAFE ZONE SHRINKS EVERY 45s
            </div>
          </div>
        </div>
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
        {showGuide && (
          <GameGuide onFinish={() => {
            setShowGuide(false);
            start();
            startTimeRef.current = Date.now();
            if (!isMobile) setTimeout(() => document.querySelector('canvas')?.requestPointerLock(), 100);
          }} />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none">

      {/* DAMAGE FLASH */}
      {damageFlash && (
        <div className="absolute inset-0 pointer-events-none z-50"
          style={{ background:'radial-gradient(ellipse at center,rgba(255,30,30,0.4) 0%,rgba(255,0,0,0.06) 70%,transparent 100%)', animation:'damage-flash 0.3s ease-out' }} />
      )}

      {/* DAMAGE DIRECTION */}
      {damageDirection==='left' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-48 pointer-events-none" style={{ background:'linear-gradient(90deg,rgba(255,30,30,0.7),transparent)', borderRight:'2px solid rgba(255,60,60,0.9)' }} />}
      {damageDirection==='right' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-48 pointer-events-none" style={{ background:'linear-gradient(270deg,rgba(255,30,30,0.7),transparent)', borderLeft:'2px solid rgba(255,60,60,0.9)' }} />}
      {damageDirection==='front' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none" style={{ background:'linear-gradient(180deg,rgba(255,30,30,0.7),transparent)', borderBottom:'2px solid rgba(255,60,60,0.9)' }} />}
      {damageDirection==='back' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none" style={{ background:'linear-gradient(0deg,rgba(255,30,30,0.7),transparent)', borderTop:'2px solid rgba(255,60,60,0.9)' }} />}

      {/* CROSSHAIR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <line x1="18" y1="2" x2="18" y2="11" stroke="rgba(0,240,200,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18" y1="25" x2="18" y2="34" stroke="rgba(0,240,200,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2" y1="18" x2="11" y2="18" stroke="rgba(0,240,200,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="25" y1="18" x2="34" y2="18" stroke="rgba(0,240,200,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="18" cy="18" r="1.8" fill="rgba(0,240,200,0.85)"/>
        </svg>
      </div>

      {/* TOP LEFT — HEALTH */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4" style={{ minWidth:165 }}>
        <div className="rounded-xl p-3" style={{ background:'rgba(0,0,0,0.62)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(14px)' }}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-black tracking-[0.2em]" style={{ color:'rgba(255,255,255,0.35)' }}>HEALTH</span>
            <span className="text-sm font-black tabular-nums" style={{ color:health<=25?'#f87171':'#fff' }}>{Math.ceil(health)}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background:'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width:`${Math.max(0,health)}%`, background:health>50?'linear-gradient(90deg,#16a34a,#4ade80)':health>25?'linear-gradient(90deg,#d97706,#fbbf24)':'linear-gradient(90deg,#dc2626,#f87171)', boxShadow:health<=25?'0 0 8px rgba(248,113,113,0.8)':'0 0 5px rgba(74,222,128,0.5)' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.2em]" style={{ color:'rgba(255,255,255,0.3)' }}>MEDKIT</span>
            <div className="flex gap-1">
              {Array.from({length:5}).map((_,i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm transition-all"
                  style={{ background:i<healthKits?'#4ade80':'rgba(255,255,255,0.07)', boxShadow:i<healthKits?'0 0 4px rgba(74,222,128,0.7)':'none' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOP CENTER — SCORE / TIME / KILLS / WAVE */}
      <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2">
        <div className="flex rounded-xl overflow-hidden"
          style={{ background:'rgba(0,0,0,0.62)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(14px)' }}>
          {[
            { label:'SCORE', value:score.toLocaleString(), color:'#64c8ff' },
            { label:'TIME',  value:formatTime(timeAlive),  color:'#ffffff' },
            { label:'KILLS', value:String(kills),          color:'#f87171' },
            { label:'WAVE',  value:String(wave),           color:'#fbbf24' },
          ].map(({ label, value, color }, i) => (
            <div key={label} className="px-3 sm:px-4 py-2 text-center"
              style={{ borderLeft:i>0?'1px solid rgba(255,255,255,0.06)':'none' }}>
              <div className="text-[9px] font-black tracking-[0.2em] mb-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{label}</div>
              <div className="text-base sm:text-xl font-black tabular-nums" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP RIGHT — KILL FEED */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-44 sm:w-56 space-y-1">
        {killFeed.slice(0,4).map((item) => (
          <div key={item.id} className="px-2.5 py-1.5 rounded-lg text-xs font-bold kill-feed-item truncate"
            style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(10px)', borderLeft:`3px solid ${item.type==='kill'?'#f87171':item.type==='pickup'?'#4ade80':'#fbbf24'}`, color:item.type==='kill'?'#fca5a5':item.type==='pickup'?'#86efac':'#fde68a' }}>
            {item.message}
          </div>
        ))}
      </div>

      {/* BOTTOM LEFT — WEAPON */}
      <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-4">
        <div className="rounded-xl overflow-hidden" style={{ background:'rgba(0,0,0,0.68)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(14px)' }}>
          {wepDef && activeWep ? (
            <div className="px-3 sm:px-4 py-3">
              <div className="text-[9px] font-black tracking-[0.2em] mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>WEAPON</div>
              <div className="text-lg sm:text-2xl font-black tracking-wide mb-2" style={{ color:wepDef.color, textShadow:`0 0 14px ${wepDef.color}55` }}>{wepDef.name}</div>
              <div className="flex items-end gap-1.5 mb-1.5">
                <span className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
                  style={{ color:isReloading?'#fbbf24':activeWep.ammo<=wepDef.maxAmmo*0.3?'#f87171':'#fff' }}>
                  {isReloading?'RLD':activeWep.ammo}
                </span>
                {!isReloading && <span className="text-sm font-bold mb-0.5" style={{ color:'rgba(255,255,255,0.25)' }}>/ {wepDef.maxAmmo}</span>}
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)', width:110 }}>
                <div className="h-full rounded-full transition-all duration-200"
                  style={{ width:isReloading?'100%':`${(activeWep.ammo/wepDef.maxAmmo)*100}%`, background:isReloading?'#fbbf24':activeWep.ammo<=wepDef.maxAmmo*0.3?'#ef4444':wepDef.color }} />
              </div>
              <div className="mt-1.5 text-[9px] tracking-widest" style={{ color:'rgba(255,255,255,0.18)' }}>
                DMG {wepDef.damage} · RPM {Math.round(60/wepDef.fireRate)}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm font-black tracking-widest" style={{ color:'rgba(255,255,255,0.2)' }}>NO WEAPON</div>
          )}
        </div>
      </div>

      {/* BOTTOM RIGHT — MINIMAP */}
      <div className="absolute bottom-3 sm:bottom-5 right-3 sm:right-4">
        <div className="rounded-xl overflow-hidden"
          style={{ border:'1px solid rgba(100,200,255,0.18)', boxShadow:'0 0 20px rgba(100,200,255,0.07)', background:'rgba(0,0,0,0.55)' }}>
          <div className="flex items-center justify-between px-2 py-1"
            style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[9px] font-black tracking-widest" style={{ color:'rgba(100,200,255,0.5)' }}>MAP</span>
            <span className="text-[9px] font-black tabular-nums" style={{ color:safeZoneRadius<20?'#f87171':'#64c8ff' }}>
              ZONE {Math.round(safeZoneRadius)}m
            </span>
          </div>
          <canvas ref={minimapCanvasRef} width={128} height={128} className="block w-24 h-24 sm:w-32 sm:h-32" />
        </div>
      </div>

      {/* PICKUP MESSAGE */}
      {pickupMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-16 pointer-events-none">
          <div className="px-4 py-2 rounded-xl text-xs font-black tracking-widest animate-pickup-pulse"
            style={{ background:'rgba(0,0,0,0.75)', border:'1px solid rgba(74,222,128,0.4)', color:'#4ade80', backdropFilter:'blur(8px)' }}>
            ✦ {pickupMessage}
          </div>
        </div>
      )}

      {/* WAVE ANNOUNCEMENT */}
      {waveAnnounce !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-center" style={{ animation: 'waveAnnounce 3s ease-out forwards' }}>
            <div className="text-xs font-black tracking-[0.4em] mb-1" style={{ color: 'rgba(251,191,36,0.7)' }}>
              INCOMING
            </div>
            <div className="text-6xl sm:text-8xl font-black tracking-widest"
              style={{ color: '#fbbf24', textShadow: '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4)' }}>
              WAVE {waveAnnounce}
            </div>
            <div className="text-sm font-black tracking-widest mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {3 + (waveAnnounce - 1) * 2} ENEMIES
            </div>
          </div>
        </div>
      )}

      {/* BETWEEN WAVES — PREP BANNER */}
      {!waveInProgress && !gameOver && started && (
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-5 py-2 rounded-xl text-xs font-black tracking-widest"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', backdropFilter: 'blur(8px)' }}>
            ⏳ NEXT WAVE INCOMING...
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="absolute inset-0 pointer-events-auto">
          <Scoreboard currentScore={score} kills={kills} timeAlive={timeAlive} scoreSubmitted={scoreSubmitted}
            onPlayAgain={() => { restart(); setKills(0); setTimeAlive(0); startTimeRef.current=Date.now(); if(!isMobile) setTimeout(()=>document.querySelector('canvas')?.requestPointerLock(),100); }}
            onQuit={() => { quit(); setKills(0); setTimeAlive(0); startTimeRef.current=Date.now(); document.exitPointerLock(); }}
          />
        </div>
      )}

      {/* PAUSE MENU */}
      {paused && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          style={{ background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)' }}>
          <div className="w-full max-w-xs mx-4">
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'linear-gradient(160deg,rgba(10,15,40,0.99),rgba(6,8,22,0.99))', border:'1px solid rgba(100,200,255,0.14)', boxShadow:'0 0 60px rgba(0,0,0,0.9)' }}>
              <div className="h-0.5" style={{ background:'linear-gradient(90deg,transparent,#64c8ff,transparent)' }} />
              <div className="p-6 text-center">
                <div className="text-3xl font-black tracking-[0.3em] mb-1" style={{ color:'#64c8ff', textShadow:'0 0 20px rgba(100,200,255,0.4)' }}>PAUSED</div>
                <div className="text-[10px] tracking-[0.3em] mb-6" style={{ color:'rgba(255,255,255,0.2)' }}>GAME IS PAUSED</div>
                <div className="space-y-2.5">
                  <button onClick={() => { resume(); if(!isMobile) setTimeout(()=>document.querySelector('canvas')?.requestPointerLock(),100); }}
                    className="w-full py-3 rounded-xl font-black text-sm tracking-widest transition-all hover:scale-105"
                    style={{ background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80' }}>
                    ▶ RESUME
                  </button>
                  <button onClick={() => { quit(); setKills(0); setTimeAlive(0); startTimeRef.current=Date.now(); document.exitPointerLock(); }}
                    className="w-full py-3 rounded-xl font-black text-sm tracking-widest transition-all hover:scale-105"
                    style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.28)', color:'#f87171' }}>
                    ✕ QUIT TO MENU
                  </button>
                </div>
                <div className="mt-4 text-[10px] tracking-[0.25em]" style={{ color:'rgba(255,255,255,0.18)' }}>ESC TO RESUME</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BRHUD;
