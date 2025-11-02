import { ref } from 'vue'

export type StrengthResult = {
  score: number
  percent: number
  label: string
  color: string
  feedback: string[]
}

const score = ref(0)
const percent = ref(0)
const label = ref('')
const color = ref('')
const feedback = ref<string[]>([])

let zx: any | null = null
const labels = ['弱', '一般', '中', '强', '极强']
const colors = ['#e75151', '#f3b14a', '#e6d82f', '#66c27c', '#22c55e']

function hasSeq(pwd: string) {
  let up = 1,
    down = 1
  for (let i = 1; i < pwd.length; i++) {
    const a = pwd.charCodeAt(i - 1),
      b = pwd.charCodeAt(i)
    if (b - a === 1) {
      up++
      down = 1
    } else if (b - a === -1) {
      down++
      up = 1
    } else {
      up = 1
      down = 1
    }
    if (up >= 3 || down >= 3) return true
  }
  return false
}

function zhMap(eng: string): string | null {
  const s = (eng || '').toLowerCase()
  const map: [string, string][] = [
    ['repeats like', '避免重复字符（如 aaa、1111）'],
    ['avoid repeated words and characters', '避免重复的单词与字符'],
    ['add another word or two', '多加一两个不常见的词，短语越长越安全'],
    ['uncommon words are better', '尽量使用不常见的词组合'],
    ['use a few words', '使用多个不相关的词组成较长的密码短语'],
    ['avoid common phrases', '避免使用常见短语或习惯用语'],
    ['sequences', '避免连续字符（如 1234、abcd）'],
    ['keyboard patterns', '避免键盘顺序（如 qwerty、asdf）'],
    ['recent years', '避免使用最近的年份'],
    ['dates', '避免使用日期或生日'],
    ['names', '避免使用姓名、用户名或昵称'],
    ['common names', '避免使用常见姓名或词汇'],
    ['substitutions', '常见替换（如 a→@, s→$）容易被猜到'],
    ['passwords', '避免使用常见或泄露过的密码'],
  ]
  for (const [k, v] of map) if (s.includes(k)) return v
  return null
}

function chineseFeedback(pwd: string, scoreVal: number, fb?: { warning?: string; suggestions?: string[] }) {
  const tips = new Set<string>()
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)

  if (pwd.length < 12) tips.add('建议密码长度至少 12 位')
  if (!hasUpper) tips.add('加入一些大写字母')
  if (!hasLower) tips.add('加入一些小写字母')
  if (!hasDigit) tips.add('加入一些数字')
  if (!hasSymbol) tips.add('加入一些特殊符号（如 !@#）')
  if (/(.)\1{2,}/.test(pwd)) tips.add('避免重复字符（如 aaa、1111）')
  if (hasSeq(pwd) || /qwerty|asdf|zxcv|1qaz|qaz|wasd/i.test(pwd)) tips.add('避免连续或键盘顺序字符（如 1234、abcd、qwerty）')

  if (fb) {
    if (fb.warning) {
      const t = zhMap(fb.warning)
      if (t) tips.add(t)
    }
    for (const s of fb.suggestions || []) {
      const t = zhMap(s)
      if (t) tips.add(t)
    }
  }

  if (scoreVal <= 2) tips.add('避免与个人信息相关（姓名、邮箱、手机号等）')

  return Array.from(tips)
}

async function ensureZX() {
  if (zx) return
  try {
    // Try default export first, then named/commonjs
    const mod: any = await import('zxcvbn')
    zx = (mod && (mod.default || mod)) || null
  } catch {
    zx = null
  }
}

export async function assessPassword(pwd: string) {
  if (!pwd) {
    score.value = 0
    percent.value = 0
    label.value = ''
    color.value = ''
    feedback.value = []
    return
  }
  try {
    await ensureZX()
    if (zx) {
      const r = zx(pwd)
      score.value = r.score ?? 0
      const fb = r.feedback || {}
      feedback.value = chineseFeedback(pwd, score.value, fb)
    } else {
      // Fallback heuristic when zxcvbn is unavailable
      let s = 0
      if (pwd.length >= 8) s++
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++
      if (/\d/.test(pwd)) s++
      if (/[^A-Za-z0-9]/.test(pwd)) s++
      score.value = Math.min(4, Math.max(0, s - 1))
      feedback.value = chineseFeedback(pwd, score.value)
    }
  } catch {
    score.value = 0
    feedback.value = []
  }
  percent.value = [0, 25, 50, 75, 100][score.value]
  label.value = labels[score.value]
  color.value = colors[score.value]
}

export function usePasswordStrength() {
  return { score, percent, label, color, feedback, assessPassword }
}
