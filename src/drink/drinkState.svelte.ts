// Локальное состояние карточки: избранное, страна в списке магазинов, отправленные в чат сообщения (не редактируются и не удаляются).
import type { Msg } from './types';

export const dk = $state({ fav: {} as Record<string, boolean>, country: 'all' as 'all' | 'by' | 'ru', sent: [] as Msg[] });
