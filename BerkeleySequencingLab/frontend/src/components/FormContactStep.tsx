"use client";

import React, { JSX, useState, useEffect } from "react";

const ORG_OPTIONS = ["UC Affiliated", "Off-Campus"] as const;

function orgFromFormData(formData: Record<string, unknown>): string {
  const v = formData.organization;
  if (typeof v === "string" && ORG_OPTIONS.includes(v as (typeof ORG_OPTIONS)[number])) {
    return v;
  }
  return "UC Affiliated";
}

export default function FormContactStep<T extends Record<string, unknown>>({
  formData,
  setFormData,
}: {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [organization, setOrganization] = useState(() => orgFromFormData(formData as Record<string, unknown>));

  const orgFromParent = (formData as Record<string, unknown>).organization
  useEffect(() => {
    setOrganization(orgFromFormData(formData as Record<string, unknown>))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when stored organization changes
  }, [orgFromParent])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      <div className="space-y-10">
        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>
          <div className="space-y-6">
            <div className="flex gap-6">
              <input
                type="text"
                placeholder="First Name"
                value={String(formData.firstName ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={String(formData.lastName ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={String(formData.email ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={String(formData.phone ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />
          </div>
        </div>

        {/* Mailing Address */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Mailing Address</h2>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Street Address"
              value={String(formData.streetAddress ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, streetAddress: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />
            <div className="flex gap-6">
              <input
                type="text"
                placeholder="City"
                value={String(formData.city ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
              />
              <input
                type="text"
                placeholder="State"
                value={String(formData.state ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={String(formData.zipCode ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Additional Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Organization:</label>
              <div className="flex gap-4">
                {ORG_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`inline-flex items-center space-x-2 cursor-pointer border rounded-lg px-4 py-2 transition ${
                      organization === option
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-300"
                    } hover:border-gray-400`}
                  >
                    <input
                      type="radio"
                      name="organization"
                      value={option}
                      checked={organization === option}
                      onChange={(e) => {
                        setOrganization(e.target.value);
                        setFormData((prev) => ({ ...prev, organization: e.target.value }));
                      }}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Organization Name"
              value={String(formData.department ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />
            <input
              type="text"
              placeholder="Principal Investigator"
              value={String(formData.pi ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pi: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />
            <input
              type="text"
              placeholder="Chartstring"
              value={String(formData.chartstring ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, chartstring: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676] h-12"
            />

            {/* Separator */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-600 px-4">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Attach a PO */}
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Attach a PO</h3>
                <p className="text-sm text-gray-600 italic">
                  lorem ipsum dolor set amet.
                </p>
              </div>
              <label
                htmlFor="poFile"
                className="flex flex-col items-center justify-center border-2 border-dashed border-[#002676] rounded-lg p-8 cursor-pointer hover:border-[#001a5c] transition w-64"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="poFile"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-gray-500 text-sm">Upload File</span>
                {file && (
                  <span className="mt-2 text-xs text-gray-700 text-center">
                    {file.name}
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
