const fs = require('fs');
const path = require('path');

const files = {
  "src/components/Providers.tsx": `"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
`,

  "src/app/admin/layout.tsx": `"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { LayoutDashboard, Users, Tag, Package, ShoppingCart, CreditCard, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Naam', path: '/admin/naam', icon: Tag },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-[#FDFBF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        
        {/* Sidebar */}
        <aside className={\`fixed inset-y-0 left-0 z-50 w-64 bg-[#7A1F1F] text-white transition-transform transform \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0\`}>
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h1 className="text-xl font-bold font-devanagari">NaamVriddhi Admin</h1>
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>✕</Button>
          </div>
          <nav className="p-4 space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);
              return (
                <Link key={item.name} href={item.path} className={\`flex items-center space-x-3 p-3 rounded-md transition-colors \${isActive ? 'bg-[#F59E0B] text-white font-semibold' : 'hover:bg-white/10'}\`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b shadow-sm">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" className="text-[#7A1F1F] dark:text-red-400 font-semibold flex items-center space-x-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> <span>Logout</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
`,

  "src/app/admin/dashboard/page.tsx": `"use client";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, IndianRupee, Clock, Printer, PackageCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: orders, isLoading: loadingOrders } = useQuery({ queryKey: ['orders'], queryFn: () => fetch('/api/admin/orders').then(r => r.json()) });
  const { data: users, isLoading: loadingUsers } = useQuery({ queryKey: ['users'], queryFn: () => fetch('/api/admin/users').then(r => r.json()) });

  if (loadingOrders || loadingUsers) return <div>Loading dashboard...</div>;

  const totalOrders = orders?.data?.length || 0;
  const totalRevenue = orders?.data?.reduce((acc: number, o: any) => acc + o.total_amount, 0) || 0;
  const pendingOrders = orders?.data?.filter((o: any) => o.status === 'Pending Payment' || o.status === 'Personalization Pending').length || 0;
  const printingOrders = orders?.data?.filter((o: any) => o.status === 'Sent to Printer' || o.status === 'Printing').length || 0;
  const deliveredOrders = orders?.data?.filter((o: any) => o.status === 'Delivered').length || 0;
  const totalUsers = users?.data?.length || 0;

  const kpis = [
    { title: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Revenue", value: \`₹\${totalRevenue.toLocaleString('en-IN')}\`, icon: IndianRupee, color: "text-green-500" },
    { title: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-purple-500" },
    { title: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-yellow-500" },
    { title: "Printing", value: printingOrders, icon: Printer, color: "text-orange-500" },
    { title: "Delivered", value: deliveredOrders, icon: PackageCheck, color: "text-teal-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-devanagari text-[#7A1F1F]">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-[#7A1F1F]/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className={\`w-4 h-4 \${kpi.color}\`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`,

  "src/app/admin/orders/page.tsx": `"use client";
export default function Orders() {
  return <div><h1 className="text-2xl font-bold mb-4">Orders</h1><p>Orders list implementation goes here.</p></div>;
}
`,
  "src/app/admin/users/page.tsx": `"use client";
export default function Users() {
  return <div><h1 className="text-2xl font-bold mb-4">Users</h1><p>Users list implementation goes here.</p></div>;
}
`,
  "src/app/admin/naam/page.tsx": `"use client";
export default function Naam() {
  return <div><h1 className="text-2xl font-bold mb-4">Naam</h1><p>Naam list implementation goes here.</p></div>;
}
`,
  "src/app/admin/products/page.tsx": `"use client";
export default function Products() {
  return <div><h1 className="text-2xl font-bold mb-4">Products</h1><p>Products list implementation goes here.</p></div>;
}
`,
  "src/app/admin/payments/page.tsx": `"use client";
export default function Payments() {
  return <div><h1 className="text-2xl font-bold mb-4">Payments</h1><p>Payments list implementation goes here.</p></div>;
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}
console.log("UI layout and dashboard generated");
