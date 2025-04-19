#include <opaque_fragment>

vec3 color = outgoingLight;
float alpha = diffuseColor.a;

// water
if (isWater(vUv)) {
  color = uLinked ? color : vec3(0.3, 0.15, 0.05);

  if (isTopFace(vNormal)) {
    // TODO: perlin
  }
}

// hover
color *= uHovered ? 1.5 : 1.0;

gl_FragColor = vec4(color, alpha);
