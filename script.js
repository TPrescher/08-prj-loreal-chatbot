// Cloudflare Worker URL for API requests
const workerUrl = "https://loreal-worker.preschet.workers.dev";

/* DOM elements */
const userInput = document.getElementById("userInput");
const chatLog = document.getElementById("chatLog");

// System prompt to guide the assistant's behavior
const systemPrompt = `You are "Smart Routine & Product Advisor," a warm, expert, and concise L’Oréal Beauty Advisor. When recommending any L’Oréal product or routine, direct the user to the appropriate regional L’Oréal Paris homepage instead of a specific product page. Use the word **here** (lower-case) exactly once as the link anchor. Maintain L’Oréal’s warm, expert, luxury tone and end with a friendly invitation (e.g., 'Let me know if I can help further! 😊').`;

// This function determines the correct L'Oréal homepage based on the user's browser language.
function getBrandHomeUrl() {
  // Get the user's browser language, default to "en-us".
  const lang = (navigator.language || "en-us").toLowerCase();

  // Return the U.K. URL for British or Irish English.
  if (lang.startsWith("en-gb") || lang.startsWith("en-ie")) {
    return "https://www.lorealparis.co.uk/";
  }
  // Return the Australian URL for Australian or New Zealand English.
  if (lang.startsWith("en-au") || lang.startsWith("en-nz")) {
    return "https://www.lorealparis.com.au/";
  }
  // Return the U.S.A. URL for American English or Canadian French/English.
  if (
    lang.startsWith("en-us") ||
    lang.startsWith("fr-ca") ||
    lang.startsWith("en-ca")
  ) {
    return "https://www.lorealparisusa.com/";
  }
  // Return the global site as a fallback for all other languages.
  return "https://www.loreal-paris.com/";
}

// This helper function finds the word "here" in the assistant's reply and replaces it with a clickable, region-aware link.
function linkToBrandHome(text) {
  // Get the region-specific URL.
  const url = getBrandHomeUrl();
  // Use a regular expression to replace the first case-insensitive occurrence of "here".
  return text.replace(
    /here/i,
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-[#C9B037] hover:text-black font-semibold">here</a>`
  );
}

// Store the full conversation history
let messages = [
  {
    role: "system",
    content:
      "👋 Welcome to the Smart Routine & Product Advisor by L’Oréal. Let’s turn your routine into a ritual.",
  },
  { role: "system", content: systemPrompt },
];

// Render all messages in the chat log using Tailwind CSS classes
function renderMessages() {
  chatLog.innerHTML = "";
  // Skip the system prompt (index 1 is the actual prompt)
  messages.forEach((msg, idx) => {
    if (msg.role === "system" && idx === 0) {
      // Welcome message
      chatLog.innerHTML += `<div class="flex justify-center"><div class="bg-gold text-black rounded-xl px-6 py-4 mb-3 max-w-[90%] text-center font-mont font-medium text-base">${msg.content}</div></div>`;
    } else if (msg.role === "user") {
      chatLog.innerHTML += `<div class="flex justify-end"><div class="bg-black text-white rounded-xl px-6 py-4 mb-3 max-w-[75%] text-right font-mont font-medium"><span class="block text-xs text-gold font-bold mb-1">You:</span>${msg.content}</div></div>`;
    } else if (msg.role === "assistant") {
      // The assistant's reply already contains the correct, region-aware link, so we render it directly.
      chatLog.innerHTML += `<div class="flex justify-start"><div class="bg-gray-100 text-black rounded-xl px-6 py-4 mb-3 max-w-[75%] text-left font-mont font-medium"><span class="block text-xs text-gold font-bold mb-1">Advisor:</span>${msg.content}</div></div>`;
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
  chatLog.innerHTML += `<div class=\"flex justify-start\"><div class=\"bg-gray-100 text-black rounded-xl px-6 py-4 mb-3 max-w-[75%] text-left font-mont font-medium italic opacity-70\">Advisor is thinking...</div></div>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    // Send the full conversation (including system prompt) to the API
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    let botReply = "(No reply)";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      botReply = data.choices[0].message.content;
    }
    // Take the raw reply and inject the correct, region-aware homepage link.
    const advisorReply = linkToBrandHome(botReply);
    // Add the processed assistant reply to history.
    messages.push({ role: "assistant", content: advisorReply });
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
