"use client";

import { useState, useEffect } from "react";
import { multiFactor, TotpMultiFactorGenerator, TotpSecret, MultiFactorInfo } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [enrolledFactors, setEnrolledFactors] = useState<MultiFactorInfo[]>([]);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check current MFA status
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEnrolledFactors(multiFactor(user).enrolledFactors);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartEnrollment = async () => {
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const multiFactorSession = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      setTotpSecret(secret);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start 2FA enrollment. Have you enabled Identity Platform?");
    }
  };

  const handleVerifyEnrollment = async () => {
    if (!totpSecret) return;
    setEnrolling(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode
      );

      await multiFactor(user).enroll(multiFactorAssertion, "Authenticator App");
      setEnrolledFactors(multiFactor(user).enrolledFactors);
      setTotpSecret(null);
      setVerificationCode("");
      setSuccess("Two-Factor Authentication successfully enabled!");
    } catch (err: any) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (uid: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      
      await multiFactor(user).unenroll(uid);
      setEnrolledFactors(multiFactor(user).enrolledFactors);
      setSuccess("Two-Factor Authentication successfully disabled.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to disable 2FA.");
    }
  };

  if (loading) return null;

  return (
    <Card className="mt-8 border-destructive/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          {enrolledFactors.length > 0 ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          )}
          <CardTitle>Security Settings</CardTitle>
        </div>
        <CardDescription>
          Manage Two-Factor Authentication (2FA) for your admin account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm rounded-md flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                {enrolledFactors.length > 0 
                  ? "2FA is currently enabled for this account." 
                  : "Protect your account with a TOTP authenticator app."}
              </p>
            </div>
            
            {enrolledFactors.length > 0 ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleUnenroll(enrolledFactors[0].uid)}
              >
                Disable 2FA
              </Button>
            ) : !totpSecret && (
              <Button onClick={handleStartEnrollment} size="sm">
                Enable 2FA
              </Button>
            )}
          </div>

          {totpSecret && (
            <div className="p-6 border rounded-lg bg-muted/30 space-y-6 mt-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Scan this QR Code</h4>
                <p className="text-sm text-muted-foreground">
                  Open your authenticator app (e.g., Google Authenticator, Authy) and scan this QR code, or enter the secret key manually.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-white p-4 rounded-md">
                  <QRCodeSVG 
                    value={totpSecret.generateQrCodeUrl(
                      auth.currentUser?.email || "Admin", 
                      "Tech254 CMS"
                    )} 
                    size={150} 
                  />
                </div>
                
                <div className="space-y-4 flex-1 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Secret Key</Label>
                    <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                      {totpSecret.secretKey}
                    </code>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <h4 className="font-medium">2. Enter Verification Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code generated by your app.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="123456" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="max-w-[150px]"
                      />
                      <Button 
                        onClick={handleVerifyEnrollment} 
                        disabled={verificationCode.length !== 6 || enrolling}
                      >
                        {enrolling ? "Verifying..." : "Verify & Enable"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setTotpSecret(null);
                    setVerificationCode("");
                    setError("");
                  }}
                >
                  Cancel Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
