import * as THREE from '../vendor/three/three.module.min.js';
import { books } from './books.js';

// --- MAZE GRID & CONFIGURATION ---
const CELL_SIZE = 4.0;
const WALL_HEIGHT = 3.2;
const CAMERA_HEIGHT = 1.65;

// 13x13 Grid: 1 = Wall, 0 = Corridor
const MAZE_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const GRID_ROWS = MAZE_GRID.length;
const GRID_COLS = MAZE_GRID[0].length;

// Convert grid (gx, gz) to 3D world (x, z)
function gridToWorld(gx, gz) {
  return {
    x: (gx - (GRID_COLS - 1) / 2) * CELL_SIZE,
    z: (gz - (GRID_ROWS - 1) / 2) * CELL_SIZE
  };
}

// Convert 3D world (x, z) to nearest grid (gx, gz)
function worldToGrid(x, z) {
  return {
    gx: Math.round(x / CELL_SIZE + (GRID_COLS - 1) / 2),
    gz: Math.round(z / CELL_SIZE + (GRID_ROWS - 1) / 2)
  };
}

// 6 Project Poster Mounts on specific wall faces
// gx, gz: wall cell coordinates. face: 'N', 'S', 'E', 'W' (facing toward corridor)
const POSTER_MOUNTS = [
  { gx: 2, gz: 2, face: 'E', bookIndex: 0 }, // Gemini Spark in Chrome (Launch)
  { gx: 5, gz: 6, face: 'N', bookIndex: 1 }, // Gemini in Chrome Agentic Capabilities (Talk)
  { gx: 7, gz: 4, face: 'S', bookIndex: 2 }, // How to Build GenAI Products (Field notes)
  { gx: 2, gz: 8, face: 'E', bookIndex: 3 }, // Evaluating GenAI Products (Field notes)
  { gx: 7, gz: 8, face: 'N', bookIndex: 4 }, // Certainly Uncertain (Podcast)
  { gx: 10, gz: 8, face: 'W', bookIndex: 5 } // LinkedIn (About me)
];

// Office Door Mounts on various wall cells for authentic workplace feel
const DOOR_MOUNTS = [
  { gx: 2, gz: 4, face: 'E', label: 'GENAI LAB 01' },
  { gx: 4, gz: 2, face: 'W', label: 'STRATEGY ROOM' },
  { gx: 8, gz: 2, face: 'E', label: 'AGENTIC RESEARCH' },
  { gx: 8, gz: 4, face: 'W', label: 'CONF 3B' },
  { gx: 4, gz: 10, face: 'E', label: 'QUIET FOCUS' },
  { gx: 8, gz: 10, face: 'W', label: 'STUDIO ARCHIVE' }
];

// --- PROCEDURAL OFFICE TEXTURES ---

// 1. Office Carpet (Modular loop-pile tiles with subtle heather flecks)
function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#424844';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle tile grid (256x256 tiles)
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const x = tx * 256;
      const y = ty * 256;
      const shade = (tx + ty) % 2 === 0 ? 8 : -8;
      ctx.fillStyle = `rgba(255,255,255,${shade > 0 ? 0.04 : 0})`;
      ctx.fillRect(x, y, 256, 256);
    }
  }

  // Carpet loop noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Tile seam lines
  ctx.strokeStyle = 'rgba(18, 22, 20, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(13, 13);
  return texture;
}

// 2. Office Acoustic Drop Ceiling with Recessed Fluorescent Troffers
function createCeilingTextures() {
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = diffCanvas.height = 512;
  const dCtx = diffCanvas.getContext('2d');

  const emCanvas = document.createElement('canvas');
  emCanvas.width = emCanvas.height = 512;
  const eCtx = emCanvas.getContext('2d');

  // Base off-white acoustic tile
  dCtx.fillStyle = '#e8e5db';
  dCtx.fillRect(0, 0, 512, 512);
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, 512, 512);

  // Acoustic tile flecks
  dCtx.fillStyle = 'rgba(70, 70, 60, 0.12)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const rw = 1 + Math.random() * 3;
    dCtx.fillRect(rx, ry, rw, 1.5);
  }

  // T-bar metal grid (256x256)
  dCtx.strokeStyle = '#c4c1b6';
  dCtx.lineWidth = 6;
  dCtx.strokeRect(0, 0, 512, 512);
  dCtx.beginPath();
  dCtx.moveTo(256, 0); dCtx.lineTo(256, 512);
  dCtx.moveTo(0, 256); dCtx.lineTo(512, 256);
  dCtx.stroke();

  // Recessed fluorescent lighting panel in top-left tile
  const fx = 32, fy = 48, fw = 192, fh = 160;
  // Frame
  dCtx.fillStyle = '#b3b0a4';
  dCtx.fillRect(fx - 4, fy - 4, fw + 8, fh + 8);
  // Diffuser surface
  dCtx.fillStyle = '#ffffff';
  dCtx.fillRect(fx, fy, fw, fh);
  // Troffer louvre grid lines
  dCtx.strokeStyle = 'rgba(180, 180, 170, 0.35)';
  dCtx.lineWidth = 2;
  for (let lx = fx + 24; lx < fx + fw; lx += 24) {
    dCtx.beginPath(); dCtx.moveTo(lx, fy); dCtx.lineTo(lx, fy + fh); dCtx.stroke();
  }

  // Emissive map for fluorescent panel
  eCtx.fillStyle = '#fffced';
  eCtx.fillRect(fx, fy, fw, fh);

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.wrapS = diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(13, 13);

  const emTex = new THREE.CanvasTexture(emCanvas);
  emTex.wrapS = emTex.wrapT = THREE.RepeatWrapping;
  emTex.repeat.set(13, 13);

  return { diffuse: diffTex, emissive: emTex };
}

