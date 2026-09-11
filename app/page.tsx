import HeroReveal from "@/components/HeroReveal";
import CinematicStorySection from "@/components/CinematicStorySection";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Existing Hero Section (Unmodified) */}
      <HeroReveal />

      {/* Cinematic Scroll-Driven Storytelling Section */}
      <CinematicStorySection />
    </div>
  );
}
