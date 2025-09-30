import type { User } from '../types'

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
}

const STORAGE_KEY = 'bsa_user'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeStoredUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export async function signIn(credentials: SignInRequest): Promise<{ data: { user: User } | null; error: any | null }> {
  const existing = readStoredUser()
  if (existing && existing.email.toLowerCase() === credentials.email.toLowerCase()) {
    return { data: { user: existing }, error: null }
  }
  // Create a lightweight user on first sign in for mock auth
  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    email: credentials.email,
    created_at: now,
    updated_at: now,
  }
  writeStoredUser(user)
  return { data: { user }, error: null }
}

export async function signUp(credentials: SignUpRequest): Promise<{ data: { user: User } | null; error: any | null }> {
  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    email: credentials.email,
    created_at: now,
    updated_at: now,
  }
  writeStoredUser(user)
  return { data: { user }, error: null }
}

export async function getCurrentUser(): Promise<User | null> {
  return readStoredUser()
}

export async function signOut(): Promise<{ error: any | null }> {
  writeStoredUser(null)
  return { error: null }
}