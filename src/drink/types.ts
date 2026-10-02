export interface Param { name: string; me: string; partner: string }
export interface Shop { id: string; name: string; color: string; buys: string; last: string; price: string; points: string }
export interface Msg { who: 'me' | 'pa'; text: string; day?: string; read?: string }
export interface DrinkDetail {
  params: Param[];
  kcal: number; protein: number; fat: number; carb: number;
  volume: number; kcalTotal: number;
  tags: { text: string; color: string }[];
  shops: Shop[];
  moreShops: { count: number; colors: string[]; hint: string };
  chat: Msg[];
}
