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
      chatLog.innerHTML += `<div class="flex justify-center"><div class="bg-gradient-to-r from-gold to-yellow-400 text-black rounded-xl px-8 py-5 mb-4 max-w-[90%] text-center font-mont font-semibold text-lg shadow-lg border-2 border-gold/30">${msg.content}</div></div>`;
    } else if (msg.role === "user") {
      chatLog.innerHTML += `<div class="flex justify-end"><div class="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl px-6 py-4 mb-4 max-w-[75%] text-right font-mont font-medium shadow-lg"><span class="block text-xs text-gold font-bold mb-2 tracking-wide uppercase">You:</span>${msg.content}</div></div>`;
    } else if (msg.role === "assistant") {
      // Enhanced formatting for luxury brand feel
      let reply = msg.content;

      // Add space before the first step in a routine for cleaner separation
      reply = reply.replace(
        /(<div class=\"mb-6 bg-gradient-to-r from-gold\/10 to-transparent rounded-lg p-4 border-l-4 border-gold\">)/,
        '<div class="my-6"></div>$1'
      );

      // Format step-by-step beauty routines with luxury styling
      reply = reply.replace(
        /Step (\d+):\s*([^:]+)(?=\s|$)/g,
        '<div class="mb-6 bg-gradient-to-r from-gold/10 to-transparent rounded-lg p-4 border-l-4 border-gold">' +
          '<div class="flex items-center mb-3">' +
          '<span class="inline-block w-8 h-8 bg-gold text-black rounded-full text-sm font-bold flex items-center justify-center mr-3">$1</span>' +
          '<h3 class="font-bold text-black text-lg">$2</h3>' +
          "</div>" +
          "</div>"
      );

      // Format step descriptions that follow step titles
      reply = reply.replace(
        /(<\/div>\s*<\/div>)\s*([^<]+?)(?=\s*(?:Step \d+:|$))/g,
        '$1<div class="ml-11 text-gray-700 text-sm leading-relaxed">$2</div></div>'
      );

      // Format L'Oréal product names with consistent styling (before other formatting)
      reply = reply.replace(
        /\b(L'Oréal Paris\s+[^.,:;!?\n]*[A-Za-z0-9])/gi,
        '<span class="font-semibold text-black bg-gold/20 px-2 py-1 rounded-md">$1</span>'
      );

      // Format specific product line names with elegant styling
      reply = reply.replace(
        /\b(Revitalift|Infallible|True Match|Voluminous|Pureology|Age Perfect|Youth Code|Elvive|Dream|Magic|Color Riche|Superior Preference|Feria|Excellence|Preference|Colorista|Telescopic|Bambi Eye|Lash Paradise|Rouge Signature|Colour Riche|Glow Lock|Fresh Wear|Pro-Glow|Hydra Perfecte|Hydra Genius|Skin Paradise|Skin Perfection|Perfect Match|Skin Renew|Skin Expertise|Skin Genesis|Setting Spray|3-Second|24HR|Derm Intensives|Hyaluronic Acid|Anti-Wrinkle)\b/gi,
        '<span class="font-semibold text-black border-b border-gold/50 pb-0.5">$1</span>'
      );

      // Format recommendation phrases with consistent boundaries
      reply = reply.replace(
        /\b(I recommend|We recommend|Try|Consider using|For [^,]+, try)\s+([^.!?]*[.!?])/gi,
        '<strong class="text-black bg-gold/10 px-2 py-1 rounded-md">$1 $2</strong>'
      );

      // Format bold markdown with gold accent (clean up any remaining **)
      reply = reply.replace(
        /\*\*([^*]+)\*\*/g,
        '<span class="font-bold text-black border-b border-gold/70 pb-0.5">$1</span>'
      );

      // Format numbered lists with better styling
      reply = reply.replace(
        /^(\d+)\.\s+(.+)$/gm,
        '<div class="mb-3 flex items-start">' +
          '<span class="inline-block w-6 h-6 bg-gold text-black rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">$1</span>' +
          '<div class="text-gray-800">$2</div>' +
          "</div>"
      );

      // Create Beauty Genius link with proper styling
      const beautyGeniusLink = `<a href="https://www.lorealparisusa.com/" target="_blank" rel="noopener" class="font-bold text-gold underline hover:text-black transition-colors duration-200">Beauty Genius</a>`;

      const handoffMsg = `<div class="mt-4 pt-4 border-t border-gold border-opacity-30"><p class="text-sm text-gray-600">You can also explore personalized tools like ${beautyGeniusLink} on our main site for more support. 😊</p></div>`;

      // Only add if not already present
      if (!/beauty genius/i.test(reply)) {
        reply += handoffMsg;
      } else {
        // Replace existing Beauty Genius mentions with proper link
        reply = reply.replace(/(Beauty Genius)/gi, beautyGeniusLink);
        // Remove any standalone "here" links
        reply = reply.replace(
          /Just click <a[^>]*>here<\/a> to continue\./gi,
          ""
        );
      }

      chatLog.innerHTML += `<div class="flex justify-start"><div class="bg-gradient-to-br from-white to-gold/5 border-2 border-gold/20 rounded-xl px-6 py-5 mb-4 max-w-[85%] text-left font-mont shadow-lg"><span class="block text-xs text-gold font-bold mb-3 tracking-wide uppercase">Smart Advisor:</span><div class="text-gray-800 leading-relaxed text-base">${reply}</div></div></div>`;
    }
  });
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Show initial system prompt
renderMessages();

