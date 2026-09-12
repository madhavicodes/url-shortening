import React, { useState } from 'react';
import { GRADIENT_COLLECTION, getCssGradient } from '../utils/gradients';
import {
  X,
  Palette,
  Check,
  Copy,
  Sparkles,
  Sliders,
  RotateCcw,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const GradientShowcaseModal = ({
  activeGradient,
  onSelectGradient,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [customFrom, setCustomFrom] = useState(activeGradient.from);
  const [customTo, setCustomTo] = useState(activeGradient.to);

  const categories = [
    'All',
    'Vibrant & Deep',
    'Warm & Citrus',
    'Intense Red',
    'Neon Synth',
    'Cool Tech',
    'Dark Minimal',
  ];

  const filteredGradients =
    selectedCategory === 'All'
      ? GRADIENT_COLLECTION
      : GRADIENT_COLLECTION.filter((g) => g.category === selectedCategory);

  const handleCopyCss = (g) => {
    const css = `background: ${getCssGradient(g)};`;
    navigator.clipboard.writeText(css);
    setCopiedId(`css-${g.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyHex = (hex, id) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) return;
    onSelectGradient({
      id: 'custom',
      name: 'Custom User Gradient',
      from: customFrom,
      to: customTo,
      category: 'Custom',
      description: `Custom blend from ${customFrom} to ${customTo}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-900/20 shrink-0"
              style={{ background: getCssGradient(activeGradient) }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Gradient Palette Showcase</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ff0084]/10 text-[#ff0084] border border-[#ff0084]/20">
                  {activeGradient.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current theme: <span className="font-mono font-semibold text-slate-800">{activeGradient.from}</span> → <span className="font-mono font-semibold text-slate-800">{activeGradient.to}</span>. Tap any gradient to apply live.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body - Gradients Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGradients.map((g) => {
              const isActive = activeGradient.id === g.id || (activeGradient.from.toLowerCase() === g.from.toLowerCase() && activeGradient.to.toLowerCase() === g.to.toLowerCase());
              return (
                <div
                  key={g.id}
                  className={`rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'border-[#ff0084] ring-2 ring-[#ff0084]/20 shadow-md bg-white'
                      : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                  }`}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#ff0084] text-white flex items-center space-x-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      <span>Active Theme</span>
                    </div>
                  )}

                  <div>
                    {/* Visual Gradient Swatch */}
                    <div
                      className="h-20 rounded-xl w-full p-3 flex flex-col justify-between text-white shadow-inner relative overflow-hidden group cursor-pointer"
                      style={{ background: getCssGradient(g) }}
                      onClick={() => onSelectGradient(g)}
                      title="Click to apply"
                    >
                      <div className="flex items-center justify-between text-[11px] font-medium opacity-90">
                        <span>Preview</span>
                        <span className="font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-xs">
                          135°
                        </span>
                      </div>
                      <div className="font-bold text-sm tracking-wide drop-shadow-xs flex items-center justify-between">
                        <span>ShortScale</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                          #302
                        </span>
                      </div>
                    </div>

                    {/* Gradient Info */}
                    <div className="mt-3">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{g.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{g.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{g.description}</p>
                    </div>

                    {/* Hex Codes */}
                    <div className="mt-3 flex items-center justify-between p-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                      <button
                        onClick={() => handleCopyHex(g.from, `from-${g.id}`)}
                        className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-white transition-colors text-slate-700"
                        title="Copy From Hex"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: g.from }}></span>
                        <span className="font-semibold text-[11px]">{g.from}</span>
                        {copiedId === `from-${g.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>

                      <span className="text-slate-400 text-xs">➔</span>

                      <button
                        onClick={() => handleCopyHex(g.to, `to-${g.id}`)}
                        className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-white transition-colors text-slate-700"
                        title="Copy To Hex"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: g.to }}></span>
                        <span className="font-semibold text-[11px]">{g.to}</span>
                        {copiedId === `to-${g.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      onClick={() => onSelectGradient(g)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Apply Theme</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyCss(g)}
                      className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                      title="Copy CSS linear-gradient"
                    >
                      {copiedId === `css-${g.id}` ? (
                        <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                      ) : (
                        <span className="text-[11px]">CSS</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom 2-Color Gradient Builder */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#ff0084]" />
                <h4 className="font-bold text-sm">Custom 2-Color Hex Gradient Maker</h4>
              </div>
              <span className="text-xs text-slate-400">Live Customization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Start Color (From)
                </label>
                <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                  <input
                    type="color"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  End Color (To)
                </label>
                <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                  <input
                    type="color"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Apply Custom Theme
                </label>
                <button
                  onClick={handleApplyCustom}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center space-x-1.5"
                  style={{ background: `linear-gradient(135deg, ${customFrom}, ${customTo})` }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Hex Gradient</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              const defaultGrad = GRADIENT_COLLECTION[0]; // #ff0084 -> #33001b
              onSelectGradient(defaultGrad);
              setCustomFrom(defaultGrad.from);
              setCustomTo(defaultGrad.to);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#ff0084]" />
            <span>Reset to #ff0084 → #33001b (Requested Theme)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-md"
            style={{ background: getCssGradient(activeGradient) }}
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
