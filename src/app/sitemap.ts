import { MetadataRoute } from 'next'
import { getPortfolioProjects, getPosts } from '@/lib/firebase/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const projects = await getPortfolioProjects()
  const posts = await getPosts()

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.id}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
  }))

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/portfolio`, lastModified: new Date() },
    { url: `${baseUrl}/posts`, lastModified: new Date() },
    { url: `${baseUrl}/process`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    ...projectUrls,
    ...postUrls,
  ]
}
