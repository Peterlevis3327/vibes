import Image from "next/image";
export const revalidate = 60;

import { Metadata } from "next";
import { Users, Target, Zap, Globe } from "lucide-react";
import { getTeamMembers } from "@/lib/firebase/db";

export const metadata: Metadata = {
  title: "About Us | Agency.",
  description: "Learn about our mission, our team, and our commitment to building exceptional digital products.",
};

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <div className="flex flex-col w-full">
      <section className="px-4 md:px-8 py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">About Agency.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are a collective of designers, engineers, and strategists dedicated to building digital products that matter.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that great software shouldn't just look good—it should solve real business problems and deliver measurable results. Too many agencies focus on the superficial. We focus on the fundamental.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2024, our team brings together decades of combined experience across design, development, and product strategy to help ambitious companies scale.
              </p>
            </div>
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                <span>Office/Team Image</span>
              </div>
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
              {team.map((member: any) => (
                <div key={member.id} className="group">
                  <div className="aspect-[4/5] bg-background/10 rounded-2xl mb-6 overflow-hidden relative">
                     {member.photo?.url ? (
                       <Image src={member.photo.url} alt={member.photo.alt || member.name} fill className="object-cover" />
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-background/30">
                        <span>Portrait</span>
                      </div>
                     )}
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-background/70 text-sm leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
