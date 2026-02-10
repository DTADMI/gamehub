"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listGames } from "@/lib/games";
import { listProjects } from "@/lib/projects";
import { useState } from "react";

export default function AdminDashboard() {
  const games = listGames();
  const projects = listProjects();
  const [tab, setTab] = useState<"games" | "projects">("games");

  return (
    <div className="px-6 py-8 md:px-8">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage games and projects overview.</p>

      <div className="mb-6 flex gap-2">
        <Button variant={tab === "games" ? "default" : "outline"} onClick={() => setTab("games")}>Games</Button>
        <Button variant={tab === "projects" ? "default" : "outline"} onClick={() => setTab("projects")}>Projects</Button>
      </div>

      {tab === "games" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <Card key={g.slug}>
              <CardHeader>
                <CardTitle className="text-base">{g.title}</CardTitle>
                <CardDescription>{g.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge variant={g.enabled ? "default" : "secondary"}>{g.enabled ? "Enabled" : "Disabled"}</Badge>
                  {g.upcoming && <Badge variant="outline">Upcoming</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "projects" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.slug}>
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>{p.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {p.featured && <Badge>Featured</Badge>}
                  {p.upcoming && <Badge variant="outline">Upcoming</Badge>}
                </div>
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-primary mt-2 block text-sm hover:underline">
                  GitHub Repo
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
