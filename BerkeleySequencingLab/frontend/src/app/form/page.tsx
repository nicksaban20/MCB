"use client";

import { useState, useEffect } from "react";
import Navbar from '@/components/Navbar'
import SpecifyOrder from '../form-specify-order/page'
import FormContactStep from "@/components/FormContactStep";
import SampleDetails from "../form-sample-details/page";
import FormReviewOrder from '@/components/FormReviewOrder'
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

/* ================================
   MAIN PARENT COMPONENT: Form
================================ */
export default function Form() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
  
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
  
      setLoading(false);
    };
  
    checkAuth();
  }, [router]);

  // Global form data
const [formData, setFormData] = useState({
  // Step 1 & 2
  sampleTypeStep1: "",
  samples: [],
  dnaType: "",
  dnaQuantity: "",
  primerDetails: "",
  plateName: "",

  // ➕ Step 3 – Drop‑off
  dropOffLocation: "",
  dropOffDate: "",    // "YYYY‑MM‑DD"
  dropOffTime: "",    // "HH:mm"
  dropOffMeridiem: "",// "AM" | "PM"

  // Step 4 – Contact
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  department: "",
  pi: "",
  chartstring: "",
});

// We have 4 total steps
const steps = ["Specify Order", "Sample Details", "Contact", "Confirm & Submit"];

  // Go forward
  const handleNext = () => {
    // Example check for Step 1 if needed:
    if (currentStep === 1 && !formData.sampleTypeStep1) {
      alert("Please select a Sample Type first.");
      return;
    }
    console.log('Current formData:', formData);
    if (currentStep < 4) { 
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Go back (or cancel if on step 1)
  const handleBack = () => {
    if (currentStep === 1) {
      alert("Canceled. Returning to homepage, perhaps.");
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // Minimal placeholders for Steps 3 & 4:

  return (
    <>
    
      <Navbar profilePicUrl={""} user={user} />
      <div className="flex min-h-screen bg-[#F1F1F1] p-6 text-gray-600 gap-15">
        {/* LEFT NAV CONTAINER - Updated to match Figma design */}
        <div className="w-[300px] mt-10 bg-white  rounded-xl shadow-lg px-8 py-8 ml-10 flex flex-col h-full">
          {/* Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#003262]">
              {currentStep === 1 ? "SPECIFY ORDER" : 
              currentStep === 2 ? "SAMPLE DETAILS" : 
              currentStep === 3 ? "CONTACT" : "CONFIRM & SUBMIT"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Lorem ipsum dolor sit amet consectetur.
            </p>
          </div>

        {/* YELLOW INFO BOX */}
        <div className="flex items-start gap-3 bg-[#FFF5DB] border border-[#FDB515] rounded-lg mb-8 p-4">
            {/* Exclamation Icon */}
            <div className="ml-2 mr-1 flex font-[var(--font-inter)] items-center justify-center w-11 h-5 rounded-full bg-[#FFF5DB] border-2 border-[#003262] text-[#003262] text-sm">
              !
            </div>

          {/* Text Content */}
          <span className="text-[10px] leading-tight text-[#1a1a1a]">
            Please read through the <strong className="font-semibold">sampling guidelines</strong> before submitting order requests!
          </span>
        </div>

        <div className="space-y-6">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div key={index} className="relative flex items-center">
                  {/* Step Label */}
                  <div className="flex flex-col w-full">
                    <p className="text-xs text-gray-400">{`Step ${stepNumber}`}</p>
                    <p
                      className={`inter text-md ${isActive
                        ? "font-bold text-[#002676]"
                        : isCompleted
                          ? "font-bold text-gray-600"
                          : "font-bold text-gray-400"
                        }`}
                    >
                      {step}
                    </p>
                  </div>

                  {/* Circle (Bubble) + Vertical Lines */}
                  <div className="relative flex items-center ml-4">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isActive
                          ? "border-[#FDB515] bg-[#FDB515] shadow-[0_0_8px_rgba(253,181,21,0.5)]"
                          : isCompleted ? "border-[#FDB515] bg-[#FDB515]"
                            : "border-gray-300 bg-white"
                        }`}
                    >
                      {/* If active, show a checkmark SVG in white */}
                      {isCompleted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Vertical connector lines */}
                    {/* Connector above (if not first step) */}
                    {index > 0 && (
                      <div
                        className={`absolute left-[50%] bottom-6 w-0.5 h-6 ${index <= currentStep - 1 ? "bg-[#FDB515]" : "bg-gray-300"
                          }`}
                      ></div>
                    )}

                    {/* Connector below (if not last step) */}
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-[50%] top-6 w-0.5 h-6 ${index < currentStep - 1 ? "bg-[#FDB515]" : "bg-gray-300"
                          }`}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right form content */}
        <div className="w-3/4 mt-10 bg-white rounded-2xl border border-gray-300 shadow-lg px-6 py-6 ml-10 mr-15">
          <form className="space-y-4 p-10">

            {currentStep === 1 && (
              <SpecifyOrder formData={formData} setFormData={setFormData} />
            )}

            {currentStep === 2 && (
              <SampleDetails formData={formData} setFormData={setFormData} />
            )}

            {currentStep === 3 && (
              <FormContactStep formData={formData} setFormData={setFormData} />
            )}

            {currentStep === 4 && (
              <FormReviewOrder formData={formData} goBack={() => setCurrentStep(3)} user={user} />
            )}

            {currentStep < 4 && (
              <div className="flex justify-end mt-8 space-x-3">
                <button
                  type="button"
                  className="px-6 py-2 text-[#003262] border border-[#003262] rounded-lg hover:bg-[#FDB515] hover:text-[#003262] text-sm font-medium"
                  onClick={handleBack}
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-white rounded-lg text-sm font-medium bg-[#002676] hover:bg-[#001a5c]"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}