import { http } from './request'
import type {
  Moment,
  CreateMomentParams,
  UpdateMomentParams,
  GetMomentsParams,
  MomentListResponse,
  BatchDeleteMomentsParams,
  BatchDeleteMomentsResponse,
  TogglePinParams
} from '@/types/moment'

// 获取说说列表
export const getMoments = (params?: GetMomentsParams) =>
  http.get<MomentListResponse>('/moments', { params })

// 获取说说详情
export const getMomentById = (id: number) =>
  http.get<Moment>(`/moments/${id}`)

// 发布说说
export const createMoment = (data: CreateMomentParams) =>
  http.post<Moment>('/moments', data)

// 更新说说
export const updateMoment = (id: number, data: UpdateMomentParams) =>
  http.put<Moment>(`/moments/${id}`, data)

// 删除说说
export const deleteMoment = (id: number) =>
  http.delete<null>(`/moments/${id}`)

// 批量删除说说
export const batchDelete = (data: BatchDeleteMomentsParams) =>
  http.post<BatchDeleteMomentsResponse>('/moments/batch-delete', data)

// 置顶/取消置顶
export const togglePin = (id: number, data: TogglePinParams) =>
  http.put<Moment>(`/moments/${id}/pin`, data)
