import { MetadataRoute } from 'next'
import { getPortfolioProjects, getPosts } from '@/lib/firebase/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const projects = await getPortfolioProjects()
  const posts = await getPosts()

  const parseDate = (val: any) => {
    if (!val) return new Date()
    if (typeof val.toDate === 'function') return val.toDate()
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date() : d
  }

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.id}`,
    lastModified: parseDate(project.updatedAt),
  }))

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: parseDate(post.updatedAt),
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
