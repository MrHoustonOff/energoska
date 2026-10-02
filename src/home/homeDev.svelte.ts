// DEV: принудительный показ формы кнопки «Энергоснулся» (Ещё → Лаборатория), чтобы увидеть все формы из макета без смены времени и данных.
// Используется только экраном Лаборатории и Home; в боевую логику не входит.
import type { EnergyContext, EnergyStage } from '../domain';

export const homeDev = $state<{ on: boolean; stage: EnergyStage; ctx: EnergyContext; night: boolean; soft: boolean }>({ on: false, stage: 'live', ctx: 'default', night: false, soft: false });
