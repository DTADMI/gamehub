import type { Metadata } from "next";

import ProjectsClientPage from "./projects-client";

export const metadata: Metadata = {
  title: "Projects | GameHub",
  description: "Explore full-stack projects and products in the GameHub portfolio.",
};

export default function ProjectsPage() {
  return <ProjectsClientPage />;
}
