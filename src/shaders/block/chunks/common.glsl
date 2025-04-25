#include <common>

uniform float uTime;
uniform float uRadius;
uniform bool uHovered;
uniform bool uLinked;

varying vec3 vWorldPosition;

bool isWater(vec2 uv) {
  // see `/static/blocks/Textures/colormap.*.png` (consider flipY)
  return uv.x > 0.125 && uv.x < 0.25 && uv.y > 0.75;
}

bool isTopFace(vec3 normal) {
  return normal.y > 0.0;
}
