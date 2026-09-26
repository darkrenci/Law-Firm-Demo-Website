import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../services/supabaseService';
import { db } from '../../services/db';
import { SUPABASE_CMS_SQL_SCHEMA } from '../../services/supabaseSchemaSql';
import { saveManualSupabaseCredentials, clearManualSupabaseCredentials } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Database, Copy, Check, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, KeyRound, Rocket, Trash2 } from 'lucide-react';
import { Button } from '../ui/Buttons';

export const SupabaseSetupBanner: React.FC = () => {
  const toast = useToast();
  const [status, setStatus] = useState(supabaseService.getStatus());
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);
  const [isVercelGuideExpanded, setIsVercelGuideExpanded] = useState(false);
  const [isKeyInputExpanded, setIsKeyInputExpanded] = useState(false);

  // Manual key inputs
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');

  const recheck = async () => {
    await supabaseService.checkSchemaReady();
    setStatus(supabaseService.getStatus());
  };

  useEffect(() => {
    recheck();
    const interval = setInterval(recheck, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_CMS_SQL_SCHEMA);
    setCopied(true);
    toast.success('SQL Copied to Clipboard', 'Paste this into Supabase SQL Editor and click Run.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await db.triggerSupabaseSetupCheck();
      if (res.ready) {
        toast.success('Supabase Tables Verified!', res.message);
        setStatus(supabaseService.getStatus());
      } else {
        toast.error('Tables Still Missing', 'Please paste and execute the SQL migration script in your Supabase SQL Editor first.');
      }
    } catch (e: any) {
      toast.error('Check Error', e?.message || 'Failed to verify Supabase schema.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveManualKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      toast.error('Missing Fields', 'Please provide both your Supabase URL and Anon Key.');
      return;
    }
    saveManualSupabaseCredentials(inputUrl, inputKey);
  };

  // If Supabase is not configured yet
  if (!status.isConfigured) {
    return (
      <div className="mb-6 bg-[#14141d] border border-[#2b2b3a] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-cinzel text-xs font-semibold text-[#f7f4ee] uppercase">
                  Supabase Cloud Backend: Not Activated on Vercel
                </p>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-950/60 text-[#c59b63] border border-amber-700/40">
                  Awaiting Redeploy or Direct Connect
                </span>
              </div>
              <p className="text-xs text-[#a8a199] leading-relaxed max-w-3xl">
                Because Vite embeds environment variables at <strong>build time</strong>, adding variables in Vercel requires a <strong>Redeploy</strong>. You can either redeploy in Vercel OR connect instantly below by pasting your Supabase credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsKeyInputExpanded(!isKeyInputExpanded);
                setIsVercelGuideExpanded(false);
              }}
              className="flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Connect Instantly</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsVercelGuideExpanded(!isVercelGuideExpanded);
                setIsKeyInputExpanded(false);
              }}
              className="flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>How to Redeploy in Vercel</span>
            </Button>
          </div>
        </div>

        {/* Instant Connect Input Form */}
        {isKeyInputExpanded && (
          <form onSubmit={handleSaveManualKeys} className="p-4 bg-[#0d0d12] border border-[#2c2c3d] space-y-3">
            <h4 className="font-cinzel text-xs uppercase text-[#d4af7a] font-semibold">
              Connect Directly with Supabase Credentials
            </h4>
            <p className="text-[11px] text-[#8e877e]">
              Enter your Project URL and Anon/Public Key from your Supabase Dashboard (Settings → API). This connects immediately on this device without waiting for a rebuild.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-cinzel uppercase text-[#d4af7a] mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full bg-[#14141d] border border-[#2b2b3a] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-cinzel uppercase text-[#d4af7a] mb-1">
                  Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                  className="w-full bg-[#14141d] border border-[#2b2b3a] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsKeyInputExpanded(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save &amp; Activate Supabase
              </Button>
            </div>
          </form>
        )}

        {/* Vercel Redeploy Instructions Guide */}
        {isVercelGuideExpanded && (
          <div className="p-4 bg-[#0d0d12] border border-[#2c2c3d] space-y-3 text-xs">
            <h4 className="font-cinzel text-xs uppercase text-[#d4af7a] font-semibold">
              How to Activate in Vercel (Why Redeploy is Required)
            </h4>
            <p className="text-[#a8a199] text-[11px] leading-relaxed">
              When using React + Vite on Vercel, variables starting with <code>VITE_</code> are embedded into the static code during build time. If you added the variables in Vercel <em>after</em> the build finished, the current live deployment does not have them yet.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#14141d] border border-[#242433] space-y-1">
                <span className="font-mono text-[10px] text-[#c59b63] font-bold block">STEP 1</span>
                <p className="font-semibold text-[#f7f4ee]">Verify Environment Variables</p>
                <p className="text-[11px] text-[#8e877e]">
                  In Vercel: <strong>Settings → Environment Variables</strong>. Ensure both <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are saved for <strong>Production</strong>.
                </p>
              </div>
              <div className="p-3 bg-[#14141d] border border-[#242433] space-y-1">
                <span className="font-mono text-[10px] text-[#c59b63] font-bold block">STEP 2</span>
                <p className="font-semibold text-[#f7f4ee]">Trigger a Redeploy</p>
                <p className="text-[11px] text-[#8e877e]">
                  Go to the <strong>Deployments</strong> tab in Vercel. Click the <strong>••• (three dots)</strong> next to your latest deployment and select <strong>Redeploy</strong>.
                </p>
              </div>
              <div className="p-3 bg-[#14141d] border border-[#242433] space-y-1">
                <span className="font-mono text-[10px] text-[#c59b63] font-bold block">STEP 3</span>
                <p className="font-semibold text-[#f7f4ee]">Refresh Your Site</p>
                <p className="text-[11px] text-[#8e877e]">
                  Once the build completes (takes ~30s), refresh your site. Supabase Cloud will show as <strong>Connected</strong>!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If Supabase is configured and tables ARE ready
  if (status.isSchemaReady) {
    return null; // All good! No error or setup needed.
  }

  // If Supabase is configured BUT tables are not yet created in PostgreSQL
  return (
    <div className="mb-6 bg-gradient-to-r from-amber-950/40 via-[#181512] to-[#121217] border border-amber-500/40 p-5 shadow-2xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                Action Required: Initialize Supabase Database Tables
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-900/60 text-amber-300 border border-amber-700/50">
                PostgreSQL Schema Setup
              </span>
            </div>
            <p className="text-xs text-[#d1c8bd] max-w-3xl leading-relaxed">
              Your Supabase credentials are connected (<code className="text-amber-300 text-[11px]">{status.supabaseUrl}</code>), but the PostgreSQL database tables have not been created yet. To enable permanent cross-device synchronization, run the initial SQL schema script below in your Supabase SQL Editor.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopySql}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerify}
            isLoading={isVerifying}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify &amp; Populate Database</span>
          </Button>

          <a
            href="https://supabase.com/dashboard/project/_/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-cinzel text-[#c59b63] border border-[#c59b63]/40 hover:bg-[#c59b63]/10 flex items-center gap-1 transition-colors"
          >
            <span>Supabase SQL Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3 Step Instruction Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-500/20 text-xs">
        <div className="p-2.5 bg-[#0e0e13] border border-[#22222d]">
          <span className="font-mono text-[10px] text-[#c59b63] font-bold block mb-0.5">STEP 1</span>
          <p className="text-[#a8a199] text-[11px]">Click <strong>"Copy SQL Schema"</strong> above to copy the table definitions and policies.</p>
        </div>
        <div className="p-2.5 bg-[#0e0e13] border border-[#22222d]">
          <span className="font-mono text-[10px] text-[#c59b63] font-bold block mb-0.5">STEP 2</span>
          <p className="text-[#a8a199] text-[11px]">Go to your <strong>Supabase Dashboard → SQL Editor</strong>, paste the script, and click <strong>Run</strong>.</p>
        </div>
        <div className="p-2.5 bg-[#0e0e13] border border-[#22222d]">
          <span className="font-mono text-[10px] text-[#c59b63] font-bold block mb-0.5">STEP 3</span>
          <p className="text-[#a8a199] text-[11px]">Click <strong>"Verify &amp; Populate Database"</strong> to seed your firm pages, partners, and media.</p>
        </div>
      </div>

      {/* Collapsible View of the SQL script */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsSqlExpanded(!isSqlExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-cinzel text-[#c59b63] hover:text-[#f7f4ee] cursor-pointer"
        >
          {isSqlExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isSqlExpanded ? 'Hide SQL Code' : 'Preview SQL Migration Code'}</span>
        </button>

        {isSqlExpanded && (
          <div className="mt-2.5 relative">
            <pre className="p-4 bg-[#08080a] border border-[#242433] text-[11px] font-mono text-[#ded6c9] max-h-72 overflow-y-auto overflow-x-auto select-all">
              {SUPABASE_CMS_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
