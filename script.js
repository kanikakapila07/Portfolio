const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isRecording = false;
let recordedNotes = [];
let startTime = 0;

function playNote(freq, element, isPlayback = false) {
  if (!element) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(Number(freq), audioCtx.currentTime);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.2);

  element.classList.add("active-key");
  setTimeout(() => element.classList.remove("active-key"), 200);

  if (isRecording && !isPlayback) {
    recordedNotes.push({
      freq: Number(freq),
      time: Date.now() - startTime,
      key: element.getAttribute("data-key"),
    });
    document.getElementById("playBtn").disabled = false;
  }
}

document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("mousedown", () => playNote(key.dataset.note, key));
});

window.addEventListener("keydown", (e) => {
  const key = document.querySelector(
    `.key[data-key="${e.key.toLowerCase()}"]`
  );
  if (key && !e.repeat) playNote(key.dataset.note, key);
});

const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");

recordBtn.addEventListener("click", () => {
  isRecording = !isRecording;

  if (isRecording) {
    recordedNotes = [];
    startTime = Date.now();
    recordBtn.innerHTML = '<i class="bi bi-stop-fill"></i> Stop';
    recordBtn.classList.add("recording");
  } else {
    recordBtn.innerHTML = '<i class="bi bi-mic-fill"></i> Record';
    recordBtn.classList.remove("recording");
  }
});

playBtn.addEventListener("click", () => {
  if (recordedNotes.length === 0) return;

  recordedNotes.forEach((note) => {
    setTimeout(() => {
      const keyElement = document.querySelector(
        `.key[data-key="${note.key}"]`
      );
      playNote(note.freq, keyElement, true);
    }, note.time);
  });
});

clearBtn.addEventListener("click", () => {
  recordedNotes = [];
  playBtn.disabled = true;
  isRecording = false;
  recordBtn.innerHTML = '<i class="bi bi-mic-fill"></i> Record';
  recordBtn.classList.remove("recording");
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.remove("active");
    });
    this.classList.add("active");

    const filter = this.dataset.filter;

    document.querySelectorAll(".project-item").forEach((item) => {
      if (filter === "all" || item.dataset.category === filter) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
});
