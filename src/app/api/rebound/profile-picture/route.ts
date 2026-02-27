import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage'
import { getUser } from '@/lib/supabase/auth'
import { db } from '@/db'
import { consultants } from '@/db/schema/rebound-relay'
import { eq } from 'drizzle-orm'

/**
 * POST /api/rebound/profile-picture
 * Upload a profile picture to Supabase Storage
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

    // Validate file type - only images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Create unique file path with user ID and timestamp
    const timestamp = Date.now()
    const fileExtension = file.type.split('/')[1]
    const path = `profile-pictures/${user.id}/${timestamp}.${fileExtension}`

    // Upload to Supabase Storage
    const result = await uploadFile('rebound-profiles', path, file)

    // Get public URL
    const publicUrl = await getPublicUrl('rebound-profiles', path)

    // Update the user's profile image in the consultants table
    const consultant = await db
      .select()
      .from(consultants)
      .where(eq(consultants.userId, user.id))
      .limit(1)

    if (consultant[0]) {
      await db
        .update(consultants)
        .set({ profileImage: publicUrl, updatedAt: new Date() })
        .where(eq(consultants.id, consultant[0].id))
    }

    return NextResponse.json({
      url: publicUrl,
      path: result.path,
    })
  } catch (error: any) {
    console.error('Profile picture upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rebound/profile-picture
 * Remove the profile picture
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
    // Update the user's profile image to null in the consultants table
    const consultant = await db
      .select()
      .from(consultants)
      .where(eq(consultants.userId, user.id))
      .limit(1)

    if (consultant[0]) {
      await db
        .update(consultants)
        .set({ profileImage: null, updatedAt: new Date() })
        .where(eq(consultants.id, consultant[0].id))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile picture delete error:', error)
    return NextResponse.json(
      { error: error?.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
