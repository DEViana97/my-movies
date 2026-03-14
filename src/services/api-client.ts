type FetchOptions = {
  next?: NextFetchRequestConfig;
};

export async function apiClient<T>(path: string, options?: FetchOptions): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TMDB_API_KEY environment variable");
  }

  const url = new URL(`https://api.themoviedb.org/3${path}`);
  if (!url.searchParams.get("api_key")) {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url.toString(), {
    next: options?.next ?? { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
