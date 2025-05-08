// PackageNotification.ts
import {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_USER_ID,
  } from "../database/emailjsConfig.ts";
  
  export async function sendPackageNotification(data: Record<string, unknown>) {
    const url = "https://api.emailjs.com/api/v1.0/email/send";
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_USER_ID,
      template_params: data,
    };
  
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error enviando email: ${errorText}`);
    }
  
    return await response.json();
  }
  