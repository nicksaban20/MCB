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
  'Cell Line Authentication',
  'PCR Clean-Up Services',
  'Plasmid Prep',
]

export default function SpecifyOrder({ formData, setFormData }: any) {
  const [selected, setSelected] = useState<string>(formData.sampleTypeStep1 || "");

  return (
    <div className="w-full">

      <h2 className="figtree mb-4 text-3xl font-bold text-[#3C445C] ml-20">
        Select Sample Type(s):
      </h2>

      <div className="figtree grid grid-cols-3 gap-6 justify-center ml-20 mr-20 mt-10 mb-10">
        {sampleOptions.map((opt) => {
          const selected = formData.sampleTypeStep1 === opt

          return (
            <label
              key={opt}
              className={`
                relative
                aspect-square 
                flex flex-col items-center justify-center
                p-4 pb-10
                bg-white border
                ${selected ? 'border-[#002676]' : 'border-gray-300'}
                rounded-xl shadow-sm
                cursor-pointer transition
                hover:border-gray-400
   
              `}
            >
              <input
                type="radio"
                name="sampleTypeStep1"
                value={opt}
                checked={selected}
                onChange={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    sampleTypeStep1: opt,
                  }))
                }
                className="sr-only p-10"
              />

              <div
                className={`
                  absolute top-10 flex items-center justify-center
                  w-6 h-6 rounded-full border-2
                  ${selected
                    ? 'bg-[#002676] border-[#002676]'
                    : 'bg-white border-gray-300'}
                `}
              >
                {selected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </label>
          );
          })}
          </div>
    </div>
  
    
  )
}
