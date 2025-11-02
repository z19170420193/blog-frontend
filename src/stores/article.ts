import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Article, ArticleQueryParams, PaginationResponse } from '@/types'
import { articleApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
  })
  const loading = ref(false)

  // 获取文章列表
  const fetchArticles = async (params?: ArticleQueryParams) => {
    loading.value = true
    try {
      const data = await articleApi.getArticles(params)
      articles.value = data.articles || data.items || []
      pagination.value = {
        total: data.total,
        page: data.page,
        limit: data.limit,
      }
      return data
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取文章详情
  const fetchArticleById = async (id: number) => {
    loading.value = true
    try {
      const data = await articleApi.getArticleById(id)
      currentArticle.value = data
      return data
    } catch (error) {
      console.error('获取文章详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建文章
  const createArticle = async (article: any) => {
    loading.value = true
    try {
      const data = await articleApi.createArticle(article)
      ElMessage.success('创建成功')
      return data
    } catch (error) {
      console.error('创建文章失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新文章
  const updateArticle = async (id: number, article: any) => {
    loading.value = true
    try {
      const data = await articleApi.updateArticle(id, article)
      ElMessage.success('更新成功')
      
      // 更新当前文章
      if (currentArticle.value?.id === id) {
        currentArticle.value = data
      }
      
      // 更新列表中的文章
      const index = articles.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        articles.value[index] = data
      }
      
      return data
    } catch (error) {
      console.error('更新文章失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除文章
  const deleteArticle = async (id: number) => {
    loading.value = true
    try {
      await articleApi.deleteArticle(id)
      
      // 从列表中移除
      articles.value = articles.value.filter((item) => item.id !== id)
      
      // 如果是当前文章，清空
      if (currentArticle.value?.id === id) {
        currentArticle.value = null
      }
      
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除文章失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  const reset = () => {
    articles.value = []
    currentArticle.value = null
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
    }
    loading.value = false
  }

  return {
    // 状态
    articles,
    currentArticle,
    pagination,
    loading,
    // 方法
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    reset,
  }
})
