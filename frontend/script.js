window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const introBubble = document.getElementById("introBubble");
    introBubble.style.display = "block";
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1000);

  rotateTips(); // Initialize tips on load
});

async function sendMessage() {
  const input = document.getElementById("userInput").value.trim();
  const tone = document.getElementById("toneSelect").value;
  const language = document.getElementById("languageSelect").value;
  const chatWindow = document.getElementById("chatWindow");

  if (!input) return;

  const userBubble = document.createElement("div");
  userBubble.className = "bubble user-msg";
  userBubble.innerHTML = `<strong>You:</strong> ${input}`;
  chatWindow.appendChild(userBubble);
  document.getElementById("userInput").value = "";

  // Show loading bubble
  const loadingBubble = document.createElement("div");
  loadingBubble.className = "bubble bot-msg";
  loadingBubble.id = "loadingBubble";
  loadingBubble.innerHTML = "LexiBot is thinking...";
  chatWindow.appendChild(loadingBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const res = await fetch("https://lexibot-backend.onrender.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, tone, language })
    });

    const data = await res.json();
    document.getElementById("loadingBubble").remove();

    const botBubble = document.createElement("div");
    botBubble.className = "bubble bot-msg";
    botBubble.innerHTML = `
      <strong>LexiBot:</strong><br/>
      ${data.translated_text}
      <div class="bubble-icons">
        <i class="fas fa-copy" onclick="copyMessage(this)" title="Copy"></i>
        <i class="fas fa-sync-alt" onclick="refreshMessage(this)" title="Refresh"></i>
      </div>
    `;
    chatWindow.appendChild(botBubble);

  } catch (err) {
    document.getElementById("loadingBubble").remove();
    const errorBubble = document.createElement("div");
    errorBubble.className = "bubble bot-msg";
    errorBubble.style.color = "red";
    errorBubble.textContent = "Error connecting to LexiBot.";
    chatWindow.appendChild(errorBubble);
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function copyMessage(icon) {
  const bubble = icon.closest('.bubble');
  const text = bubble.innerText.replace("LexiBot:", "").trim();
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
}

async function refreshMessage(icon) {
  const botBubble = icon.closest('.bubble');
  const userBubble = botBubble.previousElementSibling;

  if (!userBubble || !userBubble.classList.contains('user-msg')) {
    alert("Could not find the original input to regenerate.");
    return;
  }

  const input = userBubble.innerText.replace("You:", "").trim();
  const tone = document.getElementById("toneSelect").value;
  const language = document.getElementById("languageSelect").value;

  botBubble.innerHTML = "Refreshing response... 🔄";

  try {
    const res = await fetch("https://lexibot-backend.onrender.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, tone, language })
    });

    const data = await res.json();

    botBubble.innerHTML = `
      <strong>LexiBot:</strong><br/>
      ${data.translated_text}
      <div class="bubble-icons">
        <i class="fas fa-copy" onclick="copyMessage(this)" title="Copy"></i>
        <i class="fas fa-sync-alt" onclick="refreshMessage(this)" title="Refresh"></i>
      </div>
    `;
  } catch (err) {
    botBubble.innerHTML = `<span style="color:red;">Error refreshing response.</span>`;
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle i');

  sidebar.classList.toggle('show');

  if (sidebar.classList.contains('show')) {
    toggleBtn.classList.remove('fa-arrow-right');
    toggleBtn.classList.add('fa-arrow-left');
  } else {
    toggleBtn.classList.remove('fa-arrow-left');
    toggleBtn.classList.add('fa-arrow-right');
  }
}

// 🌟 Language Tips logic
const tips = [
  "Did you know? In French, adjectives usually come after the noun!",
  "In Hindi, verbs are placed at the end of the sentence.",
  "Spanish uses inverted question marks: ¿Cómo estás?",
  "Japanese has no plural nouns—context defines it!",
  "German nouns are always capitalized.",
  "In Italian, double consonants can completely change a word's meaning!",
  "Korean often uses -요 or -니다 endings for politeness."
];

function rotateTips() {
  const tipBox = document.getElementById('tip-text');
  let current = 0;
  tipBox.textContent = tips[current];

  setInterval(() => {
    current = (current + 1) % tips.length;
    tipBox.textContent = tips[current];
  }, 20000);
}