// 3. Office Drywall with Baseboard & Crown Trim
function createWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Main drywall painted in warm office neutral
  ctx.fillStyle = '#f0ede6';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle wall plaster texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Bottom baseboard (skirting board) - 56px tall
  const baseboardHeight = 56;
  ctx.fillStyle = '#222724';
  ctx.fillRect(0, 512 - baseboardHeight, 512, baseboardHeight);

  // Baseboard top bevel highlight
  ctx.fillStyle = '#4a524e';
  ctx.fillRect(0, 512 - baseboardHeight, 512, 4);

  // Top ceiling shadow
  const grad = ctx.createLinearGradient(0, 0, 0, 32);
  grad.addColorStop(0, 'rgba(0,0,0,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 32);

  // Subtle vertical panel lines (every 256px)
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512 - baseboardHeight);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// 4. Office Doors Texture
function createDoorTexture(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Surrounding drywall
  ctx.fillStyle = '#f0ede6';
  ctx.fillRect(0, 0, 512, 768);

  // Door frame (metal/wood)
  ctx.fillStyle = '#282f2c';
  ctx.fillRect(96, 64, 320, 704);

  // Door leaf (rich natural oak)
  ctx.fillStyle = '#a67d53';
  ctx.fillRect(106, 74, 300, 694);

  // Subtle wood grain lines
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let y = 80; y < 760; y += 8) {
    ctx.fillRect(106, y + (Math.sin(y) * 2), 300, 2);
  }

  // Frosted glass vision panel in upper half
  ctx.fillStyle = '#282f2c';
  ctx.fillRect(146, 120, 220, 220);
  const glassGrad = ctx.createLinearGradient(152, 126, 360, 334);
  glassGrad.addColorStop(0, '#e5ebe8');
  glassGrad.addColorStop(0.5, '#c7d1cc');
  glassGrad.addColorStop(1, '#dfe6e2');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(152, 126, 208, 208);

  // Stainless steel door lever handle
  ctx.fillStyle = '#d6dbd8';
  ctx.fillRect(120, 420, 40, 10);
  ctx.beginPath();
  ctx.arc(125, 425, 12, 0, Math.PI * 2);
  ctx.fill();

  // Acrylic room placard
  ctx.fillStyle = 'rgba(18, 24, 21, 0.88)';
  ctx.fillRect(160, 370, 192, 34);
  ctx.strokeStyle = '#c5cbbf';
  ctx.lineWidth = 1;
  ctx.strokeRect(160, 370, 192, 34);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, 256, 392);

  // Baseboard bottom
  ctx.fillStyle = '#222724';
  ctx.fillRect(0, 768 - 56, 512, 56);

  return new THREE.CanvasTexture(canvas);
}

// 5. Giant Project Poster Texture Generator
function createPosterTexture(book, index, onLoadedCallback) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  function render(imageObj) {
    // Elegant gallery background
    ctx.fillStyle = '#161d19';
    ctx.fillRect(0, 0, 768, 1024);

    // Inner mat board
    ctx.fillStyle = '#fcfbf7';
    ctx.fillRect(36, 36, 696, 952);

    // Category banner pill
    ctx.fillStyle = book.color || '#365348';
    ctx.fillRect(72, 70, 200, 34);
    ctx.fillStyle = book.ink || '#ffffff';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(book.category.toUpperCase(), 172, 92);

    // Index number
    ctx.fillStyle = '#7a8178';
    ctx.font = '600 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`0${index + 1} / 06`, 696, 94);
    ctx.textAlign = 'left';

    // Artwork / Project Image Container
    const imgX = 72, imgY = 128, imgW = 624, imgH = 540;
    ctx.fillStyle = '#eae7dd';
    ctx.fillRect(imgX, imgY, imgW, imgH);

    if (imageObj && imageObj.complete && imageObj.naturalWidth > 0) {
      // Draw actual loaded image cover
      const iw = imageObj.naturalWidth;
      const ih = imageObj.naturalHeight;
      const scale = Math.max(imgW / iw, imgH / ih);
      const sw = imgW / scale;
      const sh = imgH / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;
      ctx.drawImage(imageObj, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
    } else {
      // Elegant placeholder pattern
      ctx.fillStyle = book.color || '#365348';
      ctx.globalAlpha = 0.15;
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#7a8178';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(book.title, imgX + imgW / 2, imgY + imgH / 2);
      ctx.textAlign = 'left';
    }

    // Title typography
    ctx.fillStyle = '#222925';
    ctx.font = 'bold 36px Georgia, serif';
    const words = book.title.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > 600 && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    lines.push(cur);
    lines.slice(0, 2).forEach((l, i) => {
      ctx.fillText(l, 72, 726 + i * 44);
    });

    // Description
    ctx.fillStyle = '#545d57';
    ctx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const descWords = book.description.split(' ');
    const descLines = [];
    let dCur = '';
    for (const dw of descWords) {
      const dTest = dCur ? `${dCur} ${dw}` : dw;
      if (ctx.measureText(dTest).width > 610 && dCur) {
        descLines.push(dCur);
        dCur = dw;
      } else {
        dCur = dTest;
      }
    }
    descLines.push(dCur);
    descLines.slice(0, 2).forEach((dl, i) => {
      ctx.fillText(dl, 72, 824 + i * 28);
    });

    // Action indicator at bottom
    ctx.fillStyle = '#af593b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('CLICK POSTER TO OPEN ↗', 72, 946);

    // Subtle glass reflection diagonal sheen
    const sheen = ctx.createLinearGradient(0, 0, 768, 1024);
    sheen.addColorStop(0, 'rgba(255,255,255,0.09)');
    sheen.addColorStop(0.3, 'rgba(255,255,255,0.02)');
    sheen.addColorStop(0.6, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.8, 'rgba(255,255,255,0.06)');
    ctx.fillStyle = sheen;
    ctx.fillRect(36, 36, 696, 952);
  }

  render(null);

  const texture = new THREE.CanvasTexture(canvas);

  // Load actual image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    render(img);
    texture.needsUpdate = true;
    if (onLoadedCallback) onLoadedCallback();
  };
  img.src = book.image;

  return texture;
}

