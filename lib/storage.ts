// Types for stored LoRA data
export interface StoredLora {
  id: string
  name: string
  loraUrl: string
  configUrl: string
  createdAt: string
  thumbnailUrl?: string
  trainingType: 'content' | 'style' | 'balanced'
  triggerWord?: string
}

const STORAGE_KEY = 'zimage-loras'

// Get all stored LoRAs
export function getStoredLoras(): StoredLora[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save a new LoRA
export function saveLora(lora: Omit<StoredLora, 'id' | 'createdAt'>): StoredLora {
  const loras = getStoredLoras()
  
  const newLora: StoredLora = {
    ...lora,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  
  loras.unshift(newLora) // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loras))
  
  return newLora
}

// Delete a LoRA by ID
export function deleteLora(id: string): void {
  const loras = getStoredLoras()
  const filtered = loras.filter(l => l.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// Update a LoRA
export function updateLora(id: string, updates: Partial<StoredLora>): StoredLora | null {
  const loras = getStoredLoras()
  const index = loras.findIndex(l => l.id === id)
  
  if (index === -1) return null
  
  loras[index] = { ...loras[index], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loras))
  
  return loras[index]
}

// Get a single LoRA by ID
export function getLora(id: string): StoredLora | null {
  const loras = getStoredLoras()
  return loras.find(l => l.id === id) || null
}
