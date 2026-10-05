/**
 * The same card the root serves.
 *
 * It has to be re-declared here: this segment sets its own `openGraph` block,
 * and a segment that does stops inheriting the parent's generated image — so
 * without this file /design would share as a bare text link.
 */
export { default, size, contentType, alt } from '../opengraph-image';
