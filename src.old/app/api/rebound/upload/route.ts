import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/supabase/storage'
import { getUser } from '@/lib/supabase/auth'

/**
 * POST /api/rebound/upload
 * Upload a file to Supabase Storage
 *
 * Request body should be FormData with a 'file' field
 */
export async function POST(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Create unique file path with user ID and timestamp
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${user.id}/${timestamp}-${sanitizedFileName}`

    // Upload to Supabase Storage
    const result = await uploadFile('rebound-documents', path, file)

    return NextResponse.json({
      path: result.path,
      fullPath: result.fullPath,
      fileName: file.name,
      size: file.size,
      contentType: file.type,
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/rebound/upload
 * Get a signed URL for downloading a private file
 *
 * Query params:
 * - path: The file path in the bucket
 */
export async function GET(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Verify the file belongs to this user (path should start with user.id)
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { createSignedUrl } = await import('@/lib/supabase/storage')
    const signedUrl = await createSignedUrl('rebound-documents', path, 3600) // 1 hour

    return NextResponse.json({
      url: signedUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    })
  } catch (error: any) {
    console.error('Signed URL error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rebound/upload
 * Delete a file from Supabase Storage
 *
 * Request body should contain the 'path' field
 */
export async function DELETE(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { path } = body

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Verify the file belongs to this user
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { deleteFile } = await import('@/lib/supabase/storage')
    await deleteFile('rebound-documents', path)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('File delete error:', error)
    return NextResponse.json(
      { error: error?.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
