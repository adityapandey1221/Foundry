export const VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  uniform float uCompletionPct;
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uBrightColor;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // === Fresnel rim glow (brighter at edges, like a real hologram) ===
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 2.0);

    // === Scan line (horizontal bar sweeping vertically) ===
    float scanY = mod(uTime * 0.3, 2.2) - 0.1;  // sweeps over body height range
    float scanLine = smoothstep(0.02, 0.0, abs(vWorldPosition.y - scanY));
    scanLine *= 0.4;  // scan line intensity

    // === Height-based energy gradient (brighter at torso, dimmer at extremities) ===
    float heightFactor = smoothstep(0.0, 1.0, vWorldPosition.y) *
                         smoothstep(2.0, 1.0, vWorldPosition.y);
    // peaks ~1.0 at mid-body, fades at head and feet

    // === Composite base intensity ===
    float baseIntensity = mix(0.05, 0.5, uCompletionPct);   // 0% = ghost, 100% = bright
    float rimIntensity  = fresnel * mix(0.1, 0.8, uCompletionPct);
    float energyFill    = heightFactor * mix(0.0, 0.3, uCompletionPct);

    float totalIntensity = baseIntensity + rimIntensity + energyFill + scanLine;

    // === Color: mix base green toward bright green as intensity increases ===
    vec3 color = mix(uBaseColor, uBrightColor, totalIntensity);

    // === Output ===
    gl_FragColor = vec4(color, totalIntensity * 0.9);
    // Semi-transparent — the dark background bleeds through at low completion
  }
`;
