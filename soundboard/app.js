const audioMap = {
    'btn-cognitive-load': 'audio/cognitive_load.mp3',
    'btn-metadata-exhaust': 'audio/metadata_exhaust.mp3',
    'btn-surveillance-drone': 'audio/surveillance_drone.mp3',
    'btn-krieger-breach': 'audio/krieger_breach.mp3',
    'btn-debt-ledger': 'audio/debt_ledger.mp3',
    'btn-data-scrub': 'audio/data_scrub.mp3',
    'btn-heartbeat': 'audio/heartbeat.mp3',
    'btn-cpem-eval': 'audio/cpem_eval.mp3',
    'btn-burner-ring': 'audio/burner_ring.mp3',
    'btn-imsi-catch': 'audio/imsi_catch.mp3',
    'btn-suppressed-shot': 'audio/suppressed_shot.mp3',
    'btn-police-sirens': 'audio/police_sirens.mp3',
    'btn-system-compromise': 'audio/system_compromise.mp3',
    'btn-burn-tie': 'audio/burn_tie.mp3',
    'btn-crowd-protest': 'audio/crowd_protest.mp3',
    'btn-crowd-riot': 'audio/crowd_riot.mp3',
    'btn-crowd-panic': 'audio/crowd_panic.mp3',
    'btn-chant-usa': 'audio/chant_usa.mp3',
    'btn-chant-uk': 'audio/chant_uk.mp3',
    'btn-chant-france': 'audio/chant_france.mp3',
    'btn-chant-china': 'audio/chant_china.mp3',
    'btn-chant-russia': 'audio/chant_russia.mp3'
};

const activeAudio = {};

function toggleSound(buttonId) {
    const audioPath = audioMap[buttonId];
    if (!audioPath) {
        alert("Error: Button ID not recognized.");
        return;
    }

    if (activeAudio[buttonId]) {
        activeAudio[buttonId].pause();
        activeAudio[buttonId].currentTime = 0;
        delete activeAudio[buttonId];
        document.getElementById(buttonId).classList.remove('active-playing');
        return;
    }

    const audio = new Audio(audioPath);
    audio.loop = true;
    
    audio.play().then(() => {
        console.log(`Successfully looping: ${audioPath}`);
        activeAudio[buttonId] = audio;
        document.getElementById(buttonId).classList.add('active-playing');
    }).catch(e => {
        console.error('Playback failed:', e);
        // This will pop up if the MP3 file doesn't exist (404) or if autoplay is blocked
        alert(`ERROR playing ${audioPath}\n\nReason: ${e.message}\n\nDid you remember to upload the MP3 file to the 'audio/' folder on GitHub?`);
    });
}

document.querySelectorAll('.brutalist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        toggleSound(this.id);
    });
});
