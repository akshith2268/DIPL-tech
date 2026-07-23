import { describe, expect, it } from "vitest";
import { normalizeAnalyticsDashboard } from "./admin";

describe("admin analytics response normalization", () => {
  it("normalizes a valid aggregate response", () => {
    const result = normalizeAnalyticsDashboard({
      rangeKey: "24h",
      generatedAt: "2026-07-24T00:00:00.000Z",
      summary: {
        pageViews: 42,
        sessions: 17,
        blogViews: 8,
        blogSessions: 6,
        medianLoadMs: 810,
        p75LcpMs: 1530,
      },
      trend: [{
        bucket: "2026-07-24T00:00:00.000Z",
        pageViews: 12,
        blogViews: 3,
      }],
      topPages: [{ label: "/", value: 20 }],
    }, "7d");

    expect(result.rangeKey).toBe("24h");
    expect(result.summary.pageViews).toBe(42);
    expect(result.summary.p75LcpMs).toBe(1530);
    expect(result.trend[0]?.blogViews).toBe(3);
    expect(result.topPages).toEqual([{ label: "/", value: 20 }]);
  });

  it("provides safe empty defaults for malformed data", () => {
    const result = normalizeAnalyticsDashboard(null, "7d");

    expect(result.rangeKey).toBe("7d");
    expect(result.summary.pageViews).toBe(0);
    expect(result.summary.medianLoadMs).toBeNull();
    expect(result.trend).toEqual([]);
    expect(result.topReferrers).toEqual([]);
  });
});
