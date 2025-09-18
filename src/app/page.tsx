'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// --- Components ---

const Header = () => {
  const { status } = useSession();
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-widest" style={{ textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff' }}>V-CLOSET</h1>
        <div className="flex items-center gap-4">
          {status === 'authenticated' ? (
            <Link href="/dashboard" className="px-6 py-2 rounded-md border border-cyan-400 text-cyan-400 font-semibold shadow-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors" style={{ boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff inset' }}>
              DASHBOARD
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2 text-cyan-400 font-semibold font-mono">
                LOGIN
              </Link>
              <Link href="/signup" className="px-6 py-2 rounded-md border border-cyan-400 text-cyan-400 font-semibold shadow-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors font-mono" style={{ boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff inset' }}>
                SIGN UP
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const { status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-cyan-500/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
        <div className={`max-w-4xl transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white uppercase font-mono" style={{ textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff' }}>
                <span className="text-cyan-400 animate-glitch">VIRTUAL</span> CLOSET
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-400 font-mono animate-typing">
                Your Imagination, Your Style. The Future of Fashion is Now.
            </p>
            <div className="mt-10">
                {status === 'authenticated' ? (
                    <Link href="/dashboard" className="transform rounded-md bg-cyan-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-transform hover:scale-105 hover:bg-cyan-300" style={{ textShadow: '0 0 5px #000' }}>
                        ENTER THE MATRIX
                    </Link>
                ) : (
                    <Link href="/signup" className="transform rounded-md bg-cyan-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-transform hover:scale-105 hover:bg-cyan-300" style={{ textShadow: '0 0 5px #000' }}>
                        JACK IN
                    </Link>
                )}
            </div>
        </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: "/file.svg",
      title: "MISSION 01: UPLOAD IDENTITY",
      description: "Upload your digital self. This is the foundation of your new reality."
    },
    {
      icon: "/window.svg",
      title: "MISSION 02: DEFINE STYLE",
      description: "Interface with the AI. Describe your desired aesthetic. The more data, the better the simulation."
    },
    {
      icon: "/globe.svg",
      title: "MISSION 03: RENDER REALITY",
      description: "Witness the AI construct your new look. A new you, rendered in real-time."
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-cyan-400 mb-12 font-mono" style={{ textShadow: '0 0 10px #00ffff' }}>PROTOCOLS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center p-6 rounded-lg border border-cyan-400/50 bg-gray-900/50 hover:border-cyan-400 transition-all duration-300 hover:shadow-cyan-400/20 hover:shadow-2xl" style={{ backdropFilter: 'blur(10px)' }}>
              <div className="p-4 bg-cyan-400/10 rounded-full mb-6 border border-cyan-400/50">
                <img src={feature.icon} alt={feature.title} className="w-12 h-12 invert" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4 font-mono">{feature.title}</h3>
              <p className="text-gray-400 font-mono">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-6 bg-gray-900 border-t border-cyan-400/20">
      <div className="container mx-auto px-6 text-center text-gray-500 font-mono">
        <p>&copy; {new Date().getFullYear()} V-CLOSET. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};

export default function HomePage() {
  return (
    <div className="bg-gray-900">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
