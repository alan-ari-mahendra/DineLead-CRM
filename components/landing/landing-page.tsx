"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import HowItWorksB from "./how-it-works-b";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Activity,
  BarChart3,
  Download,
  MapPin,
  Send,
  Menu,
  X,
  ArrowRight,
  Globe,
  ChevronRight,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Check,
} from "lucide-react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

/* ─── palette (no shadcn, all inline) ─── */
const C = {
  sky: "#2563eb",
  skyDark: "#1e3a8a",
  skyMid: "#1d4ed8",
  skyBright: "#3b82f6",
  skyAccent: "#0ea5e9",
  skyLight: "#dbeafe",
  skyLighter: "#eff6ff",
  dark: "#0f172a",
  text: "#1e293b",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  heroGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #0ea5e9 100%)",
  ctaGradient: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)",
};

/* ═══════════════════════ NAVBAR ═══════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-200"
      style={{
        background: C.white,
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.04)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: C.dark }}>
          <Image src="/site-logo-DL-removebg-preview.png" alt="DineLead" width={100} height={100} className="rounded-md" />
          {/* <span>Dine<span style={{ color: C.sky }}>Lead</span></span> */}
        </Link>

        {/* desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works"].map((t) => (
            <a key={t} href={`#${t.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.muted }}>
              {t}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg hover:opacity-80 transition-opacity" style={{ color: C.text }}>
            Log in
          </Link>
          <Link href="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-all hover:brightness-110" style={{ background: C.skyMid }}>
            Get Started Free
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2" style={{ color: C.text }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3" style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
          {["Features", "How It Works"].map((t) => (
            <a key={t} href={`#${t.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)} className="text-sm py-2" style={{ color: C.muted }}>
              {t}
            </a>
          ))}
          <Link href="/login" className="text-sm py-2" style={{ color: C.text }}>Log in</Link>
          <Link href="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white text-center" style={{ background: C.skyMid }}>
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════ HERO ═══════════════════════ */
function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 relative overflow-hidden" style={{ background: C.heroGradient }}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#38bdf8" }} />
            Restaurant Lead Scraping & CRM Platform
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 [&>span]:!drop-shadow-none">
              <LayoutTextFlip
                text="restaurant data and"
                words={["Discover", "Find", "Source", "Collect"]}
                className="!text-4xl sm:!text-5xl lg:!text-6xl !font-extrabold"
              />
            </span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          DineLead automatically finds restaurants from any city, organizes them in a smart CRM pipeline, and lets AI write your outreach emails — so you close deals, not hunt contacts.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link href="/register" className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg text-base transition-all hover:brightness-110" style={{ background: C.white, color: C.skyMid }}>
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg text-base border-2 transition-colors text-white" style={{ borderColor: "rgba(255,255,255,0.3)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}>
            See How It Works
          </a>
        </motion.div>

        {/* Browser mockup */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="max-w-5xl mx-auto">
          <BrowserMockup>
            <DashboardMockup />
          </BrowserMockup>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════ BROWSER MOCKUP ═══════════════════════ */
function BrowserMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/10" style={{ border: `1px solid ${C.border}` }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f5f9", borderBottom: `1px solid ${C.border}` }}>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
        </div>
        <div className="flex-1 mx-8">
          <div className="max-w-md mx-auto h-7 rounded-md px-3 flex items-center text-xs" style={{ background: C.white, border: `1px solid ${C.border}`, color: C.muted }}>
            dinelead.app/dashboard
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ background: C.white }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════ DASHBOARD MOCKUP ═══════════════════════ */
function DashboardMockup() {
  return (
    <div className="p-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: "1,247", change: "+12%", icon: BarChart3 },
          { label: "Contacted", value: "384", change: "+8%", icon: Send },
          { label: "Conversion Rate", value: "18.3%", change: "+2.1%", icon: Activity },
          { label: "Avg Rating", value: "4.2", change: "★", icon: Star },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-lg" style={{ border: `1px solid ${C.border}`, background: C.light }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: C.muted }}>{s.label}</span>
              <s.icon size={14} style={{ color: C.sky }} />
            </div>
            <div className="text-xl font-bold" style={{ color: C.dark }}>{s.value}</div>
            <span className="text-xs font-medium" style={{ color: C.skyBright }}>{s.change}</span>
          </div>
        ))}
      </div>
      {/* Table preview */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: C.light }}>
              {["Restaurant", "Location", "Rating", "Phone", "Status"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium hidden sm:table-cell first:table-cell" style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Sushi Tei", loc: "Jakarta", rating: "4.5", phone: "+62 21 ...", status: "Contacted" },
              { name: "Pizza Marzano", loc: "Bandung", rating: "4.3", phone: "+62 22 ...", status: "Prospect" },
              { name: "Warung Padang", loc: "Surabaya", rating: "4.7", phone: "+62 31 ...", status: "New" },
            ].map((r) => (
              <tr key={r.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: C.dark }}>{r.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: C.muted }}>{r.loc}</td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: C.muted }}>⭐ {r.rating}</td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: C.muted }}>{r.phone}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: r.status === "Contacted" ? `${C.sky}15` : r.status === "Prospect" ? `${C.skyBright}15` : "#f1f5f9",
                    color: r.status === "Contacted" ? C.sky : r.status === "Prospect" ? C.skyBright : C.muted,
                  }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════ FADE-IN WRAPPER ═══════════════════════ */
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════ FEATURES ═══════════════════════ */
const features = [
  {
    icon: Search,
    title: "Automated Restaurant Scraping",
    desc: "Enter a city and radius — DineLead scrapes restaurant names, addresses, phones, websites, ratings and reviews from OpenStreetMap. No API keys needed. No cost per query.",
    mockup: <ScrapingMockup />,
  },
  {
    icon: LayoutDashboard,
    title: "Smart CRM Pipeline",
    desc: "Track every lead through Prospect → Contacted → Closed stages. Filter by status, rating, location, or industry. Bulk actions for efficiency.",
    mockup: <PipelineMockup />,
  },
  {
    icon: Sparkles,
    title: "AI-Powered Email Outreach",
    desc: "Generate personalized cold outreach emails with one click. Choose your tone — professional, friendly, or casual — and language. AI knows each restaurant's details.",
    mockup: <EmailMockup />,
  },
  {
    icon: Download,
    title: "Flexible Data Export",
    desc: "Export leads to Excel, CSV, or JSON. Choose exactly which fields to include. Filter by date range, status, or rating before exporting.",
    mockup: <ExportMockup />,
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28" style={{ background: C.white }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: C.sky }}>Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: C.dark }}>
            Everything you need to build & close your pipeline
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: C.muted }}>
            DineLead replaces your fragmented workflow — Google Maps + spreadsheets + email drafts — with one unified tool.
          </p>
        </FadeIn>

        <div className="space-y-20 md:space-y-28">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={0.1}>
              <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
                <div style={{ direction: "ltr" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${C.sky}12` }}>
                    <f.icon size={22} style={{ color: C.sky }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: C.dark }}>{f.title}</h3>
                  <p className="leading-relaxed mb-5" style={{ color: C.muted }}>{f.desc}</p>
                  <a href="#how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.sky }}>
                    Learn more <ChevronRight size={14} />
                  </a>
                </div>
                <div style={{ direction: "ltr" }}>
                  <BrowserMockup>{f.mockup}</BrowserMockup>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ Feature mockups ═══════ */
function ScrapingMockup() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 rounded-lg px-3 flex items-center gap-2 text-sm" style={{ border: `1px solid ${C.border}`, color: C.muted }}>
          <MapPin size={14} style={{ color: C.sky }} />
          Jakarta, Indonesia
        </div>
        <div className="h-10 px-4 rounded-lg flex items-center text-sm font-medium" style={{ border: `1px solid ${C.border}`, color: C.muted }}>
          5 km
        </div>
        <button className="h-10 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.skyMid }}>
          Scrape
        </button>
      </div>
      <div className="rounded-lg p-4" style={{ background: C.light, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold" style={{ color: C.dark }}>Scraping Progress</span>
          <span className="text-xs font-bold" style={{ color: C.skyBright }}>78%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
          <div className="h-full rounded-full" style={{ width: "78%", background: C.skyBright }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: C.muted }}>156 restaurants found</span>
          <span className="text-xs" style={{ color: C.muted }}>~30s remaining</span>
        </div>
      </div>
    </div>
  );
}

function PipelineMockup() {
  const cols = [
    { title: "New", color: "#94a3b8", items: ["Bakmi GM", "Es Teler 77"] },
    { title: "Prospect", color: C.sky, items: ["Sate Khas Senayan", "J.CO Donuts"] },
    { title: "Contacted", color: "#f59e0b", items: ["Solaria"] },
    { title: "Closed", color: C.skyBright, items: ["HokBen"] },
  ];
  return (
    <div className="p-5">
      <div className="grid grid-cols-4 gap-3">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-xs font-semibold" style={{ color: C.dark }}>{col.title}</span>
              <span className="text-[10px] font-medium px-1.5 rounded" style={{ background: C.light, color: C.muted }}>{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((item) => (
                <div key={item} className="p-2.5 rounded-lg text-xs font-medium" style={{ background: C.light, border: `1px solid ${C.border}`, color: C.text }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: C.sky }} />
        <span className="text-xs font-bold" style={{ color: C.sky }}>AI Email Generator</span>
      </div>
      <div className="rounded-lg p-4 space-y-3" style={{ border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <span className="text-xs font-medium" style={{ color: C.muted }}>To:</span>
          <span className="text-xs" style={{ color: C.text }}>contact@sushitei.co.id</span>
        </div>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <span className="text-xs font-medium" style={{ color: C.muted }}>Subject:</span>
          <span className="text-xs" style={{ color: C.text }}>Partnership Opportunity for Sushi Tei</span>
        </div>
        <div className="space-y-2 text-xs leading-relaxed" style={{ color: C.muted }}>
          <p>Dear Sushi Tei Team,</p>
          <p>I came across your restaurant on our platform and was impressed by your 4.5-star rating and excellent reviews...</p>
          <div className="flex gap-1.5 pt-1">
            <span className="h-1.5 rounded-full" style={{ width: "90%", background: C.border }} />
          </div>
          <div className="flex gap-1.5">
            <span className="h-1.5 rounded-full" style={{ width: "70%", background: C.border }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {["Professional", "Friendly", "Casual"].map((t, i) => (
          <button key={t} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors" style={{
            background: i === 0 ? `${C.sky}15` : "transparent",
            color: i === 0 ? C.sky : C.muted,
            border: `1px solid ${i === 0 ? C.sky + "30" : C.border}`,
          }}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportMockup() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: C.dark }}>Export Data</span>
        <span className="text-xs" style={{ color: C.muted }}>1,247 leads selected</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { fmt: "Excel", ext: ".xlsx", active: true },
          { fmt: "CSV", ext: ".csv", active: false },
          { fmt: "JSON", ext: ".json", active: false },
        ].map((f) => (
          <button key={f.fmt} className="p-3 rounded-lg text-center transition-colors" style={{
            border: `2px solid ${f.active ? C.sky : C.border}`,
            background: f.active ? `${C.sky}08` : C.white,
          }}>
            <div className="text-sm font-bold mb-0.5" style={{ color: f.active ? C.sky : C.text }}>{f.fmt}</div>
            <div className="text-[10px]" style={{ color: C.muted }}>{f.ext}</div>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {["Name & Address", "Phone & Website", "Rating & Reviews", "Status & Notes"].map((field) => (
          <label key={field} className="flex items-center gap-2.5 text-xs cursor-pointer" style={{ color: C.text }}>
            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${C.skyBright}15`, border: `1px solid ${C.skyBright}40` }}>
              <Check size={10} style={{ color: C.skyBright }} />
            </span>
            {field}
          </label>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: C.skyMid }}>
        Download Export
      </button>
    </div>
  );
}

