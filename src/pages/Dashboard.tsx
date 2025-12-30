"use client";

import React, { useEffect, useState } from "react";
import { IncomeExpenseChart, CategoriesPie, GoalsBar } from "@/components/Charts";
import { MadeWithDyad } from "@/components/made-with-dyad";

// Mock data to simulate API response
const mockMetrics = {
  daily: [
    { name: "Seg", income: 4000, expense: 2400 },
    { name: "Ter", income: 3000, expense: 1398 },
    { name: "Qua", income: 2000, expense: 9800 },
    { name: "Qui", income: 2780, expense: 3908 },
    { name: "Sex", income: 1890, expense: 4800 },
    { name: "Sáb", income: 2390, expense: 3800 },
    { name: "Dom", income: 3490, expense: 4300 },
  ],
  topCategories: [
    { name: "Alimentação", value: 400 },
    { name: "Transporte", value: 300 },
    { name: "Moradia", value: 300 },
    { name: "Lazer", value: 200 },
    { name: "Educação", value: 278 },
  ],
  goals: [
    { name: "Viagem", targetCents: 500000, savedCents: 350000 },
    { name: "Carro Novo", targetCents: 1000000, savedCents: 200000 },
    { name: "Casa", targetCents: 2000000, savedCents: 1500000 },
  ],
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchMetrics = async () => {
      // In a real app, you would fetch from your backend:
      // const response = await fetch('/api/portal/TENANT_ID/metrics');
      // const data = await response.json();
      // setMetrics(data);

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      setMetrics(mockMetrics);
    };

    fetchMetrics();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Dashboard Financeiro</h1>
      {metrics ? (
        <div className="space-y-4">
          <IncomeExpenseChart data={metrics.daily} />
          <CategoriesPie data={metrics.topCategories} />
          <GoalsBar
            data={metrics.goals.map((g: any) => ({
              name: g.name,
              progress: Math.round((g.savedCents / g.targetCents) * 100),
            }))}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400">Carregando dados do dashboard...</div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;