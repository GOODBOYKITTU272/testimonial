import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle2, Trophy, Clock, Check, Info } from "lucide-react";

// Revalidate data periodically if needed
export const revalidate = 60;

export default async function JourneyPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  let testimonialData;

  // Try fetching from Supabase
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("company_short_code", shortCode)
    .single();

  if (error || !data) {
    if (shortCode === "demo") {
      testimonialData = {
        client_name: "Anonymous Client",
        company_name: "TP ICAP",
        company_description: "Global Financial Services",
        application_date: "2025-05-21",
        thanks_email_date: "2025-05-21",
        interview_date: "2025-07-08",
        journey_duration_days: 48,
        testimonial_text: "I couldn't have secured this opportunity without the persistent effort. The process was completely hands-off for me, and waking up to interview invitations from top firms is an incredible feeling.",
        testimonial_role: "Financial Analyst Candidate",
        photo_1_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
        photo_2_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80",
        photo_3_url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&q=80",
      };
    } else {
      notFound();
    }
  } else {
    testimonialData = data;
  }

  const {
    company_name,
    company_description,
    application_date,
    thanks_email_date,
    interview_date,
    journey_duration_days,
  } = testimonialData;

  const appDate = format(parseISO(application_date), "MMM d, yyyy");
  const thanksDate = format(parseISO(thanks_email_date), "MMM d, yyyy");
  const intDate = format(parseISO(interview_date), "MMM d, yyyy");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      
      {/* Header section */}
      <header className="bg-white border-b border-gray-200 pt-16 pb-12 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
          Real Results, <span className="text-blue-600">Real Timelines</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          We don't just give you job links — we apply on your behalf daily until you land interviews. Here's proof of what actually happens after we apply.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Stats Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12 transform hover:shadow-md transition-shadow">
          <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 border-b pb-4">
            Case Study: From Application to Interview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Company</p>
              <h3 className="text-2xl font-bold text-gray-900">{company_name}</h3>
              <p className="text-sm text-gray-500 mt-1">{company_description}</p>
            </div>
            <div className="md:border-l md:border-r border-gray-100 md:px-8">
              <p className="text-sm font-medium text-gray-500 mb-1">Days</p>
              <h3 className="text-4xl font-black text-blue-600">{journey_duration_days}</h3>
              <p className="text-sm text-gray-500 mt-1">From App to Interview</p>
            </div>
            <div className="md:pl-4">
              <div className="inline-block bg-blue-50 text-blue-700 p-3 rounded-full mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quality Opportunity</h3>
              <p className="text-sm text-gray-500 mt-1">Secured and Scheduled</p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">The Complete Journey Timeline</h2>
          
          <div className="relative pl-4 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-10 md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-blue-400 to-green-400 rounded"></div>

            {/* Step 1 */}
            <div className="relative flex items-start md:justify-end md:pr-12 w-full md:w-1/2 mb-16 group">
              <div className="absolute left-8 md:-right-4 w-6 h-6 bg-white border-4 border-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <div className="ml-20 md:ml-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all w-full max-w-sm relative z-10">
                <div className="flex items-center text-blue-600 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-bold text-sm tracking-wide">Day 1</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Application Submitted</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-sm text-gray-700 mb-2">What we did:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Identified fresh job posting</li>
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Tailored resume for role</li>
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Applied via company portal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start md:justify-start md:pl-12 md:ml-auto w-full md:w-1/2 mb-16 group">
              <div className="absolute left-8 md:-left-3 w-6 h-6 bg-white border-4 border-blue-400 rounded-full group-hover:scale-125 transition-transform z-10"></div>
              <div className="ml-20 md:ml-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all w-full max-w-sm relative z-10">
                <div className="flex items-center text-blue-500 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-bold text-sm tracking-wide">Same Day</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Confirmation Received</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-sm text-gray-700 mb-2">Immediate Response:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Automated acknowledgment</li>
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Application in system</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start md:justify-end md:pr-12 w-full md:w-1/2 group">
              <div className="absolute left-8 md:-right-4 w-8 h-8 bg-green-500 border-4 border-white shadow-sm rounded-full flex items-center justify-center z-20 group-hover:scale-125 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="ml-20 md:ml-0 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all w-full max-w-sm relative z-10">
                <div className="flex items-center text-green-600 mb-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span className="font-bold text-sm tracking-wide">Day {journey_duration_days}</span>
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-4">🎯 Interview Invitation!</h4>
                <div className="bg-white/60 rounded-lg p-4">
                  <p className="font-semibold text-sm text-green-800 mb-2">Success Details:</p>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Official company invitation</li>
                    <li className="flex items-start"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> High importance flag</li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </section>
        
        {/* Reality Section */}
        <section className="bg-gray-900 text-white rounded-3xl p-10 text-center mb-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">The Corporate Hiring Reality</h2>
            <p className="text-xl text-blue-200 font-semibold mb-6">{journey_duration_days} Days is Normal for Quality Companies</p>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              This timeline proves our team targets the RIGHT companies - established, reputable employers with proper hiring processes. Don't stop when you're this close to success.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 text-center text-gray-500 text-sm">
        <p className="font-bold text-gray-900 mb-2 text-lg">ApplyWizz</p>
        <p>Where persistence meets precision in job applications.</p>
        <p className="mt-6">© 2025 ApplyWizz. Helping international job seekers land interviews daily.</p>
      </footer>

    </div>
  );
}
