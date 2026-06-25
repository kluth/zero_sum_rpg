# UI Overhaul: Animations & Effects

This document contains the interaction designs and microanimations for the Zero Sum RPG UI, specifically focusing on glitch effects, skill atrophy (forgetting), and in-universe bad reception loading screens.

## 1. Glitch Effects

Glitch effects are used to indicate system instability, hacking, or corrupted data.

### CSS Keyframes

```css
/* Glitch Animation */
@keyframes glitch-anim-1 {
  0% { clip: rect(20px, 9999px, 85px, 0); transform: translate(0); }
  10% { clip: rect(65px, 9999px, 15px, 0); transform: translate(-2px, 2px); }
  20% { clip: rect(10px, 9999px, 90px, 0); transform: translate(2px, -2px); }
  30% { clip: rect(80px, 9999px, 45px, 0); transform: translate(-2px, 2px); }
  40% { clip: rect(35px, 9999px, 5px, 0); transform: translate(2px, -2px); }
  50% { clip: rect(50px, 9999px, 100px, 0); transform: translate(-2px, 2px); }
  60% { clip: rect(95px, 9999px, 25px, 0); transform: translate(2px, -2px); }
  70% { clip: rect(15px, 9999px, 75px, 0); transform: translate(-2px, 2px); }
  80% { clip: rect(70px, 9999px, 35px, 0); transform: translate(2px, -2px); }
  90% { clip: rect(25px, 9999px, 95px, 0); transform: translate(-2px, 2px); }
  100% { clip: rect(100px, 9999px, 50px, 0); transform: translate(0); }
}

.glitch-text {
  position: relative;
  display: inline-block;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #ff00c1;
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
  animation: glitch-anim-1 3s infinite linear alternate-reverse;
}
```

### TypeScript Logic

```typescript
import { useState, useEffect } from 'react';

export const useGlitchEffect = (intensity: number = 1) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200 * intensity);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.1 * intensity) {
        triggerGlitch();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [intensity]);

  return isGlitching;
};
```

## 2. Fade-Outs for "Forgetting" (Skill Atrophy)

To visually represent a character losing a skill over time or forgetting information, the text slowly dissipates into static and fades out.

### CSS Keyframes

```css
@keyframes atrophy-fade {
  0% {
    opacity: 1;
    filter: blur(0px) contrast(1);
    letter-spacing: normal;
  }
  50% {
    opacity: 0.7;
    filter: blur(1px) contrast(1.2);
    letter-spacing: 2px;
  }
  100% {
    opacity: 0;
    filter: blur(3px) contrast(0.8) grayscale(100%);
    letter-spacing: 5px;
    transform: translateY(-5px);
  }
}

.skill-atrophy {
  animation: atrophy-fade 4s ease-in forwards;
  color: #a0a0a0;
  text-shadow: 0 0 5px rgba(160, 160, 160, 0.5);
}
```

### TypeScript Logic

```typescript
import { useState, useEffect } from 'react';

interface SkillAtrophyProps {
  skillName: string;
  isForgetting: boolean;
  onForgetComplete?: () => void;
}

export const SkillAtrophyElement = ({ skillName, isForgetting, onForgetComplete }: SkillAtrophyProps) => {
  const [renderState, setRenderState] = useState<'normal' | 'atrophying' | 'forgotten'>('normal');

  useEffect(() => {
    if (isForgetting && renderState === 'normal') {
      setRenderState('atrophying');
      
      const timer = setTimeout(() => {
        setRenderState('forgotten');
        if (onForgetComplete) onForgetComplete();
      }, 4000); // Matches CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isForgetting, renderState, onForgetComplete]);

  if (renderState === 'forgotten') return null;

  return (
    <div className={renderState === 'atrophying' ? 'skill-atrophy' : ''}>
      {skillName}
    </div>
  );
};
```

## 3. Loading Animations: In-Universe Bad Reception

Simulates connecting to a weak neural-link or low-orbit satellite. It incorporates noise, stuttering progress bars, and terminal-like connection logs.

### CSS Keyframes

