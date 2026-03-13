import React from 'react'

import type { DayPhase, TimerState } from '../App'
import { TimerIcon } from './TimerIcon'

type TimerScreenProps = {
  timers: TimerState[]
  dayPhase: DayPhase
  totalElapsedSeconds: number
  preStartRemaining?: number
  memo: string
  onMemoChange: (value: string) => void
  onReset: () => void
  onAdjustSeconds: (delta: number) => void
}

export const TimerScreen: React.FC<TimerScreenProps> = ({
  timers,
  dayPhase,
  totalElapsedSeconds,
  preStartRemaining,
  memo,
  onMemoChange,
  onReset,
  onAdjustSeconds,
}) => {
  const safeTotal = Math.max(0, Math.floor(totalElapsedSeconds))
  const totalM = Math.floor(safeTotal / 60)
  const totalS = safeTotal % 60
  const totalLabel = `${totalM}:${totalS.toString().padStart(2, '0')}`

  return (
    <div className="app__inner">
      <header className="app__header">
        <div className="app__title">Dota 2 Timers</div>
        <div className="app__header-right">
          <div className="app__phase">
            {dayPhase === 'day' ? '昼 (Day)' : '夜 (Night)'}
          </div>
          <div className="app__total-time">試合時間: {totalLabel}</div>
        </div>
      </header>

      <main className="app__content">
        <div className="timer-screen__top">
          <div className="timer-screen__label">
            主要オブジェクト出現タイマー
            {typeof preStartRemaining === 'number' && preStartRemaining > 0 && (
              <>
                {' '}
                / マッチ開始まで {preStartRemaining}s
              </>
            )}
          </div>
          <button
            className="button button--ghost"
            type="button"
            onClick={onReset}
          >
            リセット
          </button>
        </div>

        <div className="timer-grid">
          {timers.map((timer) => (
            <TimerIcon
              key={timer.id}
              timer={timer}
              isDayNight={timer.id === 'daynight'}
              dayPhase={timer.id === 'daynight' ? dayPhase : undefined}
            />
          ))}
        </div>

        <div className="timer-screen__adjust">
          <button
            type="button"
            className="button button--ghost button--adjust"
            onClick={() => onAdjustSeconds(-10)}
          >
            −10秒
          </button>
          <button
            type="button"
            className="button button--ghost button--adjust"
            onClick={() => onAdjustSeconds(10)}
          >
            +10秒
          </button>
        </div>

        <div className="timer-screen__memo">
          <label className="timer-screen__memo-label">
            メモ
            <textarea
              className="timer-screen__memo-input"
              placeholder="ここにメモを書けます（例: ローテーションのタイミングなど）"
              rows={3}
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
            />
          </label>
        </div>
      </main>

      <div className="app__footer">Dota 2 用ゲーム内タイマー</div>
    </div>
  )
}

