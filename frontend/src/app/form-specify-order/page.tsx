'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const sampleOptions = [
  'Sanger',
  'Nanopore',
  'DNA Quantification',
  'Fragment Analysis',
  'gDNA Purification',
  'hPSC Genetic Analysis',
  'Human Cell Line Authentication',
  'PCR Clean-Up Services',
  'Plasmid Prep',
]

export default function SpecifyOrder({ formData, setFormData }: any) {
  const [selected, setSelected] = useState<string>(formData.sampleTypeStep1 || "");

  return (
    <div className="w-full">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Specify Order</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Please select the type of sample you are submitting.
          </p>

          <div className="mt-10 space-y-10">
            <fieldset>
              <div className="space-y-6">
                {sampleOptions.map((option) => (
                  <div key={option} className="flex items-center gap-x-3">
                    <input
                      type="radio"
                      name="sampleType"
                      value={option}
                      checked={selected === option}
                      onChange={(e) => {
                        setSelected(e.target.value);
                        setFormData((prev: any) => ({
                          ...prev,
                          sampleTypeStep1: e.target.value,
                        }));
                        console.log('Setting sampleTypeStep1 to:', e.target.value);
                      }}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor={option} className="block text-sm font-medium leading-6 text-gray-900">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}
