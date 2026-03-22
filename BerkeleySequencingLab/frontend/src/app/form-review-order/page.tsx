/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useRef, useEffect } from 'react'
import { AiOutlineDownload } from 'react-icons/ai'
import { createClient } from '@/utils/supabase/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'

export default function ReviewOrder({ formData, goBack, user }: any) {
  const { showToast } = useToast();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ReviewOrder received formData:', formData);
  }, [formData]);

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    if (!element) return;
  
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
  
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement;
      const style = getComputedStyle(el);
      if (style.color.includes("oklch")) {
        el.style.color = "#000";
      }
      if (style.backgroundColor.includes("oklch")) {
        el.style.backgroundColor = "#fff";
      }
    }
  
    html2canvas(clone).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "JPEG", canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
      pdf.save("dna_order_summary.pdf");
      document.body.removeChild(clone);
    }).catch((err) => {
      console.error("Error generating PDF:", err);
      document.body.removeChild(clone);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Sample Type:', formData.sampleTypeStep1);
      console.log('Full form data:', formData);

      if (!formData.firstName || !formData.lastName || !formData.sampleTypeStep1) {
        throw new Error('Missing required fields');
      }

      const { data: dnaOrderData, error: dnaOrderError } = await supabase
        .from('dna_orders')
        .insert([{
          user_id: user.id,
          sample_type: formData.sampleTypeStep1,
          dna_type: formData.dnaType || formData.dnaTypeSingle || formData.dnaTypeFull,
          dna_quantity: formData.dnaQuantity || formData.dnaConcentration,
          primer_details: formData.primerDetails,
          plate_name: formData.plateName || formData.plateNameFull || formData.plateNameLarge,
          status: 'pending'
        }])
        .select()
        .single();

      if (dnaOrderError) {
        throw new Error(`Failed to create DNA order: ${dnaOrderError.message}`);
      }

      // Handle both regular samples and Sanger samples
      const samplesToInsert = formData.sangerSamples || formData.samples || [];
      if (samplesToInsert.length > 0) {
        const dnaSamplesData = samplesToInsert.map((sample: Record<string, string>) => ({
          dna_order_id: dnaOrderData.id,
          sample_no: sample.no || sample.hash || '1',
          name: sample.name || sample.sampleName || `Sample ${sample.no || sample.hash || '1'}`,
          notes: sample.notes || sample.specialInstruction || ''
        }));

        const { error: dnaSamplesError } = await supabase
          .from('dna_samples')
          .insert(dnaSamplesData);

        if (dnaSamplesError) {
          throw new Error(`Failed to create DNA samples: ${dnaSamplesError.message}`);
        }
      }

      setOrderSubmitted(true);
      showToast("Order submitted successfully!", "success");

    } catch (error) {
      console.error('Error submitting order:', error);
      showToast(`Error submitting order: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    }
  };

  if (orderSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Thank you!</h2>
          <p>Your order has been submitted.</p>
        </div>
      </div>
    );
  }

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Get samples (either Sanger or regular)
  const samples = formData.sangerSamples || formData.samples || [];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div ref={contentRef} className="space-y-6">
        {/* Order Summary Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Summary</h2>
          <p className="text-sm text-gray-500 italic">lorem ipsum dolor set amet.</p>
        </div>

        {/* Contact Information */}
        <section className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
            <button className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="font-semibold">Name:</span> {formData.firstName} {formData.lastName}</p>
              <p><span className="font-semibold">Phone:</span> {formData.phone || "(123)456-7890"}</p>
              <p><span className="font-semibold">Email:</span> {formData.email || "jd@email.com"}</p>
              <p><span className="font-semibold">Address:</span> {formData.streetAddress || "123 Street Way"}, {formData.city || "City"}, {formData.state || "ST"} {formData.zipCode || "#####"}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Chartstring:</span> {formData.chartstring || "0123456789"}</p>
              <p><span className="font-semibold">PI:</span> {formData.pi || "Jane Doe"}</p>
              <p><span className="font-semibold">UC Dept/OC:</span> {formData.department || "UCB MCB"}</p>
            </div>
          </div>
        </section>

        {/* Drop-Off Information */}
        <section className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Drop-Off Information</h3>
            <button className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p><span className="font-semibold">Drop-Off Location:</span> {formData.dropOffLocation || "Building ###"}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Date Submitted:</span> {formattedDate}</p>
              <p><span className="font-semibold">Time Submitted:</span> {formattedTime}</p>
            </div>
          </div>
        </section>

        {/* Sample Information */}
        <section className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Sample Information</h3>
            <button className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          {/* Summary Info */}
          <div className="grid grid-cols-2 gap-6 text-sm mb-6">
            <div className="space-y-2">
              <p><span className="font-semibold">Sample Type:</span> {formData.sampleTypeStep1 || "Sanger"}</p>
              <p><span className="font-semibold">DNA Type:</span> {formData.dnaType || formData.dnaTypeSingle || formData.dnaTypeFull || "Plasmid"}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">DNA Quantity:</span> {formData.dnaQuantity || formData.dnaConcentration || "##"} ng/µL</p>
              <p><span className="font-semibold">Primer Details:</span> {formData.primerDetails || "Lorem ipsum"}</p>
            </div>
          </div>

          {/* Table */}
          {samples.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border border-gray-200 text-left text-sm">
                <thead className="bg-[#002676] text-white">
                  <tr>
                    <th className="px-4 py-2 border-r border-white">No.</th>
                    <th className="px-4 py-2 border-r border-white">Name</th>
                    <th className="px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((sample: Record<string, string>, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-4 py-2 border-r border-gray-200">
                        {sample.no || sample.hash || idx + 1}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        {sample.name || sample.sampleName || `Sample ${idx + 1}`}
                      </td>
                      <td className="px-4 py-2">
                        {sample.notes || sample.specialInstruction || "lorem ipsum dolor sit amet."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Download DNA Chart */}
          <div className="flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-[#002676] hover:underline"
            >
              <AiOutlineDownload className="w-4 h-4" />
              <span>Download DNA Chart</span>
            </button>
          </div>
        </section>

        {/* Checkboxes */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4"
            />
            <span>
              I have read the <Link href="/terms" className="font-bold underline text-[#002676] hover:text-[#001a5c]">Terms & Conditions</Link>.
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreedToGuidelines}
              onChange={(e) => setAgreedToGuidelines(e.target.checked)}
              className="w-4 h-4"
            />
            <span>
              The samples follow the <Link href="/sample-guidelines" className="font-bold underline text-[#002676] hover:text-[#001a5c]">Sample Guidelines</Link>.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200"
            onClick={goBack}
          >
            Back
          </button>
          <button
            type="button"
            disabled={!agreedToTerms || !agreedToGuidelines}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white ${
              agreedToTerms && agreedToGuidelines
                ? "bg-[#002676] hover:bg-[#001a5c]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
