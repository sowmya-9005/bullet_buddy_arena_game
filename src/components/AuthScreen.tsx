import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, error, loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') await login(username, password);
    else await signup(username, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(15,25,60,1) 0%, rgba(5,5,20,1) 100%)' }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(100,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(100,200,255,1), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(180,100,255,1), transparent)' }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-2">
            <div className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #64c8ff, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(100,200,255,0.4))',
              }}>
              BULLET
            </div>
            <div className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.4))',
              }}>
              BUDDY
            </div>
            <div className="text-lg font-black tracking-[0.4em] text-gray-400 mt-1">ARENA</div>
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,50,0.95), rgba(10,12,35,0.98))',
            border: '1px solid rgba(100,200,255,0.2)',
            boxShadow: '0 0 60px rgba(100,200,255,0.08), 0 25px 50px rgba(0,0,0,0.6)',
          }}>

          {/* Top accent line */}
          <div className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #64c8ff, #a855f7, transparent)' }} />

          <div className="p-6 sm:p-8">
            {/* Tab switcher */}
            <div className="flex mb-6 rounded-xl overflow-hidden p-1"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['login', 'signup'] as const).map((m) => (
                <button key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2.5 text-xs font-black tracking-widest rounded-lg transition-all duration-300"
                  style={mode === m ? {
                    background: 'linear-gradient(135deg, rgba(100,200,255,0.2), rgba(168,85,247,0.2))',
                    color: '#64c8ff',
                    boxShadow: '0 0 20px rgba(100,200,255,0.15)',
                    border: '1px solid rgba(100,200,255,0.3)',
                  } : { color: 'rgba(255,255,255,0.3)' }}>
                  {m === 'login' ? '⚡ LOGIN' : '🎮 SIGN UP'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-black tracking-widest mb-2"
                  style={{ color: 'rgba(100,200,255,0.7)' }}>USERNAME</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">👤</span>
                  <input
                    type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required autoComplete="username"
                    placeholder="Enter your callsign"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(100,200,255,0.15)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(100,200,255,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(100,200,255,0.15)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black tracking-widest mb-2"
                  style={{ color: 'rgba(100,200,255,0.7)' }}>PASSWORD</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔒</span>
                  <input
                    type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(100,200,255,0.15)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(100,200,255,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(100,200,255,0.15)'}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading ? 'rgba(100,200,255,0.1)' : 'linear-gradient(135deg, rgba(100,200,255,0.25), rgba(168,85,247,0.25))',
                  border: '1px solid rgba(100,200,255,0.4)',
                  color: '#64c8ff',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(100,200,255,0.2)',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = '0 0 40px rgba(100,200,255,0.35)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.boxShadow = '0 0 30px rgba(100,200,255,0.2)')}>
                {loading ? '⏳ LOADING...' : mode === 'login' ? '⚡ ENTER BATTLE' : '🚀 CREATE ACCOUNT'}
              </button>
            </form>
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)' }} />
        </div>

        <p className="text-center text-xs text-gray-700 mt-4 tracking-wider">
          BULLET BUDDY ARENA © 2024
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
