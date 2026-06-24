import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  LayoutGrid,
  Archive,
  FolderPlus,
  FolderOpen,
  Trash2,
  Plus,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { useThemeStore } from '@/store/useThemeStore';

interface DashboardSidebarProps {
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  foldersQuery: any;
  formsQuery: any;
  setIsCreateFolderOpen: (open: boolean) => void;
  setFolderToDeleteId: (id: string | null) => void;
  userInitials: string;
  userName: string;
  handleLogout: () => void;
  navigate: (path: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

export function DashboardSidebar({
  selectedFolderId,
  setSelectedFolderId,
  showArchived,
  setShowArchived,
  foldersQuery,
  formsQuery,
  setIsCreateFolderOpen,
  setFolderToDeleteId,
  userInitials,
  userName,
  handleLogout,
  navigate,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: DashboardSidebarProps) {
  
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  // Reusable Sidebar content
  const renderSidebarContent = (isMobile: boolean = false) => {
    const handleFolderClick = (id: string) => {
      setSelectedFolderId(id);
      setShowArchived(false);
      if (isMobile) setIsMobileSidebarOpen(false);
    };

    const handleAllFormsClick = () => {
      setSelectedFolderId(null);
      setShowArchived(false);
      if (isMobile) setIsMobileSidebarOpen(false);
    };

    const handleArchivedClick = () => {
      setSelectedFolderId(null);
      setShowArchived(true);
      if (isMobile) setIsMobileSidebarOpen(false);
    };

    return (
      <>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <AppLogo className="w-4 h-4 text-zinc-900" size={16} />
            </div>
            <span className="font-black text-base text-white tracking-tight">ForgeFlow</span>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-zinc-500 hover:text-white cursor-pointer border-0 bg-transparent"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Nav Items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-0.5 mb-6">
            <button
              onClick={handleAllFormsClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFolderId === null && !showArchived
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4 flex-shrink-0" />
              <span>All Forms</span>
              {selectedFolderId === null && !showArchived && (
                <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                  {formsQuery.data?.length ?? 0}
                </span>
              )}
            </button>

            <button
              onClick={handleArchivedClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showArchived
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <Archive className="w-4 h-4 flex-shrink-0" />
              <span>Archived</span>
            </button>
          </div>

          <Separator className="bg-zinc-800/60 mb-4" />

          {/* Folders Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Folders</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateFolderOpen(true);
                  if (isMobile) setIsMobileSidebarOpen(false);
                }}
                className="text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {foldersQuery.isLoading ? (
              <div className="px-3 py-2 text-xs text-zinc-600 animate-pulse">Loading folders…</div>
            ) : foldersQuery.data?.length === 0 ? (
              <div className="px-3 py-3 text-xs text-zinc-600 italic text-center border border-dashed border-zinc-800 rounded-lg">
                No folders yet
              </div>
            ) : (
              foldersQuery.data?.map((folder: any) => (
                <div
                  key={folder.id}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFolderId === folder.id && !showArchived
                      ? 'bg-amber-500/12 text-amber-300 border border-amber-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <button
                    onClick={() => handleFolderClick(folder.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer border-0 bg-transparent text-inherit p-0"
                  >
                    <FolderOpen className={`w-4 h-4 flex-shrink-0 ${selectedFolderId === folder.id && !showArchived ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      {folder._count.forms}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDeleteId(folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 ml-1 text-zinc-600 hover:text-red-400 rounded transition-all cursor-pointer border-0 bg-transparent"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create Folder CTA */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateFolderOpen(true);
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 border border-dashed border-zinc-800 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </Button>
          </div>
        </ScrollArea>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-800/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group cursor-pointer text-left outline-none border-0 bg-transparent">
                <Avatar className="w-8 h-8 border border-amber-500/30">
                  <AvatarFallback className="bg-amber-500/15 text-amber-400 text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
                  <p className="text-[10px] text-zinc-600 truncate">Creator</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl p-1 shadow-2xl" align="end" side="top">
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors focus:bg-zinc-800 focus:text-white outline-none"
              >
                <User className="w-4 h-4 text-zinc-500" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors focus:bg-zinc-800 focus:text-white outline-none"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-400 outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  };



  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex w-[240px] flex-shrink-0 flex flex-col theme-sidebar-${activeTheme.sidebarStyle} border-r border-zinc-800/60`}>
        {renderSidebarContent(false)}
      </aside>

      {/* MOBILE SIDEBAR (DRAWER) */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[240px] z-50 flex flex-col md:hidden transition-transform duration-300 theme-sidebar-${activeTheme.sidebarStyle} border-r border-zinc-800/60 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
}
