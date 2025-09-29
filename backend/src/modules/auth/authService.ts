import { Injectable } from '@nestjs/common'
import { supabaseClient } from '../../database/supabaseClient'

@Injectable()
export class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await supabaseClient.auth.signOut()
    return { error }
  }

  async getCurrentUser(userId?: string) {
    if (userId) {
      const { data, error } = await supabaseClient  
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    }
    return { data: null, error: null }
  }
}
