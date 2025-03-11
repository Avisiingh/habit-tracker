import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Check authentication on initial load and route changes
  useEffect(() => {
    const authToken = Cookies.get('authToken')
    const isLoginPage = router.pathname === '/login'

    if (!authToken && !isLoginPage) {
      router.push('/login')
    }
  }, [router.pathname])

  return <Component {...pageProps} />
} 