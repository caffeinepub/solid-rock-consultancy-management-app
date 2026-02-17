import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <img
            src="/assets/generated/solid-rock-logo-transparent.dim_200x200.png"
            alt="Solid Rock Logo"
            className="mx-auto h-24 w-24"
          />
          <h1 className="text-4xl font-bold tracking-tight">Solid Rock</h1>
          <p className="text-xl text-muted-foreground">Consultancy Management</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Welcome</h2>
              <p className="text-sm text-muted-foreground">
                Manage your consultancy business with ease. Track clients, proposals, and tasks all in one place.
              </p>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <img
            src="/assets/generated/team-hero.dim_800x400.jpg"
            alt="Team collaboration"
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
