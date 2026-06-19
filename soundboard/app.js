// Map button IDs to their respective audio files.
// Place these .mp3 (or .wav) files in the "audio/" folder.
const audioMap = {
    'btn-cognitive-load': 'audio/cognitive_load.mp3',
    'btn-metadata-exhaust': 'audio/metadata_exhaust.mp3',
    'btn-surveillance-drone': 'audio/surveillance_drone.mp3',
    'btn-krieger-breach': 'audio/krieger_breach.mp3',
    'btn-debt-ledger': 'audio/debt_ledger.mp3',
    'btn-data-scrub': 'audio/data_scrub.mp3',
    'btn-heartbeat': 'audio/heartbeat.mp3',
    'btn-cpem-eval': 'audio/cpem_eval.mp3'
};

// Store active audio objects to allow overlapping or stopping
const activeAudio = {};

function playSound(buttonId) {
    const audioPath = audioMap[buttonId];
    if (!audioPath) return;

    // Create a new Audio object so multiple presses can overlap
    const audio = new Audio(audioPath);
    
    // Add an error listener in case the file is missing
    audio.addEventListener('error', () => {
        console.error(`ERROR: Audio file missing: ${audioPath}. Please add it to the audio/ directory.`);
        alert(`Missing audio file: ${audioPath}\nPlease drop this file into the soundboard/audio/ directory.`);
    });

    audio.play().catch(e => {
        console.warn('Playback prevented or failed:', e);
    });
}

// Event Listeners
document.querySelectorAll('.brutalist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        playSound(this.id);
    });
});
