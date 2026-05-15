import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────────────
   MALARIA BIOMEDICAL 3D VISUALIZATION SYSTEM
   Inspired by:
   • Giemsa-stained blood smears (ring forms, schizonts)
   • Fluorescence microscopy (PfHSP70 / DAPI nuclear staining)
   • TEM cross-sections (digestive vacuole, hemozoin crystal)
   • Protein ribbon diagrams (ribosome / PfHSP70 structure)
   • Drug docking electrostatic potential maps
   • Computational parasitemia detection (RBC segmentation)
   All scenes are fully rotatable via mouse drag.
───────────────────────────────────────────────────────────────────────────── */

// ── PALETTE (drawn from actual microscopy imagery, NOT generic UI blue) ──────
const P = {
  bg:          "#06080C",
  panel:       "#0C1018",
  border:      "#1A2030",
  text:        "#D4C8B8",
  dim:         "#5A5048",
  // fluorescence channels
  dapi:        "#3A6FD8",   // DAPI nuclear blue
  hsp70:       "#E03030",   // PfHSP70 red
  msp1:        "#E85020",   // PfMSP1 orange-red
  // giemsa / brightfield
  rbc:         "#C87890",   // pink RBC cytoplasm
  parasite:    "#7020A0",   // deep violet parasite chromatin
  hemozoin:    "#8B6010",   // golden-brown hemozoin
  // TEM colors
  vacuole:     "#1A4A6A",
  crystal:     "#C8A020",
  membrane:    "#2060A0",
  // protein structure (rainbow N→C terminus like ribbon diagrams)
  nterm:       "#E04040",
  midA:        "#E08020",
  midB:        "#D0C020",
  midC:        "#20A040",
  midD:        "#2080C0",
  cterm:       "#6040C0",
  // electrostatic
  positive:    "#1A40C0",   // blue = positive (standard convention)
  negative:    "#C01A1A",   // red = negative
  neutral:     "#D0C8C0",
  // data viz
  infected:    "#C83028",
  healthy:     "#3A8040",
  exposed:     "#C87820",
  recovered:   "#2878C0",
};

// ── ORBIT CONTROL (mouse drag) ────────────────────────────────────────────────
function makeOrbitControl(camera, domEl, radius = 5) {
  let isDragging = false, prevX = 0, prevY = 0;
  let theta = 0.4, phi = 1.1;
  const update = () => {
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
  };
  update();
  const onDown = e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
  const onMove = e => {
    if (!isDragging) return;
    theta -= (e.clientX - prevX) * 0.008;
    phi = Math.max(0.2, Math.min(Math.PI - 0.2, phi + (e.clientY - prevY) * 0.008));
    prevX = e.clientX; prevY = e.clientY;
    update();
  };
  const onUp = () => { isDragging = false; };
  domEl.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  return { update, dispose: () => {
    domEl.removeEventListener("mousedown", onDown);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }};
}

// ── BASE THREE SCENE SETUP ────────────────────────────────────────────────────
function initScene(canvas, w, h, bgColor = 0x06080C) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(bgColor, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 1000);
  return { renderer, scene, camera };
}

// ── SHARED AXIS LABELS ────────────────────────────────────────────────────────
function addAxisArrows(scene, labels = ["X", "Y", "Z"], len = 1.5) {
  const dirs = [
    new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)
  ];
  const cols = [0xC83028, 0x3A8040, 0x2878C0];
  dirs.forEach((d, i) => {
    const arrow = new THREE.ArrowHelper(d, new THREE.Vector3(0,0,0), len, cols[i], 0.12, 0.07);
    scene.add(arrow);
  });
}

function hexToThree(hex) { return parseInt(hex.replace("#",""), 16); }

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 1 — GIEMSA BLOOD SMEAR 3D
   • Inspired by image 4: Giemsa-stained smear showing ring forms + schizont
   • 3D scatter: healthy RBCs as biconcave discs, infected cells elevated on Z,
     ring-form parasites as torus, schizont as burst sphere
