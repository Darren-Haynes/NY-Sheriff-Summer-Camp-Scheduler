/**
 * Common variations/full names the client might write for each activity's
 * canonical short code, keyed by the canonical code itself (as defined in
 * Activities.landActs/waterActs). This lets us be more helpful than a strict
 * match: if a spreadsheet says "hiking" or "football", we know what they
 * mean and can quietly normalize it, rather than rejecting it and forcing
 * the client to go fix their spreadsheet.
 *
 * This list is deliberately conservative -- it should only contain
 * unambiguous variations of an activity we actually offer, never a guess at
 * what a genuinely unrecognized/misspelled value might mean. Anything not
 * listed here (or already a canonical code) is left as-is, so wrongActivity()
 * still catches it.
 *
 * Add to this list as new real-world variations turn up in client
 * spreadsheets.
 */
export const ACTIVITY_ALIASES: Record<string, string[]> = {
  // Land activities
  fris: ['frisbee', 'ultimate frisbee', 'ultimate'],
  art: ['arts', 'arts and crafts', 'arts & crafts'],
  hike: ['hiking', 'hikes'],
  pball: ['paintball', 'paint ball', 'pall'],
  bball: ['basketball', 'basket ball'],
  cheer: ['cheerleading', 'cheerleader', 'cheerleading squad'],
  fball: ['football', 'foot ball'],
  lax: ['lacrosse'],
  soc: ['soccer'],
  vball: ['volleyball', 'volley ball', 'vall'],
  arch: ['archery'],

  // Water activities
  fish: ['fishing'],
  pboard: ['paddleboard', 'paddleboarding', 'paddle board', 'paddle boarding'],
  snork: ['snorkel', 'snorkeling', 'snorkelling'],
  canoe: ['canoeing'],
  kayak: ['kayaking'],
  sail: ['sailing'],
  swim: ['swimming'],
};

const ALIAS_TO_CANONICAL: Record<string, string> = Object.entries(ACTIVITY_ALIASES).reduce(
  (map, [canonical, aliases]) => {
    aliases.forEach(alias => {
      map[alias] = canonical;
    });
    return map;
  },
  {} as Record<string, string>
);

/**
 * Normalizes a raw activity value from a spreadsheet/paste into the
 * canonical short code we schedule against, if it's a recognized variation.
 * Anything that isn't a known alias (including already-canonical codes, and
 * genuinely unrecognized/misspelled values) is returned lowercased/trimmed
 * but otherwise untouched, so DataErrorHandler.wrongActivity() still flags it.
 */
export function normalizeActivityName(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  return ALIAS_TO_CANONICAL[trimmed] ?? trimmed;
}
