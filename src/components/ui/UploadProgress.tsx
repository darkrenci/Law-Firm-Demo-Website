import React, { useEffect, useState } from 'react';
import type { MediaUploadProgress } from '../../services/supabaseService';

const bytes = (value: number) => value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`;
const duration = (seconds: number) => seconds < 60 ? `${Math.max(1, Math.round(seconds))} sec` : `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} sec`;

export const UploadProgress: React.FC<{ progress: MediaUploadProgress; startedAt: number }> = ({ progress, startedAt }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(timer); }, []);
  const elapsed=(now-startedAt)/1000;
  const label=progress.stage==='preparing'?'Preparing and optimizing file':progress.stage==='processing'?'Upload received; Hostinger is validating and saving it':progress.stage==='complete'?'Upload complete':'Uploading to Hostinger';
  return <div role="status" aria-live="polite" className="border border-[#c59b63]/40 bg-[#17130e] p-3 space-y-2">
    <div className="flex items-center justify-between gap-3 text-[11px]"><span className="text-[#f0d7b0] font-semibold">{label}</span><span className="font-mono text-[#f7f4ee]">{progress.percent}%</span></div>
    <div className="h-2 bg-[#29241e] overflow-hidden"><div className="h-full bg-[#c59b63] transition-[width] duration-300" style={{width:`${progress.percent}%`}} /></div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#a8a199]">
      <span>{bytes(progress.loaded)} of {bytes(progress.total)}</span><span className="text-right">Elapsed: {duration(elapsed)}</span>
      <span>{progress.bytesPerSecond>0 ? `${bytes(progress.bytesPerSecond)}/sec` : 'Calculating speed…'}</span><span className="text-right">{progress.etaSeconds!==null&&progress.stage==='uploading'?`About ${duration(progress.etaSeconds)} remaining`:progress.stage==='processing'?'Finalizing…':'Please keep this window open'}</span>
    </div>
  </div>;
};
