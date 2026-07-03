import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComplaintTrendPoint } from "../../model/types/dashboard.types";

interface ComplaintTrendCardProps {
  data: ComplaintTrendPoint[];
}

export function ComplaintTrendChart({ data }: ComplaintTrendCardProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            stroke="rgba(19, 35, 31, 0.08)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--rail-border)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-panel)",
              border: "1px solid var(--rail-border)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--rail-ink)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Line
            dataKey="incoming"
            name="Masuk"
            type="monotone"
            stroke="var(--signal-blue)"
            strokeWidth={4}
            dot={{ fill: "var(--surface-panel)", strokeWidth: 3, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            dataKey="resolved"
            name="Selesai"
            type="monotone"
            stroke="var(--signal-green)"
            strokeWidth={4}
            dot={{ fill: "var(--surface-panel)", strokeWidth: 3, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            dataKey="escalated"
            name="Dieskalasi"
            type="monotone"
            stroke="var(--signal-red)"
            strokeWidth={3}
            strokeDasharray="7 6"
            dot={{ fill: "var(--surface-panel)", strokeWidth: 3, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
