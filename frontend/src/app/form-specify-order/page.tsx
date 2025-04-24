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
  'PCR Clean‑Up Services',
  'Plasmid Prep',
]


export default function SpecifyOrder({ formData, setFormData }: any) {
  // We have sampleTypeStep1 in formData
  const sampleOptions = [
    "Sanger",
    "Nanopore",
    "DNA Quantification",
    "Fragment Analysis",
    "gDNA Purification",
    "hPSC Genetic Analysis",
    "Human Cell Line Authentication",
    "PCR Clean-Up Services",
    "Plasmid Prep",
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-[#3C445C]">
          Please select a Sample Type to create a new order:
        </h2>
        <div className="relative group cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <div className="absolute z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
            TODO
          </div>
        </div>
      </div>


      <div className="space-y-3">
        {sampleOptions.map((opt) => (
          <label
            key={opt}
            className={`flex items-center px-3 py-3 border rounded-lg cursor-pointer transition
             ${formData.sampleTypeStep1 === opt
                ? "border-[#002676] bg-[#F0EFF4]"
                : "border-gray-300"
              }
             hover:border-gray-400`}
          >
            <input
              type="radio"
              name="sampleTypeStep1"
              value={opt}
              checked={formData.sampleTypeStep1 === opt}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  sampleTypeStep1: e.target.value,
                }))
              }
              className="hidden"
            />
            <div
              className={`w-4 h-4 border-2 rounded-full flex items-center justify-center mr-3
               ${formData.sampleTypeStep1 === opt
                  ? "border-[#002676] bg-[#002676]"
                  : "border-gray-400"
                }`}
            />
            <span 
              className={`w-full text-sm ${
                formData.sampleTypeStep1 === opt
                  ? "text-black font-semibold"
                  : "text-gray-400"
              }`}
            >
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}