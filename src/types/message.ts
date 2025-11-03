import type { User } from './user'
import type { PaginationParams } from './common'

// 留言心情类型
export type MessageMood = 'happy' | 'sad' | 'angry' | 'excited' | 'thinking'

// 留言状态类型
export type MessageStatus = 'pending' | 'approved' | 'rejected'

// 留言接口
export interface Message {
  id: number
  user_id: number | null
  nickname: string
  email: string | null
  content: string
  mood: MessageMood
  avatar: string | null
  ip: string | null
  location: string | null
  browser: string | null
  status: MessageStatus
  reply_to_id: number | null
  likes: number
  color: string | null
  created_at: string
  updated_at: string
  user?: User // 关联用户信息
  replies?: Message[] // 回复列表
  reply_to?: Message // 回复的留言
}

// 创建留言请求参数
export interface CreateMessageParams {
  content: string
  nickname?: string
  email?: string
  mood?: MessageMood
  reply_to_id?: number
}

// 更新留言请求参数
export interface UpdateMessageParams {
  content?: string
  mood?: MessageMood
}

// 获取留言列表请求参数
export interface GetMessagesParams extends PaginationParams {
  keyword?: string
  mood?: MessageMood
}

// 获取管理后台留言列表请求参数
export interface GetAdminMessagesParams extends PaginationParams {
  keyword?: string
  status?: MessageStatus | 'all'
}

// 留言分页列表响应
export interface MessageListResponse {
  messages?: Message[]
  items?: Message[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

// 批量删除请求参数
export interface BatchDeleteMessagesParams {
  messageIds: number[]
}

// 批量删除响应
export interface BatchDeleteMessagesResponse {
  successCount: number
  totalCount: number
  failures: Array<{
    messageId: number
    reason: string
  }>
}

// 批量审核请求参数
export interface BatchApproveMessagesParams {
  messageIds: number[]
  status: MessageStatus
}

// 批量审核响应
export interface BatchApproveMessagesResponse {
  affectedCount: number
  messages: Message[]
}

// 更新状态请求参数
export interface UpdateMessageStatusParams {
  status: MessageStatus
}

// 留言统计响应
export interface MessageStatsResponse {
  total: number
  pending: number
  approved: number
  rejected: number
}
