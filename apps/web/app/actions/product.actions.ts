"use server"

import { PlatformProduct } from "@enterprise-commerce/core/platform/types"
import { meilisearch } from "clients/meilisearch"
import { MEILISEARCH_INDEX } from "constants/index"
import { unstable_cache } from "next/cache"
import { getDemoSingleProduct, isDemoMode } from "utils/demoUtils"
import { ComparisonOperators, FilterBuilder } from "utils/filterBuilder"

export const searchProducts = unstable_cache(
  async (query: string, limit: number = 4) => {
    if (isDemoMode())
      return {
        hits: [],
        hasMore: false,
      }
    const index = await meilisearch?.getIndex<PlatformProduct>(MEILISEARCH_INDEX)

    if (!index) return { hits: [], hasMore: false }

    const res = await index?.search(query, { limit, attributesToRetrieve: ["id", "handle", "title", "featuredImage", "images", "variants"] })
    return { hits: res.hits, hasMore: res.estimatedTotalHits > limit }
  },
  ["autocomplete-search"],
  { revalidate: 3600 }
)

export const getProduct = unstable_cache(
  async (handle: string) => {
    if (isDemoMode()) return getDemoSingleProduct(handle)

    const index = await meilisearch?.getIndex<PlatformProduct>(MEILISEARCH_INDEX)
    const documents = await index?.getDocuments({ filter: new FilterBuilder().where("handle", ComparisonOperators.Equal, handle).build(), limit: 1 })
    return documents.results.find(Boolean) || null
  },
  ["product-by-handle"],
  { revalidate: 3600 }
)
