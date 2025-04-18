#include <opaque_fragment>

vec3 color = outgoingLight;

// hover
if (uHovering) {
  color *= 1.5;
}

// water
if (isWater(vUv) && isTopFace(vObjectNormal)) {
}

gl_FragColor = vec4(color, diffuseColor.a);
