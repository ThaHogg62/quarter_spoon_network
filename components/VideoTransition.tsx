"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Volume2, VolumeX } from "lucide-react";

interface VideoTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
  videoSrc?: string;
}

export default function VideoTransition({
  isOpen,
  onClose,
  targetUrl = "/tha-visuals",
  videoSrc = "/videos/ENTER THA ZONE.mp4",
}: VideoTransitionProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay with sound blocked, unmuting on click:", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    router.push(targetUrl);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    router.push(targetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Cinematic Full-screen Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        onEnded={handleEnded}
        playsInline
        autoPlay
        className="w-full h-full object-cover"
      />

      {/* Top Controls: Audio toggle & Skip */}
      <div className="absolute top-6 right-6 z-50 flex items-center space-x-3">
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
              setIsMuted(videoRef.current.muted);
            }
          }}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={handleSkip}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono tracking-wider text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Transitioning Badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md border border-cyan-500/40 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-[3px] text-cyan-300 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>ENTERING THA ZONE // CONNECTING TO THA VISUALS</span>
        </div>
      </div>
    </div>
  );
}