════════════════════════════════════════════════════════════════════════════ */
function useGiemsa3D(canvasRef, params) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x06080C);

    // Ambient + directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const dir = new THREE.DirectionalLight(0xffeedd, 1.2);
    dir.position.set(3, 5, 3); scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0x8888ff, 0.4);
    dir2.position.set(-3, -2, -3); scene.add(dir2);

    const orbit = makeOrbitControl(camera, el, 9);

    // Grid floor
    const grid = new THREE.GridHelper(12, 24, 0x1A2030, 0x0F1520);
    grid.position.y = -2; scene.add(grid);
    addAxisArrows(scene);

    const rbcs = [];
    const N_HEALTHY = 180;
    const N_INFECTED = Math.floor(params.infectionLoad * 60);

    // Biconcave disc geometry for RBC
    const rbcGeo = new THREE.SphereGeometry(0.22, 12, 8);
    rbcGeo.scale(1, 0.38, 1);

    // Healthy RBCs scattered in XZ plane
    for (let i = 0; i < N_HEALTHY; i++) {
      const mat = new THREE.MeshPhongMaterial({
        color: hexToThree(P.rbc),
        specular: 0x441122,
        shininess: 30,
        transparent: true,
        opacity: 0.82,
      });
      const m = new THREE.Mesh(rbcGeo, mat);
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 4.5 + 0.3;
      m.position.set(Math.cos(ang) * r, (Math.random() - 0.5) * 0.3, Math.sin(ang) * r);
      m.rotation.x = Math.random() * 0.3;
      m.rotation.z = Math.random() * 0.3;
      scene.add(m);
      rbcs.push({ mesh: m, type: "healthy", phase: Math.random() * Math.PI * 2 });
    }

    // Infected RBCs — elevated on Y (data dimension), ring torus parasite inside
    const torusGeo = new THREE.TorusGeometry(0.07, 0.025, 6, 16);
    for (let i = 0; i < N_INFECTED; i++) {
      const infMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.rbc), emissive: 0x220010, shininess: 20, transparent: true, opacity: 0.9 });
      const cell = new THREE.Mesh(rbcGeo, infMat);
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 4.0 + 0.5;
      const infLevel = Math.random();
      cell.position.set(Math.cos(ang) * r, infLevel * 2.5 + 0.4, Math.sin(ang) * r);
      cell.rotation.x = Math.random() * 0.2;
      scene.add(cell);

      // Ring-form parasite (torus)
      const ringMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.parasite), emissive: 0x300060, shininess: 60 });
      const ring = new THREE.Mesh(torusGeo, ringMat);
      ring.position.copy(cell.position);
      ring.rotation.x = Math.PI / 4 + Math.random() * 0.5;
      scene.add(ring);
      rbcs.push({ mesh: cell, ring, type: "infected", phase: Math.random() * Math.PI * 2 });
    }

    // Schizont — burst sphere showing merozoites
    const schiGeo = new THREE.SphereGeometry(0.35, 14, 10);
    const schiMat = new THREE.MeshPhongMaterial({ color: 0x8B3080, emissive: 0x3A0040, wireframe: false, shininess: 40 });
    const schizont = new THREE.Mesh(schiGeo, schiMat);
    schizont.position.set(0.5, 2.8, 0.5);
    scene.add(schizont);
    // Merozoites around schizont
    for (let i = 0; i < 16; i++) {
      const mGeo = new THREE.SphereGeometry(0.05, 6, 5);
      const mMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.parasite), emissive: 0x200040, shininess: 80 });
      const mer = new THREE.Mesh(mGeo, mMat);
      const a = (i / 16) * Math.PI * 2;
      const b = Math.random() * Math.PI;
      mer.position.set(schizont.position.x + Math.sin(b) * Math.cos(a) * 0.55, schizont.position.y + Math.cos(b) * 0.55, schizont.position.z + Math.sin(b) * Math.sin(a) * 0.55);
      scene.add(mer);
    }

    // Hemozoin crystal (yellow-brown elongated box)
    const hGeo = new THREE.BoxGeometry(0.08, 0.22, 0.06);
    const hMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.hemozoin), emissive: 0x302000, shininess: 100 });
    const hemozoin = new THREE.Mesh(hGeo, hMat);
    hemozoin.position.set(0.5, 1.5, 0.5);
    scene.add(hemozoin);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      schizont.rotation.y = t * 0.3;
      hemozoin.rotation.y = t * 0.5;
      hemozoin.rotation.x = t * 0.3;
      renderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [params.infectionLoad]);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 2 — FLUORESCENCE MICROSCOPY 3D (DAPI + PfHSP70)
   • Inspired by image 2: blue DAPI nuclei + red PfHSP70/PfMSP1 protein signal
   • RBCs as transparent spheres; nuclei as dense blue inner spheres;
     PfHSP70 protein signal as volumetric red point cloud overlay
════════════════════════════════════════════════════════════════════════════ */
function useFluorescence3D(canvasRef, channel) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x010205);
    scene.add(new THREE.AmbientLight(0x111133, 0.5));
    const pt1 = new THREE.PointLight(hexToThree(P.dapi), 2, 15); pt1.position.set(-2, 2, 2); scene.add(pt1);
    const pt2 = new THREE.PointLight(hexToThree(P.hsp70), 2, 15); pt2.position.set(2, -2, -2); scene.add(pt2);

    const orbit = makeOrbitControl(camera, el, 8);
    addAxisArrows(scene);

    const proteinColor = channel === "HSP70" ? hexToThree(P.hsp70) : hexToThree(P.msp1);

    // Cells: transparent sphere + DAPI nucleus + protein signal cloud
    const positions = [
      [0,0,0], [-2.2,0.5,0.3], [2.1,-0.4,0.2], [-1.0,-1.8,0.8], [1.2,1.7,-0.5], [0.2,-0.5,2.0]
    ];

    positions.forEach(([x, y, z], idx) => {
      const isInfected = idx < 4;
      const cellR = 0.7 + Math.random() * 0.2;

      // Cell membrane — transparent
      const cellGeo = new THREE.SphereGeometry(cellR, 20, 16);
      const cellMat = new THREE.MeshPhongMaterial({
        color: 0x223355, transparent: true, opacity: 0.18,
        side: THREE.DoubleSide, depthWrite: false,
      });
      scene.add(new THREE.Mesh(cellGeo, cellMat)).position.set(x, y, z);

      // DAPI nucleus — bright blue inner sphere
      const nucR = cellR * (isInfected ? 0.38 : 0.42);
      const nucGeo = new THREE.SphereGeometry(nucR, 14, 12);
      const nucMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.dapi), emissive: 0x1030A0, shininess: 80 });
      const nuc = new THREE.Mesh(nucGeo, nucMat);
      nuc.position.set(x + (Math.random()-0.5)*0.1, y + (Math.random()-0.5)*0.1, z + (Math.random()-0.5)*0.1);
      scene.add(nuc);

      if (isInfected) {
        // Protein signal — point cloud of varying density
        const ptCount = channel === "HSP70" ? 300 : 200;
        const ptGeo = new THREE.BufferGeometry();
        const pts = new Float32Array(ptCount * 3);
        for (let i = 0; i < ptCount; i++) {
          const a = Math.random() * Math.PI * 2;
          const b = Math.random() * Math.PI;
          const r2 = nucR * 1.1 + Math.random() * (cellR - nucR * 1.1) * (channel === "HSP70" ? 0.9 : 0.6);
          pts[i*3]   = x + r2 * Math.sin(b) * Math.cos(a);
          pts[i*3+1] = y + r2 * Math.cos(b);
          pts[i*3+2] = z + r2 * Math.sin(b) * Math.sin(a);
        }
        ptGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
        const ptMat = new THREE.PointsMaterial({ color: proteinColor, size: 0.035, transparent: true, opacity: 0.75 });
        scene.add(new THREE.Points(ptGeo, ptMat));

        // Inner protein aggregate (brighter core)
        const coreGeo = new THREE.SphereGeometry(nucR * 0.5, 10, 8);
        const coreMat = new THREE.MeshPhongMaterial({ color: proteinColor, emissive: channel === "HSP70" ? 0x601010 : 0x701808, transparent: true, opacity: 0.7, shininess: 120 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(x, y, z);
        scene.add(core);
      }
    });

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.0005;
      pt1.intensity = 1.5 + Math.sin(t) * 0.5;
      pt2.intensity = 1.5 + Math.cos(t * 1.3) * 0.5;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [channel]);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 3 — PROTEIN RIBBON STRUCTURE (PfHSP70)
   • Inspired by images 3, 6, 7: multichain ribbon colored N→C terminus
   • Procedurally generated ribbon-like tube curves with proper rainbow coloring
   • Drug ligands shown as yellow stick models at binding sites
