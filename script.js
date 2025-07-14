// Cloudflare Worker URL for API requests
const workerUrl = "https://loreal-worker.preschet.workers.dev";

/* DOM elements */
const userInput = document.getElementById("userInput");
const chatLog = document.getElementById("chatLog");

/* Product cards container */
const productCardsContainer = document.getElementById("productCards");

/* Selected products list */
const selectedProductsList = document.getElementById("selectedProductsList");

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
      reply = reply.replace(
        /((I|We) recommend[^.?!]*[.?!])|((For [^,]+, )?try [^.?!]*[.?!])/gi,
        function (match) {
          return `<strong>${match.trim()}</strong>`;
        }
      );
      // Emphasize 'Beauty Genius' tool mentions
      reply = reply.replace(
        /(Beauty Genius)/gi,
        '<span class="font-bold text-gold underline">$1</span>'
      );
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

// Global array to store selected products
let selectedProducts = [];

// Toggle selection for a product card
function toggleProductSelection(productId, productName, element) {
  // Check if product is already selected
  const index = selectedProducts.findIndex((p) => p.id === productId);
  if (index === -1) {
    // Add product to selection
    selectedProducts.push({ id: productId, name: productName });
    // Highlight card
    element.classList.add("border-4", "border-black");
  } else {
    // Remove product from selection
    selectedProducts.splice(index, 1);
    // Remove highlight
    element.classList.remove("border-4", "border-black");
  }
  updateSelectedList();
}

// Sample product cards rendering (add this function and call it on page load)
function renderProductCards() {
  const products = [
    { id: "p1", name: "Hydrate Shampoo" },
    { id: "p2", name: "Revitalift Serum" },
    { id: "p3", name: "Infallible Concealer" },
    { id: "p4", name: "Pureology Hydrate Conditioner" },
  ];
  const container = document.getElementById("productCards");
  if (!container) return;
  container.innerHTML = products
    .map(
      (product) => `
    <div
      class="cursor-pointer bg-white rounded-xl shadow-md p-4 mb-3 transition border border-gray-200 hover:border-gold"
      onclick="toggleProductSelection('${product.id}', '${product.name}', this)"
      aria-label="Select ${product.name}"
    >
      <span class="font-mont text-black text-base">${product.name}</span>
    </div>
  `
    )
    .join("");
}

// Update the visual list of selected products
function updateSelectedList() {
  const listContainer = document.getElementById("selectedProductsList");
  if (!listContainer) return;
  if (selectedProducts.length === 0) {
    listContainer.innerHTML =
      "<span class='text-gray-400'>No products selected.</span>";
    return;
  }
  listContainer.innerHTML = `<ul class='mb-2'>${selectedProducts
    .map(
      (p) => `<li class='font-mont text-black text-base mb-1'>${p.name}</li>`
    )
    .join("")}</ul>`;
}

// Call renderProductCards on page load
window.addEventListener("DOMContentLoaded", () => {
  renderProductCards();
  renderMessages();
});

// Allow pressing Enter to send the message
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
