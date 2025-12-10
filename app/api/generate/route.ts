import { NextRequest, NextResponse } from 'next/server'
import { fal, configureFal } from '@/lib/fal'

export async function POST(request: NextRequest) {
  try {
    configureFal()
    
    const body = await request.json()
    const { 
      prompt,
      loraUrl,
      loraScale = 1.0,
      imageSize = 'square_hd',
      numImages = 1,
      numInferenceSteps = 8,
      guidanceScale = 3.5,
      seed,
      outputFormat = 'png'
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!loraUrl) {
      return NextResponse.json(
        { error: 'LoRA URL is required' },
        { status: 400 }
      )
    }

    // Build input for z-image turbo with lora
    const input: Record<string, unknown> = {
      prompt,
      image_size: imageSize,
      num_images: numImages,
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
      output_format: outputFormat,
      loras: [
        {
          path: loraUrl,
          scale: loraScale,
        }
      ],
    }

    // Add seed if provided
    if (seed !== undefined && seed !== null) {
      input.seed = seed
    }

    // Run inference
    const result = await fal.subscribe('fal-ai/z-image/turbo/lora', {
      input,
    })

    return NextResponse.json({
      images: result.data.images,
      seed: result.data.seed,
      prompt: result.data.prompt,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}

