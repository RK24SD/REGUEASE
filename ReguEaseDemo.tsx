/ src/app/page.tsx     ←  main entry point (Next.js App Router)
// You can also use this as standalone index.html + script for quick demo

"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Step = "welcome" | "quiz" | "roadmap" | "documents" | "incorporation" | "compliance" | "done";

type QuizAnswers = {
  sector: string;
  location: string;
  entity: "Private Limited" | "LLP" | "OPC";
  employees: number;
};

type RoadmapItem = {
  title: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  estimatedDays: number;
};

// ────────────────────────────────────────────────
//  Mock data & helpers
// ────────────────────────────────────────────────
const sectors = ["EdTech", "FinTech", "E-Commerce", "HealthTech", "SaaS", "Gig Economy", "Other"];

const initialQuiz: QuizAnswers = {
  sector: "",
  location: "Delhi",
  entity: "Private Limited",
  employees: 2,
};

const generateMockRoadmap = (answers: QuizAnswers): RoadmapItem[] => [
  { title: "Name Approval (RUN / PART-I)", status: "pending", estimatedDays: 2 },
  { title: "Director DIN & DSC", status: "pending", estimatedDays: 3 },
  { title: "SPICe+ Form Submission", status: "pending", estimatedDays: 5–7 },
  { title: "DPIIT / Startup India Recognition", status: answers.sector === "FinTech" ? "blocked" : "pending", estimatedDays: 10 },
  { title: "GST Registration", status: "pending", estimatedDays: 3 },
  { title: "PF / ESIC (if ≥10 employees)", status: answers.employees >= 10 ? "pending" : "skipped", estimatedDays: 5 },
  { title: "Shops & Establishment (state)", status: "pending", estimatedDays: 7 },
];

