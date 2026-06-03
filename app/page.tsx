'use client'

import { Copy, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/app-config'

const generateResponseSchema = z.object({ content: z.string() })
const generateErrorSchema = z.object({ error: z.string().optional() })

export const dynamic = 'force-static'

export default function Home() {
  const [userText, setUserText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!userText.trim()) {
      toast.error('請輸入指令')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/generate', {
        body: JSON.stringify({ userText }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = await response.json()
      if (!response.ok) {
        const { error } = generateErrorSchema.parse(data)
        throw new Error(error || '生成失敗')
      }

      const { content } = generateResponseSchema.parse(data)
      setResult(content)
      toast.success('生成成功！')
    }
    catch (error) {
      console.error('生成錯誤:', error)
      toast.error(error instanceof Error ? error.message : '生成失敗，請稍後再試')
    }
    finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) {
      toast.error('沒有內容可以複製')
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      toast.success('已複製到剪貼簿')
    }
    catch (error) {
      console.error('複製失敗:', error)
      toast.error('複製失敗')
    }
  }

  return (
    <div className={`
      min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4
      md:p-8
    `}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className={`
            mb-2 flex items-center justify-center gap-2 text-4xl font-bold
            text-slate-900
          `}
          >
            <Sparkles className="size-8 text-blue-500" />
            {APP_NAME}
          </h1>
          <p className="text-slate-600">
            {APP_DESCRIPTION}
          </p>
        </div>

        <div className={`
          grid gap-6
          md:grid-cols-2
        `}
        >
          <div className={`
            space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
          `}
          >
            <div className="space-y-2">
              <Label htmlFor="userText">輸入指令</Label>
              <Textarea
                className="min-h-[240px] resize-none"
                id="userText"
                onChange={e => setUserText(e.target.value)}
                placeholder="請輸入指令..."
                value={userText}
              />
            </div>

            <Button
              className="w-full"
              disabled={loading || !userText.trim()}
              onClick={handleGenerate}
              size="lg"
            >
              {loading
                ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      生成中...
                    </>
                  )
                : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      生成內容
                    </>
                  )}
            </Button>
          </div>

          <div className={`
            space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
          `}
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="result">生成結果</Label>
              <Button
                disabled={!result}
                onClick={handleCopy}
                size="sm"
                variant="outline"
              >
                <Copy className="mr-2 size-4" />
                複製
              </Button>
            </div>

            <Textarea
              className="min-h-[280px] resize-none bg-slate-50"
              id="result"
              placeholder="生成的內容會顯示在這裡..."
              readOnly
              value={result}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
