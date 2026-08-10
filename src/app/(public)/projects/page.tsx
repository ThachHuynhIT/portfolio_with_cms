import Link from "next/link";
import { getPublishedProjects } from "@/lib/queries";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <ul className="flex flex-col gap-6">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.slug}`}
              className="text-lg font-medium underline underline-offset-4"
            >
              {project.title}
            </Link>
            <p className="text-sm text-muted-foreground">{project.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
