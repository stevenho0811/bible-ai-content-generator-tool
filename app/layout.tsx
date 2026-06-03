import { type Metadata } from 'next'
import { type PropsWithChildren } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/app-config'

import './globals.css'

export const metadata: Metadata = {
  description: APP_DESCRIPTION,
  title: APP_NAME,
}

type RootLayoutProps = PropsWithChildren

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
