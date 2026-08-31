import Image from "next/image";
import { Metadata } from "next";
import { Globe } from "lucide-react";
import { getTeamMembers, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "About Us | Tech254",
  description: "Learn about our mission, our team, and our commitment to building exceptional digital products.",
};

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.764 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

export default async function AboutPage() {
  const [team, pageData] = await Promise.all([
    getTeamMembers(),
    getPageData("about")
  ]);

  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title={pageData?.title ?? null}
        subtitle={pageData?.subtitle ?? undefined}
        backgroundImage={pageData?.headerBackgroundImage}
        backgroundImageVisibility={pageData?.backgroundImageVisibility}
        titleColor={pageData?.titleColor}
        titleX={pageData?.titleX}
        titleY={pageData?.titleY}
        subtitleColor={pageData?.subtitleColor}
        subtitleX={pageData?.subtitleX}
        subtitleY={pageData?.subtitleY}
      />

      <section className="px-4 md:px-8 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{pageData?.missionTitle || "Our Mission"}</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {pageData?.missionText1 || "We believe that great software shouldn't just look good—it should solve real business problems and deliver measurable results. Too many agencies focus on the superficial. We focus on the fundamental."}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pageData?.missionText2 || "Founded in 2024, our team brings together decades of combined experience across design, development, and product strategy to help ambitious companies scale."}
              </p>
            </div>
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden relative">
              <Image 
                src={pageData?.missionImage?.url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"} 
                alt={pageData?.missionImage?.alt || "Our creative team collaborating in a modern office space"} 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-24 bg-foreground text-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">The Team</h2>
          {team.length === 0 ? (
            <div className="text-center py-20 border border-background/20 rounded-3xl bg-background/5">
              <h3 className="text-xl font-medium mb-2">Team profiles coming soon</h3>
              <p className="text-background/70">We are currently updating our team directory.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {team.map((member: any) => {
                const linkedin = member.socialLinks?.linkedin?.trim();
                const github = member.socialLinks?.github?.trim() || member.socialLinks?.twitter?.trim();
                const portfolioUrl = member.socialLinks?.portfolioUrl?.trim();
                const hasLinks = linkedin || github || portfolioUrl;

                return (
                  <div key={member.id} className="group">
                    <div className="aspect-[4/5] bg-background/10 rounded-2xl mb-6 overflow-hidden relative">
                      {member.avatar?.url ? (
                        <Image src={member.avatar.url} alt={member.avatar.alt || member.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-background/30">
                          <span>Portrait</span>
                        </div>
                      )}
                    </div>
                    {member.avatar?.showCaption && member.avatar?.caption && (
                      <p className="text-sm text-muted-foreground mt-2 italic text-center mb-4">
                        {member.avatar.caption}
                      </p>
                    )}
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="font-medium mb-3" style={{ color: member.roleColor || 'hsl(var(--primary))' }}>{member.role}</p>
                    <p className="text-background/70 text-sm leading-relaxed mb-4">{member.bio}</p>

                    {/* Social & Portfolio Links */}
                    {hasLinks && (
                      <div className="flex items-center gap-4 pt-3 border-t border-background/10">
                        {linkedin && (
                          <a
                            href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on LinkedIn`}
                            title="LinkedIn"
                            className="text-background/50 hover:text-background transition-colors"
                          >
                            <LinkedinIcon className="h-4 w-4" />
                          </a>
                        )}
                        {github && (
                          <a
                            href={github.startsWith("http") ? github : `https://${github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on GitHub / Analytics`}
                            title="GitHub"
                            className="text-background/50 hover:text-background transition-colors"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                        )}
                        {portfolioUrl && (
                          <a
                            href={portfolioUrl.startsWith("http") ? portfolioUrl : `https://${portfolioUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name}'s portfolio or website`}
                            title="Portfolio / Website"
                            className="text-background/50 hover:text-background transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
