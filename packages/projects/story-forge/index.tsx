// packages/projects/story-forge/index.tsx
import React from "react";

export const StoryForgeApp = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold">StoryForge</h1>
      <p className="text-muted-foreground mb-6 text-lg">
        A gamified writing platform that helps writers build consistent habits, craft worlds, and
        share short stories.
      </p>
      <div className="bg-card inline-block rounded-lg border p-12">
        <p className="text-2xl font-semibold">StoryForge Integration Placeholder</p>
        <p className="mt-4">This project is being integrated into the GameHub monolith.</p>
      </div>
    </div>
  );
};
