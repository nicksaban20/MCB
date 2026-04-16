'use client'

import { useState } from 'react'

import DropOffStep from './DropOffStep'

export default function DropOffPage() {
  const [formData, setFormData] = useState({
    dropOffLocation: '',
    dropOffDate: '',
    dropOffTime: '',
    dropOffMeridiem: '',
  })

  return <DropOffStep formData={formData} setFormData={setFormData} />
}
