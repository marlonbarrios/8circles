let audioContext;
let audio;
let signals;

// Isolate specific bands of frequency with their own colors
const frequencyBands = [
  { frequency: 55, color: "#FF5A5F"},
  { frequency: 110, color: "#FFAE03" },
  { frequency: 220, color:"#E67F0D"},
  { frequency: 440, color: "#FE4E00" },
  { frequency: 570, color: "#E9190F" },
  { frequency: 960, color: "#FF0F80" },
  { frequency: 2000, color:  "#E40066" },
  { frequency: 4000, color: "#FB4D3D" },
];
//"#3E58E2
function mousePressed() {
  if (!audioContext) {
    // Create a new audio context
    audioContext = new AudioContext();

    // Create <audio> tag
    audio = document.createElement("audio");

    // set URL to the MP3 within your Glitch.com assets
    audio.src = "hope.mp3";

    // To play audio through Glitch.com CDN
    audio.crossOrigin = "Anonymous";

    // Enable looping so the audio never stops
    audio.loop = true;

    // Play audio
    audio.play();

    // Create a "Media Element" source node
    const source = audioContext.createMediaElementSource(audio);

    // Connect the source to the destination (speakers/headphones)
    source.connect(audioContext.destination);

    // For each frequency we want to isolate, we will create
    // its own analyser and filter nodes
    signals = frequencyBands.map(({ frequency, color }) => {
      // Create an analyser
      const analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 1;

      // Create FFT data
      const data = new Float32Array(analyser.fftSize);

      // Create a filter that will only allow a band of data
      // through
      const filter = audioContext.createBiquadFilter();
      filter.frequency.value = frequency;
      filter.Q.value = 1;
      filter.type = "bandpass";

      source.connect(filter);
      filter.connect(analyser);

      return {
        analyser,
        color,
        data,
        filter,
      };
    });
  } else {
    // Clean up our element and audio context
    if (audio.paused) audio.play();
    else audio.pause();
  }
}

// Get the root mean squared of a set of signals
function rootMeanSquaredSignal(data) {
  let rms = 1;
  for (let i = 0; i < data.length; i++) {
    rms += data[i] * data[i];
  }
  return Math.sqrt(rms / data.length);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // fill background
  background(20, 5);

  // Draw play/pause button
  const dim = min(width, height);
  if (audioContext) {
    signals.forEach(({ analyser, data, color }, i) => {
      // Get the waveform
      analyser.getFloatTimeDomainData(data);

      // Get the root mean square of the data
      // Note this will already have been 'filtered'
      // down to the band of frequency we want
      const signal = rootMeanSquaredSignal(data);
      const scale = 4; // scale the data a bit so the circle is bigger
      const size = dim * scale * signal;

      // Draw the rectangle
      // fill(color);
      stroke(color);
      strokeWeight(scale * signal * 80);
      rectMode(CENTER);
      const margin = 0.4 * dim;
      const x =
        signals.length <= 1
          ? width / 2
          : map(i, 0, signals.length - 1, margin, width - margin);
      const sliceWidth = ((width - margin * 2) / (signals.length - 1)) * 0.75;
      ellipse(x, height / 2, size, size);
    });
  } else {
    fill(50,100);
    noStroke();
    polygon(width / 2, height / 2, dim * 0.1, 3);
  }
}

// Draw a basic polygon, handles triangles, squares, pentagons, etc
function polygon(x, y, radius, sides = 3, angle = 0) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
