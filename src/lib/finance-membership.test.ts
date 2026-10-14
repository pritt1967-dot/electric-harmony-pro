import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { membershipError, projectParticipants, removeProjectMembership } from "./finance-membership";

describe("finance project membership", () => {
  const all = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
  it("never replaces empty membership with the global directory", () => {
    assert.deepEqual(projectParticipants(all, [], []), { participants: [], historicalParticipants: [] });
  });
  it("keeps historical identities separately without touching amounts", () => {
    const ops = [{ from_participant_id: "a", to_participant_id: "b", from_name: "A", to_name: "B", amount: 820 }];
    const before = JSON.stringify(ops);
    assert.deepEqual(projectParticipants(all, [{ participant_id: "b" }], ops), { participants: [all[1]], historicalParticipants: [all[0]] });
    assert.equal(JSON.stringify(ops), before);
  });
  it("retains legacy name-based history", () => {
    assert.deepEqual(projectParticipants(all, [], [{ from_name: "A", to_name: "Vendor" }]).historicalParticipants, [all[0]]);
  });
  it("deletes only the specific link and reads it back", async () => {
    const calls: { path: string; method?: string }[] = [];
    await removeProjectMembership(async (path, init) => { calls.push({ path, method: init?.method }); return []; }, "project/1", "person&2");
    assert.deepEqual(calls, [
      { path: "project_participants?project_id=eq.project%2F1&participant_id=eq.person%262", method: "DELETE" },
      { path: "project_participants?select=participant_id&project_id=eq.project%2F1&participant_id=eq.person%262", method: undefined },
    ]);
  });
  it("does not report success if deletion was silently denied", async () => {
    await assert.rejects(removeProjectMembership(async () => [{ participant_id: "a" }], "p", "a"), /остался в проекте/);
  });
  it("preserves a foreign-key refusal and never deletes operations", async () => {
    const calls: string[] = [];
    await assert.rejects(removeProjectMembership(async path => { calls.push(path); throw new Error("23503 foreign key constraint"); }, "p", "a"));
    assert.equal(calls.length, 1);
    assert.match(calls[0] ?? "", /^project_participants\?/);
    assert.match(membershipError(new Error("23503 foreign key constraint")), /история и суммы не удалены/);
  });
  it("rejects missing IDs before sending any request", async () => {
    await assert.rejects(removeProjectMembership(async () => { throw new Error("should not call"); }, "", "a"), /Выберите проект/);
  });
  it("returns safe, actionable permission and network errors", () => {
    assert.match(membershipError(new Error("403 permission denied")), /Нет доступа/);
    assert.match(membershipError(new Error("TIMEOUT")), /Обновите список/);
    assert.doesNotMatch(membershipError(new Error("provider internals")), /provider internals/);
  });
});