import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/dashboard/page";
import ProductsPage from "@/app/products/page";
import InventoryPage from "@/app/inventory/page";
import MonitoringPage from "@/app/monitoring/page";
import SuppliersPage from "@/app/suppliers/page";
import SalesPage from "@/app/sales/page";
import ReportsPage from "@/app/reports/page";
import CSVManagerPage from "@/app/csv-manager/page";
import MCPHubPage from "@/app/mcp-hub/page";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/csv-manager" element={<CSVManagerPage />} />
          <Route path="/mcp-hub" element={<MCPHubPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
