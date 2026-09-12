import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";

interface DashboardData {
  kpi: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    profit: number;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    quantity: number;
    minStock: number;
    price: number;
  }>;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpi = data?.kpi;
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];

  const chartData = [
    { name: "يناير", revenue: 12000, expenses: 8000 },
    { name: "فبراير", revenue: 15000, expenses: 9500 },
    { name: "مارس", revenue: 18000, expenses: 11000 },
    { name: "أبريل", revenue: 22000, expenses: 13000 },
    { name: "مايو", revenue: 25000, expenses: 15000 },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة المعلومات</h1>
          <p className="text-sm text-gray-500">نظرة عامة على أداء عملك</p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          جميع الأنظمة تعمل بشكل جيد
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={DollarSign} label="إجمالي الإيرادات" value={kpi?.revenue ?? 0} format="currency" />
        <KpiCard icon={ShoppingCart} label="إجمالي الطلبات" value={kpi?.orders ?? 0} format="number" />
        <KpiCard icon={Users} label="إجمالي العملاء" value={kpi?.customers ?? 0} format="number" />
        <KpiCard icon={Package} label="إجمالي المنتجات" value={kpi?.products ?? 0} format="number" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">مخطط الإيرادات والمصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#9ca3af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">توزيع الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="revenue" nameKey="name" innerRadius={60} outerRadius={100} fill="#8884d8" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">المنتجات منخفضة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد منتجات منخفضة المخزون</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.id}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-red-600">{product.quantity} مخزون</span>
                      <p className="text-xs text-gray-500">الحد الأدنى: {product.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function KpiCard({ icon: Icon, label, value, format }: { icon: any; label: string; value: number; format: "currency" | "number" }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {format === "currency" ? `$${value.toLocaleString()}` : value.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-primary-50">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs">
          <ArrowUp className="h-3 w-3 text-green-500" />
          <span className="text-green-500 font-semibold">+12.5%</span>
          <span className="text-gray-400">من الشهر الماضي</span>
        </div>
      </CardContent>
    </Card>
  );
}

function statusClass(status: string) {
  if (status === "completed") return "bg-green-100 text-green-800";
  if (status === "pending") return "bg-yellow-100 text-yellow-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  return "bg-blue-100 text-blue-800";
}

export default Dashboard;