import { $fetch as apiFetch } from 'ofetch'
import { storeToRefs } from 'pinia'
import { usePrebookingStore } from '~/stores/prebookingStore'
import type { PrebookingFilter } from '~/types/prebooking'

export const usePrebooking = () => {
  const store = usePrebookingStore()
  const { prebookings, total, page, limit, totalPages, stats, isLoading, error } = storeToRefs(store)

  const fetchPrebookings = async (filter: PrebookingFilter) => {
    await store.fetchPrebookings(filter)
  }

  // Helper functions for common manipulations
  const refresh = () => {
    if (store.currentFilter) {
      store.fetchPrebookings(store.currentFilter)
    }
  }

  const deletePrebooking = async (id: string) => {
    try {
      await apiFetch(`/api/prebooking/${id}`, { method: 'DELETE' })
      refresh()
    } catch (err: unknown) {
      console.error('Failed to delete prebooking', err)
      throw err
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/prebooking/${id}`, {
        method: 'PUT',
        body: { status }
      })
      refresh()
    } catch (err: unknown) {
      console.error(`Failed to update prebooking status to ${status}`, err)
      throw err
    }
  }

  return {
    // State
    prebookings,
    total,
    page,
    limit,
    totalPages,
    stats,
    isLoading,
    error,

    // Actions
    fetchPrebookings,
    refresh,
    deletePrebooking,
    updateStatus
  }
}
