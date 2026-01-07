// packages/projects/story-forge/index.tsx
import React from 'react';

export const StoryForgeApp = () => {
    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">StoryForge</h1>
            <p className="text-lg text-muted-foreground mb-6">
                A gamified writing platform that helps writers build consistent habits, craft worlds, and share short
                stories.
            </p>
            <div className="bg-card border rounded-lg p-12 inline-block">
                <p className="text-2xl font-semibold">StoryForge Integration Placeholder</p>
                <p className="mt-4">This project is being integrated into the GameHub monolith.</p>
            </div>
        </div>
    );
};
