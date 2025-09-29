const API_BASE_URL ='http://localhost:3001'

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
}

export async function signIn(credentials: SignInRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return response.json()
}

export async function signUp(credentials: SignUpRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return response.json()
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`)
  return response.json()
}
export async function signOut() {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    return response.json()
  }