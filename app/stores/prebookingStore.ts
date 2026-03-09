import { defineStore } from 'pinia'
import type { Prebooking, PrebookingFilter, PrebookingListResponse, PrebookingStats } from '~/types/prebooking'

export const usePrebookingStore = defineStore('prebooking', {
  state: () => ({
    prebookings: [] as Prebooking[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    stats: {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    } as PrebookingStats,
    isLoading: false,
    error: null as string | null,
    currentFilter: { page: 1, limit: 20 } as PrebookingFilter
  }),

  actions: {
    async fetchPrebookings(filter: PrebookingFilter) {
      this.isLoading = true
      this.error = null
      this.currentFilter = filter
      
      try {
        const query = new URLSearchParams()
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            query.append(key, String(value))
          }
        })

        const response = await $fetch<PrebookingListResponse>(`/api/prebooking?${query.toString()}`)
        this.prebookings = response.data
        this.total = response.total
        this.page = response.page
        this.limit = response.limit
        this.totalPages = response.totalPages
        
        // Update stats from response if provided, otherwise compute from data or mock it for now
        this.stats = {
          total: response.total,
          pending: response.data.filter(p => p.status === 'pending').length,
          confirmed: response.data.filter(p => p.status === 'confirmed').length,
          cancelled: response.data.filter(p => p.status === 'cancelled').length,
          completed: response.data.filter(p => p.status === 'completed').length
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch prebookings'
      } finally {
        this.isLoading = false
      }
    }
  }
})
