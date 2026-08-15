import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Briefcase, Users } from "lucide-react";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

async function getDashboardStats() {
  try {
    const adminApp = getFirebaseAdmin();
    const db = adminApp.firestore();
    
    // Run all count queries in parallel for performance
    const [pagesCount, portfolioCount, postsCount, teamCount] = await Promise.all([
      db.collection('pages').count().get().then(snap => snap.data().count),
      db.collection('portfolio').count().get().then(snap => snap.data().count),
      db.collection('posts').count().get().then(snap => snap.data().count),
      db.collection('team').count().get().then(snap => snap.data().count),
    ]);

    return {
      pages: pagesCount,
      portfolio: portfolioCount,
      posts: postsCount,
      team: teamCount,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      pages: 0,
      portfolio: 0,
      posts: 0,
      team: 0,
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
            <p className="text-xs text-muted-foreground">Published pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portfolio}</div>
            <p className="text-xs text-muted-foreground">Active case studies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.team}</div>
            <p className="text-xs text-muted-foreground">Active personnel</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
