import { http } from './request'
import type { 
  Comment, 
  CommentFormData, 
  UpdateCommentParams, 
  PaginationParams,
  BatchDeleteCommentsParams,
  BatchDeleteCommentsResponse,
  BatchApproveCommentsParams,
  BatchApproveCommentsResponse
} from '@/types'

/**
 * 获取所有评论列表（管理后台）
 */
export const getAllComments = (params?: PaginationParams & {
  keyword?: string
  status?: 'approved' | 'pending' | 'all'
  article_id?: number
}) => {
  return http.get<{
    comments: Comment[]
    total: number
    page: number
    limit: number
  }>('/comments', { params })
}

/**
 * 获取文章评论列表
 */
export const getCommentsByArticleId = (articleId: number) => {
  return http.get<Comment[]>(`/articles/${articleId}/comments`)
}

/**
 * 发表评论
 */
export const createComment = (articleId: number, data: Omit<CommentFormData, 'article_id'>) => {
  return http.post<Comment>(`/articles/${articleId}/comments`, data)
}

/**
 * 更新评论
 */
export const updateComment = (id: number, data: UpdateCommentParams) => {
  return http.put<Comment>(`/comments/${id}`, data)
}

/**
 * 删除评论
 */
export const deleteComment = (id: number) => {
  return http.delete(`/comments/${id}`)
}

/**
 * 审核评论（仅管理员）
 */
export const approveComment = (id: number, isApproved: boolean) => {
  return http.put<Comment>(`/comments/${id}/approve`, { is_approved: isApproved })
}

/**
 * 批量删除评论
 */
export const batchDeleteComments = (data: BatchDeleteCommentsParams) => {
  return http.post<BatchDeleteCommentsResponse>('/comments/batch/delete', data)
}

/**
 * 批量审核评论
 */
export const batchApproveComments = (data: BatchApproveCommentsParams) => {
  return http.post<BatchApproveCommentsResponse>('/comments/batch/approve', data)
}
