'use client';

import { FaStar } from 'react-icons/fa';

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
    <section className="bg-[#E6E8EC] px-10 py-20 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {/* Left Panel */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold text-black mb-2">
            Find the Best Time & Place For You
          </h2>
          <hr className="border-gray-400 mb-4" />
          <p className="mb-4 text-sm text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.
          </p>
          <div className="flex items-start gap-2">
            <FaStar className="text-[#FDB517] mt-1" />
            <p>Please email us for pickup.</p>
          </div>
        </div>

        {/* Right Panel - Locations Table */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 border-b border-gray-400 pb-2 mb-4">
            <h3 className="font-semibold text-gray-800">LOCATION</h3>
            <h3 className="font-semibold text-gray-800">DIRECTION</h3>
          </div>

          {locations.map(({ place, direction, star }, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4 border border-[#CBD5E1] rounded-lg p-4 mb-3 bg-white"
            >
              <span className="text-black">{place}</span>
              <span className="flex items-center gap-2">
                {direction}
                {star && <FaStar className="text-[#FDB517]" />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
