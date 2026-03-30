import Link from "next/link";
import { Copy, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 selection:bg-blue-200">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">ApplyWizz Hub</h1>
        <p className="text-xl text-gray-500 mb-12">Manage and generate client case studies with ease.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mx-auto">
          
          <Link href="/apply" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Form</h2>
            <p className="text-gray-500">For clients and team members to submit journey details.</p>
          </Link>

          <Link href="/admin" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-500">View submissions, filter by domain, and copy share URLs.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}
