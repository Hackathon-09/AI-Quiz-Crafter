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
    signIn: {
      username: {
        label: 'Username or mail address',
        placeholder: 'Enter your Username or mail address',
      },
    },
    signUp: {
      username: {
        order: 1,
        label: 'ログインID (username)',
        placeholder: 'ログインに使用するID (メールアドレス以外)',
        required: true,
      },
      name: {
        order: 2,
        label: '表示名',
        placeholder: 'アプリで表示される名前',
        required: true,
      },
      email: {
        order: 3,
        label: 'メールアドレス',
        placeholder: 'メールアドレスを入力してください',
        required: true,
      },
      password: {
        order: 4,
        label: 'パスワード',
        placeholder: 'パスワードを入力してください',
        required: true,
      },
      confirm_password: {
        order: 5,
        label: 'パスワード（確認）',
        placeholder: 'パスワードを再入力してください',
        required: true,
      },
    },
  }

  export default function AuthForm() {
    return (
      <Authenticator formFields={formFields}>
        <AuthenticatedApp />
      </Authenticator>
    )
  }