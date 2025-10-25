import { supabase } from '../supabase'

export type ReactionType = 'heart' | 'pray' | 'amen' | 'thanks'

export async function addReaction(postId: string, type: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('reactions')
    .insert({
      post_id: postId,
      user_id: user.id,
      type,
    })
    .select()
    .single()

  if (error) {
    // If reaction already exists, toggle it off
    if (error.code === '23505') {
      return removeReaction(postId, type)
    }
    throw error
  }
  return data
}

export async function removeReaction(postId: string, type: ReactionType) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', type)

  if (error) throw error
}

export async function getPostReactions(postId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('post_id', postId)

  if (error) throw error

  // Count reactions by type
  const counts = data?.reduce((acc, r) => {
    const existing = acc.find((item: { type: string; count: number }) => item.type === r.type)
    if (existing) {
      existing.count++
    } else {
      acc.push({ type: r.type, count: 1 })
    }
    return acc
  }, [] as { type: string; count: number }[])

  return {
    reactions: data || [],
    counts: counts || [],
  }
}

export async function getUserReactionsForPost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) throw error
  return data?.map(r => r.type) || []
}

