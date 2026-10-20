/**
 * Seeded pseudo-random number generator (mulberry32), for tests that need real variety from
 * `Math.random` but must stay fully deterministic. Use it with:
 *
 *   vi.spyOn(Math, 'random').mockImplementation(seededRandom(12345));
 *
 * Pinning `Math.random` to a constant (e.g. `mockReturnValue(0.1)`) makes every scheduler run
 * identical, so it can't exercise the "pick the best of many runs" behavior at all.
 */
export const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
