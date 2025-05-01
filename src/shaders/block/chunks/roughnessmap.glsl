#include <roughnessmap_fragment>

if (uLinked && isWater(vUv)) {
  roughnessFactor = uWaterRoughness;
}