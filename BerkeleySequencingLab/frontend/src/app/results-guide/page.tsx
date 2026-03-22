'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const ResultsGuidePage = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold">Results Interpretation Guide</h1>
            <p className="mt-3 text-[#FDB515] text-lg">Understanding your Sanger sequencing data</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

          {/* Understanding Your Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Understanding Your Results
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              After your sequencing run is complete, your results will be available for download through the online portal. Each sample produces several output files containing the raw and processed sequencing data. Understanding how to interpret these files is critical for accurate downstream analysis.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Results are typically available within 24 hours for standard Sanger sequencing reactions. You will receive an email notification when your data is ready. We recommend using SnapGene Viewer, ApE, or Benchling to view chromatogram files.
            </p>
          </div>

          {/* Reading Sanger Chromatograms */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Reading Sanger Chromatograms
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              A chromatogram (also called an electropherogram or trace) is a visual representation of the fluorescence signals detected during capillary electrophoresis. Each base (A, C, G, T) is represented by a different color peak.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h3 className="font-semibold text-green-800 mb-3">Good Chromatogram</h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>- Peaks are evenly spaced and well-resolved</li>
                  <li>- Each position shows a single dominant peak</li>
                  <li>- Signal intensity is strong and consistent throughout</li>
                  <li>- Minimal background noise between peaks</li>
                  <li>- Readable sequence extends 600&ndash;1000+ bases</li>
                  <li>- Clean baseline with no dye blobs or artifacts</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <h3 className="font-semibold text-red-800 mb-3">Poor Chromatogram</h3>
                <ul className="text-red-700 text-sm space-y-2">
                  <li>- Peaks are overlapping or poorly resolved</li>
                  <li>- Multiple peaks at the same position (mixed signals)</li>
                  <li>- Rapidly declining signal intensity</li>
                  <li>- High background noise making base calls unreliable</li>
                  <li>- Readable sequence less than 200 bases</li>
                  <li>- Dye blobs in the first 30&ndash;50 bases</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quality Scores (Phred) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Quality Scores (Phred)
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Phred quality scores are the standard measure of base-calling accuracy in sequencing. Each base in your sequence is assigned a Phred score that reflects the probability of an incorrect base call. Higher scores indicate greater confidence.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003262] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Phred Score</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Error Probability</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accuracy</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Quality Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">10</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 in 10</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">90%</td>
                    <td className="border border-gray-300 px-4 py-3 text-red-600 font-medium">Poor &mdash; unreliable</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">20</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 in 100</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">99%</td>
                    <td className="border border-gray-300 px-4 py-3 text-yellow-600 font-medium">Fair &mdash; acceptable for some uses</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">30</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 in 1,000</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">99.9%</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-medium">Good &mdash; reliable for most applications</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">40</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 in 10,000</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">99.99%</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-700 font-medium">Excellent &mdash; high confidence</td>
                  </tr>
                  <tr className="bg-green-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">50+</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">1 in 100,000+</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">99.999%+</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-800 font-medium">Outstanding &mdash; near-perfect accuracy</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              A Phred score of 20 or above (Q20) is generally considered acceptable. For critical applications such as mutation confirmation, aim for Q30 or higher across the region of interest.
            </p>
          </div>

          {/* Common Issues & Troubleshooting */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              Common Issues &amp; Troubleshooting
            </h2>

            <div className="space-y-5">
              <div className="border-l-4 border-[#FDB515] pl-4">
                <h3 className="font-semibold text-[#003262]">No Signal / Failed Reaction</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                  Possible causes include insufficient DNA template, degraded DNA, wrong primer, or contaminants inhibiting the reaction. Verify your DNA concentration with a spectrophotometer and ensure the primer anneals to the correct region.
                </p>
              </div>

              <div className="border-l-4 border-[#FDB515] pl-4">
                <h3 className="font-semibold text-[#003262]">Mixed / Double Peaks</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                  Multiple peaks at the same position indicate a mixed template population. This can result from a heterozygous sample, contamination with another template, or a mixed bacterial colony. Re-streak your colony or re-purify your PCR product.
                </p>
              </div>

              <div className="border-l-4 border-[#FDB515] pl-4">
                <h3 className="font-semibold text-[#003262]">Short Read Length</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                  If readable sequence drops off early (under 300 bases), the cause may be secondary structures (hairpins, GC-rich regions), low template quality, or excess salt. Try using a different primer location, adding DMSO, or re-purifying your DNA.
                </p>
              </div>

              <div className="border-l-4 border-[#FDB515] pl-4">
                <h3 className="font-semibold text-[#003262]">Dye Blobs / Artifacts</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                  Large broad peaks near the beginning of the trace (typically in the first 30&ndash;80 bases) are caused by unincorporated dye terminators. This region may still be readable if the underlying peaks are resolved. The facility performs a cleanup step, but excessive template can saturate the reaction.
                </p>
              </div>

              <div className="border-l-4 border-[#FDB515] pl-4">
                <h3 className="font-semibold text-[#003262]">Poly-A/T or Repeat Regions</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                  Homopolymer runs and repetitive sequences can cause slippage during polymerization, leading to mixed signals downstream. Consider sequencing from both directions and assembling a consensus to read through these regions.
                </p>
              </div>
            </div>
          </div>

          {/* File Formats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
              File Formats
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Your results will include files in the following formats. Each format serves a different purpose depending on your analysis needs.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-[#003262] mb-2">
                  <span className="bg-[#003262] text-white text-xs px-2 py-1 rounded mr-2 font-mono">.ab1</span>
                  ABI Chromatogram File
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The primary output file containing the raw chromatogram data, base calls, and quality scores. Open with SnapGene Viewer, ApE, 4Peaks, Benchling, or Chromas. This is the most important file for verifying your sequence.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-[#003262] mb-2">
                  <span className="bg-[#003262] text-white text-xs px-2 py-1 rounded mr-2 font-mono">.seq</span>
                  Plain Text Sequence File
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  A simple text file containing only the base-called nucleotide sequence (A, C, G, T, and N for ambiguous calls). This file can be opened with any text editor and is suitable for direct input into BLAST or alignment tools.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-[#003262] mb-2">
                  <span className="bg-[#003262] text-white text-xs px-2 py-1 rounded mr-2 font-mono">.scf</span>
                  Standard Chromatogram Format
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  A standardized, vendor-neutral format for chromatogram data. Contains trace data, base calls, positions, and quality values. Supported by most bioinformatics software and commonly used for archival purposes and data exchange.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ResultsGuidePage;