════════════════════════════════════════════════════════════════════════════ */
function useProteinRibbon3D(canvasRef, showDrug) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x080A0E);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(5, 8, 5); scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0x8888aa, 0.5); dir2.position.set(-5, -3, -5); scene.add(dir2);

    const orbit = makeOrbitControl(camera, el, 7);

    // Rainbow color N→C terminus (matches ribbon diagram)
    const ribbonColors = [
      "#E04040", "#E06020", "#E09020", "#D0C020", "#90C820",
      "#20A040", "#208070", "#2070B0", "#2050D0", "#4030C0",
      "#6030A0", "#8030A0"
    ];

    // Generate ribbon chains as tube curves
    const numChains = 12;
    for (let c = 0; c < numChains; c++) {
      const pts = [];
      let x = (Math.random()-0.5)*3, y = (Math.random()-0.5)*3, z = (Math.random()-0.5)*3;
      const numSeg = 18 + Math.floor(Math.random() * 14);
      for (let s = 0; s < numSeg; s++) {
        pts.push(new THREE.Vector3(x, y, z));
        // Walk with secondary structure preference (helices + sheets)
        const t2 = s / numSeg;
        const isHelix = (t2 > 0.2 && t2 < 0.45) || (t2 > 0.6 && t2 < 0.8);
        if (isHelix) {
          // Helical path
          const a = s * 0.6 + c * 0.8;
          x += Math.cos(a) * 0.18 + (Math.random()-0.5)*0.08;
          y += 0.15 + (Math.random()-0.5)*0.05;
          z += Math.sin(a) * 0.18 + (Math.random()-0.5)*0.08;
        } else {
          x += (Math.random()-0.5)*0.35;
          y += (Math.random()-0.5)*0.35;
          z += (Math.random()-0.5)*0.35;
        }
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, numSeg * 3, 0.028 + Math.random()*0.015, 6, false);
      const col = hexToThree(ribbonColors[c % ribbonColors.length]);
      const mat = new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.15, shininess: 60 });
      scene.add(new THREE.Mesh(tubeGeo, mat));
    }

    // Protein surface (translucent overall shape)
    const surfGeo = new THREE.SphereGeometry(2.2, 22, 18);
    const surfMat = new THREE.MeshPhongMaterial({
      color: 0xC8B0A8, transparent: true, opacity: 0.08,
      side: THREE.BackSide, depthWrite: false,
    });
    scene.add(new THREE.Mesh(surfGeo, surfMat));

    // Drug binding sites (yellow sticks at 3 regions, inspired by images 6-7)
    if (showDrug) {
      const bindingRegions = [
        { pos: [0.8, 2.0, -0.3], label: "Region 3" },
        { pos: [-1.2, 0.5, 0.8], label: "Region 2" },
        { pos: [0.3, -1.8, 0.5], label: "Region 1" },
      ];
      bindingRegions.forEach(({ pos }) => {
        // Ligand stick model (simplified)
        const stickGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6);
        const stickMat = new THREE.MeshPhongMaterial({ color: 0xD4C020, emissive: 0x403000, shininess: 100 });
        for (let i = 0; i < 4; i++) {
          const stick = new THREE.Mesh(stickGeo, stickMat);
          stick.position.set(pos[0] + (Math.random()-0.5)*0.3, pos[1] + (Math.random()-0.5)*0.3, pos[2] + (Math.random()-0.5)*0.3);
          stick.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
          scene.add(stick);
        }
        // Atom spheres at nodes
        for (let i = 0; i < 5; i++) {
          const aGeo = new THREE.SphereGeometry(0.04, 6, 5);
          const aMat = new THREE.MeshPhongMaterial({ color: i%2===0 ? 0xD4C020 : 0xC03020, emissive: 0x201000, shininess: 120 });
          const atom = new THREE.Mesh(aGeo, aMat);
          atom.position.set(pos[0]+(Math.random()-0.5)*0.35, pos[1]+(Math.random()-0.5)*0.35, pos[2]+(Math.random()-0.5)*0.35);
          scene.add(atom);
        }
        // Binding pocket highlight sphere
        const pGeo = new THREE.SphereGeometry(0.3, 12, 9);
        const pMat = new THREE.MeshPhongMaterial({ color: 0xD4C020, transparent: true, opacity: 0.12, depthWrite: false });
        const pocket = new THREE.Mesh(pGeo, pMat);
        pocket.position.set(...pos);
        scene.add(pocket);
      });
    }

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      scene.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [showDrug]);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 4 — TEM CROSS-SECTION 3D (Infected RBC ultrastructure)
   • Inspired by image 5: TEM of infected RBC showing digestive vacuole
     (blue membrane), hemozoin crystal (yellow-green), merozoite forming
   • 3D slice-through view, fully rotatable
