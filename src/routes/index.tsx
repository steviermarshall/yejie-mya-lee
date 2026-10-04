import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import panelOne from "../assets/webtoon-panel-01.jpg";
import panelTwo from "../assets/webtoon-panel-02.jpg";
import panelThree from "../assets/webtoon-panel-03.jpg";
import musicAsset from "../assets/mya-soft-theme.wav.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy birthday, Mya" },
      {
        name: "description",
        content: "A private birthday story, made with love for Mya.",
      },
      { property: "og:title", content: "Happy birthday, Mya" },
      {
        property: "og:description",
        content: "A private birthday story, made with love for Mya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayStory,
});

// Add future panel imports above, then place them in this array in reading order.
const comicPanels = [panelOne, panelTwo, panelThree];

function RevealPanel({ src, index }: { src: string; index: number }) {
  const panelRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={panelRef}
      className={`comic-panel ${visible ? "comic-panel-visible" : ""}`}
    >
      <img
        src={src}
        alt={`Chapter panel ${index + 1}`}
        width={768}
        height={1365}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : "auto"}
      />
    </figure>
  );
}

function BirthdayStory() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [muted, setMuted] = useState(false);

  const openGift = () => {
    if (opening || opened) return;
    const audio = audioRef.current;
    setOpening(true);

    if (audio) {
      audio.volume = 0;
      void audio.play().then(() => {
        const startedAt = performance.now();
        const fadeIn = (now: number) => {
          const progress = Math.min((now - startedAt) / 2400, 1);
          audio.volume = 0.34 * progress;
          if (progress < 1) requestAnimationFrame(fadeIn);
        };
        requestAnimationFrame(fadeIn);
      });
    }

    window.setTimeout(() => setOpened(true), 850);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
  };

  return (
    <main className="birthday-story">
      <audio ref={audioRef} src={musicAsset.url} loop preload="auto" />

      {!opened && (
        <button
          type="button"
          className={`gift-gate ${opening ? "gift-gate-opening" : ""}`}
          onClick={openGift}
          aria-label="Open Mya's birthday story"
        >
          <span className="gift-title">Happy birthday, Mya</span>
          <span className="gift-instruction">tap to open</span>
        </button>
      )}

      <section className="comic-strip" aria-label="Our story">
        {comicPanels.map((panel, index) => (
          <RevealPanel key={panel} src={panel} index={index} />
        ))}
      </section>

      <section className="ending" aria-label="A note for Mya">
        <div className="ending-note">
          <p>My dearest Mya,</p>
          <p>
            This is where your note will go — the little things you remember,
            the moment you knew, and everything you can’t wait to share next.
          </p>
          <p>Always yours,</p>
        </div>
        <div className="photo-placeholder" role="img" aria-label="Our photo placeholder">
          <span>our photo</span>
        </div>
        <p className="continuation">To be continued… until Japan.</p>
      </section>

      {opened && (
        <button
          type="button"
          className="sound-control"
          onClick={toggleMute}
          aria-label={muted ? "Unmute music" : "Mute music"}
          title={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      )}
    </main>
  );
}