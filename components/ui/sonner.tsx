'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      expand
      visibleToasts={4}
      gap={10}
      offset={16}
      duration={3500}
      icons={{
        success: <CircleCheckIcon className="text-success size-4" />,
        info: <InfoIcon className="text-info size-4" />,
        warning: <TriangleAlertIcon className="text-warning size-4" />,
        error: <OctagonXIcon className="text-destructive size-4" />,
        loading: <Loader2Icon className="text-muted-foreground size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !border !border-border/80 !bg-popover !text-popover-foreground !shadow-dropdown !rounded-xl !px-4 !py-3 !gap-3',
          title: '!text-sm !font-semibold !text-foreground',
          description: '!text-xs !text-muted-foreground',
          actionButton:
            '!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-medium !h-8 !px-3',
          cancelButton:
            '!rounded-lg !bg-muted !text-muted-foreground !text-xs !font-medium !h-8 !px-3',
          closeButton:
            '!border-border !bg-background !text-muted-foreground hover:!bg-muted hover:!text-foreground',
          success: '!border-success/25',
          error: '!border-destructive/25',
          warning: '!border-warning/25',
          info: '!border-info/25',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
