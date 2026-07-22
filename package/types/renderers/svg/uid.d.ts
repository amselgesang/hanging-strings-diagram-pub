/**
 * Q23 (integration.md): per-instance uniqueness for SVG def ids. url(#…) references resolve
 * document-wide, so two chart instances that both wrote e.g. `#hsd-rail-plate-fill` would BOTH
 * paint with whichever def happens to come first in the document — the second instance's theme
 * would silently lose. Every renderer/backdrop instance therefore prefixes its defs with a
 * process-unique token from here.
 */
/** A document-unique id prefix for one renderer/backdrop instance, e.g. "hsd-ring-i3". */
export declare function nextInstanceUid(prefix: string): string;
