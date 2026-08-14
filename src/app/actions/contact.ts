"use server";

export async function submitContactForm(formData: FormData) {
  // 1. Honeypot check — silently succeed to fool bots
  const honey = formData.get('_honey');
  if (honey) {
    return { success: true };
  }

  // 2. Validate required fields
  const name = formData.get('name');
  const email = formData.get('email');
  const projectType = formData.get('projectType');
  const budget = formData.get('budget');
  const message = formData.get('message');

  if (!name || !email || !message) {
    return { success: false, error: "Missing required fields." };
  }

  // 3. Send via Web3Forms (rate limiting handled by Web3Forms itself)
  try {
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      console.error("Missing WEB3FORMS_ACCESS_KEY environment variable.");
      return { success: false, error: "Server configuration error. Please try again later." };
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        projectType,
        budget,
        message,
        subject: "New Contact Form Submission",
        from_name: "Agency Portfolio Contact Form",
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true };
    } else {
      console.error("Web3Forms error:", result);
      return { success: false, error: "Failed to send message. Please try again later." };
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

