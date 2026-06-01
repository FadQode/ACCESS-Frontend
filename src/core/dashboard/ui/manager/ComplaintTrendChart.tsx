import type { ComplaintTrendPoint } from "../../model/manager-dashboard.types";

interface ComplaintTrendChartProps {
  data: ComplaintTrendPoint[];
}

export function ComplaintTrendChart({ data }: ComplaintTrendChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.incoming, item.resolved, item.escalated]),
    1,
  );

  const incomingPoints = buildPoints(data, maxValue, "incoming");
  const resolvedPoints = buildPoints(data, maxValue, "resolved");
  const escalatedPoints = buildPoints(data, maxValue, "escalated");

  return (
    <div className="h-[280px] w-full">
      <svg
        aria-label="Grafik tren keluhan"
        className="h-full w-full overflow-visible"
        role="img"
        viewBox="0 0 640 260"
      >
        <title>Grafik tren keluhan</title>
        {[48, 96, 144, 192].map((y) => (
          <line
            key={y}
            stroke="rgba(19, 35, 31, 0.08)"
            strokeWidth="1"
            x1="34"
            x2="612"
            y1={y}
            y2={y}
          />
        ))}

        <polyline
          fill="none"
          points={incomingPoints}
          stroke="var(--signal-blue)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <polyline
          fill="none"
          points={resolvedPoints}
          stroke="var(--signal-green)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <polyline
          fill="none"
          points={escalatedPoints}
          stroke="var(--signal-red)"
          strokeDasharray="7 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {data.map((item, index) => {
          const x = chartX(index, data.length);

          return (
            <g key={item.label}>
              <circle
                cx={x}
                cy={chartY(item.incoming, maxValue)}
                fill="var(--surface-panel)"
                r="4"
                stroke="var(--signal-blue)"
                strokeWidth="3"
              />
              <circle
                cx={x}
                cy={chartY(item.resolved, maxValue)}
                fill="var(--surface-panel)"
                r="4"
                stroke="var(--signal-green)"
                strokeWidth="3"
              />
              <text
                fill="var(--text-muted)"
                fontSize="12"
                textAnchor="middle"
                x={x}
                y="238"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function buildPoints(
  data: ComplaintTrendPoint[],
  maxValue: number,
  key: "escalated" | "incoming" | "resolved",
) {
  return data
    .map((item, index) => {
      return `${chartX(index, data.length)},${chartY(item[key], maxValue)}`;
    })
    .join(" ");
}

function chartX(index: number, length: number) {
  return 52 + index * (540 / Math.max(length - 1, 1));
}

function chartY(value: number, maxValue: number) {
  return 212 - (value / maxValue) * 172;
}
