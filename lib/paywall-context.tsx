'use client'
import { createContext, useContext } from 'react'

interface PaywallContextType {
  isLocked: boolean
  selectedPlan: string | null
}

const PaywallContext = createContext<PaywallContextType>({
  isLocked: false,
  selectedPlan: null
})

export const usePaywall = () => useContext(PaywallContext)

export function PaywallProvider({ 
  children, 
  isLocked,
  selectedPlan 
}: { 
  children: React.ReactNode
  isLocked: boolean
  selectedPlan: string | null
}) {
  return (
    <PaywallContext.Provider value={{ isLocked, selectedPlan }}>
      {children}
    </PaywallContext.Provider>
  )
}
