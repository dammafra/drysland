#include <opaque_fragment>

if (isWater(vUv)) {
  // add foam
  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}