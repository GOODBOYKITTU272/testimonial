"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const jobRoles = [
  "Active Directory","Anti Money Laundering (AML)","Bioinformatics for UK","Biotechnology",
  "Biotechnology Internship","Game UI / Interactive UI Designer","Business Intelligence Engineer",
  "Clinical Research Coordinator","Cloud Engineer for Ireland","Computer Science",
  "Computer Science Internship","Construction Management","Credit controller for UK","CRM Sales",
  "Cyber security","Cybersecurity for UK","Data Analyst","Data Analyst Internships",
  "Database Administration","Data Engineer for Canada","Data Science for Germany","Data Scientist",
  "DevOps for India","Java Developer","DevOps for Ireland","DevOps for UK","Electrical Engineer",
  "Electrical Project","Electronic Health Records (EHR)","Embedded Software Engineer",
  "Environmental Health and Safety (EHS)","ERP","SAP FICO","Data Science Internships",
  "HR Recruiter","Software Engineer","Full Stack","Java Full Stack","Manufacturing engineer (Mechanical)",
  "Manufacturing engineer (Mechanical) for Canada","Mechanical Engineer",".Net","Network Engineer",
  "Payroll Analyst","Pharmacovigilance","Product Manager","Photography","Project Management Internship",
  "python developer","Quality Engineer","Regulatory Affairs","Safety Analyst","Sales executive for UK",
  "SAP","Sap basis and security","SAP MM","Scrum Master","Sailpoint","Salesforce Developer",
  "Supply Chain","Tax analyst","UX Designer","Workday Analyst","ServiceNow Developer","Medical Coding",
  "Project Manager","Data Center Technician","Quality Assurance Engineer","Cybersecurity for Ireland",
  "Data Analyst for UK","DevOps Internships","Financial analyst for Ireland","Game Developer",
  "Generative AI","Big Data Engineer","devops","Salesforce Developer for UK","Marketing Automation Specialist",
  "Tosca Test Automation Engineer","Atlassian Engineer / Jira","RTL Design Engineer","Financial analyst",
  "marketing","Supply Chain for Ireland","Security Engineer","QA Automation Engineer",
  "Sustainability analyst for Ireland","CLINICAL DATA ANALYST","Chemical Engineer","Data Engineer (citizen/h4ead)",
  "Cloud Engineer","Data Engineer","Data Engineer for UK","Software/Hardware Asset Management Analyst",
  "Epic Analyst","MLOps Engineer","GRC Analyst","CRM Specialist","Structural Engineer for Canada",
  "Technical program Management (citizen/h4ead)","Actimize Developer","Quality Analyst for UK",
  "Frontend Engineering","Business Analyst for Canada","Project Coordinator for Canada","DevOps",
  "Agronomy Operations","Quality Analyst","Software Engineer for Ireland","Data Analyst Internship for Ireland",
  "Dynamics 365","SAP SD","Project Management for Ireland","Software Developer","Data Analyst for Canada",
  "ITSM/ITIL","Medical Affairs","Business Analyst","Business Intelligence Engineer Internships",".Net for Ireland",
  "Network Security Engineer","Supply Chain (citizen/h4ead)","Healthcare Data Analyst","AI/ML Engineer",
  "Bioinformatics","Design Verification Engineer","Netsuite","System Infrastructure Engineer","Full Stack Cloud Engineer",
  "Credit Risk Analyst","Market Research Analyst","SAP BTP / CPI Consultant","Other"
];

const salaryRanges = [
  "Below £20,000","£20,000 – £30,000","£30,000 – £40,000","£40,000 – £55,000",
  "£55,000 – £70,000","£70,000 – £90,000","£90,000 – £120,000","£120,000+",
];

const consultants = [
  "Sarah M.", "James K.", "Priya R.", "Alex T.", "Emma W.",
  "Rahul S.", "Lucy B.", "Tom H.", "Anya D.", "Mark P.",
];

const emptyForm = {
  job_role: "", status: "Assessment Stage",
  email: "", client_name: "", company_name: "", company_short_code: "", company_description: "",
  salary_range: "", consultant_name: "",
  start_date: "", application_date: "", thanks_email_date: "", interview_date: "",
  offer_date: "", journey_duration_days: "",
};

