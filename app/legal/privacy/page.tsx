import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/60 mb-12">Last updated: June 5, 2026</p>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data We Store</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We only retain the information necessary to operate jury.lat, provide services, process purchases, and maintain account security. The data described below is associated with your account and is not publicly shared.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Account Information</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">User Accounts</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              The following information may be stored as part of your account:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Username</li>
              <li>Internal account identifier (NID)</li>
              <li>Password hash</li>
              <li>Two-factor authentication settings and secret</li>
              <li>Account email address</li>
              <li>Membership status and expiry date</li>
              <li>Staff permissions (if applicable)</li>
              <li>Ban status and reason (if applicable)</li>
              <li>Reseller status and credit balance</li>
              <li>File API key</li>
              <li>Storage limits and purchased add-ons</li>
              <li>Alias limits</li>
              <li>Linked Discord account information</li>
              <li>Onboarding preferences</li>
              <li>Referral code and referral relationships</li>
              <li>Referral earnings balance</li>
              <li>Account creation timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Invites</h3>
            <p className="text-white/80 leading-relaxed mb-4">We store:</p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Invite code</li>
              <li>User who redeemed the invite</li>
              <li>Intended recipient (if specified)</li>
              <li>Purchase status</li>
              <li>Creation timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Orders & Payments</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              For purchases and billing, we may store:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Order ID</li>
              <li>Product type</li>
              <li>Quantity</li>
              <li>Payment destination information</li>
              <li>Price in USD</li>
              <li>Cryptocurrency and payment amount (if applicable)</li>
              <li>Payment method</li>
              <li>Contact email</li>
              <li>Associated invite or referral codes</li>
              <li>Expiration date</li>
              <li>Creation and update timestamps</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Administrative Logs</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Administrative actions are recorded for accountability and security purposes.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Stored information may include:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Log ID</li>
              <li>Staff account ID</li>
              <li>Staff username</li>
              <li>Action performed</li>
              <li>Target account or resource</li>
              <li>Action details</li>
              <li>Timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Recovery Codes</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              If enabled, recovery codes are stored against your account for account recovery purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Referrals & Payouts</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Referral systems may store:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Referral transaction IDs</li>
              <li>User IDs involved</li>
              <li>Referral source information</li>
              <li>Payment amounts</li>
              <li>Cryptocurrency information</li>
              <li>Destination addresses</li>
              <li>Processing status</li>
              <li>Transaction references</li>
              <li>Timestamps</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Reseller Activity</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Reseller-related records may include:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Reseller ID</li>
              <li>User ID</li>
              <li>Internal identifier</li>
              <li>Credit amount</li>
              <li>Transaction date</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Chat Messages</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              If chat features are available, we may store:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Message ID</li>
              <li>User ID</li>
              <li>Message content</li>
              <li>Premium or reseller status flags</li>
              <li>Private conversation identifiers</li>
              <li>Creation timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Discord Domains</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              If linked to Discord-related services, we may store:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Domain ID</li>
              <li>User ID</li>
              <li>Verification code</li>
              <li>Creation timestamp</li>
              <li>Update timestamp</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">File Hosting</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We retain metadata required to manage uploads, folders, sharing permissions, and abuse reports. File contents are stored separately. Where encryption is enabled, we cannot access file contents without the required decryption key.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Files</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Stored metadata includes:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>File ID</li>
              <li>Owner ID</li>
              <li>Filename</li>
              <li>Encryption status</li>
              <li>Delete-after-view settings</li>
              <li>MIME type</li>
              <li>File size</li>
              <li>Folder association</li>
              <li>Report status</li>
              <li>Upload timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">File Reports</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Reports may contain:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Report ID</li>
              <li>File ID</li>
              <li>Report reason</li>
              <li>Submission timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Folders</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Folder metadata may include:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Folder ID</li>
              <li>Owner ID</li>
              <li>Parent folder ID</li>
              <li>Folder name</li>
              <li>Public/private status</li>
              <li>Share token</li>
              <li>Encryption status</li>
              <li>Recovery settings</li>
              <li>Creation timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Folder Reports</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Reports involving folders may include:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Report ID</li>
              <li>Folder ID</li>
              <li>Report reason</li>
              <li>Decryption key (if voluntarily provided by the reporter)</li>
              <li>Review status</li>
              <li>Report timestamp</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Folder Sharing</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Shared folders may store:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Share ID</li>
              <li>Folder ID</li>
              <li>Recipient user ID</li>
              <li>Permission level</li>
              <li>Creation timestamp</li>
            </ul>
            <p className="text-white/80 leading-relaxed mb-4">
              If encrypted content is reported, a valid decryption key may be required before the report can be reviewed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Profile Pages</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Profile and biolink pages only store the information you choose to publish, such as:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Display name</li>
              <li>Theme settings</li>
              <li>Social links</li>
              <li>Badges</li>
              <li>Friend lists</li>
              <li>Custom profile content</li>
            </ul>
            <p className="text-white/80 leading-relaxed mb-4">
              No additional personal information is collected beyond what you choose to enter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Authentication & Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              jury.lat uses authentication tokens to keep accounts secure.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              We currently use:
            </p>
            <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
              <li>Short-lived access tokens</li>
              <li>Long-lived refresh tokens stored in secure HttpOnly cookies</li>
            </ul>
            <p className="text-white/80 leading-relaxed mb-4">
              We do not use advertising cookies, tracking cookies, fingerprinting technologies, or third-party analytics cookies.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Disabling cookies may prevent you from remaining signed in.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Legal Requests</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We review legal requests carefully and verify their validity before disclosing any information.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Where permitted by law, legal disclosures may be documented in our transparency reporting system.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Certain information may not be available because it is not collected or retained by the service.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Abuse reports and copyright complaints should be submitted through the platform&apos;s reporting tools whenever available, as they are processed faster and logged appropriately.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              <strong>Legal inquiries:</strong>{" "}
              <a href="mailto:support@jury.lat" className="text-blue-400 hover:text-blue-300 underline">
                support@jury.lat
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Removal</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You may request deletion of data associated with your account, subject to legal obligations, abuse investigations, or active preservation requirements.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Requests must be submitted from the email address associated with your account.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              We aim to review and respond to deletion requests within a reasonable timeframe.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              <strong>Data removal requests:</strong>{" "}
              <a href="mailto:support@jury.lat" className="text-blue-400 hover:text-blue-300 underline">
                support@jury.lat
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
