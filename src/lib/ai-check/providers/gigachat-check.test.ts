import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { normalizeGigaChatResponse } from "./gigachat-check.server";
import { extractJson, redactSecrets } from "./gigachat-client.server";

const item = (id: string, text: string) => ({
  id,
  text,
  related_marks: ["QF1"],
  suggested_change: { action: "none", key: null, value: null },
});

describe("normalizeGigaChatResponse: валидный JSON", () => {
  it("принимает чистый JSON со всеми разделами", () => {
    const r = normalizeGigaChatResponse(
      JSON.stringify({
        errors: [item("e1", "Нет УЗО на линии QF5")],
        warnings: [item("w1", "Не указаны условия прокладки")],
        recommendations: [item("r1", "Добавить реле напряжения")],
        explanations: [item("x1", "Схема TN-C-S")],
      }),
    );
    assert.equal(r.errors[0].text, "Нет УЗО на линии QF5");
    assert.equal(r.warnings.length, 1);
    assert.equal(r.recommendations.length, 1);
    assert.equal(r.explanations.length, 1);
  });

  it("принимает JSON в обёртке ```json", () => {
    const r = normalizeGigaChatResponse('```json\n{"errors":[],"warnings":[],"recommendations":[],"explanations":[]}\n```');
    assert.deepEqual(r, { errors: [], warnings: [], recommendations: [], explanations: [] });
  });

  it("принимает JSON с текстом до и после", () => {
    const r = normalizeGigaChatResponse('Вот результат:\n{"errors":[{"text":"Ошибка"}]}\nНадеюсь, помогло.');
    assert.equal(r.errors[0].text, "Ошибка");
    assert.equal(r.errors[0].id, "errors-1");
  });

  it("принимает русские названия разделов и строковые пункты", () => {
    const r = normalizeGigaChatResponse('{"ошибки":["Нет PE-шины"],"предупреждения":[],"рекомендации":[],"пояснения":[]}');
    assert.equal(r.errors[0].text, "Нет PE-шины");
  });

  it("принимает объект, вложенный в result, и числовой id", () => {
    const r = normalizeGigaChatResponse('{"result":{"warnings":[{"id":7,"text":"Риск"}]}}');
    assert.equal(r.warnings[0].id, "7");
  });

  it("принимает suggested_change set_label и отбрасывает прочие действия", () => {
    const r = normalizeGigaChatResponse(
      JSON.stringify({
        recommendations: [
          { text: "Маркировка", suggested_change: { action: "set_label", key: "QF2", value: "QF2.1" } },
          { text: "Опасное", suggested_change: { action: "replace_device", key: "QF3", value: "C16" } },
        ],
      }),
    );
    assert.deepEqual(r.recommendations[0].suggested_change, { action: "set_label", key: "QF2", value: "QF2.1" });
    assert.deepEqual(r.recommendations[1].suggested_change, { action: "none", key: null, value: null });
  });
});

describe("normalizeGigaChatResponse: испорченный контент", () => {
  it("бросает понятную ошибку на пустой ответ", () => {
    assert.throws(() => normalizeGigaChatResponse("   "), /пустой content/);
  });

  it("бросает понятную ошибку, когда JSON нет вообще", () => {
    assert.throws(() => normalizeGigaChatResponse("Извините, я не могу ответить."), /JSON-объект не найден/);
  });

  it("бросает понятную ошибку на обрезанный JSON", () => {
    assert.throws(() => normalizeGigaChatResponse('{"errors":[{"text":"Незаконченный'), /JSON-объект не найден/);
  });

  it("бросает понятную ошибку на JSON-массив вместо объекта", () => {
    assert.throws(() => normalizeGigaChatResponse('[{"text":"x"}]'), /JSON не является объектом/);
  });
});

describe("normalizeGigaChatResponse: неожиданные типы содержимого", () => {
  it("терпит пункты-числа и null, отбрасывая их", () => {
    const r = normalizeGigaChatResponse('{"errors":[42,null,{"text":"Ок"}]}');
    assert.equal(r.errors.length, 1);
    assert.equal(r.errors[0].text, "Ок");
  });

  it("терпит раздел-объект вместо массива", () => {
    const r = normalizeGigaChatResponse('{"warnings":{"text":"Одиночное предупреждение"}}');
    assert.equal(r.warnings[0].text, "Одиночное предупреждение");
  });

  it("терпит related_marks строкой", () => {
    const r = normalizeGigaChatResponse('{"errors":[{"text":"x","related_marks":"QF1"}]}');
    assert.deepEqual(r.errors[0].related_marks, ["QF1"]);
  });
});

describe("extractJson (общий транспорт)", () => {
  it("достаёт JSON из обёртки и текста", () => {
    assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
    assert.deepEqual(extractJson('текст {"a":2} текст'), { a: 2 });
  });
});

describe("redactSecrets", () => {
  it("маскирует токены и длинные base64-строки", () => {
    const s = redactSecrets("Bearer abcdef1234567890abcdef1234567890abcdef12 Basic XYZ=XYZ=XYZ=XYZ=XYZ=XYZ=XYZ=XYZ=XYZ=XYZ=");
    assert.ok(!s.includes("abcdef1234567890"));
    assert.ok(s.includes("Bearer ***"));
  });
});
