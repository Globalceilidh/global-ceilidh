// Corryvreckan vortex shader — full-screen procedural ocean swirl.
//
// Visual target: the world's third-largest natural whirlpool, between Jura
// and Scarba in the Inner Hebrides, mentioned in Adomnán's Life of Columba
// (c. 700 AD). Dark North Atlantic blue dominant, Highland gold glints
// across the spiral arms, foam-white highlights at the leading edges of
// the strongest currents. Continuous slow motion at idle; tracks the mouse
// subtly; compresses + accelerates when uIntensity is driven up (e.g.
// filter panel opens), slows + dims when uIntensity drops (e.g. detail
// panel opens).
//
// Uniforms:
//   uTime       — seconds since first paint (continuously increments)
//   uResolution — canvas size in pixels
//   uMouse      — mouse position normalised 0..1, defaults to (0.5, 0.5)
//   uIntensity  — 0..1, drives rotation speed + swirl compression
//
// Reduced-motion fallback (handled outside this shader): swap the shader
// material for a static gradient when prefers-reduced-motion is set.

export const VORTEX_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const VORTEX_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uIntensity;

  varying vec2 vUv;

  // Hash-based 2D noise — cheaper than a texture lookup, looks like
  // froth on water at low frequency. From Inigo Quilez's value noise.
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-correct UV centered on (0,0)
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // Mouse offset shifts the vortex centre subtly. Mouse at (0.5, 0.5)
    // = no shift. Mouse at corners = ~10% shift toward that corner.
    vec2 mouseOffset = (uMouse - 0.5) * 0.1;
    uv -= mouseOffset;

    // Polar coordinates
    float r = length(uv);
    float a = atan(uv.y, uv.x);

    // Time-driven rotation. Intensity speeds it up.
    float speed = 0.08 + uIntensity * 0.20;
    float t = uTime * speed;

    // The spiral itself — angle warped by radial-distance × spiral factor.
    // Compression factor pulls the swirl arms tighter when intensity rises.
    float compression = mix(2.5, 4.5, uIntensity);
    float spiralAngle = a + t + r * compression;

    // Six-armed spiral pattern, softened by smoothstep
    float arms = 0.5 + 0.5 * cos(spiralAngle * 6.0);
    arms = smoothstep(0.25, 0.85, arms);

    // Radial fall-off — bright near centre, fades to dark edge
    float radialFalloff = smoothstep(0.95, 0.05, r);

    // Foam noise layered on top of the spiral arms
    vec2 noiseUv = vec2(a * 2.0 + t * 0.5, r * 6.0 - t * 0.8);
    float foam = fbm(noiseUv) * arms;

    // Colour palette — Hebridean Atlantic
    vec3 deepSea = vec3(0.020, 0.045, 0.090);   // near-black blue at edges
    vec3 midSea  = vec3(0.050, 0.110, 0.180);   // mid swirl
    vec3 brine   = vec3(0.180, 0.250, 0.310);   // pale teal in flow
    vec3 gold    = vec3(0.580, 0.420, 0.130);   // Highland gold glint
    vec3 foamW   = vec3(0.880, 0.860, 0.780);   // off-white foam

    // Mix: start from deep sea, layer in mid sea via radial, brine via arms,
    // gold sparks at high-foam points, foam white at the brightest peaks.
    vec3 color = deepSea;
    color = mix(color, midSea, radialFalloff * 0.85);
    color = mix(color, brine, arms * radialFalloff * 0.55);
    color = mix(color, gold, smoothstep(0.55, 0.85, foam) * radialFalloff);
    color = mix(color, foamW, smoothstep(0.78, 0.95, foam) * radialFalloff * 0.7);

    // Centre breath — slight inhale/exhale around (0,0)
    float breath = 0.5 + 0.5 * sin(uTime * 0.3);
    float centerGlow = smoothstep(0.20, 0.0, r) * (0.4 + 0.3 * breath);
    color += gold * centerGlow * 0.4;

    // Slight vignette to push focus inward
    float vignette = smoothstep(1.2, 0.4, length(vUv - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`
