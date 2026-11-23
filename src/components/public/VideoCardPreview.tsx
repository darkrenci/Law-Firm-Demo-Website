import React from 'react';

export function VideoCardPreview({ src, title, thumbnail }: {
  src: string; title: string; thumbnail?: string;
}) {
  const isDirectVideo = /\.(mp4|webm)(?:[?#]|$)/i.test(src || '');
  // Omitting poster makes the browser render the video's first decodable frame.
  // This keeps previews truthful when an editor chooses a new video.
  if (isDirectVideo) {
    return <video src={src} aria-label={`${title} preview`} muted playsInline preload="metadata"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95" />;
  }
  return thumbnail ? <img src={thumbnail} alt={title} width={640} height={360} loading="lazy" decoding="async"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95" /> :
    <div className="w-full h-full bg-[#121218] flex items-center justify-center text-[10px] font-cinzel uppercase tracking-wider text-[#8e877e]">Video preview</div>;
}
