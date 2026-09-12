import React, { useState } from 'react';
import { getCssGradient } from '../utils/gradients';
import {
  encodeBase62,
  decodeBase62,
  BASE62_ALPHABET,
  CAPACITIES,
  XOR_SECRET_KEY,
} from '../utils/base62';
import {
  Binary,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Calculator,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';

export const Base62Explorer = ({ activeGradient, shortDomain = 'sho.rt' }) => {
  const [counterInput, setCounterInput] = useState('1000000000');
  const [xorEnabled, setXorEnabled] = useState(false);
  const [decoderInput, setDecoderInput] = useState('15ftgG');

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  // Compute encoding
  const parsedNum = parseInt(counterInput.replace(/,/g, ''), 10) || 0;
  const encodingResult = encodeBase62(parsedNum, xorEnabled);

  // Compute decoding
  const decodingResult = decodeBase62(decoderInput.trim(), false);

  const presets = [
    { label: 'Counter = 1', value: 1 },
    { label: 'Counter = 1,000', value: 1000 },
    { label: 'Counter = 100,000', value: 100000 },
    { label: 'Counter = 1 Billion (15ftgG)', value: 1000000000 },
    { label: 'Counter = 56.8 Billion (Max 6-char)', value: 56800235583 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div
            className="p-2.5 rounded-xl"
            style={{
              backgroundColor: `${primaryFrom}15`,
              color: primaryFrom,
            }}
          >
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Base62 Encoding & Counter Math</h2>
            <p className="text-xs text-slate-500">
              Why Base62 is optimal for compact, collision-free short codes without race conditions
            </p>
          </div>
        </div>

        {/* Alphabet banner */}
        <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>Base62 Alphabet (62 Characters: 0-9, a-z, A-Z)</span>
            <span>Index: 0 to 61</span>
          </div>
          <div className="font-mono text-xs text-cyan-300 tracking-wider break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {BASE62_ALPHABET}
          </div>
        </div>
      </div>

      {/* Interactive Encoder with Step-by-Step Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Output */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Calculator className="w-4 h-4" style={{ color: primaryFrom }} />
              <span>Counter ➔ Base62 Converter</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Base 10 ➔ Base 62</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Counter Value (Integer ID from Redis)
            </label>
            <input
              type="text"
              value={counterInput}
              onChange={(e) => setCounterInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:bg-white outline-none"
              style={{
                borderColor: undefined,
              }}
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setCounterInput(preset.value.toString())}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* XOR Obfuscation Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={xorEnabled}
                onChange={(e) => setXorEnabled(e.target.checked)}
                className="mt-0.5 rounded border-slate-300"
                style={{ accentColor: primaryFrom }}
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" style={{ color: primaryFrom }} />
                  <span>Enable XOR Secret Masking (Reversible)</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Transforms predictable sequential IDs into pseudo-random numbers before encoding, preventing URL enumeration while preserving uniqueness!
                </p>
              </div>
            </label>

            {xorEnabled && (
              <div
                className="pt-2 border-t border-slate-200 text-[11px] font-mono space-y-0.5"
                style={{ color: primaryFrom }}
              >
                <div>Secret Key Mask: 0x{XOR_SECRET_KEY.toString(16).toUpperCase()}</div>
                <div>
                  Transformed ID: {encodingResult.transformedId.toString()}
                </div>
              </div>
            )}
          </div>

          {/* Encoded Result Box */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl border border-slate-800 shadow-md relative overflow-hidden ring-1 ring-white/5">
            <div
              className="absolute top-0 right-0 w-28 h-28 rounded-full blur-xl pointer-events-none opacity-25"
              style={{ backgroundColor: primaryFrom }}
            ></div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Resulting Short Code
            </span>
            <div className="mt-1 flex items-baseline space-x-3">
              <span
                className="font-mono text-3xl font-extrabold tracking-wider"
                style={{
                  background: getCssGradient(activeGradient),
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {encodingResult.code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({encodingResult.code.length} characters)
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
              <span>Short URL Preview:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {shortDomain}/{encodingResult.code}
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Division Walkthrough */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Step-by-Step Division Steps</h3>
            <span className="text-xs text-slate-400 font-mono">Repeated Modulo 62</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            At each iteration, divide the counter by 62. The remainder determines the character from our Base62 table, and the integer quotient becomes the input for the next cycle.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Step</th>
                  <th className="py-2.5 px-3">Division & Remainder</th>
                  <th className="py-2.5 px-3">Remainder</th>
                  <th className="py-2.5 px-3 text-right">Char</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {encodingResult.steps.map((step) => (
                  <tr key={step.step} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 font-sans">{step.step}</td>
                    <td className="py-2 px-3 text-slate-700">{step.expression}</td>
                    <td className="py-2 px-3 font-bold" style={{ color: primaryFrom }}>{step.remainder}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold text-sm">
                      '{step.character}'
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="p-3 border rounded-xl text-xs"
            style={{
              backgroundColor: `${primaryFrom}0a`,
              borderColor: `${primaryFrom}25`,
              color: primaryFrom,
            }}
          >
            <strong>Reading the result:</strong> Assemble the remainder characters in reverse order (from last step to first) ➔ <code className="font-mono font-bold">{encodingResult.code}</code>.
          </div>
        </div>
      </div>

      {/* Reverse Base62 Decoder & URL Enumeration Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Base62 Decoder */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" style={{ color: primaryFrom }} />
            <h3 className="font-bold text-base text-slate-900">Reverse Base62 Decoder</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Short codes can be easily decoded back to the original database primary key integer without querying secondary indexes!
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Short Code to Decode
            </label>
            <input
              type="text"
              value={decoderInput}
              onChange={(e) => setDecoderInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none"
            />
          </div>

          {decodingResult.valid ? (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Decoded Counter ID
              </span>
              <div className="font-mono text-2xl font-bold text-cyan-300">
                {decodingResult.rawId.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5 font-mono">
                Formula: ∑ char_index × 62^(position)
              </p>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Invalid Base62 character detected! Only 0-9, a-z, A-Z allowed.</span>
            </div>
          )}
        </div>

        {/* Combinatorial Capacity Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4" style={{ color: primaryFrom }} />
              <span>Base62 Combinatorial Capacity (62^N)</span>
            </h3>
            <span className="text-xs font-semibold font-mono" style={{ color: primaryFrom }}>Scale Bound</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            As highlighted in the system design, at 1 Billion URLs, Base62 encoding yields only <strong>6 characters</strong> (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-semibold">15ftgG</code>). 6 characters has a maximum capacity of <strong>56.8 Billion URLs</strong> before needing to move to 7 characters.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Code Length</th>
                  <th className="py-2.5 px-3">Formula</th>
                  <th className="py-2.5 px-3 font-mono">Total Unique URLs</th>
                  <th className="py-2.5 px-3">Scale Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {CAPACITIES.map((row) => (
                  <tr
                    key={row.length}
                    className={`hover:bg-slate-50 ${
                      row.length === 6 ? 'font-bold' : ''
                    }`}
                    style={row.length === 6 ? { backgroundColor: `${primaryFrom}12`, color: primaryFrom } : {}}
                  >
                    <td className="py-2 px-3 text-slate-800 font-sans">
                      {row.length} chars {row.length === 6 && '⭐ (Target)'}
                    </td>
                    <td className="py-2 px-3 text-slate-500">62^{row.length}</td>
                    <td className="py-2 px-3 text-slate-900 font-bold">
                      {row.combinations.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-sans text-[11px]">
                      {row.readable}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
