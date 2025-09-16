'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image } from 'lucide-react'
import { Button } from './button'

interface LogoUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function LogoUpload({ value, onChange, className = '' }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        // Calcola le dimensioni mantenendo le proporzioni
        const maxSize = 200
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Disegna l'immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height)

        // Converti in base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine valido')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Il file è troppo grande. Massimo 5MB')
      return
    }

    setIsUploading(true)
    try {
      const resizedImage = await resizeImage(file)
      onChange(resizedImage)
    } catch (error) {
      console.error('Errore nel ridimensionamento:', error)
      alert('Errore nel caricamento dell\'immagine')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
          <img
            src={value}
            alt="Logo azienda"
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="text-xs text-gray-500 text-center">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-1"></div>
              Caricamento...
            </div>
          ) : (
            <>
              <Upload className="h-4 w-4 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center leading-tight">
                Logo
                <br />
                azienda
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}