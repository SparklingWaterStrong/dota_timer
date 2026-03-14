/**
 * メモのテキストファイル読み書き（ローカル・file:// 両対応、エラー時は例外を出さない）
 */

const DEFAULT_MEMO_FILENAME = 'dota_timer_memo.txt'

/**
 * File をテキストとして読み込む。失敗時は空文字を返し、例外は出さない。
 */
export async function readFileAsText(file: File | null | undefined): Promise<string> {
  if (!file) return ''
  try {
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string) ?? '')
      reader.onerror = () => resolve('')
      reader.readAsText(file, 'UTF-8')
    })
  } catch {
    return ''
  }
}

/**
 * テキストを .txt ファイルとして保存（ダウンロード）。失敗時も例外を出さない。
 * ローカル（file://）でもダウンロードで保存可能。
 */
export function saveMemoToFile(
  text: string,
  filename: string = DEFAULT_MEMO_FILENAME,
): void {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    /* 保存失敗時もエラーにしない */
  }
}

/**
 * 画像ファイルを Data URL で読み込む。失敗時は空文字を返し、例外は出さない。
 */
export async function readFileAsDataUrl(
  file: File | null | undefined,
): Promise<string> {
  if (!file || !file.type.startsWith('image/')) return ''
  try {
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string) ?? '')
      reader.onerror = () => resolve('')
      reader.readAsDataURL(file)
    })
  } catch {
    return ''
  }
}

export { DEFAULT_MEMO_FILENAME }
