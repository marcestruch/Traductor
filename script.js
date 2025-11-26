const sourceLang = document.getElementById("sourceLanguage");
const targetLang = document.getElementById("targetLanguage");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const swapBtn = document.getElementById("swaplanguages");
const micBtn = document.getElementById("micButton");
const clearBtn = document.getElementById("clearButton");
const copyBtn = document.getElementById("copyButton");
const speakBtn = document.getElementById("speakButton");
const charCount = document.querySelector(".char-count");

let debounceTimer;

// Translate function
async function translate() {
  const text = inputText.value;
  const from = sourceLang.value;
  const to = targetLang.value;

  if (!text) {
    outputText.value = "";
    return;
  }

  let langPair = `${from}|${to}`;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${langPair}`;

  try {
    outputText.setAttribute("placeholder", "Traduciendo...");
    const res = await fetch(url);
    const data = await res.json();

    if (data.responseData) {
      outputText.value = data.responseData.translatedText;
    }
    outputText.setAttribute("placeholder", "Traducción");
  } catch (error) {
    console.error("Error translating:", error);
    outputText.value = "Error en la traducción";
    outputText.setAttribute("placeholder", "Traducción");
  }
}

// Debounce wrapper
function debouncedTranslate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(translate, 500);
}

// Events
inputText.addEventListener("input", () => {
  const currentLength = inputText.value.length;
  charCount.textContent = `${currentLength} / 5000`;

  if (currentLength > 0) {
    clearBtn.style.display = "block";
  } else {
    clearBtn.style.display = "none";
    outputText.value = "";
  }

  debouncedTranslate();
});

sourceLang.addEventListener("change", translate);
targetLang.addEventListener("change", translate);

swapBtn.addEventListener("click", () => {
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;

  const tempText = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tempText;

  translate();
});

clearBtn.addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  charCount.textContent = "0 / 5000";
  clearBtn.style.display = "none";
  inputText.focus();
});

copyBtn.addEventListener("click", () => {
  if (!outputText.value) return;
  navigator.clipboard.writeText(outputText.value);

  // Visual feedback
  const originalIcon = copyBtn.innerHTML;
  copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
  setTimeout(() => {
    copyBtn.innerHTML = originalIcon;
  }, 1500);
});

speakBtn.addEventListener("click", () => {
  if (!outputText.value) return;
  const utterance = new SpeechSynthesisUtterance(outputText.value);
  utterance.lang = targetLang.value;
  speechSynthesis.speak(utterance);
});

// Speech Recognition
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;

  micBtn.addEventListener("click", () => {
    recognition.lang = sourceLang.value;
    recognition.start();
    micBtn.style.color = "var(--color-primario)";
  });

  recognition.onend = () => {
    micBtn.style.color = "";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    charCount.textContent = `${inputText.value.length} / 5000`;
    clearBtn.style.display = "block";
    debouncedTranslate();
  };
} else {
  micBtn.style.display = "none";
}
