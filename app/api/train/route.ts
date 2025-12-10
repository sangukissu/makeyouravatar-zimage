import { NextRequest, NextResponse } from 'next/server'
import { fal, configureFal } from '@/lib/fal'

export async function POST(request: NextRequest) {
  try {
    configureFal()
    
    const body = await request.json()
    const { 
      imageDataUrl, 
      steps = 1000, 
      defaultCaption = 'a photo of TOK person',
      trainingType = 'balanced',
      learningRate = 0.0001
    } = body

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: 'Image data URL is required' },
        { status: 400 }
      )
    }

    // Submit training job to queue
    const { request_id } = await fal.queue.submit('fal-ai/z-image-trainer', {
      input: {
        image_data_url: imageDataUrl,
        steps,
        default_caption: defaultCaption,
        training_type: trainingType,
        learning_rate: learningRate,
      },
    })

    return NextResponse.json({ 
      requestId: request_id,
      message: 'Training job submitted successfully'
    })
  } catch (error) {
    console.error('Training error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start training' },
      { status: 500 }
    )
  }
}

