'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  ArrowRight,
  Sparkles,
  Sliders,
  Zap,
  Star,
  Twitter,
  Heart,
  Repeat2,
  MessageCircle,
} from 'lucide-react'

// Placeholder testimonials - Twitter style
const testimonials = [
  {
    name: 'Sarah Chen',
    handle: '@sarahcreates',
    avatar: 'SC',
    content: 'Just made an astronaut version of myself in 3 minutes. This is absolutely insane! 🚀 The quality is incredible.',
    likes: 847,
    retweets: 124,
    time: '2h',
    verified: true,
  },
  {
    name: 'Marcus Rodriguez',
    handle: '@marcusbuilds',
    avatar: 'MR',
    content: 'Tried every AI avatar tool out there. This one actually captures my likeness. Finally a tool that works! 🔥',
    likes: 1243,
    retweets: 89,
    time: '5h',
    verified: true,
  },
  {
    name: 'Emily Watson',
    handle: '@emilywats',
    avatar: 'EW',
    content: 'Made professional headshots, fantasy characters, AND anime versions. All from 5 photos. Mind = blown 🤯',
    likes: 562,
    retweets: 78,
    time: '8h',
    verified: false,
  },
  {
    name: 'David Park',
    handle: '@davidparkdesign',
    avatar: 'DP',
    content: 'The advanced mode lets you write any prompt. Created myself as a cyberpunk character. Portfolio-worthy results!',
    likes: 934,
    retweets: 156,
    time: '12h',
    verified: true,
  },
  {
    name: 'Lisa Thompson',
    handle: '@lisacodes',
    avatar: 'LT',
    content: 'Used this for my LinkedIn photo. Got 3x more profile views. The AI somehow makes you look professional AND approachable.',
    likes: 2156,
    retweets: 312,
    time: '1d',
    verified: false,
  },
  {
    name: 'Alex Kim',
    handle: '@alexkimstudio',
    avatar: 'AK',
    content: 'As a photographer, I was skeptical. But this actually understands lighting and composition. Really impressive tech.',
    likes: 789,
    retweets: 67,
    time: '1d',
    verified: true,
  },
]

interface LandingPageProps {
  onGetStarted: () => void
}

// Sample avatar results to cycle through
const avatarExamples = [
  { style: 'Astronaut', color: 'from-blue-600 to-purple-600' },
  { style: 'Superhero', color: 'from-red-500 to-orange-500' },
  { style: 'Fantasy', color: 'from-emerald-500 to-cyan-500' },
  { style: 'Cyberpunk', color: 'from-pink-500 to-purple-500' },
  { style: 'Royal', color: 'from-yellow-500 to-amber-600' },
]

