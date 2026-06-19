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

function playSound(buttonId) {
    const audioPath = audioMap[buttonId];
    if (!audioPath) {
        alert("Error: Button ID not recognized.");
        return;
    }

    const audio = new Audio(audioPath);
    
    audio.play().then(() => {
        console.log(`Successfully playing: ${audioPath}`);
    }).catch(e => {
        console.error('Playback failed:', e);
        // This will pop up if the MP3 file doesn't exist (404) or if autoplay is blocked
        alert(`ERROR playing ${audioPath}\n\nReason: ${e.message}\n\nDid you remember to upload the MP3 file to the 'audio/' folder on GitHub?`);
    });
}

document.querySelectorAll('.brutalist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        playSound(this.id);
    });
});
