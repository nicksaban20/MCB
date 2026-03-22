'use server'

import { Resend } from 'resend';

// Initialize Resend only when needed, and only if API key is provided
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phone: string;
  message: string;
}

interface FeedbackFormData {
  name: string;
  email: string;
  issueType: string;
  message: string;
}

export async function sendFeedbackEmail(formData: FeedbackFormData) {
  try {
    const { name, email, issueType, message } = formData;

    if (!name || !email || !message) {
      return { success: false, error: "Please fill out all required fields" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const resend = getResendClient();
    if (!resend) {
      console.error('Resend API key is not configured.');
      return { success: false, error: "Email service is not configured. Please contact the administrator." };
    }

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'berkeleysequencinglab@gmail.com',
      subject: `Feedback [${issueType}] from ${name}`,
      html: `
        <h2>New Feedback Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error: "Failed to send feedback. Please try again later." };
    }

    return { success: true };
  } catch (error) {
    console.error('Feedback email error:', error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

export async function sendContactEmail(formData: ContactFormData) {
  try {
    const { firstName, lastName, organization, email, phone, message } = formData;

    // simple validation
    if (!firstName || !lastName || !email || !message) {
      return {
        success: false,
        error: "Please fill out all required fields"
      };
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Please enter a valid email address"
      };
    }

    // Check if Resend is configured
    const resend = getResendClient();
    if (!resend) {
      console.error('Resend API key is not configured. Email functionality is disabled.');
      return {
        success: false,
        error: "Email service is not configured. Please contact the administrator."
      };
    }
    
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'berkeleysequencinglab@gmail.com',
      subject: `New contact form submission from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return {
        success: false,
        error: "Failed to send email. Please try again later."
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later."
    };
  }
}