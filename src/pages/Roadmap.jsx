import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import api from "../utils/api";

/* -----------------------------------------------------------
   CUSTOM CURSOR WITH AURORA TRAIL + STARS
----------------------------------------------------------- */
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const cursorRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const newPos = { x: e.clientX, y: e.clientY, id: Date.now() };
      setPosition(newPos);

      setTrail((prev) => {
        const newTrail = [...prev, newPos].slice(-40);
        return newTrail;
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      setTrail((prev) => prev.filter((p) => Date.now() - p.id < 1200));
    }, 50);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <>
      {trail.map((pos, index) => {
        const age = Date.now() - pos.id;
        const opacity = Math.max(0, 1 - age / 1200);
        const scale = 1 - index / trail.length;
        const isStar = index % 3 === 0;

        return (
          <motion.div
            key={pos.id}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: opacity * 0.8,
              scale: scale * 3,
            }}
            transition={{ duration: 0.1 }}
          >
            {isStar ? (
              <div
                className="w-8 h-8"
                style={{
                  background: `radial-gradient(circle, 
                    rgba(255, 255, 255, ${opacity * 1}) 0%,
                    rgba(255, 215, 0, ${opacity * 0.7}) 30%,
                    transparent 50%)`,
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  filter: `blur(${2 + Math.random() * 2}px) brightness(${
                    1 + Math.sin(Date.now() / 200) * 0.5
                  })`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(16, 185, 129, ${opacity}) 0%,
                    rgba(34, 197, 94, ${opacity * 0.9}) 25%,
                    rgba(6, 182, 212, ${opacity * 0.8}) 50%,
                    rgba(16, 185, 129, ${opacity * 0.7}) 75%,
                    transparent 100%)`,
                  filter: "blur(16px)",
                }}
              />
            )}
          </motion.div>
        );
      })}

      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #10b981 0%, #059669 50%, #047857 100%)",
              boxShadow:
                "0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)",
            }}
          />

          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-emerald-400 to-emerald-500"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`,
                transformOrigin: "center",
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* -----------------------------------------------------------
   FLOATING PARTICLES
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 100;
 
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
   
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
     
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.3, 0.8, 0.6); // Emerald hues
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return { positions: pos, colors: col };
  }, []);
 
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });
 
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/* -----------------------------------------------------------
   EXTRA STARS
----------------------------------------------------------- */
function ExtraStars() {
  return (
    <Stars
      radius={120}
      depth={80}
      count={8000}
      factor={4}
      saturation={0.8}
      fade
      speed={0.2}
    />
  );
}

