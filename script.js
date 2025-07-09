// Cloudflare Worker URL for API requests
const workerUrl = "https://loreal-worker.preschet.workers.dev";

/* DOM elements */
const userInput = document.getElementById("userInput");
const chatLog = document.getElementById("chatLog");

// System prompt to guide the assistant's behavior
const systemPrompt = `You are "Smart Routine & Product Advisor," a warm, expert, and concise L’Oréal Beauty Advisor. Only answer questions about beauty, skincare, haircare, and L’Oréal (including Pureology) products. Always recommend a specific L’Oréal or L’Oréal sub-brand product by name whenever possible (e.g., “I recommend the L’Oréal Revitalift Serum for…” or “For color-treated hair, try Pureology Hydrate Shampoo.”). If asked about routines, offer to create a personalized routine. If asked about ingredients or product differences, give a helpful, brand-aligned explanation using L’Oréal terminology. Politely refuse to answer unrelated questions. Always end with a friendly, premium sign-off, such as “Would you like a custom recommendation? 😊”`;

// Store the full conversation history
let messages = [
  {
    role: "system",
    content:
      "Welcome to the Smart Routine & Product Advisor by L’Oréal. Let’s turn your routine into a ritual.",
  },
  { role: "system", content: systemPrompt },
];

// Utility: returns the L'Oréal Paris main homepage
function linkToBrandHome() {
  return '<a href="https://www.lorealparisusa.com/" target="_blank" rel="noopener" class="text-gold underline hover:text-black transition">here</a>';
}

// Render all messages in the chat log using Tailwind CSS classes
function renderMessages() {
  chatLog.innerHTML = "";
  messages.forEach((msg, idx) => {
    if (msg.role === "system" && idx === 0) {
      chatLog.innerHTML += `<div class=\"flex justify-center\"><div class=\"bg-gold text-black rounded-xl px-6 py-4 mb-3 max-w-[90%] text-center font-mont font-medium text-base\">${msg.content}</div></div>`;
    } else if (msg.role === "user") {
      chatLog.innerHTML += `<div class=\"flex justify-end\"><div class=\"bg-black text-white rounded-xl px-6 py-4 mb-3 max-w-[75%] text-right font-mont font-medium\"><span class=\"block text-xs text-gold font-bold mb-1\">You:</span>${msg.content}</div></div>`;
    } else if (msg.role === "assistant") {
      // ENHANCEMENT: Append Beauty Genius handoff if not already present
      let reply = msg.content;
      // Improved bolding for product suggestions
      // Bold phrases like 'I recommend ...', 'Try ...', 'For ..., try ...', 'We recommend ...'
      reply = reply.replace(/((I|We) recommend[^.?!]*[.?!])|((For [^,]+, )?try [^.?!]*[.?!])/gi, function(match) {
        return `<strong>${match.trim()}</strong>`;
      });
      // Emphasize 'Beauty Genius' tool mentions
      reply = reply.replace(/(Beauty Genius)/gi, '<span class="font-bold text-gold underline">$1</span>');
      const handoffMsg = `You can also explore personalized tools like <span class=\"font-bold text-gold underline\">Beauty Genius</span> on our main site for more support. Just click here to continue. 😊`;
      // Only add if not already present
      if (!/beauty genius/i.test(reply) && !/main site/i.test(reply)) {
        reply += `\n\n${handoffMsg}`;
      } else {
        // Replace any 'here' with the correct link
        reply = reply.replace(/here/gi, linkToBrandHome());
      }
      // Always ensure 'here' is a link
      if (!reply.includes(linkToBrandHome())) {
        reply = reply.replace(/here/gi, linkToBrandHome());
      }
      chatLog.innerHTML += `<div class=\"flex justify-start\"><div class=\"bg-gray-100 text-black rounded-xl px-6 py-4 mb-3 max-w-[75%] text-left font-mont font-medium\"><span class=\"block text-xs text-gold font-bold mb-1\">Advisor:</span>${reply}</div></div>`;
    }
  });
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
