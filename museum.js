// ---------------------------------------------------------------
// Museum — first-person walkthrough built with Three.js.
//
// Layout: 2 floors, 2 rooms each, connected by doorways and a ramp
// between floors. Numbered paintings hang on the walls (see
// paintings.js). Everything is placeholder geometry — no textures
// needed to test the layout and movement.
// ---------------------------------------------------------------

// ---- Room layout ------------------------------------------------
// Each room is a box in world space. Rooms are connected by gaps
// ("doorways") left open in shared walls.

const ROOM_SIZE = { w: 14, d: 14, h: 5 };
const WALL_T = 0.3;
const DOOR_W = 3.2;

// Room centers per floor. Room 0 and room 1 sit side by side on the
// x axis, connected by a doorway in the wall between them.
const ROOMS = [
  { x: -8, z: 0 }, // room 0
  { x: 8,  z: 0 }, // room 1
];
const FLOOR_HEIGHT = 6;

// ---- Renderer / scene / camera ----------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcd6c8);
scene.fog = new THREE.Fog(0xdcd6c8, 18, 40);

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
const trimMat = new THREE.MeshStandardMaterial({ color: 0x8c7b5f, roughness: 0.8 });

// ---- Collision boxes (AABB) ---------------------------------------
// Every solid wall segment registers a box here; the player capsule
// is tested against these each frame.

// Walls block horizontal movement; floor/ceiling slabs don't (vertical
// position is handled separately by groundHeightAt).
let wallColliders = [];

function addWallCollider(x, y, z, w, h, d) {
  const box = {
    minX: x - w / 2, maxX: x + w / 2,
    minY: y - h / 2, maxY: y + h / 2,
    minZ: z - d / 2, maxZ: z + d / 2,
  };
  wallColliders.push(box);
}

// ---- Room builder ---------------------------------------------------
//
// Builds a rectangular room centered at (cx, floorY, cz). `doors` is a
// map of which walls have a doorway gap in the middle:
// { north, south, east, west } -> boolean

