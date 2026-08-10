import { getSiteSettings, getSkills, getExperienceEntries } from "@/lib/queries";

export default async function AboutPage() {
  const [settings, skills, experience] = await Promise.all([
    getSiteSettings(),
    getSkills(),
    getExperienceEntries(),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-16 px-6 py-16 max-w-3xl mx-auto w-full">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p>{settings?.bio}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="rounded-full border px-3 py-1 text-sm"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        <ul className="flex flex-col gap-4">
          {experience.map((entry) => (
            <li key={entry.id}>
              <p className="font-medium">
                {entry.title} — {entry.organization}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.startDate.getFullYear()}
                {" – "}
                {entry.endDate ? entry.endDate.getFullYear() : "present"}
              </p>
              <p className="text-sm">{entry.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
