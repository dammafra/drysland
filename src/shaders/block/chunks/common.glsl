#include <common>

uniform float uTime;

bool isWater(vec2 uv) {
  // see `/static/blocks/Textures/colormap.*.png` (consider flipY)
  return uv.x > 0.125 && uv.x < 0.25 && uv.y > 0.75;
}
