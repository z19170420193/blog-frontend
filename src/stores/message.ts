import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, CreateMessageParams, GetMessagesParams } from '@/types'
import { messageApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('message', () => {
  // 状态
  const messages = ref<Message[]>([])
  const currentMessage = ref<Message | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
  })
  const loading = ref(false)

  // 派生
  const totalMessages = computed(() => messages.value.length)

  // 获取留言列表
  const fetchMessages = async (params?: GetMessagesParams) => {
    loading.value = true
    try {
      const data = await messageApi.getMessages({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params,
      })
      messages.value = data.messages || data.items || []
      pagination.value = {
        total: data.total,
        page: data.page,
        limit: data.limit,
      }
      return data
    } catch (error) {
      console.error('获取留言列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 发表留言
  const createMessage = async (payload: CreateMessageParams) => {
    try {
      const data = await messageApi.createMessage(payload)
      ElMessage.success('留言发表成功')
      // 重新加载列表
      await fetchMessages()
      return data
    } catch (error) {
      console.error('发表留言失败:', error)
      ElMessage.error('发表留言失败')
      throw error
    }
  }

  // 更新留言
  const updateMessage = async (id: number, payload: CreateMessageParams) => {
    try {
      const data = await messageApi.updateMessage(id, payload)
      ElMessage.success('更新成功')
      // 更新列表中的项
      const index = messages.value.findIndex((m) => m.id === id)
      if (index !== -1) messages.value[index] = data
      // 更新当前项
      if (currentMessage.value?.id === id) currentMessage.value = data
      return data
    } catch (error) {
      console.error('更新留言失败:', error)
      ElMessage.error('更新留言失败')
      throw error
    }
  }

  // 删除留言
  const deleteMessage = async (id: number) => {
    try {
      await messageApi.deleteMessage(id)
      // 从列表中移除
      messages.value = messages.value.filter((m) => m.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除留言失败:', error)
      ElMessage.error('删除留言失败')
      throw error
    }
  }

  // 点赞留言
  const likeMessage = async (id: number) => {
    try {
      const data = await messageApi.likeMessage(id)
      // 更新列表中的点赞数
      const index = messages.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        messages.value[index].likes = data.likes
      }
      return data
    } catch (error) {
      console.error('点赞失败:', error)
      ElMessage.error('点赞失败')
      throw error
    }
  }

  // 设置分页
  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const setLimit = (limit: number) => {
    pagination.value.limit = limit
  }

  // 重置
  const reset = () => {
    messages.value = []
    currentMessage.value = null
    pagination.value = { total: 0, page: 1, limit: 20 }
    loading.value = false
  }

  // 清空当前
  const clearCurrentMessage = () => {
    currentMessage.value = null
  }

  return {
    // 状态
    messages,
    currentMessage,
    pagination,
    loading,
    // 派生
    totalMessages,
    // 方法
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    likeMessage,
    setPage,
    setLimit,
    reset,
    clearCurrentMessage,
  }
})
