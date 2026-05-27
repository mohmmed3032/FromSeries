import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import EpisodeBrowser from "@/components/EpisodeBrowser";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Overview />
      <EpisodeBrowser />
      <Footer />
    </main>
  );
}
