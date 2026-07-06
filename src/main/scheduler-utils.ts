// Pure helper utilities extracted from Schedule
export function randomChoices<T>(arr: T[], numOfItems: number): T[] {
  if (numOfItems <= 0) return [];
  if (numOfItems >= arr.length) return [...arr];

  // Fisher-Yates shuffle (non-destructive)
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, numOfItems);
}

/**
 * Remove all elements in `elementsToRemove` from `arr` in-place.
 * Mutates the original array the same way schedule.removeElementsFromArray did.
 */
export function removeElementsFromArrayInPlace(arr: string[], elementsToRemove: string[]): void {
  const toRemove = new Set(elementsToRemove);
  for (let i = arr.length - 1; i >= 0; i--) {
    if (toRemove.has(arr[i])) {
      arr.splice(i, 1);
    }
  }
}

/**
 * Remove duplicate choices from second and third arrays based on first array,
 * and remove duplicates from third array based on second array.
 * Mutates secondChoices and thirdChoices in-place.
 */
export function removeDupChoicesInPlace(
  firstChoices: string[],
  secondChoices: string[],
  thirdChoices: string[]
): void {
  // Remove any name in first from second and third
  for (const name of firstChoices) {
    if (secondChoices.includes(name)) {
      removeElementsFromArrayInPlace(secondChoices, [name]);
    }
    if (thirdChoices.includes(name)) {
      removeElementsFromArrayInPlace(thirdChoices, [name]);
    }
  }
  // Remove any name in second from third
  for (const name of secondChoices) {
    if (thirdChoices.includes(name)) {
      removeElementsFromArrayInPlace(thirdChoices, [name]);
    }
  }
}

/**
 * Type guard for checking if `key` exists on `obj`.
 */
export function hasKey<T extends object>(obj: T, key: string | number | symbol): key is keyof T {
  return key in obj;
}

/**
 * Returns the specific choice name used in schedule (e.g. 'land1', 'land2', 'water3').
 */
export function getKidsChoice(activityType: 'land' | 'water', choiceNum: 1 | 2 | 3): string {
  return `${activityType}${choiceNum}`;
}
