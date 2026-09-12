import React, { useState } from 'react';
import { getCssGradient } from '../utils/gradients';
import {
  Calculator,
  HardDrive,
  Cpu,
  Database,
  Zap,
  Server,
  Activity,
  Layers,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export const CapacityCalculator = ({ activeGradient }) => {
  const [totalUrls, setTotalUrls] = useState(1000000000); // 1 Billion
  const [dau, setDau] = useState(100000000); // 100M
  const [writesPerDay, setWritesPerDay] = useState(100000); // 100k
  const [clicksPerUser, setClicksPerUser] = useState(5); // 5 redirects / user per spec
  const [rowSizeBytes, setRowSizeBytes] = useState(500); // 500 bytes
  const [cachePercentage, setCachePercentage] = useState(20); // 20% Pareto rule
  const [spikeMultiplier, setSpikeMultiplier] = useState(100); // 100x traffic spike per spec (~600k QPS)

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  // Computations
  const totalStorageBytes = totalUrls * rowSizeBytes;
  const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);
  const totalStorageTB = totalStorageGB / 1024;

  const writeQps = writesPerDay / 86400;
  const peakWriteQps = writeQps * 2;

  const totalDailyReads = dau * clicksPerUser;
  const readQps = totalDailyReads / 86400; // ~5,787 QPS for 100M DAU * 5
  const peakReadQps = readQps * spikeMultiplier; // ~580k - 600k QPS with 100x multiplier

  const readWriteRatio = Math.round(readQps / Math.max(writeQps, 0.001));

  // Cache estimation (80/20 rule)
  const cachedUrlsCount = (totalDailyReads * (cachePercentage / 100)) / clicksPerUser;
  const cacheMemoryBytes = cachedUrlsCount * rowSizeBytes;
  const cacheMemoryGB = cacheMemoryBytes / (1024 * 1024 * 1024);

  // Bandwidth
  const writeBandwidthKBps = (writeQps * rowSizeBytes) / 1024;
  const readBandwidthMBps = (readQps * rowSizeBytes) / (1024 * 1024);
  const readBandwidthMbps = readBandwidthMBps * 8;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className="p-2.5 rounded-xl"
            style={{
              backgroundColor: `${primaryFrom}15`,
              color: primaryFrom,
            }}
          >
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Scale & Capacity Estimator</h2>
            <p className="text-xs text-slate-500">
              Interactive calculations for 1B shortened URLs, 100M DAU, and 80/20 cache sizing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
            Read-to-Write Ratio: ~{readWriteRatio.toLocaleString()}:1
          </span>
        </div>
      </div>

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Storage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>SSD Database Storage</span>
            <HardDrive className="w-4 h-4" style={{ color: primaryFrom }} />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {totalStorageGB >= 1000 ? `${totalStorageTB.toFixed(2)} TB` : `${totalStorageGB.toFixed(1)} GB`}
          </div>
          <p className="text-[11px] text-slate-500">
            {totalUrls.toLocaleString()} URLs × {rowSizeBytes}B (Fits on a single modern NVMe SSD!)
          </p>
        </div>

        {/* Read QPS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Read Throughput</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {Math.round(readQps).toLocaleString()} <span className="text-xs font-normal text-slate-400">QPS</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Peak: ~{Math.round(peakReadQps).toLocaleString()} QPS (Requires Redis caching layer)
          </p>
        </div>

        {/* Write QPS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Write Throughput</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {writeQps.toFixed(2)} <span className="text-xs font-normal text-slate-400">writes/s</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {writesPerDay.toLocaleString()} URLs/day (Very low write volume)
          </p>
        </div>

        {/* Redis Cache Memory */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Redis Cache RAM (80/20)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {cacheMemoryGB.toFixed(1)} <span className="text-xs font-normal text-slate-400">GB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Caches {cachePercentage}% of daily active URLs for &gt;80% hit rate
          </p>
        </div>
      </div>

      {/* Interactive Controls & Parameter Adjusters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-slate-900">Adjust System Parameters</h3>

          {/* Slider 1: Total URLs */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Total URLs Stored</span>
              <span className="font-mono font-bold" style={{ color: primaryFrom }}>{totalUrls.toLocaleString()} URLs</span>
            </div>
            <input
              type="range"
              min={100000000} // 100M
              max={5000000000} // 5B
              step={100000000}
              value={totalUrls}
              onChange={(e) => setTotalUrls(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: primaryFrom }}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>100M</span>
              <span>1 Billion (Default)</span>
              <span>5 Billion</span>
            </div>
          </div>

          {/* Slider 2: DAU */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Daily Active Users (DAU)</span>
              <span className="font-mono font-bold" style={{ color: primaryFrom }}>{dau.toLocaleString()} Users</span>
            </div>
            <input
              type="range"
              min={10000000} // 10M
              max={300000000} // 300M
              step={10000000}
              value={dau}
              onChange={(e) => setDau(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: primaryFrom }}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10M</span>
              <span>100M (Spec)</span>
              <span>300M</span>
            </div>
          </div>

          {/* Slider 3: Clicks per user per day */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Average Redirects / Clicks per User per Day</span>
              <span className="font-mono font-bold" style={{ color: primaryFrom }}>{clicksPerUser} clicks/day</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={clicksPerUser}
              onChange={(e) => setClicksPerUser(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: primaryFrom }}
            />
          </div>

          {/* Slider 4: Row size bytes */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Row Size with Metadata</span>
              <span className="font-mono font-bold" style={{ color: primaryFrom }}>{rowSizeBytes} bytes / row</span>
            </div>
            <input
              type="range"
              min={200}
              max={1000}
              step={50}
              value={rowSizeBytes}
              onChange={(e) => setRowSizeBytes(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: primaryFrom }}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>200B (Minimal)</span>
              <span>500B (Spec Assumption)</span>
              <span>1,000B (Heavy Analytics)</span>
            </div>
          </div>

          {/* Traffic Spike Multiplier Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Traffic Spikes & Peak Multiplier</span>
              <span className="font-mono font-bold" style={{ color: primaryFrom }}>{spikeMultiplier}x ({Math.round(peakReadQps).toLocaleString()} Peak QPS)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: '2x (Standard)', val: 2, desc: 'Even day distribution' },
                { label: '10x (Rush Hour)', val: 10, desc: 'Typical busy hour' },
                { label: '100x (Viral Spike)', val: 100, desc: '~600k ops/s in spec' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSpikeMultiplier(opt.val)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    spikeMultiplier === opt.val
                      ? 'border-[#ff0084] bg-rose-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                  style={spikeMultiplier === opt.val ? { borderColor: primaryFrom, backgroundColor: `${primaryFrom}0d` } : {}}
                >
                  <div className="font-bold text-slate-800 text-[11px]">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row Size Breakdown Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4" style={{ color: primaryFrom }} />
            <span>Database Row Breakdown</span>
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Exact field sizing as outlined in the system architecture:
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Field Name</th>
                  <th className="py-2 px-3">Data Type</th>
                  <th className="py-2 px-3 text-right">Size (Bytes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">short_code</td>
                  <td className="py-2 px-3 text-slate-500">VARCHAR(8)</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~8 bytes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">original_url</td>
                  <td className="py-2 px-3 text-slate-500">VARCHAR(255)</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~100 bytes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">creation_time</td>
                  <td className="py-2 px-3 text-slate-500">BIGINT (Epoch)</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~8 bytes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">custom_alias</td>
                  <td className="py-2 px-3 text-slate-500">VARCHAR(64) NULL</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~100 bytes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">expiration_time</td>
                  <td className="py-2 px-3 text-slate-500">BIGINT NULL</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~8 bytes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">creator / analytics ID</td>
                  <td className="py-2 px-3 text-slate-500">UUID / Indexes</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">~276 bytes</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td colSpan={2} className="py-2 px-3 font-sans">
                    Total Rounded Row Size
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: primaryFrom }}>
                    ~500 bytes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Architecture Takeaway</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              500 GB fits comfortably on a single standard enterprise NVMe drive. No complex horizontal database sharding is required initially; standard master-replica PostgreSQL is completely sufficient!
            </p>
          </div>
        </div>
      </div>

      {/* Network Bandwidth Estimation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <h3 className="font-bold text-base mb-4 text-slate-100 flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Network Bandwidth Requirements</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 font-medium">Write Ingress Bandwidth</span>
            <div className="font-mono text-xl font-bold text-white">
              {writeBandwidthKBps.toFixed(2)} KB/s
            </div>
            <p className="text-slate-400 text-[11px]">Negligible network footprint on write APIs.</p>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 font-medium">Read Egress Bandwidth</span>
            <div className="font-mono text-xl font-bold text-cyan-300">
              {readBandwidthMBps.toFixed(2)} MB/s ({readBandwidthMbps.toFixed(1)} Mbps)
            </div>
            <p className="text-slate-400 text-[11px]">Easily served by standard 1Gbps / 10Gbps cloud network links.</p>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 font-medium">CDN Offload Savings</span>
            <div className="font-mono text-xl font-bold text-emerald-400">
              ~85% Offload
            </div>
            <p className="text-slate-400 text-[11px]">Using Cloudflare Workers/Edge PoPs reduces origin server bandwidth to &lt; 1 MB/s.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
