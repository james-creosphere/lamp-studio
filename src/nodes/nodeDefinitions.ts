/**
 * Node definitions - the "library" of available nodes
 * Each node definition describes inputs, outputs, and execution logic
 */

import * as THREE from "three";
import type { NodeDefinition, NodeExecutionContext } from "./nodeTypes";
import { generatePattern2D } from "../geometry/pattern2D";
import { patternInstancesToInterpolatableShapes } from "../utils/patternToInterpolatable";
import { generateCrossSections } from "../geometry/crossSections/generateCrossSections";
import { loftCrossSections3D } from "../geometry/loft3D";
import { addAlternatingHoles } from "../geometry/crossSections/addAlternatingHoles";
import { getEasingFunction } from "../utils/easing";
import { generateSpinePoints, createSpineGeometry } from "../geometry/spineGenerator";
import type { PatternShape } from "../types/PatternParams";

/**
 * Input Nodes - Sources of data
 */

export const NumberNode: NodeDefinition = {
  type: "number",
  name: "Number",
  category: "Input",
  description: "A numeric value",
  inputs: [
    { id: "value", name: "Value", type: "number", defaultValue: 0 }
  ],
  outputs: [
    { id: "value", name: "Value", type: "number", defaultValue: 0 }
  ],
  execute: (inputs, context) => {
    return { value: inputs.value ?? 0 };
  },
  color: "#4CAF50"
};

export const BooleanNode: NodeDefinition = {
  type: "boolean",
  name: "Boolean",
  category: "Input",
  description: "True or false value",
  inputs: [
    { id: "value", name: "Value", type: "boolean", defaultValue: false }
  ],
  outputs: [
    { id: "value", name: "Value", type: "boolean", defaultValue: false }
  ],
  execute: (inputs, context) => {
    return { value: inputs.value ?? false };
  },
  color: "#4CAF50"
};

export const ShapeSelectorNode: NodeDefinition = {
  type: "shapeSelector",
  name: "Shape",
  category: "Input",
  description: "Select a 2D shape type",
  inputs: [
    { id: "shape", name: "Shape", type: "shape", defaultValue: "circle" }
  ],
  outputs: [
    { id: "shape", name: "Shape", type: "shape", defaultValue: "circle" }
  ],
  execute: (inputs, context) => {
    return { shape: inputs.shape ?? "circle" };
  },
  color: "#4CAF50"
};

/**
 * Pattern Generation Nodes
 */

export const Pattern2DNode: NodeDefinition = {
  type: "pattern2D",
  name: "Pattern 2D",
  category: "Pattern",
  description: "Generate a 2D pattern of shapes",
  inputs: [
    { id: "shape", name: "Shape", type: "shape" },
    { id: "steps", name: "Steps", type: "number", defaultValue: 10 },
    { id: "size", name: "Size", type: "number", defaultValue: 20 },
    { id: "scaleStart", name: "Scale Start", type: "number", defaultValue: 1 },
    { id: "scaleFactor", name: "Scale Factor", type: "number", defaultValue: 1.1 },
    { id: "rotationStart", name: "Rotation Start", type: "number", defaultValue: 0 },
    { id: "rotationStep", name: "Rotation Step", type: "number", defaultValue: 15 },
    { id: "driftX", name: "Drift X", type: "number", defaultValue: 5 },
    { id: "driftY", name: "Drift Y", type: "number", defaultValue: 5 },
    { id: "spiralAmount", name: "Spiral", type: "number", defaultValue: 0 },
    { id: "starPoints", name: "Star Points", type: "number", defaultValue: 5 },
    { id: "crossThickness", name: "Cross Thickness", type: "number", defaultValue: 0.2 }
  ],
  outputs: [
    { id: "pattern", name: "Pattern", type: "pattern" }
  ],
  execute: (inputs, context) => {
    const pattern = generatePattern2D({
      shape: inputs.shape as PatternShape || "circle",
      steps: inputs.steps || 10,
      size: inputs.size || 20,
      scaleStart: inputs.scaleStart ?? 1,
      scaleFactor: inputs.scaleFactor ?? 1.1,
      rotationStart: inputs.rotationStart ?? 0,
      rotationStep: inputs.rotationStep ?? 15,
      driftX: inputs.driftX ?? 5,
      driftY: inputs.driftY ?? 5,
      spiralAmount: inputs.spiralAmount ?? 0,
      inverted: false,
      height: 200,
      twist: 0,
      taper: 0,
      normalize: false,
      easing: "linear",
      enableHoles: false,
      holeFrequency: 2,
      holeScale: 0.35,
      removeShapes: false,
      removeFrequency: 2,
      useSpineMode: false,
      startRadius: 15,
      endRadius: 5,
      segmentLength: 20,
      radiusVariation: 0,
      starPoints: inputs.starPoints ?? 5,
      crossThickness: inputs.crossThickness ?? 0.2
    });
    return { pattern };
  },
  color: "#2196F3"
};

