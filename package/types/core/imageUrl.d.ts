/**
 * Guard for host-supplied image URLs (backdrop image, theme image textures). The library hands
 * these to the browser as image sources — `<image href>`, `new Image().src`, `<feImage href>` —
 * so they are loaded on the library's behalf. Image contexts never execute script, so this is
 * not an XSS filter; it limits the surface to schemes that make sense for images and rejects
 * the rest (`javascript:`, `file:`, `data:text/html`, custom schemes) loudly, like unknown
 * theme keys. Origin policy stays with the host (and its CSP `img-src`).
 */
import type { ThemeThreadTexture } from "./theme";
/** True for http(s), blob:, data:image/* and scheme-less (relative) URLs. */
export declare function isAllowedImageUrl(url: unknown): url is string;
export declare function assertAllowedImageUrl(url: unknown, what: string): asserts url is string;
export declare function assertThreadTextureUrls(texture: ThemeThreadTexture | null | undefined): void;
