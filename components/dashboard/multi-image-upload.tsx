// File: components/dashboard/multi-image-upload.tsx
// Path: /components/dashboard/multi-image-upload.tsx
// Description: Multi-image upload for products (max 5 images)

'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImage {
  id: string
  url: string
  publicId: string
  isPrimary: boolean
}

interface MultiImageUploadProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export function MultiImageUpload({
  images,
  onChange,
  maxImages = 5
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

const uploadToCloudinary = async (file: File): Promise<ProductImage> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    throw new Error('Missing Cloudinary cloud name')
  }

  // 🔥 Add transformations to the upload URL
  const transformation = 'w_800,h_800,c_limit,q_auto,f_auto'
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('Cloudinary error:', data)
    throw new Error(data?.error?.message || 'Upload failed')
  }

  return {
    id: crypto.randomUUID(),
    url: data.secure_url,
    publicId: data.public_id,
    isPrimary: images.length === 0,
  }
}

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      if (images.length + files.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`)
        return
      }

      try {
        setUploading(true)
        setUploadProgress(0)

        const uploaded: ProductImage[] = []
        for (let i = 0; i < files.length; i++) {
          const result = await uploadToCloudinary(files[i])
          uploaded.push(result)
          setUploadProgress(((i + 1) / files.length) * 100)
        }

        onChange([...images, ...uploaded])
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload images')
      } finally {
        setUploading(false)
        setUploadProgress(0)
        e.target.value = ''
      }
    },
    [images, maxImages, onChange]
  )

 const removeImage = async (id: string) => {
  const imageToRemove = images.find(img => img.id === id)
  
  // Delete from Cloudinary if it has a publicId
  if (imageToRemove?.publicId) {
    try {
      console.log('🗑️ Deleting image from Cloudinary:', imageToRemove.publicId)
      
      // Use the same working approach as product delete
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: imageToRemove.publicId })
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Image deleted from Cloudinary:', imageToRemove.publicId)
      } else {
        console.error('❌ Failed to delete image:', result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting image from Cloudinary:', error)
    }
  }

  // Remove from local state
  let updated = images.filter(img => img.id !== id)

  // Ensure one primary image
  if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
    updated[0].isPrimary = true
  }

  onChange(updated)
}

  const setPrimaryImage = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    }))
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <label
        className={cn(
          "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors bg-muted/30",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <div className="text-center">
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-48 h-1.5 bg-muted rounded-full mt-2 mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <Upload size={32} className="mx-auto text-text-secondary/50 mb-2" />
              <p className="font-medium text-text-primary">Upload Images</p>
              <p className="text-sm text-text-secondary">
                Max {maxImages} images • JPG, PNG, WebP
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFiles}
        />
      </label>

      {/* Image grid */}
      {images.length > 0 && (
<div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "relative group border rounded-xl overflow-hidden bg-muted",
                image.isPrimary && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt="Product image"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setPrimaryImage(image.id)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full transition-colors w-full",
                    image.isPrimary
                      ? "bg-primary text-white"
                      : "bg-white/90 text-text-primary hover:bg-white"
                  )}
                >
                  {image.isPrimary ? (
                    <span className="flex items-center justify-center gap-1">
                      <Star size={14} className="fill-current" />
                      Primary
                    </span>
                  ) : (
                    'Set Primary'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors w-full"
                >
                  Remove
                </button>
              </div>

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-current" />
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}