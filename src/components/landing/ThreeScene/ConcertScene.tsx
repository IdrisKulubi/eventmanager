'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera,
  OrbitControls, 
  Environment, 
  Float,
  Sparkles,
  MeshDistortMaterial,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';
import ThreeJSWrapper from '@/components/shared/ThreeJSWrapper';

// Individual objects for the scene
const Stage = () => {
  const stageRef = useRef<THREE.Mesh>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  
  // Use useInView with ref callback pattern for better reliability
  const [inViewRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  // Register the observer on an actual DOM element, not a Three.js object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById('scene-trigger');
      if (element) {
        inViewRef(element);
      }
    }
  }, [inViewRef]);
  
  // Run animation when element comes into view
  useEffect(() => {
    if (inView && stageRef.current && !animationTriggered) {
      setAnimationTriggered(true);
      gsap.to(stageRef.current.position, {
        y: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.75)'
      });
    }
  }, [inView, animationTriggered]);

  return (
    <group>
      {/* Stage platform */}
      <mesh 
        ref={stageRef}
        position={[0, -1, 0]} 
        receiveShadow
      >
        <boxGeometry args={[15, 0.5, 10]} />
        <meshStandardMaterial color="#232323" roughness={0.8} metalness={0.3} />
      </mesh>
      
      {/* Stage floor with grid */}
      <mesh 
        ref={floorRef}
        position={[0, -0.24, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[14.5, 9.5]} />
        <meshStandardMaterial 
          color="#8A2BE2"
          emissive="#8A2BE2"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Animated spotlight beams
const SpotLights = () => {
  const light1Ref = useRef<THREE.Group>(null);
  const light2Ref = useRef<THREE.Group>(null);
  const light3Ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (light1Ref.current) {
      light1Ref.current.rotation.x = Math.sin(t * 0.3) * 0.3;
      light1Ref.current.rotation.z = Math.cos(t * 0.2) * 0.2;
    }
    
    if (light2Ref.current) {
      light2Ref.current.rotation.x = Math.sin(t * 0.4 + 2) * 0.3;
      light2Ref.current.rotation.z = Math.cos(t * 0.3 + 1) * 0.2;
    }
    
    if (light3Ref.current) {
      light3Ref.current.rotation.x = Math.sin(t * 0.5 + 4) * 0.3;
      light3Ref.current.rotation.z = Math.cos(t * 0.4 + 3) * 0.2;
    }
  });

  return (
    <>
      <group ref={light1Ref} position={[-5, 6, -3]}>
        <spotLight 
          color="#ff3366" 
          intensity={100} 
          distance={20} 
          angle={0.15} 
          penumbra={0.5} 
          decay={1.5}
          castShadow
        />
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.5, 1, 16]} />
          <meshBasicMaterial color="#ff3366" transparent opacity={0.2} />
        </mesh>
      </group>
      
      <group ref={light2Ref} position={[0, 6, -3]}>
        <spotLight 
          color="#8A2BE2" 
          intensity={100} 
          distance={20} 
          angle={0.15} 
          penumbra={0.5} 
          decay={1.5}
          castShadow
        />
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.5, 1, 16]} />
          <meshBasicMaterial color="#8A2BE2" transparent opacity={0.2} />
        </mesh>
      </group>
      
      <group ref={light3Ref} position={[5, 6, -3]}>
        <spotLight 
          color="#00ccff" 
          intensity={100} 
          distance={20} 
          angle={0.15} 
          penumbra={0.5} 
          decay={1.5}
          castShadow 
        />
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.5, 1, 16]} />
          <meshBasicMaterial color="#00ccff" transparent opacity={0.2} />
        </mesh>
      </group>
    </>
  );
};