════════════════════════════════════════════════════════════════════════════ */
function useTEM3D(canvasRef) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x03050A);
    scene.add(new THREE.AmbientLight(0x334455, 0.6));
    const pt = new THREE.PointLight(0x8BB8D8, 3, 12); pt.position.set(2, 2, 2); scene.add(pt);
    const pt2 = new THREE.PointLight(0xC8A020, 2, 8); pt2.position.set(-1, -1, 1); scene.add(pt2);

    const orbit = makeOrbitControl(camera, el, 6);

    // Host RBC outer membrane — translucent sphere
    const rbcGeo = new THREE.SphereGeometry(2.0, 24, 20);
    const rbcMat = new THREE.MeshPhongMaterial({ color: 0xC870A0, transparent: true, opacity: 0.12, side: THREE.FrontSide, depthWrite: false });
    scene.add(new THREE.Mesh(rbcGeo, rbcMat));

    // RBC inner cytoplasm — dense hemoglobin texture
    const cytoGeo = new THREE.SphereGeometry(1.92, 22, 18);
    const cytoMat = new THREE.MeshPhongMaterial({ color: 0x8840A0, transparent: true, opacity: 0.28, depthWrite: false });
    scene.add(new THREE.Mesh(cytoGeo, cytoMat));

    // Parasitophorous vacuole membrane (PVM) — offset sphere
    const pvmGeo = new THREE.SphereGeometry(1.1, 20, 16);
    const pvmMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.membrane), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const pvm = new THREE.Mesh(pvmGeo, pvmMat);
    pvm.position.set(-0.3, 0.1, 0); scene.add(pvm);

    // Parasite cytoplasm inside PVM
    const paraCytoGeo = new THREE.SphereGeometry(1.0, 18, 14);
    const paraCytoMat = new THREE.MeshPhongMaterial({ color: 0x1A3A5A, transparent: true, opacity: 0.55, depthWrite: false });
    const paraCyto = new THREE.Mesh(paraCytoGeo, paraCytoMat);
    paraCyto.position.copy(pvm.position); scene.add(paraCyto);

    // Digestive vacuole (DV) — smaller sphere within parasite (from TEM image)
    const dvGeo = new THREE.SphereGeometry(0.45, 14, 12);
    const dvMat = new THREE.MeshPhongMaterial({ color: 0x0A2035, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const dv = new THREE.Mesh(dvGeo, dvMat);
    dv.position.set(-0.25, 0.15, 0.1); scene.add(dv);

    // Hemozoin crystal inside DV — elongated box, golden (image 5 key feature)
    const hemGeo = new THREE.BoxGeometry(0.12, 0.38, 0.08);
    const hemMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.crystal), emissive: 0x503000, shininess: 150, specular: 0xFFCC44 });
    const hem = new THREE.Mesh(hemGeo, hemMat);
    hem.position.set(-0.22, 0.12, 0.1);
    hem.rotation.z = 0.3; scene.add(hem);

    // Second hemozoin platelet
    const hem2 = hem.clone();
    hem2.position.set(-0.32, 0.0, 0.15);
    hem2.rotation.z = -0.5; scene.add(hem2);

    // Nucleus (DAPI-blue core)
    const nucGeo = new THREE.SphereGeometry(0.28, 12, 10);
    const nucMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.dapi), emissive: 0x102080, shininess: 60 });
    const nuc = new THREE.Mesh(nucGeo, nucMat);
    nuc.position.set(-0.1, -0.3, 0.2); scene.add(nuc);

    // Ribosomes (tiny dots scattered in parasite cytoplasm)
    const ribGeo = new THREE.SphereGeometry(0.03, 5, 4);
    const ribMat = new THREE.MeshPhongMaterial({ color: 0xD0B080, shininess: 80 });
    for (let i = 0; i < 40; i++) {
      const rib = new THREE.Mesh(ribGeo, ribMat);
      const a = Math.random()*Math.PI*2, b = Math.random()*Math.PI, r = Math.random()*0.8;
      rib.position.set(-0.3 + r*Math.sin(b)*Math.cos(a), 0.1 + r*Math.cos(b), r*Math.sin(b)*Math.sin(a));
      scene.add(rib);
    }

    // Knobs on RBC surface (P.falciparum exports PfEMP1 to surface)
    const knobGeo = new THREE.SphereGeometry(0.05, 6, 5);
    const knobMat = new THREE.MeshPhongMaterial({ color: 0xA04060, shininess: 80 });
    for (let i = 0; i < 30; i++) {
      const knob = new THREE.Mesh(knobGeo, knobMat);
      const a = Math.random()*Math.PI*2, b = Math.random()*Math.PI;
      knob.position.set(2.05*Math.sin(b)*Math.cos(a), 2.05*Math.cos(b), 2.05*Math.sin(b)*Math.sin(a));
      scene.add(knob);
    }

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      hem.rotation.y = t * 0.4;
      hem2.rotation.y = -t * 0.3;
      pt.intensity = 2.5 + Math.sin(t * 0.7) * 0.5;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, []);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 5 — SEIR DYNAMICS ON 3D XYZ PLANE (rotatable)
   • Time on X, infection density on Y, cell population on Z
   • SEIR trajectories rendered as 3D tube paths with colored lines per compartment
