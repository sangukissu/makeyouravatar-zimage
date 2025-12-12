import { NextRequest, NextResponse } from 'next/server'
import { fal, configureFal } from '@/lib/fal'

export async function GET(request: NextRequest) {
  try {
    configureFal()
    
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Check status
    const status = await fal.queue.status('fal-ai/z-image-trainer', {
      requestId,
      logs: true,
    })

    // If completed, fetch the result
    if (status.status === 'COMPLETED') {
      const result = await fal.queue.result('fal-ai/z-image-trainer', {
        requestId,
      })
      
      return NextResponse.json({
        status: 'COMPLETED',
        result: {
          loraUrl: result.data.diffusers_lora_file?.url,
          configUrl: result.data.config_file?.url,
        },
        logs: (status as any).logs || [],
      })
    }

    return NextResponse.json({
      status: status.status,
      // FIX 1: Handle logs (exists on InProgress, missing on InQueue)
      logs: (status as any).logs || [],
      // FIX 2: Handle queuePosition (exists on InQueue, missing on InProgress)
      queuePosition: (status as any).queue_position || 0,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    )
  }
}
