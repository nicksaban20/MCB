'use client'

import { useState } from 'react'

import SpecifyOrderStep from './SpecifyOrderStep'

export default function SpecifyOrderPage() {
  const [formData, setFormData] = useState({
    sampleTypeStep1: '',
  })

  return <SpecifyOrderStep formData={formData} setFormData={setFormData} />
}
