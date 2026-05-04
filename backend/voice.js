const vosk = require("vosk");
const mic = require("mic");

const MODEL_PATH = "model";
const SAMPLE_RATE = 16000;

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);

const micInstance = mic({
  rate: SAMPLE_RATE,
  channels: "1",
});

const micStream = micInstance.getAudioStream();
const rec = new vosk.Recognizer({ model, sampleRate: SAMPLE_RATE });

console.log("Speak now...");

micStream.on("data", (data) => {
  if (rec.acceptWaveform(data)) {
    console.log("TEXT:", rec.result().text);
  }
});

micInstance.start();

setTimeout(() => {
  micInstance.stop();
  console.log("FINAL:", rec.finalResult().text);
}, 8000);