const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface RAGProcessRequest {
  file: File
  companyId: string
  year: number
  userId?: string
}

export interface RAGProcessResponse {
  success: boolean
  chunks: number
  balanceSheetId: string
  extractedText?: string
}

export async function processPDFForRAG(file: File, companyId: string, year: number, userId?: string): Promise<RAGProcessResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('companyId', companyId)
  formData.append('year', year.toString())
  if (userId) {
    formData.append('userId', userId)
  }

  console.log('📤 Uploading PDF directly to RAG processing...', {
    filename: file.name,
    size: file.size,
    companyId,
    year
  })

  try {
    const response = await fetch(`${API_BASE_URL}/rag/process`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`RAG processing failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result: RAGProcessResponse = await response.json()
    console.log('✅ PDF processed successfully:', result)
    return result
  } catch (error) {
    console.error('❌ RAG processing error:', error)
    throw error
  }
}