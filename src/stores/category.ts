import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category, CategoryFormData } from '@/types'
import { categoryApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useCategoryStore = defineStore('category', () => {
  // 状态
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const loading = ref(false)

  // 获取分类列表
  const fetchCategories = async () => {
    loading.value = true
    try {
      const data = await categoryApi.getCategories()
      categories.value = data
      return data
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取分类详情
  const fetchCategoryById = async (id: number) => {
    loading.value = true
    try {
      const data = await categoryApi.getCategoryById(id)
      currentCategory.value = data
      return data
    } catch (error) {
      console.error('获取分类详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建分类
  const createCategory = async (data: CategoryFormData) => {
    loading.value = true
    try {
      const category = await categoryApi.createCategory(data)
      categories.value.push(category)
      ElMessage.success('创建成功')
      return category
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新分类
  const updateCategory = async (id: number, data: CategoryFormData) => {
    loading.value = true
    try {
      const category = await categoryApi.updateCategory(id, data)
      const index = categories.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        categories.value[index] = category
      }
      if (currentCategory.value?.id === id) {
        currentCategory.value = category
      }
      ElMessage.success('更新成功')
      return category
    } catch (error) {
      console.error('更新分类失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除分类
  const deleteCategory = async (id: number) => {
    loading.value = true
    try {
      await categoryApi.deleteCategory(id)
      categories.value = categories.value.filter((item) => item.id !== id)
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除分类失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    categories,
    currentCategory,
    loading,
    // 方法
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
