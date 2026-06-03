import { GENERATION_MODEL } from '@/lib/app-config'
import { getCloudflareAiSearchConfig } from '@/lib/cloudflare-ai-search-config'

const AI_SEARCH_API = 'https://api.cloudflare.com/client/v4/accounts'

interface ChatCompletionResult {
  choices: Array<{
    message: {
      content: null | string
    }
  }>
}

interface CloudflareApiError {
  code?: number
  message?: string
}

interface CloudflareApiResponse {
  errors?: CloudflareApiError[]
  result?: ChatCompletionResult
  success?: boolean
}

export async function generateWithAiSearch(params: {
  instructions: string
  userText: string
}): Promise<string> {
  const { accountId, apiToken, instanceName } = getCloudflareAiSearchConfig()

  const response = await fetch(
    `${AI_SEARCH_API}/${accountId}/ai-search/instances/${instanceName}/chat/completions`,
    {
      body: JSON.stringify({
        messages: [
          { content: params.instructions, role: 'system' },
          { content: params.userText.trim() || params.instructions, role: 'user' },
        ],
        model: GENERATION_MODEL,
      }),
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  const data = await readJsonResponse(response)
  const result = parseChatCompletionResult(response, data)

  return result.choices[0]?.message.content ?? ''
}

function enhanceHttpError(status: number, message: string): string {
  if (message.toLowerCase().includes('authentication')) {
    return `${message}：請使用 Dashboard API Token（需 AI Search:Edit、AI Search:Run），不是 AI Gateway 的 cfut_ Token`
  }

  if (status === 503) {
    return `${message}：Gateway BYOK 需使用 alias「default」的 Google key`
  }

  return message
}

function formatApiError(errors?: CloudflareApiError[]) {
  const error = errors?.[0]
  if (!error?.message) {
    return undefined
  }

  return error.code ? `[${error.code}] ${error.message}` : error.message
}

function formatHttpError(status: number, raw?: string) {
  const trimmed = raw?.trim()
  if (trimmed && trimmed.length <= 200) {
    return `HTTP ${status}: ${trimmed}`
  }

  return `HTTP ${status}`
}

function getErrorMessage(data: unknown, status: number): string {
  if (isWrappedResponse(data)) {
    return formatApiError(data.errors) ?? formatHttpError(status)
  }

  return formatHttpError(status)
}

function isChatCompletionResult(data: unknown): data is ChatCompletionResult {
  return typeof data === 'object' && data !== null
    && 'choices' in data
    && Array.isArray(data.choices)
}

function isWrappedResponse(data: unknown): data is CloudflareApiResponse {
  return typeof data === 'object' && data !== null
    && ('success' in data || 'result' in data || 'errors' in data)
}

function parseChatCompletionResult(response: Response, data: unknown): ChatCompletionResult {
  if (!response.ok) {
    throw new Error(enhanceHttpError(response.status, getErrorMessage(data, response.status)))
  }

  if (isWrappedResponse(data)) {
    if (data.success === false) {
      throw new Error(formatApiError(data.errors) ?? 'AI Search 請求失敗')
    }

    if (data.result && isChatCompletionResult(data.result)) {
      return data.result
    }
  }

  if (isChatCompletionResult(data)) {
    return data
  }

  throw new Error('AI Search 回應格式無法解析')
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text()
  if (!raw) {
    return undefined
  }

  try {
    return JSON.parse(raw) as unknown
  }
  catch {
    throw new Error(formatHttpError(response.status, raw))
  }
}
