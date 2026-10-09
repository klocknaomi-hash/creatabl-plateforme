import type { Metadata } from "next"
import { Suspense } from "react"
import { AgentIA } from "./agent-ia"

export const metadata: Metadata = {
  title: "Agent IA · Creatabl.ia",
  description: "Des agents qui font la veille et préparent vos posts.",
}

export default function AgentIAPage() {
  return (
    <Suspense fallback={null}>
      <AgentIA />
    </Suspense>
  )
}
