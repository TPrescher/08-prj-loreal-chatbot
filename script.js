// Cloudflare Worker URL for API requests
const workerUrl = "https://loreal-worker.preschet.workers.dev";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value;

  // Show user's message in the chat window
  chatWindow.innerHTML = `<b>You:</b> ${message}<br><i>Thinking...</i>`;

  try {
    // Send the message to the Cloudflare Worker using fetch
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Send the message as an array of messages for OpenAI API
      body: JSON.stringify({
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    // Parse the response as JSON
    const data = await response.json();

    // Log the full response for debugging
    console.log('API response:', data);

    // Show the assistant's reply in the chat window
    let botReply = "(No reply)";
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      botReply = data.choices[0].message.content;
    }
    chatWindow.innerHTML = `<b>You:</b> ${message}<br><b>Bot:</b> ${botReply}`;
  } catch (error) {
    // Show an error message if something goes wrong
    chatWindow.innerHTML = `<b>You:</b> ${message}<br><b>Bot:</b> Sorry, there was an error connecting to the API.`;
  }

  // Clear the input box
  userInput.value = "";
});
