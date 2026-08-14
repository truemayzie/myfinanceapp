import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
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
    setTimeout(() => { showToast('Сообщение отправлено'); onClose() }, 600)
  }

  return (
    <Sheet title="Поддержка" onClose={onClose}>
      <p className="muted" style={{ marginBottom: 12 }}>
        Опишите вопрос или предложение — мы посмотрим в ближайшее время.
      </p>
      <textarea
        className="input ta"
        rows={4}
        placeholder="Что случилось?"
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={sent}
      />
      <div style={{ height: 12 }} />
      <Button block onClick={send} disabled={sent || !text.trim()}>Отправить</Button>
    </Sheet>
  )
}