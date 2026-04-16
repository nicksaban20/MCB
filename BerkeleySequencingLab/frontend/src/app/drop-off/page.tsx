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
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 33, 92, 0.45), rgba(10, 33, 92, 0.45)), url('/assets/bglocation.jpg')`,
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 py-8 sm:px-6 sm:py-10 lg:items-center lg:px-8">
        <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          <img src="/assets/location.png" alt="Drop-off Icon" className="mb-3 h-8 w-8" />
          <h2 className="text-2xl font-semibold text-[#0A215C] sm:text-3xl">
            Drop-Off Locations
          </h2>

          <hr className="my-4 border-gray-200" />

          <p className="mb-6 text-sm leading-6 text-gray-600 sm:text-base">
            Choose the drop-off spot that is most convenient for your lab. Starred
            locations are commonly used by the sequencing facility team.
          </p>

          <ul className="space-y-3 text-sm text-gray-900 sm:text-base">
            {locations.map(({ place, direction, star }, index) => (
              <li
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#FDB515]">
                    {star ? <FaStar aria-label="Priority location" /> : <span className="block h-2.5 w-2.5 rounded-full bg-[#0A215C]" />}
                  </span>
                  <div>
                    <p className="font-semibold text-[#0A215C]">{place}</p>
                    <p className="mt-1 text-gray-600">{direction}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
