// Run: npx tsx scripts/check-sync.ts
import assert from "node:assert";
import { findUnsynced } from "../lib/bokadirekt";

const IR = "b528b29d-483c-4d50-aad9-135997266764"; // IR Bastu resource
const KRYO = "352dd11a-521f-4145-b5e1-218731b97039";
const paid = {
  serviceId: "ir-bastu-2p",
  serviceName: "IR Sauna 2 personer",
  date: "2026-10-21",
  time: "14:00",
  customerName: "Test",
};
const bd = (resourceId: string, startDate: string, cancelled = false) => ({
  resourceId,
  startDate,
  cancelled,
});

assert.equal(findUnsynced([paid], []).length, 1, "nothing in Bokadirekt");
assert.equal(findUnsynced([paid], [bd(IR, "2026-10-21T14:00:00")]).length, 0, "exact match");
assert.equal(findUnsynced([paid], [bd(IR, "2026-10-21T14:10:00")]).length, 0, "within 15 min");
assert.equal(findUnsynced([paid], [bd(IR, "2026-10-21T14:30:00")]).length, 1, "too far off");
assert.equal(findUnsynced([paid], [bd(KRYO, "2026-10-21T14:00:00")]).length, 1, "wrong resource");
assert.equal(findUnsynced([paid], [bd(IR, "2026-10-22T14:00:00")]).length, 1, "wrong date");
assert.equal(findUnsynced([paid], [bd(IR, "2026-10-21T14:00:00", true)]).length, 1, "cancelled");
console.log("check-sync OK");
