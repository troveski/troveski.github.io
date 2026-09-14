// ---------------------------------------------------------------
// Museum — first-person walkthrough built with Three.js.
//
// Layout: one floor, 4 rooms in a row (A→B→C→D), connected by
// doorways. Numbered paintings hang on the walls (see paintings.js).
// Everything is placeholder geometry — no textures needed to test
// the layout and movement.
// ---------------------------------------------------------------

// ---- Room layout ------------------------------------------------
// Each room is a box in world space, laid out side by side on the x
// axis, connected by a doorway in the shared wall between neighbors.

const ROOM_SIZE = { w: 14, d: 14, h: 5 };
const WALL_T = 0.3;
const DOOR_W = 3.2;

// Room centers, one row: A, B, C, D (indices 0-3).
const ROOMS = [
  { x: -21, z: 0 }, // room A
  { x: -7,  z: 0 }, // room B
  { x: 7,   z: 0 }, // room C
  { x: 21,  z: 0 }, // room D
];

// ---- Renderer / scene / camera ----------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcd6c8);
scene.fog = new THREE.Fog(0xdcd6c8, 18, 46);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById("game").appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Lighting -----------------------------------------------------

scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const hemi = new THREE.HemisphereLight(0xf6f2e6, 0x37342c, 0.5);
scene.add(hemi);

function addRoomLight(x, y, z) {
  const light = new THREE.PointLight(0xfff3d6, 0.9, 16, 2);
  light.position.set(x, y, z);
  scene.add(light);
}

// ---- Materials ----------------------------------------------------

const floorMat = new THREE.MeshStandardMaterial({ color: 0xb9ac8f, roughness: 0.9 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: 1 });
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.95 });

// ---- Collision boxes (AABB) ---------------------------------------
// Walls block horizontal movement; the floor doesn't need a collider
// since the player always walks at a fixed height (y = player.height).

let wallColliders = [];

function addWallCollider(x, y, z, w, h, d) {
  wallColliders.push({
    minX: x - w / 2, maxX: x + w / 2,
    minY: y - h / 2, maxY: y + h / 2,
    minZ: z - d / 2, maxZ: z + d / 2,
  });
}

// ---- Room builder ---------------------------------------------------
//
// Builds a rectangular room centered at (cx, 0, cz). `doors` is a map
// of which walls have a doorway gap in the middle:
// { north, south, east, west } -> boolean

