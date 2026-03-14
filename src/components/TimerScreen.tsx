import React, { useRef } from 'react'

import type { DayPhase, TimerState } from '../App'
import { parseNotificationFlagFromText } from '../utils/configFile'
import {
  DEFAULT_MEMO_FILENAME,
  readFileAsDataUrl,
  readFileAsText,
  saveMemoToFile,
} from '../utils/memoFile'
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
  notificationPermission: NotificationPermission
  notificationFlagEnabled: boolean
  canUseNotifications: boolean
  showNotificationSettings: boolean
  onNotificationFlagChange: (enabled: boolean) => void
  onRequestNotificationPermission: () => void | Promise<void>
  onTestNotification: () => void
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
  notificationPermission,
  notificationFlagEnabled,
  canUseNotifications,
  showNotificationSettings,
  onNotificationFlagChange,
  onRequestNotificationPermission,
  onTestNotification,
  onReset,
  onAdjustSeconds,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const configFileInputRef = useRef<HTMLInputElement>(null)
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
    saveMemoToFile(memo, DEFAULT_MEMO_FILENAME)
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

  const handleLoadConfigClick = () => {
    configFileInputRef.current?.click()
  }

  const handleConfigFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await readFileAsText(file)
    const flag = parseNotificationFlagFromText(text)
    if (flag !== null) onNotificationFlagChange(flag)
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

        {showNotificationSettings && (
          <>
            <input
              ref={configFileInputRef}
              type="file"
              accept=".txt,text/plain"
              className="timer-screen__file-input"
              aria-hidden
              onChange={handleConfigFileSelect}
            />
            {!notificationFlagEnabled ? (
              <div className="timer-screen__notification-banner timer-screen__notification-banner--off">
                <span className="timer-screen__notification-text">
                  通知はオフです。下の「通知をオンにする」で有効にできます。設定ファイルから読み込むことも可能です。
                </span>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => onNotificationFlagChange(true)}
                >
                  通知をオンにする
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={handleLoadConfigClick}
                >
                  設定を読み込み
                </button>
              </div>
            ) : !canUseNotifications ? (
              <div className="timer-screen__notification-banner timer-screen__notification-banner--unsupported">
                <span className="timer-screen__notification-text">
                  ［file://］では通知が使えません。通知を使うには、dist をローカルサーバーで開いてください。同じフォルダで「npm run preview」を実行し、表示された URL（例: http://localhost:4173）で開くと利用できます。
                </span>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => onNotificationFlagChange(false)}
                >
                  通知をオフにする
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={handleLoadConfigClick}
                >
                  設定を読み込み
                </button>
              </div>
            ) : notificationPermission !== 'granted' ? (
              <div className="timer-screen__notification-banner">
                <span className="timer-screen__notification-text">
                  {notificationPermission === 'denied'
                    ? '通知がブロックされています。ブラウザの設定（アドレスバー左のアイコン → サイトの設定）から「通知」を許可してください。'
                    : '通知はオンです。通知を受け取るには、下の「通知を有効にする」をクリックし、ブラウザの許可ダイアログで「許可」を選んでください。'}
                </span>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => void onRequestNotificationPermission()}
                >
                  通知を有効にする
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => onNotificationFlagChange(false)}
                >
                  通知をオフにする
                </button>
              </div>
            ) : (
              <div className="timer-screen__notification-banner timer-screen__notification-banner--granted">
                <span className="timer-screen__notification-text">通知: オン</span>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={handleLoadConfigClick}
                >
                  設定を読み込み
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={onTestNotification}
                >
                  テスト通知
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => onNotificationFlagChange(false)}
                >
                  通知をオフにする
                </button>
              </div>
            )}
          </>
        )}

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

