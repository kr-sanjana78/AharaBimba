import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Scan, Smartphone, Camera, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ThreeHeroScene({ onStartScan, isDarkMode }) {
  const mountRef = useRef(null);
  const [isScanningActive, setIsScanningActive] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const bgColor = isDarkMode ? 0x0f172a : 0xf8fafc;
    scene.fog = new THREE.FogExp2(bgColor, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.9 : 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xdbeafe, 2.4);
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x3b82f6, 2.5);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const accentPointLight = new THREE.PointLight(0x60a5fa, 3.2, 12);
    accentPointLight.position.set(0, 0.5, 2.5);
    scene.add(accentPointLight);

    // Root Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Packaged Food Box (Clean White & Royal Blue Modern Packaging)
    const boxGroup = new THREE.Group();
    worldGroup.add(boxGroup);

    // Main Box Body
    const boxGeo = new THREE.BoxGeometry(1.6, 2.5, 0.9, 10, 10, 10);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    });
    const packageMesh = new THREE.Mesh(boxGeo, boxMat);
    packageMesh.castShadow = true;
    packageMesh.receiveShadow = true;
    boxGroup.add(packageMesh);

    // Blue Top Fold
    const topFoldGeo = new THREE.BoxGeometry(1.64, 0.16, 0.16);
    const topFoldMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.6,
      roughness: 0.2
    });
    const topFold = new THREE.Mesh(topFoldGeo, topFoldMat);
    topFold.position.y = 1.32;
    boxGroup.add(topFold);

    // Front AharaBimba Label Canvas Texture
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 640;
    const ctx = labelCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 640);

    // Blue Header Banner
    const gradient = ctx.createLinearGradient(0, 0, 512, 140);
    gradient.addColorStop(0, '#1D4ED8');
    gradient.addColorStop(1, '#2563EB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 145);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AHARABIMBA', 256, 60);
    ctx.font = '600 17px sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Know What You Eat, Before You Eat!', 256, 98);

    // Green Dot Veg Symbol
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 165, 38, 38);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(55, 184, 11, 0, Math.PI * 2);
    ctx.fill();

    // Dietary Badges
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• 100% TRANSPARENT LABEL', 90, 180);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Zero Hidden Sugar • Verified Ingredients', 90, 202);

    // Barcode & Date Section
    ctx.fillStyle = '#eff6ff';
    ctx.fillRect(36, 230, 440, 160);
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('EXP DATE: 24/11/2026 (Fresh)', 50, 265);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('CONTAINS: Rolled Oats, Almonds, Milk Solids', 50, 295);
    ctx.fillText('BATCH: AB-2026 • NET WT: 400g', 50, 325);
    ctx.fillText('MFD: 12/03/2026 • MRP ₹199.00', 50, 355);

    // Blue Voice & Indic Language Banner
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(36, 420, 440, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ಆಹಾರಬಿಂಬ • AharaBimba', 256, 465);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#dbeafe';
    ctx.fillText('Smart Food-Label Assistant', 256, 505);
    ctx.font = '16px sans-serif';
    ctx.fillText('ಕನ್ನಡ • हिन्दी • தமிழ் • తెలుగు • English', 256, 545);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelGeo = new THREE.PlaneGeometry(1.45, 2.2);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.35,
      metalness: 0.05
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.46;
    boxGroup.add(labelMesh);

    // 2. Holographic Electric Blue Laser Scanning Ring
    const scanRingGeo = new THREE.TorusGeometry(1.4, 0.025, 16, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    boxGroup.add(scanRing);

    // Laser plane sheet
    const laserPlaneGeo = new THREE.PlaneGeometry(2.2, 1.4);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });
    const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserPlane.rotation.x = Math.PI / 2;
    boxGroup.add(laserPlane);

    // 3. Orbiting 3D Food Elements
    const orbitingGroup = new THREE.Group();
    worldGroup.add(orbitingGroup);

    // (A) 3D Avocado
    const avocadoGroup = new THREE.Group();
    const avoBodyGeo = new THREE.SphereGeometry(0.35, 24, 24);
    avoBodyGeo.scale(1, 1.35, 0.9);
    const avoSkinMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.6 });
    const avoBody = new THREE.Mesh(avoBodyGeo, avoSkinMat);
    avocadoGroup.add(avoBody);

    const avoFleshGeo = new THREE.SphereGeometry(0.32, 24, 24);
    avoFleshGeo.scale(0.95, 1.3, 0.85);
    const avoFleshMat = new THREE.MeshStandardMaterial({ color: 0xc8d77d, roughness: 0.4 });
    const avoFlesh = new THREE.Mesh(avoFleshGeo, avoFleshMat);
    avoFlesh.position.z = 0.06;
    avocadoGroup.add(avoFlesh);

    const avoPitGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const avoPitMat = new THREE.MeshStandardMaterial({ color: 0x5c3818, roughness: 0.3 });
    const avoPit = new THREE.Mesh(avoPitGeo, avoPitMat);
    avoPit.position.set(0, -0.05, 0.22);
    avocadoGroup.add(avoPit);
    avocadoGroup.position.set(2.4, 0.8, 0.5);
    orbitingGroup.add(avocadoGroup);

    // (B) 3D Strawberry
    const berryGroup = new THREE.Group();
    const berryGeo = new THREE.ConeGeometry(0.28, 0.55, 20);
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const berry = new THREE.Mesh(berryGeo, berryMat);
    berry.rotation.x = Math.PI;
    berryGroup.add(berry);

    const calyxGeo = new THREE.ConeGeometry(0.32, 0.08, 6);
    const calyxMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const calyx = new THREE.Mesh(calyxGeo, calyxMat);
    calyx.position.y = 0.28;
    berryGroup.add(calyx);
    berryGroup.position.set(-2.3, 1.0, 0.2);
    orbitingGroup.add(berryGroup);

    // (C) 3D Almond Nut
    const almondGroup = new THREE.Group();
    const almondGeo = new THREE.SphereGeometry(0.24, 20, 20);
    almondGeo.scale(0.8, 1.5, 0.45);
    const almondMat = new THREE.MeshStandardMaterial({ color: 0xb07d4f, roughness: 0.7 });
    const almond = new THREE.Mesh(almondGeo, almondMat);
    almond.rotation.z = 0.4;
    almondGroup.add(almond);
    almondGroup.position.set(-2.0, -1.2, 0.8);
    orbitingGroup.add(almondGroup);

    // (D) Golden Wheat Stalk
    const wheatGroup = new THREE.Group();
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const wheatGoldMat = new THREE.MeshStandardMaterial({ color: 0xddb862, roughness: 0.4, metalness: 0.2 });
    const stem = new THREE.Mesh(stemGeo, wheatGoldMat);
    wheatGroup.add(stem);

    for (let i = 0; i < 7; i++) {
      const grainGeo = new THREE.SphereGeometry(0.08, 12, 12);
      grainGeo.scale(0.7, 1.6, 0.6);
      const grainL = new THREE.Mesh(grainGeo, wheatGoldMat);
      grainL.position.set(-0.08, -0.3 + i * 0.12, 0);
      grainL.rotation.z = 0.6;
      wheatGroup.add(grainL);

      const grainR = new THREE.Mesh(grainGeo, wheatGoldMat);
      grainR.position.set(0.08, -0.3 + i * 0.12, 0);
      grainR.rotation.z = -0.6;
      wheatGroup.add(grainR);
    }
    wheatGroup.position.set(2.2, -1.0, -0.3);
    wheatGroup.rotation.z = -0.25;
    orbitingGroup.add(wheatGroup);

    // 4. Blue Particle Cloud
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.045,
      transparent: true,
      opacity: isDarkMode ? 0.7 : 0.45
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(particleCloud);

    // Mouse Tracking Parallax
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.25;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const touchX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const touchY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = touchX * 0.55;
        targetRotX = -touchY * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const startTime = performance.now() * 0.001;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() * 0.001) - startTime;

      currentRotY += (targetRotY - currentRotY) * 0.05;
      currentRotX += (targetRotX - currentRotX) * 0.05;

      boxGroup.rotation.y = currentRotY + Math.sin(elapsedTime * 0.8) * 0.08;
      boxGroup.rotation.x = currentRotX + Math.cos(elapsedTime * 0.6) * 0.05;
      boxGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.1;

      if (isScanningActive) {
        const scanY = Math.sin(elapsedTime * 2.2) * 1.15;
        scanRing.position.y = scanY;
        laserPlane.position.y = scanY;
        scanRingMat.opacity = 0.5 + Math.sin(elapsedTime * 6.0) * 0.35;
      }

      orbitingGroup.rotation.y = elapsedTime * 0.15;
      avocadoGroup.rotation.y = elapsedTime * 0.8;
      berryGroup.rotation.y = -elapsedTime * 0.9;
      almondGroup.rotation.z = elapsedTime * 0.6;
      wheatGroup.rotation.x = Math.cos(elapsedTime * 0.7) * 0.15;

      particleCloud.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      [boxGeo, topFoldGeo, labelGeo, scanRingGeo, laserPlaneGeo, avoBodyGeo, avoFleshGeo, avoPitGeo, berryGeo, calyxGeo, almondGeo, stemGeo, particleGeo].forEach(g => g.dispose());
      [boxMat, topFoldMat, labelMat, scanRingMat, laserPlaneMat, avoSkinMat, avoFleshMat, avoPitMat, berryMat, calyxMat, almondMat, wheatGoldMat, particleMat].forEach(m => m.dispose());
      labelTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isScanningActive, isDarkMode]);

  return (
    <div className={`relative w-full h-[360px] sm:h-[460px] lg:h-[580px] rounded-3xl overflow-hidden border transition-all ${
      isDarkMode
        ? 'bg-slate-900/95 border-blue-500/20 shadow-2xl'
        : 'bg-white border-blue-100 shadow-xl'
    }`}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Label: Scanning Phone & Packaged Product */}
      <div className={`absolute top-4 left-4 flex items-center gap-2.5 backdrop-blur-md px-3.5 py-2 rounded-2xl border shadow-md pointer-events-none ${
        isDarkMode
          ? 'bg-slate-900/85 border-blue-500/30 text-white'
          : 'bg-white/95 border-blue-200 text-slate-800'
      }`}>
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
            <span>Phone Scanner Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </p>
          <p className="text-[11px] opacity-75">Interactive 3D Product & Label</p>
        </div>
      </div>

      {/* Floating Ingredient Cards (Visual illustration requested by prompt) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
        {/* Ingredient Card 1: Sugar */}
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm flex items-center gap-2 text-xs font-bold animate-bounce ${
          isDarkMode ? 'border-rose-800 bg-rose-950/85 text-rose-300' : 'border-rose-200 bg-white/95 text-rose-700'
        }`} style={{ animationDuration: '3s' }}>
          <span>🍬 Added Sugar: 18g</span>
        </div>

        {/* Ingredient Card 2: Palm Oil */}
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm flex items-center gap-2 text-xs font-bold ${
          isDarkMode ? 'border-amber-800 bg-amber-950/85 text-amber-300' : 'border-amber-200 bg-white/95 text-amber-700'
        }`}>
          <span>⚠️ Palm Oil (High Sat Fat)</span>
        </div>

        {/* Ingredient Card 3: Pure Veg */}
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm flex items-center gap-2 text-xs font-bold ${
          isDarkMode ? 'border-emerald-800 bg-emerald-950/85 text-emerald-300' : 'border-emerald-200 bg-white/95 text-emerald-700'
        }`}>
          <span>🟢 100% Vegetarian Dot</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className={`hidden sm:flex items-center gap-2 backdrop-blur-md px-3.5 py-2 rounded-xl border text-xs font-bold ${
          isDarkMode
            ? 'bg-slate-900/85 border-blue-500/20 text-blue-200'
            : 'bg-white/90 border-blue-100 text-blue-700 shadow-sm'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>AharaBimba — Know What You Eat, Before You Eat!</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsScanningActive(!isScanningActive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-blue-500" />
            {isScanningActive ? 'Pause Laser' : 'Resume Laser'}
          </button>

          <button
            onClick={onStartScan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Your Food</span>
          </button>
        </div>
      </div>
    </div>
  );
}