export const SpineNode: NodeDefinition = {
  type: "spine",
  name: "Spine",
  category: "Pattern",
  description: "Generate a spine-based geometry",
  inputs: [
    { id: "steps", name: "Steps", type: "number", defaultValue: 20 },
    { id: "startRadius", name: "Start Radius", type: "number", defaultValue: 15 },
    { id: "endRadius", name: "End Radius", type: "number", defaultValue: 5 },
    { id: "height", name: "Height", type: "number", defaultValue: 200 },
    { id: "spiralAmount", name: "Spiral", type: "number", defaultValue: 0 },
    { id: "driftX", name: "Drift X", type: "number", defaultValue: 0 },
    { id: "driftY", name: "Drift Y", type: "number", defaultValue: 0 },
    { id: "segmentLength", name: "Segment Length", type: "number", defaultValue: 20 },
    { id: "radiusVariation", name: "Radius Variation", type: "number", defaultValue: 0 },
    { id: "removeFrequency", name: "Remove Frequency", type: "number", defaultValue: 0 }
  ],
  outputs: [
    { id: "geometry", name: "Geometry", type: "geometry" }
  ],
  execute: (inputs, context) => {
    const spinePoints = generateSpinePoints({
      steps: inputs.steps || 20,
      startRadius: inputs.startRadius ?? 15,
      endRadius: inputs.endRadius ?? 5,
      totalHeight: inputs.height ?? 200,
      spiralAmount: inputs.spiralAmount ?? 0,
      driftX: inputs.driftX ?? 0,
      driftY: inputs.driftY ?? 0,
      segmentLength: inputs.segmentLength ?? 20,
      radiusVariation: inputs.radiusVariation ?? 0,
      removeFrequency: inputs.removeFrequency ?? 0
    });
    const geometry = createSpineGeometry(spinePoints);
    return { geometry };
  },
  color: "#2196F3"
};

/**
 * Transform Nodes
 */

export const PatternToShapesNode: NodeDefinition = {
  type: "patternToShapes",
  name: "Pattern to Shapes",
  category: "Transform",
  description: "Convert pattern instances to interpolatable shapes",
  inputs: [
    { id: "pattern", name: "Pattern", type: "pattern" },
    { id: "removeShapes", name: "Remove Shapes", type: "boolean", defaultValue: false },
    { id: "removeFrequency", name: "Remove Frequency", type: "number", defaultValue: 2 },
    { id: "inverted", name: "Inverted", type: "boolean", defaultValue: false }
  ],
  outputs: [
    { id: "shapes", name: "Shapes", type: "point2D[]" }
  ],
  execute: (inputs, context) => {
    if (!inputs.pattern) return { shapes: [] };
    const shapes = patternInstancesToInterpolatableShapes(
      inputs.pattern,
      inputs.removeShapes ?? false,
      inputs.removeFrequency ?? 2,
      inputs.inverted ?? false
    );
    return { shapes };
  },
  color: "#FF9800"
};

export const CrossSectionsNode: NodeDefinition = {
  type: "crossSections",
  name: "Cross Sections",
  category: "Transform",
  description: "Generate cross sections from shapes",
  inputs: [
    { id: "shapes", name: "Shapes", type: "point2D[]" },
    { id: "normalize", name: "Normalize", type: "boolean", defaultValue: false },
    { id: "easing", name: "Easing", type: "string", defaultValue: "linear" }
  ],
  outputs: [
    { id: "crossSections", name: "Cross Sections", type: "crossSection" }
  ],
  execute: (inputs, context) => {
    if (!inputs.shapes || !Array.isArray(inputs.shapes)) return { crossSections: [] };
    const easingFn = inputs.easing ? getEasingFunction(inputs.easing as any) : undefined;
    const crossSections = generateCrossSections({
      baseShapes: inputs.shapes.filter((s: any) => s !== null),
      easing: easingFn,
      normalizeVertexCount: inputs.normalize ?? false,
      preserveOrder: true
    });
    return { crossSections };
  },
  color: "#FF9800"
};

