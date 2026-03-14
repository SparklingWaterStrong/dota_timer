import React, { useRef } from 'react'

import type { DayPhase, TimerState } from '../App'
import { readFileAsDataUrl, readFileAsText, saveMemoToFile } from '../utils/memoFile'
import { TimerIcon } from './TimerIcon'

type TimerScreenProps = {
  timers: TimerState[]
  dayPhase: DayPhase
  totalElapsedSeconds: number
  preStartRemaining?: number
  memo: string
  onMemoChange: (value: string) => void
  iconConfig: Record<string, string>
  onIconChange: (timerId: string, dataUrl: string) => void
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
  iconConfig,
  onIconChange,
  onReset,
  onAdjustSeconds,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const iconFileInputRef = useRef<HTMLInputElement>(null)
  const iconTargetIdRef = useRef<string | null>(null)
  const safeTotal = Math.max(0, Math.floor(totalElapsedSeconds))
  const totalM = Math.floor(safeTotal / 60)
  const totalS = safeTotal % 60
  const totalLabel = `${totalM}:${totalS.toString().padStart(2, '0')}`

  const handleLoadFromFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await readFileAsText(file)
    onMemoChange(text)
    e.target.value = ''
  }

  const handleSaveToFile = () => {
    saveMemoToFile(memo)
  }

  const handleIconSettingClick = (timerId: string) => {
    iconTargetIdRef.current = timerId
    iconFileInputRef.current?.click()
  }

  const handleIconFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const timerId = iconTargetIdRef.current
    const file = e.target.files?.[0]
    e.target.value = ''
    iconTargetIdRef.current = null
    if (!timerId || !file) return
    const dataUrl = await readFileAsDataUrl(file)
    if (dataUrl) onIconChange(timerId, dataUrl)
  }

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

        <input
          ref={iconFileInputRef}
          type="file"
          accept="image/*"
          className="timer-screen__file-input"
          aria-hidden
          onChange={handleIconFileSelect}
        />
        <div className="timer-grid">
          {timers.map((timer) => (
            <div key={timer.id} className="timer-grid__item">
              <TimerIcon
                timer={timer}
                isDayNight={timer.id === 'daynight'}
                dayPhase={timer.id === 'daynight' ? dayPhase : undefined}
                customIconSrc={iconConfig[timer.id]}
              />
              <div className="timer-icon-actions">
                <button
                  type="button"
                  className="button button--ghost button--tiny"
                  onClick={() => handleIconSettingClick(timer.id)}
                >
                  アイコンを設定
                </button>
                {iconConfig[timer.id] && (
                  <button
                    type="button"
                    className="button button--ghost button--tiny"
                    onClick={() => onIconChange(timer.id, '')}
                  >
                    デフォルトに戻す
                  </button>
                )}
              </div>
            </div>
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            className="timer-screen__file-input"
            aria-hidden
            onChange={handleFileSelect}
          />
          <div className="timer-screen__memo-actions">
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={handleLoadFromFile}
            >
              ファイルから読み込み
            </button>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={handleSaveToFile}
            >
              ファイルに保存
            </button>
          </div>
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

