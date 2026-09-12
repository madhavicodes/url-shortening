import React, { useState } from 'react';
import { getCssGradient } from '../utils/gradients';
import { createShortUrl, resolveShortUrl, toggleUrlCache } from '../utils/urlApi';
import {
  Server,
  Database,
  Smartphone,
  Layers,
  Zap,
  ArrowRight,
  ArrowLeftRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  Info,
  ChevronRight,
  Globe,
} from 'lucide-react';

export const ArchitectureVisualizer = ({
  currentTrace,
  onRunNewTrace,
  cacheCount,
  currentCounter,
  activeGradient,
  urls = [],
}) => {
  const [mode, setMode] = useState('scaled');
  const [selectedNode, setSelectedNode] = useState('write-service');
  const [activeStepIndex, setActiveStepIndex] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  // Quick simulation triggers
  const triggerSimulatedWrite = async () => {
    setIsSimulating(true);
    const testUrl = `https://news.ycombinator.com/item?id=${Math.floor(Math.random() * 900000) + 100000}`;
    const res = await createShortUrl({ originalUrl: testUrl });
    onRunNewTrace(res.trace);
    runAnimation(res.trace.steps.length);
  };

  const triggerSimulatedReadHit = async () => {
    setIsSimulating(true);
    const target = urls.find((item) => item.cached) || urls[0];
    if (!target) {
      setIsSimulating(false);
      return;
    }
    const res = await resolveShortUrl(target.shortCode);
    onRunNewTrace(res.trace);
    runAnimation(res.trace.steps.length);
  };

  const triggerSimulatedReadMiss = async () => {
    setIsSimulating(true);
    const target = urls[0];
    if (!target) {
      setIsSimulating(false);
      return;
    }
    if (target.cached) {
      await toggleUrlCache(target.shortCode);
    }
    const res = await resolveShortUrl(target.shortCode);
    onRunNewTrace(res.trace);
    runAnimation(res.trace.steps.length);
  };

  const runAnimation = (stepCount) => {
    let current = 0;
    setActiveStepIndex(0);
    const interval = setInterval(() => {
      current++;
      if (current >= stepCount) {
        clearInterval(interval);
        setActiveStepIndex(null);
        setIsSimulating(false);
      } else {
        setActiveStepIndex(current);
      }
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">System Architecture Topology</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#ff5f6d]/10 to-[#ffc371]/10 text-[#ff5f6d] border border-[#ff5f6d]/20">
              Interactive Blueprint
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare the Baseline monolithic server vs. the Scaled microservices design with Redis atomic counter & caching.
          </p>
        </div>

        {/* Architecture Mode Toggle */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold w-full md:w-auto">
            <button
              onClick={() => setMode('baseline')}
              className={`px-3.5 py-2 rounded-lg transition-all text-center ${
                mode === 'baseline'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Baseline Design (Single Server)
            </button>
            <button
              onClick={() => setMode('scaled')}
              className={`px-3.5 py-2 rounded-lg transition-all text-center ${
                mode === 'scaled'
                  ? 'text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={mode === 'scaled' ? { background: getCssGradient(activeGradient) } : {}}
            >
              2. Scaled / Final Design (Microservices + Redis)
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Quick Action Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Simulate Live Network Traffic:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerSimulatedWrite}
            disabled={isSimulating}
            className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50 flex items-center space-x-1.5"
            style={{ background: getCssGradient(activeGradient) }}
          >
            <span>Write Flow: POST /urls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={triggerSimulatedReadHit}
            disabled={isSimulating}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Read Flow: Cache HIT (~3ms)</span>
          </button>

          <button
            onClick={triggerSimulatedReadMiss}
            disabled={isSimulating}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center space-x-1.5"
          >
            <span>Read Flow: Cache MISS (~45ms)</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {mode === 'baseline' ? (
          /* BASELINE ARCHITECTURE */
          <div className="relative py-8">
            <div className="text-center mb-8">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                Baseline Architecture (From System Spec)
              </span>
              <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">
                Client communicates directly with a single monolithic Primary Server which handles both reads and writes against the database.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-4xl mx-auto">
              {/* Client Node */}
              <div
                onClick={() => setSelectedNode('client')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer text-center relative ${
                  selectedNode === 'client'
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Client</h4>
                <p className="text-xs text-slate-400 mt-1">Browser / Mobile App</p>
                <div className="mt-3 text-[11px] font-mono text-amber-200 bg-slate-950 p-2 rounded-lg border border-slate-800 text-left space-y-1">
                  <div>POST /urls</div>
                  <div>GET /{'{short_code}'}</div>
                </div>
              </div>

              {/* Primary Server */}
              <div
                onClick={() => setSelectedNode('primary-server')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer text-center relative ${
                  selectedNode === 'primary-server'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <Server className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Primary Server</h4>
                <p className="text-xs text-slate-400 mt-1">Monolithic Service</p>
                <div className="mt-3 text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 text-left space-y-1">
                  <div>Write: 1) gen short url 2) save DB</div>
                  <div>Read: 1) lookup DB 2) return 302</div>
                </div>
              </div>

              {/* Database */}
              <div
                onClick={() => setSelectedNode('database')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer text-center relative ${
                  selectedNode === 'database'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Database className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Database</h4>
                <p className="text-xs text-slate-400 mt-1">PostgreSQL Table</p>
                <div className="mt-3 text-[11px] font-mono text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800 text-left space-y-0.5">
                  <div>• short_code (PK)</div>
                  <div>• original_url</div>
                  <div>• creationTime</div>
                  <div>• expirationTime?</div>
                  <div>• createdBy</div>
                </div>
              </div>
            </div>

            {/* Baseline Bottleneck Warning */}
            <div className="mt-8 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs max-w-2xl mx-auto flex items-start space-x-3">
              <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">Baseline Design Limitations:</span>
                <p className="text-slate-300 mt-1">
                  Every redirect request causes a direct database read (causing full table scans or disk I/O bottlenecks). Scaling writes horizontally causes counter synchronization issues across instances.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* SCALED / FINAL DESIGN */
          <div className="relative py-4 space-y-6">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3.5 py-1 rounded-full">
                Final Scaled Architecture (Distributed Microservices)
              </span>
              <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
                Read/Write microservice separation + Redis Single-Threaded Atomic Global Counter + Redis In-Memory Cache for ultra-fast 302 redirects.
              </p>
            </div>

            {/* Architecture Node Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 1. Client Node */}
              <div className="lg:col-span-3 space-y-4">
                <div
                  onClick={() => setSelectedNode('client')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-center ${
                    selectedNode === 'client'
                      ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">Client / Browser</h4>
                  <p className="text-[11px] text-slate-400">100M Daily Active Users</p>
                  <div className="mt-2 text-[10px] font-mono text-amber-200 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-left">
                    <div>POST /urls (Write)</div>
                    <div>GET /:code (Read 302)</div>
                  </div>
                </div>

                {/* API Gateway */}
                <div
                  onClick={() => setSelectedNode('gateway')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-center ${
                    selectedNode === 'gateway'
                      ? 'border-cyan-500 bg-cyan-950/40 ring-2 ring-cyan-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">API Gateway</h4>
                  <p className="text-[11px] text-slate-400">Routes to Write/Read microservice</p>
                  <div className="mt-2 text-[10px] text-emerald-400 font-medium">
                    Rate Limiter • SSL Termination
                  </div>
                </div>
              </div>

              {/* 2. Microservices Layer (Write & Read Services) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Write Service + Global Counter */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-blue-400 tracking-wider flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Write Microservice Pool</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">~1.15 req/sec (100k/day)</span>
                  </div>

                  <div
                    onClick={() => setSelectedNode('write-service')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedNode === 'write-service'
                        ? 'border-blue-500 bg-blue-950/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">Write Service</span>
                      <span className="text-blue-400 text-[11px]">Horizontal Replicas</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1) Requests counter ID ➔ 2) Base62 encodes ➔ 3) Commits to DB ➔ 4) Warms Cache
                    </p>
                  </div>

                  {/* Connected Global Counter (Redis) */}
                  <div
                    onClick={() => setSelectedNode('redis-counter')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode === 'redis-counter'
                        ? 'border-cyan-500 bg-cyan-950/50'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Global Counter (Redis)</div>
                        <div className="text-[10px] text-slate-400">Single-threaded atomic INCR</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-200">
                        #{currentCounter.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-emerald-400">No Collisions</div>
                    </div>
                  </div>
                </div>

                {/* Read Service + Cache (Redis) */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Read Microservice Pool</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">~11,500 req/sec (High Scale)</span>
                  </div>

                  <div
                    onClick={() => setSelectedNode('read-service')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedNode === 'read-service'
                        ? 'border-emerald-500 bg-emerald-950/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">Read Service</span>
                      <span className="text-emerald-400 text-[11px]">Auto-scaled Pods</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1) Checks Redis Cache ➔ 2) If Miss, queries DB ➔ 3) Returns 302 Found redirect
                    </p>
                  </div>

                  {/* Connected Redis Cache */}
                  <div
                    onClick={() => setSelectedNode('redis-cache')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode === 'redis-cache'
                        ? 'border-amber-500 bg-amber-950/50'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Cache (Redis)</div>
                        <div className="text-[10px] text-slate-400">Key: short_code ➔ Value: original_url</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {cacheCount} keys warm
                      </div>
                      <div className="text-[9px] text-emerald-400">&lt; 10ms Latency</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Persistent Storage Layer (Database) */}
              <div className="lg:col-span-4 space-y-4">
                <div
                  onClick={() => setSelectedNode('database')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    selectedNode === 'database'
                      ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Database (PostgreSQL)</h4>
                      <p className="text-[11px] text-slate-400">Primary + Read Replicas</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 space-y-1">
                      <div className="text-slate-400 font-semibold mb-1 text-[10px] uppercase font-sans">
                        Schema (Urls Table ~500B/row):
                      </div>
                      <div>• short_code VARCHAR(16) UNIQUE</div>
                      <div>• original_url TEXT NOT NULL</div>
                      <div>• creation_time BIGINT</div>
                      <div>• expiration_time BIGINT NULL</div>
                      <div>• created_by VARCHAR(64)</div>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                      <span>1B URLs Storage:</span>
                      <span className="text-slate-200 font-bold font-mono">500 GB (Single SSD)</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Indexing:</span>
                      <span className="text-emerald-400 font-medium">B-Tree on short_code</span>
                    </div>
                  </div>
                </div>

                {/* CDN / Edge Redirection Callout */}
                <div
                  onClick={() => setSelectedNode('cdn')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'cdn'
                      ? 'border-purple-500 bg-purple-950/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 mb-1">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>CDN & Edge Workers (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Cloudflare Workers / Lambda@Edge can cache 302 redirects at geographical Points of Presence, returning responses before reaching the primary server!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Node Deep-Dive Drawer & Live Trace Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Deep Dive Inspector */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 capitalize">
              Node Architecture: {selectedNode.replace('-', ' ')}
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            {selectedNode === 'redis-counter' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Why Redis is uniquely suited for URL shorteners:</strong> Redis executes commands single-threaded, meaning requests are queued and processed one by one. The <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono font-semibold">INCR</code> command atomically adds 1 and returns the value in a single operation.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-500 font-sans font-semibold text-[10px] uppercase">
                    Atomic Execution Guarantee:
                  </div>
                  <div className="text-emerald-700">Client A: INCR ➔ 1000</div>
                  <div className="text-emerald-700">Client B: INCR ➔ 1001</div>
                  <div className="text-slate-500 italic font-sans text-[10px] mt-1">
                    Zero chance of collision without complex locks.
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <span className="font-bold">Counter Batching:</span> To eliminate network hops, Write Service instances can call <code className="font-mono font-semibold">INCRBY 1000</code> to reserve a range of 1,000 IDs and allocate them locally in RAM.
                </div>
              </div>
            )}

            {selectedNode === 'redis-cache' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Redis In-Memory Cache:</strong> Caching the short-code-to-long-URL mapping shields the primary database from the overwhelming read volume (100M DAU = ~11,500 reads/sec).
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
                  <div>Key: <span className="text-amber-700 font-bold">short:15ftgG</span></div>
                  <div>Value: <span className="text-slate-800">"https://github.com/..."</span></div>
                  <div>TTL: <span className="text-slate-500">7 days (604800s) with LRU eviction</span></div>
                </div>
                <p className="leading-relaxed">
                  According to the 80/20 Pareto principle, 20% of short URLs generate 80% of click traffic. Caching this 20% requires only ~10-20GB of RAM, yielding cache hit rates of &gt; 80%.
                </p>
              </div>
            )}

            {selectedNode === 'database' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">PostgreSQL Relational DB:</strong> Each shortened URL row requires approximately ~200 to 500 bytes. At 1 Billion URLs, total disk storage is only ~500 GB.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-slate-800">High Availability Strategies:</div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li><strong>Read Replicas:</strong> Offload queries if cache misses spike.</li>
                    <li><strong>Streaming Replication:</strong> Hot standby server takes over in case primary crashes.</li>
                    <li><strong>Periodic Snapshots:</strong> Encrypted backup snapshots stored in S3/GCS.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedNode === 'write-service' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Write Service Microservice:</strong> Decoupled from read traffic. Handles ~100k writes per day (~1.15 writes/second). Because write throughput is low, even a small cluster handles write bursts effortlessly.
                </p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <span className="font-bold">Multi-Region Strategy:</span> Allocate disjoint counter ranges to each region (e.g. Region A: 0 - 1B, Region B: 1B - 2B) to completely eliminate cross-region coordination!
                </div>
              </div>
            )}

            {selectedNode === 'read-service' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Read Service Microservice:</strong> Horizontally auto-scaled to handle heavy read traffic (10,000+ QPS). Checks in-memory cache first, emits click analytics asynchronously to Kafka/event logs, and sends HTTP 302 Found response immediately.
                </p>
              </div>
            )}

            {selectedNode === 'gateway' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">API Gateway:</strong> Single entry point. Inspects HTTP method and path:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
                  <div>• POST /urls ➔ Forward to Write Service</div>
                  <div>• GET /:code ➔ Forward to Read Service</div>
                </div>
              </div>
            )}

            {selectedNode === 'cdn' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Edge Redirection (Cloudflare Workers / Lambda@Edge):</strong> By pushing the redirect cache to edge nodes globally, popular short URLs redirect with &lt; 20ms latency without touching your origin server.
                </p>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px]">
                  <strong>Tradeoff:</strong> Cache invalidation across hundreds of global edge PoPs is more complex and edge execution incurs higher bandwidth costs.
                </div>
              </div>
            )}

            {selectedNode === 'client' && (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Client Interfaces:</strong> Web browsers, mobile apps, social media feeds, and programmatic API clients submitting and consuming short links.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Trace Log Inspector */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#ff5f6d]" />
              <h3 className="font-bold text-base text-slate-900">Execution Trace Inspector</h3>
            </div>
            {currentTrace && (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Total Latency: {currentTrace.totalLatencyMs} ms
              </span>
            )}
          </div>

          {currentTrace ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wide">
                    Trace: {currentTrace.type === 'write' ? 'Write Pipeline (POST /urls)' : 'Read Pipeline (GET /:code)'}
                  </span>
                  <div className="text-slate-500 font-mono text-[11px]">Target: {currentTrace.targetCode}</div>
                </div>
                <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Success</span>
                </span>
              </div>

              {/* Steps timeline */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {currentTrace.steps.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx;
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'border-[#ff5f6d] bg-rose-50/70 ring-2 ring-[#ffc371]/20'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                            isCurrent ? 'bg-gradient-to-r from-[#ff5f6d] to-[#ffc371] text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{step.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
                            {step.service}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">+{step.latencyMs}ms</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 pl-7 leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent trace executed. Click "Simulate Live Network Traffic" above or shorten a URL to view the step-by-step telemetry packet flow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
