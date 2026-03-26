import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { Twitter, Instagram, Youtube, Video } from 'lucide-react';

// --- Canvas Background Component ---
const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let circles: Circle[] = [];
    const numCircles = 25;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initCircles();
    };

    class Circle {
      x: number;
      y: number;
      baseY: number;
      radius: number;
      color: string;
      opacity: number;
      phase: number;
      speed: number;
      vx: number;

      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.baseY = Math.random() * window.innerHeight;
        this.y = this.baseY;
        this.radius = Math.random() * 60 + 20;
        const colors = ['#001F3F', '#1A2A44', '#2A4A74'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.3 + 0.3; // 0.3 to 0.6
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.01 + 0.005;
        this.vx = (Math.random() - 0.5) * 0.3;
      }

      update(time: number, mouseX: number, mouseY: number) {
        this.y = this.baseY + Math.sin(this.phase + time * this.speed) * 15;
        this.x += this.vx;

        if (this.x > window.innerWidth + this.radius) this.x = -this.radius;
        if (this.x < -this.radius) this.x = window.innerWidth + this.radius;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.x -= dx * 0.01;
          this.baseY -= dy * 0.01;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = this.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }

    const initCircles = () => {
      circles = [];
      for (let i = 0; i < numCircles; i++) {
        circles.push(new Circle());
      }
    };

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circles.forEach(circle => {
        circle.update(time * 0.05, mouseX, mouseY);
        circle.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// --- Fade In Component ---
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Works Section ---
const worksData = [
  { id: 1, category: "Brand Story", title: "The Origin", image: "https://picsum.photos/seed/brand1/800/600?blur=2" },
  { id: 2, category: "Service & Products", title: "Language Mastery", image: "https://picsum.photos/seed/service1/800/600" },
  { id: 3, category: "Works", title: "Student Success", image: "https://picsum.photos/seed/work1/800/600" },
  { id: 4, category: "Service & Products", title: "Cultural Immersion", image: "https://picsum.photos/seed/service2/800/600" },
  { id: 5, category: "Works", title: "Corporate Training", image: "https://picsum.photos/seed/work2/800/600" },
];

const WorkCard = ({ work }: { work: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.4);
  const isInView = useInView(cardRef, { once: true, margin: "0px" });

  useEffect(() => {
    let animationFrameId: number;
    const updateScale = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const center = window.innerWidth / 2;
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(center - cardCenter);
        const maxDist = window.innerWidth / 1.5;
        const normalizedDist = Math.min(dist / maxDist, 1);
        
        const targetScale = 1 + (0.3 * Math.max(0, 1 - normalizedDist * 1.5));
        setScale(targetScale);
        
        const targetOpacity = 0.3 + (0.7 * Math.max(0, 1 - normalizedDist * 1.5));
        setOpacity(targetOpacity);
      }
      animationFrameId = requestAnimationFrame(updateScale);
    };
    updateScale();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-shrink-0 w-[75vw] md:w-[45vw] max-w-[800px] aspect-[16/9] relative flex flex-col justify-center mx-4 md:mx-12"
    >
      <motion.div 
        className="w-full h-full overflow-hidden bg-gray-100"
        style={{ scale, opacity }}
      >
        <img src={work.image} alt={work.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </motion.div>
      <div className="absolute -bottom-20 left-0 w-full" style={{ opacity }}>
        <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-[#1A2A44]/60 mb-2">{work.category}</p>
        <h3 className="text-xl md:text-3xl font-light text-[#001F3F]">{work.title}</h3>
      </div>
    </motion.div>
  );
};

const WorksSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  
  const x = useTransform(scrollYProgress, [0, 1], ["30vw", "-200vw"]);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        <div className="absolute left-6 md:left-24 top-24 md:top-1/2 md:-translate-y-1/2 z-20 pointer-events-none">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-light tracking-tight text-[#001F3F]">Works</h2>
            <div className="w-12 h-[1px] bg-[#001F3F] mt-6"></div>
          </FadeIn>
        </div>

        <motion.div style={{ x }} className="flex items-center h-full pt-12 md:pt-0">
          <div className="flex-shrink-0 w-[20vw] md:w-[30vw]"></div>
          {worksData.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
          <div className="flex-shrink-0 w-[50vw]"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default function App() {
  return (
    <div className="bg-white text-[#001F3F] font-sans selection:bg-[#001F3F] selection:text-white">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground />
        
        <div className="z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-widest leading-loose text-[#001F3F]">
              中国語で<br className="md:hidden" />自分を表現したい<br className="md:hidden" />全ての人へ
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12"
          >
            <p className="text-sm tracking-[0.2em] text-[#1A2A44]/60 uppercase">A&M Media Lab</p>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/50">Scroll</span>
          <div className="w-[1px] h-12 bg-[#001F3F]/20 overflow-hidden relative">
            <motion.div 
              className="w-full h-1/2 bg-[#001F3F]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Works Section */}
      <WorksSection />

      {/* Contact Section */}
      <section className="bg-[#0C0C0C] text-white py-32 md:py-48 px-6 md:px-24 relative overflow-hidden">
        <FadeIn>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[clamp(3rem,8vw,8rem)] font-extrabold leading-[0.9] tracking-tighter mb-8 font-sans">
              Let's Work<br />Together
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide mb-16">
              プロジェクトのご相談、お気軽にどうぞ。
            </p>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <a 
                href="mailto:akiranmt@hotmail.com" 
                className="group relative inline-block text-2xl md:text-4xl font-light text-[#2A4A74] hover:text-white transition-colors duration-500 pb-2"
              >
                akiranmt@hotmail.com
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2A4A74] group-hover:w-full transition-all duration-500 ease-out"></span>
              </a>
              
              <div className="flex gap-6">
                {[
                  { Icon: Twitter, href: "#" },
                  { Icon: Instagram, href: "#" },
                  { Icon: Youtube, href: "#" },
                  { Icon: Video, href: "#" }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.href}
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white hover:bg-white/5 transition-all duration-300"
                  >
                    <social.Icon strokeWidth={1.5} size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white/40 py-8 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1A2A44] to-transparent opacity-50"></div>
        <div className="text-center text-xs tracking-widest font-light">
          &copy; 2026 A&Mメディアラボ
        </div>
      </footer>
    </div>
  );
}
