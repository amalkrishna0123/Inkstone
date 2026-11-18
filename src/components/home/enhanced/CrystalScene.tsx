"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CrystalSceneProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function CrystalScene({ containerRef }: CrystalSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const triggerSection = containerRef.current || mount;
    if (!mount || !triggerSection) return;

    let animationFrameId: number | null = null;
    let isVisible = false;
    let isDisposed = false;

    // Smooth interactive cursor parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Scene & Camera setup
    const scene = new THREE.Scene();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    // Responsive camera position
    const updateCameraDistance = () => {
      const currentWidth = mount.clientWidth || window.innerWidth;
      if (currentWidth < 640) {
        camera.position.set(0, 0, 10.2);
      } else if (currentWidth < 1024) {
        camera.position.set(0, 0, 8.8);
      } else {
        camera.position.set(0, 0, 7.6);
      }
      camera.updateProjectionMatrix();
    };
    updateCameraDistance();

    // WebGL Renderer with ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Environment Lighting via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const neutralEnvironment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    scene.environment = neutralEnvironment;

    // Studio Lights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    // Fill Light (soft cool blue tone)
    const fillLight = new THREE.DirectionalLight(0xd4e9ff, 1.8);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    // Rim Light (sharp edge highlights)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Accent Point Light for LED halo base glow
    const basePointLight = new THREE.PointLight(0xe5f8ff, 3.2, 8);
    basePointLight.position.set(0, -1.4, 0.3);
    scene.add(basePointLight);

    // Hierarchy Groups:
    // modelGroup: handles floating vertical motion, subtle tilt and mouse parallax
    // pivotGroup: handles continuous ultra-smooth 360° rotation
    const modelGroup = new THREE.Group();
    const pivotGroup = new THREE.Group();
    modelGroup.add(pivotGroup);
    scene.add(modelGroup);

    // Initial subtle luxury display angle (slight 3D tilt)
    const baseTiltX = 0.09;
    const baseTiltZ = -0.03;
    modelGroup.rotation.x = baseTiltX;
    modelGroup.rotation.z = baseTiltZ;

    // GSAP Tweens & ScrollTrigger holders
    let rotationTween: gsap.core.Tween | null = null;
    let floatingTween: gsap.core.Tween | null = null;
    let scrollTriggerInstance: ScrollTrigger | null = null;

    // Render loop
    const render = () => {
      if (isDisposed) return;

      if (isVisible) {
        // Smooth cursor parallax interpolation
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;

        modelGroup.rotation.x = baseTiltX + currentMouseY;
        modelGroup.rotation.z = baseTiltZ - currentMouseX * 0.5;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const startRendering = () => {
      if (!animationFrameId && !isDisposed) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopRendering = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Load 3D Crystal GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/glb/crysta.glb",
      (gltf) => {
        if (isDisposed) return;

        const gltfScene = gltf.scene;

        // Calculate bounding box and center pivot exactly at (0, 0, 0)
        const box = new THREE.Box3().setFromObject(gltfScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        gltfScene.position.sub(center);

        // Optimize materials for realistic optical crystal, reflection, and LED glow
        gltfScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              const meshName = (mesh.name || "").toLowerCase();
              const matName = (mat.name || "").toLowerCase();

              if (
                meshName.includes("heart") ||
                matName.includes("faceted") ||
                matName.includes("optical")
              ) {
                // Main Heart Crystal: High-clarity optical physical material with transmission & clearcoat
                const crystalMat = new THREE.MeshPhysicalMaterial({
                  color: mat.color ? mat.color.clone() : new THREE.Color(0xe6f4ff),
                  roughness: 0.035,
                  metalness: 0.04,
                  transmission: 0.72,
                  ior: 1.52,
                  reflectivity: 0.95,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.035,
                  thickness: 1.6,
                  transparent: true,
                  opacity: 0.88,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                  vertexColors: !!mesh.geometry.attributes.color,
                });
                mesh.material = crystalMat;
              } else if (
                meshName.includes("halo") ||
                matName.includes("halo")
              ) {
                // White LED halo with bright emissive luminescence
                mat.emissive = new THREE.Color(0xf3f9ff);
                mat.emissiveIntensity = 2.8;
                mat.roughness = 0.15;
                mat.metalness = 0.05;
                mat.toneMapped = true;
              } else if (
                meshName.includes("lower") ||
                matName.includes("smoky")
              ) {
                // Smoky transparent crystal pedestal
                const smokyMat = new THREE.MeshPhysicalMaterial({
                  color: mat.color ? mat.color.clone() : new THREE.Color(0x768997),
                  roughness: 0.08,
                  metalness: 0.32,
                  transmission: 0.45,
                  ior: 1.5,
                  reflectivity: 0.85,
                  clearcoat: 0.85,
                  clearcoatRoughness: 0.05,
                  thickness: 1.2,
                  transparent: true,
                  opacity: 0.9,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                });
                mesh.material = smokyMat;
              } else if (
                meshName.includes("plinth") ||
                matName.includes("pedestal")
              ) {
                // Cut crystal upper plinth
                const plinthMat = new THREE.MeshPhysicalMaterial({
                  color: mat.color ? mat.color.clone() : new THREE.Color(0xd7edfc),
                  roughness: 0.05,
                  metalness: 0.14,
                  transmission: 0.65,
                  ior: 1.52,
                  reflectivity: 0.9,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.04,
                  thickness: 1.4,
                  transparent: true,
                  opacity: 0.84,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                });
                mesh.material = plinthMat;
              } else if (meshName.includes("foot")) {
                // Crystal support feet
                const footMat = new THREE.MeshPhysicalMaterial({
                  color: mat.color ? mat.color.clone() : new THREE.Color(0xe5f4ff),
                  roughness: 0.055,
                  metalness: 0.12,
                  transmission: 0.6,
                  ior: 1.52,
                  reflectivity: 0.85,
                  clearcoat: 0.8,
                  clearcoatRoughness: 0.05,
                  thickness: 1.0,
                  transparent: true,
                  opacity: 0.8,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                });
                mesh.material = footMat;
              } else {
                mat.side = THREE.DoubleSide;
              }
            }
          }
        });

        pivotGroup.add(gltfScene);
        setIsLoaded(true);

        // Continuous Ultra-Smooth 360° Rotation using GSAP with seamless linear looping
        rotationTween = gsap.to(pivotGroup.rotation, {
          y: "+=" + Math.PI * 2,
          duration: 24,
          ease: "none",
          repeat: -1,
          paused: !isVisible,
        });

        // Subtle, gentle floating vertical movement for luxury product-display feel
        floatingTween = gsap.to(modelGroup.position, {
          y: "+=0.22",
          duration: 3.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: !isVisible,
        });

        // Initial smooth entrance animation for the canvas
        gsap.fromTo(
          mount,
          { autoAlpha: 0, scale: 0.92 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          }
        );

        // If section is already visible, kick off rendering immediately
        if (isVisible) {
          rotationTween.play();
          floatingTween.play();
          startRendering();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading crystal GLB:", error);
      }
    );

    // GSAP ScrollTrigger to control playback based on section visibility
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: triggerSection,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        isVisible = true;
        rotationTween?.play();
        floatingTween?.play();
        startRendering();
      },
      onLeave: () => {
        isVisible = false;
        rotationTween?.pause();
        floatingTween?.pause();
        stopRendering();
      },
      onEnterBack: () => {
        isVisible = true;
        rotationTween?.play();
        floatingTween?.play();
        startRendering();
      },
      onLeaveBack: () => {
        isVisible = false;
        rotationTween?.pause();
        floatingTween?.pause();
        stopRendering();
      },
    });

    // Handle initial visibility check
    const rect = triggerSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      isVisible = true;
      startRendering();
    }

    // Responsive resize handler
    const handleResize = () => {
      if (!mount || isDisposed) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      updateCameraDistance();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Interactive mouse / touch movements for subtle luxury glints
    const handleMouseMove = (e: MouseEvent) => {
      const b = triggerSection.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width) * 2 - 1;
      const y = -(((e.clientY - b.top) / b.height) * 2 - 1);
      targetMouseX = Math.max(-1, Math.min(1, x)) * 0.18;
      targetMouseY = Math.max(-1, Math.min(1, y)) * 0.14;
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const b = triggerSection.getBoundingClientRect();
        const x = ((touch.clientX - b.left) / b.width) * 2 - 1;
        const y = -(((touch.clientY - b.top) / b.height) * 2 - 1);
        targetMouseX = Math.max(-1, Math.min(1, x)) * 0.14;
        targetMouseY = Math.max(-1, Math.min(1, y)) * 0.1;
      }
    };

    triggerSection.addEventListener("mousemove", handleMouseMove as EventListener);
    triggerSection.addEventListener("mouseleave", handleMouseLeave as EventListener);
    triggerSection.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: true,
    });

    // Complete cleanup on unmount
    return () => {
      isDisposed = true;
      isVisible = false;

      stopRendering();

      window.removeEventListener("resize", handleResize);
      triggerSection.removeEventListener("mousemove", handleMouseMove as EventListener);
      triggerSection.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      triggerSection.removeEventListener("touchmove", handleTouchMove as EventListener);

      rotationTween?.kill();
      floatingTween?.kill();
      scrollTriggerInstance?.kill();

      // Dispose PMREM and neutral environment
      pmremGenerator.dispose();
      neutralEnvironment.dispose();

      // Dispose 3D scene meshes & materials
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      // Dispose WebGLRenderer and DOM canvas
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-700 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        zIndex: 1,
      }}
    >
      {/* Subtle luxury ambient backplate glow to highlight crystal facets */}
      <div
        className="absolute pointer-events-none w-[90vw] max-w-[650px] h-[90vw] max-h-[650px] rounded-full blur-3xl opacity-40 -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(255,234,0,0.12) 0%, rgba(200,230,255,0.2) 40%, transparent 70%)",
        }}
      />
    </div>
  );
}

