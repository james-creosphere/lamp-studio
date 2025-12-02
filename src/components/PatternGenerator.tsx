import type { PatternParams, PatternShape, EasingType } from "../types/PatternParams";

type Props = {
  pattern: PatternParams;
  setPattern: (p: PatternParams) => void;
};

export function PatternGenerator({ pattern, setPattern }: Props) {
  const updatePattern = (key: keyof PatternParams, val: number | PatternShape | boolean | EasingType) =>
    setPattern({ ...pattern, [key]: val });

  const toggleInvert = () => {
    setPattern({ ...pattern, inverted: !pattern.inverted });
  };

  return (
    <div style={{ padding: 16, width: 300 }}>
      <h2>Pattern Generator</h2>
      
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={toggleInvert}
          style={{
            padding: "8px 16px",
            backgroundColor: pattern.inverted ? "#646cff" : "#f0f0f0",
            color: pattern.inverted ? "#fff" : "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {pattern.inverted ? "✓ Inverted" : "Invert Colors"}
        </button>
      </div>
      
      <h3>Primary Shape</h3>
      <div style={{ marginBottom: 16 }}>
        {(["circle", "square", "triangle", "hexagon", "star", "cross"] as PatternShape[]).map((shape) => (
          <label key={shape} style={{ display: "block", marginBottom: 4 }}>
            <input
              type="radio"
              name="patternShape"
              value={shape}
              checked={pattern.shape === shape}
              onChange={(e) => updatePattern("shape", e.target.value as PatternShape)}
            />
            {" "}{shape.charAt(0).toUpperCase() + shape.slice(1)}
          </label>
        ))}
      </div>

      <h3>Pattern Parameters</h3>
      
      Steps: 
      <input 
        type="range" 
        min="1" 
        max="50" 
        value={pattern.steps} 
        onChange={(e) => updatePattern("steps", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.steps}</span>
      <br />

      Size: 
      <input 
        type="range" 
        min="5" 
        max="50" 
        step="1" 
        value={pattern.size} 
        onChange={(e) => updatePattern("size", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.size}</span>
      <br />

      <h3>Scaling</h3>
      Scale Start: 
      <input 
        type="range" 
        min="0.1" 
        max="2" 
        step="0.1" 
        value={pattern.scaleStart} 
        onChange={(e) => updatePattern("scaleStart", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.scaleStart.toFixed(1)}</span>
      <br />

      Scale Factor: 
      <input 
        type="range" 
        min="0.8" 
        max="1.2" 
        step="0.01" 
        value={pattern.scaleFactor} 
        onChange={(e) => updatePattern("scaleFactor", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.scaleFactor.toFixed(2)}</span>
      <br />

      <h3>Rotation</h3>
      Rotation Start: 
      <input 
        type="range" 
        min="0" 
        max="360" 
        step="1" 
        value={pattern.rotationStart} 
        onChange={(e) => updatePattern("rotationStart", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.rotationStart}°</span>
      <br />

      Rotation Step: 
      <input 
        type="range" 
        min="-45" 
        max="45" 
        step="1" 
        value={pattern.rotationStep} 
        onChange={(e) => updatePattern("rotationStep", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.rotationStep}°</span>
      <br />

      <h3>Drifting</h3>
      Drift X: 
      <input 
        type="range" 
        min="-10" 
        max="10" 
        step="0.5" 
        value={pattern.driftX} 
        onChange={(e) => updatePattern("driftX", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.driftX.toFixed(1)}</span>
      <br />

      Drift Y: 
      <input 
        type="range" 
        min="-10" 
        max="10" 
        step="0.5" 
        value={pattern.driftY} 
        onChange={(e) => updatePattern("driftY", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.driftY.toFixed(1)}</span>
      <br />

      <h3>Spiral</h3>
      Spiral Amount: 
      <input 
        type="range" 
        min="-30" 
        max="30" 
        step="0.5" 
        value={pattern.spiralAmount} 
        onChange={(e) => updatePattern("spiralAmount", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.spiralAmount.toFixed(1)}°</span>
      <br />

      {(pattern.shape === "star") && (
        <>
          <h3>Star Options</h3>
          Star Points: 
          <input 
            type="range" 
            min="3" 
            max="12" 
            step="1" 
            value={pattern.starPoints || 5} 
            onChange={(e) => updatePattern("starPoints", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.starPoints || 5}</span>
          <br />
        </>
      )}

      {(pattern.shape === "cross") && (
        <>
          <h3>Cross Options</h3>
          Cross Thickness: 
          <input 
            type="range" 
            min="0.1" 
            max="0.5" 
            step="0.05" 
            value={pattern.crossThickness || 0.2} 
            onChange={(e) => updatePattern("crossThickness", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{(pattern.crossThickness || 0.2).toFixed(2)}</span>
          <br />
        </>
      )}

      <h3>Fractal Body</h3>
      Height: 
      <input 
        type="range" 
        min="0" 
        max="400" 
        step="10" 
        value={pattern.height} 
        onChange={(e) => updatePattern("height", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.height}</span>
      <br />

      Twist: 
      <input 
        type="range" 
        min="0" 
        max="720" 
        step="10" 
        value={pattern.twist} 
        onChange={(e) => updatePattern("twist", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.twist}°</span>
      <br />

      Taper: 
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.05" 
        value={pattern.taper} 
        onChange={(e) => updatePattern("taper", +e.target.value)} 
      />
      <span style={{ marginLeft: 8 }}>{pattern.taper.toFixed(2)}</span>
      <br />

      <label style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={pattern.normalize}
          onChange={(e) => updatePattern("normalize", e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Normalize Vertices
      </label>

      <div style={{ marginTop: 8 }}>
        <label>
          Easing: 
          <select
            value={pattern.easing}
            onChange={(e) => updatePattern("easing", e.target.value as any)}
            style={{ marginLeft: 8, padding: "4px 8px" }}
          >
            <option value="linear">Linear</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In Out</option>
          </select>
        </label>
      </div>

      <h3>Holes</h3>
      <label style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={pattern.enableHoles}
          onChange={(e) => updatePattern("enableHoles", e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Enable Holes
      </label>

      {pattern.enableHoles && (
        <>
          Hole Frequency: 
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1" 
            value={pattern.holeFrequency} 
            onChange={(e) => updatePattern("holeFrequency", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.holeFrequency}</span>
          <br />

          Hole Scale: 
          <input 
            type="range" 
            min="0.1" 
            max="0.9" 
            step="0.05" 
            value={pattern.holeScale} 
            onChange={(e) => updatePattern("holeScale", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.holeScale.toFixed(2)}</span>
          <br />
        </>
      )}

      <h3>Spine Mode</h3>
      <label style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={pattern.useSpineMode}
          onChange={(e) => updatePattern("useSpineMode", e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Use Spine Generation (Base Points)
      </label>

      {pattern.useSpineMode && (
        <>
          Start Radius: 
          <input 
            type="range" 
            min="5" 
            max="50" 
            step="1" 
            value={pattern.startRadius} 
            onChange={(e) => updatePattern("startRadius", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.startRadius}</span>
          <br />

          End Radius: 
          <input 
            type="range" 
            min="1" 
            max="30" 
            step="1" 
            value={pattern.endRadius} 
            onChange={(e) => updatePattern("endRadius", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.endRadius}</span>
          <br />

          Segment Length: 
          <input 
            type="range" 
            min="5" 
            max="50" 
            step="1" 
            value={pattern.segmentLength} 
            onChange={(e) => updatePattern("segmentLength", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.segmentLength}</span>
          <br />

          Radius Variation: 
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={pattern.radiusVariation} 
            onChange={(e) => updatePattern("radiusVariation", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.radiusVariation.toFixed(1)}</span>
          <br />
        </>
      )}

      <h3>Shell Openings</h3>
      <label style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={pattern.removeShapes}
          onChange={(e) => updatePattern("removeShapes", e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Remove Alternating Shapes
      </label>

      {pattern.removeShapes && (
        <>
          Remove Frequency: 
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1" 
            value={pattern.removeFrequency} 
            onChange={(e) => updatePattern("removeFrequency", +e.target.value)} 
          />
          <span style={{ marginLeft: 8 }}>{pattern.removeFrequency}</span>
          <br />
          <span style={{ fontSize: "0.9em", color: "#666", marginTop: 4, display: "block" }}>
            Removes shapes to create openings for light
          </span>
        </>
      )}
    </div>
  );
}