/* -----------------------------------------------------------
   ENHANCED PLANET COMPONENT
----------------------------------------------------------- */
function Planet({ position, color, scale: initialScale = 1, ringColor, ringScale = 1.3 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.02 : 0.01;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <Sphere args={[1, 64, 64]} scale={hovered ? initialScale * 1.15 : initialScale}>
          <meshStandardMaterial
            color={hovered ? `${color}ff` : color}
            emissive={hovered ? color : `${color}80`}
            emissiveIntensity={hovered ? 1.0 : 0.8}
            roughness={hovered ? 0.05 : 0.1}
            metalness={hovered ? 1.0 : 0.9}
          />
        </Sphere>
      </mesh>
      <Sphere args={[1.15 * initialScale, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.4}
          transparent
          opacity={hovered ? 0.7 : 0.5}
          side={THREE.BackSide}
        />
      </Sphere>
      {ringColor && (
        <Ring
          args={[1.2 * initialScale, ringScale * initialScale, 64]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={hovered ? 0.9 : 0.7}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
}

/* -----------------------------------------------------------
   MAIN SCENE - Roadmap Theme (Journey Through Cosmos)
----------------------------------------------------------- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#10b981" />
      <directionalLight position={[10, -10, 5]} intensity={1.2} color="#06b6d4" />
      <hemisphereLight intensity={0.8} skyColor="#10b981" groundColor="#06b6d4" />
      <Stars
        radius={80}
        depth={40}
        count={4000}
        factor={5}
        saturation={0.8}
        fade
        speed={0.4}
      />
      {/* Central Journey Planet */}
      <Planet position={[0, 0, -3]} color="#10b981" scale={3.2} ringColor="#34d399" ringScale={2.0} />
      {/* Orbiting Path Planets */}
      <Planet position={[-3, 1.5, -4]} color="#06b6d4" scale={1.3} ringColor="#22d3ee" ringScale={1.4} />
      <Planet position={[3, -1, -4.5]} color="#14b8a6" scale={1.6} />
      <Planet position={[0, 2.5, -5]} color="#059669" scale={1.1} />
      <Planet position={[-2, -2, -3.5]} color="#0891b2" scale={1.4} ringColor="#06b6d4" ringScale={1.3} />
     
      <FloatingParticles />
    </>
  );
}

export default function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  const careerObj =
    location.state?.career ||
    JSON.parse(localStorage.getItem("selectedCareer") || "null");

  const careerName = careerObj?.career || careerObj?.title || "";

  const [phases, setPhases] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  /* ---------------- PAYLOAD ---------------- */
  const buildPayload = () => {
    const assessment =
      JSON.parse(localStorage.getItem("assessmentResult") || "null");

    return {
      career: careerName,
      current_skills: assessment?.skills || [],
      effort: 3,
    };
  };

  /* ---------------- FETCH ROADMAP ---------------- */
  const fetchRoadmap = async () => {
    try {
      setLoading(true);

      const res = await api.post("/roadmap/", buildPayload());
      const timeline = res.data.timeline || {};

      const formatted = Object.entries(timeline).map(
        ([key, items], index) => ({
          step: index + 1,
          key,
          title: formatPhaseTitle(key),
          subtitle: phaseSubtitle(key),
          items,
        })
      );

      setPhases(formatted);
    } catch (err) {
      console.error("Roadmap error:", err);
      navigate("/recommendations");
    } finally {
      setProgress(
        JSON.parse(localStorage.getItem("roadmapProgress") || "{}")
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!careerName) navigate("/recommendations");
    fetchRoadmap();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';

      const style = document.createElement('style');
      style.textContent = `
        * {
          cursor: none !important;
        }
        input:focus, button:focus, a:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.documentElement.style.cursor = 'default';
        document.body.style.cursor = 'default';
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [loaded]);

  /* ---------------- HELPERS ---------------- */
  const toggleProgress = (phaseKey, idx) => {
    const key = `${phaseKey}-${idx}`;
    const updated = { ...progress, [key]: !progress[key] };
    setProgress(updated);
    localStorage.setItem("roadmapProgress", JSON.stringify(updated));
  };

  const formatPhaseTitle = (key) =>
    key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const phaseSubtitle = (key) => {
    if (key.includes("three")) return "Foundations & Basics";
    if (key.includes("six")) return "Intermediate Concepts";
    if (key.includes("twelve")) return "Advanced Specialization";
    return "Learning Phase";
  };

  if (loading || !loaded) {
    return (
      <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
        {/* LOADING SCREEN - Star Birth Effect */}
        <AnimatePresence>
          {!loaded && (
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-black via-emerald-900/40 to-teal-900/40 z-[999] flex flex-col items-center justify-center"
              initial={{ opacity: 1, scale: 1.2 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full relative"
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 blur-xl opacity-50" />
                </motion.div>
                
                {/* Birth particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400 rounded-full"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.p
                className="mt-6 text-emerald-300 text-xl font-light"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Charting Your Cosmic Path...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D CANVAS */}
        <div className="fixed inset-0 z-0">
          <Canvas
            frameloop="always"
            camera={{ position: [0, 0, 8], fov: 70 }}
            gl={{
              alpha: false,
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              outputEncoding: THREE.sRGBEncoding,
            }}
            style={{
              background: "linear-gradient(135deg, #000000 0%, #0a1a0a 50%, #000000 100%)"
            }}
          >
            <Suspense fallback={null}>
              <Scene />
              <ExtraStars />
            </Suspense>
            <Preload all />
          </Canvas>
        </div>

        {/* Custom Cursor */}
        {loaded && <CustomCursor />}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0">
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 8], fov: 70 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.sRGBEncoding,
          }}
          style={{
            background: "linear-gradient(135deg, #000000 0%, #0a1a0a 50%, #000000 100%)"
          }}
        >
          <Suspense fallback={null}>
            <Scene />
            <ExtraStars />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      {/* UI ABOVE 3D */}
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 relative py-14">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

          {/* BACK */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-emerald-300 transition mb-6 relative z-10"
          >
            ← Back to Careers
          </motion.button>

          {/* HEADER */}
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-2xl mb-3 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.5)",
                  "0 0 40px rgba(6, 182, 212, 0.5)",
                  "0 0 20px rgba(16, 185, 129, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Career Path
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-gray-300 mb-14 max-w-xl relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Your personalized phase-by-phase journey to mastery.
            Complete steps to track your growth.
          </motion.p>

          {/* TIMELINE */}
          <AnimatePresence>
            <motion.div 
              className="relative space-y-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-emerald-500/30" />

              {phases.map((phase, index) => (
                <motion.div 
                  key={phase.key} 
                  className="relative pl-14"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                >
                  {/* STEP CIRCLE */}
                  <motion.div
                    className="
                      absolute left-0 top-7 w-11 h-11 rounded-full
                      bg-black border border-emerald-400
                      flex items-center justify-center
                      text-emerald-300 font-bold
                      shadow-[0_0_18px_rgba(16,185,129,0.6)]
                    "
                    whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(16,185,129,0.8)" }}
                  >
                    {phase.step}
                  </motion.div>

                  {/* CARD */}
                  <motion.div
                    className="
                      group relative
                      rounded-2xl p-7
                      bg-white/5 backdrop-blur-xl
                      border border-white/10
                      transition-all duration-500
                      hover:-translate-y-1
                      hover:border-emerald-400/60
                    "
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* AURORA GLOW */}
                    <div
                      className="
                        absolute inset-0 rounded-2xl
                        opacity-0 group-hover:opacity-100
                        transition duration-500
                        bg-emerald-400/20 blur-2xl
                        -z-20
                      "
                    />

                    {/* GLASS SHINE */}
                    <div
                      className="
                        absolute inset-0 rounded-2xl
                        opacity-0 group-hover:opacity-100
                        transition duration-500
                        bg-gradient-to-br
                        from-white/15 via-transparent to-transparent
                        -z-10
                      "
                    />

                    {/* CONTENT */}
                    <div className="relative z-10">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setExpanded(
                            expanded === phase.key ? null : phase.key
                          )
                        }
                      >
                        <div>
                          <h2 className="text-2xl font-semibold text-emerald-300">
                            {phase.subtitle}
                          </h2>
                          <p className="text-gray-400 text-sm">
                            {phase.title}
                          </p>
                        </div>

                        <motion.span
                          className={`
                            text-emerald-400 text-xl
                            transition-transform duration-300
                            ${expanded === phase.key ? "rotate-180" : ""}
                          `}
                          animate={{ rotate: expanded === phase.key ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          ▼
                        </motion.span>
                      </div>

                      <AnimatePresence>
                        {expanded === phase.key && (
                          <motion.ul 
                            className="mt-6 space-y-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {phase.items.map((item, idx) => {
                              const key = `${phase.key}-${idx}`;
                              return (
                                <motion.li
                                  key={key}
                                  onClick={() =>
                                    toggleProgress(phase.key, idx)
                                  }
                                  className="
                                    flex items-center gap-3 cursor-pointer
                                    transition hover:text-emerald-300
                                  "
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!progress[key]}
                                    readOnly
                                    className="accent-emerald-500"
                                  />
                                  <span
                                    className={
                                      progress[key]
                                        ? "line-through text-gray-500"
                                        : ""
                                    }
                                  >
                                    {item}
                                  </span>
                                </motion.li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Cursor */}
      {loaded && <CustomCursor />}
    </div>
  );
}