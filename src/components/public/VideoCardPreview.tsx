import React, { useEffect, useRef } from 'react';

export function VideoCardPreview({ src, title, thumbnail, paused = false }: {
  src: string; title: string; thumbnail?: string; paused?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const embedded = /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(src);
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (visible && !paused && !motion.matches && !document.hidden) {
        void player.play().catch(() => {});
      } else player.pause();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting || false;
      update();
    }, { threshold: 0.15 });
    observer.observe(player);
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    return () => {
      observer.disconnect(); player.pause();
      document.removeEventListener('visibilitychange', update);
      motion.removeEventListener('change', update);
    };
  }, [src, paused, embedded]);
  const className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95';
  if (embedded || !src) return <img src={thumbnail} alt={title} className={className} loading="lazy" />;
  return <video key={src} ref={video} src={src} muted loop playsInline preload="metadata" aria-label={`${title} video preview`} className={className} />;
}
