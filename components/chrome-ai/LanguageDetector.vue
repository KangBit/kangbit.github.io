<script setup>
import { ref } from "vue";

const isBrowserSupported = "LanguageDetector" in self;

const detectedLanguage = ref([]);
const isLoading = ref(false);
const detectorRef = ref(null);
const abortControllerRef = ref(null);

const detectLanguage = async (e) => {
  e.preventDefault();

  const startTime = performance.now();
  const formData = new FormData(e.target);
  const text = formData.get("text");
  if (!text.trim()) {
    return;
  }

  try {
    isLoading.value = true;
    if (!detectorRef.value) {
      abortControllerRef.value = new AbortController();
      detectorRef.value = await getDetector(
        ["en"],
        abortControllerRef.value.signal
      );
    }

    const results = (await detectorRef.value?.detect(text)) ?? [];
    detectedLanguage.value = results;
  } catch (error) {
    console.error(error);
  } finally {
    const endTime = performance.now();

    setTimeout(() => {
      isLoading.value = false;
    }, 1000 - (endTime - startTime));
  }
};

const getDetector = async (languages, signal) => {
  if (!isBrowserSupported) {
    throw new Error("Language Detector is not supported in this browser");
  }

  const availability = await LanguageDetector.availability({
    expectedInputLanguages: languages,
  });

  if (availability === "unavailable") {
    throw new Error("Model is not available for the given languages");
  }

  if (availability === "available") {
    return LanguageDetector.create({
      expectedInputLanguages: languages,
      signal,
    });
  }

  return LanguageDetector.create({
    expectedInputLanguages: languages,
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
    <form @submit="detectLanguage">
      <input type="text" name="text" placeholder="Text to detect language" />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Detecting..." : "Detect" }}
      </button>
    </form>
    <div v-if="detectedLanguage.length > 0" class="detected-languages">
      <div
        v-for="language in detectedLanguage.slice(0, 3)"
        :key="language.detectedLanguage"
        class="detected-language"
      >
        {{ language.detectedLanguage }}
        {{ (language.confidence * 100).toFixed(2) }}%
      </div>
    </div>
  </div>
  <div v-else>
    <p class="not-supported">
      Language Detector is not supported in this browser
    </p>
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
  padding: 0.5rem 0.5rem;
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

.detected-languages {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.detected-language {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background-color: var(--vp-c-default-soft);
  padding: 0.5rem 1rem;
  border-radius: 8px;
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
</style>
