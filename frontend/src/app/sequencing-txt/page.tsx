'use client'

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SequencingData {
  container_name: string;
  plate_id: string;
  description: string;
  container_type: string;
  app_type: string;
  owner: string;
  operator: string;
  plate_sealing: string;
  scheduling_pref: string;
  app_server?: string;
  app_instance?: string;
}

interface SampleData {
  well: string;
  sample_name: string;
  comment: string;
  results_group: string;
  instrument_protocol: string;
  analysis_protocol: string;
}

// to-do: add more validations?
// confirmation modal

export const processSequencingTxtFile = async (fileContent: string) => {
  const supabase = createClient();
  try {
    // validation: check if file content is empty
    if (!fileContent || fileContent.trim() === '') {
      return {
        success: false,
        error: 'File is empty'
      };
    }

    // split the content by lines
    const lines = fileContent.split('\n');

    let currentLine = 0;
    
    // validation: Check if first line contains expected headers
    const headerLine = lines[currentLine];
    if (!headerLine.includes('Container Name') && !headerLine.includes('Plate ID')) {
      return {
        success: false,
        error: 'Invalid file format: Missing expected headers'
      };
    }
    
    currentLine++; // skip "Container Name  Plate ID..."
    
    // parse sequencing data (second line)
    const sequencingDataLine = lines[currentLine++].split('\t');
    
    // validation: Check if sequencing data line has enough fields
    if (sequencingDataLine.length < 9) {
      return {
        success: false,
        error: 'Invalid file format: Insufficient sequencing data fields'
      };
    }

    const sequencingData: SequencingData = {
      container_name: sequencingDataLine[0] || '',
      plate_id: sequencingDataLine[1] || '',
      description: sequencingDataLine[2] || '',
      container_type: sequencingDataLine[3] || '',
      app_type: sequencingDataLine[4] || '',
      owner: sequencingDataLine[5] || '',
      operator: sequencingDataLine[6] || '',
      plate_sealing: sequencingDataLine[7] || '',
      scheduling_pref: sequencingDataLine[8] || '',
    };
    
    // validation: Check required sequencing data fields
    if (!sequencingData.container_name || !sequencingData.plate_id) {
      return {
        success: false,
        error: 'Invalid file content: Container name and plate ID are required'
      };
    }
    
    // skip app server line and empty lines
    currentLine += 2; // skip "AppServer AppInstance" line
    currentLine++; // skip "SequencingAnalysis" line
    
    // validation: Check sample header line
    const sampleHeaderLine = lines[currentLine];
    if (!(sampleHeaderLine.includes('Well') || sampleHeaderLine.includes('Well')) || 
        !(sampleHeaderLine.includes('Sample Name') || sampleHeaderLine.includes('Sample'))) {
    // don't return error, just increment currentLine and continue
    } else {
    currentLine++; // only increment if we found the header line
    }
    
    // parse samples
    const samples: SampleData[] = [];
    const wellSet = new Set<string>(); // for tracking duplicate wells
    
    // process until end of file
    for (let i = currentLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // skip empty lines
      
      const sampleData = line.split('\t');
      // only process lines that have enough data
      if (sampleData.length >= 6) {
        const well = sampleData[0] || '';
        const sampleName = sampleData[1] || '';
        
        // validation: check for empty well or sample name
        if (!well || !sampleName) {
          continue; // skip rows with empty well or sample name
        }
        
        // validation: check for duplicate wells
        if (wellSet.has(well)) {
          console.warn(`Duplicate well detected: ${well}. Only the first occurrence will be used.`);
          continue;
        }
        
        wellSet.add(well);
        
        samples.push({
          well,
          sample_name: sampleName,
          comment: sampleData[2] || '',
          results_group: sampleData[3] || '',
          instrument_protocol: sampleData[4] || '',
          analysis_protocol: sampleData[5] || ''
        });
      }
    }
    
    // validation: check if at least one sample was found
    if (samples.length === 0) {
      return {
        success: false,
        error: 'No valid samples found in the file'
      };
    }
    
    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to submit sequencing data');
    }
    
    // save sequencing data to Supabase
    const { data: sequencingResult, error: sequencingError } = await supabase
      .from('sequencing_data')
      .insert([{
        ...sequencingData,
        user_id: user.id
      }])
      .select()
      .single();
    
    if (sequencingError) {
      throw sequencingError;
    }
    
    if (!sequencingResult || !sequencingResult.id) {
      throw new Error('Failed to create sequencing data');
    }
    
    // save samples to Supabase
    const sampleData = samples.map(sample => ({
      ...sample,
      sequencing_id: sequencingResult.id
    }));
    
    const { error: samplesError } = await supabase
      .from('sequencing_samples')
      .insert(sampleData);
    
    if (samplesError) {
      throw samplesError;
    }
    
    return {
      success: true,
      sequencingId: sequencingResult.id,
      sampleCount: samples.length
    };
    
  } catch (error) {
    console.error('Error processing sequencing text file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// component for processing a txt file
export default function SequencingTxtProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    sequencingId?: string;
    sampleCount?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // validation: check file extension
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'txt') {
        setResult({
          success: false,
          error: 'Please upload a valid .txt file'
        });
        return;
      }
      setFile(selectedFile);
      setResult(null); // clear previous results
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setResult({ success: false, error: 'Please select a file' });
      return;
    }
    
    setLoading(true);
    try {
      // read the file content
      const fileContent = await file.text();
      
      // process the file and save to Supabase
      const processingResult = await processSequencingTxtFile(fileContent);
      setResult(processingResult);
    } catch (error) {
      console.error('Error processing file:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Sequencing Text File</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a sequencing text file (.txt)
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
        </div>
        
        <button
          type="submit"
          className="w-full p-3 bg-gray-900 text-white rounded-md font-medium disabled:opacity-50"
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Process and Upload'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? (
            <div>
              <p>Successfully processed and uploaded sequencing data!</p>
              <p className="text-sm mt-1">Samples processed: {result.sampleCount}</p>
              <p className="text-sm">Sequencing ID: {result.sequencingId}</p>
            </div>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}