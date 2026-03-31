import { useState } from 'react';

interface Props {
  onFinish: () => void;
}

const steps = [
  {
    title: 'WELCOME, SOLDIER',
    icon: '🎖️',
    color: '#64c8ff',
    desc: 'You\'ve been deployed into Bullet Buddy Arena — a battle royale where only the last one standing wins. Here\'s everything you need to survive.',
    tips: [],
  },
  {
    title: 'MOVEMENT',
    icon: '🏃',
    color: '#4ade80',
    desc: 'Move around the map to find loot, avoid enemies, and stay inside the safe zone.',
    tips: [
      { key: 'W A S D', label: 'Move forward / left / back / right' },
      { key: 'SHIFT', label: 'Sprint (faster movement)' },
      { key: 'SPACE', label: 'Jump' },
      { key: 'C', label: 'Crouch (lower profile)' },
    ],
  },
  {
    title: 'COMBAT',
    icon: '🔫',
    color: '#f87171',
    desc: 'Aim with your mouse and eliminate enemies before they get you. Watch your ammo.',
    tips: [
      { key: 'MOUSE', label: 'Aim / look around' },
      { key: 'CLICK', label: 'Shoot' },
      { key: 'R', label: 'Reload weapon' },
      { key: '1 / 2', label: 'Switch weapon slots' },
    ],
  },
  {
    title: 'SURVIVAL',
    icon: '💊',
    color: '#fbbf24',
    desc: 'Keep your health up by using medkits. The safe zone shrinks every 45 seconds — stay inside or take damage.',
    tips: [
      { key: 'H', label: 'Use medkit (heals +30 HP)' },
      { key: 'I / TAB', label: 'Open inventory' },
      { key: 'ESC', label: 'Pause game' },
    ],
  },
  {
    title: 'LOOT',
    icon: '📦',
    color: '#a855f7',
    desc: 'Glowing items spawn across the map. Walk over them to pick up weapons, ammo, and health kits automatically.',
    tips: [
      { key: '🔵 BLUE', label: 'Weapon pickup' },
      { key: '🟡 YELLOW', label: 'Ammo box' },
      { key: '🟢 GREEN', label: 'Health kit' },
    ],
  },
  {
    title: 'READY TO DEPLOY',
    icon: '⚡',
    color: '#64c8ff',
    desc: 'You\'re all set. Eliminate enemies, collect loot, survive the zone, and climb the leaderboard. Good luck, soldier.',
    tips: [],
  },
];

const GameGuide = ({ onFinish }: Props) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleFinish = () => {
    localStorage.removeItem('bb_new_user');
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>

      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-5">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8, height: 8,
                background: i === step ? current.color : i < step ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
              }} />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(10,15,40,0.99), rgba(6,8,22,0.99))',
            border: `1px solid ${current.color}30`,
            boxShadow: `0 0 60px ${current.color}15, 0 30px 60px rgba(0,0,0,0.8)`,
          }}>
          <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }} />

          <div className="p-6 sm:p-8">
            {/* Icon + title */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">{current.icon}</div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest"
                style={{ color: current.color, textShadow: `0 0 20px ${current.color}50` }}>
                {current.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 text-center leading-relaxed mb-5">
              {current.desc}
            </p>

            {/* Tips */}
            {current.tips.length > 0 && (
              <div className="space-y-2 mb-5">
                {current.tips.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="font-black text-xs px-2 py-1 rounded-lg min-w-fit"
                      style={{ background: `${current.color}20`, border: `1px solid ${current.color}40`, color: current.color }}>
                      {key}
                    </span>
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {/* Skip */}
              <button onClick={handleFinish}
                className="px-4 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                SKIP
              </button>

              {/* Next / Deploy */}
              <button
                onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl font-black text-sm tracking-widest transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${current.color}25, ${current.color}15)`,
                  border: `1px solid ${current.color}50`,
                  color: current.color,
                  boxShadow: `0 0 25px ${current.color}20`,
                }}>
                {isLast ? '⚡ DEPLOY TO BATTLE' : `NEXT  ${step + 1} / ${steps.length}`}
              </button>
            </div>
          </div>

          <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${current.color}40, transparent)` }} />
        </div>
      </div>
    </div>
  );
};

export default GameGuide;
