import { describe, expect, it } from "vitest";
import { buildMetadata, toOgImage } from "./seo";

describe("toOgImage", () => {
  it("inserts the OG resize transform right after the Cloudinary upload segment", () => {
    const result = toOgImage(
      "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/covers/abc.jpg",
    );

    expect(result).toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/v1/portfolio/projects/covers/abc.jpg",
      width: 1200,
      height: 630,
    });
  });

  it("leaves a non-Cloudinary URL untouched and without known dimensions", () => {
    const result = toOgImage("https://example.com/some-image.png");

    expect(result).toEqual({ url: "https://example.com/some-image.png" });
  });
});

describe("buildMetadata", () => {
  it("omits title/description keys entirely when not provided", () => {
    const metadata = buildMetadata({ path: "/" });

    expect(metadata.title).toBeUndefined();
    expect(metadata.description).toBeUndefined();
  });

  it("defaults twitter card to summary_large_image only when an image is present", () => {
    const withImage = buildMetadata({
      path: "/projects/x",
      image: "https://res.cloudinary.com/demo/image/upload/v1/x.jpg",
    });
    const withoutImage = buildMetadata({ path: "/projects/x" });

    expect(withImage.twitter).toMatchObject({ card: "summary_large_image" });
    expect(withoutImage.twitter).toMatchObject({ card: "summary" });
  });

  it("sets alternates.canonical and openGraph.url to the given path", () => {
    const metadata = buildMetadata({ path: "/blog/my-post" });

    expect(metadata.alternates).toEqual({ canonical: "/blog/my-post" });
    expect(metadata.openGraph).toMatchObject({ url: "/blog/my-post" });
  });
});
