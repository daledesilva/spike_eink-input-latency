import { useState } from 'react'
import './App.css'
import { DrawingCanvas } from './components/DrawingCanvas'

function App() {
  const [lineWidth, setLineWidth] = useState(2)
  const [showDots, setShowDots] = useState(false)
  const [smoothingType, setSmoothingType] = useState<'linear' | 'projected' | 'chaikin'>('linear')

  console.log('redrawing');

  return (
    <div className="app-container">
      <DrawingCanvas
        width={800}
        height={600}
        dotRadius={lineWidth+2}
        lineWidth={lineWidth}
        initSmoothingType={smoothingType}
        showDots={showDots}
        renderControls={(clearCanvas, setSmoothingFn) => (
          <div className="controls">

            <div className="controls-row">
              <label>
                Line Width:
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                />
                {lineWidth}px
              </label>
              <label>
                Show Dots:
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const showDots = e.target.checked;
                    setShowDots(showDots);
                  }}
                />
              </label>
              <button 
                onClick={clearCanvas}
                className="clear-button"
              >
                Clear Canvas
              </button>
            </div>

            <div className="controls-row">
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
                <button 
                  className={`toggle-button ${smoothingType === 'chaikin' ? 'active' : ''}`}
                  onClick={() => {
                    setSmoothingType('chaikin');
                    setSmoothingFn('chaikin');
                  }}
                >
                  Chaikin
                </button>
              </div>
            </div>

          </div>
        )}
      />
    </div>
  )
}

export default App