```css
@keyframes static-noise {
  0%, 100% { background-position: 0 0; }
  10% { background-position: -5% -10%; }
  20% { background-position: -15% 5%; }
  30% { background-position: 7% -25%; }
  40% { background-position: 20% 25%; }
  50% { background-position: -25% 10%; }
  60% { background-position: 15% 5%; }
  70% { background-position: 0% 15%; }
  80% { background-position: 25% 35%; }
  90% { background-position: -10% 10%; }
}

@keyframes signal-flicker {
  0% { opacity: 1; }
  15% { opacity: 0.3; }
  20% { opacity: 1; }
  45% { opacity: 1; }
  50% { opacity: 0.1; }
  55% { opacity: 0.8; }
  100% { opacity: 1; }
}

.reception-loader-container {
  position: relative;
  overflow: hidden;
  background-color: #050505;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
}

.reception-noise-overlay {
  position: absolute;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  width: 200%; height: 200%;
  background: transparent url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAMDAwYGBglJSVAQEBoaGjAwMCHM8kQAAAACHRSTlMA////////9/n+7c8AAAEGSURBVDjLpZTbUcMwDIWTVLCA9z/TwQ3oxM7+q8mO3+aD/1j6qR9J1n/W8eH9lYmZt8g+L0T4M7wBwT8I/kHwD4J/EPyD4B8E/yD4B8E/CP5B8A+CfxD8g+AfBP8g+AfBPwj+QfAPgn8Q/IPgHwT/IPgHwT8I/kHwD4J/EPyD4B8E/yD4B8E/CP5B8A+CfxD8g+AfBP8g+AfBPwj+QfAPgn8Q/IPgHwT/IPgHwT8I/kHwD4J/EPyD4B8E/yD4B8E/CP5B8A+CfxD8g+AfBP8g+AfBPwj+QfAPgn8Q/IPgHwT/IPgHwT8I/kHwD4J/EPyD4B8E/yD4B8E/yP433l8G8Q2vV6F7oAAAAABJRU5ErkJggg==') repeat;
  animation: static-noise 0.5s infinite;
  opacity: 0.15;
  pointer-events: none;
}

.signal-text {
  animation: signal-flicker 3s infinite;
}
```

### TypeScript Logic

```typescript
import { useState, useEffect } from 'react';

export const BadReceptionLoader = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('CONNECTING...');

  useEffect(() => {
    const statuses = [
      'ESTABLISHING HANDSHAKE...',
      'SIGNAL WEAK...',
      'REROUTING CONNECTION...',
      'DECRYPTING PACKETS...',
      'CONNECTION SECURED.'
    ];

    let currentProgress = 0;
    
    const interval = setInterval(() => {
      // Simulate stuttering progress
      const jump = Math.random() > 0.7 ? Math.random() * 15 : Math.random() * 2;
      currentProgress = Math.min(100, currentProgress + jump);
      
      setProgress(currentProgress);

      if (currentProgress < 20) setStatusText(statuses[0]);
      else if (currentProgress < 40) setStatusText(statuses[1]);
      else if (currentProgress < 70) setStatusText(statuses[2]);
      else if (currentProgress < 95) setStatusText(statuses[3]);
      else setStatusText(statuses[4]);

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="reception-loader-container p-6 rounded border border-green-900 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
      <div className="reception-noise-overlay"></div>
      <div className="signal-text text-green-400 font-mono text-sm mb-4">
        &gt; SYSTEM MSG: {statusText}
      </div>
      <div className="w-full h-2 bg-gray-900 rounded overflow-hidden">
        <div 
          className="h-full bg-green-500 shadow-[0_0_8px_#00ff41]"
          style={{ width: `${progress}%`, transition: 'width 0.2s steps(4)' }}
        />
      </div>
      <div className="mt-2 text-xs text-green-700 font-mono flex justify-between">
        <span>ERR_RATE: {(Math.random() * 15).toFixed(2)}%</span>
        <span>{Math.floor(progress)}%</span>
      </div>
    </div>
  );
};
```
