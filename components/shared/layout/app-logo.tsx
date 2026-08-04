import Image from 'next/image'
import { APP_LOGO, APP_NAME } from '@/lib/constants'
import { cn } from '@/utils/cn'

const SIZES = {
  sm: { width: 120, height: 32 },
  md: { width: 160, height: 40 },
  lg: { width: 200, height: 52 },
} as const

interface AppLogoProps {
  size?: keyof typeof SIZES
  className?: string
  priority?: boolean
}

export function AppLogo({ size = 'sm', className, priority = false }: AppLogoProps) {
  const { width, height } = SIZES[size]

  return (
    <Image
      src={APP_LOGO}
      alt={APP_NAME}
      width={width}
      height={height}
      className={cn('shrink-0 object-contain object-left', className)}
      priority={priority}
    />
  )
}
