export default function Privacy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">How We Protect Your Information</h2>
              <p>
                CompSherpa is committed to protecting your privacy. We use your information solely 
                to generate personalized salary negotiation strategies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What We Collect</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Professional information (degree, experience, certifications)</li>
                <li>Career goals and preferences</li>
                <li>General salary expectations (stored as ranges)</li>
                <li>Location preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Data</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Generate personalized negotiation strategies using AI</li>
                <li>Create salary comparisons and market analysis</li>
                <li>Provide customized scripts and tactics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What We DON'T Do</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>❌ Store your personal data on our servers</li>
                <li>❌ Share your information with employers or recruiters</li>
                <li>❌ Sell your data to third parties</li>
                <li>❌ Use your data for anything other than your report</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">AI Processing</h2>
              <p>
                We use Claude AI (by Anthropic) to analyze your inputs and generate recommendations. 
                Your data is processed securely and is not used to train AI models.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Control</h2>
              <p>
                You can clear all your data at any time from your dashboard. Your profile information 
                is stored locally in your browser and can be deleted by clearing your browser data.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}