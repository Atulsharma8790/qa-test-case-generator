import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Test Case Generator — QA Test Suite from User Stories',
  description:
    'Paste a JIRA ticket, user story, or acceptance criteria and get structured BDD Gherkin or plain-English test cases in seconds. Built by Atul Sharma — QA Automation Architect.',
  keywords: ['test case generator', 'BDD', 'Gherkin', 'QA automation', 'JIRA', 'AI testing', 'test suite', 'quality engineering'],
  authors: [{ name: 'Atul Sharma', url: 'https://atulsharma8790.github.io' }],
  openGraph: {
    title: 'AI Test Case Generator',
    description: 'Generate comprehensive test suites from requirements in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
