import { useState } from "react";
import { NodeEditor } from "./components/NodeEditor";
import { NodeEditorCanvas } from "./components/NodeEditorCanvas";
import type { BufferGeometry } from "three";

type Screen = "nodeEditor" | "legacy";

export default function App() {
  const [screen, setScreen] = useState<Screen>("nodeEditor");
  const [geometries, setGeometries] = useState<BufferGeometry[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navigation Tabs */}
      <div style={{ 
        display: "flex", 
        borderBottom: "2px solid #ddd",
        backgroundColor: "#f5f5f5"
      }}>
        <button
          onClick={() => setScreen("nodeEditor")}
          style={{
            padding: "12px 24px",
            border: "none",
            backgroundColor: screen === "nodeEditor" ? "#fff" : "transparent",
            borderBottom: screen === "nodeEditor" ? "2px solid #646cff" : "2px solid transparent",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: screen === "nodeEditor" ? "600" : "400",
            color: screen === "nodeEditor" ? "#646cff" : "#666"
          }}
        >
          Node Editor
        </button>
      </div>

      {/* Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Panel - Node Editor */}
        <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
          <NodeEditor onGeometryChange={setGeometries} />
        </div>

        {/* Right Panel - 3D Preview */}
        <div style={{ width: "50%", minWidth: "400px" }}>
          <NodeEditorCanvas geometries={geometries} />
        </div>
      </div>
    </div>
  );
}
