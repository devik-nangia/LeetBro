import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Sidebar />
      <main className="ml-[250px] pt-14 p-6">
        {children}
      </main>
    </div>
  );
}
