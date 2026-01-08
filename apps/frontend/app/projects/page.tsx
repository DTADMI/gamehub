import { getAllProjects, getEnabledProjects, getFeaturedProjects } from "@games/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@games/shared";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | GameHub",
  description: "Explore interactive projects and applications built on GameHub",
};

export default function ProjectsPage() {
  const allProjects = getEnabledProjects();
  const featuredProjects = getFeaturedProjects();
  const freeProjects = allProjects.filter(
    (p) => p.accessTier === "free" || p.accessTier === "freemium",
  );
  const premiumProjects = allProjects.filter(
    (p) => p.accessTier === "premium" || p.accessTier === "enterprise",
  );

  const categories = Array.from(new Set(allProjects.map((p) => p.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-lg">
          Discover powerful applications and interactive experiences built on GameHub
        </p>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Projects ({allProjects.length})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({featuredProjects.length})</TabsTrigger>
          <TabsTrigger value="free">Free ({freeProjects.length})</TabsTrigger>
          <TabsTrigger value="premium">Premium ({premiumProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {categories.map((category) => {
            const categoryProjects = allProjects.filter((p) => p.category === category);
            if (categoryProjects.length === 0) {return null;}

            return (
              <div key={category} className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold capitalize">
                  {category.replace("-", " ")}
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryProjects.map((project) => (
                    <div key={project.slug} className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <div key={project.slug} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No featured projects at the moment. Check back soon!</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="free">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freeProjects.length > 0 ? (
              freeProjects.map((project) => (
                <div key={project.slug} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No free projects available at the moment.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="premium">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {premiumProjects.length > 0 ? (
              premiumProjects.map((project) => (
                <div key={project.slug} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No premium projects available at the moment.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
