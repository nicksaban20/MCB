'use client'

import { useState } from 'react'
import { processSequencingTxtFile } from '@/lib/processSequencingTxtFile'

export default function SequencingTxtProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    sequencingId?: string
    sampleCount?: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

      if (fileExtension !== 'txt') {
        setResult({
          success: false,
          error: 'Please upload a valid .txt file',
        })
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setResult({ success: false, error: 'Please select a file' })
      return
    }

    setLoading(true)
    try {
      const fileContent = await file.text()
      const processingResult = await processSequencingTxtFile(fileContent)
      setResult(processingResult)
    } catch (error) {
      console.error('Error processing file:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Sequencing Text File</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a sequencing text file (.txt)</label>
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
  )
}
