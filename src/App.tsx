import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { StartScreen } from './components/StartScreen'
import { TimerScreen } from './components/TimerScreen'

export const TIMERS = [
  { id: 'lotus', label: 'ロータス', duration: 180 },
  { id: 'wisdom', label: '知恵の祠', duration: 420 },
  { id: 'bounty', label: 'バウンティールーン', duration: 240 },
  { id: 'power', label: 'パワールーン', duration: 120 },
  { id: 'daynight', label: '昼夜', duration: 300 },
] as const

type ScreenState = 'start' | 'running'
export type DayPhase = 'day' | 'night'

export type TimerState = {
  id: string
  label: string
  duration: number
  remaining: number
  isCycleHit: boolean
}

const PRE_START_SECONDS = 40
const MEMO_STORAGE_KEY = 'dota_timer_memo'
const ICON_CONFIG_KEY = 'dota_timer_icons'

function getStoredMemo(): string {
  if (typeof window === 'undefined') return ''
  try {
    const fromLocal = localStorage.getItem(MEMO_STORAGE_KEY)
    if (fromLocal != null) return fromLocal
    const fromSession = sessionStorage.getItem(MEMO_STORAGE_KEY)
    return fromSession ?? ''
  } catch {
    return ''
  }
}

function setStoredMemo(value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MEMO_STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(MEMO_STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
}

function getStoredIconConfig(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ICON_CONFIG_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      return parsed as Record<string, string>
    return {}
  } catch {
    return {}
  }
}

function setStoredIconConfig(config: Record<string, string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ICON_CONFIG_KEY, JSON.stringify(config))
  } catch {
    /* ignore */
  }
}

function getDayPhase(effectiveElapsedSeconds: number): DayPhase {
  if (effectiveElapsedSeconds <= 0) return 'day'
  const cycle = Math.floor(effectiveElapsedSeconds / 300)
  return cycle % 2 === 0 ? 'day' : 'night'
}

function buildTimers(effectiveElapsedSeconds: number): TimerState[] {
  return TIMERS.map((base) => {
    const { duration } = base

    if (effectiveElapsedSeconds <= 0) {
      return {
        ...base,
        remaining: duration,
        isCycleHit: false,
      }
    }

    const passed = effectiveElapsedSeconds % duration
    const isCycleHit = effectiveElapsedSeconds !== 0 && passed === 0
    const remaining =
      passed === 0 && effectiveElapsedSeconds !== 0
        ? 0
        : duration - passed

    return {
      ...base,
      remaining,
      isCycleHit,
    }
  })
}

function App() {
  const [screenState, setScreenState] = useState<ScreenState>('start')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [memo, setMemo] = useState(getStoredMemo)
  const [iconConfig, setIconConfig] = useState<Record<string, string>>(
    getStoredIconConfig,
  )

  useEffect(() => {
    setStoredMemo(memo)
  }, [memo])

  useEffect(() => {
    setStoredIconConfig(iconConfig)
  }, [iconConfig])

  useEffect(() => {
    if (screenState !== 'running') return

    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      window.clearInterval(id)
    }
  }, [screenState])

  const effectiveElapsed = elapsedSeconds - PRE_START_SECONDS

  const dayPhase = useMemo(
    () => getDayPhase(effectiveElapsed),
    [effectiveElapsed],
  )

  const timers = useMemo(
    () => buildTimers(effectiveElapsed),
    [effectiveElapsed],
  )

  const totalElapsedForDisplay = Math.max(0, effectiveElapsed)

  const preStartRemaining =
    elapsedSeconds < PRE_START_SECONDS
      ? PRE_START_SECONDS - elapsedSeconds
      : 0

  const handleStart = () => {
    setElapsedSeconds(0)
    setScreenState('running')
  }

  const handleReset = () => {
    setElapsedSeconds(0)
    setScreenState('start')
  }

  const handleAdjustSeconds = (delta: number) => {
    setElapsedSeconds((prev) => Math.max(0, prev + delta))
  }

  const handleIconChange = (timerId: string, dataUrl: string) => {
    setIconConfig((prev) => {
      const next = { ...prev }
      if (dataUrl) next[timerId] = dataUrl
      else delete next[timerId]
      return next
    })
  }

  return (
    <div className={`app app--${dayPhase}`}>
      {screenState === 'start' ? (
        <StartScreen onStart={handleStart} />
      ) : (
        <TimerScreen
          timers={timers}
          dayPhase={dayPhase}
          totalElapsedSeconds={totalElapsedForDisplay}
          preStartRemaining={preStartRemaining}
          memo={memo}
          onMemoChange={setMemo}
          iconConfig={iconConfig}
          onIconChange={handleIconChange}
          onReset={handleReset}
          onAdjustSeconds={handleAdjustSeconds}
        />
      )}
    </div>
  )
}

export default App
