import React from 'react';

export function VideoCardPreview({ src, title, thumbnail }: {
  src: string; title: string; thumbnail?: string;
}) {
  // These posters are extracted from the bundled videos. Cards never load a player.
  const bundled = /^\/videos\/news-([123])\.mp4(?:[?#].*)?$/.exec(src || '');
  const poster = bundled ? `/videos/news-${bundled[1]}.jpg` : thumbnail;
  return <img src={poster} alt={title} width={640} height={360} loading="lazy" decoding="async"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95" />;
}
