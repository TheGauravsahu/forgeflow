import React from 'react';
import { Mail, Save, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileDetailsProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  successMsg: string;
  errorMsg: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileDetails({
  name,
  setName,
  email,
  setEmail,
  successMsg,
  errorMsg,
  isLoading,
  onSubmit,
}: ProfileDetailsProps) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
      <CardHeader className="p-6">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Personal Information
        </CardTitle>
        <p className="text-xs text-zinc-500">Update your account email address and display name.</p>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-xs font-semibold text-zinc-300">Display Name</Label>
            <Input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-xs font-semibold text-zinc-300">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="pl-10 bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            id="btn-update-profile"
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </div>
            )}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
