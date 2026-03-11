import { defineStore } from 'pinia'
import type { Prebooking, PrebookingFilter, PrebookingListResponse, PrebookingStats } from '~/types/prebooking'

export const usePrebookingStore = defineStore('prebooking', () => {
  const prebookings = ref<Prebooking[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const totalPages = ref(0)
  const stats = ref<PrebookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentFilter = ref<PrebookingFilter>({ page: 1, limit: 20 })

  async function fetchPrebookings(filter: PrebookingFilter): Promise<PrebookingListResponse | null> {
    isLoading.value = true
    error.value = null
    currentFilter.value = filter

    try {
      const query = new URLSearchParams()
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query.append(key, String(value))
        }
      })

      const response = await $fetch<PrebookingListResponse>(`/api/prebooking?${query.toString()}`)

      prebookings.value = response.data
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
      totalPages.value = response.totalPages
      stats.value = {
        total: response.total,
        pending: response.data.filter(p => p.status === 'pending').length,
        confirmed: response.data.filter(p => p.status === 'confirmed').length,
        cancelled: response.data.filter(p => p.status === 'cancelled').length,
        completed: response.data.filter(p => p.status === 'completed').length,
      }

      return response
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch prebookings'
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    prebookings,
    total,
    page,
    limit,
    totalPages,
    stats,
    isLoading,
    error,
    currentFilter,
    fetchPrebookings,
  }
})
