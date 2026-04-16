"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import SpecifyOrderStep from '../form-specify-order/SpecifyOrderStep'
import ContactPageForm from "../contact-page/ContactPageForm";
import SampleDetailsStep from "../form-sample-details/SampleDetailsStep";
import ReviewOrderStep from '../form-review-order/ReviewOrderStep'
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
      <div className="flex min-h-screen flex-col gap-6 bg-[#F1F1F1] p-4 text-gray-600 sm:p-6 xl:flex-row xl:gap-10">
        {/* LEFT NAV CONTAINER - Updated to match Figma design */}
        <div className="mt-4 flex h-full w-full flex-col rounded-xl bg-white px-5 py-6 shadow-lg sm:px-8 sm:py-8 xl:mt-10 xl:w-[300px] xl:shrink-0">
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
                <div key={index} className="relative flex items-center justify-between gap-4">
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
                  <div className="relative ml-2 flex shrink-0 items-center sm:ml-4">
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
        <div className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 shadow-lg sm:px-6 sm:py-6 xl:mt-10 xl:flex-1">
          <form className="space-y-4 p-0 sm:p-2 lg:p-6">

            {currentStep === 1 && (
              <SpecifyOrderStep formData={formData} setFormData={setFormData} />
            )}

            {currentStep === 2 && (
              <SampleDetailsStep formData={formData} setFormData={setFormData} />
            )}

            {currentStep === 3 && (
              <ContactPageForm
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {currentStep === 4 && (
              <ReviewOrderStep
                formData={formData}
                goBack={() => setCurrentStep(3)}
                user={user}
              />
            )}

            {currentStep < 4 && (
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-[#003262] px-6 py-2 text-sm font-medium text-[#003262] hover:bg-[#FDB515] hover:text-[#003262] sm:min-w-[120px]"
                  onClick={handleBack}
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#002676] px-6 py-2 text-sm font-medium text-white hover:bg-[#001a5c] sm:min-w-[120px]"
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
