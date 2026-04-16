'use client'

import { useState } from 'react'

import ReviewOrderStep from './ReviewOrderStep'

export default function ReviewOrderPage() {
  const [formData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    chartstring: '',
    pi: '',
    department: '',
    dropOffLocation: '',
    sampleTypeStep1: '',
    dnaType: '',
    dnaTypeSingle: '',
    dnaTypeFull: '',
    dnaQuantity: '',
    dnaConcentration: '',
    primerDetails: '',
    plateName: '',
    plateNameFull: '',
    plateNameLarge: '',
    sangerSamples: [],
    samples: [],
  })

  return <ReviewOrderStep formData={formData} goBack={() => {}} user={null} />
}
