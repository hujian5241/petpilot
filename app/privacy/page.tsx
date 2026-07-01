import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig } from "@/lib/content";

export async function generateMetadata() {
  const config = await getSiteConfig();
  return {
    title: `Privacy Policy | ${config.name}`,
    description: `Privacy Policy for ${config.name}. We respect your privacy and do not sell personal data.`,
  };
}

export default async function PrivacyPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 1, 2026</p>
      </header>

      <section className="prose-pet mt-8">
        <p>
          At {config.name}, we respect your privacy. This Privacy Policy explains what information we
          collect, how we use it, and your rights. By using our website, you consent to this policy.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>
            <strong>Usage data:</strong> Pages visited, search queries, device type, browser type, and
            approximate location (via analytics).
          </li>
          <li>
            <strong>Contact information:</strong> If you email us or submit feedback, we collect the
            information you provide.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> We may use cookies to improve your
            experience and analyze site usage.
          </li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Operate and improve the website</li>
          <li>Understand how visitors use our content</li>
          <li>Respond to your questions or feedback</li>
          <li>Maintain site security and prevent abuse</li>
        </ul>

        <h2>3. Analytics</h2>
        <p>
          We may use third-party analytics services to understand website traffic. These services may use
          cookies and collect usage data according to their own privacy policies. We do not sell your
          personal information.
        </p>

        <h2>4. Third-Party Links</h2>
        <p>
          Our site may link to external websites, such as ASPCA or Pet Poison Helpline. We are not
          responsible for the privacy practices or content of those third-party sites.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We take reasonable measures to protect information from unauthorized access or disclosure.
          However, no website can guarantee complete security.
        </p>

        <h2>6. Children</h2>
        <p>
          {config.name} is not directed at children under 13. We do not knowingly collect personal
          information from children.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, or delete your personal
          information. Contact us to make a request.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The updated version will be posted on this
          page with a revised date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${config.contact_email}`}>{config.contact_email}</a>.
        </p>
      </section>
    </div>
  );
}
