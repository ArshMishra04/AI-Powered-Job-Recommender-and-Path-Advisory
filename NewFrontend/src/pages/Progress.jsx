// src/pages/Progress.jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
// ADDED "Play" to imports below
import { ArrowLeft, Flame, CheckCircle, Circle, TrendingUp, Target, Zap, Clock, Star, Calendar, PlayCircle, Play, Award, BarChart3, Activity } from "lucide-react";
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
                  background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}) 0%, rgba(255, 165, 0, ${opacity * 0.7}) 30%, transparent 50%)`,
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  filter: `blur(${2 + Math.random() * 2}px) brightness(${1 + Math.sin(Date.now() / 200) * 0.5})`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 165, 0, ${opacity}) 0%, rgba(255, 140, 0, ${opacity * 0.9}) 25%, rgba(255, 69, 0, ${opacity * 0.8}) 50%, rgba(255, 99, 71, ${opacity * 0.7}) 75%, transparent 100%)`,
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
        style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
      >
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-full h-full rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255, 200, 0, 0.4) 0%, rgba(255, 150, 0, 0.2) 40%, transparent 70%)", filter: "blur(4px)" }}
          />
        </div>
        <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, #ffed4e 0%, #ff9d00 50%, #ff6b00 100%)", boxShadow: "0 0 20px rgba(255, 200, 0, 0.8), 0 0 40px rgba(255, 150, 0, 0.4)" }}
          />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-yellow-400 to-orange-500"
              style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`, transformOrigin: "center", borderRadius: "2px" }}
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
  // Use useMemo in production, but defined here for simplicity
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  // Initialize only once
  if (positions[0] === 0) { 
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        const color = new THREE.Color();
        color.setHSL(0.1 + Math.random() * 0.1, 0.8, 0.7); // Orange/Yellow hues
        colors[i * 3 + 0] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
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
    <Stars radius={120} depth={80} count={8000} factor={4} saturation={0.8} fade speed={0.2} />
  );
}

/* -----------------------------------------------------------
   ENHANCED PLANET COMPONENT
----------------------------------------------------------- */
function Planet({ position, color, scale = 1, ringColor, ringScale = 1.3 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += hovered ? 0.02 : 0.01;
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }} onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}>
        <Sphere args={[1, 64, 64]} scale={hovered ? scale * 1.15 : scale}>
          <meshStandardMaterial color={hovered ? `${color}ff` : color} emissive={hovered ? color : `${color}80`} emissiveIntensity={hovered ? 1.0 : 0.8} roughness={hovered ? 0.05 : 0.1} metalness={hovered ? 1.0 : 0.9} />
        </Sphere>
      </mesh>
      <Sphere args={[1.15 * scale, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.4} transparent opacity={hovered ? 0.7 : 0.5} side={THREE.BackSide} />
      </Sphere>
      {ringColor && (
        <Ring args={[1.2 * scale, ringScale * scale, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={ringColor} transparent opacity={hovered ? 0.9 : 0.7} side={THREE.DoubleSide} />
        </Ring>
      )}
    </group>
  );
}

/* -----------------------------------------------------------
   MAIN SCENE
----------------------------------------------------------- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#f59e0b" />
      <directionalLight position={[10, -10, 5]} intensity={1.2} color="#f97316" />
      <hemisphereLight intensity={0.8} skyColor="#f59e0b" groundColor="#f97316" />
      <Stars radius={80} depth={40} count={4000} factor={5} saturation={0.8} fade speed={0.4} />
      <Planet position={[-3.5, 1.5, -3]} color="#f59e0b" scale={1.8} ringColor="#fbbf24" ringScale={1.6} />
      <Planet position={[3.5, -0.5, -2.5]} color="#f97316" scale={2.2} ringColor="#fb923c" ringScale={1.7} />
      <Planet position={[-1.5, -2.5, -4]} color="#ea580c" scale={1.4} />
      <Planet position={[1.5, 2.5, -3.5]} color="#dc2626" scale={1.6} ringColor="#ef4444" ringScale={1.4} />
      <Planet position={[4.5, 0.5, -4.5]} color="#b45309" scale={1.7} />
      <Planet position={[-4.5, -1.5, -2]} color="#92400e" scale={1.9} />
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   ENHANCED STREAK COMPONENT
----------------------------------------------------------- */
function StreakComponent({ streak }) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden mb-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
      <div className="relative z-10 flex items-center gap-6">
        <motion.div
          className="relative"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-16 h-16 text-orange-400 drop-shadow-lg" />
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"
            style={{ boxShadow: "0 0 20px rgba(255, 193, 7, 0.6)" }}
          />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent mb-2">
            {streak} Day Streak 🔥
          </h2>
          <p className="text-gray-300 text-lg">Keep the fire burning! You're on a roll.</p>
          <motion.div
            className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${Math.min(streak / 7 * 100, 100)}%` }} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   SKILL PROGRESS BAR
