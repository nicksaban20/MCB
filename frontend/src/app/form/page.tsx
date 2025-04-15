"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/page";
import ContactPage from "../contact-page/page";
import { AiOutlineDownload, AiOutlineCloudUpload } from "react-icons/ai";
import { createClient } from "@/utils/supabase/client";
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
/* ================================
   MAIN PARENT COMPONENT: Form
================================ */
export default function Form() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  // Global form data
  const [formData, setFormData] = useState({
    // Step 1 & 2
    sampleTypeStep1: "",
    samples: [],
    dnaType: "",
    dnaQuantity: "",
    primerDetails: "",
    plateName: "",
    
    // Step 3 - Contact
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    department: "",
    pi: "",
    chartstring: "",
  });

  // We have 5 total steps
  const steps = ["Specify Order", "Sample Details", "Contact", "Submit"];
  // Go forward
  const handleNext = () => {
    // Example check for Step 1 if needed:
    if (currentStep === 1 && !formData.sampleTypeStep1) {
      alert("Please select a Sample Type first.");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Go back (or cancel if on step 1)
  const handleBack = () => {
    if (currentStep === 1) {
      alert("Canceled. Returning to homepage, perhaps.");
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // Minimal placeholders for Steps 3 & 4:
  const StepThree = () => (
    <ContactPage formData={formData} setFormData={setFormData} />
  );

  const StepFour = () => (
    <div>
      <h2 className="text-xl font-medium">Step 4: Payment</h2>
      <p className="text-gray-500">Payment details go here...</p>
    </div>
  );

  return (
    <>
      <Navbar profilePicUrl={""} />
      <div className="flex min-h-screen bg-[#dfe1e6] p-6 text-gray-600 gap-15">
        {/* LEFT NAV CONTAINER */}
        <div className="w-1/6 mt-10 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] px-6 py-6 ml-10 max-h-[65vh]">
          {/* Title & Subtitle */}
          <h2 className="text-2xl font-bold text-[#002676] mb-1.5">
            {steps[currentStep - 1].toUpperCase()}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Lorem ipsum dolor sit amet consectetur.
          </p>

          {/* YELLOW INFO BOX */}
          <div className="flex items-center gap-2 p-2 bg-[#FFF5DB] border-1 border-[#feb516] rounded-xl mb-8">
            {/* Exclamation Icon */}
            <div className="ml-2 mr-1 flex font-[var(--font-inter)] items-center justify-center w-11 h-5 rounded-full bg-[#FFF5DB] border-2 border-black text-black text-sm">
              !
            </div>

            {/* Message Content */}
            <p className=" mt-1 mb-1 text-xs font-[var(--font-inter)] text-[#1a1a1a]">
              Please read through the{" "}
              <a
                href="/guidelines"
                className="font-semibold text-xs text-[#1a1a1a]"
                target="_blank"
                rel="noreferrer"

              >
                sampling guidelines
              </a>{" "}
              before submitting order requests!
            </p>
          </div>


          {/* STEP PROGRESS BUBBLES */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div key={index} className="relative flex items-center">
                  {/* Step Label */}
                  <div className="flex flex-col w-full">
                    <p className="text-xs text-gray-400">{`Step ${stepNumber}`}</p>
                    <p
                      className={`text-md ${isActive
                        ? "font-bold text-[#002676]"
                        : isCompleted
                          ? "font-bold text-gray-600"
                          : "font-bold text-gray-400"
                        }`}
                    >
                      {step}
                    </p>
                  </div>

                  {/* Circle (Bubble) + Vertical Lines */}
                  <div className="relative flex items-center ml-4">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${isActive
                          ? "border-yellow-500 bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                          : isCompleted ? "border-yellow-500 bg-yellow-500"
                            : "border-gray-300 bg-white"
                        }`}
                    >
                      {/* If active, show a checkmark SVG in white */}
                      {isCompleted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Vertical connector lines */}
                    {/* Connector above (if not first step) */}
                    {index > 0 && (
                      <div
                        className={`absolute left-[50%] bottom-6 w-0.5 h-6 ${index <= currentStep - 1 ? "bg-yellow-500" : "bg-gray-300"
                          }`}
                      ></div>
                    )}

                    {/* Connector below (if not last step) */}
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-[50%] top-6 w-0.5 h-6 ${index < currentStep - 1 ? "bg-yellow-500" : "bg-gray-300"
                          }`}
                      ></div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Right form content */}
        <div className="w-3/4 mt-10 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] px-6 py-6 ml-10 mr-15">
          <form className="space-y-4 p-10">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <StepOne formData={formData} setFormData={setFormData} />
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <StepTwo formData={formData} setFormData={setFormData} />
            )}

            {/* STEP 3 */}
            {currentStep === 3 && <StepThree />}


            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <ReviewOrder
                formData={formData}
                goBack={() => setCurrentStep(4)}
              />
            )}

            {/* Only show main nav buttons if < Step 5, because Step 5 has its own */}
            {currentStep < 4 && (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  className="w-17 py-1 text-gray-300 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                  disabled={currentStep === 1}
                  onClick={handleBack}
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>
                <button
                  type="button"
                  className="w-18 py-1 text-white rounded text-sm bg-[#1b3c84] hover:bg-[#002676]"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

/* ================================
   STEP 1: SPECIFY (Minimal)
================================ */
function StepOne({ formData, setFormData }: any) {
  // We have sampleTypeStep1 in formData
  const sampleOptions = [
    "Sanger",
    "Nanopore",
    "DNA Quantification",
    "Fragment Analysis",
    "gDNA Purification",
    "hPSC Genetic Analysis",
    "Human Cell Line Authentication",
    "PCR Clean-Up Services",
    "Plasmid Prep",
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-[#3C445C]">
          Please select a Sample Type to create a new order:
        </h2>
        <div className="relative group cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <div className="absolute z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
            TODO
          </div>
        </div>
      </div>


      <div className="space-y-3">
        {sampleOptions.map((opt) => (
          <label
            key={opt}
            className={`flex items-center px-3 py-3 border rounded-lg cursor-pointer transition
             ${formData.sampleTypeStep1 === opt
                ? "border-[#002676] bg-[#F0EFF4]"
                : "border-gray-300"
              }
             hover:border-gray-400`}
          >
            <input
              type="radio"
              name="sampleTypeStep1"
              value={opt}
              checked={formData.sampleTypeStep1 === opt}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  sampleTypeStep1: e.target.value,
                }))
              }
              className="hidden"
            />
            <div
              className={`w-4 h-4 border-2 rounded-full flex items-center justify-center mr-3
               ${formData.sampleTypeStep1 === opt
                  ? "border-[#002676] bg-[#002676]"
                  : "border-gray-400"
                }`}
            />
            <span className="w-full text-gray-400 text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ================================
   STEP 2: ASSIGN
================================ */
function StepTwo({ formData, setFormData }: any) {
  // 1) Our final row structure
  type SampleRow = {
    hash: string;               // The "#" column
    sampleName: string;         // "Sample Names"
    plasmidProtocol: string;    // "Plasmid"
    pcrProtocol: string;        // "PCR Products"
    specialInstruction: string; // "Special Instruction"
  };

  // 2) Local state
  const [samples, setSamples] = useState<SampleRow[]>([
    {
      hash: "",
      sampleName: "",
      plasmidProtocol: "",
      pcrProtocol: "",
      specialInstruction: "",
    },
  ]);

  const [dnaDataFile, setDnaDataFile] = useState<File | null>(null);
  const [sampleType, setSampleType] = useState("");
  const [dnaTypeSingle, setDnaTypeSingle] = useState("");
  const [dnaQuantity, setDnaQuantity] = useState("");
  const [primerDetails, setPrimerDetails] = useState("");
  const [plateNameFull, setPlateNameFull] = useState("");
  const [dnaTypeFull, setDnaTypeFull] = useState("");
  const [plateNameLarge, setPlateNameLarge] = useState("");
  const [manualSamplesNotes, setManualSamplesNotes] = useState("");

  // 3) Headers we need
  const requiredHeaders = [
    "Sample Names",
    "Plasmid",
    "PCR Products",
    "Special Instruction",
  ];

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;
  
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map((field) =>
      field.startsWith('"') && field.endsWith('"')
        ? field.slice(1, -1)
        : field
    );
  }
  
  // 4) CSV / XLSX Parsers
  const parseCsv = (csvText: string) => {
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (!lines.length) return [];

    let headerIndex = -1;
    let headerMap: Record<string, number> = {};

    for (let i = 0; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      let foundCount = 0;
      const colMap: Record<string, number> = {};
      requiredHeaders.forEach((req) => {
        const idx = cols.indexOf(req);
        if (idx !== -1) {
          foundCount++;
          colMap[req] = idx;
        }
      });
      if (foundCount === requiredHeaders.length) {
        headerIndex = i;
        headerMap = colMap;
        break;
      }
    }

    if (headerIndex === -1) {
      alert("CSV missing required columns!");
      return [];
    }

    const dataRows = lines.slice(headerIndex + 1);
    const out: SampleRow[] = [];

    // For each data row, first column is assumed to be "#"
    // But we skip if it's not numeric
    dataRows.forEach((line) => {
      const cols = splitCsvLine(line);
      // The # column is presumably the first cell, let's parse it
      const maybeNumber = parseInt(cols[0] || "", 10);
      if (isNaN(maybeNumber)) {
        // skip row if # is not a valid number
        return;
      }
      const row: SampleRow = {
        hash: String(maybeNumber),
        sampleName: cols[headerMap["Sample Names"]] || "",
        plasmidProtocol: cols[headerMap["Plasmid"]] || "",
        pcrProtocol: cols[headerMap["PCR Products"]] || "",
        specialInstruction: cols[headerMap["Special Instruction"]] || "",
      };
      out.push(row);
    });

    return out;
  };

  const parseXlsx = (arrayBuffer: ArrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    if (!sheetData.length) return [];

    let headerIndex = -1;
    let headerMap: Record<string, number> = {};

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i].map((cell) => (cell || "").toString().trim());
      let foundCount = 0;
      const colMap: Record<string, number> = {};
      requiredHeaders.forEach((req) => {
        const idx = row.indexOf(req);
        if (idx !== -1) {
          foundCount++;
          colMap[req] = idx;
        }
      });
      if (foundCount === requiredHeaders.length) {
        headerIndex = i;
        headerMap = colMap;
        break;
      }
    }

    if (headerIndex === -1) {
      alert("XLSX missing required columns!");
      return [];
    }

    const dataRows = sheetData.slice(headerIndex + 1);
    const out: SampleRow[] = [];

    // same logic: the # column is presumably the first cell
    dataRows.forEach((rawRow) => {
      const row = rawRow.map((cell) => (cell || "").toString().trim());
      // parse the # col
      const maybeNumber = parseInt(row[0] || "", 10);
      if (isNaN(maybeNumber)) {
        return; // skip if not numeric
      }
      out.push({
        hash: String(maybeNumber),
        sampleName: row[headerMap["Sample Names"]] || "",
        plasmidProtocol: row[headerMap["Plasmid"]] || "",
        pcrProtocol: row[headerMap["PCR Products"]] || "",
        specialInstruction: row[headerMap["Special Instruction"]] || "",
      });
    });

    return out;
  };

  // 5) handleFileChange checks extension, calls parse, sets samples
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setDnaDataFile(file);
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();
  
    const removeEmptyRows = (parsed: SampleRow[]) => {
      // Filter out rows that have a numeric # but all other columns empty
      const cleaned = parsed.filter((row) => {
        // Is the # column numeric?
        const isNumericHash = /^\d+$/.test(row.hash.trim());
  
        // Are all the other columns empty?
        const areOtherColsEmpty =
          !row.sampleName.trim() &&
          !row.plasmidProtocol.trim() &&
          !row.pcrProtocol.trim() &&
          !row.specialInstruction.trim();
  
        // Return false (remove the row) if hash is numeric AND other columns are all empty.
        // Otherwise, keep it.
        return !(isNumericHash && areOtherColsEmpty);
      });
  
      setSamples(cleaned);
    };
  
    if (fileName.endsWith(".csv")) {
      reader.onload = () => {
        const text = reader.result as string;
        const parsed = parseCsv(text) || [];
        removeEmptyRows(parsed);
      };
      reader.readAsText(file);
    } else if (fileName.endsWith(".xlsx")) {
      reader.onload = (evt) => {
        const buf = evt.target?.result;
        if (!buf) return;
        const parsed = parseXlsx(buf as ArrayBuffer) || [];
        removeEmptyRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or XLSX file.");
    }
  };

  // 6) addSampleRow + handleTableChange
  const addSampleRow = () => {
    setSamples((prev) => [
      ...prev,
      {
        hash: "",
        sampleName: "",
        plasmidProtocol: "",
        pcrProtocol: "",
        specialInstruction: "",
      },
    ]);
  };

  const handleTableChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "hash" | "sampleName" | "plasmidProtocol" | "pcrProtocol" | "specialInstruction"
  ) => {
    const updated = [...samples];
    updated[index][field] = e.target.value;
    setSamples(updated);
  };

  // 7) sync to formData
  const syncToFormData = () => {
    setFormData((prev: any) => ({
      ...prev,
      samples,
      dnaQuantity,
      primerDetails,
      plateName: plateNameFull || plateNameLarge,
      dnaType: dnaTypeSingle || dnaTypeFull,
    }));
  };

  // 8) Return the UI
  return (
    <div className="max-w-5xl mx-auto p-8" onBlur={syncToFormData}>
      {/* === Upload a DNA Data Table === */}
      <section className="flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-1/2">
          <h2 className="text-xl font-semibold">Upload a DNA Data Table</h2>
          <p className="text-sm text-gray-600 mb-4">
            lorem ipsum dolor set amet.
          </p>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center border border-gray-200 rounded-md p-8">
          <label
            htmlFor="dnaDataFile"
            className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-600"
          >
            <AiOutlineCloudUpload size={36} className="mb-2" />
            <span className="font-medium">Upload File</span>
          </label>
          <input
            id="dnaDataFile"
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
          {dnaDataFile && (
            <span className="mt-2 text-sm text-gray-700">
              Selected: {dnaDataFile.name}
            </span>
          )}
        </div>
      </section>

      {/* === Manually Enter Samples === */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Manually enter Samples</h2>
        <textarea
          value={manualSamplesNotes}
          onChange={(e) => setManualSamplesNotes(e.target.value)}
          placeholder="lorem ipsum dolor set amet."
          className="border p-2 w-full text-sm text-gray-600 mb-4"
        />
        <hr className="mb-4" />

        {/* Radio Sample Type */}
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <p className="mb-2 lg:mb-0 font-medium">
            Please select a Sample Type to create a new order:
          </p>
          {["Plasmid", "PCR Product", "Genomic DNA"].map((type) => (
            <label
              key={type}
              className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 px-3 py-2 rounded"
            >
              <input
                type="radio"
                name="sampleType"
                value={type}
                checked={sampleType === type}
                onChange={(e) => setSampleType(e.target.value)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        {/* Sample Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200 mb-4">
            <thead className="bg-[#002676] text-white">
              <tr>
                <th className="px-4 py-2 border-r text-white w-1/12 rounded-tl-lg">#</th>
                <th className="px-4 py-2 border-r w-1/5">Sample Names</th>
                <th className="px-4 py-2 border-r w-1/5">Plasmid Standard Protocol 50°C Annealing</th>
                <th className="px-4 py-2 border-r w-1/5">PCR Products Standard Protocol 50°C Annealing</th>
                <th className="px-4 py-2 w-1/5 rounded-tr-lg">Special Instruction</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample, index) => (
                <tr key={index} className="border-b border-gray-200">
                  {/* # */}
                  <td className="px-4 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full p-1 focus:outline-none"
                      placeholder="e.g. 1"
                      value={sample.hash}
                      onChange={(e) => handleTableChange(e, index, "hash")}
                    />
                  </td>

                  {/* Sample Names */}
                  <td className="px-4 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full p-1 focus:outline-none"
                      placeholder="e.g. Sample A"
                      value={sample.sampleName}
                      onChange={(e) => handleTableChange(e, index, "sampleName")}
                    />
                  </td>

                  {/* Plasmid Standard Protocol 50°C Annealing */}
                  <td className="px-4 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full p-1 focus:outline-none"
                      placeholder="Optional info"
                      value={sample.plasmidProtocol}
                      onChange={(e) => handleTableChange(e, index, "plasmidProtocol")}
                    />
                  </td>

                  {/* PCR Products Standard Protocol 50°C Annealing */}
                  <td className="px-4 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full p-1 focus:outline-none"
                      placeholder="Optional info"
                      value={sample.pcrProtocol}
                      onChange={(e) => handleTableChange(e, index, "pcrProtocol")}
                    />
                  </td>

                  {/* Special Instruction */}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="w-full p-1 focus:outline-none"
                      placeholder="Any special instructions..."
                      value={sample.specialInstruction}
                      onChange={(e) => handleTableChange(e, index, "specialInstruction")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addSampleRow();
          }}
          className="block w-full font-bold text-center bg-[#002676] text-white py-2 rounded-md"
        >
          Add a sample
        </button>
      </section>

      {/* Single Tube Orders */}
      <section>
        <p className="font-semibold mb-2">For Single Tube Orders:</p>
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <p className="font-semibold mb-2">DNA Type:</p>
          <div className="flex flex-wrap gap-5">
            {["ssDNA", "dsDNA", "PCR"].map((type) => (
              <label
                key={type}
                className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 px-3 py-2 rounded"
              >
                <input
                  type="radio"
                  name="dnaTypeSingle"
                  value={type}
                  checked={dnaTypeSingle === type}
                  onChange={(e) => setDnaTypeSingle(e.target.value)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <p className="text-sm mb-1">
          Specify DNA Quantity: <span className="text-xs text-gray-500">(if known)</span>
        </p>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="(ng/µL)"
            value={dnaQuantity}
            onChange={(e) => setDnaQuantity(e.target.value)}
            className="w-32 p-2 border border-gray-300 rounded"
          />
        </div>

        <p className="text-sm mb-1">
          Primer Details:
          <span className="text-xs text-gray-500 ml-1">
            (Specify primer name, concentration, or if included in the tube)
          </span>
        </p>
        <textarea
          placeholder="Type..."
          value={primerDetails}
          onChange={(e) => setPrimerDetails(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        {/* Full Plate Orders */}
        <p className="font-semibold mb-2">For Full Plate Orders:</p>
        <p className="text-sm mb-1">Plate Name:</p>
        <input
          type="text"
          placeholder="Type..."
          value={plateNameFull}
          onChange={(e) => setPlateNameFull(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <p className="font-semibold mb-2">DNA Type:</p>
          <div className="flex flex-wrap gap-4">
            {["ssDNA", "dsDNA", "PCR"].map((type) => (
              <label
                key={type}
                className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 px-3 py-2 rounded"
              >
                <input
                  type="radio"
                  name="dnaTypeFull"
                  value={type}
                  checked={dnaTypeFull === type}
                  onChange={(e) => setDnaTypeFull(e.target.value)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Large Templates */}
        <p className="text-sm mb-1">For Large Templates (&gt;10kb):</p>
        <p className="font-semibold mb-2">Plate Name:</p>
        <input
          type="text"
          placeholder="Type..."
          value={plateNameLarge}
          onChange={(e) => setPlateNameLarge(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </section>
    </div>
  );
}

/* ================================
   STEP 5: REVIEW ORDER
================================ */
function ReviewOrder({ formData, goBack }: any) {
  const supabase = createClient();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  const handleSubmit = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
  
      const userId = user?.id ?? 1; // fallback to 1 if user.id is null or undefined
  
      const address = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      console.log("Submitting user_profile:", {
        user_id: userId,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        address,
        chartstring: formData.chartstring,
        pi: formData.pi,
        department: formData.department,
      });
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          department: formData.department,
          pi: formData.pi,
          chartstring: formData.chartstring,
        }
      ]);
      
      if (error) {
        console.error("Supabase insert error:", error);
        alert("There was an error saving your contact information.");
        console.log("Submitting user_profile:", {
          user_id: userId,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          email: formData.email,
          address,
          chartstring: formData.chartstring,
          pi: formData.pi,
          department: formData.department,
        });
      } else {
        setOrderSubmitted(true);
        alert("Order Submitted!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error occurred.");
    }
  };
  

  if (orderSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Thank you!</h2>
          <p>Your order has been submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Order Summary</h2>
        <p className="text-gray-500">lorem ipsum dolor set amet.</p>
      </div>

      {/* (Contact Info) placeholder if you have them in formData */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Contact Information</h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => alert("Edit Contact Info (placeholder)")}
          >
            ✎
          </button>
        </div>
        <div className="border rounded p-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Name</span>:{" "}
              {formData.name || "John Doe"}
            </p>
            <p>
              <span className="font-semibold">Phone</span>:{" "}
              {formData.phone || "(123)456-7890"}
            </p>
            <p>
              <span className="font-semibold">Email</span>:{" "}
              {formData.email || "jd@email.com"}
            </p>
            <p>
              <span className="font-semibold">Address</span>:{" "}
              {formData.address || "123 Street Way, City, ST #####"}
            </p>
          </div>
          <div className="flex-1 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Chartstring</span>:{" "}
              {formData.chartstring || "0123456789"}
            </p>
            <p>
              <span className="font-semibold">PI</span>:{" "}
              {formData.pi || "Jane Doe"}
            </p>
            <p>
              <span className="font-semibold">UC Dept/OC</span>:{" "}
              {formData.department || "UCB MCB"}
            </p>
          </div>
        </div>
      </section>

      {/* (Sample Info) from StepOne & StepTwo */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Sample Information</h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => alert("Edit Sample Info (placeholder)")}
          >
            ✎
          </button>
        </div>
        <div className="border rounded p-4 flex flex-col md:flex-row gap-6 text-sm">
          <div className="flex-1 space-y-1">
            <p>
              <span className="font-semibold">Sample Type</span>:{" "}
              {formData.sampleTypeStep1 || "Sanger"}
            </p>
            <p>
              <span className="font-semibold">DNA Type</span>:{" "}
              {formData.dnaType || "Plasmid"}
            </p>
            <p>
              <span className="font-semibold">DNA Quantity</span>:{" "}
              {formData.dnaQuantity || "## ng/µL"}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <p>
              <span className="font-semibold">Primer Details</span>:{" "}
              {formData.primerDetails || "Lorem ipsum"}
            </p>
            <p>
              <span className="font-semibold">Plate Name</span>:{" "}
              {formData.plateName || "Lorem ipsum"}
            </p>
            <p>
              <span className="font-semibold">Date</span>:{" "}
              {formData.date || "MM/DD/YYYY"}
            </p>
          </div>
        </div>

        {/* Table from StepTwo */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full border text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-r">No.</th>
                <th className="px-3 py-2 border-r">Name</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(formData.samples || []).map(
                (
                  sample: { sampleNo: string; name: string; notes: string },
                  idx: number
                ) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2 border-r">
                      {sample.sampleNo || idx + 1}
                    </td>
                    <td className="px-3 py-2 border-r">
                      {sample.name || "Sample " + (idx + 1)}
                    </td>
                    <td className="px-3 py-2">
                      {sample.notes || "lorem ipsum dolor sit amet."}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm cursor-pointer">
          <AiOutlineDownload />
          <span
            onClick={() => alert("Download DNA Chart (placeholder)")}
            className="underline"
          >
            Download DNA Chart
          </span>
        </div>
      </section>

      {/* Checkboxes */}
      {!orderSubmitted && (
        <div className="text-sm space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span>
              I have read the{" "}
              <a className="underline" href="#!">
                Terms &amp; Conditions
              </a>
              .
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreedToGuidelines}
              onChange={(e) => setAgreedToGuidelines(e.target.checked)}
            />
            <span>
              The samples follow the{" "}
              <a className="underline" href="#!">
                Sample Guidelines
              </a>
              .
            </span>
          </label>
        </div>
      )}

      {/* Final Buttons */}
      {!orderSubmitted && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="border border-gray-400 px-6 py-2 rounded-md hover:bg-gray-100"
            onClick={goBack}
          >
            Back
          </button>
          <button
            disabled={!agreedToTerms || !agreedToGuidelines}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-md text-white ${agreedToTerms && agreedToGuidelines
              ? "bg-gray-900 hover:bg-gray-800"
              : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Submit Order
          </button>
        </div>
      )}
    </div>
  );
}
