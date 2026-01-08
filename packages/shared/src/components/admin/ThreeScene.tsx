"use client";

type ThreeSceneProps = {
  width?: number | string;
  height?: number | string;
};

const ThreeScene = ({ width = "100%", height = "100%" }: ThreeSceneProps) => {
  return (
    <div
      className="relative flex items-center justify-center rounded border bg-gray-900 text-white"
      style={{ width, height }}
    >
      <div className="p-4 text-center">
        <p className="mb-2 text-lg font-medium">3D Visualization</p>
        <p className="text-sm text-gray-300">This is a placeholder for the 3D geo visualization.</p>
        <p className="mt-2 text-xs text-gray-500">
          The 3D viewer will be implemented here in a future update.
        </p>
      </div>
    </div>
  );
};

export default ThreeScene;
