/** Skip no-op SVG attribute writes in hot paths (render + RAF). */
export declare function setAttrIfChanged(el: Element, name: string, value: string): void;
