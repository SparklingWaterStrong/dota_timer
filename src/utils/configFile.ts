/**
 * 設定ファイル（.txt）のパース。NOTIFICATION=on/off で通知フラグを制御。
 */

const NOTIFICATION_REGEX = /NOTIFICATION\s*=\s*(on|off|1|0|true|false)/gi

/**
 * テキストから通知フラグを取得する。
 * NOTIFICATION=on / 1 / true のとき true、NOTIFICATION=on / 0 / false のとき false。
 * 複数行ある場合は最後の指定が有効。該当なしのときは null。
 */
export function parseNotificationFlagFromText(text: string): boolean | null {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.replace(/\uFEFF/g, '').trim()
  if (!trimmed) return null
  let result: boolean | null = null
  let m: RegExpExecArray | null
  NOTIFICATION_REGEX.lastIndex = 0
  while ((m = NOTIFICATION_REGEX.exec(trimmed)) !== null) {
    const v = String(m[1]).trim().toLowerCase()
    result = v === 'on' || v === '1' || v === 'true'
  }
  return result
}
