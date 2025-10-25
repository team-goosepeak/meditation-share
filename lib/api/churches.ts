import { supabase } from '../supabase'

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function createChurch({
  name,
  address,
  description,
}: {
  name: string
  address?: string
  description?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const joinCode = generateJoinCode()

  const { data, error } = await supabase
    .from('churches')
    .insert({
      name,
      address,
      description,
      pastor_id: user.id,
      join_code: joinCode,
    })
    .select()
    .single()

  if (error) throw error

  // Add creator as admin member
  await supabase
    .from('church_members')
    .insert({
      church_id: data.id,
      user_id: user.id,
      role: 'admin',
    })

  return data
}

export async function getChurch(churchId: string) {
  const { data, error } = await supabase
    .from('churches')
    .select(`
      *,
      pastor:profiles(*)
    `)
    .eq('id', churchId)
    .single()

  if (error) throw error
  return data
}

export async function getChurches() {
  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getUserChurches(userId: string) {
  const { data, error } = await supabase
    .from('church_members')
    .select(`
      church:churches(*)
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data?.map(item => item.church) || []
}

export async function joinChurch(joinCode: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Find church by join code
  const { data: church, error: churchError } = await supabase
    .from('churches')
    .select('id')
    .eq('join_code', joinCode)
    .single()

  if (churchError) throw new Error('Invalid join code')

  // Add user to church
  const { data, error } = await supabase
    .from('church_members')
    .insert({
      church_id: church.id,
      user_id: user.id,
      role: 'member',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already a member of this church')
    }
    throw error
  }

  return data
}

export async function leaveChurch(churchId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('church_members')
    .delete()
    .eq('church_id', churchId)
    .eq('user_id', user.id)

  if (error) throw error
}

export async function getChurchMembers(churchId: string) {
  const { data, error } = await supabase
    .from('church_members')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('church_id', churchId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

