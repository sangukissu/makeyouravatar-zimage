'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Rocket, 
  Shield, 
  Palmtree, 
  Landmark, 
  Cpu, 
  Wand2, 
  Palette, 
  Briefcase, 
  Film, 
  Skull, 
  Crown, 
  Sword,
  type LucideIcon
} from 'lucide-react'

interface GenerateFormProps {
  loraUrl: string
  triggerWord?: string
  onGenerate: (images: GeneratedImage[]) => void
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  autoGenerate?: boolean
}

export interface GeneratedImage {
  url: string
  width: number
  height: number
  content_type: string
}

interface PresetStyle {
  id: string
  name: string
  prompt: string
  icon: LucideIcon
  color: string
  generatedImage?: string
  isLoading?: boolean
}

const getPresetStyles = (trigger: string): PresetStyle[] => [
  {
    id: 'astronaut',
    name: 'Astronaut',
    prompt: `${trigger} as an astronaut floating in space with Earth in the background, cinematic lighting, high quality`,
    icon: Rocket,
    color: 'text-blue-400',
  },
  {
    id: 'warrior',
    name: 'Warrior',
    prompt: `${trigger} as a powerful warrior in ancient armor, epic battle pose, cinematic fantasy style, high quality`,
    icon: Shield,
    color: 'text-amber-400',
  },
  {
    id: 'holiday',
    name: 'Holiday Vibes',
    prompt: `${trigger} relaxing on a tropical beach at sunset, vacation mood, golden hour lighting, high quality`,
    icon: Palmtree,
    color: 'text-emerald-400',
  },
  {
    id: 'eiffel',
    name: 'Paris',
    prompt: `${trigger} standing in front of the Eiffel Tower in Paris, elegant portrait, romantic atmosphere, high quality`,
    icon: Landmark,
    color: 'text-rose-400',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    prompt: `${trigger} in a neon-lit cyberpunk city at night, futuristic style, rain reflections, high quality`,
    icon: Cpu,
    color: 'text-cyan-400',
  },
  {
    id: 'wizard',
    name: 'Fantasy Wizard',
    prompt: `${trigger} as a powerful wizard casting magical spells, fantasy art style, mystical aura, high quality`,
    icon: Wand2,
    color: 'text-purple-400',
  },
  {
    id: 'anime',
    name: 'Anime Style',
    prompt: `${trigger} in anime art style, vibrant colors, detailed illustration, Studio Ghibli inspired, high quality`,
    icon: Palette,
    color: 'text-pink-400',
  },
  {
    id: 'corporate',
    name: 'Professional',
    prompt: `${trigger} in professional business attire, corporate headshot, studio lighting, LinkedIn photo, high quality`,
    icon: Briefcase,
    color: 'text-slate-300',
  },
  {
    id: 'vintage',
    name: 'Vintage 1920s',
    prompt: `${trigger} in 1920s vintage style, sepia toned, classic Hollywood glamour, high quality`,
    icon: Film,
    color: 'text-amber-400',
  },
  {
    id: 'pirate',
    name: 'Pirate Captain',
    prompt: `${trigger} as a pirate captain on a ship deck, dramatic ocean backdrop, adventure style, high quality`,
    icon: Skull,
    color: 'text-stone-300',
  },
  {
    id: 'royal',
    name: 'Royal Portrait',
    prompt: `${trigger} as royalty in a renaissance oil painting style, ornate palace background, regal, high quality`,
    icon: Crown,
    color: 'text-yellow-300',
  },
  {
    id: 'samurai',
    name: 'Samurai Warrior',
    prompt: `${trigger} as a samurai warrior in traditional armor, cherry blossoms, Japanese art style, high quality`,
    icon: Sword,
    color: 'text-red-400',
  },
]

