import { NextRequest, NextResponse } from 'next/server'
import { fal, configureFal } from '@/lib/fal'

export async function POST(request: NextRequest) {
  try {
    configureFal()
    
    const body = await request.json()
    const { zipBase64 } = body

    if (!zipBase64) {
      return NextResponse.json(
        { error: 'Zip file data is required' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(zipBase64, 'base64')
    
    // Create a File-like object for fal storage upload
    const blob = new Blob([buffer], { type: 'application/zip' })
    
    // Upload to fal storage
    const url = await fal.storage.upload(blob)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}

