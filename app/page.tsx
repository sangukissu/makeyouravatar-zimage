'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { Home as HomeIcon } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import LandingPage from '@/components/LandingPage'
import UploadZone from '@/components/UploadZone'
import TrainingProgress from '@/components/TrainingProgress'
import GenerateForm, { type GeneratedImage } from '@/components/GenerateForm'
import LoraManager from '@/components/LoraManager'
import { saveLora, type StoredLora } from '@/lib/storage'

// Step definitions
type Step = 'landing' | 'upload' | 'configure' | 'training' | 'generate'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

export default function Home() {
  // Step state - Start with landing page
  const [currentStep, setCurrentStep] = useState<Step>('landing')
  
  // Upload state
  const [images, setImages] = useState<UploadedImage[]>([])
  
  // Training configuration
  const [modelName, setModelName] = useState('')
  const [trainingType, setTrainingType] = useState<'content' | 'style' | 'balanced'>('balanced')
  const [steps, setSteps] = useState(1000)
  const [defaultCaption, setDefaultCaption] = useState('a photo of TOK')
  
  // Training state
  const [requestId, setRequestId] = useState<string | null>(null)
  const [isStartingTraining, setIsStartingTraining] = useState(false)
  const [trainingError, setTrainingError] = useState<string | null>(null)
  
  // LoRA state
  const [currentLora, setCurrentLora] = useState<StoredLora | null>(null)
  
  // Generation state
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Handle training start
  const startTraining = async () => {
    if (images.length < 5) return
    
    setIsStartingTraining(true)
    setTrainingError(null)
    
    try {
      // Create zip from images
      const zip = new JSZip()
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const arrayBuffer = await img.file.arrayBuffer()
        const extension = img.file.name.split('.').pop() || 'jpg'
        zip.file(`image_${i + 1}.${extension}`, arrayBuffer)
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Convert to base64
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove data URL prefix
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(zipBlob)
      })
      
      // Upload zip to fal storage
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipBase64: base64 }),
      })
      
      const uploadData = await uploadRes.json()
      
      if (uploadData.error) {
        throw new Error(uploadData.error)
      }
      
      // Start training
      const trainRes = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: uploadData.url,
          steps,
          defaultCaption,
          trainingType,
        }),
      })
      
      const trainData = await trainRes.json()
      
      if (trainData.error) {
        throw new Error(trainData.error)
      }
      
      setRequestId(trainData.requestId)
      setCurrentStep('training')
    } catch (error) {
      setTrainingError(error instanceof Error ? error.message : 'Failed to start training')
    } finally {
      setIsStartingTraining(false)
    }
  }

  // Handle training completion
  const handleTrainingComplete = useCallback((loraUrl: string, configUrl: string) => {
    // Save to localStorage - use the full caption as trigger word
    const savedLora = saveLora({
      name: modelName || `Model ${new Date().toLocaleDateString()}`,
      loraUrl,
      configUrl,
      trainingType,
      thumbnailUrl: images[0]?.preview,
      triggerWord: defaultCaption,
    })
    
    setCurrentLora(savedLora)
    setCurrentStep('generate')
  }, [modelName, trainingType, images, defaultCaption])

  // Handle training error
  const handleTrainingError = useCallback((error: string) => {
    setTrainingError(error)
    setCurrentStep('configure')
    setRequestId(null)
  }, [])

  // Handle LoRA selection from library
  const handleSelectLora = (lora: StoredLora) => {
    setCurrentLora(lora)
    setCurrentStep('generate')
  }

  // Handle generated images
  const handleGenerate = (newImages: GeneratedImage[]) => {
    setGeneratedImages([...newImages, ...generatedImages])
  }

  // Step indicator component (only for app flow, not landing)
  const StepIndicator = () => {
    const flowSteps: { key: Step; label: string; icon: JSX.Element }[] = [
      { 
        key: 'upload', 
        label: 'Upload',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      },
      { 
        key: 'configure', 
        label: 'Configure',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      },
      { 
        key: 'training', 
        label: 'Train',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      },
      { 
        key: 'generate', 
        label: 'Your Digital Self',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      },
    ]
    
    const currentIndex = flowSteps.findIndex(s => s.key === currentStep)
    
    // Handle step navigation
    const handleStepClick = (stepKey: Step) => {
      // Only allow navigation to past steps or current step
      const stepIndex = flowSteps.findIndex(s => s.key === stepKey)
      if (stepIndex <= currentIndex) {
        setCurrentStep(stepKey)
      }
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {flowSteps.map((step, index) => {
          const isActive = step.key === currentStep
          const isPast = index < currentIndex
          const isClickable = index <= currentIndex
          
          return (
            <div key={step.key} className="flex items-center">
              <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
                  isActive 
                    ? 'bg-aura-emerald-glow/10 border-aura-emerald-glow text-aura-emerald-bright' 
                    : isPast
                    ? 'bg-aura-emerald-dim/20 border-aura-emerald-dim text-white/70'
                    : 'bg-white/5 border-transparent text-white/30'
                } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                animate={{ scale: isActive ? 1.05 : 1 }}
                onClick={() => isClickable && handleStepClick(step.key)}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
              >
                <svg 
                  className={`w-4 h-4 ${isActive ? 'text-aura-emerald-bright' : isPast ? 'text-white/70' : 'text-white/30'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {step.icon}
                </svg>
                <span className={`text-sm font-medium`}>
                  {step.label}
                </span>
              </motion.div>
              
              {index < flowSteps.length - 1 && (
                <div className={`w-8 h-[1px] mx-1 ${isPast ? 'bg-aura-emerald-glow' : 'bg-white/10'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <main className="min-h-screen relative font-sans">
      <AnimatedBackground />
      
      {/* Landing Page */}
      {currentStep === 'landing' && (
        <div className="relative z-10">
          <LandingPage onGetStarted={() => setCurrentStep('upload')} />
        </div>
      )}

      {/* App Flow */}
      {currentStep !== 'landing' && (
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Home Button */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pt-4 relative"
        >
          {/* Home Button */}
          <motion.button
            onClick={() => setCurrentStep('landing')}
            className="absolute left-0 top-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-aura-emerald-glow/50 transition-all text-white/70 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Home</span>
          </motion.button>

          <motion.h1 
            className="text-3xl md:text-4xl font-bold font-display mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="gradient-text">Make Your Avatar</span>
          </motion.h1>
          
          <motion.p
            className="text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Train your personal AI model in minutes
          </motion.p>
        </motion.header>

        {/* Step indicator */}
        <StepIndicator />

        {/* LoRA Manager - always visible when there are saved models */}
        {currentStep !== 'training' && (
          <div className="mb-6">
            <LoraManager 
              onSelect={handleSelectLora}
              selectedLoraId={currentLora?.id}
            />
          </div>
        )}

        {/* Main content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 md:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-white">
                      Initialize Dataset
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      Upload 5-20 diverse photos of yourself for optimal training
                    </p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-aura-cyan-bright font-mono text-xs">STATUS: WAITING_FOR_INPUT</p>
                  </div>
                </div>
                
                <UploadZone images={images} setImages={setImages} />
                
                <div className="mt-8 flex justify-end">
                  <motion.button
                    onClick={() => setCurrentStep('configure')}
                    disabled={images.length < 5}
                    className="glow-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Initialize Protocol
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Configure */}
          {currentStep === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 md:p-10">
                <h2 className="text-2xl font-display font-semibold text-white mb-2">
                  System Configuration
                </h2>
                <p className="text-white/50 mb-8 border-b border-white/5 pb-6">
                  Define parameters for the neural network training process
                </p>
                
                <div className="space-y-8">
                  {/* Model name */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-aura-cyan-bright tracking-wider uppercase text-xs">Model Identity</label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. Neo Matrix v1"
                      className="input-field"
                    />
                  </div>
                  
                  {/* Training type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-aura-cyan-bright tracking-wider uppercase text-xs">Training Protocol</label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['content', 'balanced', 'style'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setTrainingType(type)}
                          className={`p-4 rounded-xl border transition-all text-left group ${
                            trainingType === type
                              ? 'bg-aura-cyan-glow/10 border-aura-cyan-glow'
                              : 'bg-black/20 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`text-sm font-medium capitalize mb-1 ${
                            trainingType === type ? 'text-white' : 'text-white/60'
                          }`}>
                            {type}
                          </div>
                          <div className={`text-[10px] uppercase tracking-wide ${
                            trainingType === type ? 'text-aura-cyan-bright' : 'text-white/30'
                          }`}>
                            {type === 'content' && 'Face focus'}
                            {type === 'balanced' && 'Hybrid'}
                            {type === 'style' && 'Artistic'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Training steps */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-aura-cyan-bright tracking-wider uppercase text-xs">Compute Cycles</label>
                      <span className="font-mono text-aura-cyan-glow">{steps} STEPS</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="100"
                      value={steps}
                      onChange={(e) => setSteps(parseInt(e.target.value))}
                      className="w-full accent-aura-cyan-glow"
                    />
                  </div>
                  
                  {/* Caption */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-aura-cyan-bright tracking-wider uppercase text-xs">Trigger Phrase</label>
                    <input
                      type="text"
                      value={defaultCaption}
                      onChange={(e) => setDefaultCaption(e.target.value)}
                      placeholder="a photo of TOK"
                      className="input-field"
                    />
                    <p className="text-xs text-white/30 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-aura-cyan-glow"></span>
                      Use "TOK" as the variable identifier for the subject
                    </p>
                  </div>
                </div>
                
                {/* Error message */}
                {trainingError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-rose-900/20 border border-rose-500/30 text-rose-400 text-sm font-mono"
                  >
                    ERROR: {trainingError}
                  </motion.div>
                )}
                
                {/* Actions */}
                <div className="mt-10 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep('upload')}
                    className="text-white/40 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  
                  <motion.button
                    onClick={startTraining}
                    disabled={isStartingTraining}
                    className="glow-button flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isStartingTraining ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Initializing...
                      </>
                    ) : (
                      'Start Engine'
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Cost estimate */}
              <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-aura-cyan-glow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aura-cyan-glow/10 flex items-center justify-center">
                    <span className="text-aura-cyan-glow">$</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Estimated Compute Cost</p>
                    <p className="text-xs text-white/40">Allocated for {steps} steps</p>
                  </div>
                </div>
                <p className="text-lg font-mono text-aura-cyan-bright">
                  ~${((steps / 1000) * 2.26).toFixed(2)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Training */}
          {currentStep === 'training' && requestId && (
            <motion.div
              key="training"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TrainingProgress
                requestId={requestId}
                onComplete={handleTrainingComplete}
                onError={handleTrainingError}
              />
            </motion.div>
          )}

          {/* Step 4: Generate */}
          {currentStep === 'generate' && currentLora && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Current model indicator */}
              <div className="glass-card p-4 border-l-4 border-l-aura-blue-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-aura-blue-dim to-aura-cyan-dim flex items-center justify-center font-display text-xl font-bold">
                      AI
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/50 uppercase tracking-wider">Active Model</p>
                      <p className="text-lg font-display text-white">{currentLora.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentStep('upload')
                      setCurrentLora(null)
                      setImages([])
                      setGeneratedImages([])
                    }}
                    className="text-xs font-mono text-aura-cyan-bright hover:text-white transition-colors border border-aura-cyan-glow/30 px-3 py-1.5 rounded-lg hover:bg-aura-cyan-glow/10"
                  >
                    NEW_SESSION
                  </button>
                </div>
              </div>
              
              {/* Avatar Gallery */}
              <div className="glass-card p-6 md:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mb-2">
                    Your Digital Self
                  </h2>
                  <p className="text-white/50 text-sm">
                    Explore {currentLora.triggerWord || currentLora.name} in different styles
                  </p>
                </div>
                <GenerateForm
                  loraUrl={currentLora.loraUrl}
                  triggerWord={currentLora.triggerWord || currentLora.name}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  autoGenerate={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered by fal.ai badge */}
        <motion.div 
          className="fixed bottom-4 right-4 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <a
            href="https://fal.ai/models/fal-ai/z-image/turbo/lora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-aura-cyan-glow/50 transition-all group"
          >
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Powered by</span>
            <span className="text-xs font-semibold text-aura-cyan-bright">fal.ai</span>
            <svg className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </div>
      )}

      {/* Powered by badge on landing too */}
      {currentStep === 'landing' && (
        <motion.div 
          className="fixed bottom-4 right-4 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          <a
            href="https://fal.ai/models/fal-ai/z-image/turbo/lora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-aura-cyan-glow/50 transition-all group"
          >
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Powered by</span>
            <span className="text-xs font-semibold text-aura-cyan-bright">fal.ai</span>
            <svg className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      )}
    </main>
  )
}
