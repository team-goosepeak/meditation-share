import { supabase } from '../supabase'

export async function createComment({
  postId,
  body,
  parentCommentId,
}: {
  postId: string
  body: string
  parentCommentId?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      body,
      parent_comment_id: parentCommentId,
    })
    .select(`
      *,
      author:profiles(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function updateComment(commentId: string, body: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({ body })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

