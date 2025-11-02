import { http } from './request'
import type { Article, ArticleQueryParams, ArticleFormData } from '@/types'
import type { ArticleListResponse } from '@/types'

/**
 * 获取文章列表
 */
export const getArticles = (params?: ArticleQueryParams) => {
  return http.get<ArticleListResponse>('/articles', { params })
}

/**
 * 获取文章详情
 */
export const getArticleById = (id: number) => {
  return http.get<Article>(`/articles/${id}`)
}

/**
 * 创建文章
 */
export const createArticle = (data: ArticleFormData) => {
  return http.post<Article>('/articles', data)
}

/**
 * 更新文章
 */
export const updateArticle = (id: number, data: ArticleFormData) => {
  return http.put<Article>(`/articles/${id}`, data)
}

/**
 * 删除文章
 */
export const deleteArticle = (id: number) => {
  return http.delete(`/articles/${id}`)
}

/**
 * 批量删除文章
 */
export const batchDeleteArticles = (ids: number[]) => {
  return http.post('/articles/batch-delete', { ids })
}

/**
 * 批量更新文章状态
 */
export const batchUpdateArticleStatus = (ids: number[], status: 'draft' | 'published') => {
  return http.post('/articles/batch-update-status', { ids, status })
}

/**
 * 批量更新文章置顶状态
 */
export const batchUpdateArticleTop = (ids: number[], is_top: boolean) => {
  return http.post('/articles/batch-update-top', { ids, is_top })
}
