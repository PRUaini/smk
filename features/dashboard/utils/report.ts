export interface ChartDatum {
  label: string;
  points: number;
}

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: ChartPadding;
}

export function getMonthsAbbr() {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agt",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ] as const;
}

export function buildLineChartSvg(
  dataset: ChartDatum[],
  config: ChartConfig,
  minMaxValue: number,
  labelInterval: number
) {
  const { width, height, padding } = config;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVal = Math.max(minMaxValue, ...dataset.map((d) => d.points));

  const points = dataset.map((d, index) => {
    const x = padding.left + (index / Math.max(1, dataset.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.points / maxVal) * chartHeight;
    return { x, y, label: d.label, val: d.points };
  });

  let linePath = "";
  let areaPath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = Math.round(ratio * maxVal);
    const y = padding.top + chartHeight - ratio * chartHeight;
    return { y, label: val };
  });

  const xLabels = dataset
    .map((d, index) => ({ x: points[index].x, label: d.label, index }))
    .filter(({ index }) => index % labelInterval === 0 || index === dataset.length - 1)
    .map(({ x, label }) => ({ x, label }));

  return { width, height, points, linePath, areaPath, gridLines, xLabels };
}
