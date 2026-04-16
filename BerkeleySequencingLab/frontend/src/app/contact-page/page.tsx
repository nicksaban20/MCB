"use client";

import { JSX, useState } from "react";

import ContactPageForm, { emptyContactFormData, type ContactFormData } from "./ContactPageForm";

export default function ContactPage(): JSX.Element {
  const [formData, setFormData] = useState<ContactFormData>(emptyContactFormData);

  return <ContactPageForm formData={formData} setFormData={setFormData} />;
}
