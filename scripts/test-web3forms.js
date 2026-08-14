const fetch = require('node-fetch');

async function run() {
  try {
    console.log("Sending request...");
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: "07d8b4b3-b6e5-4ef0-93c2-a02767d33abb",
        name: "Test",
        email: "test@example.com",
        message: "This is a test",
      }),
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
