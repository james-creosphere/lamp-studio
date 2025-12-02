/**
 * Visual Node Editor Component
 * A simplified Grasshopper-like node editor
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { NodeGraph, GraphNode, NodeConnection, NodePosition } from "../nodes/nodeTypes";
import { getNodesByCategory, getNodeDefinition } from "../nodes/nodeDefinitions";
import { GraphEvaluator } from "../nodes/graphEvaluator";
import * as THREE from "three";

type Props = {
  onGeometryChange?: (geometries: THREE.BufferGeometry[]) => void;
};

export function NodeEditor({ onGeometryChange }: Props) {
  const [graph, setGraph] = useState<NodeGraph>({
    nodes: [],
    connections: []
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string } | null>(null);
  const [connectingTo, setConnectingTo] = useState<NodePosition | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState<NodePosition>({ x: 100, y: 100 });

  const containerRef = useRef<HTMLDivElement>(null);
  const nextNodeId = useRef(1);

  // Evaluate graph and notify parent of geometry changes
  const evaluator = useMemo(() => new GraphEvaluator(graph), [graph]);

  useEffect(() => {
    evaluator.evaluateGraph();
    const geometries = evaluator.getGeometryOutputs();
    onGeometryChange?.(geometries);
  }, [graph, evaluator, onGeometryChange]);

  // Add a new node
  const addNode = useCallback((nodeType: string, position: NodePosition) => {
    const newNode: GraphNode = {
      id: `node-${nextNodeId.current++}`,
      type: nodeType,
      position,
      inputValues: {}
    };
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setShowNodePalette(false);
  }, []);

  // Handle node drag start
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
  }, [graph]);

  // Handle node drag and connection tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mousePos: NodePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (connectingFrom) {
      setConnectingTo(mousePos);
    }

    if (draggingNodeId) {
      const newPosition: NodePosition = {
        x: mousePos.x - dragOffset.x,
        y: mousePos.y - dragOffset.y
      };

      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNodeId
            ? { ...n, position: newPosition }
            : n
        )
      }));
    }
  }, [draggingNodeId, dragOffset, connectingFrom]);

  // Handle node drag end
  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
    if (connectingFrom && !connectingTo) {
      // Cancel connection if mouse up without connecting
      setConnectingFrom(null);
    }
  }, [connectingFrom, connectingTo]);

  useEffect(() => {
    if (draggingNodeId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingNodeId, handleMouseMove, handleMouseUp]);

  // Handle port click (start connection)
  const handlePortClick = useCallback((e: React.MouseEvent, nodeId: string, portId: string, isOutput: boolean) => {
    e.stopPropagation();
    if (isOutput) {
      setConnectingFrom({ nodeId, portId });
    } else {
      // Complete connection
      if (connectingFrom) {
        const newConnection: NodeConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingFrom.nodeId,
          fromPortId: connectingFrom.portId,
          toNodeId: nodeId,
          toPortId: portId
        };
        setGraph(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }));
        setConnectingFrom(null);
      }
    }
  }, [connectingFrom]);

  // Handle canvas click (cancel connection or deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setConnectingFrom(null);
      setSelectedNodeId(null);
      setShowNodePalette(false);
    }
  }, []);

  // Handle canvas right-click (show palette)
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPalettePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowNodePalette(true);
    }
  }, []);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setGraph(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(
        c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
      )
    }));
  }, []);

  const nodeCategories = useMemo(() => getNodesByCategory(), []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#1e1e1e",
        cursor: draggingNodeId ? "grabbing" : "default",
        overflow: "hidden"
      }}
      onClick={handleCanvasClick}
      onContextMenu={handleCanvasContextMenu}
    >
      {/* Grid background */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connections */}
      {graph.connections.map(conn => {
        const fromNode = graph.nodes.find(n => n.id === conn.fromNodeId);
        const toNode = graph.nodes.find(n => n.id === conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const fromX = fromNode.position.x + 200; // Node width
        const fromY = fromNode.position.y + 40; // Approximate port position
        const toX = toNode.position.x;
        const toY = toNode.position.y + 40;

        return (
          <svg
            key={conn.id}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <path
              d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY} ${toX} ${toY}`}
              stroke="#646cff"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      })}

      {/* Active connection line */}
      {connectingFrom && connectingTo && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}
        >
          <path
            d={`M ${graph.nodes.find(n => n.id === connectingFrom.nodeId)?.position.x! + 200} ${
              graph.nodes.find(n => n.id === connectingFrom.nodeId)?.position.y! + 40
            } Q ${(graph.nodes.find(n => n.id === connectingFrom.nodeId)?.position.x! + 200 + connectingTo.x) / 2} ${
              graph.nodes.find(n => n.id === connectingFrom.nodeId)?.position.y! + 40
            } ${connectingTo.x} ${connectingTo.y}`}
            stroke="#646cff"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
        </svg>
      )}

      {/* Nodes */}
      {graph.nodes.map(node => {
        const definition = getNodeDefinition(node.type);
        if (!definition) return null;

        return (
          <NodeComponent
            key={node.id}
            node={node}
            definition={definition}
            isSelected={selectedNodeId === node.id}
            onSelect={() => setSelectedNodeId(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onPortClick={(e, portId, isOutput) => handlePortClick(e, node.id, portId, isOutput)}
            onDelete={() => deleteNode(node.id)}
            onInputChange={(portId, value) => {
              setGraph(prev => ({
                ...prev,
                nodes: prev.nodes.map(n =>
                  n.id === node.id
                    ? { ...n, inputValues: { ...n.inputValues, [portId]: value } }
                    : n
                )
              }));
            }}
            connections={graph.connections}
            evaluator={evaluator}
          />
        );
      })}

      {/* Node Palette */}
      {showNodePalette && (
        <NodePalette
          position={palettePosition}
          categories={nodeCategories}
          onSelectNode={(nodeType) => addNode(nodeType, palettePosition)}
          onClose={() => setShowNodePalette(false)}
        />
      )}

      {/* Instructions */}
      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        color: "#888",
        fontSize: "12px"
      }}>
        Right-click to add nodes • Drag to move • Click ports to connect
      </div>
    </div>
  );
}

/**
 * Individual Node Component
 */
type NodeComponentProps = {
  node: GraphNode;
  definition: any;
  isSelected: boolean;
  connections: NodeConnection[];
  onSelect: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortClick: (e: React.MouseEvent, portId: string, isOutput: boolean) => void;
  onDelete: () => void;
  onInputChange: (portId: string, value: any) => void;
  evaluator: GraphEvaluator;
};

function NodeComponent({
  node,
  definition,
  isSelected,
  connections,
  onSelect,
  onMouseDown,
  onPortClick,
  onDelete,
  onInputChange,
  evaluator
}: NodeComponentProps) {
  // Check if an input port is connected
  const isInputConnected = (portId: string) => {
    return connections.some(c => c.toNodeId === node.id && c.toPortId === portId);
  };
  // Get input values: first check connections, then node overrides, then defaults
  const inputValues = useMemo(() => {
    const values: Record<string, any> = {};
    for (const input of definition.inputs) {
      // Check if this input has a connection
      // For now, use node's inputValues or default
      values[input.id] = node.inputValues[input.id] ?? input.defaultValue;
    }
    return values;
  }, [node, definition]);

  return (
    <div
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
        width: 200,
        backgroundColor: definition.color || "#2d2d2d",
        border: isSelected ? "2px solid #646cff" : "1px solid #444",
        borderRadius: "8px",
        padding: "8px",
        cursor: "grab",
        userSelect: "none"
      }}
      onClick={onSelect}
      onMouseDown={onMouseDown}
    >
      {/* Node Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: "bold", color: "#fff", fontSize: "14px" }}>
          {definition.name}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: "18px",
            padding: "0 4px"
          }}
        >
          ×
        </button>
      </div>

      {/* Input Ports */}
      {definition.inputs.map((input: any, idx: number) => (
        <div key={input.id} style={{ marginBottom: "4px", display: "flex", alignItems: "center" }}>
          <div
            onClick={(e) => onPortClick(e, input.id, false)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#888",
              marginRight: "8px",
              cursor: "pointer",
              border: "2px solid #1e1e1e"
            }}
          />
          <label style={{ color: "#ccc", fontSize: "12px", flex: 1 }}>{input.name}</label>
          {!isInputConnected(input.id) && input.type === "number" && (
            <input
              type="number"
              value={inputValues[input.id] ?? input.defaultValue ?? 0}
              onChange={(e) => onInputChange(input.id, parseFloat(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "60px",
                backgroundColor: "#1e1e1e",
                border: "1px solid #444",
                color: "#fff",
                padding: "2px 4px",
                fontSize: "11px"
              }}
            />
          )}
          {!isInputConnected(input.id) && input.type === "boolean" && (
            <input
              type="checkbox"
              checked={inputValues[input.id] ?? input.defaultValue ?? false}
              onChange={(e) => onInputChange(input.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {!isInputConnected(input.id) && input.type === "shape" && (
            <select
              value={inputValues[input.id] ?? input.defaultValue ?? "circle"}
              onChange={(e) => onInputChange(input.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #444",
                color: "#fff",
                padding: "2px 4px",
                fontSize: "11px"
              }}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="hexagon">Hexagon</option>
              <option value="star">Star</option>
              <option value="cross">Cross</option>
            </select>
          )}
        </div>
      ))}

      {/* Output Ports */}
      {definition.outputs.map((output: any, idx: number) => (
        <div key={output.id} style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <label style={{ color: "#ccc", fontSize: "12px", marginRight: "8px" }}>{output.name}</label>
          <div
            onClick={(e) => onPortClick(e, output.id, true)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#646cff",
              cursor: "pointer",
              border: "2px solid #1e1e1e"
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Node Palette - shows available nodes to add
 */
type NodePaletteProps = {
  position: NodePosition;
  categories: Record<string, any[]>;
  onSelectNode: (nodeType: string) => void;
  onClose: () => void;
};

function NodePalette({ position, categories, onSelectNode, onClose }: NodePaletteProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        padding: "8px",
        maxHeight: "400px",
        overflowY: "auto",
        zIndex: 1000,
        minWidth: "200px"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ fontWeight: "bold", color: "#fff" }}>Add Node</div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer"
          }}
        >
          ×
        </button>
      </div>
      {Object.entries(categories).map(([category, nodes]) => (
        <div key={category} style={{ marginBottom: "12px" }}>
          <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase" }}>
            {category}
          </div>
          {nodes.map((nodeDef: any) => (
            <div
              key={nodeDef.type}
              onClick={() => onSelectNode(nodeDef.type)}
              style={{
                padding: "6px 8px",
                backgroundColor: "#1e1e1e",
                marginBottom: "4px",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "12px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1e1e1e";
              }}
            >
              {nodeDef.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

