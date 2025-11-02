import type { Component } from 'vue'

/**
 * 时间线节点类型
 */
export type TimelineType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * 时间线节点大小
 */
export type TimelineSize = 'small' | 'medium' | 'large'

/**
 * 时间线项目数据接口
 */
export interface TimelineItem {
  id: number | string
  date: string | Date
  title: string
  description?: string
  content?: string
  type?: TimelineType
  icon?: string | Component
  tags?: string[]
  image?: string
  link?: string
  highlight?: boolean // 是否高亮显示
  metadata?: Record<string, any> // 额外元数据
}

/**
 * 时间线组件 Props
 */
export interface TimelineProps {
  items: TimelineItem[]
  reverse?: boolean // 是否倒序显示(最新在上)
  showAnimation?: boolean // 是否显示滚动动画
  lineColor?: string // 时间轴线条颜色
  dotSize?: TimelineSize // 节点大小
}

/**
 * 时间线分组数据(按年份/月份分组)
 */
export interface TimelineGroup {
  period: string // 时间段标识 (如 "2025", "2025-01")
  label: string // 显示标签 (如 "2025年", "2025年1月")
  items: TimelineItem[]
}
