import { Config } from '@remotion/cli/config';

// ../media is Remotion's public root: staticFile('library/logos/x') →
// ../media/library/x (reusable), staticFile('projects/<proj>/x') → ../media/projects/... (per-video).
Config.setPublicDir('../media');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto

// map-film track: the film-grain + blend layers need the ANGLE GL renderer headlessly
// (make-map skill; always render map films with --gl=angle).
Config.setChromiumOpenGlRenderer('angle');
