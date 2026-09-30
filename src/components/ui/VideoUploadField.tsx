import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';

export function VideoUploadField({value = '', onChange, allowMediaLibrary = true, onBusyChange}: {
  value?: string;
  onChange: (url: string, name?: string, id?: string) => void;
  allowMediaLibrary?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [media, setMedia] = useState(() => db.getMedia());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => db.subscribe(() => setMedia(db.getMedia())), []);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError('');
    if (!['video/mp4','video/webm'].includes(file.type)) {
      setError('Choose an MP4 or WebM video.'); input.value = ''; return;
    }
    setBusy(true);
    onBusyChange?.(true);
    try {
      const result = await supabaseService.uploadMediaFile(file, {category:'general'});
      await db.refreshFromSupabase();
      onChange(result.url, result.mediaItem.name, result.mediaItem.id);
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); onBusyChange?.(false); input.value = ''; }
  };
  return <div className="space-y-3 text-xs text-[#d4af7a]">
    <label className="block">Upload video (MP4 / WebM, maximum 25 MB)
      <input type="file" accept="video/mp4,video/webm" disabled={busy} onChange={upload} className="block mt-2 w-full text-xs" />
    </label>
    {busy && <p role="status">Uploading video… Please wait.</p>}
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {allowMediaLibrary && <label className="block">Choose video from library
      <select value={media.some(item => item.fileType === 'video' && item.url === value) ? value : ''} disabled={busy} onChange={e => {
        const item = media.find(item => item.fileType === 'video' && item.url === e.target.value);
        if (item) onChange(item.url, item.name, item.id);
      }} className="mt-1 w-full bg-[#0d0d11] border border-[#2a2a35] p-2">
        <option value="">Select a video</option>
        {media.filter(item => item.fileType === 'video').map(item => <option key={item.id} value={item.url}>{item.name}</option>)}
      </select>
    </label>}
    <label className="block">Video URL (MP4, WebM, YouTube or Vimeo)
      <input type="url" value={value} disabled={busy} onChange={e => onChange(e.target.value)} className="mt-1 w-full bg-[#0d0d11] border border-[#2a2a35] p-2 text-[#f7f4ee]" />
    </label>
    {/\.(mp4|webm)(?:[?#]|$)/i.test(value) && <video src={value} controls preload="none" playsInline className="w-full max-h-48 bg-black" />}
  </div>;
}
