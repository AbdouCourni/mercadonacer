// File: services/cloudinary.service.ts
// Path: /services/cloudinary.service.ts
// Description: Cloudinary image upload service

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  url: string
  secure_url: string
  original_filename: string
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Upload failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    })

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

export function getOptimizedImageUrl(url: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
}): string {
  if (!url) return ''
  
  // If it's already a Cloudinary URL, add transformations
  if (url.includes('cloudinary.com')) {
    const baseUrl = url.split('/upload/')
    if (baseUrl.length === 2) {
      const transformations = []
      if (options?.width) transformations.push(`w_${options.width}`)
      if (options?.height) transformations.push(`h_${options.height}`)
      if (options?.quality) transformations.push(`q_${options.quality}`)
      if (options?.format) transformations.push(`f_${options.format}`)
      
      const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
      return `${baseUrl[0]}/upload/${transformString}${baseUrl[1]}`
    }
  }
  
  return url
}