/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */
/* ═══════════════════════ MORE FEATURES (cards) ═══════════════════════ */
const moreFeatures = [
  { icon: Activity, title: "Activity & Notes Tracking", desc: "Log every call, email, meeting and follow-up. Add notes to any lead. Full interaction history." },
  { icon: BarChart3, title: "Real-Time Dashboard", desc: "Total leads, conversion rates, average ratings and recent activity at a glance. Auto-refreshing stats." },
  { icon: Globe, title: "Worldwide Coverage", desc: "Scrape restaurants from any city in the world. Powered by OpenStreetMap — no geographical restrictions." },
];

function MoreFeatures() {
  return (
    <section className="py-20 md:py-28" style={{ background: C.white }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {moreFeatures.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="p-8 rounded-xl transition-shadow hover:shadow-lg" style={{ border: `1px solid ${C.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${C.sky}10` }}>
                  <f.icon size={22} style={{ color: C.sky }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ STATS BAR ═══════════════════════ */
function StatsBar() {
  return (
    <section className="py-16" style={{ background: C.skyDark }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: "200+", label: "Restaurants per scan" },
            { value: "<2 min", label: "Average scan time" },
            { value: "3", label: "Export formats" },
            { value: "0", label: "API keys required" },
          ].map((s) => (
            <FadeIn key={s.label}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm" style={{ color: "#94a3b8" }}>{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ CTA ═══════════════════════ */
function CtaSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: C.ctaGradient }}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
            Start building your restaurant pipeline today
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            No credit card required. No API keys needed. Free to start.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-lg text-base transition-all hover:brightness-110" style={{ background: C.white, color: C.skyMid }}>
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════ FOOTER ═══════════════════════ */
function Footer() {
  const columns = [
    { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Dashboard", href: "/login" }] },
    { title: "Resources", links: [{ label: "Documentation", href: "#" }, { label: "API Reference", href: "#" }, { label: "Changelog", href: "#" }] },
    { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }, { label: "GitHub", href: "#" }] },
  ];

  return (
    <footer style={{ background: C.dark }}>
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            {/* <div className="flex items-center gap-1.5 font-bold text-lg text-white mb-3">
              <Globe size={18} style={{ color: C.sky }} />
              Dine<span style={{ color: C.sky }}>Lead</span>
            </div> */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: C.dark }}>
              <Image src="/site-logo-DL-removebg-preview.png" alt="DineLead" width={100} height={100} className="rounded-md" />
              {/* <span>Dine<span style={{ color: C.sky }}>Lead</span></span> */}
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
              Restaurant CRM & lead scraping platform. From discovery to deal, all in one place.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "Prisma", "Tailwind", "OpenStreetMap"].map((b) => (
                <span key={b} className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#64748b" }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#94a3b8" }}>{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: "#64748b" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-xs" style={{ color: "#475569" }}>&copy; {new Date().getFullYear()} DineLead. All rights reserved.</span>
          <span className="text-xs" style={{ color: "#334155" }}>Built for the restaurant industry.</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function LandingPage() {
  return (
    <div style={{ background: C.white, color: C.text }}>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorksB />
      <MoreFeatures />
      <StatsBar />
      <CtaSection />
      <Footer />
    </div>
  );
}
