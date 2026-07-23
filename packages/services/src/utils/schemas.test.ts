import { describe, it, expect } from "vitest";
import { schemas } from "./schemas";

describe("schemas", () => {
  it("EMAIL_VERIFICATION accepts valid email", async () => {
    await expect(
      schemas.EMAIL_VERIFICATION.validate({ email: "a@b.com" }),
    ).resolves.toBeDefined();
  });

  it("EMAIL_VERIFICATION rejects invalid email", async () => {
    await expect(
      schemas.EMAIL_VERIFICATION.validate({ email: "bad" }),
    ).rejects.toThrow();
  });

  it("PHONE_VERIFICATION accepts valid phone", async () => {
    await expect(
      schemas.PHONE_VERIFICATION.validate({ phone: "+15555551234" }),
    ).resolves.toBeDefined();
  });

  it("PHONE_VERIFICATION rejects phone without +country code", async () => {
    await expect(
      schemas.PHONE_VERIFICATION.validate({ phone: "5555551234" }),
    ).rejects.toThrow();
  });

  it("CODE_VERIFICATION accepts 6-char code", async () => {
    await expect(
      schemas.CODE_VERIFICATION.validate({ code: "123456" }),
    ).resolves.toBeDefined();
  });
});
