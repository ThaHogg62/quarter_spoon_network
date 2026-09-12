"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowLeft,
  Film,
  Sparkles,
  Radio,
  Clock,
  Layers,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration?: string;
  videoSrc?: string;
  thumbnail: string;
  description: string;
  badge?: string;
  externalUrl?: string;
}

export default function ThaVisualsPage() {
  const videoList: VideoItem[] = [
    {
      id: "in-every-section",
      title: "IN EVERY SECTION",
      category: "WEST FRESNO",
      duration: "3:37",
      videoSrc: "/videos/in_every_section.mp4",
      thumbnail: "/images/in_every_section_thumb.jpg",
      description:
        'This is a small dedication to the streets of West Fresno, because the truth of the matter is. There\'s a "G" from EVERY Section',
      badge: "WEST FRESNO DEDICATION",
    },
    {
      id: "tha-hogg-channel",
      title: "THA HOGG // VISUAL CREATIONS",
      category: "OFFICIAL YOUTUBE",
      duration: "VISIT",
      thumbnail: "/images/tha_hogg_channel_thumb.jpg",
      description:
        "This is the spot for Tha Hogg's visual creations. Clicc Tha Link!",
      badge: "YOUTUBE CHANNEL",
      externalUrl: "https://www.youtube.com/@QuarterSpoonMuzicc",
    },
    {
      id: "tha-game-should-be-told",
      title: "THA GAME SHOULD BE TOLD",
      category: "A.I. TUTORIAL // YOUTUBE",
      duration: "3-PART SERIES",
      thumbnail: "/images/tha_game_should_be_told_thumb.jpg",
      description:
        "An Immersive 3 Part Tutorial On Getting Started WIth A.I. Image And Video Generation. For Beginners As Well As Those Who Might Need A Recap.",
      badge: "A.I. TUTORIAL",
      externalUrl:
        "https://www.youtube.com/watch?v=4bPuq5yQtYo&list=PLvm8QthVzy2xslQiPpWC6IHbLfZwzLzMu&pp=0gcJCbwFa94AFGB0sAgC",
    },
    {
      id: "scene-of-screams",
      title: "SCENE OF SCREAMS",
      category: "ORIGINAL FILMS // YOUTUBE",
      duration: "CHANNEL",
      thumbnail: "/images/scene_of_screams_thumb.jpg",
      description:
        "This Is The Spot To View The Latest Original Films From Unda Tha Radar Filmz",
      badge: "ORIGINAL FILMS",
      externalUrl: "https://www.youtube.com/@SeenYouScream",
    },
  ];

  const { user, logout } = useAuth();

  const [activeVideo, setActiveVideo] = useState<VideoItem>(videoList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  const recordPlayEvent = (item: VideoItem) => {
    try {
      fetch("/api/video/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: item.id,
          videoTitle: item.title,
          userEmail: user?.email,
          userName: user?.fullName,
          category: item.category,
        }),
      }).catch((e) => console.warn("Video play ping error:", e));
    } catch {
      // Non-blocking
    }
  };

  const handleSelectVideo = (item: VideoItem) => {
    recordPlayEvent(item);
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveVideo(item);
    setIsPlaying(true);
    if (videoPlayerRef.current && item.videoSrc) {
      videoPlayerRef.current.src = item.videoSrc;
      videoPlayerRef.current.currentTime = 0;
      videoPlayerRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoPlayerRef.current) return;
    if (videoPlayerRef.current.paused) {
      recordPlayEvent(activeVideo);
      videoPlayerRef.current.play();
      setIsPlaying(true);
    } else {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.muted = !videoPlayerRef.current.muted;
    setIsMuted(videoPlayerRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoPlayerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoPlayerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white selection:bg-cyan-500 selection:text-black">
      {/* ================================================================ */}
      {/* TOP NAVIGATION                                                   */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 md:px-12 backdrop-blur-xl bg-[#05060A]/85 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-3 pl-2 border-l border-white/10">
            <div className="relative w-8 h-10 sm:w-9 sm:h-11 shrink-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              <Image
                src="/images/unda_tha_radar_logo.png"
                alt="Unda Tha Radar Filmz"
                fill
                priority
                unoptimized
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold tracking-[0.2em] text-white text-xs uppercase block leading-none">
                Quarter Spoon
              </span>
              <span className="text-[9px] tracking-[0.25em] text-cyan-400 uppercase font-semibold">
                Tha Visuals Vault
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-emerald-400 bg-black/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">BROADCAST VAULT</span>
            <span className="sm:hidden">LIVE</span>
          </div>

          {user && (
            <div className="flex items-center space-x-2.5 bg-black/70 border border-white/15 px-3 py-1 rounded-full">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold text-[9px]">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-zinc-300 max-w-[120px] truncate">
                {user.fullName || user.email}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 rounded-full text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================================================================ */}
      {/* MAIN CINEMA THEATER SECTION                                      */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 md:px-12 space-y-12">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#0A192F] border border-blue-400/40 px-3.5 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-cyan-300 shadow-xl">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTER THA ZONE // VIDEO VAULT ACCESS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Tha{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Visuals
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl leading-relaxed">
            Direct access to all cinematic master transmissions, promotional visual pieces, and
            studio session archives from the Quarter Spoon Network world.
          </p>
        </div>

        {/* Featured Video Theater Screen */}
        <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          {/* Ambient Video Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-indigo-600/20 rounded-3xl blur-2xl -z-10 pointer-events-none" />

          {/* Video Element */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center group">
            <video
              ref={videoPlayerRef}
              src={activeVideo.videoSrc}
              poster={activeVideo.thumbnail}
              playsInline
              preload="metadata"
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {/* Standby Play Button Overlay when stopped / paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px] cursor-pointer transition-all hover:bg-black/30 z-20"
              >
                <div className="flex flex-col items-center space-y-3 transform transition-transform group-hover:scale-105">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
                  </div>
                  <span className="text-xs font-mono tracking-[3px] uppercase text-cyan-300 bg-black/80 border border-cyan-500/30 px-4 py-1.5 rounded-full shadow-lg">
                    Play Visual
                  </span>
                </div>
              </div>
            )}

            {/* In-video Overlay Controls */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity z-30">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-xl cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                </button>

                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                    {activeVideo.title}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-mono text-cyan-400 tracking-widest">
                    {activeVideo.category} • {activeVideo.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Metadata Panel */}
          <div className="p-6 sm:p-8 bg-[#090D17] border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-[2px] uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2.5 py-0.5 rounded-md">
                  {activeVideo.badge || "TRANSMISSION"}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  {isPlaying ? "NOW PLAYING IN 4K" : "STANDBY // 4K MASTER READY"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                {activeVideo.description}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={togglePlay}
                className="flex items-center space-x-2 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/40 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause Stream" : "Play Visual"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* VIDEO TRANSMISSIONS CATALOG GRID                                 */}
        {/* ================================================================ */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                Archival Transmissions
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Select any visual piece below to load it instantly into the main theatre display.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              {["ALL", "WEST FRESNO", "YOUTUBE", "ORIGINAL FILMS"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? "bg-white text-black font-bold"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {videoList
              .filter((item) => {
                if (activeFilter === "ALL") return true;
                if (activeFilter === "WEST FRESNO") return item.category.includes("WEST FRESNO");
                if (activeFilter === "YOUTUBE") return item.category.includes("YOUTUBE") || !!item.externalUrl;
                if (activeFilter === "ORIGINAL FILMS") return item.category.includes("FILM") || item.id === "scene-of-screams";
                return true;
              })
              .map((item) => {
                const isSelected = activeVideo.id === item.id;

                if (item.externalUrl) {
                  return (
                    <a
                      key={item.id}
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-2xl overflow-hidden bg-[#0A0E1A] border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] transition-all cursor-pointer flex flex-col"
                    >
                      {/* Thumbnail / Video Preview */}
                      <div className="relative aspect-video w-full bg-black overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* YouTube Play Badge */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md bg-[#0A192F]/90 text-cyan-400 border border-cyan-400/40 group-hover:scale-115 group-hover:bg-cyan-400 group-hover:text-black transition-all shadow-xl">
                            <YoutubeIcon className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Top Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="text-[9px] font-mono tracking-[2px] uppercase bg-black/75 backdrop-blur-md text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span>{item.badge}</span>
                          </span>
                        </div>

                        {/* Link Tag */}
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-[10px] font-mono bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-zinc-300">
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                          <span>{item.duration || "YOUTUBE"}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                              {item.category}
                            </span>
                            <span className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400 group-hover:underline">
                              <span>CLICC THA LINK</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>

                          <h3 className="font-extrabold text-sm tracking-wide uppercase text-white group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h3>

                          <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed mt-1">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">
                            <span>
                              {item.id === "tha-hogg-channel"
                                ? "Visit Channel"
                                : item.id === "scene-of-screams"
                                ? "Watch Unda Tha Radar Filmz"
                                : "Watch Tutorial Series"}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(item)}
                    className={`group relative rounded-2xl overflow-hidden bg-[#0A0E1A] border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.25)] ring-1 ring-cyan-400"
                        : "border-white/10 hover:border-white/25 hover:shadow-2xl"
                    }`}
                  >
                    {/* Thumbnail / Video Preview */}
                    <div className="relative aspect-video w-full bg-black overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Play Badge */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                            isSelected
                              ? "bg-cyan-400 text-black scale-110"
                              : "bg-black/60 text-white border border-white/20 group-hover:scale-110 group-hover:bg-white group-hover:text-black"
                          }`}
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Top Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-mono tracking-[2px] uppercase bg-black/70 backdrop-blur-md text-zinc-300 border border-white/10 px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-[10px] font-mono bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-zinc-300">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                          {item.category}
                        </span>
                        {isSelected && (
                          <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm tracking-wide uppercase text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </main>
    </div>
  );
}
