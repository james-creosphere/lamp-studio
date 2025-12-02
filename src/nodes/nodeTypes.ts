/**
 * Core types for the node-based visual programming system
 * Inspired by Grasshopper's architecture
 */

/**
 * Data types that flow through connections
 */
export type DataType = 
  | "number"
  | "boolean"
  | "string"
  | "shape"
  | "pattern"
  | "geometry"
  | "crossSection"
  | "point2D"
  | "point2D[]";

/**
 * A port (input or output) on a node
 */
export interface NodePort {
  id: string;
  name: string;
  type: DataType;
  defaultValue?: any;
}

/**
 * A connection between two ports
 */
export interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

/**
 * Position of a node in the editor
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * A node instance in the graph
 */
export interface GraphNode {
  id: string;
  type: string; // Node definition type
  position: NodePosition;
  inputValues: Record<string, any>; // Override values for inputs
}

/**
 * The complete graph structure
 */
export interface NodeGraph {
  nodes: GraphNode[];
  connections: NodeConnection[];
}

/**
 * Node definition - describes what a node type can do
 */
export interface NodeDefinition {
  type: string;
  name: string;
  category: string;
  description?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  execute: (inputs: Record<string, any>, context: NodeExecutionContext) => Record<string, any>;
  color?: string; // Color theme for the node
}

/**
 * Execution context passed to node execute functions
 */
export interface NodeExecutionContext {
  getNodeOutput: (nodeId: string, outputId: string) => any;
  evaluateNode: (nodeId: string) => void;
}

