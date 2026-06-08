/* Tests for the access model SSoT (access.js).
   These lock the permission matrix and the data-visibility rules — especially
   the ◐ conditionals, the Retailer data wall, and Operator/Expert scoping.
   A rule without a test here is not considered done. */
import { describe, it, expect } from "vitest";
import {
  ROLE_KEYS, ACTION_KEYS, can, actionPerm, isConditional, visibility,
  piiAccess, creatableRoles, canCreateRole, canAccessSection,
} from "./access.js";

describe("action matrix — faithful to the model table", () => {
  // Expected raw matrix transcribed directly from the access model.
  // Y = true, N = false, C = "cond".
  const Y = true, N = false, C = "cond";
  const EXPECTED = {
    validateRejected:   { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: Y, operator: N, expert: C },
    humanReview:        { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: Y, expert: Y },
    arbitrate:          { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: N, expert: Y },
    createBizGroup:     { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: N, agent: N, operator: N, expert: N },
    configureBusiness:  { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
    buildWorkflows:     { sid_admin: Y, sid_sales: C, retailer_admin: C, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
    toggleLive:         { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: N, operator: N, expert: N },
    configureTokenCost: { sid_admin: Y, sid_sales: N, retailer_admin: N, group_admin: N, biz_admin: N, agent: N, operator: N, expert: N },
    demos:              { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: C, biz_admin: C, agent: Y, operator: N, expert: N },
    contactSupport:     { sid_admin: Y, sid_sales: Y, retailer_admin: Y, group_admin: Y, biz_admin: Y, agent: Y, operator: Y, expert: Y },
  };

  for (const action of Object.keys(EXPECTED)) {
    for (const role of ROLE_KEYS) {
      it(`${action} for ${role}`, () => {
        expect(actionPerm(role, action)).toBe(EXPECTED[action][role]);
      });
    }
  }

  it("covers exactly the documented actions", () => {
    expect(ACTION_KEYS.sort()).toEqual(Object.keys(EXPECTED).sort());
  });
});

describe("can() / isConditional()", () => {
  it("treats ◐ as allowed for the affordance", () => {
    expect(can("expert", "validateRejected")).toBe(true);
    expect(isConditional("expert", "validateRejected")).toBe(true);
    expect(can("sid_sales", "buildWorkflows")).toBe(true);
    expect(isConditional("sid_admin", "buildWorkflows")).toBe(false);
  });
  it("only ShareID Admin configures token cost", () => {
    expect(can("sid_admin", "configureTokenCost")).toBe(true);
    for (const r of ROLE_KEYS.filter((r) => r !== "sid_admin")) {
      expect(can(r, "configureTokenCost")).toBe(false);
    }
  });
  it("support is universal", () => {
    for (const r of ROLE_KEYS) expect(can(r, "contactSupport")).toBe(true);
  });
});

describe("data visibility matrix", () => {
  it("retailer DATA WALL — never any PII, no requests", () => {
    expect(visibility("retailer_admin", "dashboard")).toBe(true);   // aggregated/billing OK
    expect(visibility("retailer_admin", "requests")).toBe(false);
    expect(visibility("retailer_admin", "detailPII")).toBe(false);
    expect(visibility("retailer_admin", "rawDocs")).toBe(false);
  });
  it("operator & expert have no dashboard", () => {
    expect(visibility("operator", "dashboard")).toBe(false);
    expect(visibility("expert", "dashboard")).toBe(false);
  });
  it("admins (ShareID / Business) see raw documents", () => {
    expect(visibility("sid_admin", "rawDocs")).toBe(true);
    expect(visibility("biz_admin", "rawDocs")).toBe(true);
  });
});

describe("piiAccess() — conditional resolution (SERVER-SIDE REQUIRED mirror)", () => {
  it("retailer wall is absolute regardless of context", () => {
    expect(piiAccess("retailer_admin", { isDemo: true, sameBusiness: true, isAssigned: true }))
      .toEqual({ detail: false, raw: false });
  });
  it("sales sees PII on demo data only", () => {
    expect(piiAccess("sid_sales", { isDemo: true })).toEqual({ detail: true, raw: false });
    expect(piiAccess("sid_sales", { isDemo: false })).toEqual({ detail: false, raw: false });
  });
  it("group admin sees PII by default, blocked when subsidiary disables it", () => {
    expect(piiAccess("group_admin", {})).toEqual({ detail: true, raw: false });
    expect(piiAccess("group_admin", { subsidiaryAllowsPII: false })).toEqual({ detail: false, raw: false });
  });
  it("agent sees raw docs only within its own business", () => {
    expect(piiAccess("agent", { sameBusiness: true })).toEqual({ detail: true, raw: true });
    expect(piiAccess("agent", { sameBusiness: false })).toEqual({ detail: true, raw: false });
  });
  it("operator/expert lose PII on requests not assigned to them", () => {
    expect(piiAccess("operator", { isAssigned: true })).toEqual({ detail: true, raw: true });
    expect(piiAccess("operator", { isAssigned: false })).toEqual({ detail: false, raw: false });
    expect(piiAccess("expert", { isAssigned: false })).toEqual({ detail: false, raw: false });
  });
  it("full admins always see everything", () => {
    expect(piiAccess("sid_admin", {})).toEqual({ detail: true, raw: true });
    expect(piiAccess("biz_admin", {})).toEqual({ detail: true, raw: true });
  });
});

describe("creatableRoles() — user-creation rule", () => {
  it("ShareID Admin can create every role", () => {
    expect(creatableRoles("sid_admin").sort()).toEqual([...ROLE_KEYS].sort());
  });
  it("Sales creates only Business Admin + Agent", () => {
    expect(creatableRoles("sid_sales").sort()).toEqual(["agent", "biz_admin"]);
  });
  it("Retailer creates Retailer/Group/Business admins, never operational roles", () => {
    expect(creatableRoles("retailer_admin").sort()).toEqual(["biz_admin", "group_admin", "retailer_admin"]);
    expect(canCreateRole("retailer_admin", "agent")).toBe(false);
    expect(canCreateRole("retailer_admin", "operator")).toBe(false);
  });
  it("Business Admin creates own-business roles only", () => {
    expect(creatableRoles("biz_admin").sort()).toEqual(["agent", "biz_admin", "expert", "operator"]);
    expect(canCreateRole("biz_admin", "group_admin")).toBe(false);
  });
  it("Agent / Operator / Expert create no one", () => {
    for (const r of ["agent", "operator", "expert"]) expect(creatableRoles(r)).toEqual([]);
  });
});

describe("canAccessSection() — nav gating", () => {
  it("operator only reaches the anti-fraud queue + requests + settings (no dashboard/builder)", () => {
    expect(canAccessSection("operator", "operator")).toBe(true);
    expect(canAccessSection("operator", "requests")).toBe(true);
    expect(canAccessSection("operator", "home")).toBe(false);
    expect(canAccessSection("operator", "wf_builder")).toBe(false);
    expect(canAccessSection("operator", "users")).toBe(false);
  });
  it("retailer reaches dashboards but never the requests list", () => {
    expect(canAccessSection("retailer_admin", "home")).toBe(true);
    expect(canAccessSection("retailer_admin", "requests")).toBe(false);
    expect(canAccessSection("retailer_admin", "operator")).toBe(false);
  });
  it("agent builds nothing but sees console + demos", () => {
    expect(canAccessSection("agent", "wf_builder")).toBe(false);
    expect(canAccessSection("agent", "demo")).toBe(true);
    expect(canAccessSection("agent", "requests")).toBe(true);
    expect(canAccessSection("agent", "users")).toBe(false);
  });
  it("business admin reaches builder, business setup and user management", () => {
    for (const s of ["wf_builder", "biz_setup", "users", "requests", "home"]) {
      expect(canAccessSection("biz_admin", s)).toBe(true);
    }
  });
  it("sid_admin reaches everything", () => {
    for (const s of Object.keys({ home:1, stats:1, requests:1, operator:1, demo:1, wf_builder:1, biz_setup:1, users:1, business:1, settings:1 })) {
      expect(canAccessSection("sid_admin", s)).toBe(true);
    }
  });
});
