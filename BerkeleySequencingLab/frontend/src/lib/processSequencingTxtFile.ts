import { createClient } from '@/utils/supabase/client'

interface SequencingData {
  container_name: string
  plate_id: string
  description: string
  container_type: string
  app_type: string
  owner: string
  operator: string
  plate_sealing: string
  scheduling_pref: string
  app_server?: string
  app_instance?: string
}

interface SampleData {
  well: string
  sample_name: string
  comment: string
  results_group: string
  instrument_protocol: string
  analysis_protocol: string
}

export const processSequencingTxtFile = async (fileContent: string) => {
  const supabase = createClient()
  try {
    if (!fileContent || fileContent.trim() === '') {
      return {
        success: false,
        error: 'File is empty',
      }
    }

    const lines = fileContent.split('\n')

    let currentLine = 0

    const headerLine = lines[currentLine]
    if (!headerLine.includes('Container Name') && !headerLine.includes('Plate ID')) {
      return {
        success: false,
        error: 'Invalid file format: Missing expected headers',
      }
    }

    currentLine++

    const sequencingDataLine = lines[currentLine++].split('\t')

    if (sequencingDataLine.length < 9) {
      return {
        success: false,
        error: 'Invalid file format: Insufficient sequencing data fields',
      }
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
    }

    if (!sequencingData.container_name || !sequencingData.plate_id) {
      return {
        success: false,
        error: 'Invalid file content: Container name and plate ID are required',
      }
    }

    currentLine += 2
    currentLine++

    const sampleHeaderLine = lines[currentLine]
    if (
      !(sampleHeaderLine.includes('Well') || sampleHeaderLine.includes('Well')) ||
      !(sampleHeaderLine.includes('Sample Name') || sampleHeaderLine.includes('Sample'))
    ) {
    } else {
      currentLine++
    }

    const samples: SampleData[] = []
    const wellSet = new Set<string>()

    for (let i = currentLine; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const sampleData = line.split('\t')
      if (sampleData.length >= 6) {
        const well = sampleData[0] || ''
        const sampleName = sampleData[1] || ''

        if (!well || !sampleName) {
          continue
        }

        if (wellSet.has(well)) {
          console.warn(`Duplicate well detected: ${well}. Only the first occurrence will be used.`)
          continue
        }

        wellSet.add(well)

        samples.push({
          well,
          sample_name: sampleName,
          comment: sampleData[2] || '',
          results_group: sampleData[3] || '',
          instrument_protocol: sampleData[4] || '',
          analysis_protocol: sampleData[5] || '',
        })
      }
    }

    if (samples.length === 0) {
      return {
        success: false,
        error: 'No valid samples found in the file',
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to submit sequencing data')
    }

    const { data: sequencingResult, error: sequencingError } = await supabase
      .from('sequencing_data')
      .insert([
        {
          ...sequencingData,
          user_id: user.id,
        },
      ])
      .select()
      .single()

    if (sequencingError) {
      throw sequencingError
    }

    if (!sequencingResult || !sequencingResult.id) {
      throw new Error('Failed to create sequencing data')
    }

    const sampleData = samples.map((sample) => ({
      ...sample,
      sequencing_id: sequencingResult.id,
    }))

    const { error: samplesError } = await supabase.from('sequencing_samples').insert(sampleData)

    if (samplesError) {
      throw samplesError
    }

    return {
      success: true,
      sequencingId: sequencingResult.id,
      sampleCount: samples.length,
    }
  } catch (error) {
    console.error('Error processing sequencing text file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
