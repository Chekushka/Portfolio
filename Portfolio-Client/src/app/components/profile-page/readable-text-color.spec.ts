import { getReadableTextColor } from "./readable-text-color";

describe("getReadableTextColor", () => {
  it("returns light text on a near-black tag", () => {
    expect(getReadableTextColor("#222222")).toBe("#ffffff");
  });

  it("returns dark text on a pale yellow tag", () => {
    expect(getReadableTextColor("#fde68a")).toBe("#1b1d24");
  });

  it("expands three-digit hex shorthand", () => {
    expect(getReadableTextColor("#fff")).toBe("#1b1d24");
  });

  it("returns null for a value that is not a hex colour", () => {
    expect(getReadableTextColor("rebeccapurple")).toBeNull();
  });
});
