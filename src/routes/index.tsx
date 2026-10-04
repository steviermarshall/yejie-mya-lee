import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import promiseImage from "../assets/promise.webp";
import cakeImage from "../assets/cake.webp";
import happyBirthdayImage from "../assets/happy-birthday.webp";

// All 33 panels, in reading order.
const panelModules = import.meta.glob("../assets/panel-*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const comicPanels = Object.keys(panelModules)
  .sort()
  .map((key) => panelModules[key]);

// Fixed sparkle layout for the opening screen (percent positions).
const SPARKLES = [
  { x: 8, y: 14, size: 4, delay: 0.0, dur: 3.2, star: true },
  { x: 22, y: 30, size: 3, delay: 1.1, dur: 2.8, star: false },
  { x: 15, y: 62, size: 5, delay: 0.6, dur: 3.6, star: true },
  { x: 30, y: 80, size: 3, delay: 2.0, dur: 3.0, star: false },
  { x: 46, y: 10, size: 3, delay: 1.6, dur: 2.6, star: false },
  { x: 58, y: 22, size: 5, delay: 0.3, dur: 3.4, star: true },
  { x: 72, y: 12, size: 3, delay: 2.4, dur: 2.9, star: false },
  { x: 86, y: 28, size: 4, delay: 0.9, dur: 3.1, star: true },
  { x: 80, y: 56, size: 3, delay: 1.9, dur: 2.7, star: false },
  { x: 90, y: 74, size: 5, delay: 0.4, dur: 3.5, star: true },
  { x: 66, y: 86, size: 3, delay: 1.3, dur: 2.8, star: false },
  { x: 50, y: 94, size: 4, delay: 2.2, dur: 3.3, star: true },
  { x: 38, y: 48, size: 2, delay: 0.7, dur: 2.5, star: false },
  { x: 62, y: 44, size: 2, delay: 1.5, dur: 2.6, star: false },
  { x: 10, y: 90, size: 3, delay: 2.7, dur: 3.0, star: false },
  { x: 94, y: 48, size: 2, delay: 0.2, dur: 2.4, star: false },
];

// Balloons that take over the screen on tap, then fly out the top.
const BALLOON_COLORS: Array<[string, string]> = [
  ["#ffb3e0", "#e2559f"], // pink
  ["#dcb0ff", "#9a4de0"], // lavender
  ["#b4d8ff", "#4b86e0"], // sky
  ["#ffe2a0", "#e0a030"], // gold
  ["#ffb4a6", "#e2543d"], // coral
  ["#c0f3e0", "#3fc08d"], // mint
  ["#ffffff", "#cfc6e6"], // pearl
];
let seed = 7;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const BALLOONS = Array.from({ length: 48 }, (_, i) => {
  const col = i % 6;
  const row = Math.floor(i / 6);
  const [c1, c2] = BALLOON_COLORS[(i * 5 + row) % BALLOON_COLORS.length];
  return {
    x: col * 18 + 5 + (rand() - 0.5) * 12,
    y: row * 13.5 - 10 + (rand() - 0.5) * 10,
    w: 27 + rand() * 15,
    delay: rand() * 0.5,
    dur: 4.6 + rand() * 0.7,
    sway: 2.2 + rand() * 1.6,
    c1,
    c2,
  };
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy birthday, Mya" },
      { name: "description", content: "For Mya." },
      { property: "og:title", content: "Happy birthday, Mya" },
      { property: "og:description", content: "For Mya." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BirthdayStory,
});

function Reveal({
  children,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6%", threshold: 0.06 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function ScrollCue({ label = "keep scrolling", className = "" }: { label?: string; className?: string }) {
  return (
    <Reveal className={`scroll-cue-wrap ${className}`}>
      <p className="scroll-cue">
        <span>{label}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
    </Reveal>
  );
}

function BirthdayStory() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [balloons, setBalloons] = useState(false);

  // Seamless loop: jump back slightly before the true end to avoid the gap
  // some browsers leave between loop iterations.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration && audio.currentTime > audio.duration - 0.08) {
        audio.currentTime = 0;
      }
    };
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, []);

  const openGift = () => {
    if (opening || opened) return;
    setOpening(true);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          const start = performance.now();
          const fade = (now: number) => {
            const t = Math.min((now - start) / 2600, 1);
            audio.volume = 0.4 * t;
            if (t < 1) requestAnimationFrame(fade);
          };
          requestAnimationFrame(fade);
        })
        .catch(() => {
          /* if playback is refused, the page still opens */
        });
    }

    // Balloons rise and cover the screen, the gate is removed underneath
    // them, then they fly out the top to reveal the story.
    setBalloons(true);
    window.setTimeout(() => setOpened(true), 1500);
    window.setTimeout(() => setBalloons(false), 5900);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  return (
    <main className="birthday-story">
      <audio ref={audioRef} src="/mya.mp3" loop preload="auto" playsInline />

      {!opened && (
        <button
          type="button"
          className={`gift-gate ${opening ? "gift-gate-opening" : ""}`}
          onClick={openGift}
          aria-label="Open your gift"
        >
          <span className="gift-glow" aria-hidden="true" />
          <span className="gift-sparkles" aria-hidden="true">
            {SPARKLES.map((sp, i) => (
              <i
                key={i}
                className={sp.star ? "star" : undefined}
                style={
                  {
                    left: `${sp.x}%`,
                    top: `${sp.y}%`,
                    "--size": `${sp.size}px`,
                    "--delay": `${sp.delay}s`,
                    "--dur": `${sp.dur}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>

          <img className="gift-cake gift-cake-float" src={cakeImage} alt="" width={668} height={586} decoding="async" />
          <img
            className="gift-title-img"
            src={happyBirthdayImage}
            alt="Happy Birthday"
            width={1044}
            height={429}
            decoding="async"
          />
          <span className="gift-name">Mya</span>

          <span className="gift-instruction">
            <span className="gift-ring" aria-hidden="true" />
            <span className="gift-instruction-text">tap to open your gift</span>
          </span>
        </button>
      )}

      {balloons && (
        <div className="balloons" aria-hidden="true">
          {BALLOONS.map((b, i) => (
            <div
              key={i}
              className="balloon"
              style={
                {
                  "--x": `${b.x}vw`,
                  "--y": `${b.y}vh`,
                  "--w": `${b.w}vw`,
                  "--delay": `${b.delay}s`,
                  "--dur": `${b.dur}s`,
                  "--sway": `${b.sway}s`,
                  "--c1": b.c1,
                  "--c2": b.c2,
                } as React.CSSProperties
              }
            >
              <div className="balloon-inner">
                <div className="balloon-body" />
                <div className="balloon-knot" />
                <div className="balloon-string" />
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="comic-strip" aria-label="Fate">
        {comicPanels.map((src, i) => (
          <Reveal key={src} className="comic-panel">
            <img
              src={src}
              alt=""
              width={1024}
              height={1536}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </Reveal>
        ))}
        <ScrollCue label="the story isn't over · keep scrolling" />
      </section>

      <section className="ending">
        <Reveal className="continuation-wrap">
          <p className="continuation">To be continued… until Japan.</p>
        </Reveal>
        <ScrollCue label="keep scrolling" className="scroll-cue-after-continuation" />

        <div className="breath" aria-hidden="true" />

        <Reveal className="promise">
          <img src={promiseImage} alt="" width={1206} height={1819} loading="lazy" decoding="async" />
        </Reveal>

        <Reveal className="word-wrap">
          <p className="word">You have my word.</p>
        </Reveal>

        <div className="breath breath-long" aria-hidden="true" />

        <Reveal className="signoff-wrap">
          <p className="signoff">Made for Mya by Stevie</p>
        </Reveal>
      </section>

      {opened && (
        <button
          type="button"
          className="sound-control"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      )}
    </main>
  );
}
