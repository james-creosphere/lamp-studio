import { useMemo } from "react";
import { generatePattern2D } from "../geometry/pattern2D";
import { patternInstancesToInterpolatableShapes } from "../utils/patternToInterpolatable";
import { getEasingFunction } from "../utils/easing";
import { FractalBodyCanvas } from "./FractalBodyCanvas";
import type { PatternParams } from "../types/PatternParams";

type Props = {
  pattern: PatternParams;
};

export function PatternCanvas({ pattern }: Props) {
  const patternInstances = useMemo(() => generatePattern2D(pattern), [pattern]);

  // Convert pattern instances to InterpolatableShape[] (only black shapes)
  const polygons2D = useMemo(() => {
    return patternInstancesToInterpolatableShapes(patternInstances);
  }, [patternInstances]);

  // Get easing function
  const easingFunction = useMemo(() => {
    return getEasingFunction(pattern.easing);
  }, [pattern.easing]);

  return (
    <FractalBodyCanvas
      polygons2D={polygons2D}
      height={pattern.height}
      twist={pattern.twist}
      taper={pattern.taper}
      normalize={pattern.normalize}
      easing={easingFunction}
    />
  );
}

