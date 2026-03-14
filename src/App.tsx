import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { parseNotificationFlagFromText } from './utils/configFile'
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

const PRE_START_SECONDS = 60
const MEMO_STORAGE_KEY = 'dota_timer_memo'
const ICON_CONFIG_KEY = 'dota_timer_icons'
const NOTIFICATION_FLAG_KEY = 'dota_timer_notification_flag'

function getStoredNotificationFlag(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = localStorage.getItem(NOTIFICATION_FLAG_KEY)
    if (v === 'true') return true
    if (v === 'false') return false
    return false
  } catch {
    return false
  }
}

function setStoredNotificationFlag(value: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NOTIFICATION_FLAG_KEY, String(value))
  } catch {
    /* ignore */
  }
}

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

function getInitialNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window))
    return 'denied'
  return Notification.permission
}

function App() {
  const [screenState, setScreenState] = useState<ScreenState>('start')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [memo, setMemo] = useState(getStoredMemo)
  const [iconConfig, setIconConfig] = useState<Record<string, string>>(
    getStoredIconConfig,
  )
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    getInitialNotificationPermission,
  )
  const [notificationFlagEnabled, setNotificationFlagEnabled] = useState(getStoredNotificationFlag)
  const notifiedKeysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setStoredMemo(memo)
  }, [memo])

  useEffect(() => {
    setStoredNotificationFlag(notificationFlagEnabled)
  }, [notificationFlagEnabled])

  useEffect(() => {
    const syncPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window)
        setNotificationPermission(Notification.permission)
    }
    window.addEventListener('focus', syncPermission)
    return () => window.removeEventListener('focus', syncPermission)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.protocol === 'file:') return
    const url = new URL('config.txt', window.location.href).href
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('not found'))))
      .then((text) => {
        const flag = parseNotificationFlagFromText(text)
        if (flag !== null) setNotificationFlagEnabled(flag)
      })
      .catch(() => {})
  }, [])

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

  useEffect(() => {
    if (screenState !== 'running') return
    if (!notificationFlagEnabled) return
    if (typeof window === 'undefined' || !('Notification' in window) || !window.isSecureContext) return
    if (Notification.permission !== 'granted') return

    for (const timer of timers) {
      const cycleIndex = Math.floor(Math.max(0, effectiveElapsed) / timer.duration)
      try {
        if (timer.remaining === 30) {
          const key = `${timer.id}-${cycleIndex}-30`
          if (!notifiedKeysRef.current.has(key)) {
            notifiedKeysRef.current.add(key)
            new Notification('Dota 2 Timers', {
              body: `${timer.label} まであと30秒`,
              icon: '/favicon.svg',
              requireInteraction: false,
              tag: key,
            })
          }
        }
        if (timer.isCycleHit) {
          const key = `${timer.id}-${cycleIndex}-0`
          if (!notifiedKeysRef.current.has(key)) {
            notifiedKeysRef.current.add(key)
            new Notification('Dota 2 Timers', {
              body: `${timer.label} のタイマーが 0 になりました`,
              icon: '/favicon.svg',
              requireInteraction: false,
              tag: key,
            })
          }
        }
      } catch {
        /* 通知失敗時は無視 */
      }
    }
  }, [screenState, timers, notificationPermission, notificationFlagEnabled, effectiveElapsed])

  const totalElapsedForDisplay = Math.max(0, effectiveElapsed)

  const preStartRemaining =
    elapsedSeconds < PRE_START_SECONDS
      ? PRE_START_SECONDS - elapsedSeconds
      : 0

  const handleStart = () => {
    setElapsedSeconds(0)
    setScreenState('running')
  }

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotificationPermission(result)
  }

  const handleTestNotification = () => {
    if (!notificationFlagEnabled) return
    if (typeof window === 'undefined' || !('Notification' in window) || notificationPermission !== 'granted') return
    if (!window.isSecureContext) return
    try {
      const icon = window.location.protocol === 'file:' ? undefined : '/favicon.svg'
      new Notification('Dota 2 Timers', {
        body: 'テスト通知です。通知は正常に動作しています。',
        icon,
        tag: 'test',
      })
    } catch {
      /* 無視 */
    }
  }

  const canUseNotifications =
    typeof window !== 'undefined' && 'Notification' in window && window.isSecureContext

  const showNotificationSettings =
    typeof window !== 'undefined' && window.location.protocol !== 'file:'

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
          notificationPermission={notificationPermission}
          notificationFlagEnabled={notificationFlagEnabled}
          canUseNotifications={canUseNotifications}
          showNotificationSettings={showNotificationSettings}
          onNotificationFlagChange={setNotificationFlagEnabled}
          onRequestNotificationPermission={handleRequestNotificationPermission}
          onTestNotification={handleTestNotification}
          onReset={handleReset}
          onAdjustSeconds={handleAdjustSeconds}
        />
      )}
    </div>
  )
}

export default App
