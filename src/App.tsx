import { useState } from 'react'
import './App.css'
import { DrawingCanvas } from './components/DrawingCanvas'

function App() {
  const [dotSize, setDotSize] = useState(4)

  return (
    <div className="app-container">
      <DrawingCanvas
        width={800}
        height={600}
        dotSize={dotSize}
        renderControls={(clearCanvas) => (
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
