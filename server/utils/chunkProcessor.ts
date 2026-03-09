interface ChunkOptions<T> {
  data: T[]
  chunkSize: number
  processFn: (chunk: T[]) => Promise<void>
  onProgress?: (processed: number, total: number) => void
}

export const processInChunks = async <T>(options: ChunkOptions<T>) => {
  const { data, chunkSize, processFn, onProgress } = options
  const total = data.length
  let processed = 0

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    
    // Process chunk
    await processFn(chunk)
    
    processed += chunk.length
    if (onProgress) {
      onProgress(processed, total)
    }
  }

  return { total, processed }
}
