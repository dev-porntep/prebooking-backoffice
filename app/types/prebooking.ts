export interface Prebooking {
  id: string
  customerName: string
  phoneNumber: string
  email?: string
  deviceModel: string
  deviceColor: string
  storage: string
  quantity: number
  preferredBranch: string
  prebookingDate: string
  depositAmount?: number
  notes?: string
  status: PrebookingStatus
  createdAt: string
  updatedAt: string
}

export type PrebookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface PrebookingFilter {
  search?: string
  status?: PrebookingStatus | ''
  deviceModel?: string
  branch?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PrebookingListResponse {
  data: Prebooking[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PrebookingStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  completed: number
}
