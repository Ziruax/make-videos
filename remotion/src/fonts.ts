// Brand 3-font system, loaded from Google Fonts (bundled by Remotion at render time).
import { loadFont as loadDisplay } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadBody } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSerif } from '@remotion/google-fonts/Spectral';
import { loadFont as loadEditorial } from '@remotion/google-fonts/SourceSerif4';

export const FONT_DISPLAY = loadDisplay('normal', { weights: ['500', '600', '700'], subsets: ['latin'] }).fontFamily;
export const FONT_BODY = loadBody('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
export const FONT_MONO = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;
// serif for the Claude Code wordmark clone (close match to the app's serif)
export const FONT_SERIF = loadSerif('normal', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;
// heavy editorial serif for the vox collage engine's headlines (Publico-ish; Spectral maxes
// at 600 and reads too light/bookish over collage layers)
export const FONT_EDITORIAL = loadEditorial('normal', { weights: ['600', '700', '900'], subsets: ['latin'] }).fontFamily;
// motion-graphics track display faces: Anton (ultra-condensed impact display),
// ArchivoBlack (heavy grotesque statements). Loaded only when mgkit is used.
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadArchivoBlack } from '@remotion/google-fonts/ArchivoBlack';
export const FONT_IMPACT = loadAnton('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
export const FONT_HEAVY = loadArchivoBlack('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
