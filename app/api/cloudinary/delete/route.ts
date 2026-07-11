// File: app/api/cloudinary/delete/route.ts
// Path: /app/api/cloudinary/delete/route.ts
// Description: Delete image from Cloudinary - WITH DEBUG

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicId } = body

    console.log('🗑️ [Cloudinary] Delete request received:', { publicId })

    if (!publicId) {
      console.error('❌ [Cloudinary] No public ID provided')
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ [Cloudinary] Deleting image:', publicId)
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('📊 [Cloudinary] Delete result:', result)

    if (result.result === 'ok') {
      console.log('✅ [Cloudinary] Image deleted successfully')
      return NextResponse.json({ success: true, result })
    } else if (result.result === 'not found') {
      console.log('⚠️ [Cloudinary] Image not found')
      return NextResponse.json(
        { error: 'Image not found on Cloudinary' },
        { status: 404 }
      )
    } else {
      console.error('❌ [Cloudinary] Delete failed:', result)
      return NextResponse.json(
        { error: result.result || 'Failed to delete image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ [Cloudinary] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image from Cloudinary' },
      { status: 500 }
    )
  }
}