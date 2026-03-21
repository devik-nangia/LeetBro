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
      <main className="md:ml-[250px] pt-14 md:pt-20 px-4 md:px-6 pb-4 md:pb-6">
        {children}
      </main>
    </div>
  );
}
