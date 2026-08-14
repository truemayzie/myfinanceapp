import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { buildOperationFromPush } from '../utils/tbank'
import { haptic } from '../telegram'

export default function TbankImport({ onClose }: { onClose: () => void }) {
  const { categories, addOperation } = useStore()
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  const preview = text ? buildOperationFromPush(text, categories) : null

  const save = () => {
    const op = buildOperationFromPush(text, categories)
    if (!op) { setErr('Не удалось распознать сумму. Проверьте текст пуша.'); return }
    addOperation(op)
    haptic('success')
    onClose()
  }

  const matchedCat = preview?.categoryId ? categories.find(c => c.id === preview.categoryId) : null

  return (
    <Sheet title="Импорт из Т-Банка" onClose={onClose}>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Скопируйте текст push-уведомления о списании и вставьте сюда. Категория подберётся автоматически.</p>
      <div className="field">
        <label>Текст пуша</label>
        <textarea value={text} onChange={e => { setText(e.target.value); setErr('') }} placeholder="Покупка. Карта *1234. Списано 540 ₽. Доступно 12 345 ₽. Пятёрочка" style={{ width: '100%', minHeight: 90, border: '1px solid var(--track)', borderRadius: 14, padding: 12 }} />
      </div>
      {preview && (
        <div className="card" style={{ background: 'color-mix(in srgb, var(--accent) 12%, #fff)' }}>
          <div className="row"><span className="muted">Сумма</span><span className="spacer" /><b>{preview.amount.toLocaleString('ru-RU')} ₽</b></div>
          <div className="row" style={{ marginTop: 6 }}><span className="muted">Категория</span><span className="spacer" /><b>{matchedCat ? `${matchedCat.emoji} ${matchedCat.name}` : 'не определена'}</b></div>
        </div>
      )}
      {err && <p style={{ color: 'var(--red)', fontSize: 13 }}>{err}</p>}
      <button className="primary-btn" onClick={save} disabled={!preview}>Добавить трату</button>
    </Sheet>
  )
}
