/**
 * User dashboard shell.
 *
 * Minimal, unstyled placeholder. Access is controlled by
 * middleware and root route redirects.
 */

export default async function DashboardPage() {
  return (
    <main className="text-white-700 text-center mt-4 p-8 bg-black-50 rounded-md shadow-md" >
      <h1 className="text-2xl font-bold text-white-700 text-center mb-4 mt-4" >User Dashboard</h1>
      <p className="text-white-700 text-center mb-4 mt-4" >This is a placeholder for the user dashboard.</p>
    </main>
  );
}

