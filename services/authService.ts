import { supabase } from '../lib/supabase'
import { Patient, Doctor, User, UserRole } from '../types'

export class AuthService {
  static async signUp(email: string, password: string, userData: {
    name: string
    role: UserRole
    specialty?: string
    dateOfBirth?: string
    condition?: string
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name: userData.name,
          role: userData.role,
          specialty: userData.specialty,
          date_of_birth: userData.dateOfBirth,
          condition: userData.condition,
        })

      if (profileError) throw profileError
    }

    return authData
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error
    return profile
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

export class UserService {
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    return data as User
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getAllDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')

    if (error) throw error
    return data as Doctor[]
  }

  static async getPatientsByDoctorId(doctorId: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patient_doctor_relationships')
      .select(`
        patient:users!patient_doctor_relationships_patient_id_fkey(*)
      `)
      .eq('doctor_id', doctorId)

    if (error) throw error
    return (data as any[]).map(rel => rel.patient) as Patient[]
  }
}