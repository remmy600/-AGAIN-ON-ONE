// Web Audio API Romantic Synth Engine for "Only You"
// Plays a soft, romantic ambient soundscape with gentle chord progressions

let audioCtx: AudioContext | null = null;
let chordInterval: any = null;
let melodyInterval: any = null;
let currentNotes: { osc: OscillatorNode; gain: GainNode }[] = [];

// F-G-Am-Em progression (romantic/melancholic minor progression in key of A minor)
const CHORD_PROGRESSION = [
  [174.61, 220.00, 261.63, 349.23], // F Major (F3, A3, C4, F4)
  [196.00, 246.94, 293.66, 392.00], // G Major (G3, B3, D4, G4)
  [220.00, 261.63, 329.63, 440.00], // A Minor (A3, C4, E4, A4)
  [164.81, 246.94, 329.63, 493.88], // E Minor (E3, B3, E4, B4)
];

// Beautiful pentatonic solo notes of A minor to play sweet high-pitch ambient melodies
const MELODY_PENTATONIC = [440.0, 493.88, 523.25, 587.33, 659.25, 783.99, 880.0];

export function startMusicHarmony() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    let progressionIndex = 0;

    // Stop existing timers
    stopMusicHarmony();

    const playChord = () => {
      if (!audioCtx) return;
      
      const now = audioCtx.currentTime;
      const chords = CHORD_PROGRESSION[progressionIndex % CHORD_PROGRESSION.length];

      // Fade out previous notes gently
      currentNotes.forEach((note) => {
        try {
          note.gain.gain.setValueAtTime(note.gain.gain.value, now);
          note.gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          setTimeout(() => {
            try {
              note.osc.stop();
            } catch (e) {}
          }, 1500);
        } catch (err) {}
      });
      currentNotes = [];

      // Create new low-pass filter to sound warm and lush like an acoustic piano/pad
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(1, now);
      filter.connect(audioCtx.destination);

      // Trigger 4-note chord
      chords.forEach((freq) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Soft sine/triangle blend
        osc.type = Math.random() > 0.5 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        // Soft attack
        gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
        // Decay/sustain
        gain.gain.setValueAtTime(0.08, now + 3.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        currentNotes.push({ osc, gain });
      });

      progressionIndex++;
    };

    const playMelodyNote = () => {
      if (!audioCtx) return;

      // Only play melody occasionally (chance-based for humanized acoustic feel)
      if (Math.random() > 0.6) return;

      const now = audioCtx.currentTime;
      const randomFreq = MELODY_PENTATONIC[Math.floor(Math.random() * MELODY_PENTATONIC.length)];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const delay = audioCtx.createDelay();
      const delayFeedback = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(randomFreq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      // Sweet romantic delay effect
      delay.delayTime.setValueAtTime(0.35, now);
      delayFeedback.gain.setValueAtTime(0.4, now);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Connect delay chain
      gain.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay); // Loop
      delayFeedback.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    };

    // Begin loop immediately, chords repeat every 5 seconds
    playChord();
    chordInterval = setInterval(playChord, 5000);

    // Sweet melodic notes sprinkled every 1.5 seconds
    melodyInterval = setInterval(playMelodyNote, 1500);

  } catch (error) {
    console.error("Audio Synth initialization failed", error);
  }
}

export function stopMusicHarmony() {
  if (chordInterval) {
    clearInterval(chordInterval);
    chordInterval = null;
  }
  if (melodyInterval) {
    clearInterval(melodyInterval);
    melodyInterval = null;
  }

  // Release all playing nodes smoothly
  if (audioCtx) {
    const now = audioCtx.currentTime;
    currentNotes.forEach((note) => {
      try {
        note.gain.gain.cancelScheduledValues(now);
        note.gain.gain.setValueAtTime(note.gain.gain.value, now);
        note.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        setTimeout(() => {
          try {
            note.osc.stop();
          } catch (e) {}
        }, 600);
      } catch (err) {}
    });
    currentNotes = [];
  }
}
