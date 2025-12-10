'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getStoredLoras, deleteLora, updateLora, type StoredLora } from '@/lib/storage'

interface LoraManagerProps {
  onSelect: (lora: StoredLora) => void
  selectedLoraId?: string
}

export default function LoraManager({ onSelect, selectedLoraId }: LoraManagerProps) {
  const [loras, setLoras] = useState<StoredLora[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setLoras(getStoredLoras())
  }, [])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this model? This cannot be undone.')) {
      deleteLora(id)
      setLoras(getStoredLoras())
    }
  }

  const handleRename = (id: string) => {
    if (editName.trim()) {
      updateLora(id, { name: editName.trim() })
      setLoras(getStoredLoras())
    }
    setEditingId(null)
    setEditName('')
  }

  const startEdit = (lora: StoredLora, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(lora.id)
    setEditName(lora.name)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loras.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-blue-dim/30 to-aura-cyan-dim/30 flex items-center justify-center border border-white/5">
            <svg className="w-5 h-5 text-aura-cyan-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white font-display">Trained Models</h3>
            <p className="text-xs text-white/50 uppercase tracking-wider">{loras.length} Available</p>
          </div>
        </div>
        
        <motion.svg
          className="w-5 h-5 text-white/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {loras.map((lora) => (
                <motion.div
                  key={lora.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedLoraId === lora.id
                      ? 'bg-aura-cyan-glow/10 border-aura-cyan-glow/50'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                  onClick={() => onSelect(lora)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editingId === lora.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleRename(lora.id)
                          }}
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field text-sm py-1 px-2"
                            autoFocus
                            onBlur={() => handleRename(lora.id)}
                          />
                        </form>
                      ) : (
                        <h4 className="font-medium text-white truncate font-display">{lora.name}</h4>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/40 font-mono">
                          {formatDate(lora.createdAt)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          lora.trainingType === 'content' 
                            ? 'bg-aura-cyan-glow/20 text-aura-cyan-bright' 
                            : lora.trainingType === 'style'
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-aura-blue-glow/20 text-aura-blue-bright'
                        }`}>
                          {lora.trainingType}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => startEdit(lora, e)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        title="Rename"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(lora.id, e)}
                        className="p-2 rounded-lg hover:bg-rose-900/30 text-white/50 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {selectedLoraId === lora.id && (
                    <motion.div
                      layoutId="selectedIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-aura-cyan-bright"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