export const AddHolesNode: NodeDefinition = {
  type: "addHoles",
  name: "Add Holes",
  category: "Transform",
  description: "Add holes to cross sections",
  inputs: [
    { id: "crossSections", name: "Cross Sections", type: "crossSection" },
    { id: "frequency", name: "Frequency", type: "number", defaultValue: 2 },
    { id: "scale", name: "Scale", type: "number", defaultValue: 0.35 }
  ],
  outputs: [
    { id: "crossSections", name: "Cross Sections", type: "crossSection" }
  ],
  execute: (inputs, context) => {
    if (!inputs.crossSections || !Array.isArray(inputs.crossSections)) {
      return { crossSections: inputs.crossSections || [] };
    }
    const holePattern = (index: number) => index % (inputs.frequency ?? 2) === 0;
    const holeShapeGenerator = (outer: any[], t: number) => {
      if (outer.length === 0) return [];
      
      // Calculate centroid
      let sumX = 0;
      let sumY = 0;
      for (const point of outer) {
        sumX += point.x;
        sumY += point.y;
      }
      const centroid = {
        x: sumX / outer.length,
        y: sumY / outer.length
      };

      // Use scale factor (clamp to 0.2-0.6 range)
      const scaleFactor = Math.max(0.2, Math.min(0.6, inputs.scale ?? 0.35));

      // Create scaled-down polygon centered at centroid
      return outer.map((p: any) => ({
        x: centroid.x + (p.x - centroid.x) * scaleFactor,
        y: centroid.y + (p.y - centroid.y) * scaleFactor
      }));
    };
    const result = addAlternatingHoles({
      sections: inputs.crossSections,
      holePattern,
      holeShapeGenerator
    });
    return { crossSections: result };
  },
  color: "#FF9800"
};

/**
 * Geometry Nodes
 */

export const LoftNode: NodeDefinition = {
  type: "loft",
  name: "Loft",
  category: "Geometry",
  description: "Loft cross sections into 3D geometry",
  inputs: [
    { id: "crossSections", name: "Cross Sections", type: "crossSection" },
    { id: "height", name: "Height", type: "number", defaultValue: 200 },
    { id: "twist", name: "Twist", type: "number", defaultValue: 0 },
    { id: "taper", name: "Taper", type: "number", defaultValue: 0 }
  ],
  outputs: [
    { id: "geometry", name: "Geometry", type: "geometry" }
  ],
  execute: (inputs, context) => {
    if (!inputs.crossSections || !Array.isArray(inputs.crossSections)) {
      return { geometry: new THREE.BufferGeometry() };
    }
    const geometry = loftCrossSections3D({
      sections: inputs.crossSections,
      totalHeight: inputs.height ?? 200,
      twistAmount: inputs.twist ?? 0,
      taperAmount: inputs.taper ?? 0,
      smoothNormals: true
    });
    return { geometry };
  },
  color: "#9C27B0"
};

/**
 * Registry of all node definitions
 */
export const nodeDefinitions: Record<string, NodeDefinition> = {
  number: NumberNode,
  boolean: BooleanNode,
  shapeSelector: ShapeSelectorNode,
  pattern2D: Pattern2DNode,
  spine: SpineNode,
  patternToShapes: PatternToShapesNode,
  crossSections: CrossSectionsNode,
  addHoles: AddHolesNode,
  loft: LoftNode
};

/**
 * Get node definition by type
 */
export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return nodeDefinitions[type];
}

/**
 * Get all node definitions grouped by category
 */
export function getNodesByCategory(): Record<string, NodeDefinition[]> {
  const categories: Record<string, NodeDefinition[]> = {};
  for (const def of Object.values(nodeDefinitions)) {
    if (!categories[def.category]) {
      categories[def.category] = [];
    }
    categories[def.category].push(def);
  }
  return categories;
}

