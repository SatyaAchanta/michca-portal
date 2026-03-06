import { validateUploadedImages } from "@/lib/store-image-validation";

describe("validateUploadedImages", () => {
  it("accepts valid images for creation", () => {
    const files = [
      new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array([4, 5, 6])], "b.png", { type: "image/png" }),
    ];

    expect(() => validateUploadedImages(files, { requireImages: true })).not.toThrow();
  });

  it("rejects less than minimum images when required", () => {
    const files = [new File([new Uint8Array([1])], "a.jpg", { type: "image/jpeg" })];

    expect(() => validateUploadedImages(files, { requireImages: true })).toThrow("at least 2 images");
  });

  it("rejects unsupported mime type", () => {
    const files = [
      new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array([1, 2, 3])], "bad.gif", { type: "image/gif" }),
    ];

    expect(() => validateUploadedImages(files, { requireImages: true })).toThrow("Unsupported file type");
  });
});
