"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
// Type assertion for OrbitControls to avoid type issues
const OrbitControlsComponent = OrbitControls;
/**
 * Minimal 3D stub for Snake — shares no logic yet, just a smoke-render scene.
 * This is feature-gated by `snake_3d_mode` on the page and intended for premium users later.
 */
export function SnakeGame3D() {
    return (_jsx("div", { className: "relative w-full aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden", children: _jsxs(Canvas, { camera: { position: [3, 3, 6], fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("directionalLight", { position: [5, 5, 5], intensity: 0.8 }), _jsxs("mesh", { "rotation-x": -Math.PI / 2, position: [0, -0.51, 0], children: [_jsx("planeGeometry", { args: [20, 20] }), _jsx("meshStandardMaterial", { color: "#0f172a" })] }), _jsxs("mesh", { position: [0, 0, 0], children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx("meshStandardMaterial", { color: "#10b981" })] }), [
                    [-2, 0.5, -1],
                    [1, 0.5, 2],
                    [2, 0.5, -3],
                ].map((p, i) => (_jsxs("mesh", { position: p, children: [_jsx("sphereGeometry", { args: [0.2, 16, 16] }), _jsx("meshStandardMaterial", { color: "#f59e0b" })] }, i))), _jsx(OrbitControlsComponent, {})] }) }));
}
