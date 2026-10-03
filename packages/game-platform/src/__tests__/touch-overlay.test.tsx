// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TouchControlsOverlay, type TouchControlButton } from "../components/TouchControlsOverlay";

function makeButtons(overrides: Partial<TouchControlButton> = {}): TouchControlButton[] {
  return [
    {
      id: "left",
      label: "◀",
      ariaLabel: "Deplacer a gauche",
      onPress: vi.fn(),
      onRelease: vi.fn(),
      ...overrides,
    },
    { id: "right", label: "▶", ariaLabel: "Deplacer a droite", onPress: vi.fn() },
  ];
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("TouchControlsOverlay", () => {
  it("ne rend rien sur pointeur fin sans forcage", () => {
    render(<TouchControlsOverlay buttons={makeButtons()} />);
    expect(screen.queryByTestId("touch-controls-overlay")).toBeNull();
  });

  it("rend l'overlay quand force", () => {
    render(<TouchControlsOverlay buttons={makeButtons()} force />);
    expect(screen.getByTestId("touch-controls-overlay")).toBeTruthy();
  });

  it("chaque bouton porte un nom accessible", () => {
    render(<TouchControlsOverlay buttons={makeButtons()} force />);
    expect(screen.getByLabelText("Deplacer a gauche")).toBeTruthy();
    expect(screen.getByLabelText("Deplacer a droite")).toBeTruthy();
  });

  it("l'appui declenche onPress et le relachement onRelease", () => {
    const buttons = makeButtons();
    render(<TouchControlsOverlay buttons={buttons} force />);
    const left = screen.getByLabelText("Deplacer a gauche");

    fireEvent.pointerDown(left);
    expect(buttons[0]!.onPress).toHaveBeenCalledTimes(1);

    fireEvent.pointerUp(left);
    expect(buttons[0]!.onRelease).toHaveBeenCalledTimes(1);
  });

  it("un bouton 'repeat' se repete tant que le doigt reste pose", () => {
    vi.useFakeTimers();
    const onPress = vi.fn();
    const buttons = makeButtons({ repeat: true, repeatMs: 100, onPress });
    render(<TouchControlsOverlay buttons={buttons} force />);

    const left = screen.getByLabelText("Deplacer a gauche");
    fireEvent.pointerDown(left);
    expect(onPress).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(350);
    // 1 appui initial + 3 repetitions
    expect(onPress).toHaveBeenCalledTimes(4);

    fireEvent.pointerUp(left);
    vi.advanceTimersByTime(500);
    expect(onPress).toHaveBeenCalledTimes(4);
  });
});
