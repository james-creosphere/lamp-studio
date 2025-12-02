/**
 * Graph evaluation engine - executes the node graph
 * Similar to Grasshopper's solver
 */

import type { NodeGraph, GraphNode, NodeConnection } from "./nodeTypes";
import { getNodeDefinition } from "./nodeDefinitions";

/**
 * Cached output values for nodes
 */
type NodeCache = Map<string, Record<string, any>>;

/**
 * Evaluates a node graph and returns the output values
 */
export class GraphEvaluator {
  private cache: NodeCache = new Map();
  private graph: NodeGraph;

  constructor(graph: NodeGraph) {
    this.graph = graph;
  }

  /**
   * Evaluate a specific node and cache its outputs
   */
  evaluateNode(nodeId: string): void {
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const definition = getNodeDefinition(node.type);
    if (!definition) {
      console.warn(`Unknown node type: ${node.type}`);
      return;
    }

    // Build input values from connections and overrides
    const inputs: Record<string, any> = {};

    // First, set default values from node definition
    for (const inputPort of definition.inputs) {
      inputs[inputPort.id] = inputPort.defaultValue;
    }

    // Override with connected values
    const incomingConnections = this.graph.connections.filter(
      c => c.toNodeId === nodeId
    );

    for (const connection of incomingConnections) {
      // Evaluate source node first if needed
      if (!this.cache.has(connection.fromNodeId)) {
        this.evaluateNode(connection.fromNodeId);
      }
      const sourceOutputs = this.cache.get(connection.fromNodeId);
      if (sourceOutputs) {
        inputs[connection.toPortId] = sourceOutputs[connection.fromPortId];
      }
    }

    // Override with node's input values (user-set overrides)
    Object.assign(inputs, node.inputValues);

    // Create execution context
    const context: any = {
      getNodeOutput: (id: string, portId: string) => this.getNodeOutput(id, portId),
      evaluateNode: (id: string) => this.evaluateNode(id)
    };

    // Execute the node
    try {
      const outputs = definition.execute(inputs, context);
      this.cache.set(nodeId, outputs);
    } catch (error) {
      console.error(`Error evaluating node ${nodeId}:`, error);
      this.cache.set(nodeId, {});
    }
  }

  /**
   * Get output value from a node (evaluates if needed)
   */
  getNodeOutput(nodeId: string, outputId: string): any {
    // Check if node is cached
    if (!this.cache.has(nodeId)) {
      // Evaluate node first
      this.evaluateNode(nodeId);
    }

    const outputs = this.cache.get(nodeId);
    return outputs?.[outputId];
  }

  /**
   * Evaluate entire graph (topological sort)
   */
  evaluateGraph(): void {
    this.cache.clear();

    // Topological sort: evaluate nodes in dependency order
    const evaluated = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string) => {
      if (evaluated.has(nodeId)) return;
      if (visiting.has(nodeId)) {
        console.warn(`Circular dependency detected involving node ${nodeId}`);
        return;
      }

      visiting.add(nodeId);

      // Evaluate dependencies first
      const dependencies = this.graph.connections
        .filter(c => c.toNodeId === nodeId)
        .map(c => c.fromNodeId);

      for (const depId of dependencies) {
        visit(depId);
      }

      // Evaluate this node
      this.evaluateNode(nodeId);
      evaluated.add(nodeId);
      visiting.delete(nodeId);
    };

    // Visit all nodes
    for (const node of this.graph.nodes) {
      visit(node.id);
    }
  }

  /**
   * Get all geometry outputs from the graph
   */
  getGeometryOutputs(): THREE.BufferGeometry[] {
    this.evaluateGraph();
    const geometries: THREE.BufferGeometry[] = [];

    for (const node of this.graph.nodes) {
      const definition = getNodeDefinition(node.type);
      if (!definition) continue;

      // Check if node has geometry output
      const geometryOutput = definition.outputs.find(o => o.type === "geometry");
      if (geometryOutput) {
        const geometry = this.getNodeOutput(node.id, geometryOutput.id);
        if (geometry && geometry instanceof THREE.BufferGeometry) {
          geometries.push(geometry);
        }
      }
    }

    return geometries;
  }

  /**
   * Clear cache (useful when graph changes)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

