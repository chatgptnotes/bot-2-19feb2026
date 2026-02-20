import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import AdminSidebar from '@/app/components/AdminSidebar'

export const metadata: Metadata = {
  title: 'ClawdBot Dashboard - Dr. Murali BK',
  description: 'Task management dashboard for ClawdBot assistant',
  icons: {
    icon: '/hospital-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminSidebar>
            {children}
          </AdminSidebar>
        </AuthProvider>
      </body>
    </html>
  )
}
