import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import promiseImage from "../assets/promise.webp";

// All 33 panels, in reading order.
const panelModules = import.meta.glob("../assets/panel-*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const comicPanels = Object.keys(panelModules)
  .sort()
  .map((key) => panelModules[key]);

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

function BirthdayStory() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [muted, setMuted] = useState(false);

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

    window.setTimeout(() => setOpened(true), 900);
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
          aria-label="Open"
        >
          <span className="gift-title">Happy birthday, Mya</span>
          <span className="gift-instruction">tap to open</span>
        </button>
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
      </section>

      <section className="ending">
        <Reveal className="continuation-wrap">
          <p className="continuation">To be continued… until Japan.</p>
        </Reveal>

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
