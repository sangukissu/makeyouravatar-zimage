'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

interface UploadZoneProps {
  images: UploadedImage[]
  setImages: (images: UploadedImage[]) => void
  minImages?: number
  maxImages?: number
}

export default function UploadZone({ 
  images, 
  setImages, 
  minImages = 5,
  maxImages = 20 
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList) => {
    const newImages: UploadedImage[] = []
    const currentCount = images.length
    
    Array.from(files).forEach((file, index) => {
      if (currentCount + newImages.length >= maxImages) return
      if (!file.type.startsWith('image/')) return
      
      newImages.push({
        id: `${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
      })
    })
    
    setImages([...images, ...newImages])
  }, [images, setImages, maxImages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  const remaining = minImages - images.length

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <motion.div
        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        
        <motion.div
          className="flex flex-col items-center gap-4 p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Upload icon */}
          <motion.div
            className="relative"
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aura-blue-dim/30 to-aura-cyan-dim/30 flex items-center justify-center border border-white/5">
              <svg 
                className="w-8 h-8 text-aura-cyan-bright" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-aura-cyan-glow/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <div className="text-center">
            <p className="text-lg font-display text-white tracking-wide">
              {isDragging ? 'Drop Files Now' : 'Initialize Data Upload'}
            </p>
            <p className="text-sm text-white/40 mt-1 font-mono">
              DRAG & DROP OR CLICK TO BROWSE
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-1">
              {Array.from({ length: minImages }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < images.length ? 'bg-aura-cyan-bright box-shadow-glow' : 'bg-white/10'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
            <span className="text-[10px] text-white/30 font-mono uppercase">
              {images.length}/{minImages} MIN
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Image previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs text-white/50 font-mono uppercase tracking-wider">
                Buffer: {images.length} items
                {remaining > 0 && (
                  <span className="text-aura-cyan-glow ml-2">
                    [REQ: +{remaining}]
                  </span>
                )}
              </span>
              {images.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImages([])
                  }}
                  className="text-[10px] text-rose-400/70 hover:text-rose-400 transition-colors uppercase font-mono"
                >
                  Clear Buffer
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              <AnimatePresence mode="popLayout">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative aspect-square group"
                  >
                    <div className="absolute inset-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-aura-cyan-glow/50 transition-colors">
                      <Image
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    
                    {/* Remove button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                    
                    {/* Index badge */}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white/70">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
