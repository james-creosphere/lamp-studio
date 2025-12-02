import type { ShellParams, ShellShape } from "../types/LampParams";

type Props = {
  shell: ShellParams;
  setShell: (s: ShellParams) => void;
};

export function ShellGenerator({ shell, setShell }: Props) {
  const updateShell = (key: keyof ShellParams, val: number | ShellShape) =>
    setShell({ ...shell, [key]: val });

  return (
    <div style={{ padding: 16, width: 300 }}>
      <h2>Shell Generator</h2>
      
      <h3>Shell Shape</h3>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="radio"
            name="shape"
            value="hexagon"
            checked={shell.shape === "hexagon"}
            onChange={(e) => updateShell("shape", e.target.value as ShellShape)}
          />
          {" "}Hexagon
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="shape"
            value="cylinder"
            checked={shell.shape === "cylinder"}
            onChange={(e) => updateShell("shape", e.target.value as ShellShape)}
          />
          {" "}Cylinder
        </label>
      </div>

      <h3>Shell Parameters</h3>
      Height: <input type="range" min="100" max="300" value={shell.height} onChange={(e) => updateShell("height", +e.target.value)} />
      <span style={{ marginLeft: 8 }}>{shell.height}</span>
      <br />
      Radius: <input type="range" min="40" max="120" value={shell.radius} onChange={(e) => updateShell("radius", +e.target.value)} />
      <span style={{ marginLeft: 8 }}>{shell.radius}</span>
      <br />
      Thickness: <input type="range" min="1" max="6" step="0.1" value={shell.thickness} onChange={(e) => updateShell("thickness", +e.target.value)} />
      <span style={{ marginLeft: 8 }}>{shell.thickness.toFixed(1)}</span>
      <br />
    </div>
  );
}


