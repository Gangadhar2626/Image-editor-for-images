const AI_API_BASE = "https://viggle-qwen-image-2-1-viggle-turbo.hf.space";

const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
const emptyState = document.querySelector("#emptyState");
const saveButton = document.querySelector("#saveButton");
const statusMessage = document.querySelector("#status");
const settings = { brightness: 100, contrast: 100, saturation: 100, filter: "none" };
let sourceImage = null;

function render() {
  if (!sourceImage) return;
  const scale = Math.min(1, 1200 / sourceImage.width);
  canvas.width = Math.round(sourceImage.width * scale);
  canvas.height = Math.round(sourceImage.height * scale);
  context.filter = [
    `brightness(${settings.brightness}%)`,
    `contrast(${settings.contrast}%)`,
    `saturate(${settings.saturation}%)`,
    settings.filter,
  ].join(" ");
  context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  context.filter = "none";
}

function loadImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      sourceImage = image;
      emptyState.hidden = true;
      canvas.hidden = false;
      saveButton.disabled = false;
      render();
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

document.querySelector("#imageInput").addEventListener("change", (event) => loadImage(event.target.files[0]));
document.querySelector("#replaceInput").addEventListener("change", (event) => loadImage(event.target.files[0]));

["brightness", "contrast", "saturation"].forEach((name) => {
  const input = document.querySelector(`#${name}`);
  const output = document.querySelector(`#${name}Value`);
  input.addEventListener("input", () => {
    settings[name] = input.value;
    output.textContent = `${input.value}%`;
    render();
  });
});

document.querySelectorAll(".tool-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tool-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".control-panel").forEach((panel) => panel.classList.add("hidden"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.panel}`).classList.remove("hidden");
  });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    settings.filter = button.dataset.filter;
    render();
  });
});

document.querySelector("#resetButton").addEventListener("click", () => {
  settings.brightness = settings.contrast = settings.saturation = 100;
  settings.filter = "none";
  ["brightness", "contrast", "saturation"].forEach((name) => {
    document.querySelector(`#${name}`).value = 100;
    document.querySelector(`#${name}Value`).textContent = "100%";
  });
  document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
  document.querySelector('[data-filter="none"]').classList.add("active");
  render();
});

saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `canvas-studio-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.querySelector("#aiButton").addEventListener("click", async () => {
  if (!sourceImage) {
    statusMessage.textContent = "Upload an image first.";
    return;
  }
  const prompt = document.querySelector("#prompt").value.trim();
  if (!prompt) {
    statusMessage.textContent = "Describe the change you want.";
    return;
  }
  statusMessage.textContent = "AI editing needs the model endpoint configuration.";
  try {
    const response = await fetch(`${AI_API_BASE}/gradio_api/info`);
    if (!response.ok) throw new Error("Model unavailable");
    statusMessage.textContent = "Model found, but its endpoint schema needs to be connected.";
  } catch {
    statusMessage.textContent = "The AI service is currently unavailable. Local editing still works.";
  }
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
