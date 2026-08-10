import { kindOf, portsOf } from "./library";
import type { SchDoc } from "./types";

export type CheckResult = {
  level: "ok" | "warn" | "error";
  messages: { level: "warn" | "error" | "ok"; text: string }[];
};

/** Logical verification of the schematic. */
export function checkSchematic(doc: SchDoc): CheckResult {
  const msgs: CheckResult["messages"] = [];
  const els = doc.elements;
  const wires = doc.wires;

  const has = (fn: (t: string) => boolean) => els.some((e) => fn(e.type));
  const connectedIn = new Set(wires.map((w) => `${w.to.el}`));
  const connectedOut = new Set(wires.map((w) => `${w.from.el}`));

  if (!els.length) {
    return { level: "error", messages: [{ level: "error", text: "Схема пуста" }] };
  }
  if (!has((t) => t.startsWith("src_")) && !els.some((e) => kindOf(e.type) === "input"))
    msgs.push({ level: "error", text: "Не задан ввод питания" });
  if (!els.some((e) => kindOf(e.type) === "load"))
    msgs.push({ level: "warn", text: "Нет ни одной нагрузки (потребителя)" });
  if (!has((t) => t === "src_pe" || t === "bus_pe"))
    msgs.push({ level: "error", text: "Отсутствует защитный проводник PE" });
  if (!has((t) => t === "src_n" || t === "bus_n"))
    msgs.push({ level: "warn", text: "Отсутствует нейтраль N" });

  els.forEach((e) => {
    const kind = kindOf(e.type);
    const inbound = connectedIn.has(e.id);
    const outbound = connectedOut.has(e.id);
    if (!inbound && !outbound)
      msgs.push({ level: "error", text: `${e.ref} (${e.name}) не подключён` });
    else if (kind === "breaker" && !outbound)
      msgs.push({ level: "warn", text: `${e.ref}: нет отходящей линии` });
    else if (kind === "breaker" && !inbound)
      msgs.push({ level: "error", text: `${e.ref}: нет питания` });
    else if (kind === "rcd" && !outbound)
      msgs.push({ level: "warn", text: `${e.ref}: у УЗО нет отходящих групп` });
    else if (kind === "load" && !inbound)
      msgs.push({ level: "error", text: `${e.ref}: нагрузка без питания` });
  });

  // Провода, потерявшие точку подключения
  wires.forEach((w) => {
    const a = els.find((e) => e.id === w.from.el);
    const b = els.find((e) => e.id === w.to.el);
    if (!a || !b) {
      msgs.push({ level: "error", text: "Проводник заканчивается в пустом месте" });
      return;
    }
    const pa = portsOf(a, doc.mode).some((p) => p.id === w.from.port);
    const pb = portsOf(b, doc.mode).some((p) => p.id === w.to.port);
    if (!pa || !pb)
      msgs.push({
        level: "warn",
        text: `Проводник ${a.ref} → ${b.ref} привязан к отсутствующей точке`,
      });
    if (a.id === b.id)
      msgs.push({ level: "error", text: `${a.ref}: замыкание элемента на себя` });
  });

  // N и PE не должны объединяться на отходящих группах
  const busN = els.find((e) => e.type === "bus_n");
  const busPe = els.find((e) => e.type === "bus_pe");
  if (busN && busPe) {
    const joined = wires.some(
      (w) =>
        (w.from.el === busN.id && w.to.el === busPe.id) ||
        (w.from.el === busPe.id && w.to.el === busN.id),
    );
    if (joined)
      msgs.push({
        level: "error",
        text: "Шины N и PE соединены на стороне отходящих групп — недопустимо",
      });
  }

  // Короткое замыкание: два разных потенциала на одной точке
  const seen = new Map<string, string>();
  wires.forEach((w) => {
    const key = `${w.to.el}:${w.to.port}`;
    const prev = seen.get(key);
    if (prev && prev !== w.kind)
      msgs.push({
        level: "error",
        text: `Короткое замыкание: ${prev} и ${w.kind} в одной точке подключения`,
      });
    else seen.set(key, w.kind);
  });

  const level = msgs.some((m) => m.level === "error")
    ? "error"
    : msgs.some((m) => m.level === "warn")
      ? "warn"
      : "ok";
  if (level === "ok") msgs.push({ level: "ok", text: "Ошибок не обнаружено" });
  return { level, messages: msgs };
}
