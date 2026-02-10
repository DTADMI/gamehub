import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="px-6 py-16 md:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <FileQuestion className="text-muted-foreground mb-4 h-16 w-16" />
        <h1 className="mb-2 text-3xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {"The project you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/projects">Browse Projects</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
