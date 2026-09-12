import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Download } from "lucide-react";

interface ReportData {
  type: string;
  data: any;
}

const Reports = () => {
  const [type, setType] = useState("summary");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=${type}`)
      .then((res) => res.json())
      .then((res) => {
        setReport(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-sm text-gray-500">تقارير تحليلية لأداء العمل</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> تصدير PDF
        </Button>
      </div>

      <div className="mb-6">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="اختر نوع التقرير" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">ملخص الأداء</SelectItem>
            <SelectItem value="sales">تقارير المبيعات</SelectItem>
            <SelectItem value="inventory">تقارير المخزون</SelectItem>
            <SelectItem value="expenses">تقارير المصروفات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {report?.type === "summary" && <SummaryReport data={report.data} />}
          {report?.type === "sales" && <SalesReport data={report.data} />}
          {report?.type === "inventory" && <InventoryReport data={report.data} />}
          {report?.type === "expenses" && <ExpensesReport data={report.data} />}
        </div>
      )}
    </div>
  );
};

function SummaryReport({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ملخص الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span>إجمالي الإيرادات</span>
              <span className="font-bold">${data.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span>إجمالي المصروفات</span>
              <span className="font-bold">${data.expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span>صافي الربح</span>
              <span className="font-bold text-green-600">${data.profit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد الطلبات</span>
              <span className="font-bold">{data.orders}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد العملاء</span>
              <span className="font-bold">{data.customers}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد المنتجات</span>
              <span className="font-bold">{data.products}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">الربح حسب الشهر</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#9ca3af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function SalesReport({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">تقارير المبيعات</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InventoryReport({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">تقارير المخزون</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد منتجات منخفضة المخزون</p>
        ) : (
          <div className="space-y-3 text-sm">
            {data.map((item: any) => (
              <div key={item.id} className="flex justify-between border-b border-gray-200 pb-2">
                <span>{item.name}</span>
                <span className="font-bold text-red-600">الكمية: {item.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExpensesReport({ data }: { data: any }) {
  const chartData = data.map((item: any) => ({
    category: item.category,
    total: item.total,
    count: item.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">المصروفات حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} fill="#8884d8" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">توزيع المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {data.map((item: any) => (
              <div key={item.category} className="flex justify-between border-b border-gray-200 pb-2">
                <span>{item.category}</span>
                <span>
                  ${item.total.toFixed(2)} × {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const chartData = [
  { month: "يناير", revenue: 12000, expenses: 8000 },
  { month: "فبراير", revenue: 15000, expenses: 9500 },
  { month: "مارس", revenue: 18000, expenses: 11000 },
  { month: "أبريل", revenue: 22000, expenses: 13000 },
  { month: "مايو", revenue: 25000, expenses: 15000 },
];

export default Reports;