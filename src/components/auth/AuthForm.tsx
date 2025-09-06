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

  const formFields = {
    signUp: {
      name: {
        order: 1,
        label: 'ユーザーネーム',
        placeholder: 'ユーザーネームを入力してください',
        required: true,
      },
      email: {
        order: 2,
        label: 'メールアドレス',
        placeholder: 'メールアドレスを入力してください',
        required: true,
      },
      password: {
        order: 3,
        label: 'パスワード',
        placeholder: 'パスワードを入力してください',
        required: true,
      },
      confirm_password: {
        order: 4,
        label: 'パスワード（確認）',
        placeholder: 'パスワードを再入力してください',
        required: true,
      },
    },
  }

  export default function AuthForm() {
    return (
      <Authenticator loginMechanisms={['email']} formFields={formFields}>
        <AuthenticatedApp />
      </Authenticator>
    )
  }