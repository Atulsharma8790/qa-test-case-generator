// Central URL config — set NEXT_PUBLIC_PORTFOLIO_URL in Vercel env vars
// once the portfolio is deployed. Falls back to the future domain.
export const PORTFOLIO_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? 'https://atulsharma.vercel.app'
