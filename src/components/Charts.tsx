"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeExpenseChartProps {
  data: { name: string; income: number; expense: number }[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Receitas vs Despesas Diárias</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs text-gray-600 dark:text-gray-400" />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="hsl(142.1 76.2% 36.3%)"
            activeDot={{ r: 8 }}
            name="Receita"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="hsl(0 84.2% 60.2%)"
            activeDot={{ r: 8 }}
            name="Despesa"
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

interface CategoriesPieProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export const CategoriesPie: React.FC<CategoriesPieProps> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Despesas por Categoria</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

interface GoalsBarProps {
  data: { name: string; progress: number }[];
}

export const GoalsBar: React.FC<GoalsBarProps> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Progresso das Metas</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs text-gray-600 dark:text-gray-400" />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Bar dataKey="progress" fill="hsl(217.2 91.2% 59.8%)" name="Progresso (%)" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);