import React from 'react';
import Link from 'next/link';

type CardProps = {
  title: string;
  description: string;
};

const Card: React.FC<CardProps> = ({ title, description }) => (
  <div className="rounded-2xl border border-gray-300 p-6 w-full max-w-sm flex flex-col justify-between hover:shadow-md transition">
  <div className="flex flex-col items-start gap-4">
    <img src="/assets/dna.png" alt="DNA Icon" className="w-8 h-8" />
    <h3 className="text-lg text-black font-semibold">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
  <div className="flex justify-end mt-6">
  <Link href="/cell-line">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded">
          Find out more
        </button>
      </Link>
  </div>
  </div>
);

const OrderCarousel: React.FC = () => {
  const items = [
    {
      title: 'DNA QUANTIFICATION',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    },
    {
      title: 'SANGER',
      description:
        'Direct colony sequencing is now available. You pick the clone, we provide the data.',
    },
    {
      title: 'NANOPORE',
      description:
        'You provide a colony pick, plasmid, amplicon, etc. and we do the rest.',
    },
  ];

  return (
    <div className="py-12 px-4 bg-white">
      <h2 className="text-center text-black text-3xl font-semibold mb-10">Order Samples Today</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {items.map((item, index) => (
          <Card key={index} title={item.title} description={item.description} />
        ))}
      </div>
    </div>
  );
};

export default OrderCarousel;