export default function GenerateForm({ 
  loraUrl, 
  triggerWord = 'a photo of TOK',
  onGenerate, 
  isGenerating, 
  setIsGenerating,
  autoGenerate = false
}: GenerateFormProps) {
  const [presets, setPresets] = useState<PresetStyle[]>(getPresetStyles(triggerWord))
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [imageSize, setImageSize] = useState('square_hd')
  const [loraScale, setLoraScale] = useState(1.3)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)
  const hasStartedAutoGenerate = useRef(false)

  const generatedCount = presets.filter(p => p.generatedImage).length
  const isAllGenerated = generatedCount === 12

  // Auto-generate all images when component mounts
  useEffect(() => {
    if (autoGenerate && !hasStartedAutoGenerate.current && !isAllGenerated) {
      hasStartedAutoGenerate.current = true
      generateAllImages()
    }
  }, [autoGenerate])

  const generateSingleImage = async (presetId: string, prompt: string): Promise<boolean> => {
    setCurrentGenerating(presetId)
    setPresets(prev => prev.map(p => 
      p.id === presetId ? { ...p, isLoading: true } : p
    ))
    setIsGenerating(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          loraUrl,
          loraScale,
          imageSize,
          numImages: 1,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setPresets(prev => prev.map(p => 
          p.id === presetId ? { ...p, isLoading: false } : p
        ))
        return false
      } else if (data.images && data.images[0]) {
        const imageUrl = data.images[0].url
        setPresets(prev => prev.map(p => 
          p.id === presetId ? { ...p, isLoading: false, generatedImage: imageUrl } : p
        ))
        onGenerate(data.images)
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      setPresets(prev => prev.map(p => 
        p.id === presetId ? { ...p, isLoading: false } : p
      ))
      return false
    } finally {
      setCurrentGenerating(null)
      setIsGenerating(false)
    }
  }

  const generateAllImages = async () => {
    setError(null)
    
    for (const preset of presets) {
      if (!preset.generatedImage) {
        const success = await generateSingleImage(preset.id, preset.prompt)
        if (!success) {
          // Small delay before retrying next one
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          // Small delay between successful generations
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    }
  }

  const handlePresetClick = (preset: PresetStyle) => {
    if (preset.generatedImage) {
      setSelectedImage(preset.generatedImage)
    } else if (!isGenerating) {
      generateSingleImage(preset.id, preset.prompt)
    }
  }

  const regenerateImage = async (preset: PresetStyle, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isGenerating) return
    
    // Clear the current image first
    setPresets(prev => prev.map(p => 
      p.id === preset.id ? { ...p, generatedImage: undefined } : p
    ))
    
    await generateSingleImage(preset.id, preset.prompt)
  }

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim() || isGenerating) return
    setError(null)
    setIsGenerating(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt.trim(),
          loraUrl,
          loraScale,
          imageSize,
          numImages: 1,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else if (data.images) {
        onGenerate(data.images)
        // Show in lightbox
        if (data.images[0]) {
          setSelectedImage(data.images[0].url)
        }
      }
    } catch (err) {
      setError('Failed to generate image. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (url: string, name: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `avatar-${name}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const downloadAll = async () => {
    for (const preset of presets) {
      if (preset.generatedImage) {
        await downloadImage(preset.generatedImage, preset.id)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isAllGenerated && (
            <motion.div
              className="w-5 h-5 border-2 border-aura-cyan-glow border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {isAllGenerated ? 'All avatars ready!' : `Generating avatars...`}
            </p>
            <p className="text-[10px] text-white/40">
              {generatedCount}/12 complete
            </p>
          </div>
        </div>
        
        {isAllGenerated && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={downloadAll}
            className="px-4 py-2 rounded-lg bg-aura-cyan-glow/20 border border-aura-cyan-glow/50 text-aura-cyan-bright text-xs font-medium hover:bg-aura-cyan-glow/30 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All
          </motion.button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-aura-blue-glow to-aura-cyan-glow"
          initial={{ width: 0 }}
          animate={{ width: `${(generatedCount / 12) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Avatar Grid - 4x3 */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {presets.map((preset, index) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handlePresetClick(preset)}
            className={`relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer group transition-all ${
              preset.generatedImage
                ? 'border-aura-cyan-glow/30 hover:border-aura-cyan-glow'
                : preset.isLoading
                ? 'border-aura-cyan-glow/50'
                : 'border-white/10'
            }`}
          >
            {/* Generated Image */}
            {preset.generatedImage ? (
              <>
                <Image
                  src={preset.generatedImage}
                  alt={preset.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium text-white mb-2">{preset.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(preset.generatedImage!, preset.id)
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={(e) => regenerateImage(preset, e)}
                        className="py-1.5 px-3 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Loading placeholder */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
                {preset.isLoading || currentGenerating === preset.id ? (
                  <div className="text-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-aura-cyan-glow border-t-transparent rounded-full mx-auto mb-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-[10px] text-aura-cyan-bright">Generating...</p>
                  </div>
                ) : (
                  <div className="text-center opacity-40">
                    <preset.icon className={`w-8 h-8 mx-auto mb-1 ${preset.color}`} />
                    <p className="text-[10px] text-white/50">Waiting...</p>
                  </div>
                )}
              </div>
            )}

            {/* Style label badge */}
            {preset.generatedImage && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white/80">
                {preset.name}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-900/20 border border-rose-500/30 text-rose-400 text-xs font-mono"
        >
          {error}
        </motion.div>
      )}

      {/* Custom Prompt Section */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider w-full justify-center py-2"
        >
          <motion.svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: showAdvanced ? 180 : 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
          Create Custom Avatar
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                <div className="relative">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={`Describe your custom avatar using '${triggerWord}'...`}
                    className="input-field min-h-[80px] resize-none text-sm"
                    disabled={isGenerating}
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Resolution
                    </label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="select-field text-sm"
                      disabled={isGenerating}
                    >
                      <option value="square_hd">Square HD (1024×1024)</option>
                      <option value="square">Square (512×512)</option>
                      <option value="portrait_4_3">Portrait 4:3</option>
                      <option value="landscape_4_3">Landscape 4:3</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      LoRA Strength: {loraScale.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={loraScale}
                      onChange={(e) => setLoraScale(parseFloat(e.target.value))}
                      className="w-full accent-aura-cyan-glow"
                      disabled={isGenerating}
                    />
                    <p className="text-[9px] text-white/30">
                      Higher = stronger likeness
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleCustomGenerate}
                  disabled={isGenerating || !customPrompt.trim()}
                  className="glow-button w-full py-3 font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Custom
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl max-h-[80vh] w-full aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Generated avatar"
                fill
                className="object-contain rounded-2xl"
                unoptimized
              />
              
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <button
                onClick={() => downloadImage(selectedImage, 'avatar')}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-aura-cyan-glow/20 border border-aura-cyan-glow/50 text-white font-medium hover:bg-aura-cyan-glow/30 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
