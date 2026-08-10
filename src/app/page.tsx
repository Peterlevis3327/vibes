

import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHomePageData, getServices, getPortfolioProjects, getFaqs } from "@/lib/firebase/db";

export const metadata: Metadata = {
  title: "Agency. | Digital Product Studio",
  description: "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
};

export default async function HomePage() {
  const [data, services, portfolio, faqs] = await Promise.all([
    getHomePageData(),
    getServices(),
    getPortfolioProjects(),
    getFaqs()
  ]);
  
  return <HomeClient data={data} services={services} portfolio={portfolio} faqs={faqs} />;
}
