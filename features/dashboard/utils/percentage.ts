export function calculatePercentage(value: number, target: number) {
  if (!Number.isFinite(value) || !Number.isFinite(target) || target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / target) * 100));
}
