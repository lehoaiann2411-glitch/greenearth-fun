import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface StoryTextEditorProps {
  onAddText: (text: Omit<TextOverlay, 'id' | 'x' | 'y'>) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { id: 'sans', label: 'Sans', className: 'font-sans' },
  { id: 'serif', label: 'Serif', className: 'font-serif' },
  { id: 'mono', label: 'Mono', className: 'font-mono' },
];

const GREEN_COLORS = [
  '#ffffff', // White
  '#22c55e', // Green
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#14532d', // Dark Green
  '#fbbf24', // Yellow/Gold
  '#000000', // Black
];

const FONT_SIZES = [
  { id: 'sm', size: 16, label: 'S' },
  { id: 'md', size: 24, label: 'M' },
  { id: 'lg', size: 32, label: 'L' },
  { id: 'xl', size: 48, label: 'XL' },
];

export function StoryTextEditor({ onAddText, onClose }: StoryTextEditorProps) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('sans');

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddText({
      text: text.trim(),
      fontSize,
      color,
      fontFamily,
    });
    setText('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 z-20"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
          <Type className="w-4 h-4" />
          Add Text
        </h4>
        <button 
          onClick={handleAdd} 
          disabled={!text.trim()}
          className="text-primary hover:text-primary/80 disabled:text-white/30"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text..."
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mb-3"
        style={{ 
          color, 
          fontSize: `${Math.min(fontSize, 24)}px`,
          fontFamily: fontFamily === 'serif' ? 'serif' : fontFamily === 'mono' ? 'monospace' : 'sans-serif'
        }}
        autoFocus
      />

      {/* Font Size */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/60 text-xs w-12">Size:</span>
        <div className="flex gap-1">
          {FONT_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => setFontSize(size.size)}
              className={`w-8 h-8 rounded-lg text-xs font-medium ${
                fontSize === size.size 
                  ? 'bg-primary text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/60 text-xs w-12">Font:</span>
        <div className="flex gap-1">
          {FONT_FAMILIES.map((font) => (
            <button
              key={font.id}
              onClick={() => setFontFamily(font.id)}
              className={`px-3 py-1.5 rounded-lg text-xs ${font.className} ${
                fontFamily === font.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-xs w-12">Color:</span>
        <div className="flex gap-2">
          {GREEN_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
