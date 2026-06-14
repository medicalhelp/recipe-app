import { NextRequest, NextResponse } from 'next/server'
import { createStorageClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const filePath = path.join('/')

  const supabase = createStorageClient()
  const { data, error } = await supabase.storage
    .from('recipe-images')
    .download(filePath)

  if (error || !data) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
