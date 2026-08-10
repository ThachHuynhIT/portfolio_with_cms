import Link from "next/link";
import {
  getSiteSettings,
  getFeaturedProjects,
  getPublishedTestimonials,
} from "@/lib/queries";

export default async function Home() {
  const [settings, featuredProjects, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getPublishedTestimonials(),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-16 px-6 py-16 max-w-3xl mx-auto w-full">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {settings?.heroHeadline || "Portfolio"}
        </h1>
        <p className="text-muted-foreground">{settings?.heroSubtext}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Featured projects</h2>
        <ul className="flex flex-col gap-3">
          {featuredProjects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className="underline underline-offset-4"
              >
                {project.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {project.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {testimonials.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Testimonials</h2>
          <ul className="flex flex-col gap-4">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.authorName}
                  {testimonial.authorRole ? `, ${testimonial.authorRole}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
