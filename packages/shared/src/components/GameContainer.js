import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// libs/shared/src/components/GameContainer.tsx
import React from "react";
import { GameSettingsProvider, useGameSettings, } from "../contexts/GameSettingsContext";
import { ErrorBoundary } from "../lib/ErrorBoundary";
// Prefer a standard function component that explicitly returns JSX.Element
// This avoids React.FC typing nuances (e.g., ReactNode | Promise<ReactNode> in some type versions)
function GameContainer({ children, title, description, className = "", lockTouch = true, backgroundImage, showParticleControls = true, }) {
    // Prevent scroll/zoom gestures while interacting with the game area on mobile
    // Avoid calling preventDefault in React synthetic handlers (which are passive by default
    // on some browsers) to prevent the warning. Instead, we rely on per‑canvas listeners in
    // each game (added with `{ passive: false }`) and only stop wheel scrolling here.
    const touchHandlers = lockTouch
        ? {
            onWheel: (e) => e.preventDefault(),
        }
        : {};
    return (_jsx(GameSettingsProvider, { children: _jsx("div", { className: `min-h-0 bg-gray-50 dark:bg-gray-900 ${className}`, style: backgroundImage
                ? {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }
                : undefined, children: _jsxs("div", { className: "container mx-auto px-3 py-3 md:px-4 md:py-4", children: [_jsxs("header", { className: "mb-3 md:mb-4 text-center", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2", children: title }), description && (_jsx("p", { className: "text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto", children: description }))] }), _jsx(ErrorBoundary, { children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden", children: _jsx("div", { className: `relative w-full aspect-video max-w-[960px] mx-auto ${lockTouch ? "touch-none select-none" : ""}`, ...touchHandlers, children: children }) }) }), _jsxs("div", { className: "mt-3 md:mt-4 flex items-center justify-center gap-4 flex-wrap", children: [_jsx(ModeSelector, {}), showParticleControls ? _jsx(ParticlesToggle, {}) : null, _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Reset" })] })] }) }) }));
}
// Export the component as default
export default GameContainer;
function ParticlesToggle() {
    const { enableParticles, setEnableParticles, particleEffect, setParticleEffect, } = useGameSettings();
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200", children: [_jsx("input", { type: "checkbox", checked: enableParticles, onChange: (e) => setEnableParticles(e.currentTarget.checked), className: "h-4 w-4 accent-blue-600" }), "Particles"] }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200", children: [_jsx("span", { className: "sr-only", children: "Particle effect" }), _jsxs("select", { "aria-label": "Particle effect", disabled: !enableParticles, value: particleEffect, onChange: (e) => setParticleEffect(e.currentTarget.value), className: "h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50", children: [_jsx("option", { value: "sparks", children: "Sparks" }), _jsx("option", { value: "puff", children: "Puff" })] })] })] }));
}
function ModeSelector() {
    const { mode, setMode, isAuthenticated, isSubscriber, setAuthState } = useGameSettings();
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            // Expose globally for game loops that read fast mode hints
            window.__gh_mode = mode;
        }
    }, [mode]);
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200", children: [_jsx("span", { className: "sr-only", children: "Game mode" }), _jsxs("select", { "aria-label": "Game mode", value: mode, onChange: (e) => setMode(e.currentTarget.value), className: "h-8 rounded-md border border-input bg-background px-2 text-sm", children: [_jsx("option", { value: "classic", children: "Classic" }), _jsxs("option", { value: "hard", disabled: !isAuthenticated, children: ["Hard ", isAuthenticated ? "" : "(sign in)"] }), _jsxs("option", { value: "chaos", disabled: !isSubscriber, children: ["Chaos ", isSubscriber ? "" : "(sub)"] })] })] }), _jsxs("label", { className: "inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4 accent-blue-600", checked: isAuthenticated, onChange: (e) => setAuthState(e.currentTarget.checked, isSubscriber) }), "Signed in"] }), _jsxs("label", { className: "inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4 accent-blue-600", checked: isSubscriber, onChange: (e) => setAuthState(isAuthenticated, e.currentTarget.checked) }), "Subscriber"] })] }));
}
