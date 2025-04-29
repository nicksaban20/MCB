'use client'
import { useState, useEffect } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import * as XLSX from 'xlsx'

export type SampleRow = {
  hash: string
  sampleName: string
  plasmidProtocol: string
  pcrProtocol: string
  specialInstruction: string
}

export default function SampleDetails({ formData, setFormData }: any) {
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
            name="dnaQuantity"
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
          name="primerDetails"
          onChange={(e) => setPrimerDetails(e.target.value)}
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