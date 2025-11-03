import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Moment, CreateMomentParams, GetMomentsParams } from '@/types'
import { momentApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useMomentStore = defineStore('moment', () => {
  // 状态
  const moments = ref<Moment[]>([])
  const currentMoment = ref<Moment | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
  })
  const loading = ref(false)

  // 派生
  const pinnedMoments = computed(() => moments.value.filter((m) => m.is_pinned))
  const normalMoments = computed(() => moments.value.filter((m) => !m.is_pinned))

  // 获取说说列表
  const fetchMoments = async (params?: GetMomentsParams) => {
    loading.value = true
    try {
      const data = await momentApi.getMoments({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params,
      })
      moments.value = data.moments || data.items || []
      pagination.value = {
        total: data.total,
        page: data.page,
        limit: data.limit,
      }
      return data
    } catch (error) {
      console.error('获取说说列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取说说详情
  const fetchMomentById = async (id: number) => {
    loading.value = true
    try {
      const data = await momentApi.getMomentById(id)
      currentMoment.value = data
      return data
    } catch (error) {
      console.error('获取说说详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 发布说说
  const createMoment = async (payload: CreateMomentParams) => {
    try {
      const data = await momentApi.createMoment(payload)
      ElMessage.success('发布成功')
      // 重新加载列表
      await fetchMoments()
      return data
    } catch (error) {
      console.error('发布说说失败:', error)
      throw error
    }
  }

  // 更新说说
  const updateMoment = async (id: number, payload: CreateMomentParams) => {
    try {
      const data = await momentApi.updateMoment(id, payload)
      ElMessage.success('更新成功')
      // 更新列表中的项
      const index = moments.value.findIndex((m) => m.id === id)
      if (index !== -1) moments.value[index] = data
      // 更新当前项
      if (currentMoment.value?.id === id) currentMoment.value = data
      return data
    } catch (error) {
      console.error('更新说说失败:', error)
      throw error
    }
  }

  // 删除说说
  const deleteMoment = async (id: number) => {
    try {
      await momentApi.deleteMoment(id)
      // 从列表中移除
      moments.value = moments.value.filter((m) => m.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除说说失败:', error)
      throw error
    }
  }

  // 批量删除
  const batchDelete = async (ids: number[]) => {
    try {
      const data = await momentApi.batchDelete({ ids })
      ElMessage.success('删除成功')
      await fetchMoments()
      return data
    } catch (error) {
      console.error('批量删除说说失败:', error)
      throw error
    }
  }

  // 置顶/取消置顶
  const togglePin = async (id: number, isPinned: boolean) => {
    try {
      const data = await momentApi.togglePin(id, { is_pinned: isPinned })
      ElMessage.success('操作成功')
      const index = moments.value.findIndex((m) => m.id === id)
      if (index !== -1) moments.value[index] = data
      return data
    } catch (error) {
      console.error('置顶操作失败:', error)
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
    moments.value = []
    currentMoment.value = null
    pagination.value = { total: 0, page: 1, limit: 10 }
    loading.value = false
  }

  // 清空当前
  const clearCurrentMoment = () => {
    currentMoment.value = null
  }

  return {
    // 状态
    moments,
    currentMoment,
    pagination,
    loading,
    // 派生
    pinnedMoments,
    normalMoments,
    // 方法
    fetchMoments,
    fetchMomentById,
    createMoment,
    updateMoment,
    deleteMoment,
    batchDelete,
    togglePin,
    setPage,
    setLimit,
    reset,
    clearCurrentMoment,
  }
})
