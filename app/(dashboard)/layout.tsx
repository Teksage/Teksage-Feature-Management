import { Sidebar } from '@/components/shared/layout/sidebar'
import { Navbar } from '@/components/shared/layout/navbar'
import { MobileSidebar } from '@/components/shared/layout/mobile-sidebar'
import { DashboardScrollLock } from '@/components/shared/layout/dashboard-scroll-lock'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardScrollLock />
      <div className="flex h-dvh overflow-hidden">
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Navbar />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </>
  )
}
