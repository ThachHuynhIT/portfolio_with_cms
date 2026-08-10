import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/queries";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="text-muted-foreground">{project.summary}</p>
      <p className="whitespace-pre-wrap">{project.description}</p>
      {project.techTags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {project.techTags.map((tag) => (
            <li key={tag} className="rounded-full border px-3 py-1 text-sm">
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-4">
        {project.liveUrl && (
          <a href={project.liveUrl} className="underline underline-offset-4">
            Live site
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} className="underline underline-offset-4">
            Source
          </a>
        )}
      </div>
    </main>
  );
}