// Animated floating speakers
const Speakers = () => {
  const speaker1Ref = useRef<THREE.Group>(null);
  const speaker2Ref = useRef<THREE.Group>(null);

  return (
    <>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={speaker1Ref} position={[-7, 1, 1]}>
          <RoundedBox args={[2, 3, 1.5]} radius={0.2} smoothness={4}>
            <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0, 0.8]} castShadow>
            <circleGeometry args={[0.7, 32]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        </group>
      </Float>
      
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={speaker2Ref} position={[7, 1, 1]}>
          <RoundedBox args={[2, 3, 1.5]} radius={0.2} smoothness={4}>
            <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0, 0.8]} castShadow>
            <circleGeometry args={[0.7, 32]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        </group>
      </Float>
    </>
  );
};

// Floating particles effect
const ParticleSystem = () => {
  return (
    <Sparkles 
      count={200}
      scale={15}
      size={0.5}
      speed={0.3}
      color="#8A2BE2"
      opacity={0.5}
    />
  );
};

// Background screen with text animation
const BackScreen = () => {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (screenRef.current && screenRef.current.material) {
      // Type assertion to ShaderMaterial which has uniforms
      const material = screenRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = t;
    }
  });

  // Custom shader for animated background
  const screenShader = {
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#8A2BE2') },
      uColorB: { value: new THREE.Color('#ff3366') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;

      void main() {
        float noise = sin(vUv.x * 10.0 + uTime) * sin(vUv.y * 10.0 + uTime) * 0.1;
        vec3 color = mix(uColorA, uColorB, vUv.x + noise + sin(uTime * 0.2) * 0.2);
        
        // Add scan lines
        float scanLine = sin(vUv.y * 100.0 + uTime * 5.0) * 0.05 + 0.95;
        
        // Add pulsing
        float pulse = (sin(uTime * 1.5) * 0.05) + 0.95;
        
        gl_FragColor = vec4(color * scanLine * pulse, 1.0);
      }
    `
  };

  return (
    <mesh position={[0, 4, -5]} ref={screenRef}>
      <planeGeometry args={[20, 7, 1, 1]} />
      <shaderMaterial
        uniforms={screenShader.uniforms}
        vertexShader={screenShader.vertexShader}
        fragmentShader={screenShader.fragmentShader}
      />
    </mesh>
  );
};

// Main interactive objects
const CenterObject = () => {
  const torusRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock, mouse, viewport }) => {
    const t = clock.getElapsedTime();
    
    if (torusRef.current) {
      // Respond to mouse position
      const x = (mouse.x * viewport.width) / 5;
      const y = (mouse.y * viewport.height) / 5;
      
      torusRef.current.rotation.x = t * 0.5 + y * 0.2;
      torusRef.current.rotation.y = t * 0.3 + x * 0.2;
      
      // Fix any type with proper typing
      const distort = 0.3 + Math.sin(t) * 0.1;
      if (torusRef.current.material) {
        const material = torusRef.current.material as THREE.Material & { distort: number };
        material.distort = distort;
      }
    }
  });

  return (
    <mesh ref={torusRef} position={[0, 3, 0]} castShadow>
      <torusKnotGeometry args={[1.5, 0.5, 128, 32]} />
      <MeshDistortMaterial 
        color="#8A2BE2" 
        distort={0.3} 
        speed={2} 
        metalness={0.8}
        roughness={0.2}
        emissive="#8A2BE2"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

// Scene composition component
const SceneComposition = () => {
  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera 
        makeDefault 
        position={[0, 5, 15]} 
        fov={50}
      />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 4}
      />
      
      {/* Ambient and environment setup */}
      <ambientLight intensity={0.2} />
      <Environment preset="night" />
      
      {/* Scene elements */}
      <Stage />
      <Speakers />
      <SpotLights />
      <ParticleSystem />
      <BackScreen />
      <CenterObject />
    </>
  );
};

// Main component wrapper
const ConcertScene = () => {
  return (
    <ThreeJSWrapper>
      {/* This is a real DOM element that IntersectionObserver can observe */}
      <div 
        id="scene-trigger" 
        className="absolute inset-0 pointer-events-none" 
        aria-hidden="true"
      />
      
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        className="w-full h-screen"
        dpr={[1, 2]}
      >
        <SceneComposition />
      </Canvas>
    </ThreeJSWrapper>
  );
};

export default ConcertScene; 