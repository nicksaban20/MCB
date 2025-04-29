'use client'

import React, { useState } from "react"
import {
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaPlus,
  FaDownload,
} from "react-icons/fa"
import Navbar from "../navbar/page"

// Sample data
const currentPlates = [
  "Plate 1234",
  "Plate 5678",
  "Plate 9012",
  "Plate 3456",
]
const pastPlates = [
  "Plate 0001",
  "Plate 0002",
  "Plate 0003",
  "Plate 0004",
  "Plate 0005",
]
const customers = [
  { name: "Buzzy Kim", samples: 7, color: "bg-green-500" },
  { name: "Alice Jo",   samples: 3, color: "bg-purple-400" },
  { name: "Raj Patel",  samples: 6, color: "bg-yellow-400" },
  { name: "Ming Li",    samples: 7, color: "bg-red-500" },
]

export default function Dashboard() {
  const [openCurrent, setOpenCurrent] = useState(true)
  const [openPast, setOpenPast]       = useState(false)
  const [activePlate, setActivePlate] = useState(currentPlates[0])

  // 1. Which customer is selected (index) or null
  const [selectedCustomer, setSelectedCustomer] = useState<number|null>(null)

  // 2. Each well's color (96 wells), initially all gray
  const [wellColors, setWellColors] = useState<string[]>(
    Array(96).fill("bg-gray-400")
  )

  // Toggle customer selection
  function toggleCustomer(idx: number) {
    setSelectedCustomer(prev => prev === idx ? null : idx)
  }

  // Paint a well: customer's color if selected, otherwise gray
  function paintWell(idx: number) {
    const newColor =
      selectedCustomer !== null
        ? customers[selectedCustomer].color
        : "bg-gray-400"

    setWellColors(prev => {
      const next = [...prev]
      next[idx] = newColor
      return next
    })
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-50 border-r p-4 space-y-6 text-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plate Selection</h3>
            <button className="flex items-center text-sm px-2 py-1 border rounded hover:bg-gray-200">
              <FaPlus className="mr-1" /> Add new plate
            </button>
          </div>

          {/* Current Plates */}
          <div>
            <button
              className="w-full flex justify-between items-center py-2 hover:bg-gray-200 rounded"
              onClick={() => setOpenCurrent(!openCurrent)}
            >
              <span className="font-medium">Current Plates</span>
              {openCurrent ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openCurrent && (
              <ul className="mt-2 space-y-2">
                {currentPlates.map(plate => (
                  <li key={plate}>
                    <label className="flex items-center space-x-2 bg-white p-2 rounded hover:bg-gray-100">
                      <input
                        type="radio"
                        name="plate"
                        checked={activePlate === plate}
                        onChange={() => setActivePlate(plate)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span>{plate}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past Finished Plates */}
          <div>
            <button
              className="w-full flex justify-between items-center py-2 hover:bg-gray-200 rounded"
              onClick={() => setOpenPast(!openPast)}
            >
              <span className="font-medium">Past Finished Plates</span>
              {openPast ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openPast && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {pastPlates.map(plate => (
                  <li key={plate}>
                    <label className="flex items-center space-x-2 bg-white p-2 rounded hover:bg-gray-100">
                      <input
                        type="radio"
                        name="platePast"
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span>{plate}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6 space-y-8">
          {/* Plate View */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">{activePlate}</h4>
            {/* Nested gray boxes */}
            <div className="bg-gray-100 p-4 rounded">
              <div className="bg-gray-200 p-2 rounded">
                <div className="grid grid-cols-12 gap-1">
                  {wellColors.map((colorClass, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-full ${colorClass} cursor-pointer`}
                      onClick={() => paintWell(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer / Samples List */}
          <div className="bg-white p-4 rounded shadow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Customer / Samples</h4>
              <button className="flex items-center text-sm px-2 py-1 border rounded hover:bg-gray-200">
                <FaPlus className="mr-1" /> Add new order
              </button>
            </div>
            <ul className="space-y-2 overflow-y-auto max-h-64">
              {customers.map((cust, idx) => (
                <li
                  key={idx}
                  className={`bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer
                    ${selectedCustomer === idx ? "ring-2 ring-blue-600" : ""}
                  `}
                  onClick={() => toggleCustomer(idx)}
                >
                  <div className="flex items-center">
                    <div className={`${cust.color} w-2 h-12 rounded-l-lg`} />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800">{cust.name}</p>
                      <p className="text-sm text-gray-600">
                        {cust.samples} Samples
                      </p>
                    </div>
                  </div>
                  <FaEllipsisV className="text-gray-500 ml-2" />
                </li>
              ))}
            </ul>
          </div>

          {/* Download button */}
          <div className="flex justify-end">
            <button className="flex items-center text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <FaDownload className="mr-2" /> Download DNA Chart
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
