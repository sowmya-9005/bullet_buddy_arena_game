import { useEffect, useState } from 'react';
import { scoresApi, type ScoreEntry } from '@/lib/api';

const formatTime = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const rankStyle = (i: number) => {
  if (i === 0) return { icon: '🥇', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' };
  if (i === 1) return { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.2)' };
  if (i === 2) return { icon: '🥉', color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' };
  return { icon: `${i + 1}`, color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)' };
};

interface Props { onClose: () => void; }

const LeaderboardModal = ({ onClose }: Props) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scoresApi.getTop()
      .then((res) => setScores(res.data))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(12,18,45,0.99), rgba(8,10,28,0.99))',
            border: '1px solid rgba(100,200,255,0.2)',
            boxShadow: '0 0 80px rgba(100,200,255,0.1), 0 30px 60px rgba(0,0,0,0.7)',
          }}>

          {/* Top bar */}
          <div className="h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, #f97316, transparent)' }} />

          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black tracking-widest"
                  style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
                  🏆 LEADERBOARD
                </h2>
                <p className="text-xs text-gray-600 mt-0.5 tracking-wider">TOP PLAYERS — ALL TIME</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                ✕
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-3 mb-2 text-xs font-black tracking-widest text-gray-600">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-5">PLAYER</span>
              <span className="col-span-2 text-right">SCORE</span>
              <span className="col-span-2 text-right">KILLS</span>
              <span className="col-span-2 text-right">TIME</span>
            </div>

            {/* Rows */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,200,255,0.2) transparent' }}>
              {loading ? (
                <div className="text-center py-10">
                  <div className="text-2xl mb-2 animate-spin inline-block">⚙️</div>
                  <p className="text-gray-500 text-sm tracking-wider">LOADING...</p>
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-gray-500 text-sm tracking-wider">NO SCORES YET</p>
                  <p className="text-gray-700 text-xs mt-1">BE THE FIRST TO PLAY!</p>
                </div>
              ) : scores.map((s, i) => {
                const r = rankStyle(i);
                return (
                  <div key={s._id}
                    className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl transition-all duration-200"
                    style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                    <span className="col-span-1 text-center text-sm font-black" style={{ color: r.color }}>
                      {r.icon}
                    </span>
                    <span className="col-span-5 font-bold text-sm text-white truncate">{s.username}</span>
                    <span className="col-span-2 text-right font-black text-sm"
                      style={{ color: '#64c8ff' }}>{s.score.toLocaleString()}</span>
                    <span className="col-span-2 text-right text-xs font-bold text-gray-400">{s.kills}</span>
                    <span className="col-span-2 text-right text-xs text-gray-500">{formatTime(s.timeAlive)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)' }} />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
