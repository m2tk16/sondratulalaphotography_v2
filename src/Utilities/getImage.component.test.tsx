import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import GetImage from "./getImage";

const { getUrl } = vi.hoisted(() => ({
  getUrl: vi.fn(),
}));

vi.mock("@aws-amplify/storage", () => ({ getUrl }));

beforeEach(() => {
  getUrl.mockReset();
  getUrl.mockResolvedValue({
    url: new URL("https://images.example/photograph.jpg"),
  });
});

test("uses React 18's warning-free fetch priority attribute", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  render(
    <GetImage
      alt="Purple flowers"
      fetchPriority="high"
      imagePath="public/images/portfolio/flowers.jpg"
      loading="eager"
    />,
  );

  const image = await screen.findByRole("img", { name: "Purple flowers" });
  expect(image).toHaveAttribute("fetchpriority", "high");
  expect(consoleError).not.toHaveBeenCalled();

  consoleError.mockRestore();
});
