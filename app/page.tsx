"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Anime {
  id: number
  title: {
    english?: string
    romaji: string
  }
  coverImage: {
    large: string
  }
  episodes?: number
  averageScore?: number
}

const categories = [
  { title: "Trending Now", key: "trending" },
  { title: "Popular This Season", key: "popularThisSeason" },
  { title: "Upcoming Anime", key: "upcoming" },
  { title: "All-Time Popular", key: "allTimePopular" },
  { title: "Top 100 Anime", key: "top100" },
]

export default function AnimePage() {
  const [animeLists, setAnimeLists] = useState<Record<string, Anime[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnime() {
      const promises = categories.map(async (cat) => {
        const res = await fetch(`/api/anime?category=${cat.key}`)
        if (res.ok) {
          const data = await res.json()
          return { key: cat.key, data }
        }
        return { key: cat.key, data: [] }
      })

      const results = await Promise.all(promises)
      const newAnimeLists: Record<string, Anime[]> = {}
      results.forEach(({ key, data }) => {
        newAnimeLists[key] = data
      })

      setAnimeLists(newAnimeLists)
      setIsLoading(false)
    }

    fetchAnime()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {categories.map(({ title, key }) => (
        <div key={key} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <Link href={`/category/${key}`}>
              <span className="text-blue-500 cursor-pointer hover:underline">
                View All
              </span>
            </Link>
          </div>
          <div className="flex overflow-x-auto space-x-4">
            {animeLists[key]?.slice(0, 10).map((anime) => (
              <div key={anime.id} className="w-36 flex-shrink-0">
                <img
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  className="rounded-md shadow-md"
                />
                <p className="text-xs mt-2">
                  {anime.title.english || anime.title.romaji}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
