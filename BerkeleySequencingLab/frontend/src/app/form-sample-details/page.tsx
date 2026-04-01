'use client'
import { useEffect, useState } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import * as XLSX from 'xlsx'

export type SampleRow = {
  hash: string
  sampleName: string
  plasmidProtocol: string
  pcrProtocol: string
  specialInstruction: string
}

// New type for Sanger-specific sample rows
type SangerSampleRow = {
  no: string
  name: string
  notes: string
  tubeType: string
}

export default function SampleDetails({ formData, setFormData }: any) {
  const isSanger = formData.sampleTypeStep1 === "Sanger";

  // If Sanger, render the new design
  if (isSanger) {
    return <SangerSampleDetails formData={formData} setFormData={setFormData} />;
  }

  // Otherwise, render the existing design
  return <OriginalSampleDetails formData={formData} setFormData={setFormData} />;
}

// New Sanger-specific component
function SangerSampleDetails({ formData, setFormData }: any) {
  const [sangerSamples, setSangerSamples] = useState<SangerSampleRow[]>(
    formData.sangerSamples?.length
      ? formData.sangerSamples
      : [
          { no: "1", name: "", notes: "", tubeType: "" },
          { no: "2", name: "", notes: "", tubeType: "" },
          { no: "3", name: "", notes: "", tubeType: "" },
        ]
  );
  
  const [dnaDataFile, setDnaDataFile] = useState<File | null>(null);
  const [dnaType, setDnaType] = useState(formData.dnaType || "");
  const [dnaTypeSingle, setDnaTypeSingle] = useState(formData.dnaTypeSingle || "");
  const [dnaConcentration, setDnaConcentration] = useState(formData.dnaConcentration || formData.dnaQuantity || "");
  const [solvent, setSolvent] = useState(formData.solvent || "");
  const [primerIncluded, setPrimerIncluded] = useState(formData.primerIncluded || "");
  const [primerDetails, setPrimerDetails] = useState(formData.primerDetails || "");
  const [plateNameFull, setPlateNameFull] = useState(formData.plateNameFull || "");
  const [dnaTypeFull, setDnaTypeFull] = useState(formData.dnaTypeFull || "");
  const [plateNameLarge, setPlateNameLarge] = useState(formData.plateNameLarge || "");
  const [highGCContent, setHighGCContent] = useState(formData.highGCContent || "");

  const updateParent = (updates: Record<string, string | SangerSampleRow[]>) => {
    setFormData((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setDnaDataFile(file);
    // Handle file parsing if needed
  };

  const addSampleRow = () => {
    setSangerSamples((prev) => [
      ...prev,
      { no: String(prev.length + 1), name: "", notes: "", tubeType: "" },
    ]);
  };

  const deleteSampleRow = (index: number) => {
    setSangerSamples((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((sample, i) => ({ ...sample, no: String(i + 1) }));
    });
  };

  const handleSampleChange = (
    index: number,
    field: keyof SangerSampleRow,
    value: string
  ) => {
    setSangerSamples((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      sangerSamples,
      dnaType,
      dnaTypeSingle,
      dnaQuantity: dnaConcentration,
      dnaConcentration,
      solvent,
      primerIncluded,
      primerDetails,
      plateNameFull,
      dnaTypeFull,
      plateNameLarge,
      highGCContent,
    }));
  }, [
    dnaConcentration,
    dnaType,
    dnaTypeFull,
    dnaTypeSingle,
    highGCContent,
    plateNameFull,
    plateNameLarge,
    primerDetails,
    primerIncluded,
    sangerSamples,
    setFormData,
    solvent,
  ]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Upload a DNA Data Table */}
      <section className="mb-8 flex items-start gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Upload a DNA Data Table</h2>
          <p className="text-sm text-gray-600">
            Only upload .csv, .xls, .xlsx, and .pdf files.
          </p>
        </div>
        <label
          htmlFor="dnaDataFile"
          className="flex flex-col items-center justify-center border-2 border-dashed border-[#002676] rounded-lg p-8 cursor-pointer hover:border-[#001a5c] transition w-64"
        >
          <input
            id="dnaDataFile"
            type="file"
            accept=".csv,.xls,.xlsx,.pdf"
            className="hidden"
            onChange={handleFileChange}
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
          {dnaDataFile && (
            <span className="mt-2 text-xs text-gray-700 text-center">
              Selected: {dnaDataFile.name}
            </span>
          )}
        </label>
      </section>

      {/* Sample Information */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Sample Information</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manually input sample information.
        </p>

        {/* Select a DNA Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Select a DNA Type:</label>
          <div className="flex gap-4">
            {["Plasmid", "PCR Product", "Genomic DNA"].map((type) => (
              <label
                key={type}
                className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
              >
                <input
                  type="radio"
                  name="dnaType"
                  value={type}
                  checked={dnaType === type}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDnaType(value);
                    updateParent({ dnaType: value });
                  }}
                  className="w-4 h-4"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sample Details Table */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200">
              <thead className="bg-[#002676] text-white">
                <tr>
                  <th className="px-4 py-2 border-r">No.</th>
                  <th className="px-4 py-2 border-r">Name</th>
                  <th className="px-4 py-2 border-r">Notes</th>
                  <th className="px-4 py-2">Tube Type</th>
                </tr>
              </thead>
              <tbody>
                {sangerSamples.map((sample, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => deleteSampleRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <span>{sample.no}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
                        value={sample.name}
                        onChange={(e) => handleSampleChange(index, "name", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
                        value={sample.notes}
                        onChange={(e) => handleSampleChange(index, "notes", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
                        value={sample.tubeType}
                        onChange={(e) => handleSampleChange(index, "tubeType", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addSampleRow}
            className="mt-4 w-full font-bold text-center bg-[#002676] text-white py-3 rounded-lg hover:bg-[#001a5c] transition"
          >
            +
          </button>
        </div>

        {/* High GC Content Question */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">
            Do any of your sequences have high GC content (&gt;60%) and require the dGTP Protocol?
          </p>
          <div className="flex gap-4">
            {["Yes", "No"].map((option) => (
              <label
                key={option}
                className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
              >
                <input
                  type="radio"
                  name="highGCContent"
                  value={option}
                  checked={highGCContent === option}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHighGCContent(value);
                    updateParent({ highGCContent: value });
                  }}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* For Single Tube Orders */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">For Single Tube Orders:</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">DNA Type:</label>
            <div className="flex gap-4">
              {["ssDNA", "dsDNA", "PCR"].map((type) => (
                <label
                  key={type}
                  className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
                >
                  <input
                    type="radio"
                    name="dnaTypeSingle"
                    value={type}
                    checked={dnaTypeSingle === type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDnaTypeSingle(value);
                      updateParent({ dnaTypeSingle: value, dnaType: value });
                    }}
                    className="w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Specify DNA Concentration: <span className="text-gray-500 font-normal">(If known)</span>
            </label>
            <input
              type="text"
              placeholder="(ng/µL)"
              value={dnaConcentration}
              onChange={(e) => {
                const value = e.target.value;
                setDnaConcentration(value);
                updateParent({ dnaConcentration: value, dnaQuantity: value });
              }}
              className="w-48 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">What is the solvent?</label>
            <div className="flex gap-4">
              {["Water", "Tris", "Other"].map((sol) => (
                <label
                  key={sol}
                  className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
                >
                  <input
                  type="radio"
                  name="solvent"
                  value={sol}
                  checked={solvent === sol}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSolvent(value);
                    updateParent({ solvent: value });
                  }}
                  className="w-4 h-4"
                />
                  <span>{sol}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Is Primer included in your submission?
            </label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition w-fit">
                <input
                  type="radio"
                  name="primerIncluded"
                  value="yes"
                  checked={primerIncluded === "yes"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPrimerIncluded(value);
                    updateParent({ primerIncluded: value });
                  }}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition w-fit">
                <input
                  type="radio"
                  name="primerIncluded"
                  value="no"
                  checked={primerIncluded === "no"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPrimerIncluded(value);
                    updateParent({ primerIncluded: value });
                  }}
                  className="w-4 h-4"
                />
                <span>No, I would like the lab to include it for me.</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Primer Details: <span className="text-gray-500 font-normal">(Please specify primer name, concentration, or if included in the tube)</span>
            </label>
            <input
              type="text"
              placeholder="Type..."
              value={primerDetails}
              onChange={(e) => {
                const value = e.target.value;
                setPrimerDetails(value);
                updateParent({ primerDetails: value });
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
            />
          </div>
        </div>

        {/* For Full Plate Orders */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">For Full Plate Orders:</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Plate Name:</label>
            <input
              type="text"
              placeholder="Type..."
              value={plateNameFull}
              onChange={(e) => {
                const value = e.target.value;
                setPlateNameFull(value);
                updateParent({ plateNameFull: value, plateName: value });
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">DNA Type:</label>
            <div className="flex gap-4">
              {["ssDNA", "dsDNA", "PCR"].map((type) => (
                <label
                  key={type}
                  className="inline-flex items-center space-x-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
                >
                  <input
                    type="radio"
                    name="dnaTypeFull"
                    value={type}
                    checked={dnaTypeFull === type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDnaTypeFull(value);
                      updateParent({ dnaTypeFull: value, dnaType: value });
                    }}
                    className="w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* For Large Templates (>10kb) */}
        <div>
          <h3 className="font-semibold mb-4">For Large Templates (&gt;10kb):</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Plate Name:</label>
            <input
              type="text"
              placeholder="Type..."
              value={plateNameLarge}
              onChange={(e) => {
                const value = e.target.value;
                setPlateNameLarge(value);
                updateParent({ plateNameLarge: value, plateName: value });
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#002676]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Original component for non-Sanger sample types
function OriginalSampleDetails({ formData, setFormData }: any) {
  // 1) Our final row structure
  type SampleRow = {
    hash: string;               // The "#" column
    sampleName: string;         // "Sample Names"
    plasmidProtocol: string;    // "Plasmid"
    pcrProtocol: string;        // "PCR Products"
    specialInstruction: string; // "Special Instruction"
  };

  // 2) Local state
  const [samples, setSamples] = useState<SampleRow[]>(
    formData.samples?.length
      ? formData.samples
      : [
          {
            hash: "",
            sampleName: "",
            plasmidProtocol: "",
            pcrProtocol: "",
            specialInstruction: "",
          },
        ]
  );

  const [dnaDataFile, setDnaDataFile] = useState<File | null>(null);
  const [sampleType, setSampleType] = useState(formData.sampleType || "");
  const [dnaTypeSingle, setDnaTypeSingle] = useState(formData.dnaTypeSingle || formData.dnaType || "");
  const [dnaQuantity, setDnaQuantity] = useState(formData.dnaQuantity || "");
  const [primerDetails, setPrimerDetails] = useState(formData.primerDetails || "");
  const [plateNameFull, setPlateNameFull] = useState(formData.plateNameFull || formData.plateName || "");
  const [dnaTypeFull, setDnaTypeFull] = useState(formData.dnaTypeFull || "");
  const [plateNameLarge, setPlateNameLarge] = useState(formData.plateNameLarge || "");
  const [manualSamplesNotes, setManualSamplesNotes] = useState("");

  const updateParent = (updates: Record<string, string | SampleRow[]>) => {
    setFormData((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

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
      // Sync the cleaned samples to formData
      setFormData((prev: any) => ({
        ...prev,
        samples: cleaned,
        dnaQuantity,
        primerDetails,
        plateName: plateNameFull || plateNameLarge,
        dnaType: dnaTypeSingle || dnaTypeFull,
      }));
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

  // 7) sync to formData continuously so review/submit always has the latest values
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      samples,
      sampleType,
      dnaTypeSingle,
      dnaQuantity,
      primerDetails,
      plateNameFull,
      dnaTypeFull,
      plateNameLarge,
      plateName: plateNameFull || plateNameLarge,
      dnaType: dnaTypeSingle || dnaTypeFull,
    }));
  }, [
    dnaQuantity,
    dnaTypeFull,
    dnaTypeSingle,
    plateNameFull,
    plateNameLarge,
    primerDetails,
    sampleType,
    samples,
    setFormData,
  ]);

  return (
    <div className="max-w-5xl mx-auto p-8">
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setSampleType(value);
                    updateParent({ sampleType: value });
                  }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setDnaTypeSingle(value);
                    updateParent({ dnaTypeSingle: value, dnaType: value });
                  }}
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
            name="dnaQuantity"
            value={dnaQuantity}
            onChange={(e) => {
              const value = e.target.value;
              setDnaQuantity(value);
              updateParent({ dnaQuantity: value });
            }}
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
          name="primerDetails"
          onChange={(e) => {
            const value = e.target.value;
            setPrimerDetails(value);
            updateParent({ primerDetails: value });
          }}
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        {/* Full Plate Orders */}
        <p className="font-semibold mb-2">For Full Plate Orders:</p>
        <p className="text-sm mb-1">Plate Name:</p>
        <input
          type="text"
          placeholder="Type..."
          name="plateNameFull"
          value={plateNameFull}
          onChange={(e) => {
            const value = e.target.value;
            setPlateNameFull(value);
            updateParent({ plateNameFull: value, plateName: value });
          }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setDnaTypeFull(value);
                    updateParent({ dnaTypeFull: value, dnaType: value });
                  }}
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
          
          onChange={(e) => {
            const value = e.target.value;
            setPlateNameLarge(value);
            updateParent({ plateNameLarge: value, plateName: value });
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </section>
    </div>
  );
}
