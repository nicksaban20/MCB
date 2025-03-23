import React from 'react';
import Link from 'next/link';

const SequencingTxtLink = () => {
  return (
    <li className="hover:text-blue-600 cursor-pointer">
      <Link href="/sequencing-txt" className="text-blue-500 hover:text-blue-700">
        Nicole Lee, Sequencing TXT Processor
      </Link>
    </li>
  );
};

export default SequencingTxtLink;