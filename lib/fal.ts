import { fal } from '@fal-ai/client'

// Configure fal client with API key from environment
// This should only be called server-side
export function configureFal() {
  fal.config({
    credentials: process.env.FAL_KEY || '',
  })
}

export { fal }

