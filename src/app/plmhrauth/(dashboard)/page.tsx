import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Briefcase, Users } from "lucide-react";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

async function getDashboardStats() {
  try {
    const adminApp = getFirebaseAdmin();
    const db = adminApp.firestore();
    
    // Run count queries in parallel
    const [
      pagesCount,
      totalPortfolioCount,
      activePortfolioCount,
      totalPostsCount,
      publishedPostsCount,
      totalTeamCount,
      activeTeamCount
    ] = await Promise.all([
      db.collection('pages').count().get().then(snap => snap.data().count),
      db.collection('portfolio').count().get().then(snap => snap.data().count),
      db.collection('portfolio').where("status", "==", "Published").count().get().then(snap => snap.data().count),
      db.collection('posts').count().get().then(snap => snap.data().count),
      db.collection('posts').where("status", "==", "Published").count().get().then(snap => snap.data().count),
      db.collection('team').count().get().then(snap => snap.data().count),
      db.collection('team').where("status", "==", "Published").count().get().then(snap => snap.data().count),
    ]);

    return {
      pages: pagesCount,
      portfolio: { total: totalPortfolioCount, active: activePortfolioCount },
      posts: { total: totalPostsCount, published: publishedPostsCount },
      team: { total: totalTeamCount, active: activeTeamCount },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      pages: 0,
      portfolio: { total: 0, active: 0 },
      posts: { total: 0, published: 0 },
      team: { total: 0, active: 0 },
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your agency's content and metrics.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pages}</div>
            <p className="text-xs text-muted-foreground">Total static pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portfolio.total}</div>
            <p className="text-xs text-muted-foreground">{stats.portfolio.active} active case studies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts.total}</div>
            <p className="text-xs text-muted-foreground">{stats.posts.published} published articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.team.total}</div>
            <p className="text-xs text-muted-foreground">{stats.team.active} active personnel</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
