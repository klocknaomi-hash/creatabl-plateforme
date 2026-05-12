import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn 
        appearance={{ variables: { colorPrimary: '#534AB7' } }}
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
