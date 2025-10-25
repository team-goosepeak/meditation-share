import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type Profile = {
  id: string
  display_name: string
  email: string
  avatar_url?: string
  bio?: string
  role: 'member' | 'pastor' | 'admin'
  created_at: string
  updated_at: string
}

export type Church = {
  id: string
  name: string
  address?: string
  description?: string
  pastor_id?: string
  join_code: string
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  author_id: string
  church_id?: string
  title: string
  body: string
  scriptures: Scripture[]
  tags: string[]
  visibility: 'public' | 'church' | 'friends' | 'private'
  sermon_date?: string
  sermon_location?: string
  created_at: string
  updated_at: string
  author?: Profile
  church?: Church
  reactions_count?: ReactionCount[]
  comments_count?: number
}

export type Scripture = {
  book: string
  chapter: number
  verseFrom: number
  verseTo?: number
  text?: string  // 전체 텍스트 (DB 저장용)
  verses?: Array<{  // 각 절 정보 (UI 표시용)
    verse: number
    text: string
  }>
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  parent_comment_id?: string
  body: string
  created_at: string
  updated_at: string
  author?: Profile
}

export type Reaction = {
  id: string
  post_id: string
  user_id: string
  type: 'heart' | 'pray' | 'amen' | 'thanks'
  created_at: string
}

export type ReactionCount = {
  type: string
  count: number
}

export type Notification = {
  id: string
  user_id: string
  type: 'comment' | 'reaction' | 'church_notice' | 'follow'
  title: string
  body?: string
  link?: string
  is_read: boolean
  created_at: string
}

