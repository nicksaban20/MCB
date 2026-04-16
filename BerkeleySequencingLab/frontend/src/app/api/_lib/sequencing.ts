type SequencingRecord = {
  container_name: string;
  plate_id: string;
  description: string;
  container_type: string;
  app_type: string;
  owner: string;
  operator: string;
  plate_sealing: string;
  scheduling_pref: string;
};

type SequencingSampleRecord = {
  well: string;
  sample_name: string;
  comment: string;
  results_group: string;
  instrument_protocol: string;
  analysis_protocol: string;
};

export type ParsedSequencingPayload = {
  sequencingData: SequencingRecord;
  samples: SequencingSampleRecord[];
};

export type SequencingParseResult =
  | {
      success: true;
      payload: ParsedSequencingPayload;
    }
  | {
      success: false;
      error: string;
    };

function normalizeLineBreaks(fileContent: string) {
  return fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function parseSequencingTxtFile(fileContent: string): SequencingParseResult {
  if (!fileContent || fileContent.trim() === '') {
    return {
      success: false,
      error: 'File is empty',
    };
  }

  const lines = normalizeLineBreaks(fileContent).split('\n');
  let currentLine = 0;

  const headerLine = lines[currentLine] ?? '';
  if (!headerLine.includes('Container Name') && !headerLine.includes('Plate ID')) {
    return {
      success: false,
      error: 'Invalid file format: Missing expected headers',
    };
  }

  currentLine++;

  const sequencingDataLine = (lines[currentLine++] ?? '').split('\t');
  if (sequencingDataLine.length < 9) {
    return {
      success: false,
      error: 'Invalid file format: Insufficient sequencing data fields',
    };
  }

  const sequencingData: SequencingRecord = {
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

  if (!sequencingData.container_name || !sequencingData.plate_id) {
    return {
      success: false,
      error: 'Invalid file content: Container name and plate ID are required',
    };
  }

  currentLine += 3;

  const sampleHeaderLine = lines[currentLine] ?? '';
  if (
    sampleHeaderLine.includes('Well') &&
    (sampleHeaderLine.includes('Sample Name') || sampleHeaderLine.includes('Sample'))
  ) {
    currentLine++;
  }

  const samples: SequencingSampleRecord[] = [];
  const usedWells = new Set<string>();

  for (let index = currentLine; index < lines.length; index += 1) {
    const line = (lines[index] ?? '').trim();
    if (!line) {
      continue;
    }

    const sampleLine = line.split('\t');
    if (sampleLine.length < 6) {
      continue;
    }

    const well = sampleLine[0] || '';
    const sampleName = sampleLine[1] || '';

    if (!well || !sampleName || usedWells.has(well)) {
      continue;
    }

    usedWells.add(well);
    samples.push({
      well,
      sample_name: sampleName,
      comment: sampleLine[2] || '',
      results_group: sampleLine[3] || '',
      instrument_protocol: sampleLine[4] || '',
      analysis_protocol: sampleLine[5] || '',
    });
  }

  if (samples.length === 0) {
    return {
      success: false,
      error: 'No valid samples found in the file',
    };
  }

  return {
    success: true,
    payload: {
      sequencingData,
      samples,
    },
  };
}
