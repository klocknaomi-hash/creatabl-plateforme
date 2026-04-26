import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full bg-indigo-500/10 p-3 ring-1 ring-indigo-500/30">
            <svg
              className="h-10 w-10 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="flex items-baseline gap-0 text-3xl font-bold tracking-tight text-zinc-100">
            Welcome to Creatabl.
            <span
              className="font-normal italic text-indigo-400"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ia
            </span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Your Social Media Copilot
          </p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
