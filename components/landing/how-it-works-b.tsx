"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Search, Filter, Send, ArrowRight, Check } from "lucide-react";

const C = {
  sky: "#2563eb",
  skyDark: "#1e3a8a",
  skyMid: "#1d4ed8",
  skyBright: "#3b82f6",
  skyAccent: "#0ea5e9",
  dark: "#0f172a",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
};

const steps = [
  {
    icon: MapPin,
    title: "Set your target",
    desc: "Choose a city, radius and restaurant category. DineLead supports any location worldwide via OpenStreetMap.",
    details: ["Global coverage", "Custom radius", "Category filters"],
    color: "#8b5cf6",
    accent: "#a78bfa",
  },
  {
    icon: Search,
    title: "Watch it scrape",
    desc: "Real-time job monitoring with progress tracking. Restaurants appear as they're discovered — scrape hundreds in minutes.",
    details: ["Live progress bar", "Real-time results", "Batch processing"],
    color: "#2563eb",
    accent: "#60a5fa",
  },
  {
    icon: Filter,
    title: "Manage your leads",
    desc: "Review, filter, add notes and update statuses. Track every lead from Prospect to Contacted to Closed in one pipeline.",
    details: ["Kanban pipeline", "Notes & activity", "Bulk actions"],
    color: "#0891b2",
    accent: "#22d3ee",
  },
  {
    icon: Send,
    title: "Reach out with AI",
    desc: "Generate personalized outreach emails in seconds. Choose tone and language — AI uses each restaurant's real details.",
    details: ["AI-generated copy", "Multiple tones", "One-click send"],
    color: "#059669",
    accent: "#34d399",
  },
];

/* ── Variant B: Interactive cards with expanding detail panels ── */

function StepIndicator({ active, completed, index, color, onClick }: {
  active: boolean;
  completed: boolean;
  index: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer border-2 transition-colors duration-300"
      style={{
        borderColor: active || completed ? color : C.border,
        background: completed ? color : active ? `${color}15` : C.white,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
          >
            <Check size={18} className="text-white" />
          </motion.div>
        ) : (
          <motion.span
            key="num"
            className="text-sm font-bold"
            style={{ color: active ? color : C.muted }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            // use  animate-ping from tailwind for active step pulse
          >
            {index + 1}
          </motion.span>
        )}
      </AnimatePresence>
      {/* active ring pulse — Tailwind animate-ping */}
      {active && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: color }}
        />
      )}
    </motion.button>
  );
}

function ConnectorLine({ completed, color }: { completed: boolean; color: string }) {
  return (
    <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden" style={{ background: C.border }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: "0%" }}
        animate={{ width: completed ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function DetailCard({ step, isActive }: { step: (typeof steps)[0]; isActive: boolean }) {
  const Icon = step.icon;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={step.title}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.06), 0 0 0 1px ${step.color}15`,
          }}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* top accent bar */}
          <motion.div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${step.color}, ${step.accent})` }}
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Left: icon + text */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${step.color}12` }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, type: "spring", stiffness: 200 }}
                >
                  <Icon size={26} style={{ color: step.color }} />
                </motion.div>

                <motion.h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ color: C.dark }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {step.title}
                </motion.h3>

                <motion.p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: C.muted }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  {step.desc}
                </motion.p>

                {/* detail chips */}
                <div className="flex flex-wrap gap-2">
                  {step.details.map((detail, i) => (
                    <motion.span
                      key={detail}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        color: step.color,
                        background: `${step.color}0D`,
                        border: `1px solid ${step.color}20`,
                      }}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: step.color }}
                      />
                      {detail}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Right: decorative illustration */}
              <motion.div
                className="hidden md:flex shrink-0 w-48 h-48 rounded-2xl items-center justify-center relative overflow-hidden"
                style={{ background: `${step.color}08` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* floating geometric shapes */}
                <motion.div
                  className="absolute w-24 h-24 rounded-full"
                  style={{ background: `${step.color}10`, top: "10%", left: "10%" }}
                  animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute w-16 h-16 rounded-xl"
                  style={{ background: `${step.color}15`, bottom: "15%", right: "10%", rotate: "15deg" }}
                  animate={{ y: [0, 6, 0], rotate: ["15deg", "25deg", "15deg"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <Icon size={48} style={{ color: step.color, opacity: 0.3 }} className="relative z-10" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HowItWorksB() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef(8000);

  const goToNext = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goToNext();
      // after an interaction-triggered advance, revert to 3s
      delayRef.current = 3000;
    }, delayRef.current);
  }, [goToNext]);

  // restart timer whenever activeStep changes
  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeStep, startTimer]);

  // click handler: go to a specific step, use 8s delay for the next auto-advance
  const handleStepClick = useCallback((targetStep: number) => {
    delayRef.current = 8000;
    setActiveStep(targetStep);
  }, []);

  return (
    <section id="how-it-works" className="py-20 md:py-32" style={{ background: C.light }}>
      <div className="max-w-4xl mx-auto px-6" ref={sectionRef}>
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-4 py-1.5 rounded-full"
            style={{ color: C.sky, background: `${C.sky}0D`, border: `1px solid ${C.sky}20` }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.span>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5"
            style={{ color: C.dark }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Four steps to your
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${C.sky}, ${C.skyAccent})` }}
            >
              restaurant pipeline
            </span>
          </motion.h2>
          <motion.p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ color: C.muted }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            No complicated setup. No expensive tools. Start scraping restaurant data in minutes.
          </motion.p>
        </div>

        {/* Step progress bar */}
        <motion.div
          className="flex items-center justify-center mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {steps.map((step, i) => (
            <div key={step.title} className="contents">
              <div className="flex flex-col items-center gap-2">
                <StepIndicator
                  active={i === activeStep}
                  completed={i < activeStep}
                  index={i}
                  color={step.color}
                  onClick={() => handleStepClick(i)}
                />
                <span
                  className="text-[11px] font-semibold tracking-wide hidden sm:block whitespace-nowrap"
                  style={{ color: i === activeStep ? step.color : C.muted }}
                >
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ConnectorLine
                  completed={i < activeStep}
                  color={steps[i + 1].color}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Active step detail */}
        <motion.div
          className="min-h-[320px]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <DetailCard step={steps[activeStep]} isActive={true} />
        </motion.div>
      </div>
    </section>
  );
}
