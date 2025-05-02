#include <opaque_fragment>

vec3 color = outgoingLight;
float alpha = diffuseColor.a;

// water
if (isWater(vUv)) {
  if (uLinked) {
    float waveAltitude = smoothstep(0.05, 0.1, vWorldPosition.y);
    vec3 oceanColor = color - 0.2;
    color = mix(oceanColor, color, waveAltitude);

#ifdef OPAQUE
    // do nothing
#else

    float distanceToCenter = distance(vWorldPosition.xz, vec2(0.0));
    float fadeStartAt = uRadius + 15.0;
    float fadeEndAt = fadeStartAt + 5.0;
    alpha = smoothstep(fadeEndAt, fadeStartAt, distanceToCenter);
#endif
  } else {
    color = vec3(0.3, 0.15, 0.05);
  }
}

// hover
color *= uHovered || uTutorial ? 1.5 : 1.0;

if (uInvalid) {
  color = mix(color, vec3(1.0, 0.0, 0.0), 0.8);
}

gl_FragColor = vec4(color, alpha);
