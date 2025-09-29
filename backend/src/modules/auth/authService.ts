import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../database/supabaseClient'

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signIn(email: string, password: string) {
    const client = this.supabaseService.getClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async signUp(email: string, password: string) {
    const client = this.supabaseService.getClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async signOut() {
    const client = this.supabaseService.getClient()
    const { error } = await client.auth.signOut()
    return { error }
  }

  async getCurrentUser(userId?: string) {
    if (userId) {
      const client = this.supabaseService.getClient()
      const { data, error } = await client  
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    }
    return { data: null, error: null }
  }
}
