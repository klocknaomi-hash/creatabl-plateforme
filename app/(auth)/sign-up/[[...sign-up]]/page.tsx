import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-zinc-900 border border-zinc-800 shadow-xl",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-zinc-800 border-zinc-700 text-zinc-100",
          footerActionText: "text-zinc-400",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700",
          dividerText: "text-zinc-500",
          dividerLine: "bg-zinc-800",
        },
      }}
    />
  );
}
