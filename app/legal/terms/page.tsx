import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/60 mb-12">Last updated: June 5, 2026</p>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              By using <strong>jury.lat</strong>, you agree to these Terms. If you do not agree, do not use the service. Creating an account, uploading content, or sending messages constitutes acceptance of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You must use jury.lat lawfully and respect other users. The following examples are prohibited and may result in account removal. This list is illustrative, not exhaustive.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Account and Access</h3>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Selling or transferring accounts, except for email aliases where permitted.</li>
              <li>Selling, trading, or trafficking invite codes or access credentials.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">File Hosting</h3>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Child sexual abuse material (CSAM) is strictly prohibited and subject to immediate action.</li>
              <li>Gore, graphic violence, or non-consensual pornography is not allowed.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Content</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              The following content is prohibited across all jury.lat services:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>CSAM (zero tolerance). Reports are made to appropriate authorities, and relevant evidence may be preserved as required by law.</li>
              <li>Non-consensual intimate imagery, including revenge porn and leaked private content.</li>
              <li>Doxxing materials, including another person&apos;s real name, address, phone number, identity documents, or other sensitive personal information.</li>
              <li>Malware, exploit kits, credential-stealing tools, or cracked software distributed alongside such tools.</li>
              <li>Content intended to harass, threaten, or target a specific individual or group.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Enforcement</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We do not proactively inspect private uploads or account content. We may act on valid reports, abuse indicators, complaints, or other signals suggesting misuse.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Possible enforcement actions include:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Removal of violating content while keeping the account active for isolated, good-faith violations.</li>
              <li>Restriction of specific features or services.</li>
              <li>Account suspension pending review or appeal.</li>
              <li>Permanent account termination and revocation of service access. Data may be retained only as required for legal obligations or ongoing investigations.</li>
            </ul>
            <p className="text-white/80 leading-relaxed mb-4">
              Administrative actions are recorded in internal review systems. Actions taken in response to lawful requests may be included in transparency reporting where applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We may update these Terms periodically. Significant changes affecting prohibited content, enforcement practices, or data retention will be announced through the dashboard changelog before taking effect.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Minor edits, such as formatting corrections or wording improvements, may be made without prior notice.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Continued use of jury.lat after an announced change constitutes acceptance of the revised Terms. If you do not agree, you may export your data and close your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              For questions regarding these Terms, contact{" "}
              <a href="mailto:support@jury.lat" className="text-blue-400 hover:text-blue-300 underline">
                support@jury.lat
              </a>
              .
            </p>
            <p className="text-white/80 leading-relaxed">
              For copyright or DMCA-related complaints, use the in-product reporting system whenever available to ensure requests are routed correctly and processed efficiently.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
