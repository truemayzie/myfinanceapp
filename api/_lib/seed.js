// Копия DEFAULT_CATEGORIES/uid из src/data/seed.ts для серверных функций.
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const DEFAULT_CATEGORIES = [
  { name: 'Продукты', icon: 'cart', color: '#1b7f67', monthlyLimit: 15000, sortOrder: 0, isArchived: false },
  { name: 'Кафе и рестораны', icon: 'cup', color: '#b45d41', monthlyLimit: 5000, sortOrder: 1, isArchived: false },
  { name: 'Транспорт', icon: 'train', color: '#4c71b8', monthlyLimit: 3000, sortOrder: 2, isArchived: false },
  { name: 'Жильё', icon: 'house', color: '#8559b7', monthlyLimit: 25000, sortOrder: 3, isArchived: false },
  { name: 'Развлечения', icon: 'balloon', color: '#bb7a19', monthlyLimit: 4000, sortOrder: 4, isArchived: false },
  { name: 'Здоровье', icon: 'health', color: '#278a9c', monthlyLimit: 3000, sortOrder: 5, isArchived: false },
  { name: 'Прочее', icon: 'tag', color: '#77776f', monthlyLimit: 0, sortOrder: 6, isArchived: false },
]

module.exports = { uid, DEFAULT_CATEGORIES }
