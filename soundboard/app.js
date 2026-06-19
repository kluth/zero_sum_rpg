const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Utility: Create White Noise Buffer
function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

// 1. Cognitive Load (Dissonant Alert)
function playCognitiveLoad() {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(830, audioCtx.currentTime); // Dissonance

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.5);
    osc2.stop(audioCtx.currentTime + 0.5);
}

// 2. Metadata Exhaust (Digital Chitter)
function playMetadataExhaust() {
    for (let i = 0; i < 5; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(2000 + (Math.random() * 1000), audioCtx.currentTime + (i * 0.05));
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + (i * 0.05));
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + (i * 0.05) + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (i * 0.05) + 0.04);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime + (i * 0.05));
        osc.stop(audioCtx.currentTime + (i * 0.05) + 0.05);
    }
}

// 3. Surveillance Drone (Low-Freq Hum)
function playDroneSurveillance() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 1);
    osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 2);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 2);
}

// 4. Krieger Breach (Kinetic Strike / Noise burst)
function playKriegerBreach() {
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer();
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseSource.start();
    noiseSource.stop(audioCtx.currentTime + 0.5);
}

// 5. Debt Ledger (Heavy Clank)
function playDebtLedger() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// 6. Grey-Market Scrub (Filtered Static sweep)
function playDataScrub() {
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer();
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 1.5);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseSource.start();
    noiseSource.stop(audioCtx.currentTime + 1.5);
}

// 7. Psychological Burn (Panic Pulse)
function playPanicPulse() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
    
    // Second heartbeat
    setTimeout(() => {
        if(audioCtx.state === 'running') {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(50, audioCtx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
            gain2.gain.setValueAtTime(0, audioCtx.currentTime);
            gain2.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.4);
        }
    }, 200);
}

// 8. CPEM Evaluation (Clinical Tone)
function playCpemEval() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.8);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.0);
}

// Event Listeners
document.querySelectorAll('.brutalist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        initAudio();
        
        switch(this.id) {
            case 'btn-cognitive-load': playCognitiveLoad(); break;
            case 'btn-metadata-exhaust': playMetadataExhaust(); break;
            case 'btn-surveillance-drone': playDroneSurveillance(); break;
            case 'btn-krieger-breach': playKriegerBreach(); break;
            case 'btn-debt-ledger': playDebtLedger(); break;
            case 'btn-data-scrub': playDataScrub(); break;
            case 'btn-heartbeat': playPanicPulse(); break;
            case 'btn-cpem-eval': playCpemEval(); break;
        }
    });
});
