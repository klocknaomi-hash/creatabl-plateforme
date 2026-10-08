"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

// Switch du design system : 44 × 24 px. Éteint : contour et pastille border-control
// sur fond blanc. Allumé : fond violet-600, pastille blanche. Désactivé : fond surface.
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-[1.5px] transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-[#E7DCFC] data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-checked:border-[#7225E3] data-checked:bg-[#7225E3] data-unchecked:border-[#878399] data-unchecked:bg-white dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:border-[#E8E6F0] data-disabled:bg-[#F8F7FC] data-disabled:data-checked:border-[#E7DCFC] data-disabled:data-checked:bg-[#E7DCFC]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-[15px] group-data-[size=sm]/switch:size-3 translate-x-[3px] group-data-[size=default]/switch:data-checked:translate-x-[22px] group-data-[size=sm]/switch:data-checked:translate-x-[18px] data-checked:bg-white data-unchecked:bg-[#878399] group-data-[disabled]/switch:bg-[#E8E6F0] group-data-[disabled]/switch:data-checked:bg-white"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
