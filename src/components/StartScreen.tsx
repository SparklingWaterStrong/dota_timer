import type React from 'react'

type StartScreenProps = {
  onStart: () => void
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen">
      <div className="start-screen__inner">
        <div className="start-screen__title">Dota 2 Timer</div>
        <button className="button" type="button" onClick={onStart}>
          START
        </button>
      </div>
    </div>
  )
}

