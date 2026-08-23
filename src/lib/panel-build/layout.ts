/**
 * Раскладка щита: рама → DIN-рейки → аппараты по ролям → резерв → шины N/PE.
 * Пропорции и порядок повторяют эталон «Щит_зарядки.vsdx».
 */

import {
  DEVICE_HEIGHT_MM,
  MODULE_MM,
  RAIL_HEIGHT_MM,
  ROLE_ORDER,
  type Placed,
  type Rail,
  type Resolution,
  type SpecItem,
} from "./types";
import { deviceHeightMm, deviceWidthMm, deviceModules, resolveDevice } from "./device-resolve";
import { buildConnectionPoints } from "./connection-points";

export const FRAME_PAD_MM = 22;
export const RAIL_PITCH_MM = 125;

export type LayoutOptions = {
  railModules: number;
  rails: number;
  /** Резервных модулей в конце (пустые места под аппараты). */
  reserveModules: number;
};

export type Layout = {
  placed: Placed[];
  railList: Rail[];
  resolutions: Resolution[];
  frame: { x: number; y: number; w: number; h: number };
  buses: { n: { y: number; x1: number; x2: number }; pe: { y: number; x1: number; x2: number } };
  reserveSlots: { rail: number; startModule: number; modules: number; x: number; y: number; w: number }[];
  widthMm: number;
  heightMm: number;
};

export function layoutPanel(spec: SpecItem[], opts: LayoutOptions): Layout {
  const railModules = Math.max(4, Math.round(opts.railModules));
  const ordered = spec
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      const d = ROLE_ORDER.indexOf(a.s.role) - ROLE_ORDER.indexOf(b.s.role);
      return d !== 0 ? d : a.i - b.i;
    })
    .map((x) => x.s);

  const resolutions = ordered.map(resolveDevice);

  const railX = FRAME_PAD_MM;
  const railW = railModules * MODULE_MM;
  const railCount = Math.max(1, Math.round(opts.rails));
  const railList: Rail[] = Array.from({ length: railCount }, (_, k) => ({
    index: k,
    x: railX,
    y: FRAME_PAD_MM + 18 + k * RAIL_PITCH_MM,
    w: railW,
    modules: railModules,
    used: 0,
  }));

  const placed: Placed[] = [];
  let rail = 0;
  let cursor = 0;

  const nextRail = () => {
    rail += 1;
    cursor = 0;
    if (!railList[rail])
      railList.push({
        index: rail,
        x: railX,
        y: FRAME_PAD_MM + 18 + rail * RAIL_PITCH_MM,
        w: railW,
        modules: railModules,
        used: 0,
      });
  };

  let prevRole: string | null = null;

  for (const res of resolutions) {
    const item = res.item;
    const qty = Math.max(1, item.qty);
    // Новая роль начинается с чистой позиции — как в эталоне (группировка по назначению).
    if (prevRole && prevRole !== item.role && cursor > 0) cursor += 0;
    prevRole = item.role;

    for (let n = 0; n < qty; n++) {
      const mod = res.device ? deviceModules(res.device) : Math.max(1, item.modules ?? item.poles ?? 1);
      if (cursor + mod > railModules) nextRail();
      const r = railList[rail]!;
      const w = res.device ? deviceWidthMm(res.device) : mod * MODULE_MM;
      const h = res.device ? deviceHeightMm(res.device) : DEVICE_HEIGHT_MM;
      const x = r.x + cursor * MODULE_MM;
      const y = r.y + RAIL_HEIGHT_MM / 2 - h / 2;
      const label = `${item.tag}${qty > 1 ? `.${n + 1}` : ""}`;
      placed.push({
        key: `${item.id}-${n}`,
        itemId: item.id,
        tag: label,
        role: item.role,
        device: res.device,
        missingText: res.device ? undefined : "Фигура отсутствует в библиотеке",
        rail,
        startModule: cursor,
        modules: mod,
        x,
        y,
        w,
        h,
        points: res.device ? buildConnectionPoints(res.device, item.role, item.phase) : [],
        label: [item.model || item.series || "", item.ratedCurrent ? `${item.ratedCurrent}A` : ""]
          .filter(Boolean)
          .join(" "),
      });
      cursor += mod;
      railList[rail]!.used = cursor;
    }
  }

  // ---- резервные места
  const reserveSlots: Layout["reserveSlots"] = [];
  let left = Math.max(0, Math.round(opts.reserveModules));
  while (left > 0) {
    const r = railList[rail]!;
    const free = railModules - cursor;
    if (free <= 0) {
      nextRail();
      continue;
    }
    const take = Math.min(free, left);
    reserveSlots.push({
      rail,
      startModule: cursor,
      modules: take,
      x: r.x + cursor * MODULE_MM,
      y: r.y + RAIL_HEIGHT_MM / 2 - DEVICE_HEIGHT_MM / 2,
      w: take * MODULE_MM,
    });
    cursor += take;
    railList[rail]!.used = cursor;
    left -= take;
  }

  const lastRail = railList[railList.length - 1]!;
  const busN = lastRail.y + RAIL_PITCH_MM * 0.42;
  const busPE = busN + 14;
  const frame = {
    x: FRAME_PAD_MM - 12,
    y: FRAME_PAD_MM - 12,
    w: railW + 24,
    h: busPE + 18 - (FRAME_PAD_MM - 12),
  };
  const widthMm = frame.x + frame.w + FRAME_PAD_MM;
  const heightMm = frame.y + frame.h + FRAME_PAD_MM;

  return {
    placed,
    railList,
    resolutions,
    frame,
    buses: {
      n: { y: busN, x1: railX, x2: railX + railW },
      pe: { y: busPE, x1: railX, x2: railX + railW },
    },
    reserveSlots,
    widthMm,
    heightMm,
  };
}
