import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useImageSequence } from '../hooks/useImageSequence';

// Import all frame paths for each sequence using import.meta.glob
const seedFrames = Object.values(
  import.meta.glob("../sequences/seed/*.{jpg,jpeg,png,webp}", {
    eager: true,
    as: "url",
  })
).sort();

const treeFrames = Object.values(
  import.meta.glob("../sequences/tree/*.{jpg,jpeg,png,webp}", {
    eager: true,
    as: "url",
  })
).sort();

const educationFrames = [
  new URL('../sequences/education/frame-001.svg', import.meta.url).href,
  new URL('../sequences/education/frame-002.svg', import.meta.url).href,
  new URL('../sequences/education/frame-003.svg', import.meta.url).href,
  new URL('../sequences/education/frame-004.svg', import.meta.url).href,
  new URL('../sequences/education/frame-005.svg', import.meta.url).href,
];

const livelihoodFrames = [
  new URL('../sequences/livelihood/frame-001.svg', import.meta.url).href,
  new URL('../sequences/livelihood/frame-002.svg', import.meta.url).href,
  new URL('../sequences/livelihood/frame-003.svg', import.meta.url).href,
  new URL('../sequences/livelihood/frame-004.svg', import.meta.url).href,
  new URL('../sequences/livelihood/frame-005.svg', import.meta.url).href,
];

const communityFrames = [
  new URL('../sequences/community/frame-001.svg', import.meta.url).href,
  new URL('../sequences/community/frame-002.svg', import.meta.url).href,
  new URL('../sequences/community/frame-003.svg', import.meta.url).href,
  new URL('../sequences/community/frame-004.svg', import.meta.url).href,
  new URL('../sequences/community/frame-005.svg', import.meta.url).href,
];

const outroFrames = [
  new URL('../sequences/outro/frame-001.svg', import.meta.url).href,
  new URL('../sequences/outro/frame-002.svg', import.meta.url).href,
  new URL('../sequences/outro/frame-003.svg', import.meta.url).href,
  new URL('../sequences/outro/frame-004.svg', import.meta.url).href,
  new URL('../sequences/outro/frame-005.svg', import.meta.url).href,
];

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Section data for content
const sections = [
  {
    id: 'seed',
    className: 'seed',
    title: 'The Seed',
    text: 'Every great journey begins with a single seed. This is where our story starts.',
    reverse: false,
  },
  {
    id: 'tree',
    className: 'tree',
    title: 'The Tree',
    text: 'From seed to sapling, the tree grows strong. Roots dig deep into the earth.',
    reverse: true,
  },
  {
    id: 'education',
    className: 'education',
    title: 'Education',
    text: 'Knowledge spreads like branches reaching for the sky. Learning empowers communities.',
    reverse: false,
  },
  {
    id: 'livelihood',
    className: 'livelihood',
    title: 'Livelihood',
    text: 'Sustainable practices create lasting prosperity. Work with nature, not against it.',
    reverse: true,
  },
  {
    id: 'community',
    className: 'community',
    title: 'Community',
    text: 'Together we grow stronger. A forest is more than individual trees.',
    reverse: false,
  },
  {
    id: 'outro',
    className: 'outro',
    title: 'The Journey Continues',
    text: 'This is just the beginning. The seeds we plant today become the forests of tomorrow.',
    reverse: true,
  },
];

export function StoryPage() {
  const canvasRef = useRef(null);
  const lenisRef = useRef(null);
  const currentFrameRef = useRef({ frames: null, index: 0 });

  // Preload all image sequences
  const { images: seedImages, loaded: seedLoaded } = useImageSequence(seedFrames);
  const { images: treeImages, loaded: treeLoaded } = useImageSequence(treeFrames);
  const { images: educationImages, loaded: educationLoaded } = useImageSequence(educationFrames);
  const { images: livelihoodImages, loaded: livelihoodLoaded } = useImageSequence(livelihoodFrames);
  const { images: communityImages, loaded: communityLoaded } = useImageSequence(communityFrames);
  const { images: outroImages, loaded: outroLoaded } = useImageSequence(outroFrames);

  const allLoaded = seedLoaded && treeLoaded && educationLoaded && 
                    livelihoodLoaded && communityLoaded && outroLoaded;

  // Render function to draw current frame on canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { frames, index } = currentFrameRef.current;

    if (!frames || !frames[index]) return;

    const img = frames[index];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio to cover canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
      // Image is wider - fit to height
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      // Image is taller - fit to width
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    }

    // Mobile scaling for better visibility
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const scale = 0.9;
      const scaledWidth = drawWidth * scale;
      const scaledHeight = drawHeight * scale;
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } else {
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  }, [render]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Setup canvas and resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Setup ScrollTrigger for each section
  useEffect(() => {
    if (!allLoaded) return;

    const frameArrays = {
      seed: seedImages,
      tree: treeImages,
      education: educationImages,
      livelihood: livelihoodImages,
      community: communityImages,
      outro: outroImages,
    };

    const triggers = [];

    // Create ScrollTrigger for each section
    sections.forEach(({ className }) => {
      const frames = frameArrays[className];
      if (!frames || frames.length === 0) return;

      const trigger = ScrollTrigger.create({
        trigger: `.${className}`,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          currentFrameRef.current.frames = frames;
          currentFrameRef.current.index = Math.floor(self.progress * (frames.length - 1));
          render();
        },
        onEnter: () => {
          currentFrameRef.current.frames = frames;
          currentFrameRef.current.index = 0;
          render();
        },
        onEnterBack: () => {
          currentFrameRef.current.frames = frames;
          currentFrameRef.current.index = frames.length - 1;
          render();
        },
      });

      triggers.push(trigger);
    });

    // Initial render with first frame
    currentFrameRef.current.frames = seedImages;
    currentFrameRef.current.index = 0;
    render();

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [allLoaded, seedImages, treeImages, educationImages, livelihoodImages, communityImages, outroImages, render]);

  // Loading state
  if (!allLoaded) {
    return (
      <div className="loading">
        <p>Loading sequences...</p>
      </div>
    );
  }

  return (
    <div className="story-page">
      {/* Fixed Canvas Background */}
      <canvas ref={canvasRef} className="story-canvas" />

      {/* Scroll Sections */}
      {sections.map(({ id, className, title, text, reverse }) => (
        <section key={id} className={`section ${className}`}>
          <div className={`section-content ${reverse ? 'reverse' : ''}`}>
            <div className="text-column">
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <div className="animation-column">
              {/* Empty - animation plays on canvas */}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default StoryPage;
