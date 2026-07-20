import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Photo } from "./photoData";
import { photoPath } from "./photoRoutes";
import PhotoDetail from "./photoDetail";

const { loadPhotos } = vi.hoisted(() => ({
  loadPhotos: vi.fn<() => Promise<Photo[]>>(),
}));

vi.mock("./photoData", async (importOriginal) => {
  const original = await importOriginal<typeof import("./photoData")>();
  return { ...original, loadPhotos };
});

vi.mock("../Utilities/photoMetadata", () => ({
  usePhotoMetadata: vi.fn(),
}));

vi.mock("../Utilities/getImage", async () => {
  const React = await import("react");
  const MockImage = ({
    alt,
    onUrlChange,
  }: {
    alt?: string;
    onUrlChange?: (url: string | null) => void;
  }) => {
    React.useEffect(() => {
      onUrlChange?.("https://images.example/photograph.jpg");
    }, [onUrlChange]);
    return React.createElement("img", { alt });
  };
  return {
    default: MockImage,
  };
});

const photos: Photo[] = [
  {
    id: "first",
    path: "public/images/portfolio/first.jpg",
    title: "First Light",
    altText: "Sunlight crossing a quiet field",
    description: "The first photograph.",
    category: "Landscapes",
    location: "Tennessee",
    capturedAt: "2026-04-12",
    active: true,
    featured: false,
    order: 0,
  },
  {
    id: "second",
    path: "public/images/portfolio/second.jpg",
    title: "Still Water",
    altText: "A reflection on still water",
    description: "",
    category: "Nature",
    location: "",
    capturedAt: "",
    active: true,
    featured: false,
    order: 1,
  },
];

const renderViewer = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/portfolio/:photoSlug" element={<PhotoDetail />} />
        <Route path="/portfolio" element={<p>Portfolio landing</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("shareable photograph viewer", () => {
  beforeEach(() => {
    loadPhotos.mockReset();
    loadPhotos.mockResolvedValue(photos);
  });

  test("opens a direct photograph URL and exposes its sharing controls", async () => {
    renderViewer(photoPath(photos[0]));

    expect(
      await screen.findByRole("heading", { name: "First Light" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("img", { name: photos[0].altText }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Close photograph and return to portfolio",
      }),
    ).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  test("supports arrow-key navigation and Escape", async () => {
    const user = userEvent.setup();
    renderViewer(photoPath(photos[0]));
    await screen.findByRole("heading", { name: "First Light" });

    await user.keyboard("{ArrowRight}");
    expect(
      await screen.findByRole("heading", { name: "Still Water" }),
    ).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(
      await screen.findByText("Portfolio landing"),
    ).toBeInTheDocument();
  });

  test("shows a safe state for missing or inactive photographs", async () => {
    loadPhotos.mockResolvedValue([
      { ...photos[0], active: false },
      photos[1],
    ]);
    renderViewer(photoPath(photos[0]));

    expect(
      await screen.findByRole("heading", {
        name: "This moment is no longer in the public collection.",
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Return to the portfolio" }),
      ).toHaveAttribute("href", "/portfolio"),
    );
  });
});
