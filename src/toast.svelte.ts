// Короткое сообщение поверх экрана (docs-src/components/NotificationToasts: один тост за раз, автозакрытие 5 с).
export const toast = $state<{ text: string; id: number }>({ text: '', id: 0 });

let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(text: string, ms = 5000): void {
  clearTimeout(timer);
  toast.text = text;
  toast.id += 1;
  timer = setTimeout(hideToast, ms);
}

export function hideToast(): void {
  clearTimeout(timer);
  toast.text = '';
}
