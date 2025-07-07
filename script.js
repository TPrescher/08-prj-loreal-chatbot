// Cloudflare Worker URL for API requests
const workerUrl = "https://loreal-worker.preschet.workers.dev";

/* DOM elements */
const userInput = document.getElementById("userInput");
const chatLog = document.getElementById("chatLog");

// System prompt to guide the assistant's behavior
const systemPrompt = `You are "Smart Routine & Product Advisor," a friendly, beauty-savvy chatbot for L'Oréal. Only answer questions related to skincare, haircare, and cosmetics. Politely refuse to answer anything else. Always sign off with a smile emoji.`;

// Store the full conversation history
let messages = [
  {
    role: "system",
    content:
      "👋 Welcome to the Smart Routine & Product Advisor by L’Oréal. Let’s turn your routine into a ritual.",
  },
  { role: "system", content: systemPrompt },
];

// Render all messages in the chat log
function renderMessages() {
  chatLog.innerHTML = "";
  messages.forEach((msg, idx) => {
    if (msg.role === "system" && idx === 0) {
      chatLog.innerHTML += `<div class="bubble system">${msg.content}</div>`;
    } else if (msg.role === "user") {
      chatLog.innerHTML += `<div class="bubble user"><strong>You:</strong> ${msg.content}</div>`;
    } else if (msg.role === "assistant") {
      chatLog.innerHTML += `<div class="bubble bot"><strong>Advisor:</strong> ${msg.content}</div>`;
    }
  });
  // Scroll to bottom
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Show initial system prompt
renderMessages();

// This function sends the user's message to the API and updates the chat log
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to history
  messages.push({ role: "user", content: message });
  renderMessages();

  // Show thinking bubble
  chatLog.innerHTML += `<div class="bubble bot"><i>Thinking...</i></div>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    // Send the full conversation (except system prompt) to the API
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    console.log("API response:", data);

    let botReply = "(No reply)";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      botReply = data.choices[0].message.content;
    }
    // Add assistant reply to history
    messages.push({ role: "assistant", content: botReply });
    renderMessages();
  } catch (error) {
    messages.push({
      role: "assistant",
      content: "Sorry, there was an error connecting to the API.",
    });
    renderMessages();
  }
  userInput.value = "";
}

// Allow pressing Enter to send the message
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