function buildRoom(cx, cz, doors, group) {
  const { w, d, h } = ROOM_SIZE;
  const hw = w / 2, hd = d / 2;

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_T, d), floorMat);
  floor.position.set(cx, -WALL_T / 2, cz);
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_T, d), ceilingMat);
  ceiling.position.set(cx, h, cz);
  group.add(ceiling);

  // Walls: north(-z) south(+z) west(-x) east(+x)
  const wallDefs = [
    { key: "north", axis: "x", len: w, pos: [cx, h / 2, cz - hd] },
    { key: "south", axis: "x", len: w, pos: [cx, h / 2, cz + hd] },
    { key: "west",  axis: "z", len: d, pos: [cx - hw, h / 2, cz] },
    { key: "east",  axis: "z", len: d, pos: [cx + hw, h / 2, cz] },
  ];

  for (const wd of wallDefs) {
    const hasDoor = doors[wd.key];
    if (!hasDoor) {
      const geom = wd.axis === "x"
        ? new THREE.BoxGeometry(wd.len, ROOM_SIZE.h, WALL_T)
        : new THREE.BoxGeometry(WALL_T, ROOM_SIZE.h, wd.len);
      const mesh = new THREE.Mesh(geom, wallMat);
      mesh.position.set(...wd.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      if (wd.axis === "x") addWallCollider(wd.pos[0], wd.pos[1], wd.pos[2], wd.len, ROOM_SIZE.h, WALL_T);
      else addWallCollider(wd.pos[0], wd.pos[1], wd.pos[2], WALL_T, ROOM_SIZE.h, wd.len);
    } else {
      // Split wall into two segments with a DOOR_W gap in the middle
      const segLen = (wd.len - DOOR_W) / 2;
      for (const sign of [-1, 1]) {
        const offset = sign * (DOOR_W / 2 + segLen / 2);
        const geom = wd.axis === "x"
          ? new THREE.BoxGeometry(segLen, ROOM_SIZE.h, WALL_T)
          : new THREE.BoxGeometry(WALL_T, ROOM_SIZE.h, segLen);
        const mesh = new THREE.Mesh(geom, wallMat);
        const pos = wd.axis === "x"
          ? [wd.pos[0] + offset, wd.pos[1], wd.pos[2]]
          : [wd.pos[0], wd.pos[1], wd.pos[2] + offset];
        mesh.position.set(...pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        if (wd.axis === "x") addWallCollider(pos[0], pos[1], pos[2], segLen, ROOM_SIZE.h, WALL_T);
        else addWallCollider(pos[0], pos[1], pos[2], WALL_T, ROOM_SIZE.h, segLen);
      }
    }
  }

  addRoomLight(cx, h - 0.5, cz);
}

// ---- Painting builder ------------------------------------------------

const loader = new THREE.TextureLoader();
const frameMat = new THREE.MeshStandardMaterial({ color: 0x3b2f22, roughness: 0.6 });
const placeholderMat = new THREE.MeshStandardMaterial({ color: 0xcfc7b4, roughness: 0.85 });

function wallInfo(room, wall) {
  const { w, d } = ROOM_SIZE;
  const hw = w / 2, hd = d / 2;
  switch (wall) {
    case "north": return { normal: [0, 0, 1],  center: [room.x, 0, room.z - hd], along: [1, 0, 0], length: w };
    case "south": return { normal: [0, 0, -1], center: [room.x, 0, room.z + hd], along: [1, 0, 0], length: w };
    case "west":  return { normal: [1, 0, 0],  center: [room.x - hw, 0, room.z], along: [0, 0, 1], length: d };
    case "east":  return { normal: [-1, 0, 0], center: [room.x + hw, 0, room.z], along: [0, 0, 1], length: d };
  }
}

function buildPainting(p, group) {
  const room = ROOMS[p.room];
  const info = wallInfo(room, p.wall);
  const pw = 2.2, ph = 1.6, depth = 0.08;
  const eyeY = 2.4;

  const along = info.along;
  const dist = p.offset * (info.length / 2 - pw / 2 - 0.6);

  const x = info.center[0] + along[0] * dist;
  const z = info.center[2] + along[2] * dist;
  const nx = info.normal[0], nz = info.normal[2];

  const pull = WALL_T / 2 + depth / 2 + 0.01;
  const px = x + nx * pull;
  const pz = z + nz * pull;

  const pgroup = new THREE.Group();
  pgroup.position.set(px, eyeY, pz);
  pgroup.lookAt(px + nx, eyeY, pz + nz);

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.16, ph + 0.16, depth), frameMat);
  pgroup.add(frame);

  // Canvas / placeholder
  const canvasMat = p.image
    ? new THREE.MeshStandardMaterial({ map: loader.load(p.image), roughness: 0.9 })
    : placeholderMat;
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), canvasMat);
  canvas.position.z = depth / 2 + 0.005;
  pgroup.add(canvas);

  pgroup.userData.isPainting = true;
  pgroup.userData.painting = p;
  group.add(pgroup);

  // Number label sprite (simple canvas texture)
  const label = makeNumberSprite(p.id);
  label.position.set(0, -ph / 2 - 0.28, depth / 2 + 0.01);
  pgroup.add(label);

  return pgroup;
}

function makeNumberSprite(number) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f0e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#8c7b5f";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.fillStyle = "#1c1917";
  ctx.font = "bold 30px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.6, 0.3, 1);
  return sprite;
}

// ---- Build the row of rooms -------------------------------------------

const allPaintingMeshes = [];
const worldGroup = new THREE.Group();
scene.add(worldGroup);

for (let i = 0; i < ROOMS.length; i++) {
  const doors = {};
  if (i > 0) doors.west = true;              // door back to the previous room
  if (i < ROOMS.length - 1) doors.east = true; // door forward to the next room
  buildRoom(ROOMS[i].x, ROOMS[i].z, doors, worldGroup);
}

for (const p of PAINTINGS) {
  const mesh = buildPainting(p, worldGroup);
  allPaintingMeshes.push(mesh);
}

// ---- Player controller (pointer-lock FPS) -----------------------------

