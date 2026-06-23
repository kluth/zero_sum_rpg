import { Result } from './result';

export type ColorToken = string;

// Ubiquitous Language Mapping from the Rulebook ADR
const COLOR_REGISTRY: Record<string, ColorToken> = {
  'PaperWhite': '#ffffff',
  'Ink': '#1a1a1a',
  'SlateBlue': '#2c3e50',
  'CoolGray': '#bdc3c7',
  'OffWhite': '#f8f9fa'
};

export class DesignSystemConfig {
  public static getColor(tokenName: keyof typeof COLOR_REGISTRY): Result<ColorToken> {
    const color = COLOR_REGISTRY[tokenName];
    if (!color) {
      return Result.failure<ColorToken>(`[Design System Error] Invalid color token requested: '${tokenName}'. Token does not exist in registry.`);
    }
    return Result.success<ColorToken>(color);
  }
}
