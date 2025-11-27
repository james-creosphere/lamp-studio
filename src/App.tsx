import { useState } from "react";
import type { BloomParams, ShellParams } from "./types/LampParams";
import type { PatternParams } from "./types/PatternParams";
import { ShellGenerator } from "./components/ShellGenerator";
import { PatternGenerator } from "./components/PatternGenerator";
import { ShellCanvas } from "./components/ShellCanvas";
import { PatternCanvas } from "./components/PatternCanvas";

type Screen = "shell" | "pattern";

export default function App() {
  const [screen, setScreen] = useState<Screen>("shell");
  
  const [bloom, setBloom] = useState<BloomParams>({
    steps: 20,
    scaleStart: 1,
    scaleFactor: 1.05,
    rotationStep: 12,
    driftX: 2,
    driftY: 0,
    baseRadius: 8
  });

  const [shell, setShell] = useState<ShellParams>({
    shape: "hexagon",
    height: 200,
    radius: 80,
    thickness: 3
  });

  const [pattern, setPattern] = useState<PatternParams>({
    shape: "circle",
    steps: 10,
    scaleStart: 1,
    scaleFactor: 1.1,
    rotationStart: 0,
    rotationStep: 15,
    driftX: 5,
    driftY: 5,
    spiralAmount: 0,
    size: 20,
    inverted: false,
    height: 200,
    twist: 0,
    taper: 0,
    normalize: false,
    easing: "linear",
    starPoints: 5,
    crossThickness: 0.2
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navigation Tabs */}
      <div style={{ 
        display: "flex", 
        borderBottom: "2px solid #ddd",
        backgroundColor: "#f5f5f5"
      }}>
        <button
          onClick={() => setScreen("shell")}
          style={{
            padding: "12px 24px",
            border: "none",
            backgroundColor: screen === "shell" ? "#fff" : "transparent",
            borderBottom: screen === "shell" ? "2px solid #646cff" : "2px solid transparent",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: screen === "shell" ? "600" : "400",
            color: screen === "shell" ? "#646cff" : "#666"
          }}
        >
          Shell Generator
        </button>
        <button
          onClick={() => setScreen("pattern")}
          style={{
            padding: "12px 24px",
            border: "none",
            backgroundColor: screen === "pattern" ? "#fff" : "transparent",
            borderBottom: screen === "pattern" ? "2px solid #646cff" : "2px solid transparent",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: screen === "pattern" ? "600" : "400",
            color: screen === "pattern" ? "#646cff" : "#666"
          }}
        >
          Pattern Generator
        </button>
      </div>

      {/* Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Panel - Controls */}
        <div style={{ width: 300, overflowY: "auto", borderRight: "1px solid #ddd" }}>
          {screen === "shell" && (
            <ShellGenerator shell={shell} setShell={setShell} />
          )}
          {screen === "pattern" && (
            <PatternGenerator pattern={pattern} setPattern={setPattern} />
          )}
        </div>

        {/* Right Panel - Canvas */}
        <div style={{ flex: 1 }}>
          {screen === "shell" && <ShellCanvas shell={shell} />}
          {screen === "pattern" && <PatternCanvas pattern={pattern} />}
        </div>
      </div>
    </div>
  );
}
