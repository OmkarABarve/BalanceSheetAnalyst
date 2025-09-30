
const API_BASE_URL = 'http://localhost:3001'

export interface ChatRequest {
  query: string
  context?: string
}

export interface ChatResponse {
  response: string
}

export async function askChat(query: string, context?: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, context } as ChatRequest),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ChatResponse = await response.json()
    return data.response
  } catch (error) {
    console.error('Error calling chat API:', error)
    throw error
  }
}

