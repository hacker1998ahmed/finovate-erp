import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "الرئيسية", href: "/" },
  { icon: Package, label: "المنتجات", href: "/products" },
  { icon: Users, label: "العملاء", href: "/customers" },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders" },
  { icon: Receipt, label: "المصاريف", href: "/expenses" },
  { icon: BarChart3, label: "التقارير", href: "/reports" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-2xl transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-6">
        {!collapsed && (
          <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
            Finovate ERP
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};