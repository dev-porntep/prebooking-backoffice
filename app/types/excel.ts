export interface ExcelRow {
  customer_name: string
  phone_number: string
  email?: string
  device_model: string
  device_color: string
  storage: string
  quantity: number
  preferred_branch: string
  prebooking_date: string
  deposit_amount?: number
  notes?: string
}

export interface ImportPreviewResult {
  jobId: string
  totalRows: number
  headers: string[]
  sampleRows: ExcelRow[]
  errors: ImportRowError[]
}

export interface ImportRowError {
  row: number
  column?: string
  message: string
}

export interface ImportJobStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRows: number
  processedRows: number
  result?: ImportResult
}

export interface ImportResult {
  success: number
  failed: number
  errors: ImportRowError[]
}

export interface ExportFilter {
  dateFrom?: string
  dateTo?: string
  status?: string
  deviceModel?: string
  branch?: string
}

export interface ExportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  filters: ExportFilter
  totalRows: number
  createdAt: string
}

export interface ExportHistoryItem {
  id: string
  filters: ExportFilter
  totalRows: number
  createdAt: string
  downloadUrl: string
}