// This function sends the user's message to the API and updates the chat log
async function sendMessage(messageOverride) {
  // Use the provided message or get it from the input field
  const message = messageOverride || userInput.value.trim();
  if (!message) return;

  // Check if web search is enabled
  const webSearchEnabled = document.getElementById("webSearchCheckbox").checked;

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
      body: JSON.stringify({ messages, webSearchEnabled }),
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

  // Clear the input field if no message override was used
  if (!messageOverride) {
    userInput.value = "";
  }
}

// Global array to store selected products
let selectedProducts = [];

// Toggle selection for a product card
function toggleProductSelection(productId, productName, element) {
  // Check if the product is already in the selected list
  const index = selectedProducts.findIndex((p) => p.id === productId);

  if (index === -1) {
    // If not selected, add it to the list
    selectedProducts.push({ id: productId, name: productName });
    // Add a visual highlight to the card - updated for grid layout
    element.classList.add(
      "border-2",
      "border-gold",
      "bg-gold",
      "bg-opacity-10",
      "shadow-lg"
    );
    element.classList.remove("border-gray-200");
  } else {
    // If already selected, remove it from the list
    selectedProducts.splice(index, 1);
    // Remove the visual highlight
    element.classList.remove(
      "border-2",
      "border-gold",
      "bg-gold",
      "bg-opacity-10",
      "shadow-lg"
    );
    element.classList.add("border-gray-200");
  }
  // Update the list of selected products displayed to the user
  updateSelectedList();
  // Save to localStorage
  saveSelectedProducts();
  // Update the main area display
  updateSelectedProductsDisplay();
}

// Load selected products from localStorage on page load
function loadSelectedProducts() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    selectedProducts = JSON.parse(saved);
  }
}

// Save selected products to localStorage
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Clear all selected products
function clearSelectedProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedList();
  updateSelectedProductsDisplay();
  // Remove highlight from all product cards
  const grid = document.getElementById("productCards");
  if (grid) {
    Array.from(grid.children).forEach((card) => {
      card.classList.remove(
        "border-2",
        "border-gold",
        "bg-gold",
        "bg-opacity-10",
        "shadow-lg"
      );
      card.classList.add("border-gray-200");
    });
  }
}

// Function to update the displayed list of selected products
function updateSelectedList() {
  const listContainer = document.getElementById("selectedProductsList");
  if (!listContainer) return; // Exit if the container doesn't exist

  // If no products are selected, show a placeholder message
  if (selectedProducts.length === 0) {
    listContainer.innerHTML =
      "<span class='text-gray-400'>No products selected.</span>";
    return;
  }

  // Create an unordered list of the selected product names
  listContainer.innerHTML = `<ul class='list-disc ml-6 mt-2 text-sm text-gray-700'>${selectedProducts
    .map(
      (p) => `<li class='font-mont text-black text-base mb-1'>${p.name}</li>`
    )
    .join("")}</ul>`;
}

// Function to generate a beauty routine based on selected products
function generateRoutine() {
  // Check if any products have been selected
  if (selectedProducts.length === 0) {
    // Alert the user if no products are selected
    alert("Please select at least one product to generate a routine.");
    return;
  }

  // Create a list of the names of the selected products
  const productNames = selectedProducts.map((p) => p.name).join(", ");
  // Formulate the prompt to send to the AI
  const prompt = `Please create a personalized beauty routine for me using the following products: ${productNames}. I'm looking for a simple, step-by-step guide on how to use them together.`;

  // Send the prompt to the chatbot
  sendMessage(prompt);

  // Deselect all products after generating a routine
  selectedProducts = [];
  updateSelectedList();
  // Remove highlight from all product cards
  const grid = document.getElementById("productCards");
  if (grid) {
    Array.from(grid.children).forEach((card) => {
      card.classList.remove(
        "border-2",
        "border-gold",
        "bg-gold",
        "bg-opacity-10",
        "shadow-lg"
      );
      card.classList.add("border-gray-200");
    });
  }
}

