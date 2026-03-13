import type React from 'react'

import type { DayPhase, TimerState } from '../App'

type TimerIconProps = {
  timer: TimerState
  isDayNight?: boolean
  dayPhase?: DayPhase
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const TimerIcon: React.FC<TimerIconProps> = ({
  timer,
  isDayNight,
  dayPhase,
}) => {
  const { label, duration, remaining, isCycleHit } = timer

  const progress = Math.max(0, Math.min(1, remaining / duration))
  const radius = 46
  const circumference = 2 * Math.PI * radius
  // 負のオフセットにして減少方向を反転（反時計回りに削れる）
  const dashOffset = -circumference * (1 - progress)

  const hue = progress * 120 // 1 => 120 (green), 0 => 0 (red)
  const strokeColor = `hsl(${hue}, 80%, 50%)`

  const iconSrcMap: Record<string, string> = {
    lotus: 'icons/lotus.png',
    wisdom: 'icons/wisdom.png',
    bounty: 'icons/bounty.png',
    power: 'icons/power.png',
  }
  const iconSrc = timer.id === 'daynight' ? undefined : iconSrcMap[timer.id]

  const progressClassName = [
    'timer-icon__progress',
    isCycleHit ? 'timer-icon__pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="timer-icon">
      <div className="timer-icon__circle-wrap">
        <svg
          className="timer-icon__svg"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            className="timer-icon__bg"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
          />
          <circle
            className={progressClassName}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {iconSrc && (
          <img
            src={iconSrc}
            alt={label}
            className="timer-icon__image"
            loading="lazy"
          />
        )}
        {timer.id === 'daynight' && dayPhase && (
          <div className="timer-icon__emoji" aria-hidden="true">
            {dayPhase === 'day' ? '☀️' : '🌙'}
          </div>
        )}
      </div>
      <div className="timer-icon__label">{label}</div>
      <div className="timer-icon__time">{formatTime(remaining)}</div>
      {isDayNight && (
        <div className="timer-icon__sub">昼夜サイクル (5:00)</div>
      )}
    </div>
  )
}

