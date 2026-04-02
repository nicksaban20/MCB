import Navbar from "../navbar/page";

export default function TermsPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar profilePicUrl="" user={null} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#003262] mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          UC Berkeley DNA Sequencing Facility
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              1. Sample Submission Guidelines
            </h2>
            <p>
              All users must follow the facility&apos;s sample submission
              guidelines when preparing and delivering samples. Samples that do
              not conform to the published preparation requirements may be
              rejected or may yield poor-quality results. Please review the{" "}
              <a
                href="/sample-guidelines"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Sample Preparation Guidelines
              </a>{" "}
              before submitting.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              2. Responsibility for Sample Quality
            </h2>
            <p>
              The facility is not responsible for poor sequencing results that
              arise from improperly prepared, degraded, or contaminated samples.
              It is the submitter&apos;s responsibility to ensure that DNA and
              primer samples meet the concentration, purity, and volume
              requirements specified in the sample guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              3. Confidentiality and Data Ownership
            </h2>
            <p>
              All sequencing results are treated as confidential. Data and
              results belong to the submitting party. The facility will not share
              sequencing results with any third party without the explicit
              written consent of the submitter. Users are responsible for
              downloading and backing up their own data within the retention
              period described below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              4. Payment Terms
            </h2>
            <p>
              Payment for sequencing services is expected within 30 days of
              results delivery. UC Berkeley users should provide a valid
              chartstring at the time of order submission. External or
              off-campus users may be subject to different billing arrangements;
              please contact the facility for details. Failure to provide
              payment may result in suspension of future sequencing services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              5. Right to Refuse Samples
            </h2>
            <p>
              The facility reserves the right to refuse any samples that do not
              meet the published requirements for concentration, volume,
              labeling, or safety. Samples containing hazardous materials must
              be clearly identified. The facility may also decline samples if
              capacity constraints prevent timely processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              6. Data Retention Policy
            </h2>
            <p>
              Sequencing results, including chromatogram files (.ab1) and
              sequence text files, are stored on facility servers for a period
              of six (6) months from the date of completion. After this period,
              data may be permanently deleted without notice. Users are strongly
              encouraged to download and archive their results promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              7. Limitation of Liability
            </h2>
            <p>
              The UC Berkeley DNA Sequencing Facility provides services on an
              as-is basis. While the facility strives for the highest quality
              results, it does not guarantee specific outcomes for any given
              sample. The facility&apos;s liability is limited to re-running the
              affected samples at no additional charge, at the facility&apos;s
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              8. Amendments
            </h2>
            <p>
              The facility reserves the right to update these terms and
              conditions at any time. Users will be notified of material changes
              through the facility website. Continued use of the facility&apos;s
              services constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            If you have questions about these terms, please contact the
            facility at{" "}
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
