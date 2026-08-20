

import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHomePageData, getServices, getPortfolioProjects, getFaqs } from "@/lib/firebase/db";
import { getCloudinaryBlurDataUrl } from "@/lib/cloudinary-blur";

export const metadata: Metadata = {
  title: "Tech254 | Digital Product Studio",
  description: "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
};

export default async function HomePage() {
  const [data, services, portfolio, faqs] = await Promise.all([
    getHomePageData(),
    getServices(),
    getPortfolioProjects(),
    getFaqs()
  ]);

  // Enrich services with blur placeholders
  const enrichedServices = await Promise.all(
    services.map(async (service: any) => {
      if (service.screenshotImage?.url) {
        service.screenshotImage.blurDataURL = await getCloudinaryBlurDataUrl(service.screenshotImage.url);
      }
      return service;
    })
  );

  // Enrich portfolio with blur placeholders
  const enrichedPortfolio = await Promise.all(
    portfolio.map(async (project: any) => {
      const imgSrc = project.thumbnailImage?.url || project.coverImage?.url || project.images?.[0]?.url;
      if (imgSrc) {
        project.blurDataURL = await getCloudinaryBlurDataUrl(imgSrc);
      }
      return project;
    })
  );
  
  return <HomeClient data={data} services={enrichedServices} portfolio={enrichedPortfolio} faqs={faqs} />;
}
