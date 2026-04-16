'use client'

import React from 'react'

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
  'Other...',
]

export default function SpecifyOrder({ formData, setFormData }: any) {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <h2 className="figtree text-xl font-semibold text-[#3C445C] sm:text-2xl">
          Please select a Sample Type to start a new order
        </h2>
        <svg
          className="h-5 w-5 shrink-0 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="figtree flex flex-col gap-3">
        {sampleOptions.map((opt) => {
          const isSelected = formData.sampleTypeStep1 === opt

          return (
            <label
              key={opt}
              className={`
                relative
                flex items-center
                p-4
                bg-white border-2
                ${isSelected ? 'border-[#002676] bg-gray-50' : 'border-gray-300'}
                rounded-lg
                cursor-pointer transition
                hover:border-gray-400
              `}
            >
              <input
                type="radio"
                name="sampleTypeStep1"
                value={opt}
                checked={isSelected}
                onChange={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    sampleTypeStep1: opt,
                  }))
                }
                className="sr-only"
              />

              <div
                className={`
                  flex items-center justify-center
                  w-5 h-5 rounded-full border-2 mr-3
                  ${isSelected
                    ? 'bg-[#002676] border-[#002676]'
                    : 'bg-white border-gray-300'}
                `}
              >
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-gray-700 text-sm sm:text-base">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  )
}
