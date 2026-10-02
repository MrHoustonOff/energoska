// MOCK-DEMO: рисованные фото магазинов из макета (src/assets/shops/<id>.svg).
const urls = import.meta.glob('../assets/shops/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export const shopPhoto = (id: string): string | undefined => urls[`../assets/shops/${id}.svg`];
