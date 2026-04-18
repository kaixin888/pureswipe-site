'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Product360({ images = [], currentFrame: externalFrame, onFrameChange, tag }) {
  const [frame, setFrame] = useState(externalFrame || 0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentFrameRef = useRef(externalFrame || 0)

  // Sync with external frame (thumbnails)
  useEffect(() => {
    if (externalFrame !== undefined && externalFrame !== frame) {
      setFrame(externalFrame)
      currentFrameRef.current = externalFrame
    }
  }, [externalFrame])
  
  // Fallback if no images
  if (!images || images.length === 0) return null

  // If we only have 1-3 images, we simulate rotation by cycling them
  // In a real 360, we'd have 24-72 frames.
  const totalFrames = images.length
  
  const handleStart = (e) => {
    setIsDragging(true)
    startX.current = e.touches ? e.touches[0].clientX : e.clientX
  }

  const handleMove = (e) => {
    if (!isDragging) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const delta = x - startX.current
    
    // Sensitivity: 10px per frame change
    const sensitivity = 50
    const frameDelta = Math.floor(delta / sensitivity)
    
    if (frameDelta !== 0) {
      let nextFrame = (currentFrameRef.current - frameDelta) % totalFrames
      if (nextFrame < 0) nextFrame += totalFrames
      
      setFrame(nextFrame)
      currentFrameRef.current = nextFrame
      startX.current = x
      if (onFrameChange) onFrameChange(nextFrame)
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  return (
    <div 
      className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing group select-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* Product Tag */}
      {tag && (
        <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
          {tag}
        </div>
      )}

      {/* 360 Indicator */}
      <div className="absolute top-4 right-4 z-10 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none border border-white/20">
        <span className="text-[10px] font-black tracking-widest text-black/60 uppercase">360° VIEW</span>
        <div className="w-4 h-4 rounded-full border-2 border-t-black/60 border-transparent animate-spin-slow" />
      </div>

      {/* Drag Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/5 backdrop-blur-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] font-bold text-black/40 uppercase tracking-tighter">Drag to rotate</span>
      </div>

      {/* Image Sequence */}
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-150 ${
            frame === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <Image
            src={src}
            alt={`Product Frame ${idx + 1}`}
            fill
            className="object-contain p-8"
            priority={idx === 0}
          />
        </div>
      ))}
    </div>
  )
}