// ────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────
export default function ReguEaseApp() {
  const [step, setStep] = useState<Step>("welcome");
  const [quiz, setQuiz] = useState<QuizAnswers>(initialQuiz);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === "roadmap" && roadmap.length === 0) {
      setRoadmap(generateMockRoadmap(quiz));
    }
  }, [step, quiz, roadmap.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const simulateBackendCall = async (endpoint: string, body?: any) => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1400)); // fake network

    // In real app → fetch(`/api/${endpoint}`, { method: "POST", body: JSON.stringify(body) })
    if (endpoint === "submit-spice") {
      if (files.length < 2) throw new Error("PAN & Aadhaar required");
      return { success: true, cin: "U72900DL2026PTC999999", status: "Submitted" };
    }
    return { success: true };
  };

  const nextStep = async () => {
    if (step === "quiz") {
      if (!quiz.sector) return setError("Please select a sector");
      setStep("roadmap");
    } else if (step === "roadmap") {
      setStep("documents");
    } else if (step === "documents") {
      try {
        const res = await simulateBackendCall("upload-documents", { files });
        console.log("Upload response:", res);
        setStep("incorporation");
      } catch (err: any) {
        setError(err.message);
      }
    } else if (step === "incorporation") {
      try {
        const res = await simulateBackendCall("submit-spice", { quiz });
        console.log("SPICe+ response:", res);
        setStep("compliance");
      } catch (err: any) {
        setError(err.message);
      }
    } else if (step === "compliance") {
      setStep("done");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-indigo-700">ReguEase</h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              From idea to incorporation in under 7 days – AI-powered, affordable, fraud-proof.
            </p>
            <button
              onClick={() => setStep("quiz")}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Start Now – Free Trial
            </button>
            <p className="text-sm text-gray-500 mt-4">No credit card required</p>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold">Tell us about your startup</h2>

            <div>
              <label className="block mb-2 font-medium">Primary Sector</label>
              <select
                value={quiz.sector}
                onChange={(e) => setQuiz({ ...quiz, sector: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select sector</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">City / State</label>
              <input
                type="text"
                value={quiz.location}
                onChange={(e) => setQuiz({ ...quiz, location: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="Delhi, Bengaluru, Patna..."
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Entity Type</label>
              <div className="grid grid-cols-3 gap-4">
                {["Private Limited", "LLP", "OPC"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setQuiz({ ...quiz, entity: type as any })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      quiz.entity === type
                        ? "border-indigo-600 bg-indigo-50 font-semibold"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Expected team size (first year)</label>
              <input
                type="number"
                min={1}
                value={quiz.employees}
                onChange={(e) => setQuiz({ ...quiz, employees: Number(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={nextStep}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl w-full max-w-sm mx-auto block font-semibold hover:bg-indigo-700"
            >
              Generate My Roadmap →
            </button>
          </div>
        );

      case "roadmap":
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center">Your Personalized Roadmap</h2>
            <p className="text-center text-gray-600">
              Estimated time: <strong>~{roadmap.reduce((s, i) => s + i.estimatedDays, 0)} days</strong>
            </p>

            <div className="space-y-4">
              {roadmap.map((item, i) => (
                <div
                  key={i}
                  className={`p-5 border rounded-xl flex items-center gap-4 ${
                    item.status === "blocked"
                      ? "bg-red-50 border-red-200"
                      : item.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      Est. time: {item.estimatedDays} days
                      {item.status === "skipped" && " (not applicable)"}
                    </p>
                  </div>
                  <div>
                    {item.status === "pending" && <AlertCircle className="text-amber-500" />}
                    {item.status === "in-progress" && <Loader2 className="animate-spin text-blue-500" />}
                    {item.status === "completed" && <CheckCircle className="text-green-500" />}
                    {item.status === "blocked" && <AlertCircle className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={nextStep}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl w-full font-semibold hover:bg-indigo-700"
            >
              Upload Documents →
            </button>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-center">Upload Required Documents</h2>
            <p className="text-center text-gray-600">
              We use military-grade encryption. Files never leave India.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-12 h-12 text-indigo-600" />
                <span className="text-lg font-medium text-indigo-600">Click to upload or drag & drop</span>
                <span className="text-sm text-gray-500">PAN, Aadhaar, Address proof, Photos (max 10 MB each)</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Uploaded files ({files.length})</p>
                <ul className="space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="text-red-600 text-center">{error}</p>}

            <button
              onClick={nextStep}
              disabled={files.length === 0 || isLoading}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl w-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Processing...
                </>
              ) : (
                "Submit Documents & Start Incorporation"
              )}
            </button>
          </div>
        );

      case "incorporation":
        return (
          <div className="text-center space-y-8">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">Filing SPICe+ with MCA</h2>
            <p className="text-gray-700 max-w-md mx-auto">
              Our AI is auto-filling your forms and communicating with MCA21 right now.<br />
              This usually takes 30–60 days — we're aiming for under 7.
            </p>
            <button
              onClick={nextStep}
              className="bg-green-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-green-700"
            >
              Simulate Success (Demo)
            </button>
          </div>
        );

      case "compliance":
        return (
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">Your Company is on its way!</h2>
            <p className="text-xl">
              Next steps appear in your dashboard automatically.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="font-medium mb-2">Recommended Plan</p>
              <p className="text-2xl font-bold">₹499 / month</p>
              <p className="text-sm text-gray-600">Unlimited filings • Priority support • Fraud shield</p>
            </div>
            <button className="bg-indigo-600 text-white px-12 py-5 rounded-xl text-lg font-semibold hover:bg-indigo-700">
              Activate Pro Plan – Continue
            </button>
          </div>
        );

      case "done":
        return (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-green-600">Welcome to the future of Indian startups!</h2>
            <p className="text-lg">Check your email & dashboard for next steps.</p>
            <button
              onClick={() => {
                setStep("welcome");
                setQuiz(initialQuiz);
                setFiles([]);
                setRoadmap([]);
              }}
              className="bg-gray-700 text-white px-10 py-4 rounded-xl hover:bg-gray-800"
            >
              Start Another Journey
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress bar */}
        {step !== "welcome" && step !== "done" && (
          <div className="mb-10">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Onboarding</span>
              <span>Incorporation</span>
              <span>Compliance</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width:
                    step === "quiz" ? "20%" :
                    step === "roadmap" ? "40%" :
                    step === "documents" ? "60%" :
                    step === "incorporation" ? "80%" :
                    "100%",
                }}
              />
            </div>
          </div>
        )}

        {renderStep()}
      </div>
    </main>
  );
}
Quick start (if you want to run it standalone)

Create index.html
Paste this inside <body>:

HTML<div id="root"></div>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script type="text/babel">
  // ← paste the entire code above here (without export default)
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<ReguEaseApp />);
</script>
