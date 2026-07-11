// File: components/dashboard/single-image-upload.tsx
// Path: /components/dashboard/single-image-upload.tsx
// Description: Single image upload for categories - FIXED

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SingleImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  publicId?: string | null
  onPublicIdChange?: (publicId: string | null) => void
  label?: string
}

export function SingleImageUpload({
  value,
  onChange,
  publicId,
  onPublicIdChange,
  label = 'Image'
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(publicId || null)

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      throw new Error('Missing Cloudinary cloud name')
    }

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

    // 🔥 Optimize the URL
    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/w_800,h_800,c_limit,q_auto,f_auto/'
    )

    return {
      url: optimizedUrl,
      publicId: data.public_id,
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const result = await uploadToCloudinary(file)
      
      // 🔥 Store the publicId
      setCurrentPublicId(result.publicId)
      
      onChange(result.url)
      if (onPublicIdChange) {
        onPublicIdChange(result.publicId)
      }
      
      console.log('✅ Image uploaded:', { url: result.url, publicId: result.publicId })
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = async () => {
    // 🔥 Use the currentPublicId state
    const publicIdToDelete = currentPublicId || publicId
    
    console.log('🗑️ Attempting to delete image:', { 
      currentPublicId, 
      publicIdFromProps: publicId,
      publicIdToDelete 
    })

    if (publicIdToDelete) {
      try {
        console.log('🗑️ Deleting category image from Cloudinary:', publicIdToDelete)
        
        const response = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: publicIdToDelete })
        })

        const result = await response.json()
        
        if (response.ok) {
          console.log('✅ Category image deleted from Cloudinary:', publicIdToDelete)
        } else {
          console.error('❌ Failed to delete category image:', result.error)
        }
      } catch (error) {
        console.error('❌ Error deleting category image from Cloudinary:', error)
      }
    } else {
      console.warn('⚠️ No publicId found to delete')
    }

    // 🔥 Clear everything
    setCurrentPublicId(null)
    onChange(null)
    if (onPublicIdChange) {
      onPublicIdChange(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {value ? (
        // Image preview
        <div className="relative group">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
            <label className="cursor-pointer">
              <div className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Upload size={20} className="text-text-primary" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center gap-2">
              <Loader2 size={32} className="animate-spin text-white" />
              <span className="text-white text-sm">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        // Upload area
        <label
          className={cn(
            "flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors bg-muted/30",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="text-center">
            {uploading ? (
              <>
                <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Uploading...</p>
              </>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-text-secondary/50 mb-2" />
                <p className="font-medium text-text-primary">Upload {label}</p>
                <p className="text-sm text-text-secondary">JPG, PNG, WebP • Max 5MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  )
}