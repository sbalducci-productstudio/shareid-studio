/* Tests for the data-access selector layer — proves scoping + the data wall
   end-to-end against representative request rows. */
import { describe, it, expect } from "vitest";
import { scopeRequests, piiForRow } from "./selectors.js";

const REQ = [
  { id: "a", business: "Néobanque Atlas",  status: "ok",     mode: "live" },
  { id: "b", business: "Néobanque Atlas",  status: "review", mode: "live" },
  { id: "c", business: "Assurance Prévia", status: "review", mode: "live" },
  { id: "d", business: "Marketplace Volt", status: "fail",   mode: "test" },
];

const sess = (role, org) => ({
  role, org,
  ctx: { subsidiaryAllowsPII: org?.subsidiaryAllowsPII !== false, isDemo: role === "sid_sales" },
});

describe("scopeRequests()", () => {
  it("retailer data wall returns nothing", () => {
    const s = sess("retailer_admin", { businesses: [] });
    expect(scopeRequests(s, REQ)).toEqual([]);
  });
  it("business admin sees only its own business", () => {
    const s = sess("biz_admin", { businesses: ["Néobanque Atlas"] });
    expect(scopeRequests(s, REQ).map((r) => r.id)).toEqual(["a", "b"]);
  });
  it("group admin sees all member businesses", () => {
    const s = sess("group_admin", { businesses: ["Néobanque Atlas", "Assurance Prévia"] });
    expect(scopeRequests(s, REQ).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });
  it("operator sees only review-queue rows within scope", () => {
    const s = sess("operator", { businesses: ["Néobanque Atlas", "Assurance Prévia"] });
    expect(scopeRequests(s, REQ).map((r) => r.id)).toEqual(["b", "c"]);
  });
  it("sales sees demo (test-mode) data only", () => {
    const s = sess("sid_sales", { businesses: null });
    expect(scopeRequests(s, REQ).map((r) => r.id)).toEqual(["d"]);
  });
  it("ShareID admin sees everything", () => {
    const s = sess("sid_admin", { businesses: null });
    expect(scopeRequests(s, REQ).map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("piiForRow()", () => {
  it("operator gets PII on its assigned (review) row, none otherwise", () => {
    const s = sess("operator", { businesses: ["Néobanque Atlas"] });
    expect(piiForRow(s, REQ[1])).toEqual({ detail: true, raw: true });   // status review
    expect(piiForRow(s, REQ[0])).toEqual({ detail: false, raw: false }); // status ok → not assigned
  });
  it("agent loses raw docs outside its business", () => {
    const s = sess("agent", { businesses: ["Néobanque Atlas"] });
    expect(piiForRow(s, REQ[0])).toEqual({ detail: true, raw: true });
    expect(piiForRow(s, REQ[2]).raw).toBe(false); // Prévia row, outside scope
  });
  it("retailer never gets PII", () => {
    const s = sess("retailer_admin", { businesses: [] });
    expect(piiForRow(s, REQ[0])).toEqual({ detail: false, raw: false });
  });
});
