"use client";

import React from "react";

export default function CellLineAuthentication() {
  return (
    <section className="bg-white rounded-lg shadow px-6 py-8 space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-[#002676]">DNA Quantification</h2>

      <p className="text-gray-700">
        We perform <span className="font-semibold">Human Cell Line Authentication</span> using
        Short Tandem Repeat DNA profiling (STR Profiling) to confirm the identity of your cells.
        <br />
        <span className="text-red-600 font-semibold">Note:</span> This assay does <strong>not</strong> work
        for mouse or other mammalian cell lines.
      </p>

      <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 text-sm text-gray-800">
        Validate your cell lines <strong>before publishing</strong> to save time, energy, and money.
      </div>

      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2">Pricing</h3>
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li><strong>$100</strong> per cell line for UC labs</li>
          <li>Add <strong>10%</strong> for LBNL and CHORI</li>
          <li>Add <strong>61%</strong> for all others</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2">What’s Included</h3>
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li>Genomic DNA extraction + QC</li>
          <li>PCR amplification of 9 STR loci + Amelogenin</li>
          <li>Fragment analysis using ABI 3730XL DNA Analyzer</li>
          <li>Comprehensive analysis using ABI GeneMapper software</li>
          <li>Final identity check against ATCC and DSMZ databases</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2">Turnaround & Shipping</h3>
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li>CLA process starts <strong>every Thursday</strong></li>
          <li>Turnaround time: <strong>3–5 business days</strong></li>
          <li>Ship via FedEx for Thursday AM delivery (before 10:30am preferred)</li>
          <li>Samples received Thursday PM will be processed <strong>next week</strong> (unless &gt;20 samples)</li>
        </ul>
      </div>

      <div className="border-l-4 border-red-500 bg-red-50 pl-4 py-2">
        <h4 className="font-semibold text-red-600 mb-1">Important Safety Notice</h4>
        <p className="text-sm text-gray-700">
          <strong>No infectious or potentially infectious samples</strong> without prior staff approval.
          BSL2+ cell lines must be submitted as <strong>cell lysates</strong>. All samples are processed
          in a BSL1 lab.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2">Submission Guidelines</h3>
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li>Use 1.5mL flip-cap (Eppendorf-style) tubes</li>
          <li>Clearly label: top & side of tube with unique sample name</li>
          <li>Side label should include: your name, cell line origin (e.g., HeLa), and submission date</li>
          <li>Use alcohol-resistant ink or durable labels (e.g., Tough-Tags)</li>
          <li>Sample names must be <strong>unique</strong> and contain <strong>no spaces or special characters</strong> (allowed: <code>- + . ( ) {'{}'} _</code>)</li>
        </ul>
      </div>
    </section>
  );
}
