'use client';

import { useState } from 'react';
import Navbar from '../navbar/page';

export default function Form() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');

  const steps = ['Specify', 'Sample Details', 'Contact', 'Confirm & Submit'];

  const handleNext = () => {
    if (currentStep === 1 && !selectedType) return;
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100 p-6 text-gray-600 gap-10">
        <div className="w-1/3 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-1">
            {steps[currentStep - 1].toUpperCase()}
          </h2>
          <p className="mb-4 text-sm mb-8">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          <div className="relative space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center">
                <div className="flex flex-col w-full">
                  <p className="text-xs">{`Step ${index + 1}`}</p>
                  <p
                    className={`text-md ${
                      currentStep === index + 1
                        ? 'font-bold text-gray-700'
                        : 'font-bold text-gray-400'
                    }`}
                  >
                    {step}
                  </p>
                </div>

                <div className="relative flex items-center ml-4">
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
              ${
                currentStep === index + 1
                  ? 'bg-gray-700 border-gray-700'
                  : 'border-gray-700'
              }`}
                  >
                    {currentStep === index + 1 && (
                      <div className="w-2.5 h-2.5 rounded-full"></div>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="absolute left-[50%] bottom-5 w-0.5 h-10 bg-gray-600"></div>
                  )}

                  {index < steps.length - 1 && (
                    <div className="absolute left-[50%] top-5 w-0.5 h-10 bg-gray-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/4 bg-white shadow-md rounded-lg py-10 px-15 ml-6">
          <form className="space-y-4">
            {currentStep === 1 && (
              <div>
                <h2 className="block font-bold mb-2">
                  Please select a Sample Type to create a new order:
                </h2>

                <div className="space-y-3">
                  {[
                    'Sanger',
                    'Nanopore',
                    'DNA Quantification',
                    'Fragment Analysis',
                    'gDNA Purification',
                    'hPSC Genetic Analysis',
                    'Human Cell Line Authentication',
                    'PCR Clean-Up Services',
                    'Plasmid Prep',
                  ].map((type, index) => (
                    <label
                      key={index}
                      className={`flex items-center px-3 py-2 border rounded-lg cursor-pointer transition
                     ${
                       selectedType === type
                         ? 'border-gray-600 bg-gray-100'
                         : 'border-gray-300'
                     }
                     hover:border-gray-400`}
                    >
                      <input
                        type="radio"
                        name="sample_type"
                        value={type}
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 border-2 rounded-full flex items-center justify-center mr-3
                       ${
                         selectedType === type
                           ? 'border-gray-600 bg-gray-600'
                           : 'border-gray-400'
                       }`}
                      >
                      </div>

                      <span className="w-full text-gray-400 text-sm">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-medium">Sample Details</h2>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-medium">Contact Information</h2>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-medium">Confirm & Submit</h2>
              </div>
            )}

            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                className="w-17 py-1 text-gray-300 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                type="button"
                className={`w-18 py-1 text-white rounded text-sm ${
                  currentStep === 1 && !selectedType
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={handleNext}
              >
                {currentStep === steps.length ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
