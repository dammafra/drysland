#include <opaque_fragment>

if (isWater(vUv) && isTopFace(vObjectNormal)) {
  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}