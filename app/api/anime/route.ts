// app/api/anime/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 })
  }

  // Define filters for different categories.
  // Adjust these filters as needed for your use case.
  const categoryFilters: Record<string, any> = {
    trending: { sort: "TRENDING_DESC" },
    popularThisSeason: {
      season: "WINTER",
      seasonYear: 2025,
      sort: "POPULARITY_DESC",
    },
    upcoming: { status: "NOT_YET_RELEASED", sort: "POPULARITY_DESC" },
    allTimePopular: { sort: "POPULARITY_DESC" },
    top100: { sort: "SCORE_DESC" },
  }

  // Use the filter for the given category, or default to trending.
  const variables = {
    page: 1,
    perPage: 50,
    ...(categoryFilters[category] || categoryFilters.trending),
  }

  // GraphQL query to fetch anime from AniList.
  const query = `
    query (
      $page: Int,
      $perPage: Int,
      $sort: [MediaSort],
      $season: MediaSeason,
      $seasonYear: Int,
      $status: MediaStatus
    ) {
      Page(page: $page, perPage: $perPage) {
        media(
          type: ANIME,
          season: $season,
          seasonYear: $seasonYear,
          status: $status,
          sort: $sort
        ) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          episodes
          averageScore
        }
      }
    }
  `

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from AniList" },
        { status: res.status }
      )
    }

    const json = await res.json()
    const media = json.data.Page.media
    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching from AniList:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