export default function ApplyPage() {
  const [formData, setFormData] = useState<Record<string, any>>(emptyForm);
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo3, setPhoto3] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          if (!photo1) { setPhoto1(file); setMessage("Screenshot pasted successfully to Photo 1!"); }
          else if (!photo2) { setPhoto2(file); setMessage("Screenshot pasted successfully to Photo 2!"); }
          else if (!photo3) { setPhoto3(file); setMessage("Screenshot pasted successfully to Photo 3!"); }
          else setMessage("Error: All 3 photo slots are already full!");
        }
      }
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage("");

    if (!formData.job_role) {
      setMessage("Error: Please select a job role.");
      setLoading(false); return;
    }
    // Duplicate detection
    if (formData.email && formData.company_name) {
      const { data: existing } = await supabase
        .from("testimonials")
        .select("id")
        .eq("email", formData.email)
        .eq("company_name", formData.company_name)
        .limit(1);
      if (existing && existing.length > 0) {
        const proceed = confirm(`⚠️ A journey for ${formData.email} at ${formData.company_name} already exists. Submit anyway?`);
        if (!proceed) { setLoading(false); return; }
      }
    }
    try {
      let url1 = "", url2 = "", url3 = "";
      if (photo1) url1 = await uploadImage(photo1);
      if (photo2) url2 = await uploadImage(photo2);
      if (photo3) url3 = await uploadImage(photo3);

      const { error } = await supabase.from("testimonials").insert([{
        ...formData,
        journey_duration_days: parseInt(formData.journey_duration_days) || 0,
        photo_1_url: url1, photo_2_url: url2, photo_3_url: url3,
        testimonial_text: "", testimonial_role: "",
        consultant_name: formData.consultant_name || "",
      }]);
      if (error) throw error;
      setMessage("Success: Journey details submitted successfully!");
      setFormData(emptyForm);
      setPhoto1(null); setPhoto2(null); setPhoto3(null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Submit Journey Details</h1>
          <p className="text-gray-500">ApplyWizz Case Study Generator</p>
        </div>

        {message && (
          <div className={`p-4 mb-8 rounded-lg font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" onPaste={handlePaste}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ─── ROLE CLASSIFICATION ─── */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Role Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Job Role <span className="text-red-500">*</span></label>
                  <select name="job_role" value={formData.job_role} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700">
                    <option value="">Select applied role...</option>
                    {jobRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700">
                    <option>Assessment Stage</option>
                    <option>Interview Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ApplyWizz Consultant <span className="text-red-500">*</span></label>
                  <select name="consultant_name" value={formData.consultant_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700">
                    <option value="">Select consultant...</option>
                    {consultants.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── CLIENT DETAILS ─── */}
            <SectionHeader title="Client Details" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
              <input type="text" name="client_name" value={formData.client_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Target)</label>
              <select name="salary_range" value={formData.salary_range} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700">
                <option value="">Select range...</option>
                {salaryRanges.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* ─── COMPANY DETAILS ─── */}
            <SectionHeader title="Company Details" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Short Code (for URL)</label>
              <input type="text" name="company_short_code" placeholder="e.g. jp-morgan" value={formData.company_short_code} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <input type="text" name="company_description" placeholder="e.g. Global Financial Institution" value={formData.company_description} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            {/* ─── KEY DATES ─── */}
            <SectionHeader title="Key Dates" subtitle="Track the full journey timeline" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (ApplyWizz Engagement)</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Sent Date <span className="text-red-500">*</span></label>
              <input type="date" name="application_date" value={formData.application_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thanks Email Received</label>
              <input type="date" name="thanks_email_date" value={formData.thanks_email_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date <span className="text-red-500">*</span></label>
              <input type="date" name="interview_date" value={formData.interview_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Date (if applicable)</label>
              <input type="date" name="offer_date" value={formData.offer_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Journey Duration (Days) <span className="text-red-500">*</span></label>
              <input type="number" name="journey_duration_days" value={formData.journey_duration_days} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            {/* ─── PROOF SCREENSHOTS ─── */}
            <SectionHeader title="Proof Screenshots" subtitle="Click 'Choose File' or just press Ctrl+V to paste a screenshot directly into an empty slot!" />
            {[
              { label: "Photo 1 — Application Email", file: photo1, setter: setPhoto1 },
              { label: "Photo 2 — Thanks Email", file: photo2, setter: setPhoto2 },
              { label: "Photo 3 — Interview Invite", file: photo3, setter: setPhoto3 },
            ].map(({ label, file, setter }) => (
              <div key={label} className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => setter(e.target.files?.[0] || null)}
                    className="flex-1 w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {file && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap">Image Attached ✅</span>}
                </div>
              </div>
            ))}

            <div className="col-span-1 md:col-span-2 pt-4">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors w-full shadow-lg shadow-blue-200 text-base">
                {loading ? "Uploading & Submitting…" : "Submit Journey Details"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
