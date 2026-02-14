let allWords = [];
let currentQuizWord = null;

/* ---------------- LOAD JSON ---------------- */

async function loadWords() {
  try {
    const response = await fetch("js/words.json");
    const data = await response.json();

    // Əgər sən lesson formatında saxlamısansa
    if (data[0].words) {
      data.forEach(lesson => {
        lesson.words.forEach(word => {
          allWords.push({ ...word, lesson: lesson.lesson });
        });
      });
    } else {
      // Əgər düz array formatındadırsa
      allWords = data;
    }

    generateLessonButtons();
  } catch (error) {
    console.error("JSON yüklənmədi:", error);
  }
}

/* ---------------- LESSON MODE ---------------- */

function generateLessonButtons() {
  const lessonContainer = document.getElementById("lesson-buttons");
  if (!lessonContainer) return;

  const lessons = [...new Set(allWords.map(w => w.lesson))];

  lessons.forEach(lesson => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Lesson " + lesson;
    btn.onclick = () => showLessonWords(lesson);
    lessonContainer.appendChild(btn);
  });
}
function showLessonWords(lessonNumber) {
  const list = document.getElementById("word-list");
  list.innerHTML = "";

  const lessonWords = allWords.filter(w => w.lesson == lessonNumber);

  lessonWords.forEach(word => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <strong>${word.word}</strong>
          <br>
          <em>"${word.example || ""}"</em>
        </div>
        <div class="card-back">
          <strong>${word.meaning}</strong>
          <br>
          <em>"${word.example_az || word.example || ""}"</em>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });

    list.appendChild(card);
  });
}




/* ---------------- REVIEW MODE ---------------- */

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showAllWords() {
  const list = document.getElementById("review-list");
  if (!list) return;

  list.innerHTML = "";
  const shuffled = shuffleArray([...allWords]);

  shuffled.forEach(word => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${word.word}</strong> - ${word.meaning}
    `;
    list.appendChild(div);
  });
}

function showWeakWords() {
  const list = document.getElementById("review-list");
  list.innerHTML = "";

  const weakWords = allWords.filter(word => {
    const wrong = localStorage.getItem(word.word + "_wrong");
    return wrong && parseInt(wrong) >= 2;
  });

  if (weakWords.length === 0) {
    list.innerHTML = "<p>Weak words yoxdur 👍</p>";
    return;
  }

  weakWords.forEach(word => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${word.word}</strong> - ${word.meaning}
    `;
    list.appendChild(div);
  });
}

/* ---------------- QUIZ MODE ---------------- */

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * allWords.length);
  return allWords[randomIndex];
}

function startQuiz() {
  const quizWordElement = document.getElementById("quiz-word");
  if (!quizWordElement) return;

  currentQuizWord = getRandomWord();
  quizWordElement.textContent = currentQuizWord.word;

  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-result").textContent = "";
}

function checkAnswer() {
  const input = document.getElementById("quiz-answer");
  const result = document.getElementById("quiz-result");

  if (!currentQuizWord) return;

  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = currentQuizWord.meaning.toLowerCase();

  if (userAnswer === correctAnswer) {
    result.textContent = "✅ Correct!";
    result.style.color = "green";

    let correctCount = localStorage.getItem(currentQuizWord.word + "_correct") || 0;
    localStorage.setItem(currentQuizWord.word + "_correct", parseInt(correctCount) + 1);

  } else {
    result.textContent = "❌ Wrong! Correct: " + currentQuizWord.meaning;
    result.style.color = "red";

    let wrongCount = localStorage.getItem(currentQuizWord.word + "_wrong") || 0;
    localStorage.setItem(currentQuizWord.word + "_wrong", parseInt(wrongCount) + 1);
  }

  setTimeout(startQuiz, 1500);
}

/* ---------------- AUTO START ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  loadWords();
  startQuiz();
});