// Fetch product data from the backend and render the product cards
async function loadProducts() {
  // Get the container for the product grid
  const grid = document.getElementById("productCards");
  if (!grid) return; // Exit if the grid doesn't exist

  try {
    // Fetch the list of products from the Cloudflare Worker
    const res = await fetch(`${workerUrl}/products`);
    const products = await res.json();

    // Store all products for filtering
    allProducts = products;

    // Render all products initially
    renderProducts(products);
  } catch (error) {
    // Show an error message if products can't be loaded
    grid.innerHTML =
      "<p class='text-red-500 col-span-full text-center py-4'>Unable to load products at this time. Please try again later.</p>";
  }
}

// Generate product description based on product name
function generateProductDescription(productName) {
  const descriptions = {
    "True Match Super-Blendable Foundation":
      "A lightweight, oil-free foundation that matches your skin's tone and undertone for a natural, seamless finish.",
    "RevitaLift Derm Intensives 1.5% Pure Hyaluronic Acid Serum":
      "An intensive anti-aging serum that plumps and hydrates skin with pure hyaluronic acid for smoother, more youthful-looking skin.",
    "True Match Lumi Glotion Natural Glow Essence":
      "A lightweight glow enhancer that adds natural-looking radiance to your complexion for a healthy, luminous glow.",
    "Voluminous Lash Paradise Washable Mascara":
      "An intense volume mascara that delivers dramatic lashes with feathery-soft texture and rich, intense color.",
    "Infallible 3-Second Setting Spray":
      "A quick-setting spray that locks makeup in place for all-day wear with a weightless, comfortable feel.",
    "RevitaLift Clinical 12% Pure Vitamin C Serum":
      "A powerful vitamin C serum that brightens skin and reduces dark spots for a more even, radiant complexion.",
    "Infallible Full Wear Concealer":
      "A full-coverage concealer that provides up to 24-hour wear with a natural finish that won't cake or crease.",
    "RevitaLift Triple Power Anti-Aging Moisturizer":
      "A multi-action moisturizer that targets wrinkles, firms skin, and evens tone for younger-looking skin.",
    "RevitaLift Derm Intensives 0.3% Pure Retinol Serum":
      "An anti-aging retinol serum that reduces fine lines and wrinkles while improving skin texture and tone.",
    "Age Perfect Rosy Tone Moisturizer":
      "A nourishing moisturizer that adds a subtle rosy tint while hydrating and protecting mature skin.",
    "RevitaLift Triple Power Eye Treatment":
      "An intensive eye treatment that targets crow's feet, puffiness, and dark circles for brighter, younger-looking eyes.",
    "EverPure Sulfate-Free Moisture Shampoo":
      "A gentle, sulfate-free shampoo that cleanses while preserving color and providing deep moisture to hair.",
    "Elvive Total Repair 5 Repairing Shampoo":
      "A repairing shampoo that targets 5 signs of damaged hair for stronger, healthier, more manageable locks.",
    "Elvive Dream Lengths Shampoo":
      "A length-strengthening shampoo that helps hair grow longer and stronger while preventing breakage.",
    "Infallible Infinite Black Liner":
      "A precise eyeliner that delivers intense black color with long-lasting, smudge-proof wear.",
    "Infallible Pro-Glow Foundation":
      "A luminous foundation that provides buildable coverage with a natural, radiant finish that lasts all day.",
    "Infallible Pro-Matte Foundation":
      "A matte foundation that provides full coverage with a long-lasting, shine-free finish perfect for oily skin.",
    "Colorista Fade-Defy Shampoo-In Color":
      "A temporary color shampoo that adds vibrant color to hair while cleansing and protecting against fading.",
  };

  return (
    descriptions[productName] ||
    "A premium L'Oréal Paris beauty product designed to enhance your natural beauty."
  );
}

