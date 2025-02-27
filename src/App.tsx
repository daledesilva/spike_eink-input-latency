import { useState } from 'react'
import './App.css'
import { DrawingCanvas } from './components/DrawingCanvas'

function App() {
  const [dotSize, setDotSize] = useState(4)
  const [smoothingType, setSmoothingType] = useState<'linear' | 'projected'>('linear')

  return (
    <div className="app-container">
      <DrawingCanvas
        width={800}
        height={600}
        dotSize={dotSize}
        initSmoothingType={smoothingType}
        renderControls={(clearCanvas, setSmoothingFn) => (
          <div className="controls">
            <div className="controls-row">
              <label>
                Dot Size:
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dotSize}
                  onChange={(e) => setDotSize(Number(e.target.value))}
                />
                {dotSize}px
              </label>
              <div className="toggle-group">
                <button 
                  className={`toggle-button ${smoothingType === 'linear' ? 'active' : ''}`}
                  onClick={() => {
                    setSmoothingType('linear');
                    setSmoothingFn('linear');
                  }}
                >
                  Linear
                </button>
                <button 
                  className={`toggle-button ${smoothingType === 'projected' ? 'active' : ''}`}
                  onClick={() => {
                    setSmoothingType('projected');
                    setSmoothingFn('projected');
                  }}
                >
                  Bezier
                </button>
              </div>
              <button 
                onClick={clearCanvas}
                className="clear-button"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default App
