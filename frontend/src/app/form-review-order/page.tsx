'use client'
import { useState, useRef, useEffect } from 'react'
import { AiOutlineDownload, AiOutlineMail } from 'react-icons/ai'
import { createClient } from '@/utils/supabase/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ReviewOrder({ formData, goBack, user }: { 
  formData: any; 
  goBack: () => void;
  user: any;
}) {
  const supabase = createClient();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const contentRef = useRef(null);

  // Add logging when component mounts
  useEffect(() => {
    console.log('ReviewOrder received formData:', formData);
  }, [formData]);

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    if (!element) return;
  
    // Clone the DOM node
    const clone = element.cloneNode(true) as HTMLElement;
  
    // Append clone off-screen
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
  
    // Walk the cloned DOM and override unsupported oklch colors
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
  
      // Optional: add more overrides here (borders, box shadows, etc.)
    }
  
    // Generate the PDF
    html2canvas(clone).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      
      pdf.addImage(imgData, "JPEG", canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
      pdf.save("dna_order_summary.pdf");
  
      // Clean up
      document.body.removeChild(clone);
    }).catch((err) => {
      console.error("Error generating PDF:", err);
      document.body.removeChild(clone);
    });
  };
  
  const handleDownloadAndMailto = async () => {
    const element = contentRef.current;
    if (!element) return;
  
    // Clone for cleaner rendering
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
  
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement;
      const style = getComputedStyle(el);
  
      if (style.color.includes("oklch")) el.style.color = "#000";
      if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "#fff";
    }
  
    try {
      const canvas = await html2canvas(clone);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
  
      pdf.addImage(imgData, "JPEG", canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
      pdf.save("dna_order_summary.pdf");
  
      // Open mail client
      const subject = encodeURIComponent("DNA Order Summary");
      const body = encodeURIComponent(
        "Hi,\n\nI'm sharing the DNA order summary. Please find the attached PDF.\n\n(You'll need to manually attach the downloaded file: dna_order_summary.pdf)"
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (err) {
      console.error("Failed to generate PDF or open email:", err);
    } finally {
      document.body.removeChild(clone);
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    try {
      // Initialize Supabase client
      const supabase = createClient();
      
      // Use the user prop instead of checking auth again
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Log the sample type for debugging
      console.log('Sample Type:', formData.sampleTypeStep1);
      console.log('Full form data:', formData);

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.sampleTypeStep1) {
        throw new Error('Missing required fields');
      }

      // Create the main dna_order
      const { data: dnaOrderData, error: dnaOrderError } = await supabase
        .from('dna_orders')
        .insert([{
          user_id: user.id,
          sample_type: formData.sampleTypeStep1,
          dna_type: formData.dnaType,
          dna_quantity: formData.dnaQuantity,
          primer_details: formData.primerDetails,
          plate_name: formData.plateName,
          status: 'pending'
        }])
        .select()
        .single();

      if (dnaOrderError) {
        throw new Error(`Failed to create DNA order: ${dnaOrderError.message}`);
      }

      // Insert samples if they exist
      if (formData.samples && formData.samples.length > 0) {
        // Insert into dna_samples
        const dnaSamplesData = formData.samples.map((sample: any) => ({
          dna_order_id: dnaOrderData.id,
          sample_no: sample.hash,
          name: sample.sampleName || `Sample ${sample.hash}`,
          notes: sample.specialInstruction || ''
        }));

        const { error: dnaSamplesError } = await supabase
          .from('dna_samples')
          .insert(dnaSamplesData);

        if (dnaSamplesError) {
          throw new Error(`Failed to create DNA samples: ${dnaSamplesError.message}`);
        }
      }

      setOrderSubmitted(true);
      alert("Order submitted successfully!");
      
    } catch (error) {
      console.error('Error submitting order:', error);
      console.log(formData.sampleTypeStep1);
      alert(`Error submitting order: ${error instanceof Error ? error.message : 'Unknown error'}`);
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


  return (
    <div ref={contentRef} className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Order Summary</h2>
        <p className="text-gray-500">lorem ipsum dolor set amet.</p>
      </div>

      {/* (Contact Info) placeholder if you have them in formData */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Contact Information</h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => alert("Edit Contact Info (placeholder)")}
          >
            ✎
          </button>
        </div>
        <div className="border rounded p-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Name</span>:{" "}
              {formData.firstName} {formData.lastName}
            </p>
            <p>
              <span className="font-semibold">Phone</span>:{" "}
              {formData.phone || "(123)456-7890"}
            </p>
            <p>
              <span className="font-semibold">Email</span>:{" "}
              {formData.email || "jd@email.com"}
            </p>
            <p><span className="font-semibold">Address</span>: 
              {formData.streetAddress}, {formData.city}, {formData.state} {formData.zipCode}
            </p>
          </div>
          <div className="flex-1 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Chartstring</span>:{" "}
              {formData.chartstring || "0123456789"}
            </p>
            <p>
              <span className="font-semibold">PI</span>:{" "}
              {formData.pi || "Jane Doe"}
            </p>
            <p>
              <span className="font-semibold">UC Dept/OC</span>:{" "}
              {formData.department || "UCB MCB"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Drop‑Off Information</h3>
        </div>
        <div className="border rounded p-4 flex flex-col md:flex-row gap-6 text-sm">
          <p className="flex-1">
            <span className="font-semibold">Location</span>:{" "}
            {formData.dropOffLocation || "—"}
          </p>
          <p className="flex-1">
            <span className="font-semibold">Date Submitted</span>:{" "}
            {formData.dropOffDate || "MM/DD/YYYY"}
          </p>
          <p className="flex-1">
          <span className="font-semibold">Time Submitted</span>:{" "}
          {formData.dropOffTime
            ? (() => {
                // parse 24‑h time and convert to 12‑h
                const [h, m] = formData.dropOffTime.split(":").map(Number);
                const hour12 = h % 12 || 12;
                const minute = m.toString().padStart(2, "0");
                const mer = h >= 12 ? "PM" : "AM";
                return `${hour12.toString().padStart(2, "0")}:${minute} ${mer}`;
              })()
            : "12:00 AM"}
        </p>
        </div>
      </section>

      {/* (Sample Info) from StepOne & StepTwo */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Sample Information</h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => alert("Edit Sample Info (placeholder)")}
          >
            ✎
          </button>
        </div>
        <div className="border rounded p-4 flex flex-col md:flex-row gap-6 text-sm">
          <div className="flex-1 space-y-1">
            <p>
              <span className="font-semibold">Sample Type</span>:{" "}
              {formData.sampleTypeStep1 || "Sanger"}
            </p>
            <p>
              <span className="font-semibold">DNA Type</span>:{" "}
              {formData.dnaType || "Plasmid"}
            </p>
            <p>
              <span className="font-semibold">DNA Quantity</span>:{" "}
              {formData.dnaQuantity || "## ng/µL"}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <p>
              <span className="font-semibold">Primer Details</span>:{" "}
              {formData.primerDetails || "Lorem ipsum"}
            </p>
            <p>
              <span className="font-semibold">Plate Name</span>:{" "}
              {formData.plateName || "Lorem ipsum"}
            </p>
            <p>
              <span className="font-semibold">Date</span>:{" "}
              {formData.date || "MM/DD/YYYY"}
            </p>
          </div>
        </div>

        {/* Table from StepTwo */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full border text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-r">No.</th>
                <th className="px-3 py-2 border-r">Name</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(formData.samples || []).map(
                (
                  sample: { hash: string; sampleName: string; specialInstruction: string },
                  idx: number
                ) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2 border-r">
                      {sample.hash || idx + 1}
                    </td>
                    <td className="px-3 py-2 border-r">
                      {sample.sampleName || `Sample ${idx + 1}`}
                    </td>
                    <td className="px-3 py-2">
                      {sample.specialInstruction || "No special instructions."}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          {/* Left side: Download */}
          <div className="flex items-center gap-1 text-blue-600 cursor-pointer">
            <AiOutlineDownload />
            <span onClick={handleDownloadPDF} className="underline">
              Download DNA Chart
            </span>
          </div>

          {/* Right side: Share */}
          <div
            onClick={handleDownloadAndMailto}
            className="flex items-center gap-1 text-blue-600 cursor-pointer underline"
          >
            <AiOutlineMail />
            <span>Share your data</span>
          </div>
        </div>

      </section>

      {/* Checkboxes */}
      {!orderSubmitted && (
        <div className="text-sm space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span>
              I have read the{" "}
              <a className="underline" href="#!">
                Terms &amp; Conditions
              </a>
              .
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreedToGuidelines}
              onChange={(e) => setAgreedToGuidelines(e.target.checked)}
            />
            <span>
              The samples follow the{" "}
              <a className="underline" href="#!">
                Sample Guidelines
              </a>
              .
            </span>
          </label>
        </div>
      )}

      {/* Final Buttons */}
      {!orderSubmitted && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="border border-gray-400 px-6 py-2 rounded-md hover:bg-gray-100"
            onClick={goBack}
          >
            Back
          </button>
          <button
            type="button"
            disabled={!agreedToTerms || !agreedToGuidelines}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-md text-white ${
              agreedToTerms && agreedToGuidelines
                ? "bg-gray-900 hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Submit Order
          </button>
        </div>
      )}
    </div>
  );
}