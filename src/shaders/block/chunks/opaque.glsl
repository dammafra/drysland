#include <opaque_fragment>

vec3 color = outgoingLight;
float alpha = diffuseColor.a;

// water
if (isWater(vUv)) {
  color = uLinked ? color : vec3(0.3, 0.15, 0.05);

  float distanceToCenter = distance(vWorldPosition.xz, vec2(0.0));
  float fadeStartAt = uRadius + 10.0;
  float fadeEndAt = fadeStartAt + 5.0;
  alpha = smoothstep(fadeEndAt, fadeStartAt, distanceToCenter);

  if (isTopFace(vNormal)) {
    // TODO: perlin
  }
}

// hover
color *= uHovered ? 1.5 : 1.0;

gl_FragColor = vec4(color, alpha);
