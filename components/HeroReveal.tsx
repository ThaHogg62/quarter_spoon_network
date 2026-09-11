"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function HeroReveal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const emblemRef = useRef<HTMLDivElement | null>(null);

  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const opacityRef = useRef(0);

  // QSE Emblem 3D rotation & parallax state
  const emblemRot = useRef({ x: 0, y: 0, z: 0, tx: 0, ty: 0 });

  // Spotlight radius: 104px
  const RADIUS = 104;

  useEffect(() => {
    let animId: number;

    const animate = () => {
      // Smooth cursor-following movement with slight easing/lerp
      const LERP_FACTOR = 0.16;
      const OPACITY_LERP = 0.15;

      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * LERP_FACTOR;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * LERP_FACTOR;

      const targetOpacity = isHoveringRef.current ? 1 : 0;
      opacityRef.current += (targetOpacity - opacityRef.current) * OPACITY_LERP;

      const x = currentPos.current.x.toFixed(2);
      const y = currentPos.current.y.toFixed(2);
      const opacity = opacityRef.current;

      // Update cursor spotlight mask
      if (revealRef.current) {
        if (opacity < 0.002) {
          revealRef.current.style.visibility = "hidden";
          revealRef.current.style.opacity = "0";
        } else {
          revealRef.current.style.visibility = "visible";
          revealRef.current.style.opacity = opacity.toFixed(3);

          const mask = `radial-gradient(circle ${RADIUS}px at ${x}px ${y}px, black 0%, black 48px, rgba(0, 0, 0, 0.75) 74px, rgba(0, 0, 0, 0.18) 96px, transparent ${RADIUS}px)`;
          revealRef.current.style.webkitMaskImage = mask;
          revealRef.current.style.maskImage = mask;
        }
      }

      // Update ambient spotlight glow
      if (glowRef.current) {
        if (opacity < 0.002) {
          glowRef.current.style.visibility = "hidden";
          glowRef.current.style.opacity = "0";
        } else {
          glowRef.current.style.visibility = "visible";
          glowRef.current.style.opacity = (opacity * 0.9).toFixed(3);
          glowRef.current.style.transform = `translate3d(${parseFloat(x) - RADIUS}px, ${parseFloat(y) - RADIUS}px, 0)`;
        }
      }

      // ================================================================
      // 3D QSE EMBLEM CURSOR TRACKING
      // Calculate 3D perspective orientation towards cursor
      // ================================================================
      if (emblemRef.current && containerRef.current) {
        let targetRotY = 0;
        let targetRotX = 0;
        let targetRotZ = 0;
        let targetTx = 0;
        let targetTy = 0;

        if (isHoveringRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const emblemRect = emblemRef.current.getBoundingClientRect();

          // Center of the emblem medallion
          const centerX = emblemRect.left - containerRect.left + emblemRect.width * 0.5;
          const centerY = emblemRect.top - containerRect.top + emblemRect.height * 0.5;

          const dx = currentPos.current.x - centerX;
          const dy = currentPos.current.y - centerY;

          const spanX = Math.max(window.innerWidth * 0.7, 600);
          const spanY = Math.max(window.innerHeight * 0.6, 400);

          const normX = Math.max(-1, Math.min(1, dx / spanX));
          const normY = Math.max(-1, Math.min(1, dy / spanY));

          // 3D rotation angles:
          // dx < 0 (cursor to left) -> rotateY turns left (negative)
          targetRotY = normX * 24;
          // dy < 0 (cursor above) -> rotateX tilts up (negative in 3D pitch)
          targetRotX = -normY * 18;
          // Natural tilt roll
          targetRotZ = normX * 5;
          // Parallax float towards cursor
          targetTx = normX * 14;
          targetTy = normY * 8;
        }

        // Smooth organic LERP for lifelike inertia
        const EMBLEM_LERP = 0.08;
        emblemRot.current.y += (targetRotY - emblemRot.current.y) * EMBLEM_LERP;
        emblemRot.current.x += (targetRotX - emblemRot.current.x) * EMBLEM_LERP;
        emblemRot.current.z += (targetRotZ - emblemRot.current.z) * EMBLEM_LERP;
        emblemRot.current.tx += (targetTx - emblemRot.current.tx) * EMBLEM_LERP;
        emblemRot.current.ty += (targetTy - emblemRot.current.ty) * EMBLEM_LERP;

        emblemRef.current.style.transform = `
          perspective(1000px)
          translate3d(${emblemRot.current.tx.toFixed(2)}px, ${emblemRot.current.ty.toFixed(2)}px, 0)
          rotateX(${emblemRot.current.x.toFixed(2)}deg)
          rotateY(${emblemRot.current.y.toFixed(2)}deg)
          rotateZ(${emblemRot.current.z.toFixed(2)}deg)
        `;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [RADIUS]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };

    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      if (opacityRef.current < 0.05) {
        currentPos.current = { x, y };
      }
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };
    currentPos.current = { x, y };
    isHoveringRef.current = true;
  };

  const handlePointerLeave = () => {
    isHoveringRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative w-screen h-screen bg-black overflow-hidden select-none cursor-crosshair"
    >
      {/* ================================================================ */}
      {/* LAYER 0: BASE HERO IMAGE                                         */}
      {/* Full screen, zero black side rectangles, uncompressed 8K quality */}
      {/* ================================================================ */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_base_hd.jpg"
          alt="Quarter Spoon Studio Control Room - Where The Visuals Live"
          fill
          priority
          unoptimized
          className="object-cover object-top"
        />
        {/* Soft bottom-left ambient gradient for text legibility */}
        <div className="absolute left-0 bottom-0 w-full max-w-xl h-96 bg-gradient-to-tr from-black/85 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* ================================================================ */}
      {/* LAYER 1: REVEAL IMAGE                                           */}
      {/* Full screen, perfectly aligned with Base layer                   */}
      {/* Masked via 104px cursor-following radial gradient               */}
      {/* pointer-events: none, completely hidden outside spotlight       */}
      {/* ================================================================ */}
      <div
        ref={revealRef}
        style={{
          pointerEvents: "none",
          visibility: "hidden",
          opacity: 0,
        }}
        className="absolute inset-0 z-10 will-change-[mask-image,-webkit-mask-image,opacity]"
      >
        <Image
          src="/images/hero_reveal_hd.jpg"
          alt="Quarter Spoon Studio Control Room - Spotlight Reveal"
          fill
          priority
          unoptimized
          className="object-cover object-top"
        />
      </div>

      {/* Soft luminous glowing rim at the spotlight boundary */}
      <div
        ref={glowRef}
        style={{
          pointerEvents: "none",
          visibility: "hidden",
          opacity: 0,
          width: `${RADIUS * 2}px`,
          height: `${RADIUS * 2}px`,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0) 62%, rgba(251, 191, 36, 0.2) 84%, rgba(245, 158, 11, 0.38) 95%, rgba(251, 191, 36, 0) 100%)",
          boxShadow: "0 0 24px 3px rgba(251, 191, 36, 0.25)",
        }}
        className="absolute top-0 left-0 z-15 will-change-transform"
      />

      {/* ================================================================ */}
      {/* LAYER 2: HERO TEXT & CONTROLS (z-30, above reveal layer)        */}
      {/* Positioned on far left edge, leaving the console open            */}
      {/* ================================================================ */}
      <div className="absolute left-6 sm:left-10 md:left-14 bottom-8 sm:bottom-12 z-30 max-w-sm sm:max-w-md pointer-events-auto">
        <div className="space-y-3 sm:space-y-4">
          {/* Tag */}
          <div className="inline-flex items-center space-x-2 backdrop-blur-md bg-black/60 border border-amber-500/40 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[2.5px] text-amber-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>QUARTER SPOON NETWORK • IMMERSIVE VISUAL EXPERIENCE</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-wider leading-[1.08] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Where The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-cyan-400">
              Visuals Live
            </span>
          </h1>

          {/* Description */}
          <p className="text-zinc-200 text-xs sm:text-sm font-light leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Experience the flagship studio control room in real time. Move your
            cursor across the deck to illuminate the spotlight and reveal the studio daylight frequency.
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* LAYER 3: 3D QSE EMBLEM ON RIGHT SIDE (z-25)                     */}
      {/* Replaces Hogg model, retaining all 3D cursor-tracking movements  */}
      {/* ================================================================ */}
      <div
        className="absolute right-4 sm:right-8 md:right-14 lg:right-20 bottom-10 sm:bottom-16 md:bottom-20 z-25 pointer-events-none select-none"
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={emblemRef}
          style={{
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          className="relative w-[104px] sm:w-[128px] md:w-[160px] lg:w-[184px] xl:w-[200px] max-w-[25vw] aspect-[939/728]"
        >
          <Image
            src="/images/qse_emblem.png"
            alt="QSE Emblem - Quarter Spoon Network"
            fill
            priority
            unoptimized
            className="object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] drop-shadow-[0_0_60px_rgba(56,189,248,0.35)]"
          />
        </div>
      </div>
    </div>
  );
}
