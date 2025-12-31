<script setup>
import { ref } from "vue";

const isBrowserSupported = "Translator" in self;

const translatedText = ref("");
const isLoading = ref(false);
const translatorRef = ref(null);
const abortControllerRef = ref(null);

const translateText = async (e) => {
  e.preventDefault();

  const startTime = performance.now();
  const formData = new FormData(e.target);
  const text = formData.get("text");
  if (!text.trim()) {
    return;
  }

  try {
    isLoading.value = true;
    if (!translatorRef.value) {
      abortControllerRef.value = new AbortController();
      translatorRef.value = await getTranslator(
        "en",
        "ko",
        abortControllerRef.value.signal
      );
    }

    const results = (await translatorRef.value?.translate(text)) ?? "";
    translatedText.value = results;
  } catch (error) {
    console.error(error);
  } finally {
    const endTime = performance.now();

    setTimeout(() => {
      isLoading.value = false;
    }, 500 - (endTime - startTime));
  }
};

const getTranslator = async (sourceLanguage, targetLanguage, signal) => {
  if (!isBrowserSupported) {
    throw new Error("Translator is not supported in this browser");
  }

  const availability = await Translator.availability({
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  });

  if (availability === "unavailable") {
    throw new Error("Model is not available for the given languages");
  }

  if (availability === "available") {
    return Translator.create({
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      signal,
    });
  }

  return Translator.create({
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${Math.floor(e.loaded * 100)}%`);
      });
    },
    signal,
  });
};
</script>

<template>
  <div v-if="isBrowserSupported">
    <form @submit="translateText">
      <input type="text" name="text" placeholder="Input English Text" />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "번역중..." : "번역하기" }}
      </button>
    </form>
    <div>
      <span>번역: </span>
      <span v-if="translatedText && !isLoading">{{ translatedText }}</span>
    </div>
  </div>
  <div v-else>
    <p class="not-supported">Translator is not supported in this browser</p>
  </div>
</template>

<style scoped>
div {
  max-width: 600px;
}

button {
  background-color: #007bff;
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

form {
  display: flex;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem 0;
}

input {
  padding: 0.4rem 0.4rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a202c;
  transition: all 0.2s ease;
  outline: none;
}

input::placeholder {
  color: #a0aec0;
}

input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

input:hover:not(:focus) {
  border-color: #cbd5e0;
}

@media (max-width: 640px) {
  div {
    padding: 1rem;
  }

  form {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}

.not-supported {
  color: #e53e3e;
  font-weight: bold;
}

select {
  padding: 0.4rem 0.4rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a202c;
  transition: all 0.2s ease;
  outline: none;
}
</style>
