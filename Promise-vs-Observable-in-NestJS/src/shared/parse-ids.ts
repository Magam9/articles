/** "1,2,3" -> [1, 2, 3] */
export function parseIds(raw: string): number[] {
  return raw
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}
