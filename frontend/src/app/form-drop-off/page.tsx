'use client'
import { AiOutlineCloudUpload } from 'react-icons/ai' // if used; otherwise just react



export default function DropOff({ formData, setFormData }: any) {
  const locations = [
    "237 Stanley Hall",
    "5th Floor Latimer Hall",
    "136 Weill Hall",
    "183 Li Ka Shing",
    "317 Barker Hall",
    "329 Innovative Genomics Institute",
    "Bakar Labs",
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Drop‑off Information</h2>
      <p className="text-sm text-gray-500 mb-4">
        Indicate where you will drop off tubes.
      </p>

      {/* Location radio buttons */}
      {locations.map((loc) => (
        <label
          key={loc}
          className={`flex items-center border rounded-xl px-4 py-3 mb-3 cursor-pointer
          ${formData.dropOffLocation === loc ? "border-[#002676]" : "border-gray-300"}`}
        >
          <input
            type="radio"
            checked={formData.dropOffLocation === loc}
            onChange={() =>
              setFormData(prev => ({ ...prev, dropOffLocation: loc }))
            }
          />
          <span>{loc}</span>
        </label>
      ))}

      {/* Date + Time */}
      <div className="flex items-center gap-6 mt-6">
        <div>
          <p className="text-sm font-semibold mb-1">Drop‑Off Date:</p>
          <input
            type="date"
            className="border p-2 rounded"
            value={formData.dropOffDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, dropOffDate: e.target.value }))
            }
          />

        </div>

        <div>
        <p className="text-sm font-semibold mb-1">Time:</p>
        <input
          type="time"
          className="border p-2 rounded"
          value={formData.dropOffTime}
          onChange={e => {
            const [h, m] = e.target.value.split(':').map(Number)
            const mer = h >= 12 ? 'PM' : 'AM'
            setFormData(prev => ({
              ...prev,
              dropOffTime: e.target.value,
              dropOffMeridiem: mer
            }))
          }}
        />
      </div>

      </div>
    </div>
  );
}

  