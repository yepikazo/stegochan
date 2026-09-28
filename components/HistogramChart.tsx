interface HistogramChartProps {
  title: string;
  data: number[];
  color: "red" | "green" | "blue";
}

const COLORS: Record<HistogramChartProps["color"], { indicator: string; bar: string }> = {
  red: { indicator: "bg-[#f87171]", bar: "fill-[#f87171]" },
  green: { indicator: "bg-[#4ade80]", bar: "fill-[#4ade80]" },
  blue: { indicator: "bg-[#60a5fa]", bar: "fill-[#60a5fa]" },
};

export default function HistogramChart({ title, data, color }: HistogramChartProps) {
  const maxValue = Math.max(...data, 1);
  const barWidth = 256; // 256 bins from 0..255
  const chartHeight = 96;
  const barGap = 1;

  return (
    <div className="rounded-md border border-[#33363f] bg-[#262933] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] text-[#93969f]">{title}</span>
        <span
          className={`h-2.5 w-2.5 rounded-full ${COLORS[color].indicator}`}
          aria-hidden="true"
        />
      </div>

      <svg
        viewBox={`0 0 ${barWidth} ${chartHeight}`}
        className="h-24 w-full rounded-sm bg-[#111318]"
        role="img"
        aria-label={`${title} histogram`}
      >
        <rect x="0" y="0" width={barWidth} height={chartHeight} className="fill-[#111318]" rx="4" />
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 10);
          const x = index * (barWidth / data.length) + barGap / 2;
          const y = chartHeight - barHeight;

          return (
            <rect
              key={`${title}-${index}`}
              x={x}
              y={y}
              width={Math.max(1, barWidth / data.length - barGap)}
              height={barHeight}
              className={COLORS[color].bar}
              opacity={0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}
