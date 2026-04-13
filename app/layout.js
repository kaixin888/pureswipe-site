import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'clowand | Premium US Bathroom Hygiene',
  description: 'Clean Smarter, Not Harder. The 18-inch hygienic revolution for your bathroom.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://img.icons8.com/ios-filled/50/228BE6/toilet.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