// Floating tags for avatars
const floatingTags = [
  { text: 'HD', icon: Zap, delay: 0 },
  { text: '4K', icon: Star, delay: 0.5 },
  { text: 'Instant', icon: Sparkles, delay: 1 },
]

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeExample, setActiveExample] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Mouse follow spotlight
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Auto-cycle through examples
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % avatarExamples.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Track mouse position for spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
      
      {/* Mouse-follow spotlight */}
      <motion.div
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Aurora/Gradient Wave at top */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 left-1/4 w-[800px] h-[400px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'linear-gradient(90deg, #10b981, #f59e0b, #34d399)',
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 30, -20, 0],
            scale: [1, 1.1, 0.95, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-1/2 right-1/4 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'linear-gradient(90deg, #fbbf24, #10b981)',
          }}
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        />
      </motion.div>
      
      {/* Animated Background Grid with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          }}
          animate={{ 
            backgroundPosition: ['0px 0px', '0px 60px'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
      </div>

      {/* Animated Spiral/Vortex Background */}
      <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none opacity-60">
        {/* Spinning rings with glow */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `${2 - i * 0.2}px solid transparent`,
              borderTopColor: i % 2 === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.3)',
              borderRightColor: i % 2 === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              transform: `scale(${0.3 + i * 0.14})`,
              filter: 'blur(0.5px)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? '#34d399' : i % 3 === 1 ? '#fbbf24' : '#10b981'
              }, transparent)`,
              boxShadow: `0 0 ${10 + i}px ${
                i % 3 === 0 ? '#34d399' : i % 3 === 1 ? '#fbbf24' : '#10b981'
              }`,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * 18 * Math.PI) / 180) * (80 + i * 15),
                Math.cos(((i * 18 + 360) * Math.PI) / 180) * (80 + i * 15),
              ],
              y: [
                Math.sin((i * 18 * Math.PI) / 180) * (80 + i * 15),
                Math.sin(((i * 18 + 360) * Math.PI) / 180) * (80 + i * 15),
              ],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Center glow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 blur-3xl" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 relative z-10 max-w-4xl"
      >
        {/* Glowing headline with staggered animation */}
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-display mb-6 tracking-tight relative glow-headline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="relative">
            {/* "Transform" with letter stagger */}
            <span className="inline-block">
              {'Transform'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>{' '}
            <span className="relative inline-block">
              <span className="gradient-text">yourself</span>
              {/* Metallic sheen effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                style={{ mixBlendMode: 'overlay' }}
              />
              {/* Underline glow animation */}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 rounded-full"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </span>
            <br />
            {/* "into anything." with stagger */}
            <span className="inline-block">
              {'into anything.'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.04, duration: 0.3 }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </span>
          </span>
        </motion.h1>
        
        <motion.p
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Upload your photos. Train your personal AI model. 
          <span className="text-aura-emerald-bright"> Generate stunning avatars</span> in any style.
        </motion.p>

        {/* Primary CTA - Vibrant Orange/Coral with Effects */}
        <motion.button
          onClick={onGetStarted}
          className="relative group mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Pulsing glow behind button */}
          <motion.div 
            className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full blur-xl"
            animate={{ 
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Glassmorphism button with metallic finish */}
          <div className="relative px-10 py-5 rounded-full text-white font-bold text-lg flex items-center gap-3 overflow-hidden border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.95) 50%, rgba(234, 88, 12, 1) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: `
                0 0 40px rgba(251, 146, 60, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                0 10px 40px rgba(0, 0, 0, 0.3)
              `,
            }}
          >
            {/* Inner glow border */}
            <div className="absolute inset-0 rounded-full border border-white/30" />
            
            {/* Metallic shine sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            
            <Sparkles className="w-5 h-5 relative z-10" />
            <span className="relative z-10 drop-shadow-md">Start Your Transformation</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.p
          className="text-white/30 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          No signup required • Pay only for training (~$2)
        </motion.p>
      </motion.div>

      {/* Visual Process Flow */}
      <motion.div
        className="w-full max-w-6xl mx-auto mb-12 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
          
          {/* Input Photo Box */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex flex-col items-center justify-center overflow-hidden backdrop-blur-sm relative">
              {/* Animated photo stack effect */}
              <div className="relative w-16 h-16 mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/30"
                    style={{
                      transform: `rotate(${(i - 1) * 8}deg) translateY(${i * 2}px)`,
                      zIndex: 3 - i,
                    }}
                    animate={{ 
                      rotate: [(i - 1) * 8, (i - 1) * 8 + 2, (i - 1) * 8],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <div className="absolute inset-2 rounded bg-gradient-to-br from-slate-600 to-slate-800" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-white/70 font-medium">Your Photos</p>
            </div>
            
            {/* Prominent 5+ Badge */}
            <motion.div
              className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-r from-aura-emerald-glow to-emerald-400 flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-white/20"
              animate={{ 
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.5)',
                  '0 0 40px rgba(16, 185, 129, 0.8)',
                  '0 0 20px rgba(16, 185, 129, 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              5+
            </motion.div>
          </motion.div>

          {/* Pulsing Arrow 1 */}
          <div className="flex items-center gap-2 py-4 md:py-0">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-aura-emerald-glow"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.15 
                }}
              />
            ))}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6 text-aura-emerald-glow" />
            </motion.div>
          </div>

          {/* AI Processing */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-aura-emerald-glow/20 to-amber-500/20 border border-aura-emerald-glow/40 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
              {/* Inner rotating ring */}
              <motion.div
                className="absolute inset-3 rounded-full border-2 border-dashed border-aura-emerald-glow/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Center icon */}
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-aura-emerald-bright mx-auto" />
                </motion.div>
              </div>
              
              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * 60 * Math.PI) / 180) * 50],
                    y: [0, Math.sin((i * 60 * Math.PI) / 180) * 50],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-aura-emerald-bright/80 text-center mt-3 font-medium uppercase tracking-wider">AI Magic</p>
            <p className="text-[10px] text-white/40 text-center">~3 min</p>
          </motion.div>

          {/* Pulsing Arrow 2 */}
          <div className="flex items-center gap-2 py-4 md:py-0">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.15 
                }}
              />
            ))}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6 text-amber-400" />
            </motion.div>
          </div>

          {/* Output Avatars - Cycling Gallery */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            {/* Floating quality tags */}
            {floatingTags.map((tag, i) => (
              <motion.div
                key={tag.text}
                className="absolute hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-[10px] text-white/80"
                style={{
                  top: i === 0 ? '-20px' : i === 1 ? '30%' : '70%',
                  right: i === 0 ? '20%' : i === 1 ? '-40px' : '-30px',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -5, 0],
                }}
                transition={{ 
                  opacity: { delay: 2 + tag.delay },
                  scale: { delay: 2 + tag.delay },
                  y: { duration: 2, repeat: Infinity, delay: tag.delay }
                }}
              >
                <tag.icon className="w-3 h-3 text-emerald-400" />
                {tag.text}
              </motion.div>
            ))}

            <div className="flex gap-3">
              {avatarExamples.slice(0, 3).map((example, index) => (
                <motion.div
                  key={example.style}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.15 }}
                >
                  <motion.div 
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${example.color} flex flex-col items-center justify-center border border-white/20 shadow-2xl overflow-hidden relative`}
                    animate={activeExample === index ? { 
                      y: [0, -8, 0],
                      boxShadow: [
                        '0 20px 40px rgba(0,0,0,0.3)',
                        '0 30px 60px rgba(0,0,0,0.4)',
                        '0 20px 40px rgba(0,0,0,0.3)',
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Abstract avatar silhouette */}
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-b from-white/40 to-white/10" />
                    </div>
                    <p className="text-[10px] md:text-xs text-white font-medium">{example.style}</p>
                    
                    {/* Shimmer overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: index * 0.5 }}
                    />
                  </motion.div>
                  
                  {/* Glow */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${example.color} blur-xl -z-10`}
                    animate={{ opacity: activeExample === index ? [0.3, 0.6, 0.3] : 0.2 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* "12 Styles" badge with animated border */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-xs text-white/80 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              />
              <span className="relative">12 instant styles</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {[
          { 
            title: 'Upload 5+ Photos', 
            desc: 'Different angles, good lighting',
            gradient: 'from-emerald-500/20 to-teal-500/20',
            border: 'border-emerald-500/30',
            number: '01'
          },
          { 
            title: 'Train Your Model', 
            desc: '3-5 minutes of AI processing',
            gradient: 'from-amber-500/20 to-yellow-500/20',
            border: 'border-amber-500/30',
            number: '02'
          },
          { 
            title: '12 Instant Avatars', 
            desc: 'Astronaut, superhero & more',
            gradient: 'from-teal-500/20 to-emerald-500/20',
            border: 'border-teal-500/30',
            number: '03'
          },
          { 
            title: 'Advanced Mode', 
            desc: 'Custom prompts & full control',
            gradient: 'from-orange-500/20 to-amber-500/20',
            border: 'border-orange-500/30',
            number: '✨',
            isAdvanced: true
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.border} backdrop-blur-sm overflow-hidden group`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            {/* Step number or icon */}
            <span className="absolute top-3 right-3 text-3xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
              {feature.number}
            </span>
            
            {/* Advanced mode icon */}
            {'isAdvanced' in feature && feature.isAdvanced && (
              <motion.div
                className="absolute top-3 right-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sliders className="w-5 h-5 text-orange-400/50 group-hover:text-orange-400/80 transition-colors" />
              </motion.div>
            )}
            
            <h3 className="text-white font-semibold mb-1 text-base">{feature.title}</h3>
            <p className="text-white/50 text-xs">{feature.desc}</p>
            
            {/* Special glow for advanced mode */}
            {'isAdvanced' in feature && feature.isAdvanced && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="w-full max-w-6xl mx-auto mb-12 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.h3 
          className="text-center text-white/40 text-sm uppercase tracking-widest mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          What people are saying
        </motion.h3>

        {/* Scrolling testimonials container */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-midnight to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-midnight to-transparent z-10 pointer-events-none" />
          
          {/* First row - scrolls left */}
          <motion.div 
            className="flex gap-4 mb-4"
            animate={{ x: [0, -1500] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div 
                key={`row1-${index}`}
                className="flex-shrink-0 w-[350px] p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white text-sm truncate">{testimonial.name}</span>
                      {testimonial.verified && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">{testimonial.handle} · {testimonial.time}</span>
                  </div>
                  <Twitter className="w-5 h-5 text-white/30 flex-shrink-0" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{testimonial.content}</p>
                <div className="flex items-center gap-6 text-white/30 text-xs">
                  <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {Math.floor(testimonial.likes / 10)}
                  </span>
                  <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors">
                    <Repeat2 className="w-4 h-4" />
                    {testimonial.retweets}
                  </span>
                  <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors">
                    <Heart className="w-4 h-4" />
                    {testimonial.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Second row - scrolls right */}
          <motion.div 
            className="flex gap-4"
            animate={{ x: [-1500, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            {[...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
              <div 
                key={`row2-${index}`}
                className="flex-shrink-0 w-[350px] p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white text-sm truncate">{testimonial.name}</span>
                      {testimonial.verified && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">{testimonial.handle} · {testimonial.time}</span>
                  </div>
                  <Twitter className="w-5 h-5 text-white/30 flex-shrink-0" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{testimonial.content}</p>
                <div className="flex items-center gap-6 text-white/30 text-xs">
                  <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {Math.floor(testimonial.likes / 10)}
                  </span>
                  <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors">
                    <Repeat2 className="w-4 h-4" />
                    {testimonial.retweets}
                  </span>
                  <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors">
                    <Heart className="w-4 h-4" />
                    {testimonial.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Secondary CTA */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <button
          onClick={onGetStarted}
          className="text-aura-emerald-bright hover:text-white transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
        >
          See how it works
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
