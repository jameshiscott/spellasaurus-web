export interface DinoColorPalette {
  main: string;
  dark: string;
  light: string;
  belly: string;
  spine: string;
  eye: string;
  bgCircle: string;
}

export const DINO_COLOR_PALETTES: Record<string, DinoColorPalette> = {
  green:  { main: '#4CAF50', dark: '#2E7D32', light: '#81C784', belly: '#C8E6C9', spine: '#1B5E20', eye: '#1B5E20', bgCircle: '#E8F5E9' },
  blue:   { main: '#42A5F5', dark: '#1565C0', light: '#90CAF9', belly: '#BBDEFB', spine: '#0D47A1', eye: '#0D47A1', bgCircle: '#E3F2FD' },
  purple: { main: '#AB47BC', dark: '#6A1B9A', light: '#CE93D8', belly: '#E1BEE7', spine: '#4A148C', eye: '#4A148C', bgCircle: '#F3E5F5' },
  orange: { main: '#FFA726', dark: '#E65100', light: '#FFCC80', belly: '#FFE0B2', spine: '#BF360C', eye: '#BF360C', bgCircle: '#FFF3E0' },
  pink:   { main: '#EC407A', dark: '#880E4F', light: '#F48FB1', belly: '#FCE4EC', spine: '#880E4F', eye: '#880E4F', bgCircle: '#FCE4EC' },
};
