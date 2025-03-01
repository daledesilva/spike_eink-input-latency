import { useAtom } from 'jotai';
import { lineWidthAtom, showDotsAtom, smoothingTypeAtom, isHighFreqAtom } from '../atoms';

interface DrawingControlsProps {
    onClearCanvas: () => void;
}

export function DrawingControls({ onClearCanvas: clearCanvas }: DrawingControlsProps) {
    const [lineWidth, setLineWidth] = useAtom(lineWidthAtom);
    const [showDots, setShowDots] = useAtom(showDotsAtom);
    const [isHighFreq, setIsHighFreq] = useAtom(isHighFreqAtom);
    const [smoothingType, setSmoothingType] = useAtom(smoothingTypeAtom);

    return (
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
                        checked={showDots}
                        onChange={(e) => {
                            setShowDots(e.target.checked);
                        }}
                    />
                </label>
                <label>
                    Higher Freq:
                    <input
                        type="checkbox"
                        checked={isHighFreq}
                        onChange={(e) => {
                            setIsHighFreq(e.target.checked);
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

            {/* <div className="controls-row">
                <div className="toggle-group">
                    <button
                        className={`toggle-button ${smoothingType === 'linear' ? 'active' : ''}`}
                        onClick={() => {
                            setSmoothingType('linear');
                        }}
                    >
                        Linear
                    </button>
                    <button
                        className={`toggle-button ${smoothingType === 'chaikin' ? 'active' : ''}`}
                        onClick={() => {
                            setSmoothingType('chaikin');
                        }}
                    >
                        Chaikin
                    </button>
                </div>
            </div> */}
        </div>
    );
}