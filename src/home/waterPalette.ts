// «Водичка»: цвет и строка по времени суток (WaterButton/README.md и preview.html).
import type { WaterDaypart } from '../domain';

export interface WaterLook { b0: string; b1: string; b2: string; fg: string; text: string }

export const WATER_LOOKS: Record<WaterDaypart, WaterLook> = {
  dawn: { b0: '#ffb8cf', b1: '#a9d8ff', b2: '#ffdca3', fg: '#0a1f44', text: 'проснулся? сначала стакан воды' },
  morning: { b0: '#7fd6ff', b1: '#fff3a8', b2: '#3a9bff', fg: '#0a1f44', text: 'утро: запусти организм водой' },
  brunch: { b0: '#3a9bff', b1: '#9be8ff', b2: '#1f6fe8', fg: '#04223f', text: 'скоро обед, а воды было мало' },
  lunch: { b0: '#12c4ff', b1: '#c4fff1', b2: '#1f78ee', fg: '#04223f', text: 'обед: запей, не энергетиком' },
  afternoon: { b0: '#19b3a6', b1: '#9af2cb', b2: '#2f7dee', fg: '#04223f', text: 'после еды воду пьют, а не ждут' },
  evening: { b0: '#6a5cff', b1: '#ff93bd', b2: '#2f8cff', fg: '#fff', text: 'вечер: допей норму, пока не поздно' },
  late: { b0: '#232a86', b1: '#6a5cff', b2: '#1f6fe8', fg: '#fff', text: 'последний стакан перед сном' },
  night: { b0: '#08113a', b1: '#1f3aa8', b2: '#3a9bff', fg: '#fff', text: 'ночью только маленькими глотками' },
};

/** Строка для состояния «ещё не пил»: утренняя «пока ни глотка, а уже утро» только до обеда, позже — строка времени суток. */
export const NOT_YET_MORNING = 'пока ни глотка, а уже утро';
