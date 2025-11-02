import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag, TagFormData } from '@/types'
import { tagApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useTagStore = defineStore('tag', () => {
  // 状态
  const tags = ref<Tag[]>([])
  const currentTag = ref<Tag | null>(null)
  const loading = ref(false)

  // 获取标签列表
  const fetchTags = async () => {
    loading.value = true
    try {
      const data = await tagApi.getTags()
      tags.value = data
      return data
    } catch (error) {
      console.error('获取标签列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取标签详情
  const fetchTagById = async (id: number) => {
    loading.value = true
    try {
      const data = await tagApi.getTagById(id)
      currentTag.value = data
      return data
    } catch (error) {
      console.error('获取标签详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建标签
  const createTag = async (data: TagFormData) => {
    loading.value = true
    try {
      const tag = await tagApi.createTag(data)
      tags.value.push(tag)
      ElMessage.success('创建成功')
      return tag
    } catch (error) {
      console.error('创建标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新标签
  const updateTag = async (id: number, data: TagFormData) => {
    loading.value = true
    try {
      const tag = await tagApi.updateTag(id, data)
      const index = tags.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        tags.value[index] = tag
      }
      if (currentTag.value?.id === id) {
        currentTag.value = tag
      }
      ElMessage.success('更新成功')
      return tag
    } catch (error) {
      console.error('更新标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除标签
  const deleteTag = async (id: number) => {
    loading.value = true
    try {
      await tagApi.deleteTag(id)
      tags.value = tags.value.filter((item) => item.id !== id)
      if (currentTag.value?.id === id) {
        currentTag.value = null
      }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    tags,
    currentTag,
    loading,
    // 方法
    fetchTags,
    fetchTagById,
    createTag,
    updateTag,
    deleteTag,
  }
})
