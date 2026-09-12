import React, { useState } from 'react';
import { getCssGradient } from '../utils/gradients';
import {
  BookOpen,
  Zap,
  Shield,
  Layers,
  Database,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Server,
  Code,
  ArrowRight,
  Clock,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const SystemDesignNotes = ({ activeGradient }) => {
  const [openSections, setOpenSections] = useState({
    core: true,
    redirects: true,
    uniqueness: true,
    redis: true,
    batching: true,
    enumeration: true,
    fastRedirects: true,
    cdn: true,
    scale: true,
    multiRegion: true,
  });

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  const toggle = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      core: true,
      redirects: true,
      uniqueness: true,
      redis: true,
      batching: true,
      enumeration: true,
      fastRedirects: true,
      cdn: true,
      scale: true,
      multiRegion: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      core: false,
      redirects: false,
      uniqueness: false,
      redis: false,
      batching: false,
      enumeration: false,
      fastRedirects: false,
      cdn: false,
      scale: false,
      multiRegion: false,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Card */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: getCssGradient(activeGradient) }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div
              className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest mb-2 font-bold"
              style={{ color: primaryFrom }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Comprehensive System Design Specification</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Distributed URL Shortener Architecture
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
              Complete architectural blueprint covering high-level components, database schema, 301 vs 302 redirects, Base62 counter generation, in-memory caching, and horizontal scaling to <strong>1 Billion URLs</strong> and <strong>100M Daily Active Users</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {/* Section 1: Core Components & Data Schema */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('core')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${primaryFrom}15`,
                  color: primaryFrom,
                }}
              >
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  1. High-Level Architecture & Entity Schema
                </h3>
                <p className="text-xs text-slate-500">
                  Client, Primary Server, Database, POST /urls, and collision handling
                </p>
              </div>
            </div>
            {openSections.core ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.core && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">1. Client</div>
                  <p className="text-slate-600 text-[11px]">
                    Users interact with the system via web or mobile application, sending JSON requests to create or navigate shortened links.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">2. Primary Server</div>
                  <p className="text-slate-600 text-[11px]">
                    Receives incoming requests, validates input URLs with RFC standard rules, orchestrates code generation, and manages business logic.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">3. Database</div>
                  <p className="text-slate-600 text-[11px]">
                    Stores the relational mapping of short codes to original long URLs, user-generated aliases, expiration dates, and metadata.
                  </p>
                </div>
              </div>

              {/* Schema Table */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 text-xs">Urls Entity Schema:</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Field</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">short_code</td>
                        <td className="py-2 px-3 text-slate-500">VARCHAR(8) PRIMARY KEY</td>
                        <td className="py-2 px-3 font-sans text-slate-600">Unique Base62 code or user custom alias</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">original_url</td>
                        <td className="py-2 px-3 text-slate-500">VARCHAR(2048)</td>
                        <td className="py-2 px-3 font-sans text-slate-600">The destination long URL to redirect to</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">creation_time</td>
                        <td className="py-2 px-3 text-slate-500">BIGINT (Epoch ms)</td>
                        <td className="py-2 px-3 font-sans text-slate-600">Timestamp when the record was inserted</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">expiration_time</td>
                        <td className="py-2 px-3 text-slate-500">BIGINT NULL</td>
                        <td className="py-2 px-3 font-sans text-slate-600">Optional TTL timestamp (null = never expires)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">created_by</td>
                        <td className="py-2 px-3 text-slate-500">VARCHAR(64)</td>
                        <td className="py-2 px-3 font-sans text-slate-600">User ID or account identifier of creator</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deduplication & Custom Alias Callouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 space-y-1">
                  <div className="font-bold">Deduplication vs Multiple Codes Tradeoff:</div>
                  <p className="text-[11px] leading-relaxed">
                    While returning existing short codes for identical long URLs saves storage, most production URL shorteners allow duplicate long URLs. This ensures different users can have independent expiration dates, distinct custom aliases, and isolated click analytics.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                  <div className="font-bold">Preventing Custom Alias Collisions:</div>
                  <p className="text-[11px] leading-relaxed">
                    To prevent user-defined custom aliases from colliding with future counter-generated codes, you can check uniqueness in the DB, prefix generated codes with a reserved character (e.g. <code className="font-mono bg-blue-100 px-1 rounded">_</code>), or isolate them in separate namespaces.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: HTTP 301 vs 302 Redirect & HTTP 410 Expired */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('redirects')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  2. Redirection Mechanics: HTTP 302 Found vs 301 Moved Permanently
                </h3>
                <p className="text-xs text-slate-500">
                  Browser caching, analytics tracking, and HTTP 410 Gone expiration
                </p>
              </div>
            </div>
            {openSections.redirects ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.redirects && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
              <p>
                When a user visits <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">https://sho.rt/abc123</code>, the browser sends a <code className="font-mono font-semibold text-slate-800">GET /abc123</code> request to our Primary Server. The server looks up the code and returns an HTTP redirect response instructing the browser to navigate to the original long URL.
              </p>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 301 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">HTTP 301: Moved Permanently</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">Permanent</span>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto">
{`HTTP/1.1 301 Moved Permanently
Location: https://www.original-long-url.com`}
                  </pre>
                  <p className="text-[11px] text-slate-600">
                    <strong>Browser Behavior:</strong> Browsers aggressively cache 301 responses locally. Subsequent visits go directly to the target URL, <em>completely bypassing our server</em>.
                  </p>
                  <p className="text-[11px] text-rose-600 font-medium">
                    ⚠️ Defect for shorteners: Bypassing the server means click analytics are lost and link targets cannot be updated or expired!
                  </p>
                </div>

                {/* 302 */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs">HTTP 302: Found (Preferred)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">Standard</span>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-cyan-300 font-mono text-[10px] rounded-lg overflow-x-auto">
{`HTTP/1.1 302 Found
Location: https://www.original-long-url.com`}
                  </pre>
                  <p className="text-[11px] text-slate-700">
                    <strong>Browser Behavior:</strong> Browsers do not cache 302 responses. Every single visit sends a GET request to our Primary Server first.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-emerald-900 font-medium space-y-0.5">
                    <li>Full control: Links can be edited, paused, or deleted dynamically.</li>
                    <li>100% accurate click analytics and telemetry on every request.</li>
                    <li>Strict expiration enforcement.</li>
                  </ul>
                </div>
              </div>

              {/* Expiration Handling */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1.5">
                <div className="font-bold flex items-center space-x-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Expiration Handling & Cleanup (HTTP 410 Gone):</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  If <code className="font-mono bg-rose-100 px-1 rounded">current_time &gt; expiration_time</code>, the server returns <code className="font-mono font-bold">HTTP 410 Gone</code> indicating the link has permanently expired. A background cron job periodically prunes expired rows from the DB, and the Redis cache TTL is set to match or be shorter than the expiration timestamp so stale entries are auto-evicted.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Generating Unique Short URLs: 3 Approaches */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('uniqueness')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${primaryFrom}15`,
                  color: primaryFrom,
                }}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  3. Ensuring Short URLs are Unique: 3 Approaches Compared
                </h3>
                <p className="text-xs text-slate-500">
                  Prefix (failed) vs SHA-256 Hash + Salt vs Sequential Counter + Base62
                </p>
              </div>
            </div>
            {openSections.uniqueness ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.uniqueness && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Approach A: Prefix */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Approach A: URL Prefix</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">Rejected</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Take the first N characters of the input URL (e.g. <code className="font-mono">www.short.ly/www.link</code> for LinkedIn).
                  </p>
                  <p className="text-[11px] text-rose-600 font-medium">
                    <strong>Critical Flaw:</strong> Zero uniqueness! Two URLs sharing the same prefix (e.g. <code className="font-mono">linkedin.com/in/userA</code> and <code className="font-mono">linkedin.com/in/userB</code>) map to identical codes.
                  </p>
                </div>

                {/* Approach B: Hash Function */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Approach B: Hash (SHA-256)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Sub-optimal</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Hash canonical URL with SHA-256, Base62 encode output, and take first 8 characters.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    <strong>Collision Probability:</strong> With code space |S| and n stored codes, collision probability is <code className="font-mono">n / |S|</code>. Requires DB UNIQUE constraint and bounded retries (3-5x) with random salt on collision.
                  </p>
                </div>

                {/* Approach C: Counter + Base62 */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                    <span>Approach C: Counter + Base62</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">Optimal</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    Increment a centralized atomic counter for each new URL, then Base62 encode the integer into a compact string.
                  </p>
                  <p className="text-[11px] text-emerald-900 font-medium leading-snug">
                    <strong>Zero Collisions:</strong> Every integer is mathematically unique. No collision detection queries or salt retry loops required!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Why Base62 over Base64?</div>
                <p className="text-[11px] text-slate-600">
                  Base64 includes characters <code className="font-mono">+</code> and <code className="font-mono">/</code>. The slash (<code className="font-mono">/</code>) acts as a path delimiter in URLs, and plus (<code className="font-mono">+</code>) is reserved as space in HTTP query strings. Base62 strictly uses <code className="font-mono">0-9, a-z, A-Z</code>, ensuring 100% URL-safe strings without percent-encoding.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Redis Counter Engine */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('redis')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${primaryFrom}15`,
                  color: primaryFrom,
                }}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  4. Distributed Counter Engine: Why Redis is Ideal
                </h3>
                <p className="text-xs text-slate-500">
                  Single-threaded atomic operations eliminate race conditions across write servers
                </p>
              </div>
            </div>
            {openSections.redis ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.redis && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                When horizontally scaling our Write Service instances, maintaining globally unique short codes requires a single source of truth. Redis is the premier choice because:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                <li>
                  <strong>Single-Threaded Execution:</strong> Redis processes commands sequentially in memory, eliminating race conditions between concurrent write servers.
                </li>
                <li>
                  <strong>Atomic INCR Command:</strong> Atomically increments the counter and returns the new integer in a single operation. Two concurrent calls will always receive distinct integers (e.g. 1,000 and 1,001).
                </li>
                <li>
                  <strong>Ultra-High Throughput:</strong> Handles &gt;100,000 operations per second per instance in RAM, easily covering write demand.
                </li>
                <li>
                  <strong>High Availability:</strong> Redis Sentinel or Redis Cluster with automatic master-replica failover ensures continuous uptime.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: Counter Batching */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('batching')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  5. Counter Batching: Eliminating Network Hops
                </h3>
                <p className="text-xs text-slate-500">
                  Reserving integer ranges (INCRBY 1000) for local write service RAM pools
                </p>
              </div>
            </div>
            {openSections.batching ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.batching && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                To avoid an extra network round-trip to Redis for every single URL created, Write Services implement <strong>Counter Batching</strong>:
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-800">The 4-Step Batching Workflow:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>A Write Service instance sends <code className="font-mono text-cyan-700 font-semibold">INCRBY global_counter 1000</code> to Redis.</li>
                  <li>Redis atomically increments the counter by 1,000 and returns the starting offset (e.g. 5,000).</li>
                  <li>The server reserves IDs 5,000 through 5,999 in its local process memory, allocating them instantly with <strong>0ms network latency</strong>.</li>
                  <li>When the local batch is exhausted, the instance requests the next 1,000 IDs from Redis.</li>
                </ol>
              </div>
              <p className="text-[11px] text-slate-500">
                <strong>Crash Tolerance:</strong> If a write pod crashes unexpectedly, unused IDs in its local RAM are lost. Because URL shorteners only require <em>global uniqueness</em> (not unbroken sequential continuity), skipping a few IDs has zero impact on correctness.
              </p>
            </div>
          )}
        </div>

        {/* Section 6: Security: URL Enumeration & XOR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('enumeration')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  6. Security Challenge: URL Enumeration & Reversible XOR Transformation
                </h3>
                <p className="text-xs text-slate-500">
                  Preventing predictable link crawling with symmetric bitwise masking
                </p>
              </div>
            </div>
            {openSections.enumeration ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.enumeration && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>The Vulnerability:</strong> Sequential integers produce predictable consecutive Base62 codes (<code className="font-mono">15ftgG</code>, <code className="font-mono">15ftgH</code>, <code className="font-mono">15ftgI</code>). Malicious actors could write automated scripts to systematically scrape unlisted or sensitive links.
              </p>
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 space-y-1">
                <div className="font-bold">Mitigation: Symmetric XOR Secret Mask</div>
                <p className="text-[11px] leading-relaxed">
                  Before Base62 encoding, pass the integer through a bitwise XOR transformation with a secret key: <code className="font-mono font-bold">maskedId = counterId ^ SECRET_KEY</code>.
                  Because XOR is completely reversible (<code className="font-mono">(A ^ K) ^ K = A</code>), it guarantees a 1:1 bijection without collisions while producing pseudo-randomized short codes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Fast Redirects & In-Memory Caching */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('fastRedirects')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  7. Ensuring Fast Redirects: B-Tree Indexing & In-Memory Caching
                </h3>
                <p className="text-xs text-slate-500">
                  Avoiding full table scans and bridging the 1,000x Memory vs SSD latency gap
                </p>
              </div>
            </div>
            {openSections.fastRedirects ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.fastRedirects && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
              <p>
                Finding the matching long URL in a database of 1 Billion rows without optimization requires a <strong>full table scan</strong>, which would take seconds per request.
              </p>

              {/* Indexing */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Database Indexing (O(log n) Lookup):</div>
                <p className="text-[11px] text-slate-600">
                  By making <code className="font-mono bg-slate-100 px-1 rounded">short_code</code> the table's Primary Key, the relational database automatically builds a B-Tree index. This drops lookup time from <code className="font-mono">O(n)</code> to <code className="font-mono">O(log n)</code>.
                </p>
              </div>

              {/* Hardware Latency Table */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800">Hardware Access Latency Comparison:</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Storage Layer</th>
                        <th className="py-2 px-3">Access Latency</th>
                        <th className="py-2 px-3">Throughput Capacity</th>
                        <th className="py-2 px-3 text-right">Relative Speed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr className="bg-emerald-50/50">
                        <td className="py-2 px-3 font-sans font-bold text-emerald-950">In-Memory RAM (Redis)</td>
                        <td className="py-2 px-3 text-emerald-800">~100 ns (0.0001 ms)</td>
                        <td className="py-2 px-3 font-sans text-slate-600">Millions reads / second</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">1,000x faster than SSD</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">NVMe SSD (PostgreSQL)</td>
                        <td className="py-2 px-3 text-slate-600">~0.1 ms (100 µs)</td>
                        <td className="py-2 px-3 font-sans text-slate-600">~100,000 IOPS</td>
                        <td className="py-2 px-3 text-right text-slate-500">Baseline</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">Spinning Hard Drive (HDD)</td>
                        <td className="py-2 px-3 text-slate-600">~10 ms</td>
                        <td className="py-2 px-3 font-sans text-slate-600">~100 - 200 IOPS</td>
                        <td className="py-2 px-3 text-right text-slate-400">100,000x slower</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cache Pattern */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Cache-Aside Pattern:</div>
                <p className="text-[11px] text-slate-600">
                  Read requests first query Redis (<code className="font-mono">key: short_code</code>, <code className="font-mono">value: original_url</code>). On cache hit (&lt;10ms), the response is returned immediately. On cache miss, the server queries the database, returns the redirect, and writes the mapping to Redis with an LRU eviction policy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 8: CDN & Edge Computing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('cdn')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  8. Global Edge Acceleration: CDN & Serverless Workers
                </h3>
                <p className="text-xs text-slate-500">
                  Terminating redirects at Cloudflare Workers / AWS Lambda@Edge PoPs
                </p>
              </div>
            </div>
            {openSections.cdn ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.cdn && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                To achieve redirect response times &lt; 20ms globally, the short URL domain can be routed through a Content Delivery Network (CDN) with edge serverless functions (like Cloudflare Workers or AWS Lambda@Edge).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  <span className="font-bold">Key Benefits</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                    <li>Redirection happens close to the user's geographic location.</li>
                    <li>Popular links never reach the origin server, reducing primary load by &gt;85%.</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                  <span className="font-bold">Tradeoffs & Challenges</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-[11px]">
                    <li>Cache invalidation across hundreds of edge nodes when URLs expire or are deleted.</li>
                    <li>Higher bandwidth and invocation costs for edge compute with massive traffic.</li>
                    <li>More complex distributed debugging and observability.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 9: Scaling to 1B URLs & 100M DAU */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('scale')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  9. Scaling to 1 Billion URLs and 100M DAU
                </h3>
                <p className="text-xs text-slate-500">
                  Storage math (500GB), 5,000:1 read/write ratio, and microservice decoupling
                </p>
              </div>
            </div>
            {openSections.scale ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.scale && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
              {/* Math Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Total Storage Math</div>
                  <div className="text-sm font-mono font-bold text-slate-900">~500 GB Total</div>
                  <p className="text-[11px] text-slate-500">
                    1B rows × 500 bytes = 500 GB. Fits entirely on a single modern enterprise NVMe drive without sharding!
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Write Throughput</div>
                  <div className="text-sm font-mono font-bold text-slate-900">~1 write / second</div>
                  <p className="text-[11px] text-slate-500">
                    100,000 new URLs / day = 1.15 writes/sec. Negligible write pressure on the database.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Read Throughput</div>
                  <div className="text-sm font-mono font-bold text-slate-900">~5,787 avg / ~600k peak</div>
                  <p className="text-[11px] text-slate-500">
                    100M DAU × 5 clicks = 500M clicks/day (~5,787 QPS avg; 100x viral spikes = ~600k ops/sec).
                  </p>
                </div>
              </div>

              {/* Microservices & Availability */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800">Decoupled Microservice Architecture:</div>
                <p className="text-[11px] text-slate-600">
                  Because reads outnumber writes by ~5,000:1, we separate the service into independent microservices:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  <li>
                    <strong>Read Service (Redirects):</strong> Horizontally scaled across dozens of container replicas fronted by an API Gateway / Load Balancer. Relies primarily on Redis cache and database read replicas.
                  </li>
                  <li>
                    <strong>Write Service (Shortening):</strong> Lightweight deployment handling 1-2 writes/sec, querying Redis for atomic counter batches and inserting into the master database.
                  </li>
                  <li>
                    <strong>Database Availability:</strong> Master-replica PostgreSQL deployment with automated snapshot backups for disaster recovery.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Section 10: Multi-Region Disjoint Ranges */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle('multiRegion')}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  10. Multi-Region Counter Strategy: Disjoint Ranges
                </h3>
                <p className="text-xs text-slate-500">
                  Deploying in multiple regions without cross-region locking or latency
                </p>
              </div>
            </div>
            {openSections.multiRegion ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSections.multiRegion && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                In a multi-region deployment (e.g. US-East, Europe-West, Asia-East), synchronizing a single global Redis counter across oceans would introduce severe cross-region network latency (100-200ms round trips).
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800">The Disjoint Counter Range Allocation:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-blue-600">Region US-East</div>
                    <div>Range: 0 to 1 Billion</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-indigo-600">Region EU-West</div>
                    <div>Range: 1B to 2 Billion</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-cyan-600">Region Asia-East</div>
                    <div>Range: 2B to 3 Billion</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Each region operates its own local Redis counter within its allocated range. Writes stay 100% local with &lt;1ms latency, while reads can be replicated globally asynchronously!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
