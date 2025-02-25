"use client"

import { FC, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

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
  genres?: string[]
}

const categories = [
  { title: "Trending Anime", key: "trending" },
  { title: "Upcoming Anime", key: "upcoming" },
  { title: "Popular This Month", key: "popularThisMonth" },
  { title: "Top 100 Anime", key: "top100" },
]

const AnimePage: FC = () => {
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {categories.map(({ title, key }) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            {key !== "top100" && (
              <Link href={`/category/${key}`}>
                <span className="text-blue-500 cursor-pointer hover:underline">
                  View All
                </span>
              </Link>
            )}
          </div>
          {key === "top100" ? (
            // Vertical layout for Top 100 Anime (with genres)
            <div className="flex flex-col space-y-4">
              {animeLists[key]?.map((anime) => (
                <div
                  key={anime.id}
                  className="flex items-center bg-white rounded-md shadow-md p-4"
                >
                  <Image
                    width={144}
                    height={216}
                    src={anime.coverImage.large}
                    alt={anime.title.english || anime.title.romaji}
                    className="w-36 h-auto rounded-md shadow-md mr-4"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {anime.title.english || anime.title.romaji}
                    </p>
                    <p className="text-xs text-gray-500">
                      Episodes: {anime.episodes ?? "N/A"} | Score:{" "}
                      {anime.averageScore ?? "No rating"}
                    </p>
                    {anime.genres && anime.genres.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Genres: {anime.genres.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal scrollable carousel for other categories with hidden scrollbar
            <div className="flex overflow-x-auto space-x-4 no-scrollbar">
              {animeLists[key]?.slice(0, 10).map((anime) => (
                <div key={anime.id} className="w-[200px] flex-shrink-0">
                  <Image
                    width={200}
                    height={300}
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
          )}
        </div>
      ))}
    </div>
  )
}

export default AnimePage
