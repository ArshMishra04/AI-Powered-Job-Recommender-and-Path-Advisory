// src/pages/Roadmap.jsx
import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  GraduationCap, 
  BookOpen, 
  Trophy 
} from "lucide-react";
import * as THREE from "three";
import api from "../utils/api"; // Ensure this path exists in your project

/* =========================================================================
   1. CUSTOM CURSOR (Aurora Trail + Stars)
   ========================================================================= */
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
      setTrail((prev) => [...prev, newPos].slice(-40));
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(() => setTrail((prev) => prev.filter((p) => Date.now() - p.id < 1200)), 50);
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
            style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: opacity * 0.8, scale: scale * 3 }}
            transition={{ duration: 0.1 }}
          >
            {isStar ? (
              <div
                className="w-8 h-8"
                style={{
                  background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}) 0%, rgba(52, 211, 153, ${opacity * 0.7}) 30%, transparent 50%)`, // Teal tint
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  filter: `blur(${2 + Math.random() * 2}px) brightness(${1 + Math.sin(Date.now() / 200) * 0.5})`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(0, 255, 127, ${opacity}) 0%, rgba(20, 184, 166, ${opacity * 0.9}) 50%, transparent 100%)`, // Green/Teal gradient
                  filter: "blur(16px)",
                }}
              />
            )}
          </motion.div>
        );
      })}
      {/* Main Cursor Dot */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10000]"
        style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-4 h-4 bg-teal-400 rounded-full shadow-[0_0_20px_#2dd4bf]" />
      </motion.div>
    </>
  );
}

/* =========================================================================
   2. 3D BACKGROUND COMPONENTS
   ========================================================================= */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    const color = new THREE.Color();
    color.setHSL(0.4 + Math.random() * 0.2, 0.8, 0.6); // Green to Teal Hues
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Planet({ position, color, scale = 1, ringColor, ringScale = 1.3 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += hovered ? 0.02 : 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }} onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}>
        <Sphere args={[1, 64, 64]} scale={hovered ? scale * 1.1 : scale}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={hovered ? 0.8 : 0.2} 
            roughness={0.4}
            metalness={0.6}
          />
        </Sphere>
      </mesh>
      {ringColor && (
        <Ring args={[1.2 * scale, ringScale * scale, 64]} rotation={[Math.PI / 2.2, 0, 0]}>
          <meshStandardMaterial color={ringColor} transparent opacity={0.4} side={THREE.DoubleSide} emissive={ringColor} emissiveIntensity={0.1} />
        </Ring>
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffcc" />
      <spotLight position={[-10, -10, -5]} intensity={1} color="#10b981" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <FloatingParticles />
      
      {/* Strategic Planet Placement */}
      <Planet position={[12, 6, -10]} color="#10B981" ringColor="#34D399" scale={2.5} />
      <Planet position={[-12, -8, -15]} color="#06b6d4" ringColor="#22d3ee" scale={2} ringScale={1.5} />
      <Planet position={[-6, 8, -20]} color="#059669" scale={1} />
    </>
  );
}

/* =========================================================================
   3. ROADMAP STEP COMPONENT (Interactive Card)
   ========================================================================= */
