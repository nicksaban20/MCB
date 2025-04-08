'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phone: string;
  message: string;
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
    
    const { data, error } = await resend.emails.send({
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