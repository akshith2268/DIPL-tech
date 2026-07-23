import { describe, expect, it } from "vitest";
import {
  getDeviceCategory,
  isProductionAnalyticsHost,
  sanitizeAnalyticsPath,
} from "./analytics";

describe("analytics privacy and normalization", () => {
  it("only enables the two production hostnames", () => {
    expect(isProductionAnalyticsHost("drithinfra.in")).toBe(true);
    expect(isProductionAnalyticsHost("www.drithinfra.in")).toBe(true);
    expect(isProductionAnalyticsHost("localhost")).toBe(false);
    expect(isProductionAnalyticsHost("drithinfra.in.example.com")).toBe(false);
  });

  it("removes query strings from analytics paths", () => {
    expect(sanitizeAnalyticsPath("/blogs?source=email")).toBe("/blogs");
    expect(sanitizeAnalyticsPath("projects")).toBe("/projects");
  });

  it("uses coarse device categories only", () => {
    expect(getDeviceCategory(390)).toBe("mobile");
    expect(getDeviceCategory(900)).toBe("tablet");
    expect(getDeviceCategory(1440)).toBe("desktop");
    expect(getDeviceCategory(Number.NaN)).toBe("other");
  });
});

