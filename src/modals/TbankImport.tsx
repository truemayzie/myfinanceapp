import { Sheet } from '../components/Sheet'
import { Icon } from '../components/icons'

const BOT_LINK = 'https://t.me/MyFinance_TBank_Bot'

export default function TbankImport({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Импорт из банка" onClose={onClose}>
      <div className="empty">
        <div className="empty-art"><Icon name="phone" size={46} /></div>
        <h3>Пуши Т-Банка</h3>
        <p style={{ textAlign: 'center' }}>
          Подключите бота и включите пересылку уведомлений о списаниях — операции будут попадать в приложение сами.
        </p>
      </div>
      <ol className="howto">
        <li>Откройте бота <b>MyFinance</b> через кнопку ниже</li>
        <li>Нажмите «Отправить push» в меню</li>
        <li>Первые переводы появятся в истории автоматически</li>
      </ol>
      <a className="btn btn-ink btn-block" href={BOT_LINK} target="_blank" rel="noreferrer">Открыть бота</a>
      <p className="muted center" style={{ marginTop: 10 }}>Мэтчинг категорий — по названию магазина из пуша.</p>
    </Sheet>
  )
}