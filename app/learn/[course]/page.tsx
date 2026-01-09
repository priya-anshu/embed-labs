import { courses } from "@/lib/mockData";

export default function CoursePage({
  params,
}: {
  params: { course: string };
}) {
  const course = courses.find((c) => c.id === params.course);

  if (!course) {
    return <p className="p-6">Course not found</p>;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="opacity-80">{course.description}</p>

      <div className="aspect-video bg-(--muted)
                      flex items-center justify-center rounded-lg">
        <span className="opacity-60">Video Player (Mock)</span>
      </div>
    </section>
  );
}
