<script setup>
import { ref, onUnmounted } from "vue";

const isBrowserSupported = "Summarizer" in self;

const summary = ref("");
const isLoading = ref(false);
const inputText = ref(
  `코트 원단이 두껍고 부드러워요. 배송도 이틀 만에 왔어요.

단추랑 단추구멍이 잘 맞아요. 처음 냄새는 세탁 후 말리니까 없어졌어요.

색이 그레이인데 화면이랑 비슷하게 왔어요. 가성비 좋아서 일상용으로 자주 입을 것 같아요.`,
);
const summarizerRef = ref(null);

const getSummarizer = async () => {
  if (!isBrowserSupported) {
    throw new Error("Summarizer API is not supported in this browser");
  }

  const availability = await Summarizer.availability();

  if (availability === "unavailable") {
    throw new Error("Summarizer model is not available");
  }

  const createOptions = {
    type: "teaser",
    format: "plain-text",
    length: "short",
    expectedInputLanguages: ["en"],
    outputLanguage: "en",
  };

  if (availability === "available") {
    return Summarizer.create(createOptions);
  }

  return Summarizer.create({
    ...createOptions,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(
          `Summarizer Download Progress: ${Math.floor(e.loaded * 100)}%`,
        );
      });
    },
  });
};

const handleSummarize = async (e) => {
  e.preventDefault();
  summary.value = "";

  const startTime = performance.now();
  const formData = new FormData(e.target);
  const text = formData.get("text");
  if (!text?.trim()) {
    return;
  }

  try {
    isLoading.value = true;
    if (!summarizerRef.value) {
      summarizerRef.value = await getSummarizer();
    }

    const result = summarizerRef.value?.summarizeStreaming(text.trim());
    for await (const chunk of result) {
      summary.value += chunk;
    }
  } catch (error) {
    console.error("Error summarizing text", error);
  } finally {
    const endTime = performance.now();
    setTimeout(
      () => {
        isLoading.value = false;
      },
      500 - (endTime - startTime),
    );
  }
};

onUnmounted(() => {
  summarizerRef.value?.destroy();
});
</script>

<template>
  <div v-if="isBrowserSupported">
    <form @submit="handleSummarize">
      <textarea
        v-model="inputText"
        name="text"
        rows="6"
        placeholder="요약할 텍스트를 입력하세요..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "요약 중..." : "요약하기" }}
      </button>
    </form>
    <div class="result">
      <h3>요약 결과</h3>
      <div v-if="summary" class="summary-text">{{ summary }}</div>
      <p v-else class="placeholder">요약 결과가 여기에 표시됩니다.</p>
    </div>
  </div>
  <div v-else>
    <p class="not-supported">Summarizer is not supported in this browser</p>
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
  flex-direction: column;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem 0;
}

textarea {
  display: block;
  width: 100%;
  padding: 0.4rem 0.4rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a202c;
  transition: all 0.2s ease;
  outline: none;
  min-height: 8rem;
  resize: vertical;
  font-family: inherit;
}

textarea::placeholder {
  color: #a0aec0;
}

textarea:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

textarea:hover:not(:focus) {
  border-color: #cbd5e0;
}

.result {
  margin-top: 1rem;
}

.result h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.summary-text {
  white-space: pre-wrap;
}

.placeholder {
  color: #a0aec0;
  margin: 0;
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
