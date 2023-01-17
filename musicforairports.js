const DIRECTORY = '/samples/grand-piano/piano'
const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'A', octave: 4, file: `${DIRECTORY}-a4.wav` },
    { note: 'A', octave: 5, file: `${DIRECTORY}-a5.wav` },
    { note: 'A', octave: 6, file: `${DIRECTORY}-a6.wav` },
    { note: 'C', octave: 4, file: `${DIRECTORY}-c4.wav` },
    { note: 'C', octave: 5, file: `${DIRECTORY}-c5.wav` },
    { note: 'C', octave: 6, file: `${DIRECTORY}-c6.wav` },
    { note: 'D#', octave: 4, file: `${DIRECTORY}-d#4.wav` },
    { note: 'D#', octave: 5, file: `${DIRECTORY}-d#5.wav` },
    { note: 'D#', octave: 6, file: `${DIRECTORY}-d#6.wav` },
    { note: 'F#', octave: 4, file: `${DIRECTORY}-f#4.wav` },
    { note: 'F#', octave: 5, file: `${DIRECTORY}-f#5.wav` },
    { note: 'F#', octave: 6, file: `${DIRECTORY}-f#6.wav` },
  ],
};

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = new AudioContext();

async function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sameplA, sampleB) => {
    let distanceToA = Math.abs(getNoteDistance(note, octave, sameplA.note, sameplA.octave));
    let distanceToB = Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default:   return note;
  }
}

async function getSample(instrument, noteAndOctave) {
  let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance = getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
  return fetchSample(sample.file).then(audioBuffer => ({
    audioBuffer: audioBuffer,
    distance: distance,
  }));
}

function playSample(instrument, note) {
  getSample(instrument, note).then(({audioBuffer, distance}) => {
    let playbackRate = Math.pow(2, distance / 12);
    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;
    bufferSource.connect(audioContext.destination);
    bufferSource.start();
  });
}

const EVENTS = {
  click: 'click',
};

// Temporary test code
document.getElementById('play').addEventListener(EVENTS.click, () => {
  setTimeout(() => { playSample('Grand Piano', 'F4') }, 1000);
  setTimeout(() => { playSample('Grand Piano', 'Ab4') }, 2000);
  setTimeout(() => { playSample('Grand Piano', 'C5') }, 3000);
  setTimeout(() => { playSample('Grand Piano', 'Db5') }, 4000);
  setTimeout(() => { playSample('Grand Piano', 'Eb5') }, 5000);
  setTimeout(() => { playSample('Grand Piano', 'F5') }, 6000);
  setTimeout(() => { playSample('Grand Piano', 'Ab5') }, 7000);
});

