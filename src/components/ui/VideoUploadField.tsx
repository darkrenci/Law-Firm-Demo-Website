import React, { useEffect, useRef, useState } from 'react';
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
  const [filename, setFilename] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => db.subscribe(() => setMedia(db.getMedia())), []);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError('');
    if (!['video/mp4','video/webm'].includes(file.type)) {
      setError('Choose an MP4 or WebM video.'); input.value = ''; return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('This video exceeds the 100 MB limit. Choose a smaller file.'); input.value = ''; return;
    }
    setFilename(file.name);
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
    <div className="border border-[#c59b63]/50 bg-[#0d0d11] p-4 space-y-2">
      <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="w-full bg-[#c59b63] px-4 py-3 text-[#0d0d11] font-semibold disabled:opacity-50">
        Upload video from computer
      </button>
      <input ref={fileInput} type="file" accept="video/mp4,video/webm" disabled={busy} onChange={upload} aria-label="Choose video file from computer" className="sr-only" />
      <p className="text-[#a8a199]">Choose a file from your Desktop, Downloads, or another folder. MP4 / WebM, maximum 100 MB.</p>
      {filename && <p className="break-all text-[#f7f4ee]">Selected file: {filename}</p>}
    </div>
    {busy && <p role="status">Uploading video… Please wait.</p>}
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {allowMediaLibrary && <label className="block">Choose video from library
      <select value={media.some(item => item.fileType === 'video' && item.url === value) ? value : ''} disabled={busy} onChange={e => {
        const item = media.find(item => item.fileType === 'video' && item.url === e.target.value);
        if (item) { setFilename(''); setError(''); onChange(item.url, item.name, item.id); }
      }} className="mt-1 w-full bg-[#0d0d11] border border-[#2a2a35] p-2">
        <option value="">Select a video</option>
        {media.filter(item => item.fileType === 'video').map(item => <option key={item.id} value={item.url}>{item.name}</option>)}
      </select>
    </label>}
    <details>
      <summary className="cursor-pointer">Or paste a video link (optional)</summary>
      <label className="block mt-2">Video URL (MP4, WebM, YouTube or Vimeo)
      <input type="url" value={value} disabled={busy} onChange={e => { setFilename(''); setError(''); onChange(e.target.value); }} className="mt-1 w-full bg-[#0d0d11] border border-[#2a2a35] p-2 text-[#f7f4ee]" />
      </label>
    </details>
    {/\.(mp4|webm)(?:[?#]|$)/i.test(value) && <video src={value} controls preload="none" playsInline className="w-full max-h-48 bg-black" />}
  </div>;
}
