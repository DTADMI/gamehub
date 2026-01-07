// frontend/app/projects/page.tsx
"use client";

import {listProjects} from "@games/shared";
import {FolderKanban, Github} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import {Button} from "@games/shared/components/ui/button";
import {GITHUB_URL} from "@/lib/env";

export default function ProjectsPage() {
    const projects = listProjects().filter(p => p.visible !== false);

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl flex items-center justify-center md:justify-start gap-3">
                            <FolderKanban className="h-10 w-10 text-primary"/>
                            Projects
                        </h1>
                        <p className="mt-3 text-xl text-muted-foreground">
                            Explore my other work and full-stack applications
                        </p>
                    </div>
                    <Button variant="outline" size="lg" asChild>
                        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2">
                            <Github className="h-5 w-5"/> GitHub Profile
                        </a>
                    </Button>
                </header>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div
                            key={project.slug}
                            className="group relative bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/50"
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {project.upcoming && (
                                    <div
                                        className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                        Upcoming
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-card-foreground">
                                        {project.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {project.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                    {project.shortDescription}
                                </p>
                                <div className="flex items-center gap-3 mt-auto">
                                    {project.enabled !== false ? (
                                        <Button asChild className="flex-1">
                                            <Link href={`/projects/${project.slug}`}>
                                                Run App
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button disabled className="flex-1 bg-muted text-muted-foreground">
                                            Coming Soon
                                        </Button>
                                    )}
                                    <Button variant="outline" size="icon" asChild title="View Repository">
                                        <a href={project.repo} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-4 w-4"/>
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Looking for games? Visit the{" "}
                        <Link href="/games" className="underline underline-offset-2">
                            Games
                        </Link>{" "}
                        page to play directly in your browser.
                    </p>
                </div>
            </div>
        </div>
    );
}
