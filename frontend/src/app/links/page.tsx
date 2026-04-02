import Navbar from "../navbar/page";

function LinkCard({
  name,
  href,
  description,
}: {
  name: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg p-4 hover:border-[#003262] hover:shadow-sm transition"
    >
      <h3 className="font-semibold text-[#003262] mb-1">{name}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <span className="text-xs text-gray-400 mt-2 block break-all">
        {href}
      </span>
    </a>
  );
}

export default function LinksPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar profilePicUrl="" user={null} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#003262] mb-2">
          Useful Links
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          External resources for sequencing, analysis, and lab software.
        </p>

        <div className="space-y-10">
          {/* UC Berkeley Resources */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              UC Berkeley Resources
            </h2>
            <div className="space-y-3">
              <LinkCard
                name="UC Berkeley MCB Department"
                href="https://mcb.berkeley.edu"
                description="Department of Molecular and Cell Biology at the University of California, Berkeley."
              />
              <LinkCard
                name="UC Berkeley DNA Sequencing Facility"
                href="https://mcb.berkeley.edu/barker/dnaseq/home"
                description="Official homepage for the UC Berkeley DNA Sequencing Facility, including pricing, hours, and submission information."
              />
            </div>
          </section>

          {/* Sequence Analysis Tools */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sequence Analysis Tools
            </h2>
            <div className="space-y-3">
              <LinkCard
                name="NCBI BLAST"
                href="https://blast.ncbi.nlm.nih.gov/Blast.cgi"
                description="Basic Local Alignment Search Tool for comparing nucleotide or protein sequences against public databases."
              />
              <LinkCard
                name="SnapGene Viewer"
                href="https://www.snapgene.com/snapgene-viewer"
                description="Free software for viewing and annotating DNA sequence files, including .ab1 chromatograms and plasmid maps."
              />
            </div>
          </section>

          {/* Lab Software */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lab Software
            </h2>
            <div className="space-y-3">
              <LinkCard
                name="Benchling"
                href="https://www.benchling.com"
                description="Cloud-based platform for molecular biology research, including sequence design, cloning, and notebook features."
              />
              <LinkCard
                name="ApE (A Plasmid Editor)"
                href="https://jorgensen.biology.utah.edu/wayned/ape/"
                description="Free, cross-platform plasmid editor for viewing and annotating DNA sequences, restriction analysis, and primer design."
              />
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Have a suggestion for a resource to add?{" "}
            <a
              href="/contact"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Let us know
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
