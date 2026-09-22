/**
 * Pixelora Product Studio - Procedural Vector Assets
 * Generates transparent vector SVGs and DataURLs for Podiums, Surfaces, and Lighting Overlays.
 * Zero external HTTP dependencies, infinitely scalable, instant rendering.
 */

import { PodiumType, LightingType } from '../types';

/**
 * Generates an SVG DataURL for a specific podium type.
 */
export function getPodiumSvgDataUrl(type: PodiumType): string {
  const svg = getPodiumSvgString(type);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getPodiumSvgString(type: PodiumType): string {
  switch (type) {
    case 'cylinder_pastel':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="cp_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="60%" stop-color="#F1F5F9" />
            <stop offset="100%" stop-color="#E2E8F0" />
          </linearGradient>
          <linearGradient id="cp_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#CBD5E1" />
            <stop offset="25%" stop-color="#E2E8F0" />
            <stop offset="50%" stop-color="#F8FAFC" />
            <stop offset="75%" stop-color="#E2E8F0" />
            <stop offset="100%" stop-color="#94A3B8" />
          </linearGradient>
          <radialGradient id="cp_ground_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(15, 23, 42, 0.45)" />
            <stop offset="40%" stop-color="rgba(15, 23, 42, 0.25)" />
            <stop offset="80%" stop-color="rgba(15, 23, 42, 0.05)" />
            <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
          </radialGradient>
          <filter id="cp_blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <!-- Ground Shadow -->
        <ellipse cx="400" cy="300" rx="360" ry="48" fill="url(#cp_ground_shadow)" filter="url(#cp_blur)" />
        <!-- Podium Body (3D Cylinder Wall) -->
        <path d="M 80 120 L 80 250 A 320 80 0 0 0 720 250 L 720 120 Z" fill="url(#cp_body)" />
        <!-- Podium Bottom Ring Bevel -->
        <ellipse cx="400" cy="250" rx="320" ry="78" fill="none" stroke="#64748B" stroke-opacity="0.15" stroke-width="3" />
        <!-- Podium Top Ellipse (Platform Surface) -->
        <ellipse cx="400" cy="120" rx="320" ry="78" fill="url(#cp_top)" stroke="#FFFFFF" stroke-width="2.5" />
        <!-- Rim Highlight -->
        <ellipse cx="400" cy="118" rx="318" ry="76" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" />
      </svg>`.trim();

    case 'marble_pedestal':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="mp_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="50%" stop-color="#F8FAFC" />
            <stop offset="100%" stop-color="#E2E8F0" />
          </linearGradient>
          <linearGradient id="mp_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#94A3B8" />
            <stop offset="25%" stop-color="#E2E8F0" />
            <stop offset="50%" stop-color="#FFFFFF" />
            <stop offset="75%" stop-color="#CBD5E1" />
            <stop offset="100%" stop-color="#64748B" />
          </linearGradient>
          <radialGradient id="mp_ground_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(30, 41, 59, 0.5)" />
            <stop offset="50%" stop-color="rgba(30, 41, 59, 0.18)" />
            <stop offset="100%" stop-color="rgba(30, 41, 59, 0)" />
          </radialGradient>
          <filter id="mp_blur">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <!-- Ground Shadow -->
        <ellipse cx="400" cy="305" rx="370" ry="46" fill="url(#mp_ground_shadow)" filter="url(#mp_blur)" />
        <!-- Body -->
        <path d="M 80 120 L 80 255 A 320 80 0 0 0 720 255 L 720 120 Z" fill="url(#mp_body)" />
        <!-- Marble Veins on Side -->
        <path d="M 120 135 Q 200 200 280 240 Q 320 255 350 258" fill="none" stroke="#94A3B8" stroke-width="1.8" stroke-opacity="0.35" />
        <path d="M 450 145 Q 520 180 580 248" fill="none" stroke="#64748B" stroke-width="1.5" stroke-opacity="0.25" />
        <!-- Top Surface -->
        <ellipse cx="400" cy="120" rx="320" ry="78" fill="url(#mp_top)" stroke="#E2E8F0" stroke-width="2" />
        <!-- Marble Veins on Top Surface -->
        <g stroke-linecap="round" fill="none">
          <path d="M 160 110 Q 250 85 360 115 Q 430 135 520 110 Q 600 95 660 125" stroke="#94A3B8" stroke-width="2" stroke-opacity="0.3" />
          <path d="M 280 95 Q 340 125 410 120 Q 480 115 540 130" stroke="#64748B" stroke-width="1.2" stroke-opacity="0.2" />
          <path d="M 220 130 Q 310 145 390 130" stroke="#94A3B8" stroke-width="1" stroke-opacity="0.25" />
        </g>
        <!-- Polished Bevel Highlight -->
        <ellipse cx="400" cy="118" rx="318" ry="76" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-opacity="0.85" />
      </svg>`.trim();

    case 'wood_round':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="wr_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D97706" />
            <stop offset="40%" stop-color="#F59E0B" />
            <stop offset="80%" stop-color="#D97706" />
            <stop offset="100%" stop-color="#B45309" />
          </linearGradient>
          <linearGradient id="wr_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="30%" stop-color="#92400E" />
            <stop offset="60%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#451A03" />
          </linearGradient>
          <radialGradient id="wr_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(41, 15, 3, 0.55)" />
            <stop offset="50%" stop-color="rgba(41, 15, 3, 0.2)" />
            <stop offset="100%" stop-color="rgba(41, 15, 3, 0)" />
          </radialGradient>
          <filter id="wr_blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <!-- Ground Shadow -->
        <ellipse cx="400" cy="300" rx="360" ry="46" fill="url(#wr_shadow)" filter="url(#wr_blur)" />
        <!-- Bark Body -->
        <path d="M 85 120 L 85 245 A 315 78 0 0 0 715 245 L 715 120 Z" fill="url(#wr_body)" />
        <!-- Bark Texture Lines -->
        <g stroke="#451A03" stroke-width="1.5" stroke-opacity="0.4">
          <line x1="160" y1="135" x2="160" y2="240" />
          <line x1="280" y1="145" x2="280" y2="250" />
          <line x1="420" y1="148" x2="420" y2="252" />
          <line x1="560" y1="142" x2="560" y2="246" />
          <line x1="650" y1="130" x2="650" y2="235" />
        </g>
        <!-- Wood Top Slice -->
        <ellipse cx="400" cy="120" rx="315" ry="78" fill="url(#wr_top)" stroke="#78350F" stroke-width="3" />
        <!-- Tree Growth Rings -->
        <ellipse cx="380" cy="122" rx="260" ry="64" fill="none" stroke="#92400E" stroke-width="2" stroke-opacity="0.45" />
        <ellipse cx="380" cy="122" rx="200" ry="48" fill="none" stroke="#78350F" stroke-width="2.5" stroke-opacity="0.4" />
        <ellipse cx="380" cy="122" rx="130" ry="32" fill="none" stroke="#B45309" stroke-width="2" stroke-opacity="0.5" />
        <ellipse cx="380" cy="122" rx="60" ry="15" fill="none" stroke="#78350F" stroke-width="2.2" stroke-opacity="0.5" />
      </svg>`.trim();

    case 'white_minimal':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="wm_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#F8FAFC" />
          </linearGradient>
          <linearGradient id="wm_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E2E8F0" />
            <stop offset="35%" stop-color="#F1F5F9" />
            <stop offset="70%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#CBD5E1" />
          </linearGradient>
          <radialGradient id="wm_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(15, 23, 42, 0.3)" />
            <stop offset="50%" stop-color="rgba(15, 23, 42, 0.1)" />
            <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
          </radialGradient>
          <filter id="wm_blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <!-- Soft Ground Ambient Occlusion -->
        <ellipse cx="400" cy="285" rx="350" ry="42" fill="url(#wm_shadow)" filter="url(#wm_blur)" />
        <!-- Cylinder Wall -->
        <path d="M 90 120 L 90 235 A 310 75 0 0 0 710 235 L 710 120 Z" fill="url(#wm_body)" />
        <!-- Beveled Top Edge -->
        <ellipse cx="400" cy="120" rx="310" ry="75" fill="url(#wm_top)" stroke="#E2E8F0" stroke-width="1.5" />
        <ellipse cx="400" cy="119" rx="308" ry="73.5" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
      </svg>`.trim();

    case 'dark_gold':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="dg_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#27272A" />
            <stop offset="70%" stop-color="#18181B" />
            <stop offset="100%" stop-color="#09090B" />
          </linearGradient>
          <linearGradient id="dg_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#09090B" />
            <stop offset="35%" stop-color="#27272A" />
            <stop offset="70%" stop-color="#3F3F46" />
            <stop offset="100%" stop-color="#18181B" />
          </linearGradient>
          <linearGradient id="gold_metallic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#CA8A04" />
            <stop offset="25%" stop-color="#FDE047" />
            <stop offset="50%" stop-color="#EAB308" />
            <stop offset="75%" stop-color="#FEF08A" />
            <stop offset="100%" stop-color="#A16207" />
          </linearGradient>
          <radialGradient id="dg_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0, 0, 0, 0.7)" />
            <stop offset="60%" stop-color="rgba(0, 0, 0, 0.25)" />
            <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <filter id="dg_blur">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <!-- Ground Shadow -->
        <ellipse cx="400" cy="305" rx="360" ry="46" fill="url(#dg_shadow)" filter="url(#dg_blur)" />
        <!-- Cylinder Body -->
        <path d="M 85 120 L 85 250 A 315 78 0 0 0 715 250 L 715 120 Z" fill="url(#dg_body)" />
        <!-- Gold Accent Base Ring -->
        <ellipse cx="400" cy="250" rx="315" ry="78" fill="none" stroke="url(#gold_metallic)" stroke-width="2" stroke-opacity="0.8" />
        <!-- Dark Top Surface -->
        <ellipse cx="400" cy="120" rx="315" ry="78" fill="url(#dg_top)" />
        <!-- Brilliant Gold Rim -->
        <ellipse cx="400" cy="120" rx="315" ry="78" fill="none" stroke="url(#gold_metallic)" stroke-width="3.5" />
        <!-- Top Surface Inner Inset -->
        <ellipse cx="400" cy="120" rx="295" ry="72" fill="none" stroke="url(#gold_metallic)" stroke-width="1" stroke-opacity="0.5" stroke-dasharray="4 6" />
      </svg>`.trim();

    case 'glass_disk':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <linearGradient id="gd_glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.55)" />
            <stop offset="40%" stop-color="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stop-color="rgba(45, 212, 191, 0.25)" />
          </linearGradient>
          <linearGradient id="gd_rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.8)" />
            <stop offset="50%" stop-color="rgba(45, 212, 191, 0.9)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0.6)" />
          </linearGradient>
          <radialGradient id="gd_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(15, 23, 42, 0.4)" />
            <stop offset="50%" stop-color="rgba(35, 181, 211, 0.15)" />
            <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
          </radialGradient>
          <filter id="gd_blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <!-- Ground Ambient Glow -->
        <ellipse cx="400" cy="275" rx="350" ry="44" fill="url(#gd_shadow)" filter="url(#gd_blur)" />
        <!-- Glass Thickness Wall -->
        <path d="M 85 130 L 85 190 A 315 75 0 0 0 715 190 L 715 130 Z" fill="rgba(255, 255, 255, 0.18)" stroke="rgba(255, 255, 255, 0.3)" />
        <!-- Frosted Glass Surface -->
        <ellipse cx="400" cy="130" rx="315" ry="75" fill="url(#gd_glass)" stroke="url(#gd_rim)" stroke-width="3" />
        <!-- Inner Reflection Ring -->
        <ellipse cx="400" cy="130" rx="300" ry="70" fill="none" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" />
      </svg>`.trim();

    case 'neon_ring':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <radialGradient id="nr_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(45, 212, 191, 0.55)" />
            <stop offset="40%" stop-color="rgba(108, 77, 255, 0.25)" />
            <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <linearGradient id="nr_body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="50%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <filter id="nr_neon_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Floor Glow -->
        <ellipse cx="400" cy="270" rx="360" ry="50" fill="url(#nr_glow)" filter="url(#nr_neon_glow)" />
        <!-- Stage Body -->
        <path d="M 85 130 L 85 220 A 315 75 0 0 0 715 220 L 715 130 Z" fill="url(#nr_body)" />
        <!-- Dark Top -->
        <ellipse cx="400" cy="130" rx="315" ry="75" fill="#090D16" />
        <!-- Glowing Neon Ring -->
        <ellipse cx="400" cy="130" rx="315" ry="75" fill="none" stroke="#2DD4BF" stroke-width="4" filter="url(#nr_neon_glow)" />
        <!-- Secondary Inner Neon Accent -->
        <ellipse cx="400" cy="130" rx="275" ry="65" fill="none" stroke="#6C4DFF" stroke-width="2" stroke-opacity="0.8" />
      </svg>`.trim();

    case 'water_ripple':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
        <defs>
          <radialGradient id="wrp_shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(35, 181, 211, 0.45)" />
            <stop offset="50%" stop-color="rgba(15, 23, 42, 0.15)" />
            <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <filter id="wrp_blur">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <ellipse cx="400" cy="250" rx="360" ry="55" fill="url(#wrp_shadow)" filter="url(#wrp_blur)" />
        <!-- Concentric Water Ripples -->
        <ellipse cx="400" cy="150" rx="350" ry="85" fill="rgba(35, 181, 211, 0.1)" stroke="rgba(255, 255, 255, 0.75)" stroke-width="2.5" />
        <ellipse cx="400" cy="150" rx="280" ry="68" fill="rgba(45, 212, 191, 0.15)" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" />
        <ellipse cx="400" cy="150" rx="200" ry="48" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="2.5" />
        <ellipse cx="400" cy="150" rx="110" ry="26" fill="rgba(255, 255, 255, 0.35)" stroke="#FFFFFF" stroke-width="2" />
      </svg>`.trim();

    case 'none':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>`;
  }
}

/**
 * Generates an SVG DataURL for a lighting overlay layer.
 */
export function getLightingSvgDataUrl(type: LightingType): string {
  const svg = getLightingSvgString(type);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getLightingSvgString(type: LightingType): string {
  switch (type) {
    case 'spotlight':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          <radialGradient id="light_spot" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85" />
            <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.35" />
            <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.05" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
          </radialGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#light_spot)" />
      </svg>`.trim();

    case 'soft_glow':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          <radialGradient id="light_glow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.4" />
            <stop offset="40%" stop-color="#FDE047" stop-opacity="0.15" />
            <stop offset="80%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#light_glow)" />
      </svg>`.trim();

    case 'golden_beam':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          <linearGradient id="light_beam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.5" />
            <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.18" />
            <stop offset="80%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon points="0,0 450,0 1000,750 0,900" fill="url(#light_beam)" />
      </svg>`.trim();

    case 'top_rim':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          <linearGradient id="light_rim" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6" />
            <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.15" />
            <stop offset="60%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#light_rim)" />
      </svg>`.trim();

    case 'cinematic_dual':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          <linearGradient id="cool_side" x1="0%" y1="50%" x2="60%" y2="50%">
            <stop offset="0%" stop-color="#23B5D3" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="warm_side" x1="100%" y1="50%" x2="40%" y2="50%">
            <stop offset="0%" stop-color="#F43F5E" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#cool_side)" />
        <rect width="1000" height="1000" fill="url(#warm_side)" />
      </svg>`.trim();

    case 'none':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>`;
  }
}
