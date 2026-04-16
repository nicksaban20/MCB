import { parseSequencingTxtFile } from './sequencing';

const validFile = `Container Name\tPlate ID\tDescription\tContainer Type\tApp Type\tOwner\tOperator\tPlate Sealing\tScheduling Pref
TestContainer1\tPlate-001\tExample sequencing run\t96-well\tSanger\tYirina\tLab Tech\tAdhesive\tASAP
AppServer\tAppInstance
seq-server-01\tinstance-a
SequencingAnalysis
Well\tSample Name\tComment\tResults Group\tInstrument Protocol\tAnalysis Protocol
A1\tSample_A1\tFirst test sample\tGroup1\tStdSeq\tBaseCallingV1
A2\tSample_A2\tSecond test sample\tGroup1\tStdSeq\tBaseCallingV1
B1\tSample_B1\tThird test sample\tGroup2\tLongRead\tBaseCallingV2`;

describe('parseSequencingTxtFile', () => {
  it('parses a valid sequencing upload file', () => {
    const result = parseSequencingTxtFile(validFile);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected parse to succeed');
    }

    expect(result.payload.sequencingData.container_name).toBe('TestContainer1');
    expect(result.payload.sequencingData.plate_id).toBe('Plate-001');
    expect(result.payload.samples).toHaveLength(3);
    expect(result.payload.samples[0]).toMatchObject({
      well: 'A1',
      sample_name: 'Sample_A1',
    });
  });

  it('rejects an empty upload', () => {
    expect(parseSequencingTxtFile('')).toEqual({
      success: false,
      error: 'File is empty',
    });
  });
});
