import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  category?: string;
  supplier?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    fetch(`/api/products?search=${search}`)
      .then((res) => res.json())
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  const handleCreate = () => {
    navigate("/products/create");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
        <Button onClick={handleCreate} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> إضافة منتج
        </Button>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          <Input
            placeholder="بحث... (اسم أو SKU)"
            value={search}
            onChange={(e) => {
              const newSearch = e.target.value;
              const params = new URLSearchParams();
              params.set("search", newSearch);
              const href = `/products?${params.toString()}`;
              window.history.pushState({}, "", href);
              // Re-fetch with new search
              fetch(`/api/products?search=${newSearch}`).then((res) => res.json()).then((res) => setProducts(res.data));
            }}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>اسم المنتج</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>السعر</TableCell>
                <TableCell>المخزون</TableCell>
                <TableCell>الفئة</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.quantity <= product.minStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                    >
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.quantity <= product.minStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                    >
                      {product.quantity > 0 ? "متوفر" : "نفاد المخزون"}
                    </span>
                  </TableCell>
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

          {products.length === 0 && (
            <p className="mt-6 text-sm text-gray-500">لا توجد منتجات مسجلة</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;