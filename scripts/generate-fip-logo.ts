import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

// SVG generator for FIP Logo (White or Blue)
function generateFipSvg(theme: 'white' | 'blue' | 'banner'): string {
  const mainColor = theme === 'white' || theme === 'banner' ? '#ffffff' : '#0038A8';
  const bgColor = theme === 'banner' ? '#163980' : 'none';

  if (theme === 'banner') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
      <rect width="800" height="450" fill="#163980" />
      <g transform="translate(150, 0)">
        ${generateLogoGroup('#ffffff')}
      </g>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    ${generateLogoGroup(mainColor)}
  </svg>`;
}

function generateLogoGroup(color: string): string {
  return `
  <g id="fip-logo">
    <!-- Tricolore Cap -->
    <g id="tricolore">
      <!-- Verde -->
      <path d="M 160,82 Q 200,72 215,69 L 215,95 Q 200,97 160,105 Z" fill="#009246" />
      <!-- Bianco -->
      <path d="M 223,68 Q 250,65 277,68 L 277,93 Q 250,92 223,94 Z" fill="#ffffff" stroke="${color === '#ffffff' ? 'none' : '#e2e8f0'}" stroke-width="0.5" />
      <!-- Rosso -->
      <path d="M 285,69 Q 300,72 340,82 L 340,105 Q 300,97 285,95 Z" fill="#ce2b37" />
    </g>

    <!-- Scudo FIP -->
    <!-- Bordo esterno e contorno dello scudo -->
    <path d="M 160,118 Q 160,104 175,102 Q 250,95 325,102 Q 340,104 340,118 L 340,240 Q 340,285 250,328 Q 160,285 160,240 Z"
          fill="none" stroke="${color}" stroke-width="16" stroke-linejoin="round" />

    <!-- Asta verticale centrale (dorsale) -->
    <path d="M 250,100 L 250,320"
          stroke="${color}" stroke-width="16" stroke-linecap="square" />

    <!-- Arco pallone sinistro -->
    <path d="M 192,106 Q 220,180 196,285"
          fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round" />

    <!-- Arco pallone destro -->
    <path d="M 308,106 Q 280,180 304,285"
          fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round" />

    <!-- Traversa orizzontale mediana -->
    <path d="M 162,205 L 338,205"
          stroke="${color}" stroke-width="15" stroke-linecap="square" />

    <!-- Scritta FIP -->
    <!-- Lettera F -->
    <path d="M 128,358 L 196,358 L 196,383 L 157,383 L 157,399 L 190,399 L 190,424 L 157,424 L 157,458 L 128,458 Z" fill="${color}" />

    <!-- Lettera I -->
    <path d="M 235,358 L 265,358 L 265,458 L 235,458 Z" fill="${color}" />

    <!-- Lettera P -->
    <path d="M 304,358 L 356,358 C 378,358 392,370 392,392 C 392,414 378,426 356,426 L 333,426 L 333,458 L 304,458 Z M 333,382 L 333,402 L 354,402 C 362,402 366,398 366,392 C 366,386 362,382 354,382 Z" fill="${color}" />
  </g>
  `;
}

async function main() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Blue logo on transparent
  const blueSvg = generateFipSvg('blue');
  fs.writeFileSync(path.join(assetsDir, 'fip-logo-blue.svg'), blueSvg);
  const resvgBlue = new Resvg(blueSvg, { fitTo: { mode: 'width', value: 500 } });
  const pngBlue = resvgBlue.render().asPng();
  fs.writeFileSync(path.join(assetsDir, 'fip-logo-blue.png'), pngBlue);

  // 2. White logo on transparent
  const whiteSvg = generateFipSvg('white');
  fs.writeFileSync(path.join(assetsDir, 'fip-logo-white.svg'), whiteSvg);
  const resvgWhite = new Resvg(whiteSvg, { fitTo: { mode: 'width', value: 500 } });
  const pngWhite = resvgWhite.render().asPng();
  fs.writeFileSync(path.join(assetsDir, 'fip-logo-white.png'), pngWhite);

  // 3. Blue banner with white logo
  const bannerSvg = generateFipSvg('banner');
  fs.writeFileSync(path.join(assetsDir, 'fip-banner.svg'), bannerSvg);
  const resvgBanner = new Resvg(bannerSvg, { fitTo: { mode: 'width', value: 800 } });
  const pngBanner = resvgBanner.render().asPng();
  fs.writeFileSync(path.join(assetsDir, 'fip-banner.png'), pngBanner);

  console.log('Loghi FIP generati con successo in public/assets!');
}

main().catch(console.error);
