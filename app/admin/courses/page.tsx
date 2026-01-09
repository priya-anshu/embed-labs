import { adminCourses } from "@/lib/mockData";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-(--border) rounded-lg">
          <thead className="bg-(--muted) text-left">
            <tr>
              <th className="p-3 text-sm">Title</th>
              <th className="p-3 text-sm">Level</th>
              <th className="p-3 text-sm">Lessons</th>
              <th className="p-3 text-sm">Created</th>
              <th className="p-3 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {adminCourses.map((course) => (
              <tr
                key={course.id}
                className="border-t border-(--border)"
              >
                <td className="p-3 text-sm font-medium">
                  {course.title}
                </td>
                <td className="p-3 text-sm">{course.level}</td>
                <td className="p-3 text-sm">{course.lessons}</td>
                <td className="p-3 text-sm">{course.created_at}</td>
                <td className="p-3">
                  <button className="text-sm text-(--primary) hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
