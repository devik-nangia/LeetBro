import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopNav />
      <Sidebar />
      <main className="md:ml-[250px] pt-14 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
