'use client'

import Script from 'next/script'

export default function TwitterScript() {
  return (
    <Script
      id="twitter-widget"
      strategy="beforeInteractive"
      src="https://platform.twitter.com/widgets.js"
    />
  )
} 