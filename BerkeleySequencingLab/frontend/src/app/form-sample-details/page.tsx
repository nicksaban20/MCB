'use client'

import { useState } from 'react'

import SampleDetailsStep from './SampleDetailsStep'

export default function SampleDetailsPage() {
  const [formData, setFormData] = useState({
    sampleTypeStep1: '',
    samples: [],
    sangerSamples: [],
    dnaType: '',
    dnaTypeSingle: '',
    dnaTypeFull: '',
    dnaQuantity: '',
    dnaConcentration: '',
    primerDetails: '',
    plateName: '',
    plateNameFull: '',
    plateNameLarge: '',
    solvent: '',
    primerIncluded: '',
    highGCContent: '',
  })

  return <SampleDetailsStep formData={formData} setFormData={setFormData} />
}
