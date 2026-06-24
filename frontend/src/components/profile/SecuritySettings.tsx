import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  const toast = useToastStore();

  const updatePasswordMutation = api.auth.update.useMutation({
    onSuccess: () => {
      toast.success('Your account password has been updated.', 'Password Changed');
      setSecuritySuccess('Password updated successfully!');
      setSecurityError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update password.', 'Password Change Failed');
      setSecurityError(err.message || 'Failed to update password.');
      setSecuritySuccess('');
    }
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }
    await updatePasswordMutation.mutateAsync({
      currentPassword,
      newPassword
    });
  };

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl h-fit p-4">
      <CardHeader>
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Change Password
        </CardTitle>
        <p className="text-xs text-zinc-500">Ensure your workspace credentials remain secure by changing your password periodically.</p>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-300">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-300">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-300">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {/* Feedback Messages */}
          {securitySuccess && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{securitySuccess}</span>
            </div>
          )}

          {securityError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{securityError}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={updatePasswordMutation.isLoading}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all"
          >
            {updatePasswordMutation.isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