// Restore visual state for selected products after page load
function restoreSelectedState() {
  const grid = document.getElementById("productCards");
  if (!grid) return;

  selectedProducts.forEach((selectedProduct) => {
    const card = grid.querySelector(`[data-id="${selectedProduct.id}"]`);
    if (card) {
      card.classList.add(
        "border-2",
        "border-gold",
        "bg-gold",
        "bg-opacity-10",
        "shadow-lg"
      );
      card.classList.remove("border-gray-200");
    }
  });
}

// =======================================
// PRODUCT SELECTION AND DRAWER FUNCTIONS
// =======================================

// Drawer functionality
let isDrawerOpen = false;
let allProducts = []; // Store all products for filtering

// Toggle product drawer
function toggleProductDrawer() {
  if (isDrawerOpen) {
    closeProductDrawer();
  } else {
    openProductDrawer();
  }
}

// Open product drawer
function openProductDrawer() {
  const drawer = document.getElementById("productDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const chatContainer = document.getElementById("chatContainer");

  drawer.classList.remove("closed");
  drawer.classList.add("open");
  overlay.classList.remove("hidden");
  chatContainer.classList.add("drawer-open");

  isDrawerOpen = true;

  // Focus on search input
  const searchInput = document.getElementById("productSearch");
  setTimeout(() => searchInput.focus(), 300);
}

// Close product drawer
function closeProductDrawer() {
  const drawer = document.getElementById("productDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const chatContainer = document.getElementById("chatContainer");

  drawer.classList.remove("open");
  drawer.classList.add("closed");
  overlay.classList.add("hidden");
  chatContainer.classList.remove("drawer-open");

  isDrawerOpen = false;

  // Update the selected products display in main area
  updateSelectedProductsDisplay();
}

// Filter products based on search input
function filterProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
  const productCards = document.getElementById("productCards");

  // Filter all products
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );

  // Re-render filtered products
  renderProducts(filteredProducts);
}

// Render products in the grid
function renderProducts(products) {
  const grid = document.getElementById("productCards");
  grid.innerHTML = "";

  products.forEach((prod) => {
    const card = document.createElement("div");
    card.setAttribute("data-id", prod.id);
    card.setAttribute("data-name", prod.name);
    card.className =
      "cursor-pointer p-3 border border-gray-200 rounded-lg hover:shadow-lg hover:border-gold transition-all duration-200 bg-white relative group";

    const description = generateProductDescription(prod.name);

    card.innerHTML = `
      <div class="aspect-square mb-2 overflow-hidden rounded-md bg-gray-100 relative">
        <img src="${prod.img}" alt="${prod.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center hidden">
          Image not available
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/98 via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
          <p class="text-white text-sm text-center leading-relaxed font-mont font-bold shadow-2xl" style="text-shadow: 0 0 12px #C9B037, 0 0 24px #C9B037, 2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8);">${description}</p>
        </div>
      </div>
      <h3 class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">${prod.name}</h3>
    `;

    card.onclick = () => toggleProductSelection(prod.id, prod.name, card);
    grid.appendChild(card);
  });

  // Restore selected state
  restoreSelectedState();
}

// Update selected products display in main area (when drawer is closed)
function updateSelectedProductsDisplay() {
  const display = document.getElementById("selectedProductsDisplay");

  if (selectedProducts.length === 0) {
    display.innerHTML = "";
    return;
  }

  display.innerHTML = `
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-gray-700">Selected Products (${
          selectedProducts.length
        }):</span>
        <button onclick="clearSelectedProducts()" class="text-xs text-red-500 hover:text-red-700 underline">Clear All</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${selectedProducts
          .map(
            (p) => `
          <span class="bg-gold/20 text-black text-xs px-2 py-1 rounded-full">${p.name}</span>
        `
          )
          .join("")}
      </div>
      <button onclick="generateRoutine()" class="w-full bg-black text-white rounded-lg px-4 py-2 font-mont font-semibold uppercase transition hover:bg-gold hover:text-black mt-3 text-sm">
        Generate Routine
      </button>
    </div>
  `;
}

// =======================================
// INITIALIZATION
// =======================================

// When the page is fully loaded, set up the app
window.addEventListener("DOMContentLoaded", () => {
  // Load selected products from localStorage first
  loadSelectedProducts();

  loadProducts(); // Load the product cards
  renderMessages(); // Display initial chat messages

  // Update the selected products list display
  updateSelectedList();
  updateSelectedProductsDisplay();

  // Set up the "Generate Routine" button
  const generateBtn = document.getElementById("generateRoutineBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", generateRoutine);
  }
});

// Allow pressing Enter to send a message from the input field
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
