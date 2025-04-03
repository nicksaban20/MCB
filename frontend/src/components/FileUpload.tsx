'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function FileUpload() {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient();
    
    const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
            throw new Error('You must select a file to upload.')
            }

            const file = event.target.files[0]
            const fileName = file.name

            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('You must be logged in to upload files.')
            }

            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('file-upload')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }
            alert('File uploaded successfully!')
        } catch (error) {
            alert('Error uploading file!')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }
  return (
    <div>
      <input
        type="file"
        onChange={uploadFile}
        disabled={uploading}
        className="w-full p-2 border rounded-md text-black"
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}