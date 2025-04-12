'use client'
import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

function VerifyEmail() {
    const searchParams = useSearchParams()
    const router = useRouter()
  
    useEffect(() => {
      const from = searchParams.get('from')
      if (from !== 'signup') {
        router.replace('/login') // 👈 block access if not from signup
      }
    }, [searchParams])
  
    return (
      <div>
        <h1>Check your email to verify your account.</h1>
      </div>
    )
}

export default VerifyEmail
