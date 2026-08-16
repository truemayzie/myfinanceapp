// Копия DEFAULT_CATEGORIES/uid из src/data/seed.ts для серверных функций.
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const DEFAULT_CATEGORIES = [
  { name: 'Продукты', icon: 'cart', color: '#0E9F6E', monthlyLimit: 15000, sortOrder: 0, isArchived: false },
  { name: 'Кафе и рестораны', icon: 'cup', color: '#B3402A', monthlyLimit: 5000, sortOrder: 1, isArchived: false },
  { name: 'Транспорт', icon: 'train', color: '#2563EB', monthlyLimit: 3000, sortOrder: 2, isArchived: false },
  { name: 'Жильё', icon: 'house', color: '#6D28D9', monthlyLimit: 25000, sortOrder: 3, isArchived: false },
  { name: 'Развлечения', icon: 'balloon', color: '#C2660E', monthlyLimit: 4000, sortOrder: 4, isArchived: false },
  { name: 'Здоровье', icon: 'health', color: '#0891B2', monthlyLimit: 3000, sortOrder: 5, isArchived: false },
  { name: 'Прочее', icon: 'tag', color: '#57534E', monthlyLimit: 0, sortOrder: 6, isArchived: false },
]

module.exports = { uid, DEFAULT_CATEGORIES }