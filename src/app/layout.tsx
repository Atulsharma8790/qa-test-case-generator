import { Suspense } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/auth'
import { ThemeProvider } from '@/context/theme'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'
import PortfolioBar from '@/components/PortfolioBar'


export const metadata: Metadata = {
  title: 'AI Test Case Generator — QA Test Suite from User Stories',
  description:
    'Paste a JIRA ticket, user story, or acceptance criteria and get structured BDD Gherkin or plain-English test cases in seconds. Built by Atul Sharma — QA Automation Architect.',
  keywords: ['test case generator', 'BDD', 'Gherkin', 'QA automation', 'JIRA', 'AI testing', 'test suite', 'quality engineering'],
  authors: [{ name: 'Atul Sharma', url: 'https://atulsharma.vercel.app' }],
  openGraph: {
    title: 'AI Test Case Generator',
    description: 'Generate comprehensive test suites from requirements in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Suspense fallback={null}><PortfolioBar /></Suspense>
        <ThemeProvider>
          <AuthProvider>
            <DisclaimerBanner />
            {children}
          </AuthProvider>
        </ThemeProvider>
      <Suspense fallback={null}><PortfolioBar /></Suspense></body>
    </html>
  )
}
