import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Plus } from "lucide-react";

interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description?: string;
  paymentMethod: string;
}

const categories = [
  "المكتب",
  "النقل",
  "التسويق",
  "الرواتب",
  "المرافق",
  "صيانة",
  "أخرى",
];

const paymentMethods = ["نقدي", "تحويل بنكي", "بطاقة ائتمان"];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/expenses")
      .then((res) => res.json())
      .then((res) => {
        setExpenses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: data.get("date") as string,
        category: data.get("category") as string,
        amount: Number(data.get("amount")),
        description: data.get("description") as string,
        paymentMethod: data.get("paymentMethod") as string,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setExpenses([...expenses, res.data]);
        form.reset();
      });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المصاريف</h1>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> إضافة مصروف
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">إضافة مصروف جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="date" type="date" required />
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="amount" type="number" step="0.01" placeholder="المبلغ" required />
              <Input name="description" placeholder="الوصف" />
              <Select name="paymentMethod" required>
                <SelectTrigger>
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">حفظ المصروف</Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجمالي المصاريف: ${totalExpenses.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>التاريخ</TableCell>
                      <TableCell>الفئة</TableCell>
                      <TableCell>المبلغ</TableCell>
                      <TableCell>الوصف</TableCell>
                      <TableCell>طريقة الدفع</TableCell>
                      <TableCell>الإجراءات</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>{expense.description || "-"}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">تعديل</Button>
                          <Button size="sm" variant="destructive">حذف</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expenses;