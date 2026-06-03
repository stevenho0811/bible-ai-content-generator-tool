export interface CloudflareAiSearchConfig {
  accountId: string
  apiToken: string
  instanceName: string
}

export function getCloudflareAiSearchConfig(): CloudflareAiSearchConfig {
  const instanceName = process.env.AI_SEARCH_INSTANCE_NAME
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!instanceName) {
    throw new Error('請設定 AI_SEARCH_INSTANCE_NAME')
  }

  if (!accountId || !apiToken) {
    throw new Error('請設定 CLOUDFLARE_ACCOUNT_ID 與 CLOUDFLARE_API_TOKEN')
  }

  return { accountId, apiToken, instanceName }
}
