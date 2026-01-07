"use client";

import React, {useState} from "react";
import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger} from "@games/shared";
import {listGames, listProjects} from "@games/shared";

export default function AdminDashboard() {
    const games = listGames();
    const projects = listProjects();

    // Mock state for demo - in a real app these would come from the API
    const [flags, setFlags] = useState<Record<string, boolean>>({
        "game-breakout-enabled": true,
        "project-story-forge-enabled": true,
        "user-registration-open": true,
    });

    const toggleFlag = (id: string) => {
        setFlags(prev => ({...prev, [id]: !prev[id]}));
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your monolithic application, feature flags, and project access.
                    </p>
                </div>

                <Tabs defaultValue="projects" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="games">Games</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="flags">Global Flags</TabsTrigger>
                    </TabsList>

                    {/* Projects Management */}
                    <TabsContent value="projects">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Status & Access</CardTitle>
                                <CardDescription>
                                    Configure visibility and default access for sub-projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Default Access</TableHead>
                                            <TableHead>Feature Flag</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.map((p) => (
                                            <TableRow key={p.slug}>
                                                <TableCell className="font-medium">{p.title}</TableCell>
                                                <TableCell>
                                                    <Select defaultValue={p.upcoming ? "coming-soon" : "visible"}>
                                                        <SelectTrigger className="w-[130px]">
                                                            <SelectValue placeholder="Status"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="visible">Visible</SelectItem>
                                                            <SelectItem value="featured">Featured</SelectItem>
                                                            <SelectItem value="coming-soon">Coming Soon</SelectItem>
                                                            <SelectItem value="hidden">Hidden</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={p.enabled ? "default" : "secondary"}>
                                                        {p.enabled ? "Public" : "Restricted"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={flags[`project-${p.slug}-enabled`] ?? false}
                                                        onCheckedChange={() => toggleFlag(`project-${p.slug}-enabled`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm">Manage Users</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Games Management */}
                    <TabsContent value="games">
                        <Card>
                            <CardHeader>
                                <CardTitle>Game Visibility & Settings</CardTitle>
                                <CardDescription>
                                    Control which games are playable and their featured status.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Game</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Enabled</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {games.map((g) => (
                                            <TableRow key={g.slug}>
                                                <TableCell className="font-medium">{g.title}</TableCell>
                                                <TableCell>
                                                    <Select defaultValue={g.upcoming ? "coming-soon" : "visible"}>
                                                        <SelectTrigger className="w-[130px]">
                                                            <SelectValue placeholder="Status"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="visible">Visible</SelectItem>
                                                            <SelectItem value="featured">Featured</SelectItem>
                                                            <SelectItem value="coming-soon">Coming Soon</SelectItem>
                                                            <SelectItem value="hidden">Hidden</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={flags[`game-${g.slug}-enabled`] ?? false}
                                                        onCheckedChange={() => toggleFlag(`game-${g.slug}-enabled`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit Meta</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* User Management */}
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Permissions</CardTitle>
                                <CardDescription>
                                    Manage user access to specific projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="flex items-center justify-center h-32 border-2 border-dashed rounded-md">
                                    <p className="text-muted-foreground italic">User List & Permission Matrix
                                        Placeholder</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Global Flags */}
                    <TabsContent value="flags">
                        <Card>
                            <CardHeader>
                                <CardTitle>Global System Flags</CardTitle>
                                <CardDescription>
                                    Toggle major application features.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <h3 className="font-medium">User Registration</h3>
                                            <p className="text-sm text-muted-foreground">Allow new users to sign up.</p>
                                        </div>
                                        <Switch checked={flags["user-registration-open"]}
                                                onCheckedChange={() => toggleFlag("user-registration-open")}/>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                                        <div className="space-y-0.5">
                                            <h3 className="font-medium">Maintenance Mode</h3>
                                            <p className="text-sm text-muted-foreground">Disable frontend for
                                                non-admins.</p>
                                        </div>
                                        <Switch disabled checked={false}/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
