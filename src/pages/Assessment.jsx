// src/pages/Recommendations.jsx

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  X,
  Plus,
  ArrowLeftRight,
  Briefcase,
  GraduationCap,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
} from "lucide-react";
import * as THREE from "three";
import api from "../utils/api";

/* -----------------------------------------------------------
   CUSTOM CURSOR WITH AURORA TRAIL + STARS (Landing Page Style)
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
      {/* Trail with stars and aurora */}
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
                    rgba(0, 255, 127, ${opacity}) 0%,
                    rgba(138, 43, 226, ${opacity * 0.9}) 25%,
                    rgba(255, 20, 147, ${opacity * 0.8}) 50%,
                    rgba(0, 191, 255, ${opacity * 0.7}) 75%,
                    transparent 100%)`,
                  filter: "blur(16px)",
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Main Cursor - Sun with rays */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 200, 0, 0.4) 0%, rgba(255, 150, 0, 0.2) 40%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Sun body */}
        <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #ffed4e 0%, #ff9d00 50%, #ff6b00 100%)",
              boxShadow:
                "0 0 20px rgba(255, 200, 0, 0.8), 0 0 40px rgba(255, 150, 0, 0.4)",
            }}
          />

          {/* Sun rays */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-yellow-400 to-orange-500"
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
   3D BACKGROUND COMPONENTS
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    const color = new THREE.Color();
    color.setHSL(0.7 + Math.random() * 0.2, 0.8, 0.6);
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.01;
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
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function Planet({ position, color, scale = 1, ringColor }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += hovered ? 0.015 : 0.008;
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
        <Sphere args={[1, 64, 64]} scale={hovered ? scale * 1.1 : scale}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.9 : 0.6}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </mesh>
      {ringColor && (
        <Ring args={[1.3 * scale, 1.6 * scale, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={hovered ? 0.8 : 0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.2} color="#8b5cf6" />
      <directionalLight position={[10, -10, 5]} intensity={1} color="#3b82f6" />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0.8}
        fade
        speed={0.3}
      />
      <Planet position={[-4, 2, -4]} color="#8b5cf6" scale={1.5} ringColor="#a78bfa" />
      <Planet position={[4, -1, -3]} color="#3b82f6" scale={1.8} ringColor="#60a5fa" />
      <Planet position={[0, 3, -5]} color="#10b981" scale={1.2} />
      <Planet position={[-3, -2, -3]} color="#f59e0b" scale={1.3} />
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   SKILL MATCH INDICATOR COMPONENT
----------------------------------------------------------- */
function SkillMatchBar({ percentage, label }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              percentage >= 80
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : percentage >= 60
                ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   CAREER CARD COMPONENT
----------------------------------------------------------- */
function CareerCard({ career, index, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  const gradients = [
    "from-blue-600/20 via-purple-600/20 to-cyan-600/20",
    "from-purple-600/20 via-pink-600/20 to-rose-600/20",
    "from-emerald-600/20 via-teal-600/20 to-cyan-600/20",
    "from-orange-600/20 via-amber-600/20 to-yellow-600/20",
    "from-indigo-600/20 via-blue-600/20 to-sky-600/20",
  ];

  const borderColors = [
    "border-blue-500/30 hover:border-blue-400/50",
    "border-purple-500/30 hover:border-purple-400/50",
    "border-emerald-500/30 hover:border-emerald-400/50",
    "border-orange-500/30 hover:border-orange-400/50",
    "border-indigo-500/30 hover:border-indigo-400/50",
  ];

  return (
    <motion.div
      className={`relative backdrop-blur-xl bg-gradient-to-br ${gradients[index % 5]} rounded-2xl border ${borderColors[index % 5]} overflow-hidden transition-all duration-300 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Match Badge */}
      <div className="absolute top-4 right-4">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            career.confidence >= 90
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : career.confidence >= 75
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          }`}
        >
          {career.confidence}% Match
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
              index % 5 === 0
                ? "from-blue-500 to-purple-600"
                : index % 5 === 1
                ? "from-purple-500 to-pink-600"
                : index % 5 === 2
                ? "from-emerald-500 to-teal-600"
                : index % 5 === 3
                ? "from-orange-500 to-amber-600"
                : "from-indigo-500 to-blue-600"
            } flex items-center justify-center text-2xl shadow-lg`}
          >
            🎯
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{career.title}</h3>
            <p className="text-gray-400 text-sm">AI Recommended</p>
          </div>
        </div>

        {/* Description */}
        {career.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {career.description}
          </p>
        )}

        {/* Skills Section */}
        {career.skills && career.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" /> Required Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {career.skills.slice(0, expanded ? undefined : 5).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md text-xs bg-white/10 text-gray-300 border border-white/10"
                >
                  {skill}
                </span>
              ))}
              {!expanded && career.skills.length > 5 && (
                <span className="px-2 py-1 rounded-md text-xs text-gray-400">
                  +{career.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skill Match Bar */}
        <div className="mb-4">
          <SkillMatchBar percentage={career.confidence} label="Match Score" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          {career.skills && career.skills.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> More Details
                </>
              )}
            </button>
          )}

          <motion.button
            onClick={() => onSelect(career)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select Path <ArrowRight className="w-4 h-4 inline ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   MAIN RECOMMENDATIONS COMPONENT
----------------------------------------------------------- */
export default function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);

  // 🔒 CRITICAL: prevents infinite API calls
  const hasFetchedRef = useRef(false);

  // Read assessment ONLY ONCE
  const assessmentDataRef = useRef(
    location.state?.assessment ||
      JSON.parse(localStorage.getItem("assessmentData") || "{}")
  );

  /* -------------------------------------------------------
     FETCH RECOMMENDATION (RUNS ONLY ONCE)
  ------------------------------------------------------- */
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchRecommendation() {
      try {
        setLoading(true);

        const interests =
          Array.isArray(assessmentDataRef.current?.interests) &&
          assessmentDataRef.current.interests.length > 0
            ? assessmentDataRef.current.interests
            : ["python", "ai", "data"];

        const res = await api.post("/recommend/", { interests });

        const data = res.data;

        setCareer({
          title: data.career,
          confidence: Math.round((data.confidence || 0) * 100),
          skills: data.skills || [],
          description: data.description || "",
        });
      } catch (err) {
        console.error("Recommendation error:", err);
        setError("Failed to load recommendation");
      } finally {
        setLoading(false);
        // Show the loading animation for at least 2.5 seconds
        setTimeout(() => setLoaded(true), 2500);
      }
    }

    fetchRecommendation();
  }, []);

  // Enable custom cursor after loading
  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = "none";
      document.body.style.cursor = "none";
      const style = document.createElement("style");
      style.textContent = `* { cursor: none !important; }`;
      document.head.appendChild(style);
      return () => {
        document.documentElement.style.cursor = "default";
        document.body.style.cursor = "default";
        if (document.head.contains(style)) document.head.removeChild(style);
      };
    }
  }, [loaded]);

  const handleSelectCareer = (careerData) => {
    setSelectedCareer(careerData);
    localStorage.setItem("selectedCareer", JSON.stringify(careerData));
    navigate("/roadmap", { state: { career: careerData } });
  };

  /* -------------------------------------------------------
     ERROR STATE
  ------------------------------------------------------- */
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
        <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          ← Back to Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* Loading Screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/20 to-blue-900/20 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-6 text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Analyzing your profile with AI...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor */}
      {loaded && <CustomCursor />}

      {/* 3D Background Canvas */}
      <div className="fixed inset-0 z-0 bg-black">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
            <Preload all />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          {/* Header Section */}
          <header className="mb-12 relative">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-180" /> Back to Assessment
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your AI Recommendation
                </motion.h1>
                <motion.p
                  className="text-lg text-gray-400 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Based on your skills and interests, our AI has identified the perfect career path for you.
                </motion.p>
              </div>
            </div>
          </header>

          {/* Career Recommendation */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-400 text-lg">Loading your personalized recommendation...</div>
            </div>
          ) : career ? (
            <div className="max-w-4xl mx-auto">
              <CareerCard
                career={career}
                index={0}
                isSelected={selectedCareer?.title === career.title}
                onSelect={handleSelectCareer}
              />

              {/* Additional Info Section */}
              <motion.div
                className="mt-8 p-6 backdrop-blur-xl bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-2xl border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Why This Path?
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Our AI analyzed your interests, skills, and current market trends to recommend this career path. 
                      The {career.confidence}% match score indicates strong alignment between your profile and the 
                      requirements for success in this field. Click "Select Path" to view your personalized learning roadmap.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Next Steps */}
              <motion.div
                className="mt-6 flex items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white transition-all border border-white/10"
                >
                  Take Assessment Again
                </Link>
                <button
                  onClick={() => handleSelectCareer(career)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
                >
                  View Learning Roadmap <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg">No recommendation available</div>
              <Link
                to="/"
                className="mt-4 inline-block text-blue-400 hover:text-blue-300 underline"
              >
                Take the assessment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}