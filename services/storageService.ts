import { supabase } from '../lib/supabase'

export const uploadFileToSupabase = async (file: File, bucket: string = 'medical-records'): Promise<string> => {
    try {
        console.log('Uploading file to Supabase Storage...')
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Supabase Storage upload error:', uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(uploadData.path)

        if (!urlData.publicUrl) {
            throw new Error('Failed to get public URL for uploaded file')
        }

        return urlData.publicUrl

    } catch (error) {
        console.error('Error uploading file to Supabase Storage:', error)
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result)
                } else {
                    reject(new Error('Failed to read file as data URL'))
                }
            }
            reader.onerror = () => reject(new Error('FileReader error'))
            reader.readAsDataURL(file)
        })
    }
}

export const uploadFileToGCS = uploadFileToSupabase