function buildRoom(cx, floorY, cz, doors, group) {
  const { w, d, h } = ROOM_SIZE;
  const hw = w / 2, hd = d / 2;

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_T, d), floorMat);
  floor.position.set(cx, floorY - WALL_T / 2, cz);
  floor.receiveShadow = true;
  group.add(floor);
  // No collider for the floor slab itself — vertical position is
  // handled by groundHeightAt(), not by AABB collision.

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_T, d), ceilingMat);
  ceiling.position.set(cx, floorY + h, cz);
  group.add(ceiling);

  // Walls: north(-z) south(+z) west(-x) east(+x)
  const wallDefs = [
    { key: "north", axis: "x", len: w, pos: [cx, floorY + h / 2, cz - hd] },
    { key: "south", axis: "x", len: w, pos: [cx, floorY + h / 2, cz + hd] },
    { key: "west",  axis: "z", len: d, pos: [cx - hw, floorY + h / 2, cz] },
    { key: "east",  axis: "z", len: d, pos: [cx + hw, floorY + h / 2, cz] },
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

  addRoomLight(cx, floorY + h - 0.5, cz);
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

function buildPainting(p, floorY, group) {
  const room = ROOMS[p.room];
  const info = wallInfo(room, p.wall);
  const pw = 2.2, ph = 1.6, depth = 0.08;
  const eyeY = floorY + 2.4;

  const along = info.along;
  const usable = info.length - DOOR_W - pw; // keep clear of doorway gap area roughly
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

// ---- Build both floors -----------------------------------------------

const allPaintingMeshes = [];

for (let floor = 0; floor < 2; floor++) {
  const floorY = floor * FLOOR_HEIGHT;
  const group = new THREE.Group();
  group.userData.floor = floor;
  scene.add(group);

  // Room 0's south wall has a gap for the ramp shaft that connects
  // both floors (see "Stairs/ramp" below).
  buildRoom(ROOMS[0].x, floorY, ROOMS[0].z, { east: true, south: true }, group);
  buildRoom(ROOMS[1].x, floorY, ROOMS[1].z, { west: true }, group);

  for (const p of PAINTINGS) {
    if (p.floor !== floor) continue;
    const mesh = buildPainting(p, floorY, group);
    allPaintingMeshes.push(mesh);
  }
}

// ---- Stairs/ramp between floors (in room 0) ---------------------------
// A ramp that runs south from room 0's south wall doorway, climbing
// from the ground floor up to floor 1. It's centered on the same x as
// the doorway gap left in that wall (see buildRoom calls above) so the
// player can walk straight from the ramp into the room above.

{
  const rampLen = 8, rampW = DOOR_W - 0.2;
  const rampGroup = new THREE.Group();
  scene.add(rampGroup);

  const rampMat = new THREE.MeshStandardMaterial({ color: 0x9c8f76, roughness: 0.85 });
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(rampW, 0.3, rampLen), rampMat);
  const cx = ROOMS[0].x; // aligned with the south-wall doorway gap
  const cz = ROOMS[0].z + ROOM_SIZE.d / 2 + rampLen / 2;
  ramp.position.set(cx, FLOOR_HEIGHT / 2, cz);
  ramp.rotation.x = -Math.atan2(FLOOR_HEIGHT, rampLen);
  ramp.receiveShadow = true;
  rampGroup.add(ramp);

  // Low walls along the ramp's sides so the player can't step off it
  // mid-climb and fall through empty space.
  const railMat = new THREE.MeshStandardMaterial({ color: 0x8c7b5f, roughness: 0.8 });
  const railLen = Math.hypot(rampLen, FLOOR_HEIGHT);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, railLen), railMat);
    rail.position.set(cx + side * (rampW / 2 + 0.05), FLOOR_HEIGHT / 2 + 0.3, cz);
    rail.rotation.x = ramp.rotation.x;
    rampGroup.add(rail);
    addWallCollider(cx + side * (rampW / 2 + 0.05), FLOOR_HEIGHT / 2 + 2, cz, 0.15, 6, railLen);
  }

  window.__ramp = {
    x: cx, z: cz, halfW: rampW / 2, halfLen: rampLen / 2,
  };
}

// ---- Player controller (pointer-lock FPS) -----------------------------

const player = {
  pos: new THREE.Vector3(ROOMS[0].x + 3, 1.7, ROOMS[0].z),
  yaw: 0,
  pitch: 0,
  velocityY: 0,
  onGround: true,
  height: 1.7,
  radius: 0.35,
  speed: 4.5,
};

camera.position.copy(player.pos);

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

const blocker = document.getElementById("blocker");
const crosshair = document.getElementById("crosshair");
const infoPanel = document.getElementById("info-panel");

renderer.domElement.addEventListener("click", () => {
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

function groundHeightAt(x, z) {
  // Determine which floor's room the player is standing in, plus ramp.
  const ramp = window.__ramp;
  if (ramp) {
    const localZ = z - ramp.z;
    const localX = x - ramp.x;
    if (Math.abs(localX) < ramp.halfW && Math.abs(localZ) < ramp.halfLen) {
      const t = (localZ + ramp.halfLen) / (ramp.halfLen * 2); // 0..1 along ramp
      return t * FLOOR_HEIGHT;
    }
  }
  // Otherwise: ground floor is y=0, upper floor y=FLOOR_HEIGHT, choose
  // upper if player is roughly above upper-floor height already (i.e.
  // came from the ramp) — approximate with player's current pos.y.
  return player.pos.y - player.height > FLOOR_HEIGHT - 1.5 ? FLOOR_HEIGHT : 0;
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

    const groundY = groundHeightAt(newPos.x, newPos.z) + player.height;
    newPos.y = THREE.MathUtils.lerp(player.pos.y, groundY, Math.min(1, dt * 10));

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
