'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface TrainingProgressProps {
  requestId: string
  onComplete: (loraUrl: string, configUrl: string) => void
  onError: (error: string) => void
}

interface LogEntry {
  message: string
  timestamp?: string
}

export default function TrainingProgress({ 
  requestId, 
  onComplete, 
  onError 
}: TrainingProgressProps) {
  const [status, setStatus] = useState<string>('IN_QUEUE')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [progress, setProgress] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Poll for status
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status?requestId=${requestId}`)
        const data = await res.json()

        if (data.error) {
          onError(data.error)
          return
        }

        setStatus(data.status)
        setQueuePosition(data.queuePosition ?? null)

        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs)
          
          // Estimate progress from logs
          const stepMatch = data.logs
            .map((log: LogEntry) => log.message)
            .join('\n')
            .match(/step[:\s]*(\d+)/gi)
          
          if (stepMatch) {
            const lastMatch = stepMatch[stepMatch.length - 1]
            const step = parseInt(lastMatch.match(/\d+/)?.[0] || '0')
            // Assuming 1000 steps total
            setProgress(Math.min((step / 1000) * 100, 99))
          }
        }

        if (data.status === 'COMPLETED') {
          setProgress(100)
          clearInterval(intervalId)
          onComplete(data.result.loraUrl, data.result.configUrl)
        } else if (data.status === 'FAILED') {
          clearInterval(intervalId)
          onError('Training failed. Please try again.')
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
    }

    // Initial check
    checkStatus()
    
    // Poll every 3 seconds
    intervalId = setInterval(checkStatus, 3000)

    return () => clearInterval(intervalId)
  }, [requestId, onComplete, onError])

  // Progress ring calculations
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const statusMessages: Record<string, string> = {
    'IN_QUEUE': 'Initializing Sequence...',
    'IN_PROGRESS': 'Neural Network Training...',
    'COMPLETED': 'Protocol Complete',
    'FAILED': 'System Failure',
  }

  return (
    <div className="glass-card p-8 border border-aura-cyan-glow/20">
      <div className="flex flex-col items-center">
        {/* Progress ring */}
        <div className="relative mb-8">
          <svg className="progress-ring w-40 h-40" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              className="text-white/5"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="70"
              cy="70"
            />
            
            {/* Progress circle */}
            <motion.circle
              className="text-aura-cyan-glow"
              strokeWidth="4"
              stroke="url(#progressGradient)"
              fill="transparent"
              r={radius}
              cx="70"
              cy="70"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold font-mono text-aura-cyan-bright"
              key={Math.round(progress)}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px rgba(6, 182, 212, 0.1)',
                '0 0 40px rgba(6, 182, 212, 0.3)',
                '0 0 20px rgba(6, 182, 212, 0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Status message */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-xl font-display font-semibold text-white mb-2 tracking-wide uppercase">
            {statusMessages[status] || 'Processing...'}
          </h3>
          
          {queuePosition && status === 'IN_QUEUE' && (
            <p className="text-white/50 text-sm font-mono">
              QUEUE_POSITION: <span className="text-aura-cyan-bright">{queuePosition}</span>
            </p>
          )}
          
          <p className="text-white/30 text-xs mt-2 font-mono uppercase tracking-widest">
            Estimated Time: 3-5 MIN
          </p>
        </motion.div>

        {/* Animated dots */}
        {status === 'IN_PROGRESS' && (
          <div className="flex gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-aura-cyan-glow"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Logs section */}
        <AnimatePresence>
          {logs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-4"
            >
              <div className="text-[10px] text-aura-cyan-dim mb-2 flex items-center gap-2 font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-aura-cyan-bright animate-pulse" />
                System Logs
              </div>
              
              <div className="bg-black/40 border border-white/5 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-[10px] scrollbar-thin scrollbar-thumb-white/10">
                {logs.slice(-20).map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white/60 mb-1 flex gap-2"
                  >
                    <span className="text-aura-cyan-dim">{'>'}</span> 
                    <span>{log.message}</span>
                  </motion.div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
