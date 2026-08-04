import Link from 'next/link'
import Image from 'next/image'
import { APP_BRAND, APP_LOGO, APP_NAME } from '@/lib/constants'
import { cn } from '@/utils/cn'

interface BrandMarkProps {
  collapsed?: boolean
  className?: string
  href?: string
}

/** Sidebar / mobile brand: logo mark + Teksage wordmark. */
export function BrandMark({ collapsed = false, className, href = '/' }: BrandMarkProps) {
  const content = (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <Image
        src={APP_LOGO}
        alt={APP_NAME}
        width={36}
        height={36}
        className={cn('shrink-0 object-contain', collapsed ? 'h-8 w-8' : 'h-9 w-9')}
        priority
      />
      {!collapsed && (
        <span className="text-foreground truncate text-xl font-bold tracking-tight">{APP_BRAND}</span>
      )}
    </span>
  )

  return (
    <Link href={href} className="flex min-w-0 items-center overflow-hidden">
      {content}
    </Link>
  )
}
