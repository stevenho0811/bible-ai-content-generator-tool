import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { generateWithAiSearch } from '@/lib/ai-search'
import { DEFAULT_INSTRUCTIONS } from '@/lib/app-config'

const generateRequestSchema = z.object({
  userText: z.string().trim().min(1, '請輸入指令'),
})

export async function POST(request: NextRequest) {
  try {
    const { userText } = generateRequestSchema.parse(await request.json())
    const content = await generateWithAiSearch({
      instructions: DEFAULT_INSTRUCTIONS,
      userText,
    })

    return NextResponse.json({ content })
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? '請求格式錯誤' },
        { status: 400 },
      )
    }

    console.error('AI Search 錯誤:', error)

    const message = error instanceof Error ? error.message : '未知錯誤，請稍後再試'
    return NextResponse.json(
      { error: `API 呼叫失敗: ${message}` },
      { status: 500 },
    )
  }
}