function RoadmapStep({ step, index, isCompleted, onToggleComplete, isLast }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="relative pl-12 pb-12 group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div 
          className={`absolute left-[19px] top-10 bottom-0 w-0.5 transition-all duration-700 ${
            isCompleted ? 'bg-gradient-to-b from-teal-500 to-green-600' : 'bg-gray-800'
          }`} 
        />
      )}

      {/* Step Node / Checkbox */}
      <motion.button
        onClick={() => onToggleComplete(index)}
        className={`absolute left-0 top-1 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 backdrop-blur-md transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-900/50 border-green-500 shadow-[0_0_15px_#10B981]' 
            : 'bg-black/40 border-gray-600 hover:border-teal-400'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCompleted ? <CheckCircle size={20} className="text-green-400" /> : <span className="text-gray-400 text-sm font-mono">{index + 1}</span>}
      </motion.button>

      {/* Card Content */}
      <motion.div
        className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-900/10 border-green-500/30' 
            : 'bg-white/5 border-white/10 hover:border-teal-500/30 hover:bg-white/10'
        }`}
        whileHover={{ x: 4 }}
      >
        <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div>
            <h3 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-green-400' : 'text-teal-100'}`}>
              {step.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{step.desc}</p>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="text-teal-400" />
          </motion.div>
        </div>

        {/* Expandable Sub-items */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <h4 className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-3">Key Concepts</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {step.items?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs hover:bg-teal-500/20 transition-all">
                    <BookOpen size={14} /> View Resources
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================================
   4. MAIN PAGE COMPONENT
   ========================================================================= */
export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedCareer, setSelectedCareer] = useState(null);

  // 1. Load Career Context
  useEffect(() => {
    // Try to get career from Navigation State first, then LocalStorage
    const career = location.state?.career || JSON.parse(localStorage.getItem("selectedCareer") || "null");
    
    if (career) {
      setSelectedCareer(career);
      fetchRoadmap(career.id || career.title);
    } else {
      // If no career selected, redirect to recommendations
      navigate("/recommendations");
    }
  }, [location, navigate]);

  // 2. Fetch Logic
  const fetchRoadmap = async (careerId) => {
    setLoading(true);
    try {
      // Attempt API Call
      const res = await api.get(`/roadmap?career=${careerId}`);
      if(res.data && res.data.phases) {
        setRoadmapData(res.data.phases);
      } else {
        throw new Error("Invalid API format");
      }
    } catch (err) {
      console.warn('Roadmap API unavailable, using fallback data.', err);
      // Fallback Data
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay
      setRoadmapData([
        {
          title: "Foundations & Basics",
          desc: "Understand the core principles, syntax, and tools required for this career path.",
          items: ["Environment Setup (IDE, Git)", "Basic Syntax & Logic", "Data Types & Variables", "Control Structures"]
        },
        {
          title: "Intermediate Concepts",
          desc: "Dive deeper into frameworks, libraries, and architectural patterns.",
          items: ["Object Oriented Programming", "Framework Basics", "API Integration", "Database Connectivity"]
        },
        {
          title: "Advanced Specialization",
          desc: "Master complex topics like system design, security, and optimization.",
          items: ["System Design", "Cloud Deployment (AWS/Azure)", "Security Best Practices", "Performance Optimization"]
        },
        {
          title: "Professional Mastery",
          desc: "Prepare for the industry with real-world projects and soft skills.",
          items: ["Capstone Project", "Resume Building", "Mock Interviews", "Agile Methodologies"]
        }
      ]);
    }

    // Load Progress
    const saved = JSON.parse(localStorage.getItem("roadmapProgress") || "{}");
    setProgress(saved);
    setLoading(false);
  };

  // 3. Toggle Logic
  const toggleComplete = (index) => {
    setProgress(prev => {
      const newProgress = { ...prev, [index]: !prev[index] };
      localStorage.setItem("roadmapProgress", JSON.stringify(newProgress));
      return newProgress;
    });
  };

  // Calculate percentage
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalSteps = roadmapData.length;
  const percentage = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-teal-500/30">
      
      {/* --- 3D Background --- */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* --- Loading Overlay --- */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 border-4 border-teal-900 border-t-teal-400 rounded-full animate-spin mb-4" />
            <p className="text-teal-500 font-mono animate-pulse">Computing Trajectory...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Content --- */}
      {!loading && (
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          <CustomCursor />

          {/* Header */}
          <header className="mb-16">
            <Link to="/recommendations" className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 mb-6 transition-colors">
              <ArrowLeft size={18} /> Back to Careers
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-teal-200 via-green-300 to-emerald-400 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {selectedCareer?.title || "Career Path"}
                </motion.h1>
                <p className="text-gray-400 max-w-xl">
                  Your personalized phase-by-phase journey to mastery. Complete steps to track your growth.
                </p>
              </div>

              {/* Progress Widget */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Orbit Progress</span>
                  <span className="text-xl font-bold text-teal-400">{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Timeline */}
          <div className="relative min-h-[50vh]">
             {roadmapData.map((step, index) => (
               <RoadmapStep 
                 key={index}
                 index={index}
                 step={step}
                 isCompleted={!!progress[index]}
                 onToggleComplete={toggleComplete}
                 isLast={index === roadmapData.length - 1}
               />
             ))}
          </div>

          {/* Completion State */}
          {percentage === 100 && (
            <motion.div 
              className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-green-900/40 to-teal-900/40 border border-green-500/50 text-center backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Mission Accomplished!</h2>
              <p className="text-gray-300 mb-6">You have mastered the {selectedCareer?.title} roadmap.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Return to Base
              </button>
            </motion.div>
          )}

          {/* Footer Navigation */}
          <div className="mt-20 pt-8 border-t border-white/10 flex justify-between items-center text-sm text-gray-500">
            <span>Cosmic Career Guide v2.0</span>
            <div className="flex gap-4">
               <Link to="/progress" className="hover:text-teal-400 transition-colors">Analytics</Link>
               <Link to="/assessment" className="hover:text-teal-400 transition-colors">Retake Quiz</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}