const player = {
  pos: new THREE.Vector3(ROOMS[0].x, 1.7, ROOMS[0].z),
  yaw: 0,
  pitch: 0,
  height: 1.7,
  radius: 0.35,
  speed: 4.5,
};

camera.position.copy(player.pos);

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

const blocker = document.getElementById("blocker");
const infoPanel = document.getElementById("info-panel");

document.getElementById("play-btn").addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === renderer.domElement;
  blocker.style.display = locked ? "none" : "flex";
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  const sensitivity = 0.0022;
  player.yaw -= e.movementX * sensitivity;
  player.pitch -= e.movementY * sensitivity;
  const limit = Math.PI / 2 - 0.05;
  player.pitch = Math.max(-limit, Math.min(limit, player.pitch));
});

// ---- Movement + collision ---------------------------------------------

function resolveCollisions(newPos) {
  const r = player.radius;
  const feetY = newPos.y - player.height;
  const headY = newPos.y - 0.15;

  for (const box of wallColliders) {
    const overlapY = feetY < box.maxY && headY > box.minY;
    if (!overlapY) continue;

    const closestX = Math.max(box.minX, Math.min(newPos.x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(newPos.z, box.maxZ));
    const dx = newPos.x - closestX;
    const dz = newPos.z - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq < r * r) {
      if (distSq > 1e-8) {
        // Player center is outside the box: push out along the vector
        // to the closest point on its surface.
        const dist = Math.sqrt(distSq);
        const push = r - dist;
        newPos.x += (dx / dist) * push;
        newPos.z += (dz / dist) * push;
      } else {
        // Player center landed inside the box (thin wall, fast frame
        // step): push out along whichever axis needs the smallest move.
        const penX = (r + (box.maxX - box.minX) / 2) - Math.abs(newPos.x - (box.minX + box.maxX) / 2);
        const penZ = (r + (box.maxZ - box.minZ) / 2) - Math.abs(newPos.z - (box.minZ + box.maxZ) / 2);
        if (penX < penZ) {
          newPos.x += newPos.x < (box.minX + box.maxX) / 2 ? -penX : penX;
        } else {
          newPos.z += newPos.z < (box.minZ + box.maxZ) / 2 ? -penZ : penZ;
        }
      }
    }
  }
  return newPos;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (document.pointerLockElement === renderer.domElement) {
    // With camera.rotation.order = "YXZ" and rotation.y = yaw, the
    // camera looks toward (-sin(yaw), 0, -cos(yaw)) at pitch 0 — that's
    // the "forward" (W) direction. "Right" (D) is 90° clockwise from it.
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    let move = new THREE.Vector3();
    if (keys["KeyW"] || keys["ArrowUp"]) move.add(forward);
    if (keys["KeyS"] || keys["ArrowDown"]) move.sub(forward);
    if (keys["KeyA"] || keys["ArrowLeft"]) move.sub(right);
    if (keys["KeyD"] || keys["ArrowRight"]) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(player.speed * dt);
    }

    const newPos = player.pos.clone();
    newPos.x += move.x;
    newPos.z += move.z;

    resolveCollisions(newPos);
    newPos.y = player.height;

    player.pos.copy(newPos);

    camera.position.copy(player.pos);
    camera.rotation.order = "YXZ";
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
  }

  // Painting focus detection (for info panel)
  updateFocusedPainting();

  renderer.render(scene, camera);
}

// ---- Looking-at-painting info panel -------------------------------------

let focusedPainting = null;
const raycaster = new THREE.Raycaster();

function updateFocusedPainting() {
  if (document.pointerLockElement !== renderer.domElement) return;
  raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
  const targets = allPaintingMeshes.map((g) => g.children[1]); // canvas mesh
  const hits = raycaster.intersectObjects(targets, false);

  if (hits.length > 0 && hits[0].distance < 4) {
    const mesh = hits[0].object;
    const pgroup = mesh.parent;
    const p = pgroup.userData.painting;
    if (focusedPainting !== p) {
      focusedPainting = p;
      infoPanel.textContent = `#${p.id} — ${p.title}`;
      infoPanel.style.display = "block";
    }
  } else if (focusedPainting) {
    focusedPainting = null;
    infoPanel.style.display = "none";
  }
}

animate();
