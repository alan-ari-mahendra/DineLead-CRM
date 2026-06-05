import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";
import { Building2, BarChart3, Download } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* ── LEFT PANEL — Brand / Hero ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col bg-emerald-800 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-950/40 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/favicon-DL-removebg-preview.png"
                alt="DineLead"
                width={124}
                height={124}
              />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight leading-none">
                DineLead
              </span>
              <p className="text-emerald-300 text-[10.5px] font-semibold uppercase tracking-widest leading-none mt-1.5">
                CRM Platform
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="my-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-200 text-xs font-medium">
                Free to get started
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Start building
              <br />
              your <span className="text-emerald-300">restaurant</span>
              <br />
              lead pipeline.
            </h1>
            <p className="text-emerald-200/80 text-base leading-relaxed max-w-sm">
              Join sales teams using DineLead to discover, qualify, and convert
              restaurant prospects faster than ever.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-col gap-3 mt-auto">
            {[
              {
                icon: Building2,
                label: "Automated restaurant data scraping from Google Maps",
              },
              {
                icon: BarChart3,
                label: "Real-time lead pipeline & conversion tracking",
              },
              {
                icon: Download,
                label: "One-click export to CSV & Excel for your outreach",
              },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-emerald-300" />
                </div>
                <span className="text-emerald-100/80 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
              <Image
                src="/favicon-DL-removebg-preview.png"
                alt="DineLead"
                width={28}
                height={28}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-sm tracking-tight leading-none">
                DineLead
              </span>
              <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider leading-none mt-1">
                CRM
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Get started for free, no credit card required
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
