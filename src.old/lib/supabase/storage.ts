import { createServerSupabaseClient } from './server'

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (including filename)
 * @param file - The File object to upload
 * @returns The upload result with path and metadata
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase storage upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  return data
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Supabase storage delete error:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get the public URL for a file
 * Only works for public buckets
 * @param bucket - The storage bucket name
 * @param path - The path of the file
 * @returns The public URL
 */
export async function getPublicUrl(bucket: string, path: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Create a signed URL for temporary access to a private file
 * @param bucket - The storage bucket name
 * @param path - The path of the file
 * @param expiresIn - Number of seconds until the signed URL expires (default: 60)
 * @returns The signed URL
 */
export async function createSignedUrl(bucket: string, path: string, expiresIn: number = 60) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Supabase storage signed URL error:', error)
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List all files in a folder/path
 * @param bucket - The storage bucket name
 * @param folder - The folder path to list
 * @returns Array of file metadata
 */
export async function listFiles(bucket: string, folder?: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder)

  if (error) {
    console.error('Supabase storage list error:', error)
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}
