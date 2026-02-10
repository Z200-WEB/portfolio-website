/**
 * DraggableNameCard.jsx
 *
 * A trendy 3D draggable business card using Three.js
 * Features smooth drag animation and physics-based movement
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

// Draggable Card Component
const Card = ({ isDragging, setIsDragging }) => {
  const cardRef = useRef();
  const { viewport, camera } = useThree();

  // Card position and velocity for physics
  const [position, setPosition] = useState([0, 0, 0]);
  const velocity = useRef([0, 0]);
  const targetPosition = useRef([0, 0]);
  const dragStart = useRef({ x: 0, y: 0 });
  const cardStart = useRef({ x: 0, y: 0 });

  // Smooth rotation based on velocity
  const [rotation, setRotation] = useState([0, 0, 0]);

  useFrame((state, delta) => {
    if (!cardRef.current) return;

    if (isDragging) {
      // Move towards target position when dragging
      const dx = targetPosition.current[0] - position[0];
      const dy = targetPosition.current[1] - position[1];

      setPosition([
        position[0] + dx * 0.15,
        position[1] + dy * 0.15,
        0
      ]);

      // Calculate velocity for rotation effect
      velocity.current = [dx * 2, dy * 2];

      // Rotate based on drag direction
      setRotation([
        -velocity.current[1] * 0.3,
        velocity.current[0] * 0.3,
        0
      ]);
    } else {
      // Apply inertia when released
      velocity.current[0] *= 0.95;
      velocity.current[1] *= 0.95;

      // Spring back to center
      const springStrength = 0.02;
      const dx = -position[0] * springStrength;
      const dy = -position[1] * springStrength;

      velocity.current[0] += dx;
      velocity.current[1] += dy;

      setPosition([
        position[0] + velocity.current[0],
        position[1] + velocity.current[1],
        0
      ]);

      // Smoothly reset rotation
      setRotation([
        rotation[0] * 0.9,
        rotation[1] * 0.9,
        0
      ]);
    }

    // Apply position and rotation
    cardRef.current.position.set(position[0], position[1], position[2]);
    cardRef.current.rotation.set(
      rotation[0],
      rotation[1],
      rotation[2]
    );

    // Subtle floating animation
    cardRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.003;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.point.x, y: e.point.y };
    cardStart.current = { x: position[0], y: position[1] };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const dx = e.point.x - dragStart.current.x;
    const dy = e.point.y - dragStart.current.y;

    targetPosition.current = [
      cardStart.current.x + dx,
      cardStart.current.y + dy
    ];
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Card Base - Glassmorphism effect */}
      <RoundedBox args={[3.5, 2, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.1}
          roughness={0.2}
          transmission={0.3}
          thickness={0.5}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Gradient overlay */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[3.4, 1.9]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Accent line */}
      <mesh position={[-1.2, 0.5, 0.03]}>
        <planeGeometry args={[0.8, 0.03]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* HTML Content on card */}
      <Html
        transform
        occlude
        position={[0, 0, 0.03]}
        style={{
          width: '320px',
          height: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{
          fontFamily: 'Inter, sans-serif',
          color: 'white',
        }}>
          {/* Name */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            background: 'linear-gradient(90deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ZAWE ZAW HTET
          </h2>

          {/* Role */}
          <p style={{
            fontSize: '12px',
            color: '#a78bfa',
            margin: '0 0 12px 0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Web Engineer
          </p>

          {/* Divider */}
          <div style={{
            width: '40px',
            height: '2px',
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            marginBottom: '12px',
          }} />

          {/* Details */}
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#06b6d4' }}>●</span> Cloud & AI Integration
            </p>
            <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#7c3aed' }}>●</span> React / Three.js / Tailwind
            </p>
            <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>●</span> Japan 🇯🇵
            </p>
          </div>
        </div>
      </Html>

      {/* QR-like decoration */}
      <mesh position={[1.3, -0.5, 0.03]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
      </mesh>

      {/* Corner accent */}
      <mesh position={[1.55, 0.8, 0.03]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#06b6d4" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

// Scene with lighting
const Scene = ({ isDragging, setIsDragging }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 2, -5]} intensity={0.3} color="#7c3aed" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#06b6d4" />

      <Card isDragging={isDragging} setIsDragging={setIsDragging} />
    </>
  );
};

// Main Component
const DraggableNameCard = ({ lang = 'en' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-black/40 rounded-2xl">
        <p className="text-gray-500">3D Card unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        onError={() => setHasError(true)}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Scene isDragging={isDragging} setIsDragging={setIsDragging} />
      </Canvas>

      {/* Instruction hint */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
        {lang === 'jp' ? 'ドラッグして動かす' : 'Drag to move'}
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default DraggableNameCard;
