'use client'

import { useEffect, useRef, useState } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
  onLoad?: () => void
}

export default function TweetEmbed({ tweetUrl, onLoad }: TweetEmbedProps) {
  const tweetRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const hasCreatedTweet = useRef(false)

  useEffect(() => {
    let isMounted = true

    const loadTweet = async () => {
      // @ts-ignore
      if (window.twttr?.widgets && !hasCreatedTweet.current) {
        try {
          hasCreatedTweet.current = true
          // @ts-ignore
          await window.twttr.widgets.createTweet(
            getTweetId(tweetUrl),
            tweetRef.current,
            {
              theme: 'dark'
            }
          )
          if (isMounted) {
            setIsLoaded(true)
            onLoad?.()
          }
        } catch (error) {
          console.error('Error loading tweet:', error)
          hasCreatedTweet.current = false
        }
      } else if (!hasCreatedTweet.current) {
        setTimeout(loadTweet, 100)
      }
    }

    loadTweet()

    return () => {
      isMounted = false
      hasCreatedTweet.current = false
      if (tweetRef.current) {
        tweetRef.current.innerHTML = ''
      }
    }
  }, [tweetUrl, onLoad])

  const getTweetId = (url: string): string => {
    const matches = url.match(/\/status\/(\d+)/)
    return matches ? matches[1] : ''
  }

  return (
    <div 
      ref={tweetRef} 
      className="flex justify-center"
      style={{ minHeight: isLoaded ? 'auto' : '200px' }}
    >
      {!isLoaded && (
        <div className="w-full h-[200px] flex items-center justify-center text-neutral-400">
          Loading Tweet...
        </div>
      )}
    </div>
  )
} 