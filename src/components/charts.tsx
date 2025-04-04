"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface DataItem {
  name: string;
  [key: string]: string | number;
}

interface PieLabelProps {
  name: string;
  percent: number;
}

interface LineChartProps {
  data: DataItem[];
  categories: string[];
  colors?: string[];
  index: string;
  className?: string;
  height?: number;
}

export function LineChart({
  data,
  categories,
  colors = COLORS,
  index,
  className,
  height = 300
}: LineChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: height || 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey={index} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
          <Legend />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[i % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// BarChart Component
interface BarChartProps {
  data: DataItem[];
  categories: string[];
  colors?: string[];
  index: string;
  className?: string;
  height?: number;
  stacked?: boolean;
}

export function BarChart({
  data,
  categories,
  colors = COLORS,
  index,
  className,
  height = 300,
  stacked = false
}: BarChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: height || 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey={index} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
          <Legend />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              stackId={stacked ? "stack" : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// PieChart Component
interface PieChartProps {
  data: DataItem[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  label?: boolean | ((props: PieLabelProps) => React.ReactNode);
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  colors = COLORS,
  className,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  label = true
}: PieChartProps) {
  const renderLabel = typeof label === "function" 
    ? label 
    : label 
      ? ({ name, percent }: PieLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`
      : undefined;

  return (
    <div className={className} style={{ width: "100%", height: height || 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
} 