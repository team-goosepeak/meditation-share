import { supabase, Post, Scripture } from '../supabase'

export async function createPost({
  title,
  body,
  scriptures,
  tags,
  visibility,
  churchId,
  sermonDate,
  sermonLocation,
}: {
  title: string
  body: string
  scriptures?: Scripture[]
  tags?: string[]
  visibility: 'public' | 'church' | 'friends' | 'private'
  churchId?: string
  sermonDate?: string
  sermonLocation?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title,
      body,
      scriptures: scriptures || [],
      tags: tags || [],
      visibility,
      church_id: churchId,
      sermon_date: sermonDate,
      sermon_location: sermonLocation,
    })
    .select(`
      *,
      author:profiles(*),
      church:churches(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getPosts({
  filter = 'all',
  churchId,
  userId,
  limit = 20,
  offset = 0,
}: {
  filter?: 'all' | 'following' | 'church'
  churchId?: string
  userId?: string
  limit?: number
  offset?: number
} = {}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      church:churches(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (filter === 'church' && churchId) {
    query = query.eq('church_id', churchId)
  }

  if (userId) {
    query = query.eq('author_id', userId)
  }

  const { data, error } = await query

  if (error) throw error

  // Get reaction counts for each post
  const postsWithCounts = await Promise.all(
    (data || []).map(async (post) => {
      const { data: reactions } = await supabase
        .from('reactions')
        .select('type')
        .eq('post_id', post.id)

      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)

      const reactionCounts = reactions?.reduce((acc, r) => {
        const existing = acc.find(item => item.type === r.type)
        if (existing) {
          existing.count++
        } else {
          acc.push({ type: r.type, count: 1 })
        }
        return acc
      }, [] as { type: string; count: number }[])

      return {
        ...post,
        reactions_count: reactionCounts || [],
        comments_count: count || 0,
      }
    })
  )

  return postsWithCounts
}

export async function getPost(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      church:churches(*)
    `)
    .eq('id', postId)
    .single()

  if (error) throw error

  // Get reaction counts
  const { data: reactions } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', postId)

  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  const reactionCounts = reactions?.reduce((acc, r) => {
    const existing = acc.find(item => item.type === r.type)
    if (existing) {
      existing.count++
    } else {
      acc.push({ type: r.type, count: 1 })
    }
    return acc
  }, [] as { type: string; count: number }[])

  return {
    ...data,
    reactions_count: reactionCounts || [],
    comments_count: count || 0,
  }
}

export async function updatePost(
  postId: string,
  updates: Partial<{
    title: string
    body: string
    scriptures: Scripture[]
    tags: string[]
    visibility: 'public' | 'church' | 'friends' | 'private'
    sermon_date: string
    sermon_location: string
  }>
) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

