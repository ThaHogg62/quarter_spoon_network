"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Zap, Fingerprint, Compass, Radio, ArrowRight } from "lucide-react";
import VideoTransition from "@/components/VideoTransition";

export default function CinematicStorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const enterZoneBtnRef = useRef<HTMLDivElement | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Editorial text refs for staggered exit animations
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animId: number;

    const updateScroll = () => {
      if (!sectionRef.current || !frameRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const totalScroll = sectionRef.current.offsetHeight - window.innerHeight;
      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScroll;
      const progress = Math.max(0, Math.min(1, rawProgress));

      const vw = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
      const vh = window.innerHeight;

      // ================================================================
      // 1. INITIAL STATE: STRICT 9:16 VERTICAL PORTRAIT
      // ================================================================
      const initialW = Math.min(280, Math.max(160, vw * 0.70));
      const initialH = Math.min(initialW * (16 / 9), vh * 0.58);

      // ================================================================
      // 2. FULLY OPENED STATE: STRICT 16:9 ASPECT RATIO
      // Sized to comfortably fit the screen so the top-left logo is 100% visible
      // ================================================================
      const TARGET_RATIO = 16 / 9;

      const maxAvailableH = Math.min(vh - 48, vh * 0.88);
      const maxAvailableW = Math.min(vw - 24, maxAvailableH * TARGET_RATIO);

      let finalW = maxAvailableW;
      let finalH = finalW / TARGET_RATIO;
      if (finalH > maxAvailableH) {
        finalH = maxAvailableH;
        finalW = finalH * TARGET_RATIO;
      }

      // Expansion phase: from progress 0.0 to 0.82
      const expandPhase = Math.min(1, Math.max(0, progress / 0.82));
      const easedExpand =
        expandPhase < 0.5
          ? 4 * expandPhase * expandPhase * expandPhase
          : 1 - Math.pow(-2 * expandPhase + 2, 3) / 2;

      // Smooth interpolation from 9:16 portrait to final 16:9 cinema frame
      const currentW = initialW + (finalW - initialW) * easedExpand;
      const currentH = initialH + (finalH - initialH) * easedExpand;
      const currentRadius = Math.max(0, 24 * (1 - easedExpand * 1.3));
      const currentBorderOpacity = Math.max(0, 1 - easedExpand * 2.5);

      frameRef.current.style.width = `${currentW.toFixed(1)}px`;
      frameRef.current.style.height = `${currentH.toFixed(1)}px`;
      frameRef.current.style.borderRadius = `${currentRadius.toFixed(1)}px`;
      frameRef.current.style.border =
        currentBorderOpacity <= 0.01
          ? "none"
          : `1px solid rgba(255, 255, 255, ${(currentBorderOpacity * 0.2).toFixed(3)})`;
      frameRef.current.style.boxShadow =
        easedExpand > 0.85
          ? "0 20px 60px rgba(0, 0, 0, 0.9)"
          : `0 25px 70px rgba(0, 0, 0, ${((1 - easedExpand) * 0.95).toFixed(2)})`;

      // Ambient card halo glow fades as image expands
      if (glowRef.current) {
        glowRef.current.style.opacity = Math.max(0, (1 - easedExpand * 1.8) * 0.6).toFixed(3);
        glowRef.current.style.width = `${currentW + 80}px`;
        glowRef.current.style.height = `${currentH + 80}px`;
      }

      // Scroll hint indicator fades fast (progress 0 -> 0.12)
      if (scrollIndicatorRef.current) {
        const hintOpacity = Math.max(0, 1 - progress / 0.12);
        scrollIndicatorRef.current.style.opacity = hintOpacity.toFixed(3);
        scrollIndicatorRef.current.style.transform = `translateY(${progress * 60}px)`;
      }

      // ================================================================
      // ENTER THA ZONE BUTTON REVEAL
      // Appears ONLY when user scrolls all the way down and full image is revealed
      // ================================================================
      if (enterZoneBtnRef.current) {
        if (progress < 0.78) {
          enterZoneBtnRef.current.style.opacity = "0";
          enterZoneBtnRef.current.style.visibility = "hidden";
          enterZoneBtnRef.current.style.pointerEvents = "none";
          enterZoneBtnRef.current.style.transform = "translate3d(0, 24px, 0) scale(0.92)";
        } else {
          // Reveal smoothly between progress 0.78 and 0.94
          const btnPhase = Math.min(1, (progress - 0.78) / 0.16);
          const easedBtn = 1 - Math.pow(1 - btnPhase, 3);
          const translateY = (1 - easedBtn) * 24;
          const scale = 0.92 + easedBtn * 0.08;

          enterZoneBtnRef.current.style.opacity = easedBtn.toFixed(3);
          enterZoneBtnRef.current.style.visibility = "visible";
          enterZoneBtnRef.current.style.pointerEvents = "auto";
          enterZoneBtnRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        }
      }

      // ================================================================
      // STAGGERED EDITORIAL TEXT EXITS (Organized Chaos)
      // ================================================================
      const textConfigs = [
        // 0: Top-left pill badge
        { start: 0.04, end: 0.26, tx: -60, ty: -20, rot: -8, scale: 0.88 },
        // 1: Left high-impact title
        { start: 0.08, end: 0.32, tx: -90, ty: 10, rot: 4, scale: 0.92 },
        // 2: Left technical manifesto
        { start: 0.12, end: 0.38, tx: -70, ty: 40, rot: -5, scale: 0.85 },
        // 3: Top-right archival stamp
        { start: 0.06, end: 0.28, tx: 70, ty: -30, rot: 12, scale: 0.85 },
        // 4: Right holographic telemetry badge
        { start: 0.14, end: 0.42, tx: 100, ty: -10, rot: -6, scale: 0.9 },
        // 5: Right quote
        { start: 0.18, end: 0.46, tx: 80, ty: 35, rot: 8, scale: 0.88 },
        // 6: Bottom-left coordinate stamp
        { start: 0.10, end: 0.35, tx: -50, ty: 50, rot: -4, scale: 0.9 },
        // 7: Bottom-right production index
        { start: 0.22, end: 0.50, tx: 60, ty: 60, rot: 6, scale: 0.85 },
      ];

      textConfigs.forEach((cfg, idx) => {
        const el = textRefs.current[idx];
        if (!el) return;

        if (progress <= cfg.start) {
          el.style.opacity = "1";
          el.style.transform = "translate3d(0, 0, 0) scale(1)";
          el.style.visibility = "visible";
        } else if (progress >= cfg.end) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        } else {
          const t = (progress - cfg.start) / (cfg.end - cfg.start);
          const easeOut = 1 - (1 - t) * (1 - t);
          const currentOpacity = 1 - easeOut;
          const currentTx = cfg.tx * easeOut;
          const currentTy = cfg.ty * easeOut;
          const currentRot = cfg.rot * easeOut;
          const currentScale = 1 - (1 - cfg.scale) * easeOut;

          el.style.opacity = currentOpacity.toFixed(3);
          el.style.visibility = "visible";
          el.style.transform = `translate3d(${currentTx.toFixed(1)}px, ${currentTy.toFixed(1)}px, 0) rotate(${currentRot.toFixed(1)}deg) scale(${currentScale.toFixed(2)})`;
        }
      });

      animId = requestAnimationFrame(updateScroll);
    };

    animId = requestAnimationFrame(updateScroll);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-full h-[320vh] bg-black text-white selection:bg-cyan-500 selection:text-black overflow-hidden"
    >
      {/* Sticky full-viewport frame that holds the interactive gallery canvas */}
      <div className="sticky top-0 w-full max-w-full h-screen h-[100dvh] overflow-hidden flex items-center justify-center bg-black">
        {/* Deep pure black canvas backdrop */}
        <div className="absolute inset-0 bg-black pointer-events-none" />

        {/* Ambient cyan/blue glow matching the holographic elements */}
        <div
          ref={glowRef}
          style={{
            pointerEvents: "none",
            filter: "blur(60px)",
          }}
          className="absolute rounded-full bg-gradient-to-tr from-cyan-600/30 via-indigo-600/25 to-amber-500/15 will-change-[width,height,opacity]"
        />

        {/* ================================================================ */}
        {/* EDITORIAL ORGANIZED CHAOS TEXT ELEMENTS (Staggered exit)         */}
        {/* ================================================================ */}

        {/* 0: Top-Left Pill Badge */}
        <div
          ref={(el) => {
            textRefs.current[0] = el;
          }}
          className="absolute top-8 sm:top-12 left-4 sm:left-12 lg:left-20 z-20 pointer-events-none will-change-transform max-w-[calc(100vw-2rem)]"
        >
          <div className="inline-flex items-center space-x-2 bg-black/70 backdrop-blur-md border border-cyan-500/30 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] tracking-wider sm:tracking-[3px] uppercase text-cyan-300 shadow-2xl">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono">EXHIBITION 01 // FREQUENCY</span>
          </div>
        </div>

        {/* 1: Left High-Impact Title */}
        <div
          ref={(el) => {
            textRefs.current[1] = el;
          }}
          className="absolute left-4 sm:left-12 lg:left-20 top-20 sm:top-36 z-20 max-w-[200px] sm:max-w-xs pointer-events-none will-change-transform"
        >
          <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-[2px] sm:tracking-[4px] text-amber-400 mb-1">
            Q.S.N ARCHIVE SPECIMEN
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Tha <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Visuals
            </span>
          </h2>
        </div>

        {/* 2: Left Technical Manifesto - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[2] = el;
          }}
          className="absolute left-6 sm:left-12 lg:left-20 bottom-24 sm:bottom-32 z-20 max-w-[240px] sm:max-w-xs pointer-events-none will-change-transform hidden md:block"
        >
          <div className="border-l-2 border-amber-500/60 pl-3.5 space-y-1.5">
            <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed">
              &ldquo;Where the audio, visual, and physical reality cross into an unfiltered
              dimension.&rdquo;
            </p>
            <span className="block font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              THA HOGG // QUARTER SPOON NETWORK
            </span>
          </div>
        </div>

        {/* 3: Top-Right Archival Stamp - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[3] = el;
          }}
          className="absolute top-12 right-6 sm:right-12 lg:right-24 z-20 pointer-events-none will-change-transform hidden md:block"
        >
          <div className="flex flex-col items-end text-right font-mono text-[10px] text-zinc-400 space-y-0.5">
            <div className="flex items-center space-x-1 text-emerald-400">
              <Zap className="w-3 h-3" />
              <span className="tracking-widest">TRANSMISSION ACTIVE</span>
            </div>
            <span className="text-zinc-500 text-[9px] tracking-wider">CODE: 559-QSE-HOGG</span>
          </div>
        </div>

        {/* 4: Right Holographic Telemetry Badge - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[4] = el;
          }}
          className="absolute right-6 sm:right-12 lg:right-20 top-32 sm:top-40 z-20 max-w-[220px] sm:max-w-xs pointer-events-none will-change-transform text-right hidden md:block"
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl inline-block text-left">
            <div className="flex items-center justify-between space-x-3 mb-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                HOLOGRAPHIC DECK
              </span>
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[10px] text-zinc-300 leading-snug font-sans">
              Mic • Revolver • Chalk Outline. Three tokens suspended in palm-field levitation.
            </p>
          </div>
        </div>

        {/* 5: Right Rotated Editorial Callout - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[5] = el;
          }}
          className="absolute right-6 sm:right-12 lg:right-20 bottom-36 z-20 pointer-events-none will-change-transform hidden lg:block"
        >
          <div className="flex items-center space-x-3 text-zinc-400 font-mono text-[10px] rotate-2">
            <span className="w-8 h-[1px] bg-amber-500/50" />
            <span className="tracking-[3px] uppercase text-amber-300">FRWSNO ORIGINAL</span>
          </div>
        </div>

        {/* 6: Bottom-Left Coordinate Stamp - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[6] = el;
          }}
          className="absolute left-6 sm:left-12 lg:left-20 bottom-8 z-20 pointer-events-none will-change-transform hidden sm:block"
        >
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 tracking-wider">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span>36.7468° N, 119.7726° W • SEC_02</span>
          </div>
        </div>

        {/* 7: Bottom-Right Production Index - desktop only */}
        <div
          ref={(el) => {
            textRefs.current[7] = el;
          }}
          className="absolute right-6 sm:right-12 lg:right-20 bottom-8 z-20 pointer-events-none will-change-transform text-right hidden sm:block"
        >
          <span className="font-mono text-[9px] uppercase tracking-[3px] text-zinc-500">
            CINEMATIC CANVAS 02 / EXPANSION STATE
          </span>
        </div>

        {/* ================================================================ */}
        {/* CENTER IMAGE FRAME                                               */}
        {/* Initial: 9:16 vertical portrait with generous negative space     */}
        {/* Final: Strict 16:9 cinema ratio, sized to fit the logo cleanly   */}
        {/* ================================================================ */}
        <div
          ref={frameRef}
          style={{
            willChange: "width, height, border-radius, box-shadow",
          }}
          className="relative overflow-hidden z-10 bg-black flex items-center justify-center transition-[filter] duration-300"
        >
          <Image
            src="/images/story_art.jpg"
            alt="Tha Hogg - Holographic Living Room - Quarter Spoon Network"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />

          {/* Subtle cinematic edge vignette inside the frame */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        {/* Scroll hint indicator at the start */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-6 z-30 flex flex-col items-center space-y-1.5 pointer-events-none will-change-transform"
        >
          <span className="text-[9px] sm:text-[10px] font-mono tracking-[3px] sm:tracking-[4px] uppercase text-zinc-400">
            Scroll to Expand Canvas
          </span>
          <div className="w-4 h-7 border border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </div>

        {/* ================================================================ */}
        {/* ENTER THA ZONE BUTTON: REVEALED ONLY WHEN SCROLLED ALL THE WAY DOWN */}
        {/* Navy Blue with White Lettering, transitions to /tha-visuals       */}
        {/* ================================================================ */}
        <div
          ref={enterZoneBtnRef}
          style={{
            opacity: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
          className="absolute bottom-6 left-4 sm:bottom-12 sm:left-12 z-40 will-change-transform max-w-[calc(100vw-2rem)]"
        >
          <button
            onClick={() => setIsTransitioning(true)}
            className="flex items-center space-x-2.5 sm:space-x-3 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/50 hover:border-cyan-400 font-black text-xs uppercase tracking-[2px] sm:tracking-[2.5px] px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-[0_4px_30px_rgba(11,26,48,0.95)] transition-all active:scale-95 cursor-pointer group"
          >
            <Radio className="w-4 h-4 text-cyan-400 group-hover:animate-pulse shrink-0" />
            <span>Enter Tha Zone</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Full-Screen Video Transition */}
        <VideoTransition
          isOpen={isTransitioning}
          onClose={() => setIsTransitioning(false)}
          targetUrl="/tha-visuals"
          videoSrc="/videos/ENTER THA ZONE.mp4"
        />
      </div>
    </section>
  );
}
