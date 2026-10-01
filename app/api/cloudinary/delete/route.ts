import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    // Ensure environment variables are loaded
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ [Cloudinary] Missing API Key or API Secret in environment variables.')
      return NextResponse.json(
        { error: 'Server misconfiguration: missing credentials' },
        { status: 500 }
      )
    }

    // Strip extension if present (e.g., "folder/image.jpg" -> "folder/image")
    const cleanPublicId = publicId.replace(/\.[^/.]+$/, '')

    console.log('🗑️ Attempting to delete Cloudinary Public ID:', cleanPublicId)

    const result = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: 'image',
      invalidate: true,
    })

    console.log('🔍 Cloudinary Destroy Result:', result)

    if (result.result === 'ok') {
      return NextResponse.json({ success: true, result })
    } else if (result.result === 'not found') {
      return NextResponse.json({ error: 'Image not found on Cloudinary' }, { status: 404 })
    } else {
      return NextResponse.json({ error: result.result || 'Failed to delete image' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [Cloudinary] Delete exception:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete image from Cloudinary' },
      { status: 500 }
    )
  }
}