import { useEffect, useState } from 'react';
import { scoresApi, type ScoreEntry } from '@/lib/api';

interface Props {
  currentScore: number;
  kills: number;
  timeAlive: number;
  onPlayAgain: () => void;
  onQuit: () => void;
  scoreSubmitted: boolean;
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const rankStyle = (i: number) => {
  if (i === 0) return { icon: '🥇', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' };
  if (i === 1) return { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.2)' };
  if (i === 2) return { icon: '🥉', color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' };
  return { icon: `${i + 1}`, color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)' };
};

const Scoreboard = ({ currentScore, kills, timeAlive, onPlayAgain, onQuit, scoreSubmitted }: Props) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scoreSubmitted) return;
    setLoading(true);
    scoresApi.getTop()
      .then((res) => setScores(res.data))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [scoreSubmitted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(80,0,0,0.9) 0%, rgba(5,5,20,0.98) 100%)' }}>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }} />

      <div className="relative w-full max-w-lg">
        {/* Game Over title */}
        <div className="text-center mb-5">
          <h1 className="text-5xl sm:text-6xl font-black tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.6))',
            }}>
            GAME OVER
          </h1>
          <div className="h-0.5 w-32 mx-auto mt-2 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />
        </div>

        {/* Stats card */}
        <div className="rounded-2xl overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,50,0.95), rgba(10,12,35,0.98))',
            border: '1px solid rgba(100,200,255,0.15)',
            boxShadow: '0 0 40px rgba(100,200,255,0.05)',
          }}>
          <div className="h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #64c8ff, transparent)' }} />
          <div className="grid grid-cols-3 divide-x divide-white/5 p-4">
            {[
              { label: 'SCORE', value: currentScore.toLocaleString(), color: '#64c8ff' },
              { label: 'KILLS', value: kills, color: '#f87171' },
              { label: 'SURVIVED', value: formatTime(timeAlive), color: '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center px-2">
                <div className="text-xs font-black tracking-widest text-gray-500 mb-1">{label}</div>
                <div className="text-2xl sm:text-3xl font-black" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard card */}
        <div className="rounded-2xl overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(160deg, rgba(12,18,45,0.99), rgba(8,10,28,0.99))',
            border: '1px solid rgba(251,191,36,0.15)',
            boxShadow: '0 0 40px rgba(251,191,36,0.05)',
          }}>
          <div className="h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />
          <div className="p-4">
            <h2 className="text-sm font-black tracking-widest text-center mb-3"
              style={{ color: '#fbbf24' }}>🏆 LEADERBOARD</h2>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-3 mb-2 text-xs font-black tracking-widest text-gray-600">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-5">PLAYER</span>
              <span className="col-span-2 text-right">SCORE</span>
              <span className="col-span-2 text-right">KILLS</span>
              <span className="col-span-2 text-right">TIME</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,200,255,0.2) transparent' }}>
              {loading ? (
                <div className="text-center py-6 text-gray-500 text-sm animate-pulse tracking-wider">SAVING SCORE...</div>
              ) : scores.length === 0 ? (
                <div className="text-center py-6 text-gray-600 text-sm">NO SCORES YET</div>
              ) : scores.map((s, i) => {
                const r = rankStyle(i);
                const isMe = s.score === currentScore && s.kills === kills;
                return (
                  <div key={s._id}
                    className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: isMe ? 'rgba(100,200,255,0.12)' : r.bg,
                      border: `1px solid ${isMe ? 'rgba(100,200,255,0.4)' : r.border}`,
                    }}>
                    <span className="col-span-1 text-center text-sm font-black" style={{ color: r.color }}>{r.icon}</span>
                    <span className="col-span-5 font-bold text-sm text-white truncate">
                      {s.username}{isMe && <span className="text-xs text-cyan-400 ml-1">◀ YOU</span>}
                    </span>
                    <span className="col-span-2 text-right font-black text-sm" style={{ color: '#64c8ff' }}>{s.score.toLocaleString()}</span>
                    <span className="col-span-2 text-right text-xs font-bold text-gray-400">{s.kills}</span>
                    <span className="col-span-2 text-right text-xs text-gray-500">{formatTime(s.timeAlive)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onPlayAgain}
            className="py-3.5 rounded-xl font-black text-sm tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(100,200,255,0.2), rgba(168,85,247,0.2))',
              border: '1px solid rgba(100,200,255,0.4)',
              color: '#64c8ff',
              boxShadow: '0 0 25px rgba(100,200,255,0.15)',
            }}>
            ▶ PLAY AGAIN
          </button>
          <button onClick={onQuit}
            className="py-3.5 rounded-xl font-black text-sm tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.15))',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
              boxShadow: '0 0 25px rgba(239,68,68,0.1)',
            }}>
            ✕ QUIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
