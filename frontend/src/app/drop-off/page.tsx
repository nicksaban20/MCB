'use client';

import { FaStar } from 'react-icons/fa';
import React from 'react';

export default function LocationsSection() {
  const locations = [
    {
      place: "237 Stanley Hall",
      direction: "2nd floor cold room: on the left under the bench",
    },
    {
      place: "5th floor Latimer Hall",
      direction: "5th floor: by the freight elevator",
      star: true,
    },
    {
      place: "136 Weill Hall",
      direction: "1st floor cold room: on the left under the bench",
    },
    {
      place: "183 Li Ka Shing",
      direction: "1st floor freezer farm: small black refrigerator in NW corner",
    },
    {
      place: "317 Barker Hall",
      direction: "3rd floor cold room: on the right by the door",
    },
    {
      place: "329 Innovative Genomics Institute",
      direction: "3rd floor cold room: on the left under the bench",
    },
    {
      place: "Bakar Labs",
      direction: "Loading Dock: only available 4:00PM Monday–Friday",
      star: true,
    },
  ];

  return (
    <div className="w-full h-screen bg-center bg-no-repeat bg-contain" 
      style={{
        backgroundImage: `url('/assets/bglocation.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative h-[700px]">
        <div className="absolute top-10 left-10 w-[360px] p-6 bg-white rounded-lg shadow-lg">
          
          <img src="/assets/location.png" alt="Drop-off Icon" className="w-8 h-8 mb-2" />
          <h2 className="text-xl text-blue-800">Drop-Off Locations</h2>

          <hr className="my-2 border-gray-300"/>

          <p className="text-gray-600 text-sm mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
            Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis
            ligula consectetur, ultrices mauris.
          </p>

          <ul className="list-disc list-inside space-y-2 font-medium text-gray-900">
            {locations.map(({ place }, index) => (
              <li key={index}>{place}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}