// --- 3D SCENE & ENGINE INITIALIZATION ---

export function initMazeHomepage() {
  const container = document.getElementById('maze-container');
  const canvas = document.getElementById('maze-canvas');
  const tooltip = document.getElementById('poster-tooltip');
  const crosshair = document.getElementById('crosshair');
  const statusElement = document.getElementById('status-corridor');
  const dialog = document.getElementById('project-dialog');

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141816');
  scene.fog = new THREE.FogExp2('#141816', 0.038);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.rotation.order = 'YXZ';

  // Lighting
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight('#fbf9f4', '#323633', 0.65);
  scene.add(hemiLight);

  // Materials & Textures
  const carpetTex = createCarpetTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    map: carpetTex,
    roughness: 0.92,
    metalness: 0.05
  });

  const ceilingTex = createCeilingTextures();
  const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilingTex.diffuse,
    emissiveMap: ceilingTex.emissive,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.85,
    roughness: 0.85,
    metalness: 0.02
  });

  const wallTex = createWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.88,
    metalness: 0.02
  });

  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);

  // Build Floor & Ceiling
  const mazeWidth = GRID_COLS * CELL_SIZE;
  const mazeDepth = GRID_ROWS * CELL_SIZE;
  const floorGeo = new THREE.PlaneGeometry(mazeWidth, mazeDepth);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = 0;
  scene.add(floorMesh);

  const ceilingGeo = new THREE.PlaneGeometry(mazeWidth, mazeDepth);
  ceilingGeo.rotateX(Math.PI / 2);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceilingMesh.position.y = WALL_HEIGHT;
  scene.add(ceilingMesh);

  // Array of wall meshes and bounding boxes for collision
  const wallMeshes = [];
  const wallBoundingBoxes = [];

  // Build Walls
  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      if (MAZE_GRID[gz][gx] === 1) {
        const { x, z } = gridToWorld(gx, gz);
        const wall = new THREE.Mesh(wallGeometry, wallMat);
        wall.position.set(x, WALL_HEIGHT / 2, z);
        scene.add(wall);
        wallMeshes.push(wall);

        wallBoundingBoxes.push(
          new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, WALL_HEIGHT / 2, z),
            new THREE.Vector3(CELL_SIZE, WALL_HEIGHT, CELL_SIZE)
          )
        );
      }
    }
  }

  // Fluorescent troffer point lights along intersections
  const lightPositions = [
    { gx: 1, gz: 1 }, { gx: 5, gz: 1 }, { gx: 9, gz: 1 }, { gx: 11, gz: 1 },
    { gx: 1, gz: 5 }, { gx: 5, gz: 5 }, { gx: 7, gz: 5 }, { gx: 11, gz: 5 },
    { gx: 1, gz: 7 }, { gx: 5, gz: 7 }, { gx: 7, gz: 7 }, { gx: 11, gz: 7 },
    { gx: 1, gz: 11 }, { gx: 5, gz: 11 }, { gx: 9, gz: 11 }, { gx: 11, gz: 11 }
  ];
  lightPositions.forEach(pos => {
    const { x, z } = gridToWorld(pos.gx, pos.gz);
    const light = new THREE.PointLight('#fffbf0', 0.9, 11, 2.0);
    light.position.set(x, WALL_HEIGHT - 0.2, z);
    scene.add(light);
  });

  // Mount Office Doors
  const doorGeo = new THREE.PlaneGeometry(CELL_SIZE * 0.75, WALL_HEIGHT);
  DOOR_MOUNTS.forEach(dm => {
    const { x, z } = gridToWorld(dm.gx, dm.gz);
    const doorTex = createDoorTexture(dm.label);
    const doorMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      roughness: 0.6,
      metalness: 0.1
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);

    const offset = CELL_SIZE / 2 + 0.01;
    let rx = 0, rz = 0, rotY = 0;
    if (dm.face === 'N') { rz = -offset; rotY = Math.PI; }
    else if (dm.face === 'S') { rz = offset; rotY = 0; }
    else if (dm.face === 'E') { rx = offset; rotY = Math.PI / 2; }
    else if (dm.face === 'W') { rx = -offset; rotY = -Math.PI / 2; }

    doorMesh.position.set(x + rx, WALL_HEIGHT / 2, z + rz);
    doorMesh.rotation.y = rotY;
    scene.add(doorMesh);
  });

  // Mount Giant Project Posters
  const interactivePosters = [];
  const posterWidth = 2.0;
  const posterHeight = 2.5;
  const frameThickness = 0.06;

  const frameMat = new THREE.MeshStandardMaterial({
    color: '#1a1f1c',
    roughness: 0.4,
    metalness: 0.6
  });

  POSTER_MOUNTS.forEach(pm => {
    const book = books[pm.bookIndex];
    const { x, z } = gridToWorld(pm.gx, pm.gz);

    const posterTex = createPosterTexture(book, pm.bookIndex, () => {
      // Trigger update if needed
    });

    const posterMat = new THREE.MeshStandardMaterial({
      map: posterTex,
      roughness: 0.35,
      metalness: 0.1,
      emissive: new THREE.Color('#af593b'),
      emissiveIntensity: 0.0
    });

    const posterGroup = new THREE.Group();

    // Frame (slightly larger box behind)
    const frameGeo = new THREE.BoxGeometry(posterWidth + 0.1, posterHeight + 0.1, frameThickness);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.z = -frameThickness / 2;
    posterGroup.add(frameMesh);

    // Front Poster Plane
    const frontPlaneGeo = new THREE.PlaneGeometry(posterWidth, posterHeight);
    const frontPlaneMesh = new THREE.Mesh(frontPlaneGeo, posterMat);
    frontPlaneMesh.position.z = 0.005;
    posterGroup.add(frontPlaneMesh);

    // Position and orientation based on wall face
    const offset = CELL_SIZE / 2 + 0.02;
    let px = 0, pz = 0, rotY = 0;
    if (pm.face === 'N') { pz = -offset; rotY = Math.PI; }
    else if (pm.face === 'S') { pz = offset; rotY = 0; }
    else if (pm.face === 'E') { px = offset; rotY = Math.PI / 2; }
    else if (pm.face === 'W') { px = -offset; rotY = -Math.PI / 2; }

    posterGroup.position.set(x + px, CAMERA_HEIGHT + 0.1, z + pz);
    posterGroup.rotation.y = rotY;

    // Attach metadata for raycasting & interactions
    frontPlaneMesh.userData = {
      isPoster: true,
      bookIndex: pm.bookIndex,
      book: book,
      posterMat: posterMat,
      group: posterGroup
    };

    scene.add(posterGroup);
    interactivePosters.push(frontPlaneMesh);
  });

  // --- TOP-DOWN 2D MINI-MAP (WINDOWS 3D MAZE HOMAGE) ---
  const minimapCanvas = document.getElementById('minimap-canvas');
  const mmCtx = minimapCanvas.getContext('2d');
  const mmW = minimapCanvas.width = 148;
  const mmH = minimapCanvas.height = 148;
  const cellPx = mmW / GRID_COLS;

  function renderMinimap() {
    mmCtx.fillStyle = '#090e0b';
    mmCtx.fillRect(0, 0, mmW, mmH);

    // Draw maze grid
    for (let gz = 0; gz < GRID_ROWS; gz++) {
      for (let gx = 0; gx < GRID_COLS; gx++) {
        if (MAZE_GRID[gz][gx] === 1) {
          mmCtx.fillStyle = '#1e2822';
          mmCtx.fillRect(gx * cellPx, gz * cellPx, cellPx - 0.5, cellPx - 0.5);
        } else {
          mmCtx.fillStyle = '#0d1611';
          mmCtx.fillRect(gx * cellPx, gz * cellPx, cellPx - 0.5, cellPx - 0.5);
        }
      }
    }

    // Draw Poster Pins
    POSTER_MOUNTS.forEach((pm, idx) => {
      const px = pm.gx * cellPx + cellPx / 2;
      const py = pm.gz * cellPx + cellPx / 2;
      mmCtx.beginPath();
      mmCtx.arc(px, py, 3.5, 0, Math.PI * 2);
      mmCtx.fillStyle = '#af593b';
      mmCtx.fill();
      mmCtx.strokeStyle = '#ffffff';
      mmCtx.lineWidth = 1;
      mmCtx.stroke();
    });

    // Draw Visitor / Camera Position and Vision Cone
    const camGrid = worldToGrid(camera.position.x, camera.position.z);
    const cx = (camera.position.x / CELL_SIZE + (GRID_COLS - 1) / 2) * cellPx;
    const cz = (camera.position.z / CELL_SIZE + (GRID_ROWS - 1) / 2) * cellPx;

    // Vision cone based on cameraYaw
    const coneAngle = 0.5; // rad
    const coneLen = 14;

    mmCtx.beginPath();
    mmCtx.moveTo(cx, cz);
    mmCtx.lineTo(cx + Math.sin(cameraYaw + Math.PI - coneAngle) * coneLen,
                 cz + Math.cos(cameraYaw + Math.PI - coneAngle) * coneLen);
    mmCtx.lineTo(cx + Math.sin(cameraYaw + Math.PI + coneAngle) * coneLen,
                 cz + Math.cos(cameraYaw + Math.PI + coneAngle) * coneLen);
    mmCtx.closePath();
    mmCtx.fillStyle = 'rgba(52, 211, 153, 0.25)';
    mmCtx.fill();

    // Position dot
    mmCtx.beginPath();
    mmCtx.arc(cx, cz, 4, 0, Math.PI * 2);
    mmCtx.fillStyle = '#34d399';
    mmCtx.fill();
    mmCtx.strokeStyle = '#ffffff';
    mmCtx.lineWidth = 1.2;
    mmCtx.stroke();
  }

  // --- NAVIGATION SYSTEM: AUTONOMOUS SCREENSAVER TOUR ---
  // Directions: 0 = East (+X), 1 = South (+Z), 2 = West (-X), 3 = North (-Z)
  const DIRS = [
    { dx: 1, dz: 0, yaw: -Math.PI / 2 }, // East
    { dx: 0, dz: 1, yaw: Math.PI },       // South
    { dx: -1, dz: 0, yaw: Math.PI / 2 },  // West
    { dx: 0, dz: -1, yaw: 0 }             // North
  ];

  let currentGrid = { gx: 1, gz: 1 };
  let currentDirIdx = 0; // East
  let targetGrid = { gx: 1, gz: 1 };

  // Explicit Euler angles for orientation (order: YXZ)
  let cameraYaw = DIRS[currentDirIdx].yaw;
  let cameraPitch = 0;

  // Tour state
  let isAutoPilot = true;
  let tourSpeed = 1.0;
  let isTransitioning = false;
  let transitionType = 'idle'; // 'move', 'turn'
  let transitionProgress = 0;
  let moveStartPos = new THREE.Vector3();
  let moveTargetPos = new THREE.Vector3();
  let turnStartYaw = 0;
  let turnTargetYaw = 0;
  let curatorPauseTimer = 0;
  const visitHistory = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0));

  // Initialize camera position and orientation
  const initialWorld = gridToWorld(currentGrid.gx, currentGrid.gz);
  camera.position.set(initialWorld.x, CAMERA_HEIGHT, initialWorld.z);
  camera.rotation.set(cameraPitch, cameraYaw, 0);

  // Smart autonomous decision algorithm
  function decideNextStep() {
    visitHistory[currentGrid.gz][currentGrid.gx]++;

    // Check surrounding open directions
    const candidates = [];
    const oppositeDir = (currentDirIdx + 2) % 4;

    for (let i = 0; i < 4; i++) {
      const nx = currentGrid.gx + DIRS[i].dx;
      const nz = currentGrid.gz + DIRS[i].dz;

      if (nx >= 0 && nx < GRID_COLS && nz >= 0 && nz < GRID_ROWS && MAZE_GRID[nz][nx] === 0) {
        let weight = 100 - (visitHistory[nz][nx] * 12);
        if (i === currentDirIdx) weight += 15; // favor straight forward momentum
        if (i === oppositeDir) weight -= 40;  // discourage immediate 180 backtrack unless dead-end

        // Bonus if direction approaches next poster
        POSTER_MOUNTS.forEach(pm => {
          const distBefore = Math.hypot(pm.gx - currentGrid.gx, pm.gz - currentGrid.gz);
          const distAfter = Math.hypot(pm.gx - nx, pm.gz - nz);
          if (distAfter < distBefore) weight += 20;
        });

        candidates.push({ dirIdx: i, gx: nx, gz: nz, weight: Math.max(1, weight) });
      }
    }

    if (candidates.length === 0) {
      // Emergency turn around
      return { dirIdx: oppositeDir, gx: currentGrid.gx, gz: currentGrid.gz };
    }

    // Weighted selection
    candidates.sort((a, b) => b.weight - a.weight);
    // 75% choose best, 25% allow exploration
    const choice = Math.random() < 0.75 ? candidates[0] : candidates[Math.floor(Math.random() * candidates.length)];
    return choice;
  }

  function startNextAutonomousAction() {
    if (!isAutoPilot || curatorPauseTimer > 0) return;

    const nextStep = decideNextStep();

    if (nextStep.dirIdx === currentDirIdx) {
      // Move forward
      transitionType = 'move';
      transitionProgress = 0;
      targetGrid = { gx: nextStep.gx, gz: nextStep.gz };
      moveStartPos.copy(camera.position);
      const tw = gridToWorld(targetGrid.gx, targetGrid.gz);
      moveTargetPos.set(tw.x, CAMERA_HEIGHT, tw.z);
      isTransitioning = true;
    } else {
      // Turn
      transitionType = 'turn';
      transitionProgress = 0;
      turnStartYaw = cameraYaw;

      let targetYaw = DIRS[nextStep.dirIdx].yaw;
      // Find shortest turn angle
      let diff = targetYaw - turnStartYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      turnTargetYaw = turnStartYaw + diff;

      currentDirIdx = nextStep.dirIdx;
      isTransitioning = true;
    }
  }

  // Smooth easing functions
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // --- MANUAL EXPLORATION CONTROLS (WASD / ARROW KEYS / DRAG) ---
  const keys = {};
  const playerRadius = 0.65;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (isAutoPilot) {
        setAutoPilot(false);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Mouse drag to look around
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      if (isAutoPilot) setAutoPilot(false);
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      cameraYaw -= dx * 0.0035;
      cameraPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraPitch - dy * 0.0035));
      camera.rotation.set(cameraPitch, cameraYaw, 0);
    }
  });

  // Touch drag for mobile
  let touchStartPos = { x: 0, y: 0 };
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartPos.x;
      const dy = e.touches[0].clientY - touchStartPos.y;
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (Math.hypot(dx, dy) > 2) {
        if (isAutoPilot) setAutoPilot(false);
        cameraYaw -= dx * 0.005;
        cameraPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraPitch - dy * 0.005));
        camera.rotation.set(cameraPitch, cameraYaw, 0);
      }
    }
  }, { passive: true });

  function checkWallCollision(newPos) {
    const minX = newPos.x - playerRadius;
    const maxX = newPos.x + playerRadius;
    const minZ = newPos.z - playerRadius;
    const maxZ = newPos.z + playerRadius;

    for (const box of wallBoundingBoxes) {
      if (maxX > box.min.x && minX < box.max.x && maxZ > box.min.z && minZ < box.max.z) {
        return true;
      }
    }
    return false;
  }

  function updateManualMovement(dt) {
    const moveSpeed = 4.2;
    const turnSpeed = 2.4;

    // Arrow Left / Right rotates the view relative to current facing
    if (keys['ArrowLeft'] && !keys['ShiftLeft'] && !keys['ShiftRight']) {
      cameraYaw += turnSpeed * dt;
    }
    if (keys['ArrowRight'] && !keys['ShiftLeft'] && !keys['ShiftRight']) {
      cameraYaw -= turnSpeed * dt;
    }

    // Direction vectors in the horizontal plane strictly relative to where person is facing
    const forwardX = -Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);
    const rightX = Math.cos(cameraYaw);
    const rightZ = -Math.sin(cameraYaw);

    let moveFwd = 0;
    let moveSide = 0;

    // Up / Down and W / S move forward / backward relative to where person is facing
    if (keys['KeyW'] || keys['ArrowUp']) moveFwd += 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveFwd -= 1;

    // A / D and Shift + Arrow strafe left / right relative to where person is facing
    if (keys['KeyA'] || ((keys['ShiftLeft'] || keys['ShiftRight']) && keys['ArrowLeft'])) moveSide -= 1;
    if (keys['KeyD'] || ((keys['ShiftLeft'] || keys['ShiftRight']) && keys['ArrowRight'])) moveSide += 1;

    if (moveFwd !== 0 || moveSide !== 0) {
      const len = Math.hypot(moveFwd, moveSide);
      const stepDist = moveSpeed * dt;
      const stepXVal = (forwardX * (moveFwd / len) + rightX * (moveSide / len)) * stepDist;
      const stepZVal = (forwardZ * (moveFwd / len) + rightZ * (moveSide / len)) * stepDist;

      const stepX = new THREE.Vector3(camera.position.x + stepXVal, camera.position.y, camera.position.z);
      if (!checkWallCollision(stepX)) camera.position.x = stepX.x;

      const stepZ = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z + stepZVal);
      if (!checkWallCollision(stepZ)) camera.position.z = stepZ.z;
    }

    camera.rotation.set(cameraPitch, cameraYaw, 0);
  }

  // --- MOBILE GYROSCOPE STEERING ---
  let isGyroActive = false;
  let neutralBeta = null;
  let currentBeta = null;
  let currentGamma = null;

  function handleOrientation(e) {
    if (e.beta === null || e.gamma === null) return;
    currentBeta = e.beta;
    currentGamma = e.gamma;
    if (neutralBeta === null) {
      neutralBeta = e.beta;
    }
  }

  function updateGyroMovement(dt) {
    if (!isGyroActive || currentBeta === null || currentGamma === null) return;
    if (neutralBeta === null) neutralBeta = currentBeta;

    // 1. Left and right tilt (gamma) rotate the view left and right
    const gammaDeadzone = 4.5; // degrees
    if (Math.abs(currentGamma) > gammaDeadzone) {
      const sign = Math.sign(currentGamma);
      const intensity = Math.min((Math.abs(currentGamma) - gammaDeadzone) / 28.0, 2.0);
      const turnRate = 2.4 * intensity; // rad/sec
      // Tilting left (negative gamma) rotates view left (+yaw)
      // Tilting right (positive gamma) rotates view right (-yaw)
      cameraYaw -= sign * turnRate * dt;
      if (isAutoPilot) setAutoPilot(false);
    }

    // 2. Forward and backward tilt (beta) move forward or backward
    const betaDeadzone = 5.5; // degrees
    const betaDiff = currentBeta - neutralBeta;
    if (Math.abs(betaDiff) > betaDeadzone) {
      const sign = Math.sign(betaDiff);
      const intensity = Math.min((Math.abs(betaDiff) - betaDeadzone) / 24.0, 2.0);
      const moveRate = 4.2 * intensity; // m/s
      const stepDist = sign * moveRate * dt;

      const forwardX = -Math.sin(cameraYaw);
      const forwardZ = -Math.cos(cameraYaw);

      const stepX = new THREE.Vector3(camera.position.x + forwardX * stepDist, camera.position.y, camera.position.z);
      if (!checkWallCollision(stepX)) camera.position.x = stepX.x;

      const stepZ = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z + forwardZ * stepDist);
      if (!checkWallCollision(stepZ)) camera.position.z = stepZ.z;

      if (isAutoPilot) setAutoPilot(false);
    }

    camera.rotation.set(cameraPitch, cameraYaw, 0);
  }

  const gyroBtn = document.getElementById('btn-gyro');

  async function toggleGyro() {
    if (isGyroActive) {
      isGyroActive = false;
      neutralBeta = null;
      if (gyroBtn) {
        gyroBtn.classList.remove('active-gyro');
        gyroBtn.querySelector('.btn-text').textContent = 'Gyro: OFF';
      }
      statusElement.textContent = isAutoPilot ? 'AUTOPILOT TOUR ACTIVE' : 'MANUAL EXPLORATION (ARROWS / WASD)';
      return;
    }

    // iOS 13+ permission request
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          alert('Motion access was not granted. Please allow orientation sensors to use tilt steering.');
          return;
        }
      } catch (err) {
        console.warn('Gyro requestPermission error:', err);
        return;
      }
    }

    window.addEventListener('deviceorientation', handleOrientation, true);
    isGyroActive = true;
    neutralBeta = null;
    if (gyroBtn) {
      gyroBtn.classList.add('active-gyro');
      gyroBtn.querySelector('.btn-text').textContent = 'Gyro: ON';
    }
    if (isAutoPilot) setAutoPilot(false);
    statusElement.textContent = 'GYRO ACTIVE • TILT TO STEER & WALK';
  }

  if (gyroBtn) {
    gyroBtn.addEventListener('click', toggleGyro);
  }

  // --- RAYCASTING & INTERACTIVE POSTER CLICKS ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-1000, -1000);
  let hoveredPoster = null;

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (tooltip && hoveredPoster) {
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY}px`;
    }
  });

  function checkPosterHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactivePosters, false);

    if (intersects.length > 0 && intersects[0].distance < 8.5) {
      const hit = intersects[0].object;
      if (hoveredPoster !== hit) {
        if (hoveredPoster) hoveredPoster.userData.posterMat.emissiveIntensity = 0;
        hoveredPoster = hit;
        hit.userData.posterMat.emissiveIntensity = 0.28;
        canvas.style.cursor = 'pointer';

        // Update and display tooltip
        const book = hit.userData.book;
        tooltip.querySelector('.tooltip-kicker').textContent = book.category;
        tooltip.querySelector('.tooltip-title').textContent = book.title;
        tooltip.classList.add('visible');
      }
    } else {
      if (hoveredPoster) {
        hoveredPoster.userData.posterMat.emissiveIntensity = 0;
        hoveredPoster = null;
        canvas.style.cursor = 'default';
        tooltip.classList.remove('visible');
      }
    }
  }

  // Open Project Dialog
  function openProjectModal(book, index) {
    curatorPauseTimer = 0;
    if (isAutoPilot) {
      // Pause screensaver motion while reading
      isAutoPilot = false;
      updateControlButtons();
    }

    document.getElementById('card-kicker').textContent = book.category.toUpperCase();
    document.getElementById('card-index').textContent = `0${index + 1} / 06`;
    document.getElementById('card-title').textContent = book.title;
    document.getElementById('card-desc').textContent = book.description;
    document.getElementById('card-img').src = book.image;
    document.getElementById('card-img').alt = book.title;
    document.getElementById('card-visit-link').href = book.url;

    dialog.showModal();
  }

  function closeProjectModal() {
    dialog.close();
    // Resume screensaver smoothly
    setAutoPilot(true);
  }

  document.getElementById('card-close-btn').addEventListener('click', closeProjectModal);
  document.getElementById('card-resume-btn').addEventListener('click', closeProjectModal);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeProjectModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.open) closeProjectModal();
  });

  // Click handler for posters
  window.addEventListener('click', (e) => {
    // Avoid triggering if clicking on UI buttons
    if (e.target.closest('.site-header') || e.target.closest('.hud-controls-container') || e.target.closest('.minimap-card') || dialog.open) {
      return;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactivePosters, false);
    if (intersects.length > 0 && intersects[0].distance < 8.5) {
      const hit = intersects[0].object;
      openProjectModal(hit.userData.book, hit.userData.bookIndex);
    }
  });

  // --- UI CONTROLS & HUD ---
  const autoPilotBtn = document.getElementById('btn-autopilot');
  const speedBtn = document.getElementById('btn-speed');
  const minimapBtn = document.getElementById('btn-minimap');
  const minimapWrap = document.querySelector('.minimap-wrapper');

  function setAutoPilot(enabled) {
    isAutoPilot = enabled;
    isTransitioning = false;
    transitionType = 'idle';

    if (isAutoPilot) {
      neutralBeta = null;

      // Snap to nearest grid center
      const nearest = worldToGrid(camera.position.x, camera.position.z);
      // Ensure nearest is a corridor cell
      if (MAZE_GRID[nearest.gz] && MAZE_GRID[nearest.gz][nearest.gx] === 0) {
        currentGrid = nearest;
      }
      const nw = gridToWorld(currentGrid.gx, currentGrid.gz);
      camera.position.set(nw.x, CAMERA_HEIGHT, nw.z);

      // Snap yaw to nearest cardinal direction
      let curYaw = cameraYaw % (Math.PI * 2);
      if (curYaw < 0) curYaw += Math.PI * 2;
      let closestDir = 0;
      let minDiff = 999;
      DIRS.forEach((d, idx) => {
        let diff = Math.abs(d.yaw - curYaw);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < minDiff) {
          minDiff = diff;
          closestDir = idx;
        }
      });
      currentDirIdx = closestDir;
      cameraYaw = DIRS[currentDirIdx].yaw;
      cameraPitch = 0;
      camera.rotation.set(0, cameraYaw, 0);

      statusElement.textContent = 'AUTOPILOT TOUR ACTIVE';
    } else {
      statusElement.textContent = isGyroActive ? 'GYRO ACTIVE • TILT TO STEER & WALK' : 'MANUAL EXPLORATION (ARROWS / WASD)';
    }
    updateControlButtons();
  }

  function updateControlButtons() {
    if (isAutoPilot) {
      autoPilotBtn.classList.add('tour-indicator');
      autoPilotBtn.querySelector('.btn-text').textContent = 'Auto-Pilot: ON';
      crosshair.classList.remove('visible');
    } else {
      autoPilotBtn.classList.remove('tour-indicator');
      autoPilotBtn.querySelector('.btn-text').textContent = 'Auto-Pilot: OFF';
      crosshair.classList.add('visible');
    }
    speedBtn.querySelector('.btn-text').textContent = `Speed: ${tourSpeed}x`;
  }

  autoPilotBtn.addEventListener('click', () => {
    setAutoPilot(!isAutoPilot);
  });

  speedBtn.addEventListener('click', () => {
    tourSpeed = tourSpeed === 1.0 ? 2.0 : 1.0;
    updateControlButtons();
  });

  minimapBtn.addEventListener('click', () => {
    minimapWrap.classList.toggle('hidden');
    minimapBtn.classList.toggle('active');
  });

  // --- MAIN ANIMATION LOOP ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);

    // Check hover state for raycaster
    checkPosterHover();

    if (isAutoPilot) {
      if (curatorPauseTimer > 0) {
        curatorPauseTimer -= dt;
        statusElement.textContent = `ADMIRING WORK (${curatorPauseTimer.toFixed(1)}s)`;
        if (curatorPauseTimer <= 0) {
          statusElement.textContent = 'AUTOPILOT TOUR ACTIVE';
          startNextAutonomousAction();
        }
      } else if (!isTransitioning) {
        startNextAutonomousAction();
      } else {
        // Handle active transition (move or turn)
        if (transitionType === 'move') {
          const moveDuration = 1.2 / tourSpeed;
          transitionProgress += dt / moveDuration;

          if (transitionProgress >= 1.0) {
            camera.position.copy(moveTargetPos);
            currentGrid = targetGrid;
            isTransitioning = false;

            // Check if current position is right next to a poster
            const facingPoster = POSTER_MOUNTS.find(pm => {
              const dist = Math.hypot(pm.gx - currentGrid.gx, pm.gz - currentGrid.gz);
              return dist <= 1.2;
            });

            if (facingPoster) {
              const book = books[facingPoster.bookIndex];
              statusElement.textContent = `PASSING: ${book.title.toUpperCase()}`;
              curatorPauseTimer = 2.4 / tourSpeed; // linger for curator view
            } else {
              startNextAutonomousAction();
            }
          } else {
            const ease = easeInOutCubic(transitionProgress);
            camera.position.lerpVectors(moveStartPos, moveTargetPos, ease);
            // Subtle nostalgic screensaver camera sway
            camera.position.y = CAMERA_HEIGHT + Math.sin(transitionProgress * Math.PI) * 0.03;
          }
        } else if (transitionType === 'turn') {
          const turnDuration = 0.65 / tourSpeed;
          transitionProgress += dt / turnDuration;

          if (transitionProgress >= 1.0) {
            cameraYaw = turnTargetYaw;
            camera.rotation.set(0, cameraYaw, 0);
            isTransitioning = false;
            startNextAutonomousAction();
          } else {
            const ease = easeInOutCubic(transitionProgress);
            cameraYaw = THREE.MathUtils.lerp(turnStartYaw, turnTargetYaw, ease);
            // Subtle retro bank tilt during turn (1.2 deg)
            const turnSign = Math.sign(turnTargetYaw - turnStartYaw);
            camera.rotation.set(0, cameraYaw, Math.sin(transitionProgress * Math.PI) * 0.02 * turnSign);
          }
        }
      }
    } else {
      // Manual walking mode
      updateManualMovement(dt);
    }

    // Apply Gyroscope tilt steering if enabled
    if (isGyroActive) {
      updateGyroMovement(dt);
    }

    // Render 2D Top-Down Mini-Map
    renderMinimap();

    // Render 3D WebGL Scene
    renderer.render(scene, camera);
  }

  animate();

  // Window resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

// Auto-boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMazeHomepage);
} else {
  initMazeHomepage();
}
