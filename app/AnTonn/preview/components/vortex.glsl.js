// Corryvreckan vortex shader — turbulent Hebridean storm version.
//
// Goal vs the first cut: less pinwheel, more "you are inside a wave being
// pulled by something larger than you." Domain-warped noise drives the
// flow (multi-octave fbm offset by another fbm), so the swirl is broken,
// stormy, with visible currents instead of clean radial spokes. The mouse
// pulls the swirl centre HARD — up to 35% of the viewport — and also
// adds a directional shear so cursor movement feels like dragging a
// finger through water. Foam crests are bright and dynamic.
//
// Uniforms:
//   uTime       — seconds since first paint
//   uResolution — canvas size in pixels
//   uMouse      — mouse position normalised 0..1, defaults to (0.5, 0.5)
//   uMouseVel   — mouse velocity vector (added by parent each frame),
//                 used to shear the flow in the direction of cursor motion
//   uIntensity  — 0..1, ramps up rotation speed + turbulence + brightness

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
  uniform vec2  uMouseVel;
  uniform float uIntensity;

  varying vec2 vUv;

  // ── 2D value noise ─────────────────────────────────────────────────
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

  // ── Multi-octave fBM ──────────────────────────────────────────────
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8); // small rotation per octave
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  // ── Domain-warped fBM — the secret sauce. Use one fbm to offset the
  //    input of another. Produces turbulent, organic flow rather than
  //    the spiral-spoke look of pure radial functions.
  float warpedFbm(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.15),
      fbm(p + vec2(5.2, 1.3) - t * 0.10)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.20),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.18)
    );
    return fbm(p + 4.0 * r);
  }

  void main() {
    // Aspect-correct UV centred on (0,0)
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // Full edge-to-edge mouse pull — vortex centre tracks the cursor
    // 1:1. The X component must be scaled by the same aspect ratio
    // uv.x is scaled by, otherwise on landscape viewports the vortex
    // only travels ~56% of the way to the horizontal edges (whereas
    // it hits the top/bottom cleanly). Matches the cursor-glow calc
    // on line 152.
    vec2 mouseOffset = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    vec2 puv = uv - mouseOffset;

    // Mouse-velocity shear: bend the flow in the direction the cursor
    // is moving. Subtle for slow movement, dramatic for fast flicks.
    float velMag = clamp(length(uMouseVel) * 8.0, 0.0, 1.0);
    vec2 shear = uMouseVel * 0.6 * velMag;

    float r = length(puv);
    float a = atan(puv.y, puv.x);

    // Base time + intensity-driven speed
    float speed = 0.10 + uIntensity * 0.35;
    float t = uTime * speed;

    // Spiral coordinates — but warped, not perfect
    float spiralAngle = a + t + r * mix(2.0, 4.5, uIntensity);

    // Domain-warped noise field drives the turbulence. Position varies
    // with polar angle + radial distance + time so the storm is always
    // moving but each fluid parcel has its own arc.
    vec2 fieldPos = vec2(
      cos(spiralAngle) * 2.5 + shear.x * 6.0,
      sin(spiralAngle) * 2.5 + shear.y * 6.0
    ) + r * 4.0;
    float storm = warpedFbm(fieldPos, t * 1.4);

    // Layer in finer turbulence on top — short, sharp foam patterns
    float foamHF = fbm(fieldPos * 4.0 + t);

    // Radial fall-off so the centre is bright and the edges fade dark
    float radialFalloff = smoothstep(0.95, 0.05, r);

    // Six broken arms — visible flow direction without being a pinwheel.
    // The arms are MODULATED by storm, so they break up rather than
    // forming clean spokes.
    float arms = 0.5 + 0.5 * cos(spiralAngle * 6.0 + storm * 4.0);
    arms = smoothstep(0.30, 0.85, arms);

    // ── Colour palette — Hebridean Atlantic ─────────────────────────
    vec3 deepSea  = vec3(0.015, 0.040, 0.085);  // near-black blue at edges
    vec3 midSea   = vec3(0.045, 0.110, 0.180);  // mid swirl
    vec3 brine    = vec3(0.180, 0.270, 0.340);  // pale teal in flow
    vec3 stormCap = vec3(0.260, 0.350, 0.380);  // wave-shoulder grey-blue
    vec3 gold     = vec3(0.620, 0.450, 0.140);  // Highland gold glint
    vec3 foamW    = vec3(0.940, 0.910, 0.820);  // off-white foam crest

    // Build colour by layering: deep → mid → brine driven by storm,
    // gold glints where storm peaks coincide with arms, foam crests
    // where high-frequency noise spikes intersect arms.
    vec3 color = deepSea;
    color = mix(color, midSea, radialFalloff * 0.95);
    color = mix(color, brine, storm * radialFalloff * 0.75);
    color = mix(color, stormCap, smoothstep(0.55, 0.85, storm) * arms * radialFalloff);
    color = mix(color, gold, smoothstep(0.62, 0.95, storm * arms) * radialFalloff * (0.4 + uIntensity * 0.5));
    color = mix(color, foamW, smoothstep(0.78, 0.96, foamHF * arms) * radialFalloff * 0.85);

    // Cursor highlight — a soft pool of light around the actual mouse
    // position itself, like a flashlight on water. Cuts through the dark.
    float cursorDist = length(uv - (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0));
    float cursorGlow = smoothstep(0.45, 0.0, cursorDist) * 0.18;
    color += brine * cursorGlow;
    color += foamW * smoothstep(0.10, 0.0, cursorDist) * 0.10;

    // Centre breath — slight inhale/exhale anchoring the eye
    float breath = 0.5 + 0.5 * sin(uTime * 0.4);
    float centerGlow = smoothstep(0.18, 0.0, r) * (0.45 + 0.3 * breath);
    color += gold * centerGlow * (0.4 + uIntensity * 0.3);

    // Vignette to push focus inward
    float vignette = smoothstep(1.25, 0.35, length(vUv - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`