----------------------------------------------------------- */
function SkillProgress({ skills }) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl mb-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Skill Mastery</h2>
      </div>
      <div className="space-y-4">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            className="group relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {skill.icon || skill.name.charAt(0)}
                </div>
                <span className="text-white font-medium">{skill.name}</span>
              </div>
              <span className="text-gray-400">{skill.value}%</span>
            </div>
            <div className="relative">
              <div className="h-4 bg-white/10 rounded-full overflow-hidden group-hover:h-5 transition-all">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.value}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </motion.div>
              </div>
              {/* Tooltip on Hover */}
              <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-lg p-3 text-sm text-white whitespace-nowrap shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {skill.tooltip || `Mastered ${skill.value}% of ${skill.name}. Keep going!`}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   ROADMAP COMPLETION
----------------------------------------------------------- */
function RoadmapCompletion({ roadmap }) {
  const overallProgress = Math.round(roadmap.reduce((acc, r) => acc + r.value, 0) / roadmap.length);

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl mb-12 relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Roadmap Journey</h2>
        </div>
        {/* Overall Progress Circle */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#374151"
                strokeWidth="5"
                fill="none"
                className="opacity-30"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 283", strokeDashoffset: 0 }}
                animate={{ strokeDasharray: `${overallProgress * 2.83} 283`, strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 0.6 }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{overallProgress}%</div>
                <div className="text-sm text-gray-400">Overall</div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Individual Roadmap Bars */}
        <div className="space-y-4">
          {roadmap.map((r, i) => (
            <motion.div
              key={r.step}
              className="group relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.7 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  {r.step}
                </span>
                <span className="text-gray-400">{r.value}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden group-hover:h-4 transition-all">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 animate-pulse"
                    style={{ backgroundSize: "100% 100%" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   RECENT TASKS COMPONENT
----------------------------------------------------------- */
function RecentTasks({ tasks }) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl mb-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Recent Achievements</h2>
      </div>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {tasks.map((task, i) => (
          <motion.div
            key={task.id || i}
            className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.9 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100" />
            <div className="relative z-10 flex items-start gap-4">
              <motion.div
                className="flex-shrink-0 mt-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 + 1 }}
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
              </motion.div>
              <div className="flex-1">
                <p className="text-white font-medium">{task.title}</p>
                <p className="text-gray-400 text-sm mt-1">{task.date}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Play className="w-3 h-3" /> {/* Fixed: Play was undefined before */}
                  <span>{task.duration} hours</span>
                </div>
              </div>
              <motion.button
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all ml-auto"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   OVERALL STATS SUMMARY (Milestone Card)
----------------------------------------------------------- */
// Fixed: Added "streak" to props so it is defined
function OverallStats({ overallProgress, nextMilestone, streak }) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Total Progress */}
      <div className="text-center" >
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Total Progress</h3>
        <p className="text-3xl font-bold text-orange-400">{overallProgress}%</p>
        <p className="text-gray-400 text-sm mt-1">of your career goals</p>
      </div>
      {/* Streak */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Flame className="w-8 h-8 text-white animate-flicker" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Current Streak</h3>
        {/* Fixed: Use passed prop "streak" instead of undefined "weeklyStreak" */}
        <p className="text-3xl font-bold text-yellow-400">{streak} days</p>
        <p className="text-gray-400 text-sm mt-1">Consecutive learning</p>
      </div>
      {/* Next Milestone */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Next Milestone</h3>
        <p className="text-white text-sm">{nextMilestone}</p>
        <p className="text-gray-400 text-xs mt-1">Complete to unlock</p>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   MAIN PROGRESS COMPONENT
----------------------------------------------------------- */
export default function Progress() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState({
    skills: [],
    roadmap: [],
    recentTasks: [],
    streak: 4,
    overallProgress: 65,
    nextMilestone: "Complete Backend Basics",
  });

  // Fetch dynamic progress from backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/progress');
        setData(res.data || data); // Fallback to static if API fails
      } catch (err) {
        console.error('Progress Fetch Error:', err);
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = "none";
      document.body.style.cursor = "none";
      const style = document.createElement("style");
      style.textContent = `* { cursor: none !important; } input:focus, button:focus, a:focus { outline: none; }`;
      document.head.appendChild(style);
      return () => {
        document.documentElement.style.cursor = "default";
        document.body.style.cursor = "default";
        if (document.head.contains(style)) document.head.removeChild(style);
      };
    }
  }, [loaded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 },
    },
  };

  // Static fallback data
  const fallbackData = {
    skills: [
      { name: "React.js", value: 70, icon: "⚛️", tooltip: "Advanced components & hooks" },
      { name: "JavaScript", value: 80, icon: "📜", tooltip: "ES6+ mastery" },
      { name: "Node.js", value: 50, icon: "🟢", tooltip: "Express & APIs" },
      { name: "Databases", value: 40, icon: "🗄️", tooltip: "SQL & MongoDB basics" },
    ],
    roadmap: [
      { step: "Fundamentals", value: 100 },
      { step: "Frontend Skills", value: 80 },
      { step: "Backend Basics", value: 40 },
      { step: "Full-Stack Development", value: 20 },
    ],
    recentTasks: [
      { title: "Completed JavaScript Functions Module", date: "Dec 28, 2025", duration: "2h" },
      { title: "Created Login + Register Frontend", date: "Dec 27, 2025", duration: "4h" },
      { title: "Finished React Hooks Tutorial", date: "Dec 26, 2025", duration: "3h" },
    ],
    streak: 4,
    overallProgress: 65,
    nextMilestone: "Complete Backend Basics",
  };

  const currentData = data.skills.length > 0 ? data : fallbackData;

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* Loading Screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-orange-900/20 to-red-900/20 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <motion.p className="mt-6 text-gray-300 text-lg font-light" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              Updating Progress...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas frameloop="always" camera={{ position: [0, 0, 6], fov: 65 }} gl={{ alpha: false, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, outputEncoding: THREE.sRGBEncoding }} style={{ background: "linear-gradient(135deg, #000000 0%, #451a03 50%, #000000 100%)" }}>
          <Suspense fallback={null}>
            <Scene />
            <ExtraStars />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="relative z-10">
        {/* Header */}
        <section className="min-h-[20vh] flex items-center justify-center text-center px-6 py-8 relative">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          <AnimatePresence>
            {loaded && (
              <motion.div className="relative z-10 max-w-4xl w-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 text-orange-400 hover:text-orange-300 transition-colors">
                  <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                  Progress Overview
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Track your journey, celebrate wins, and see how far you've come. Your growth is accelerating!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Main Content */}
        <section className="min-h-[60vh] px-6 pb-20 relative">
          <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
            {/* Overall Stats */}
            <OverallStats 
              overallProgress={currentData.overallProgress} 
              nextMilestone={currentData.nextMilestone} 
              streak={currentData.streak} // Fixed: Passing streak prop
            />
            
            {/* Streak */}
            <StreakComponent streak={currentData.streak} />
            
            {/* Skills */}
            <SkillProgress skills={currentData.skills} />
            
            {/* Roadmap */}
            <RoadmapCompletion roadmap={currentData.roadmap} />
            
            {/* Recent Tasks */}
            <RecentTasks tasks={currentData.recentTasks} />
          </motion.div>
        </section>

        {/* Footer Buttons */}
        <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          <motion.button
            onClick={() => navigate('/roadmap')}
            className="px-8 py-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            ← View Roadmap
          </motion.button>
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-white font-semibold shadow-lg hover:shadow-orange-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Back to Dashboard →
          </motion.button>
        </footer>
      </div>

      {/* Custom Cursor */}
      {loaded && <CustomCursor />}
    </div>
  );
}