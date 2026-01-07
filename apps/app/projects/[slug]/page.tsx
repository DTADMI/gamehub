// apps/frontend/app/projects/[slug]/page.tsx
"use client";

import {getProject, ProjectSlug} from "@games/shared";
import {useParams} from "next/navigation";
import React, {Suspense, useEffect, useState} from "react";

import {Skeleton} from "@games/shared/components/ui/skeleton";

export default function ProjectPage() {
    const params = useParams();
    const slug = params.slug as ProjectSlug;
    const project = getProject(slug);

    const [Component, setComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        if (project) {
            project.getComponent().then((comp) => {
                // Handle both default and named exports if necessary
                // In our manifest we usually do .then(m => m.ComponentName)
                setComponent(() => comp);
            });
        }
    }, [project]);

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Project Not Found</h1>
                    <p className="text-muted-foreground">The project you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Suspense fallback={<ProjectLoadingSkeleton/>}>
                {Component ? <Component/> : <ProjectLoadingSkeleton/>}
            </Suspense>
        </div>
    );
}

function ProjectLoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-[300px] mx-auto"/>
            <Skeleton className="h-[400px] w-full rounded-lg"/>
        </div>
    );
}
