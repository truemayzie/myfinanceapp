import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Field'
import { useApp } from '../AppContext'

export default function SupportSheet({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const sendSupport = useStore(s => s.sendSupport)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!text.trim()) return
    sendSupport(text.trim())
    setSent(true)
    setTimeout(() => {
      showToast('Сообщение отправлено')
      onClose()
    }, 600)
  }

  return (
    <Sheet title="Поддержка" eyebrow="Обратная связь" onClose={onClose}>
      <p className="mb-4 text-xs leading-5 text-faint">
        Опишите вопрос или предложение — мы посмотрим в ближайшее время.
      </p>

      <Textarea
        rows={5}
        placeholder="Что случилось?"
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={sent}
      />

      <Button block className="mt-5" onClick={send} disabled={sent || !text.trim()}>
        {sent ? (
          <>
            <Check className="size-4" strokeWidth={2.4} />
            Отправлено
          </>
        ) : (
          <>
            <Send className="size-4" strokeWidth={1.9} />
            Отправить
          </>
        )}
      </Button>
    </Sheet>
  )
}
