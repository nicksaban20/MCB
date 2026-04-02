'use client';

import { useState } from 'react';
import Navbar from '../navbar/page';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: 'Ordering',
    items: [
      {
        question: 'How do I submit an order?',
        answer:
          'Log in to your account and navigate to the order form. Follow the 5-step process: select sample type, enter sample details, provide contact info, choose drop-off location, and review your order.',
      },
      {
        question: 'What sample types do you accept?',
        answer:
          'We accept Sanger sequencing samples including plasmids, PCR products, and other purified DNA templates.',
      },
      {
        question: 'Can I upload sample info via spreadsheet?',
        answer:
          'Yes, you can upload a CSV or XLSX file with your sample details in Step 2 of the order form.',
      },
    ],
  },
  {
    title: 'Sample Preparation',
    items: [
      {
        question: 'What concentration should my DNA be?',
        answer:
          'Plasmid DNA should be 100-200 ng/\u00B5L. PCR products should be 5-20 ng/\u00B5L depending on fragment size. See our Sample Guidelines for detailed requirements.',
      },
      {
        question: 'Do you provide primers?',
        answer:
          'We have a selection of common sequencing primers available. You can also submit your own custom primers with your samples.',
      },
      {
        question: 'How should I label my tubes?',
        answer:
          'Label each tube with your sample name matching your order form. Use permanent marker or printed labels.',
      },
    ],
  },
  {
    title: 'Results',
    items: [
      {
        question: 'How long until I get results?',
        answer:
          'Standard turnaround is 1-2 business days from sample drop-off. Rush service may be available upon request.',
      },
      {
        question: 'How do I access my results?',
        answer:
          'Results will be available through your dashboard once sequencing is complete. You will receive a notification when results are ready.',
      },
      {
        question: 'What file formats are results provided in?',
        answer:
          'Results include .ab1 trace files, .seq text files, and quality reports. You can view chromatograms directly in the portal.',
      },
    ],
  },
  {
    title: 'Billing',
    items: [
      {
        question: 'How is billing handled?',
        answer:
          'Billing is processed through UC Berkeley chartstrings. Provide your chartstring during the order process.',
      },
      {
        question: 'What are the current rates?',
        answer:
          'Please contact the facility directly for current pricing. Rates vary by sample type and volume.',
      },
    ],
  },
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Navbar profilePicUrl="" user={null} />
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-[#003262] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 mb-10">
            Find answers to common questions about our DNA sequencing services.
          </p>

          {faqData.map((section) => (
            <div key={section.title} className="mb-10">
              <h2 className="text-lg font-semibold text-[#003262] mb-4 border-b border-gray-200 pb-2">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const key = `${section.title}-${item.question}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div
                      key={key}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {item.question}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FAQPage;
