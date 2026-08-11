'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AttachmentLinkFormProps {
  disabled?: boolean
  onSubmit: (values: { label: string; url: string }) => Promise<void>
}

export function AttachmentLinkForm({ disabled, onSubmit }: AttachmentLinkFormProps) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled || saving) return
    setSaving(true)
    try {
      await onSubmit({ label: label.trim(), url: url.trim() })
      setLabel('')
      setUrl('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        External link
      </p>
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
        required
        disabled={disabled || saving}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          type="url"
          required
          disabled={disabled || saving}
          className="min-w-0 sm:flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || saving}
          className="shrink-0 self-start"
        >
          {saving ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Add link'
          )}
        </Button>
      </div>
    </form>
  )
}
