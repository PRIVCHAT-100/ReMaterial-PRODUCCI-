
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Breadcrumb (shadcn compatible)
 * Exports: Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
 * NOTE: API compatible con shadcn para que las importaciones existentes sigan funcionando.
 */

export function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" {...props} />
}

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  asChild?: boolean
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref as any}
        className={cn("transition-colors hover:text-foreground", className)}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("font-normal text-foreground", className)} {...props} />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li"> & { children?: React.ReactNode }) => {
  return (
    <li role="presentation" aria-hidden className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </li>
  )
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"
