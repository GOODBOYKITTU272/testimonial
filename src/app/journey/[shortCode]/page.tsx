import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Check, Info, BadgeCheck, Flag, Zap, Target, TrendingUp, Briefcase } from "lucide-react";
import Image from "next/image";

// Revalidate data periodically if needed
export const revalidate = 60;

export default async function JourneyPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  let testimonialData;

  // Fetch from Supabase
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("company_short_code", shortCode)
    .single();

  if (error || !data) {
    notFound();
  }

  testimonialData = data;

  const {
    client_name,
    company_name,
    company_description,
    application_date,
    thanks_email_date,
    interview_date,
    journey_duration_days,
    testimonial_text,
    photo_1_url,
    photo_2_url,
    photo_3_url
  } = testimonialData;

  const appDate = format(parseISO(application_date), "MMM d, yyyy");
  const thanksDate = format(parseISO(thanks_email_date), "MMM d, yyyy");
  const intDate = format(parseISO(interview_date), "MMM d, yyyy");

  // Logo component adhering precisely to brand docs
  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-aw-black rounded-lg flex items-center justify-center font-bold text-xl tracking-tighter" style={{ borderRadius: '10px' }}>
        <span className="text-aw-blue">A</span>
        <span className="text-aw-green -ml-0.5">W</span>
      </div>
      <span className="font-extrabold tracking-widest uppercase text-sm font-inter">APPLY WIZZ</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-aw-soft-gray text-aw-black font-sans selection:bg-aw-green selection:text-aw-black">
      
      {/* Jet Black Branding Header */}
      <nav className="bg-aw-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <Logo />
        <span className="text-sm font-medium text-gray-400 hidden sm:block">Your Career Partner</span>
      </nav>

      {/* Hero Section */}
      <header className="bg-aw-black pt-16 pb-24 text-center px-4 relative overflow-hidden">
        {/* Subtle glow effect behind header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-aw-blue opacity-10 blur-3xl pointer-events-none rounded-full"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-gray-300 backdrop-blur-sm">
            🚀 ApplyWizz Client Success Story
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Real Results, <span className="text-aw-green">Real Timelines</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
            We don't just give you job links — we apply on your behalf daily until you land interviews. Here's proof of what actually happens after we apply.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-gray-800/80 px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-gray-700 backdrop-blur-sm">🛡️ Real Application Proof</span>
            <span className="bg-gray-800/80 px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-gray-700 backdrop-blur-sm">⏳ {journey_duration_days}-Day Journey</span>
            <span className="bg-gray-800/80 px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-gray-700 backdrop-blur-sm">🎯 Interview Secured</span>
          </div>
        </div>
      </header>

      {/* Offset Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-20">
        
        {/* Case Study Summary Card */}
        <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 mb-16 border border-gray-100">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-2">Case Study: From Application to Interview</h2>
          <p className="text-center text-gray-500 mb-10">A real client's journey with {company_name} - showing why patience and persistence pay off</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-aw-blue-tint rounded-[1.2rem] flex items-center justify-center text-xl font-black text-aw-blue mb-4 shadow-sm border border-blue-100">
                {company_name.substring(0, 2).toUpperCase()}
              </div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Company</p>
              <h3 className="text-lg font-bold text-aw-deep-gray leading-snug">{company_name}</h3>
              <p className="text-sm text-gray-500 mt-1">{company_description}</p>
            </div>
            
            <div className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-6xl font-black text-aw-blue mb-2 tabular-nums tracking-tight tracking-tighter">{journey_duration_days}</h3>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Days</p>
              <p className="text-sm text-gray-500">From Application to Interview</p>
            </div>
            
            <div className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-6xl font-black text-aw-green mb-2 tabular-nums tracking-tighter">1</h3>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Interview</p>
              <p className="text-sm text-gray-500">Quality Opportunity Secured</p>
            </div>
          </div>
        </section>

        {/* Timeline Title */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-extrabold text-aw-black">The Complete Journey Timeline</h2>
        </div>

        {/* Timeline Progression — explicit 3-column: image | dot | card alternating */}
        <section className="relative mb-20">
          {/* Centered vertical line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-aw-blue to-aw-green rounded-full -translate-x-1/2 z-0" />

          <div className="space-y-12">

            {/* ── Step 1: Image LEFT · dot · Card RIGHT ── */}
            <div className="relative flex flex-col md:flex-row md:items-center">
              {/* LEFT — screenshot */}
              <div className="hidden md:flex md:w-[calc(50%-2.5rem)] md:pr-8 items-center justify-end">
                {photo_1_url && (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64 bg-gray-50">
                    <img src={photo_1_url} alt="Application Proof" className="w-full h-full object-cover object-top" />
                  </div>
                )}
              </div>
              {/* CENTER — dot */}
              <div className="hidden md:flex items-center justify-center w-10 shrink-0 z-10">
                <div className="w-10 h-10 rounded-full bg-white border-4 border-aw-blue shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-aw-blue rounded-full" />
                </div>
              </div>
              {/* RIGHT — text card */}
              <div className="w-full md:w-[calc(50%-2.5rem)] md:pl-8">
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 text-aw-blue font-bold text-sm uppercase tracking-widest mb-2 font-inter">
                    <span>Day 1</span> <span className="text-gray-300">•</span> <span>{appDate}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-aw-deep-gray mb-6">Application Submitted</h4>
                  <p className="text-sm font-bold text-gray-800 mb-3">What ApplyWizz Did:</p>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start"><Check className="w-5 h-5 text-aw-green mr-2 flex-shrink-0" /> Identified fresh job posting</li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-aw-green mr-2 flex-shrink-0" /> Tailored resume for role</li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-aw-green mr-2 flex-shrink-0" /> Applied via company portal</li>
                  </ul>
                  {/* Mobile: image below text */}
                  {photo_1_url && (
                    <div className="mt-5 md:hidden rounded-xl overflow-hidden border border-gray-200 shadow-sm h-56 bg-gray-50">
                      <img src={photo_1_url} alt="Application Proof" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Step 2: Card LEFT · dot · Image RIGHT ── */}
            <div className="relative flex flex-col md:flex-row md:items-center">
              {/* LEFT — text card */}
              <div className="w-full md:w-[calc(50%-2.5rem)] md:pr-8">
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 text-aw-blue font-bold text-sm uppercase tracking-widest mb-2 font-inter">
                    <span>Same Day</span> <span className="text-gray-300">•</span> <span>{thanksDate}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-aw-deep-gray mb-6">Confirmation Received</h4>
                  <p className="text-sm font-bold text-gray-800 mb-3">Immediate Response:</p>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start"><Check className="w-5 h-5 text-aw-green mr-2 flex-shrink-0" /> Automated acknowledgment</li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-aw-green mr-2 flex-shrink-0" /> Application successfully in system</li>
                  </ul>
                  {/* Mobile: image below text */}
                  {photo_2_url && (
                    <div className="mt-5 md:hidden rounded-xl overflow-hidden border border-gray-200 shadow-sm h-56 bg-gray-50">
                      <img src={photo_2_url} alt="Thank You Email" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>
              </div>
              {/* CENTER — dot */}
              <div className="hidden md:flex items-center justify-center w-10 shrink-0 z-10">
                <div className="w-10 h-10 rounded-full bg-white border-4 border-aw-blue shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-aw-blue rounded-full" />
                </div>
              </div>
              {/* RIGHT — screenshot */}
              <div className="hidden md:flex md:w-[calc(50%-2.5rem)] md:pl-8 items-center">
                {photo_2_url && (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64 bg-gray-50">
                    <img src={photo_2_url} alt="Thank You Email" className="w-full h-full object-cover object-top" />
                  </div>
                )}
              </div>
            </div>

            {/* ── Step 3: Image LEFT · dot · Card RIGHT ── */}
            <div className="relative flex flex-col md:flex-row md:items-center">
              {/* LEFT — screenshot */}
              <div className="hidden md:flex md:w-[calc(50%-2.5rem)] md:pr-8 items-center justify-end">
                {photo_3_url && (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64 bg-gray-50">
                    <img src={photo_3_url} alt="Interview Invite" className="w-full h-full object-cover object-top" />
                  </div>
                )}
              </div>
              {/* CENTER — dot (green/badge for final step) */}
              <div className="hidden md:flex items-center justify-center w-10 shrink-0 z-10">
                <div className="w-12 h-12 rounded-full bg-aw-green border-4 border-white shadow-lg flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-aw-black" />
                </div>
              </div>
              {/* RIGHT — text card */}
              <div className="w-full md:w-[calc(50%-2.5rem)] md:pl-8">
                <div className="bg-gradient-to-br from-aw-yellow/10 to-transparent p-6 md:p-8 rounded-[1.5rem] shadow-md border border-aw-yellow/30 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm uppercase tracking-widest mb-2 font-inter">
                    <span>Day {journey_duration_days}</span> <span className="text-gray-300">•</span> <span>{intDate}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-aw-deep-gray mb-6">Interview Invitation Received!</h4>
                  <p className="text-sm font-bold text-gray-800 mb-3">Success Metrics:</p>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start"><Flag className="w-5 h-5 text-aw-yellow mr-2 flex-shrink-0" /> Official company invitation</li>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-aw-yellow mr-2 flex-shrink-0" /> High importance status</li>
                  </ul>
                  {/* Mobile: image below text */}
                  {photo_3_url && (
                    <div className="mt-5 md:hidden rounded-xl overflow-hidden border border-gray-200 shadow-sm h-56 bg-gray-50">
                      <img src={photo_3_url} alt="Interview Invite" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Corporate Hiring Reality Grid */}
        <section className="bg-aw-deep-gray rounded-[2rem] p-8 md:p-12 mb-16 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 text-aw-yellow opacity-10">
             <TrendingUp className="w-48 h-48" />
           </div>
           
           <div className="relative z-10">
             <div className="inline-flex items-center bg-aw-yellow text-aw-black font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-6 font-inter shadow-lg">
                <Info className="w-3 h-3 mr-1.5" /> Key Insight
             </div>
             <h2 className="text-3xl font-extrabold mb-4">{journey_duration_days} Days is Normal for Quality Companies</h2>
             <p className="text-gray-400 mb-10 max-w-2xl text-lg">
               This timeline proves ApplyWizz targets the RIGHT companies - established, reputable employers with proper hiring processes. Look at the data:
             </p>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-gray-700 text-xs uppercase tracking-wider text-gray-500 font-inter">
                     <th className="py-4 pr-6 font-semibold hidden sm:table-cell">Company Type</th>
                     <th className="py-4 px-6 font-semibold">Average Timeline</th>
                     <th className="py-4 px-6 font-semibold">Interview Rate</th>
                     <th className="py-4 pl-6 font-semibold">Quality</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   <tr className="bg-gray-800/20">
                     <td className="py-5 pr-6 font-medium text-aw-green hidden sm:table-cell">Fortune 500 / Enterprise</td>
                     <td className="py-5 px-6 text-gray-300">30-90 days</td>
                     <td className="py-5 px-6 text-gray-300">3-5%</td>
                     <td className="py-5 pl-6"><span className="bg-aw-green/20 text-aw-green px-2 py-1 rounded text-xs font-bold font-inter">High</span></td>
                   </tr>
                   <tr>
                     <td className="py-5 pr-6 font-medium text-aw-blue hidden sm:table-cell">Mid-size Companies</td>
                     <td className="py-5 px-6 text-gray-300">14-45 days</td>
                     <td className="py-5 px-6 text-gray-300">5-8%</td>
                     <td className="py-5 pl-6"><span className="bg-aw-blue/20 text-aw-blue px-2 py-1 rounded text-xs font-bold font-inter">Good</span></td>
                   </tr>
                   <tr className="bg-gray-800/20">
                     <td className="py-5 pr-6 font-medium text-gray-300 hidden sm:table-cell">Startups</td>
                     <td className="py-5 px-6 text-gray-300">7-21 days</td>
                     <td className="py-5 px-6 text-gray-300">8-12%</td>
                     <td className="py-5 pl-6"><span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-bold font-inter">Variable</span></td>
                   </tr>
                   <tr>
                     <td className="py-5 pr-6 font-medium text-aw-coral hidden sm:table-cell">Low-quality / Scams</td>
                     <td className="py-5 px-6 text-gray-400">1-7 days</td>
                     <td className="py-5 px-6 text-gray-400">15-20%</td>
                     <td className="py-5 pl-6"><span className="bg-aw-coral/20 text-aw-coral px-2 py-1 rounded text-xs font-bold font-inter">Low</span></td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
        </section>

        {/* Marketing / Value Prop Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-aw-blue" />
                <h3 className="text-2xl font-bold text-aw-black">The ApplyWizz Advantage</h3>
             </div>
             
             <ul className="space-y-6">
                <li className="flex items-start">
                   <div className="bg-aw-blue-tint text-aw-blue p-2 rounded-xl mr-4 shrink-0"><Check className="w-5 h-5"/></div>
                   <div>
                     <strong className="block text-gray-900 mb-1">20-25 applications daily</strong>
                     <p className="text-gray-500 text-sm leading-relaxed">We source and apply to fresh, relevant opportunities every single day without fail.</p>
                   </div>
                </li>
                <li className="flex items-start">
                   <div className="bg-aw-blue-tint text-aw-blue p-2 rounded-xl mr-4 shrink-0"><Briefcase className="w-5 h-5"/></div>
                   <div>
                     <strong className="block text-gray-900 mb-1">Continuous pipeline</strong>
                     <p className="text-gray-500 text-sm leading-relaxed">While your Month 1 applications mature, we are already building your Month 2 pipeline.</p>
                   </div>
                </li>
                <li className="flex items-start">
                   <div className="bg-aw-blue-tint text-aw-blue p-2 rounded-xl mr-4 shrink-0"><TrendingUp className="w-5 h-5"/></div>
                   <div>
                     <strong className="block text-gray-900 mb-1">Compound effect</strong>
                     <p className="text-gray-500 text-sm leading-relaxed">Clients who stay 3+ months see a massive spike in interviews due to sustained momentum.</p>
                   </div>
                </li>
             </ul>
          </div>
          
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
             <h3 className="text-xl font-bold text-aw-black mb-8 border-b pb-4">Client Success Rates</h3>
             
             <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2 font-inter">
                    <span>Month 1</span>
                    <span>35% yield</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-aw-blue h-3 rounded-full w-[35%]"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2 font-inter">
                    <span>Month 2</span>
                    <span>65% yield</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-aw-green h-3 rounded-full w-[65%]"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2 font-inter">
                    <span>Month 3+</span>
                    <span>85% yield</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-aw-yellow h-3 rounded-full w-[85%]"></div>
                  </div>
               </div>
               <p className="text-sm text-gray-400 mt-6 italic">Yield probability of landing 1+ high quality interviews based on historical data.</p>
             </div>
          </div>
        </section>

        {/* Testimonial Quote */}
        {testimonial_text && (
          <div className="max-w-3xl mx-auto my-20">
             <div className="text-4xl text-aw-blue mb-4">"</div>
             <p className="text-2xl md:text-3xl font-medium text-aw-black leading-snug mb-8">
               {testimonial_text}
             </p>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-aw-blue-tint rounded-full flex items-center justify-center text-aw-blue font-bold font-inter relative">
                   {client_name ? client_name.substring(0, 1) : "A"}
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-aw-green rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{client_name || "ApplyWizz Client"}</p>
                  <p className="text-sm text-gray-500">Secured Interview at {company_name}</p>
                </div>
             </div>
          </div>
        )}

      </main>

      {/* Heavy CTA Footer */}
      <footer className="bg-aw-blue py-16 px-4 text-center mt-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Don't Stop When You're This Close to Success
        </h2>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-10">
          Your ApplyWizz journey is working exactly as designed. Quality companies take time to respond, but the results speak for themselves.
        </p>
        
        <div className="pt-10 border-t border-blue-500/30 flex flex-col md:flex-row items-center justify-center gap-6">
          <Logo />
          <span className="text-blue-200/50 hidden md:block">|</span>
          <p className="text-blue-200 text-sm font-medium">Empowering job seekers every single day.</p>
        </div>
      </footer>
    </div>
  );
}

