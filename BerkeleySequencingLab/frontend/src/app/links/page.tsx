'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface LinkItem {
  name: string;
  url: string;
  description: string;
}

interface LinkCategory {
  title: string;
  links: LinkItem[];
}

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 inline-block ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const LinksPage = () => {
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

  const categories: LinkCategory[] = [
    {
      title: 'Berkeley Departments',
      links: [
        {
          name: 'Department of Molecular & Cell Biology (MCB)',
          url: 'https://mcb.berkeley.edu/',
          description: 'The home department of the DNA Sequencing Facility, dedicated to research in genetics, cell biology, and neuroscience.',
        },
        {
          name: 'Department of Chemistry',
          url: 'https://chemistry.berkeley.edu/',
          description: 'UC Berkeley\'s world-renowned Chemistry department, frequent users of sequencing services.',
        },
        {
          name: 'QB3 - California Institute for Quantitative Biosciences',
          url: 'https://qb3.berkeley.edu/',
          description: 'An interdisciplinary institute bridging biological sciences with quantitative methods and engineering.',
        },
        {
          name: 'Innovative Genomics Institute (IGI)',
          url: 'https://innovativegenomics.org/',
          description: 'A leading center for genome engineering research, co-founded by Jennifer Doudna at UC Berkeley.',
        },
      ],
    },
    {
      title: 'Sequencing Resources',
      links: [
        {
          name: 'NCBI BLAST',
          url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
          description: 'The Basic Local Alignment Search Tool for comparing nucleotide or protein sequences against databases.',
        },
        {
          name: 'Benchling',
          url: 'https://www.benchling.com/',
          description: 'A cloud-based platform for molecular biology research, including sequence design and lab notebook features.',
        },
        {
          name: 'SnapGene',
          url: 'https://www.snapgene.com/',
          description: 'Software for planning, visualizing, and documenting molecular biology procedures including sequence analysis.',
        },
      ],
    },
    {
      title: 'Primer Design Tools',
      links: [
        {
          name: 'Primer3',
          url: 'https://primer3.ut.ee/',
          description: 'An open-source tool for designing PCR primers, hybridization probes, and sequencing primers.',
        },
        {
          name: 'IDT OligoAnalyzer',
          url: 'https://www.idtdna.com/calc/analyzer',
          description: 'Analyze oligonucleotide properties including Tm, hairpins, self-dimers, and hetero-dimers.',
        },
      ],
    },
    {
      title: 'Bioinformatics',
      links: [
        {
          name: 'Galaxy',
          url: 'https://usegalaxy.org/',
          description: 'An open-source, web-based platform for accessible, reproducible, and transparent computational biomedical research.',
        },
        {
          name: 'UCSC Genome Browser',
          url: 'https://genome.ucsc.edu/',
          description: 'A comprehensive resource for genomic data visualization and analysis from the University of California, Santa Cruz.',
        },
      ],
    },
  ];

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#003262] text-white py-12">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold">Links &amp; Resources</h1>
            <p className="mt-3 text-[#FDB515] text-lg">Useful tools and references for sequencing and bioinformatics</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {categories.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-xl font-semibold text-[#003262] mb-4 border-b-2 border-[#FDB515] pb-2 inline-block">
                {category.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {category.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-[#FDB515] transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-[#003262] font-semibold group-hover:text-[#FDB515] transition-colors">
                        {link.name}
                        <ExternalLinkIcon />
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                      {link.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LinksPage;
