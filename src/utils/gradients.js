/**
 * Curated Design Gradients Library
 * Default: #ff0084 → #33001b (Cyber Magenta Theme)
 */

export const GRADIENT_COLLECTION = [
  {
    id: 'cyber-magenta',
    name: 'Cyber Magenta (Active)',
    from: '#ff0084',
    to: '#33001b',
    category: 'Vibrant & Deep',
    description: 'Electric neon magenta fading into midnight plum (Requested Theme)',
    isDefault: true,
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    from: '#ff5f6d',
    to: '#ffc371',
    category: 'Warm & Citrus',
    description: 'Warm tropical coral melting into golden peach sunlight',
  },
  {
    id: 'ruby-fire',
    name: 'Ruby Fire',
    from: '#cb2d3e',
    to: '#ef473a',
    category: 'Intense Red',
    description: 'Bold crimson ruby transitioning into fiery orange-red embers',
  },
  {
    id: 'hyper-violet',
    name: 'Hyper Violet',
    from: '#7928ca',
    to: '#ff0080',
    category: 'Neon Synth',
    description: 'Vivid ultraviolet morphing into electric shock pink',
  },
  {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    from: '#00f2fe',
    to: '#4facfe',
    category: 'Cool Tech',
    description: 'High-speed turquoise cyan fading into deep ocean blue',
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    from: '#0ba360',
    to: '#3cba92',
    category: 'Nature & Growth',
    description: 'Lush botanical green blending into crystalline sea mint',
  },
  {
    id: 'cosmic-royal',
    name: 'Cosmic Royal',
    from: '#8e2de2',
    to: '#4a00e0',
    category: 'Deep Luxury',
    description: 'Deep royal amethyst sinking into twilight indigo',
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    from: '#f12711',
    to: '#f5af19',
    category: 'Warm & Citrus',
    description: 'Volcanic magma red exploding into intense solar gold',
  },
  {
    id: 'midnight-abyss',
    name: 'Midnight Abyss',
    from: '#141e30',
    to: '#243b55',
    category: 'Dark Minimal',
    description: 'Stealth dark obsidian fading into cold metallic navy',
  },
  {
    id: 'borealis-lagoon',
    name: 'Borealis Lagoon',
    from: '#0575e6',
    to: '#00f260',
    category: 'Vibrant & Deep',
    description: 'Atmospheric arctic blue streaming into neon auroral green',
  },
  {
    id: 'dark-velvet',
    name: 'Dark Velvet',
    from: '#4a0e4e',
    to: '#0f0c29',
    category: 'Dark Minimal',
    description: 'Rich wine velvet dissolving into boundless cosmic void',
  },
  {
    id: 'rose-blossom',
    name: 'Rose Blossom',
    from: '#f857a6',
    to: '#ff5858',
    category: 'Neon Synth',
    description: 'Bright magenta rose graduating into soft strawberry coral',
  },
];

export const DEFAULT_GRADIENT = GRADIENT_COLLECTION[0]; // #ff0084 -> #33001b

export const getCssGradient = (gradient, angle = '135deg') => {
  if (!gradient) return `linear-gradient(${angle}, #ff0084, #33001b)`;
  return `linear-gradient(${angle}, ${gradient.from}, ${gradient.to})`;
};
