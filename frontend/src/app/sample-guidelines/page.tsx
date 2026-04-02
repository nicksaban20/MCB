import Navbar from "../navbar/page";

export default function SampleGuidelinesPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar profilePicUrl="" user={null} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#003262] mb-2">
          Sample Preparation Guidelines
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Follow these guidelines to ensure the best sequencing results.
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          {/* DNA Concentration Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              DNA Concentration Requirements
            </h2>
            <p className="mb-3">
              Proper DNA concentration is critical for high-quality sequencing
              reads. Please quantify your DNA using a spectrophotometer
              (NanoDrop) or fluorometer (Qubit) before submission.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-r font-semibold">
                      Template Type
                    </th>
                    <th className="px-4 py-2 border-r font-semibold">
                      Concentration
                    </th>
                    <th className="px-4 py-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">Plasmid DNA</td>
                    <td className="px-4 py-2 border-r">100 &ndash; 200 ng/&micro;L</td>
                    <td className="px-4 py-2">
                      Miniprep or midiprep quality; A260/A280 between 1.8 and
                      2.0
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">PCR Product</td>
                    <td className="px-4 py-2 border-r">5 &ndash; 20 ng/&micro;L</td>
                    <td className="px-4 py-2">
                      Must be purified (column or gel extraction); single band
                      on gel
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 border-r">BAC / Cosmid</td>
                    <td className="px-4 py-2 border-r">200 &ndash; 500 ng/&micro;L</td>
                    <td className="px-4 py-2">
                      Higher concentration required due to larger template size
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Volume Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Volume Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">Minimum 15 &micro;L per reaction</span>{" "}
                of template DNA at the specified concentration.
              </li>
              <li>
                If submitting for multiple reactions from the same template,
                provide enough total volume to cover all reactions plus a small
                excess (e.g., 2 &ndash; 3 &micro;L extra).
              </li>
              <li>
                Do not submit samples in volumes less than 12 &micro;L, as the
                facility cannot guarantee reliable pipetting below this
                threshold.
              </li>
            </ul>
          </section>

          {/* Tube Labeling */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Tube Labeling Instructions
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Use <span className="font-medium">1.5 mL microcentrifuge tubes</span>{" "}
                (screw-cap preferred) or PCR strip tubes.
              </li>
              <li>
                Label each tube clearly on the <span className="font-medium">cap and side</span>{" "}
                with a permanent marker.
              </li>
              <li>
                Labels must match the sample names entered in the online order
                form exactly.
              </li>
              <li>
                Avoid overly long names. Use short, unique identifiers (e.g.,
                &quot;pUC19-F1&quot; rather than &quot;pUC19 plasmid forward primer reaction
                1&quot;).
              </li>
              <li>
                For plate submissions, label the plate with your name, date, and
                plate name on the seal.
              </li>
            </ul>
          </section>

          {/* Primer Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Primer Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Primers must be at a concentration of{" "}
                <span className="font-medium">10 &micro;M</span> (10 pmol/&micro;L).
              </li>
              <li>
                Provide a <span className="font-medium">minimum of 20 &micro;L</span>{" "}
                per primer per submission.
              </li>
              <li>
                Standard desalted primers are acceptable. HPLC or PAGE
                purification is not required for routine sequencing.
              </li>
              <li>
                The facility stocks common sequencing primers (M13F, M13R, T7,
                SP6, T3). If using a stock primer, indicate this in your order
                and do not submit a separate primer tube.
              </li>
              <li>
                Custom primers should be 18 &ndash; 25 bases in length with a Tm of
                50 &ndash; 65 &deg;C for best results.
              </li>
            </ul>
          </section>

          {/* Storage and Transport */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Storage and Transport
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Keep DNA and primer samples on <span className="font-medium">ice or at 4 &deg;C</span>{" "}
                during transport to the facility.
              </li>
              <li>
                For samples that will not be dropped off within a few hours of
                preparation, store at <span className="font-medium">-20 &deg;C</span>{" "}
                and transport on ice.
              </li>
              <li>
                Avoid repeated freeze-thaw cycles, which can degrade DNA
                quality.
              </li>
              <li>
                Ensure tube caps are securely closed to prevent evaporation or
                cross-contamination during transport.
              </li>
            </ul>
          </section>

          {/* Common Issues */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Common Issues and Troubleshooting
            </h2>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  No sequence / failed reaction
                </h3>
                <p>
                  Most commonly caused by insufficient DNA concentration or
                  degraded template. Verify concentration with a NanoDrop and
                  check sample integrity on an agarose gel before resubmitting.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Short reads (&lt; 300 bp)
                </h3>
                <p>
                  Often the result of impure DNA (high salt, ethanol carryover)
                  or secondary structures in the template. Try column-purifying
                  the sample or using a different primer binding site.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mixed / double peaks in chromatogram
                </h3>
                <p>
                  Indicates mixed template populations (e.g., multiple plasmids,
                  heterozygous sites, or contamination). Ensure your plasmid
                  prep is from a single colony or gel-purify your PCR product to
                  isolate a single band.
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Primer not binding
                </h3>
                <p>
                  Verify the primer sequence against your template. Ensure the
                  primer Tm is appropriate and that the primer is not binding to
                  a repetitive region. Redesign the primer if necessary.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Questions about sample preparation? Contact the facility at{" "}
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
