'use client'

  import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
  import { useRouter } from 'next/navigation'
  import { useEffect } from 'react'
  import '@aws-amplify/ui-react/styles.css'

  function AuthenticatedApp() {
    const { user, signOut } = useAuthenticator()
    const router = useRouter()

    useEffect(() => {
      if (user) {
        router.push('/dashboard')
      }
    }, [user, router])

    return (
      <div>
        <p>Welcome {user?.username}!</p>
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  export default function AuthForm() {
    return (
      <Authenticator>
        <AuthenticatedApp />
      </Authenticator>
    )
  }