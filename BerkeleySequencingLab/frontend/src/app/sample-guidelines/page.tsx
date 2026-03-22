'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const SampleGuidelinesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return null;

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#003262] text-white py-12">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold">Sample Guidelines</h1>
            <p className="mt-3 text-[#FDB515] text-lg">Preparation requirements for DNA sequencing submissions</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

          {/* General Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              General Requirements
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>All samples must be submitted in clearly labeled 1.5 mL microcentrifuge tubes or PCR strip tubes.</li>
              <li>Samples must be free of contaminants such as ethanol, salt, and detergents that may inhibit sequencing reactions.</li>
              <li>Each submission must be accompanied by a completed order form through the online portal.</li>
              <li>Samples should be stored at -20&deg;C if not submitted within 24 hours of preparation.</li>
              <li>The facility is not responsible for samples that arrive in poor condition due to improper handling or shipping.</li>
            </ul>
          </div>

          {/* DNA Sample Preparation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              DNA Sample Preparation
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Please prepare your DNA samples according to the specifications below. Submitting samples within the recommended ranges will maximize the likelihood of high-quality sequencing results.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003262] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Template Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Minimum Volume</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Concentration</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Plasmid DNA</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10 &micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">100&ndash;500 ng/&micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">500&ndash;1000 ng</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">PCR Products</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10 &micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">5&ndash;20 ng/&micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">50&ndash;200 ng</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">BAC / Cosmid DNA</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10 &micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">200&ndash;500 ng/&micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1000&ndash;2000 ng</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Genomic DNA</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10 &micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">100&ndash;500 ng/&micro;L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">500&ndash;1000 ng</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tube Labeling Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Tube Labeling Requirements
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>Write your sample name on the <strong>side</strong> and <strong>top</strong> of each tube using a permanent marker.</li>
              <li>Sample names must match exactly what you entered in the online order form.</li>
              <li>Use short, unique names (maximum 20 characters). Avoid special characters.</li>
              <li>If submitting multiple samples, number them sequentially (e.g., Sample_01, Sample_02).</li>
              <li>Place all tubes in a labeled zip-lock bag with your name and PI name written on the bag.</li>
            </ul>
          </div>

          {/* Primer Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Primer Guidelines
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003262] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Parameter</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Volume</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10 &micro;L minimum</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Concentration</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">3.2 pmol/&micro;L (3.2 &micro;M)</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Length</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">18&ndash;25 bases recommended</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Tm (Melting Temperature)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">50&ndash;65&deg;C</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">GC Content</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">40&ndash;60%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Free stock primers (M13 Forward, M13 Reverse, T7, SP6, T3) are available at no additional charge. Select them during order submission. Custom primers must be supplied by the user.
            </p>
          </div>

          {/* Sample Quality */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Sample Quality
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              High-quality DNA is essential for successful sequencing. Poor sample quality is the most common cause of sequencing failures. Please verify the following before submission:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>DNA should be purified using a column-based or equivalent purification method.</li>
              <li>A260/A280 ratio should be between 1.8 and 2.0, indicating minimal protein contamination.</li>
              <li>A260/A230 ratio should be greater than 2.0, indicating absence of organic contaminants.</li>
              <li>Run a small aliquot on an agarose gel to confirm a single, clean band at the expected size.</li>
              <li>Avoid repeated freeze-thaw cycles, which degrade DNA quality over time.</li>
              <li>PCR products should be cleaned up to remove residual primers, dNTPs, and polymerase.</li>
            </ul>
          </div>

          {/* Shipping Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Shipping Guidelines
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              For on-campus users, samples can be dropped off directly at the facility (251 LSA). For off-campus or external users, please follow these shipping instructions:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>Ship DNA samples at room temperature for overnight delivery, or on dry ice for longer transit times.</li>
              <li>Use parafilm to seal tube caps and prevent leakage during transit.</li>
              <li>Place tubes in a cushioned container to prevent breakage.</li>
              <li>Include a printed copy of your order confirmation inside the package.</li>
              <li>Ship Monday through Wednesday to avoid weekend delays.</li>
              <li>
                Address packages to: UC Berkeley DNA Sequencing Facility, 251 LSA, University of California, Berkeley, CA 94720.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
};

export default SampleGuidelinesPage;
