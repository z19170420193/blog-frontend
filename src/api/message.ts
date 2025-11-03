import { http } from './request'
import type {
  Message,
  CreateMessageParams,
  UpdateMessageParams,
  GetMessagesParams,
  GetAdminMessagesParams,
  MessageListResponse,
  BatchDeleteMessagesParams,
  BatchDeleteMessagesResponse,
  BatchApproveMessagesParams,
  BatchApproveMessagesResponse,
  UpdateMessageStatusParams,
  MessageStatsResponse
} from '@/types/message'

// 获取留言列表(公开)
export const getMessages = (params?: GetMessagesParams) =>
  http.get<MessageListResponse>('/messages', { params })

// 获取留言列表(管理后台)
export const getAdminMessages = (params?: GetAdminMessagesParams) =>
  http.get<MessageListResponse>('/messages/admin', { params })

// 发表留言
export const createMessage = (data: CreateMessageParams) =>
  http.post<Message>('/messages', data)

// 更新留言
export const updateMessage = (id: number, data: UpdateMessageParams) =>
  http.put<Message>(`/messages/${id}`, data)

// 删除留言
export const deleteMessage = (id: number) =>
  http.delete<null>(`/messages/${id}`)

// 更新留言状态(仅管理员)
export const updateMessageStatus = (id: number, data: UpdateMessageStatusParams) =>
  http.put<Message>(`/messages/${id}/status`, data)

// 点赞留言
export const likeMessage = (id: number) =>
  http.post<{ likes: number }>(`/messages/${id}/like`)

// 批量删除留言(仅管理员)
export const batchDeleteMessages = (data: BatchDeleteMessagesParams) =>
  http.post<BatchDeleteMessagesResponse>('/messages/batch-delete', data)

// 批量审核留言(仅管理员)
export const batchApproveMessages = (data: BatchApproveMessagesParams) =>
  http.post<BatchApproveMessagesResponse>('/messages/batch-approve', data)

// 获取留言统计(仅管理员)
export const getMessageStats = () =>
  http.get<MessageStatsResponse>('/messages/stats')
