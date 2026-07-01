import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig } from "@/lib/content";

export async function generateMetadata() {
  const config = await getSiteConfig();
  return {
    title: `Terms of Service | ${config.name}`,
    description: `Terms of Service for ${config.name}. Educational pet safety information only, not veterinary advice.`,
  };
}

export default async function TermsPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Terms of Service" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 1, 2026</p>
      </header>

      <section className="prose-pet mt-8">
        <p>
          Welcome to {config.name}. These Terms of Service govern your access to and use of our
          website and services. By using {config.name}, you agree to these terms. If you do not agree,
          please do not use the site.
        </p>

        <h2>1. Educational Purpose Only</h2>
        <p>
          {config.name} provides general educational information about food and plant safety for pets.
          Our content is not a substitute for professional veterinary advice, diagnosis, or treatment.
          Always consult a licensed veterinarian or animal poison control center for medical concerns.
        </p>

        <h2>2. No Veterinary-Client Relationship</h2>
        <p>
          Use of this website does not create a veterinary-client-patient relationship. We do not
          examine pets, prescribe treatments, or provide emergency medical services.
        </p>

        <h2>3. Emergency Situations</h2>
        <p>
          If your pet is sick, injured, or may have ingested something toxic, contact your veterinarian
          immediately or call a poison control hotline such as ASPCA Poison Control at{" "}
          <a href="tel:8884264435">(888) 426-4435</a> or Pet Poison Helpline at{" "}
          <a href="tel:8557647661">(855) 764-7661</a>.
        </p>

        <h2>4. Accuracy of Information</h2>
        <p>
          We strive to provide accurate and up-to-date information, but we cannot guarantee that all
          content is complete, accurate, or current. Pet safety information may vary by species, breed,
          age, weight, health status, and amount consumed.
        </p>

        <h2>5. User Conduct</h2>
        <p>
          You agree to use {config.name} for lawful purposes only. Do not use the site to distribute
          spam, malware, or harmful content. Do not attempt to disrupt the site or its services.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          All content, branding, and materials on {config.name} are owned by or licensed to us. You may
          not reproduce, distribute, or create derivative works without our prior written permission.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {config.name} and its owners, contributors, and
          affiliates shall not be liable for any damages arising from your use of the site or reliance
          on its content, including but not limited to veterinary decisions made based on the information
          provided.
        </p>

        <h2>8. Changes to These Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use of the site after changes
          constitutes acceptance of the updated terms.
        </p>

        <h2>9. Contact</h2>
        <p>
          If you have questions about these Terms, contact us at{" "}
          <a href={`mailto:${config.contact_email}`}>{config.contact_email}</a>.
        </p>
      </section>
    </div>
  );
}
