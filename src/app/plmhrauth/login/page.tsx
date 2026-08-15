"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, auth } from "@/lib/firebase/client";
import { multiFactor, TotpMultiFactorGenerator, getMultiFactorResolver, MultiFactorResolver } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // MFA State
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [totpCode, setTotpCode] = useState("");
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await finishSignIn(userCredential.user);
    } catch (err: any) {
      if (err.code === "auth/multi-factor-auth-required") {
        setResolver(getMultiFactorResolver(auth, err));
      } else {
        setError(err.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolver) return;
    setError("");
    setLoading(true);

    try {
      const totpAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        resolver.hints[0].uid,
        totpCode
      );
      const userCredential = await resolver.resolveSignIn(totpAssertion);
      await finishSignIn(userCredential.user);
    } catch (err: any) {
      setError("Invalid 2FA code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finishSignIn = async (user: any) => {
    // Wait for the server action to set the secure cookie BEFORE we navigate
    const idToken = await user.getIdToken();
    const { createSession } = await import("@/app/actions/auth");
    const result = await createSession(idToken);
    
    if (!result.success) {
      throw new Error(result.error || "Failed to create secure session");
    }
    
    router.push("/plmhrauth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {resolver ? "Two-Factor Authentication" : "Admin Login"}
          </CardTitle>
          <CardDescription>
            {resolver 
              ? "Enter the 6-digit code from your authenticator app" 
              : "Enter your credentials to access the CMS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resolver ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@tech254.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              {error && (
                <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp">Authentication Code</Label>
                <Input 
                  id="totp" 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="123456" 
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  required 
                  maxLength={6}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || totpCode.length !== 6}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full mt-2" 
                onClick={() => {
                  setResolver(null);
                  setTotpCode("");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
