import type { Metadata } from "next"
import { Inter, DM_Mono } from "next/font/google"
import { Toaster } from "sonner"
import QueryProvider from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "cEdis — Control de CEDIS",
    template: "%s | cEdis",
  },
  description: "Sistema de gestión para centros de distribución de restaurantes",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