════════════════════════════════════════════════════════════════════════════ */
function useSEIR3D(canvasRef, params) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x04060C);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9); dir.position.set(5,8,5); scene.add(dir);

    const orbit = makeOrbitControl(camera, el, 9);

    // Grid planes for axes
    const gridXZ = new THREE.GridHelper(8, 20, 0x1A2030, 0x0F1520); gridXZ.position.y = -0.1; scene.add(gridXZ);
    const gridXY = new THREE.GridHelper(8, 20, 0x1A2030, 0x0F1520); gridXY.rotation.x = Math.PI/2; gridXY.position.z = -4; scene.add(gridXY);

    addAxisArrows(scene, ["TIME", "INFECTED", "POPULATION"], 2.5);

    // SEIR simulation
    const beta = 0.42 * params.infectionLoad;
    const sigma = 1/12, gamma = (1/14) * params.immuneStrength;
    let S=9800, E=100, I=100, R=0;
    const N=10000, steps=90;
    const sData=[], eData=[], iData=[], rData=[];
    for (let t=0; t<steps; t++) {
      sData.push({t,v:S}); eData.push({t,v:E}); iData.push({t,v:I}); rData.push({t,v:R});
      const dS = -beta*S*I/N, dE = beta*S*I/N - sigma*E, dI = sigma*E - gamma*I, dR = gamma*I;
      S=Math.max(0,S+dS*2); E=Math.max(0,E+dE*2); I=Math.max(0,I+dI*2); R=Math.max(0,R+dR*2);
    }

    const scaleT = t => (t/steps)*7 - 3.5;
    const scaleV = v => (v/N)*5 - 0.5;

    const makeTrajectory = (data, color, zOff=0) => {
      const pts = data.map(d => new THREE.Vector3(scaleT(d.t), scaleV(d.v), zOff));
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, steps*2, 0.03, 5, false);
      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3, shininess: 80 });
      scene.add(new THREE.Mesh(geo, mat));
    };

    makeTrajectory(sData, hexToThree(P.recovered), -0.5);
    makeTrajectory(eData, hexToThree(P.exposed), 0);
    makeTrajectory(iData, hexToThree(P.infected), 0.5);
    makeTrajectory(rData, hexToThree(P.healthy), 1.0);

    // Vertical spikes from infected peak to Z axis (visual emphasis)
    const peakIdx = iData.reduce((mi,d,i,a) => d.v > a[mi].v ? i : mi, 0);
    const pk = iData[peakIdx];
    const spGeo = new THREE.CylinderGeometry(0.015, 0.015, scaleV(pk.v) + 0.5 + 0.1, 6);
    const spMat = new THREE.MeshPhongMaterial({ color: hexToThree(P.infected), transparent: true, opacity: 0.6 });
    const spike = new THREE.Mesh(spGeo, spMat);
    spike.position.set(scaleT(pk.t), (scaleV(pk.v)-0.5)/2, 0.5);
    scene.add(spike);

    // Floating data labels as thin planes
    const labelGeo = new THREE.PlaneGeometry(1.0, 0.22);
    [
      { pos: [scaleT(steps*0.05), scaleV(sData[4].v) + 0.2, -0.5], col: hexToThree(P.recovered) },
      { pos: [scaleT(steps*0.3), scaleV(eData[27].v) + 0.2, 0], col: hexToThree(P.exposed) },
      { pos: [scaleT(pk.t), scaleV(pk.v) + 0.25, 0.5], col: hexToThree(P.infected) },
    ].forEach(({pos, col}) => {
      const lMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const lp = new THREE.Mesh(labelGeo, lMat);
      lp.position.set(...pos);
      scene.add(lp);
    });

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [params.infectionLoad, params.immuneStrength]);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 6 — ELECTROSTATIC DRUG DOCKING (PfHSP70 binding pocket)
   • Inspired by images 6c-f: electrostatic surface (blue=+, red=-)
   • 3D protein surface with electrostatic coloring + ligand sticks
════════════════════════════════════════════════════════════════════════════ */
function useElectrostatic3D(canvasRef, compound) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x06080E);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(4,6,4); scene.add(dir);

    const orbit = makeOrbitControl(camera, el, 5);

    // Protein binding pocket surface — irregular mesh colored by electrostatic potential
    const geo = new THREE.SphereGeometry(1.8, 32, 28);
    // Deform geometry to look like a pocket
    const pos = geo.attributes.position;
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // Electrostatic potential function (simplified): positive near top, negative near sides
      const potential = Math.sin(x*2.5)*Math.cos(y*2)*0.5 + Math.sin(z*2)*0.4 + y*0.3;
      // Color: blue=positive, white=neutral, red=negative (standard in molecular visualization)
      const t = (potential + 1) / 2;
      const r = t < 0.5 ? t*2*0.8 : 0.8 + (t-0.5)*2*0.4;
      const g = t < 0.5 ? t*2*0.8 : (1-t)*2*0.8;
      const b = t < 0.5 ? 0.8 + (0.5-t)*2*0.4 : (1-t)*2*0.8;
      colors.push(r, g, b);
      // Deform surface slightly for pocket look
      const warp = 1 + 0.12 * (Math.sin(x*3+y*2) * Math.cos(z*2.5));
      pos.setXYZ(i, x*warp, y*warp, z*warp);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.85, shininess: 40, specular: 0x444466 });
    scene.add(new THREE.Mesh(geo, mat));

    // Binding pocket cavity — cut-out region
    const cavGeo = new THREE.SphereGeometry(0.55, 14, 12);
    const cavMat = new THREE.MeshPhongMaterial({ color: 0x050810, transparent: true, opacity: 0.9 });
    const cav = new THREE.Mesh(cavGeo, cavMat);
    cav.position.set(0.6, -0.8, 0.3); scene.add(cav);

    // Ligand inside pocket
    const compoundData = {
      "18": { color: 0xD4C020, atoms: 8, rings: 2 },
      "19": { color: 0xD0A030, atoms: 6, rings: 1 },
      "20": { color: 0xC8D030, atoms: 7, rings: 2 },
      "28": { color: 0xE0B020, atoms: 9, rings: 3 },
    };
    const comp = compoundData[compound] || compoundData["18"];

    // Rings of ligand
    for (let ri = 0; ri < comp.rings; ri++) {
      const ringGeo = new THREE.TorusGeometry(0.18 + ri*0.06, 0.025, 6, 16);
      const ringMat = new THREE.MeshPhongMaterial({ color: comp.color, emissive: 0x303000, shininess: 120 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0.6 + ri*0.15, -0.8, 0.3);
      ring.rotation.x = ri * 0.5 + 0.3;
      ring.rotation.y = ri * 0.4;
      scene.add(ring);
    }

    // Atom spheres
    for (let a = 0; a < comp.atoms; a++) {
      const aGeo = new THREE.SphereGeometry(0.045, 7, 6);
      const aCol = [comp.color, 0xC03020, 0x2040C0, 0x20B020][a%4];
      const aMat = new THREE.MeshPhongMaterial({ color: aCol, shininess: 140, specular: 0xffffff });
      const atom = new THREE.Mesh(aGeo, aMat);
      const ang = (a / comp.atoms) * Math.PI * 2;
      atom.position.set(0.6 + Math.cos(ang)*0.25, -0.8 + (Math.random()-0.5)*0.2, 0.3 + Math.sin(ang)*0.25);
      scene.add(atom);
    }

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      scene.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [compound]);
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 7 — PARASITEMIA DETECTION 3D (computational segmentation)
   • Inspired by image 1: computational RBC segmentation (pink blobs, magenta spots)
   • 3D scatter of segmented cells, infected ones elevated + glowing
