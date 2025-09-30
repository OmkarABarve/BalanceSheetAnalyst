const API_BASE_URL = 'http://localhost:3001'

export async function getBalanceSheets(userId: string) {
  const response = await fetch(`${API_BASE_URL}/balance-sheets?userId=${userId}`)
  return response.json()
}

export async function createBalanceSheet(data: any) {
  const response = await fetch(`${API_BASE_URL}/balance-sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}


export async function uploadBalanceSheet(file: File, companyId: string, year: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('companyId', companyId)
    formData.append('year', year.toString())
  
    const response = await fetch(`${API_BASE_URL}/balance-sheets/upload`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    })
  
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  
    return response.json()
  }