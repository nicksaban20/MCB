import Navbar from "../navbar/page";

export default function ResultsGuidePage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar profilePicUrl="" user={null} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#003262] mb-2">
          Results Interpretation Guide
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          How to read, evaluate, and troubleshoot your Sanger sequencing
          results.
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          {/* How to Read Chromatograms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How to Read Chromatograms
            </h2>
            <p className="mb-3">
              A chromatogram (trace file) is the primary output of Sanger
              sequencing. Each base call is represented by a colored peak:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-3">
              <li>
                <span className="font-medium text-green-700">A (green)</span> &ndash;
                Adenine
              </li>
              <li>
                <span className="font-medium text-blue-700">C (blue)</span> &ndash;
                Cytosine
              </li>
              <li>
                <span className="font-medium text-black">G (black)</span> &ndash;
                Guanine
              </li>
              <li>
                <span className="font-medium text-red-600">T (red)</span> &ndash;
                Thymine
              </li>
            </ul>
            <p>
              Well-resolved peaks should be evenly spaced, roughly uniform in
              height, and clearly separated with minimal background noise. The
              best-quality data typically appears between positions 50 and 700
              in the trace. The first 30 &ndash; 50 bases often contain primer
              artifacts and should be treated with caution.
            </p>
          </section>

          {/* Understanding Quality Scores */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Understanding Quality Scores (Phred Scores)
            </h2>
            <p className="mb-3">
              Each base call is assigned a Phred quality score that estimates
              the probability of an incorrect call. Higher scores indicate
              greater confidence.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-r font-semibold">
                      Phred Score
                    </th>
                    <th className="px-4 py-2 border-r font-semibold">
                      Error Probability
                    </th>
                    <th className="px-4 py-2 font-semibold">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">10</td>
                    <td className="px-4 py-2 border-r">1 in 10</td>
                    <td className="px-4 py-2">90%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">20</td>
                    <td className="px-4 py-2 border-r">1 in 100</td>
                    <td className="px-4 py-2">99%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">30</td>
                    <td className="px-4 py-2 border-r">1 in 1,000</td>
                    <td className="px-4 py-2">99.9%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">40</td>
                    <td className="px-4 py-2 border-r">1 in 10,000</td>
                    <td className="px-4 py-2">99.99%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">50</td>
                    <td className="px-4 py-2 border-r">1 in 100,000</td>
                    <td className="px-4 py-2">99.999%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              A Phred score of 20 or above is generally considered acceptable.
              Scores above 30 are high quality. Most reliable sequence data
              will have an average Phred score of 30 or higher across the read.
            </p>
          </section>

          {/* Common Sequencing Artifacts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Common Sequencing Artifacts
            </h2>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Dye Blobs</h3>
                <p>
                  Broad, intense peaks that obscure the underlying sequence,
                  typically appearing in the first 50 &ndash; 100 bases. These are
                  caused by unincorporated fluorescent dye terminators. Dye
                  blobs do not indicate a problem with your template; the
                  sequence on either side of the blob is usually reliable. The
                  affected region can often be read by examining the raw data
                  more carefully or by sequencing from the opposite direction.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mixed Signals / Double Peaks
                </h3>
                <p>
                  Two or more overlapping peaks at the same position indicate
                  that the sequencing reaction contained multiple template
                  sequences. Common causes include mixed plasmid populations
                  (pick a single colony), heterozygous alleles in genomic DNA,
                  or contamination. For plasmid sequencing, re-streak and pick
                  an isolated colony.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Poly-A/T Slippage
                </h3>
                <p>
                  Homopolymer runs (e.g., AAAAAAA or TTTTTTT) can cause the
                  polymerase to slip, resulting in frameshift-like artifacts
                  downstream of the repeat. The signal after a long
                  homopolymer tract may appear mixed. Sequencing from the
                  opposite direction can help resolve the region.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Signal Decay / Early Termination
                </h3>
                <p>
                  A gradual loss of signal strength, with peaks becoming shorter
                  and noisier toward the end of the read. This is normal beyond
                  700 &ndash; 900 bases. If signal drops off much earlier (before 300
                  bases), it may indicate poor template quality, secondary
                  structure, or inhibitors in the sample.
                </p>
              </div>
            </div>
          </section>

          {/* When to Re-sequence */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              When to Re-sequence
            </h2>
            <p className="mb-3">Consider resubmitting your sample if:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                The read length is significantly shorter than expected (less
                than 300 bp for a typical plasmid).
              </li>
              <li>
                The chromatogram shows mixed peaks throughout the entire trace
                (not just at known heterozygous positions).
              </li>
              <li>
                There is no readable sequence at all (failed reaction).
              </li>
              <li>
                Quality scores are consistently below 20 across the region of
                interest.
              </li>
              <li>
                A critical region falls within a dye blob and cannot be read
                from the opposite direction.
              </li>
            </ul>
            <p className="mt-3">
              Before resubmitting, verify your DNA concentration and purity.
              Consider using a fresh miniprep or trying an alternative primer.
              If problems persist, contact the facility for troubleshooting
              assistance.
            </p>
          </section>

          {/* Recommended Software */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Recommended Software for Viewing .ab1 Files
            </h2>
            <p className="mb-3">
              The facility delivers results as .ab1 (chromatogram) files and
              .seq (plain text) files. The following free tools can open and
              analyze .ab1 files:
            </p>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  SnapGene Viewer
                </h3>
                <p className="text-sm mb-1">
                  Free, cross-platform viewer for .ab1 files with chromatogram
                  display, sequence alignment, and annotation features.
                </p>
                <a
                  href="https://www.snapgene.com/snapgene-viewer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  www.snapgene.com/snapgene-viewer
                </a>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  ApE (A Plasmid Editor)
                </h3>
                <p className="text-sm mb-1">
                  Lightweight, free plasmid editor that can open .ab1 files and
                  display chromatograms alongside sequence data.
                </p>
                <a
                  href="https://jorgensen.biology.utah.edu/wayned/ape/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  jorgensen.biology.utah.edu/wayned/ape
                </a>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Benchling
                </h3>
                <p className="text-sm mb-1">
                  Cloud-based molecular biology suite that supports .ab1 import,
                  chromatogram viewing, and sequence alignment against reference
                  sequences.
                </p>
                <a
                  href="https://www.benchling.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  www.benchling.com
                </a>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  4Peaks (macOS)
                </h3>
                <p className="text-sm mb-1">
                  Simple, fast chromatogram viewer for macOS. Good for quick
                  inspection of trace quality and base calls.
                </p>
                <a
                  href="https://nucleobytes.com/4peaks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  nucleobytes.com/4peaks
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Need help interpreting your results? Contact the facility at{" "}
            <a
              href="mailto:dnaseq@berkeley.edu"
              className="text-blue-600 underline hover:text-blue-800"
            >
              dnaseq@berkeley.edu
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
