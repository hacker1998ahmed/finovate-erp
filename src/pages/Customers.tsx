import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Plus } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/customers?search=${search}`)
      .then((res) => res.json())
      .then((res) => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  const handleAdd = (customer: Omit<Customer, "id">) => {
    fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    })
      .then((res) => res.json())
      .then((res) => {
        setCustomers([...customers, res.data]);
      });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    handleAdd({
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      address: data.get("address") as string,
      city: data.get("city") as string,
      country: data.get("country") as string,
    });
    form.reset();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> إضافة عميل
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Input
            placeholder="بحث... (اسم أو بريد إلكتروني)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" placeholder="الاسم *" required />
            <Input name="email" type="email" placeholder="البريد الإلكتروني *" required />
            <Input name="phone" placeholder="الهاتف" />
            <Input name="city" placeholder="المدينة" />
            <Input name="country" placeholder="الدولة" />
            <Textarea name="address" placeholder="العنوان" className="col-span-full" />
          </div>
          <Button type="submit">حفظ العميل</Button>
        </form>
      </div>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableCell>الاسم</TableCell>
            <TableCell>البريد الإلكتروني</TableCell>
            <TableCell>الهاتف</TableCell>
            <TableCell>المدينة</TableCell>
            <TableCell>الدولة</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell>{customer.city || "-"}</TableCell>
              <TableCell>{customer.country || "-"}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost">
                  تعديل
                </Button>
                <Button size="sm" variant="destructive">
                  حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Customers;