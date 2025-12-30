"use client";

import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Home, Repeat, Target, CreditCard } from "lucide-react";

const PortalLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 text-center text-lg font-semibold text-gray-800 dark:text-gray-100 shadow-sm">
        Finance SaaS
      </header>

      <main className="flex-grow pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 grid grid-cols-4 text-xs text-gray-600 dark:text-gray-300 shadow-lg">
        <Link
          to="/portal/dashboard"
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Home size={20} className="mb-1" />
          Dashboard
        </Link>
        <Link
          to="/portal/transactions"
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Repeat size={20} className="mb-1" />
          Transações
        </Link>
        <Link
          to="/portal/goals"
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Target size={20} className="mb-1" />
          Metas
        </Link>
        <Link
          to="/portal/billing"
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <CreditCard size={20} className="mb-1" />
          Plano
        </Link>
      </nav>
    </div>
  );
};

export default PortalLayout;