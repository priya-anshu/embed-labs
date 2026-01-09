import Link from "next/link";

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  lessons: number;
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/learn/${course.id}`}
      className="bg-(--card) text-(--card-foreground)
                 border border-(--border)
                 rounded-lg overflow-hidden hover:shadow-md transition"
    >
      <div className="h-40 bg-(--muted) flex items-center justify-center">
        <span className="opacity-60 text-sm">Thumbnail</span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{course.title}</h3>
        <p className="text-sm opacity-80">{course.description}</p>

        <div className="flex justify-between text-xs opacity-70 pt-2">
          <span>{course.level}</span>
          <span>{course.lessons} lessons</span>
        </div>
      </div>
    </Link>
  );
}