════════════════════════════════════════════════════════════════════════════ */
function useSegmentation3D(canvasRef, params) {
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const { renderer, scene, camera } = initScene(el, W, H, 0x04060A);
    scene.add(new THREE.AmbientLight(0xffeedd, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(4,6,3); scene.add(dir);

    const orbit = makeOrbitControl(camera, el, 9);
    addAxisArrows(scene);

    const N = 60;
    const parasitemia = params.infectionLoad * 0.7;

    for (let i = 0; i < N; i++) {
      const infected = Math.random() < parasitemia;
      const size = 0.18 + Math.random() * 0.12;
      // Segmented cell blob (slightly irregular sphere)
      const geo = new THREE.SphereGeometry(size, 10, 8);
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        pos.setXYZ(j, pos.getX(j) * (1 + (Math.random()-0.5)*0.22), pos.getY(j) * (1 + (Math.random()-0.5)*0.18), pos.getZ(j) * (1 + (Math.random()-0.5)*0.22));
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhongMaterial({
        color: infected ? 0xD04080 : hexToThree(P.rbc),
        emissive: infected ? 0x501020 : 0x200808,
        shininess: infected ? 60 : 20,
        transparent: true,
        opacity: 0.88,
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = Math.random()*Math.PI*2, r = Math.random()*3.8+0.3;
      m.position.set(Math.cos(ang)*r, infected ? Math.random()*2+0.5 : (Math.random()-0.5)*0.4, Math.sin(ang)*r);
      scene.add(m);

      // Parasite spot inside infected cell (magenta bright sphere — matches image 1)
      if (infected) {
        const pGeo = new THREE.SphereGeometry(size*0.28, 7, 6);
        const pMat = new THREE.MeshPhongMaterial({ color: 0xCC10AA, emissive: 0x7A0060, shininess: 120, specular: 0xff80ff });
        const par = new THREE.Mesh(pGeo, pMat);
        par.position.copy(m.position).addScaledVector(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5), size*0.4);
        scene.add(par);
      }
    }

    // Confidence volume (translucent classification boundary)
    const confGeo = new THREE.SphereGeometry(2.2, 18, 14);
    const confMat = new THREE.MeshPhongMaterial({ color: 0xD04080, wireframe: true, transparent: true, opacity: 0.06 });
    scene.add(new THREE.Mesh(confGeo, confMat));

    let raf;
    const animate = () => { raf = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();
    return () => { cancelAnimationFrame(raf); orbit.dispose(); renderer.dispose(); };
  }, [params.infectionLoad]);
}

/* ════════════════════════════════════════════════════════════════════════════
   3D CANVAS WRAPPER
════════════════════════════════════════════════════════════════════════════ */
function ThreeCanvas({ hook, hookArgs = [], width = "100%", height = 340, label, sublabel }) {
  const canvasRef = useRef(null);
  hook(canvasRef, ...hookArgs);
  return (
    <div style={{ position: "relative", background: "#030507", borderRadius: 4, overflow: "hidden", border: `1px solid ${P.border}` }}>
      <canvas ref={canvasRef} style={{ width, height, display: "block" }} />
      <div style={{ position: "absolute", top: 10, left: 12, pointerEvents: "none" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#D4C8B8", fontFamily: "monospace", textTransform: "uppercase" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 8, color: "#5A5048", fontFamily: "monospace", marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 8, color: "#3A3028", fontFamily: "monospace", pointerEvents: "none" }}>DRAG TO ROTATE · SCROLL TO ZOOM</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════════════════════ */
export default function MalariaBiomedical3D() {
  const [activeTab, setActiveTab] = useState("smear");
  const [params, setParams] = useState({ infectionLoad: 0.55, immuneStrength: 0.7 });
  const [fluorChannel, setFluorChannel] = useState("HSP70");
  const [showDrug, setShowDrug] = useState(true);
  const [compound, setCompound] = useState("18");

  const tabs = [
    { id: "smear",    label: "GIEMSA SMEAR",     sub: "3D RBC scatter + ring forms" },
    { id: "fluor",    label: "FLUORESCENCE",      sub: "DAPI + PfHSP70 / PfMSP1" },
    { id: "tem",      label: "TEM CROSS-SECTION", sub: "Digestive vacuole · hemozoin" },
    { id: "seir",     label: "SEIR DYNAMICS",     sub: "3D infection trajectory" },
    { id: "protein",  label: "PROTEIN STRUCTURE", sub: "PfHSP70 ribbon + drug docking" },
    { id: "electro",  label: "ELECTROSTATIC",     sub: "Binding pocket potential map" },
    { id: "seg",      label: "SEGMENTATION",      sub: "Computational parasitemia" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "'Courier New', monospace" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #04060A; } ::-webkit-scrollbar-thumb { background: #1A2030; }
        canvas { cursor: grab; } canvas:active { cursor: grabbing; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 3px; background: #1A2030; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #8B6040; cursor: pointer; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${P.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: P.panel }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: 3, color: "#E8D8C8", textTransform: "uppercase" }}>Malaria Biomedical 3D Modeling System</div>
          <div style={{ fontSize: 9, color: P.dim, letterSpacing: 2, marginTop: 3 }}>P.FALCIPARUM CELLULAR SIMULATION · ALL SCENES INTERACTIVE + ROTATABLE</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 9, color: P.dim }}>PARASITEMIA <span style={{ color: "#C83028" }}>{(params.infectionLoad*65).toFixed(1)}%</span></div>
          <div style={{ fontSize: 9, color: P.dim }}>IMMUNE <span style={{ color: "#3A8040" }}>{(params.immuneStrength*100).toFixed(0)}%</span></div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3A8040", boxShadow: "0 0 8px #3A8040" }} />
        </div>
      </div>

      <div style={{ display: "flex" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ width: 200, background: P.panel, borderRight: `1px solid ${P.border}`, padding: "16px 0", minHeight: "calc(100vh - 57px)", flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                width: "100%", textAlign: "left", padding: "10px 16px",
                background: activeTab === t.id ? `${P.border}` : "transparent",
                border: "none", borderLeft: `2px solid ${activeTab === t.id ? "#8B6040" : "transparent"}`,
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <div style={{ fontSize: 9, color: activeTab === t.id ? "#D4B890" : "#5A5048", letterSpacing: 2 }}>{t.label}</div>
              <div style={{ fontSize: 8, color: activeTab === t.id ? "#7A6050" : "#302820", marginTop: 2, lineHeight: 1.4 }}>{t.sub}</div>
            </button>
          ))}

          {/* Global params */}
          <div style={{ padding: "20px 16px", borderTop: `1px solid ${P.border}`, marginTop: 10 }}>
            <div style={{ fontSize: 8, color: P.dim, letterSpacing: 2, marginBottom: 12 }}>GLOBAL PARAMS</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 8, color: P.dim }}>INFECTION β</span>
                <span style={{ fontSize: 8, color: "#C83028" }}>{params.infectionLoad.toFixed(2)}</span>
              </div>
              <input type="range" min={0.1} max={1} step={0.01} value={params.infectionLoad}
                onChange={e => setParams(p => ({ ...p, infectionLoad: +e.target.value }))}
                style={{ width: "100%", accentColor: "#C83028" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 8, color: P.dim }}>IMMUNE γ</span>
                <span style={{ fontSize: 8, color: "#3A8040" }}>{params.immuneStrength.toFixed(2)}</span>
              </div>
              <input type="range" min={0.1} max={1} step={0.01} value={params.immuneStrength}
                onChange={e => setParams(p => ({ ...p, immuneStrength: +e.target.value }))}
                style={{ width: "100%", accentColor: "#3A8040" }} />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto", animation: "fadeIn 0.3s ease" }} key={activeTab}>

          {/* ── GIEMSA SMEAR ── */}
          {activeTab === "smear" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 4 }}>GIEMSA-STAINED BLOOD SMEAR — 3D SPATIAL RECONSTRUCTION</div>
                <div style={{ fontSize: 9, color: P.dim }}>Biconcave RBCs scattered in XZ plane · Y-axis encodes infection severity · Ring-form tori · Schizont burst sphere · Hemozoin crystals (golden) · Merozoites radiating from schizont</div>
              </div>
              <ThreeCanvas hook={useGiemsa3D} hookArgs={[params]} height={500} label="GIEMSA 3D" sublabel="P.FALCIPARUM RING FORMS + SCHIZONT" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
                {[
                  { label: "Healthy RBC", shape: "Biconcave disc", color: P.rbc },
                  { label: "Ring form", shape: "Torus (Y = parasitemia)", color: P.parasite },
                  { label: "Schizont", shape: "Burst sphere + merozoites", color: "#8B3080" },
                  { label: "Hemozoin", shape: "Elongated crystal", color: P.hemozoin },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.color, marginBottom: 6 }} />
                    <div style={{ fontSize: 9, color: "#C4B4A4" }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: P.dim, marginTop: 2 }}>{k.shape}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FLUORESCENCE ── */}
          {activeTab === "fluor" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 6 }}>FLUORESCENCE MICROSCOPY — CONFOCAL 3D RECONSTRUCTION</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["HSP70", "MSP1"].map(ch => (
                    <button key={ch} onClick={() => setFluorChannel(ch)}
                      style={{
                        padding: "5px 14px", border: `1px solid ${fluorChannel === ch ? "#E03030" : P.border}`,
                        background: fluorChannel === ch ? "#E0303018" : "transparent",
                        color: fluorChannel === ch ? "#E03030" : P.dim,
                        borderRadius: 2, cursor: "pointer", fontSize: 9, fontFamily: "monospace", letterSpacing: 2,
                      }}>Pf{ch}</button>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: P.dim }}>Blue: DAPI nuclear stain · Red: Pf{fluorChannel} protein localization · Transparent shells: RBC membrane · Point clouds: protein distribution within parasite cytoplasm</div>
              </div>
              <ThreeCanvas hook={useFluorescence3D} hookArgs={[fluorChannel]} height={480} label={`FLUORESCENCE · Pf${fluorChannel} + DAPI`} sublabel="CONFOCAL Z-STACK SIMULATION" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                {[
                  { label: "DAPI (nuclear)", color: P.dapi, desc: "DNA-binding stain. Blue signal = nucleus. Bright in early ring stage, fragmented in schizont." },
                  { label: `Pf${fluorChannel}`, color: P.hsp70, desc: fluorChannel === "HSP70" ? "Heat shock protein 70 — parasite chaperone, exported to host cell. Red punctate signal." : "Merozoite surface protein 1 — outer merozoite coat. Red signal in late stages." },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "12px 14px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: k.color, boxShadow: `0 0 6px ${k.color}` }} />
                      <span style={{ fontSize: 9, color: "#C4B4A4", letterSpacing: 1 }}>{k.label}</span>
                    </div>
                    <div style={{ fontSize: 8, color: P.dim, lineHeight: 1.5 }}>{k.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEM ── */}
          {activeTab === "tem" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 4 }}>TEM ULTRASTRUCTURE — INFECTED RBC CROSS-SECTION</div>
                <div style={{ fontSize: 9, color: P.dim }}>Based on transmission electron microscopy of P.falciparum-infected RBC. Digestive vacuole contains hemozoin crystal (golden). PVM encloses parasite. Knobs visible on outer membrane surface.</div>
              </div>
              <ThreeCanvas hook={useTEM3D} hookArgs={[]} height={520} label="TEM CROSS-SECTION" sublabel="DIGESTIVE VACUOLE · HEMOZOIN · PVM" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 12 }}>
                {[
                  { label: "Host RBC", color: "#C870A0", desc: "Outer membrane" },
                  { label: "PVM", color: P.membrane, desc: "Parasitophorous vacuole" },
                  { label: "Hemozoin", color: P.crystal, desc: "Heme crystal in DV" },
                  { label: "Nucleus", color: P.dapi, desc: "Parasite DNA" },
                  { label: "Knobs", color: "#A04060", desc: "PfEMP1 surface export" },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "8px 10px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: k.color, marginBottom: 5 }} />
                    <div style={{ fontSize: 9, color: "#C4B4A4" }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: P.dim, marginTop: 2 }}>{k.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SEIR ── */}
          {activeTab === "seir" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 4 }}>SEIR INFECTION DYNAMICS — 3D XYZ TRAJECTORY</div>
                <div style={{ fontSize: 9, color: P.dim }}>X = Time (days) · Y = Compartment size · Z = Compartment offset. Four SEIR trajectories rendered as tube paths. Adjust parameters in sidebar to reshape infection curves in real-time.</div>
              </div>
              <ThreeCanvas hook={useSEIR3D} hookArgs={[params]} height={500} label="SEIR 3D TRAJECTORY" sublabel="SUSCEPTIBLE · EXPOSED · INFECTED · RECOVERED" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
                {[
                  { label: "S — Susceptible", color: P.recovered, val: "Healthy uninfected RBC" },
                  { label: "E — Exposed", color: P.exposed, val: "Sporozoite invasion phase" },
                  { label: "I — Infected", color: P.infected, val: "Active ring / trophozoite" },
                  { label: "R — Recovered", color: P.healthy, val: "Cleared / immune response" },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: `1px solid ${P.border}`, borderLeft: `3px solid ${k.color}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ fontSize: 9, color: k.color, letterSpacing: 1 }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: P.dim, marginTop: 4 }}>{k.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROTEIN ── */}
          {activeTab === "protein" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 6 }}>PfHSP70 PROTEIN STRUCTURE — RIBBON DIAGRAM</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: P.dim }}>DRUG BINDING:</span>
                  <button onClick={() => setShowDrug(s => !s)}
                    style={{ padding: "4px 12px", border: `1px solid ${showDrug ? "#D4C020" : P.border}`, background: showDrug ? "#D4C02018" : "transparent", color: showDrug ? "#D4C020" : P.dim, borderRadius: 2, cursor: "pointer", fontSize: 9, fontFamily: "monospace" }}>
                    {showDrug ? "LIGANDS VISIBLE" : "SHOW LIGANDS"}
                  </button>
                </div>
                <div style={{ fontSize: 9, color: P.dim }}>Rainbow N→C terminus coloring (red=N-term, blue/purple=C-term). Three drug binding regions labeled. Yellow stick ligands at binding pockets. Auto-rotates.</div>
              </div>
              <ThreeCanvas hook={useProteinRibbon3D} hookArgs={[showDrug]} height={520} label="PfHSP70 RIBBON" sublabel="MULTICHAIN · N→C RAINBOW · DRUG BINDING SITES" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                {[
                  { col: "#E04040", label: "N-terminus", desc: "Chain entry point, ATPase domain" },
                  { col: "#D0C020", label: "Ligands (yellow)", desc: "Drug compounds 18, 19, 20, 28" },
                  { col: "#6040C0", label: "C-terminus", desc: "Substrate binding domain" },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ width: 28, height: 4, background: k.col, marginBottom: 6, borderRadius: 2 }} />
                    <div style={{ fontSize: 9, color: "#C4B4A4" }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: P.dim, marginTop: 3 }}>{k.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ELECTROSTATIC ── */}
          {activeTab === "electro" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 6 }}>ELECTROSTATIC POTENTIAL — BINDING POCKET SURFACE</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: P.dim }}>COMPOUND:</span>
                  {["18","19","20","28"].map(c => (
                    <button key={c} onClick={() => setCompound(c)}
                      style={{ padding: "4px 10px", border: `1px solid ${compound===c ? "#D4C020" : P.border}`, background: compound===c ? "#D4C02015" : "transparent", color: compound===c ? "#D4C020" : P.dim, borderRadius: 2, cursor: "pointer", fontSize: 9, fontFamily: "monospace" }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: P.dim }}>Blue = electropositive surface · Red = electronegative · White = neutral. Yellow ligand sticks shown in binding cavity. Standard molecular visualization convention (APBS/PyMOL).</div>
              </div>
              <ThreeCanvas hook={useElectrostatic3D} hookArgs={[compound]} height={500} label={`ELECTROSTATIC — COMPOUND ${compound}`} sublabel="PfHSP70 BINDING POCKET · APBS POTENTIAL" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                {[
                  { col: P.positive, label: "Electropositive (+)", desc: "Favors negatively charged/polar drug moieties" },
                  { col: "#D0C8C0", label: "Neutral", desc: "Hydrophobic core of binding pocket" },
                  { col: P.negative, label: "Electronegative (−)", desc: "Favors cationic / H-bond donor groups" },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: k.col, marginBottom: 6 }} />
                    <div style={{ fontSize: 9, color: "#C4B4A4" }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: P.dim, marginTop: 3 }}>{k.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SEGMENTATION ── */}
          {activeTab === "seg" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#D4B890", letterSpacing: 3, marginBottom: 4 }}>COMPUTATIONAL PARASITEMIA DETECTION — 3D SEGMENTATION</div>
                <div style={{ fontSize: 9, color: P.dim }}>Directly inspired by image 1(a)/(b) segmentation output. Pink blobs = healthy RBC segments. Elevated magenta cells = classified infected. Bright magenta inner sphere = detected parasite chromatin spot. Y-axis = classification confidence score.</div>
              </div>
              <ThreeCanvas hook={useSegmentation3D} hookArgs={[params]} height={500} label="SEGMENTATION 3D" sublabel="ML PARASITEMIA DETECTION · Y = CONFIDENCE" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                {[
                  { col: P.rbc, label: "Healthy RBC (classified)", desc: "Y ≈ 0. Normal biconcave morphology. Low signal intensity. No parasite inclusion detected." },
                  { col: "#D04080", label: "Infected RBC (classified)", desc: "Y > 0.5 (confidence). Enlarged, irregular boundary. Bright magenta parasite inclusion visible." },
                ].map((k, i) => (
                  <div key={i} style={{ padding: "12px 14px", border: `1px solid ${P.border}`, borderRadius: 3, background: P.panel, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: k.col, flexShrink: 0, marginTop: 2, boxShadow: `0 0 8px ${k.col}` }} />
                    <div>
                      <div style={{ fontSize: 9, color: "#C4B4A4", marginBottom: 4 }}>{k.label}</div>
                      <div style={{ fontSize: 8, color: P.dim, lineHeight: 1.5 }}>{k.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
