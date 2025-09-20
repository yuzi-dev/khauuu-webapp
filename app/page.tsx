import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import PopularFoodsSection from "@/components/PopularFoodsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PopularFoodsSection />
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
}