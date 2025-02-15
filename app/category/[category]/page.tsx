"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

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

export default function CategoryPage() {
  const params = useParams()
  const category = params?.category ?? "" // e.g. "trending"

  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!category) return

    async function fetchAnime() {
      try {
        console.log("Fetching anime for category:", category)
        const res = await fetch(`/api/anime?category=${category}`)
        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()
        console.log("Fetched anime data:", data)
        setAnimeList(data)
      } catch (error) {
        console.error("Error fetching anime:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnime()
  }, [category])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Top Anime in {category.replace(/([A-Z])/g, " $1")}
      </h1>
      {animeList.length === 0 ? (
        <p className="text-center text-gray-500">
          No anime found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {animeList.map((anime) => (
            <div key={anime.id} className="bg-white rounded-md shadow-md p-3">
              <img
                src={anime.coverImage.large}
                alt={anime.title.english || anime.title.romaji}
                className="rounded-md"
              />
              <h2 className="text-sm font-semibold mt-2">
                {anime.title.english || anime.title.romaji}
              </h2>
              <p className="text-xs text-gray-500">
                Ep: {anime.episodes ?? "N/A"} | Score:{" "}
                {anime.averageScore ?? "No rating"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
