import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Helper to create an empty/mock tRPC context
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("feedback router", () => {
  beforeEach(async () => {
    // Clear in-memory feedback or reset DB if testing via local database.
    // Our db.ts uses a global array for fallback, which we can interact with.
  });

  describe("submit", () => {
    it("successfully records feedback and returns success", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.feedback.submit({
        fullName: "Dr. Gregory House",
        email: "house@ppth.org",
        userRole: "Doctor",
        overallExperience: 4,
        easeOfUse: 4,
        aiAccuracy: 5,
        uiDesign: 5,
        recommend: "Yes",
        useInHospital: "Yes",
        likeMost: "Diagnostic alerts are highly actionable.",
        problemsFaced: "The warning alarm tone is slightly soft.",
        suggestions: "Make alarm tone adjustable."
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.feedback).toBeDefined();
      expect(result.feedback.fullName).toBe("Dr. Gregory House");
      expect(result.feedback.email).toBe("house@ppth.org");
      expect(result.feedback.userRole).toBe("Doctor");
      expect(result.feedback.overallExperience).toBe(4);
    });

    it("rejects invalid input schemas", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        // Missing email and out-of-range ratings
        await caller.feedback.submit({
          fullName: "House",
          email: "invalid-email", // invalid
          userRole: "Doctor",
          overallExperience: 6, // out of range (max 5)
          easeOfUse: 0, // out of range (min 1)
          aiAccuracy: 3,
          uiDesign: 3,
          recommend: "Yes",
          useInHospital: "Yes"
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getAll", () => {
    it("returns a list of all feedback records, including mock data", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.feedback.getAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(5); // At least our 5 default mock entries
      
      const first = result[0];
      expect(first).toHaveProperty("fullName");
      expect(first).toHaveProperty("email");
      expect(first).toHaveProperty("userRole");
      expect(first).toHaveProperty("overallExperience");
    });
  });

  describe("getStats", () => {
    it("calculates correct statistics and role counts", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.feedback.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalCount).toBeGreaterThanOrEqual(5);
      expect(stats.avgOverall).toBeGreaterThan(0);
      expect(stats.avgOverall).toBeLessThanOrEqual(5);
      expect(stats.avgAiAccuracy).toBeGreaterThan(0);
      expect(stats.avgAiAccuracy).toBeLessThanOrEqual(5);
      expect(stats.recommendRate).toBeGreaterThanOrEqual(0);
      expect(stats.recommendRate).toBeLessThanOrEqual(100);
      expect(stats.hospitalAdoptionRate).toBeGreaterThanOrEqual(0);
      expect(stats.hospitalAdoptionRate).toBeLessThanOrEqual(100);
      
      expect(stats.byRole).toHaveProperty("Doctor");
      expect(stats.byRating).toHaveLength(5); // 1 to 5 star counts
    });
  });
});
