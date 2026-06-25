import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FORM_TEMPLATES } from '../../lib/templates';
import {
  Share2,
  Check,
  Code,
  Edit,
  FolderInput,
  FileText,
  LayoutGrid,
  Sparkles,
  FolderPlus,
  Trash2,
  Plus,
} from 'lucide-react';

interface DashboardDialogsProps {
  // Share
  shareForm: any;
  setShareForm: (form: any) => void;
  copiedFormId: string | null;
  handleCopyLink: (id: string) => void;
  copiedEmbedId: string | null;
  handleCopyEmbedCode: (id: string) => void;

  // Rename
  renameForm: any;
  setRenameForm: (form: any) => void;
  renameTitle: string;
  setRenameTitle: (title: string) => void;
  handleRenameFormSubmit: (e: React.FormEvent) => void;
  isRenameLoading: boolean;

  // Move
  moveForm: any;
  setMoveForm: (form: any) => void;
  moveTargetFolderId: string | null;
  setMoveTargetFolderId: (id: string | null) => void;
  folders: any[];
  handleMoveFormSubmit: (e: React.FormEvent) => void;
  isMoveLoading: boolean;

  // Create Form
  isCreateFormOpen: boolean;
  setIsCreateFormOpen: (open: boolean) => void;
  creationTab: 'template' | 'ai';
  setCreationTab: (tab: 'template' | 'ai') => void;
  newFormTitle: string;
  setNewFormTitle: (title: string) => void;
  newFormDesc: string;
  setNewFormDesc: (desc: string) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isGeneratingAI: boolean;
  aiError: string | null;
  handleCreateForm: (e: React.FormEvent) => void;
  handleCreateFormAI: (e: React.FormEvent) => void;
  isCreateFormLoading: boolean;

  // Create Folder
  isCreateFolderOpen: boolean;
  setIsCreateFolderOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: (e: React.FormEvent) => void;
  isCreateFolderLoading: boolean;

  // Delete Form
  formToDeleteId: string | null;
  setFormToDeleteId: (id: string | null) => void;
  handleDeleteFormConfirm: () => void;
  isDeleteFormLoading: boolean;

  // Delete Folder
  folderToDeleteId: string | null;
  setFolderToDeleteId: (id: string | null) => void;
  handleDeleteFolderConfirm: () => void;
  isDeleteFolderLoading: boolean;
}

export function DashboardDialogs({
  shareForm,
  setShareForm,
  copiedFormId,
  handleCopyLink,
  copiedEmbedId,
  handleCopyEmbedCode,
  renameForm,
  setRenameForm,
  renameTitle,
  setRenameTitle,
  handleRenameFormSubmit,
  isRenameLoading,
  moveForm,
  setMoveForm,
  moveTargetFolderId,
  setMoveTargetFolderId,
  folders,
  handleMoveFormSubmit,
  isMoveLoading,
  isCreateFormOpen,
  setIsCreateFormOpen,
  creationTab,
  setCreationTab,
  newFormTitle,
  setNewFormTitle,
  newFormDesc,
  setNewFormDesc,
  selectedTemplateId,
  setSelectedTemplateId,
  aiPrompt,
  setAiPrompt,
  isGeneratingAI,
  aiError,
  handleCreateForm,
  handleCreateFormAI,
  isCreateFormLoading,
  isCreateFolderOpen,
  setIsCreateFolderOpen,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  isCreateFolderLoading,
  formToDeleteId,
  setFormToDeleteId,
  handleDeleteFormConfirm,
  isDeleteFormLoading,
  folderToDeleteId,
  setFolderToDeleteId,
  handleDeleteFolderConfirm,
  isDeleteFolderLoading,
}: DashboardDialogsProps) {
  return (
    <>
      {/* SHARE & EMBED DIALOG */}
      <Dialog open={!!shareForm} onOpenChange={(open) => !open && setShareForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Share & Embed Form</DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">Integrate this form directly on your website or share it with users.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {shareForm && (
            <div className="space-y-5 py-2 text-sm text-zinc-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">Direct Link</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    type="text"
                    value={`${window.location.origin}/form/${shareForm.id}`}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none select-all"
                  />
                  <Button
                    onClick={() => handleCopyLink(shareForm.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-xs px-4"
                  >
                    {copiedFormId === shareForm.id ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                  <Code className="w-3.5 h-3.5" />
                  Iframe Embed Code
                </label>
                <div className="flex flex-col gap-2">
                  <textarea
                    readOnly
                    rows={3}
                    value={`<iframe src="${window.location.origin}/form/${shareForm.id}" style="width:100%; height:600px; border:none; border-radius:8px;" allow="geolocation; microphone; camera"></iframe>`}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 focus:outline-none select-all resize-none leading-relaxed"
                  />
                  <Button
                    onClick={() => handleCopyEmbedCode(shareForm.id)}
                    className="self-end bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-xs px-4 cursor-pointer"
                  >
                    {copiedEmbedId === shareForm.id ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : 'Copy Embed Code'}
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2 border-t border-zinc-800/80 pt-4 flex flex-col items-center">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block self-start">Form QR Code</label>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/form/${shareForm.id}`)}`}
                    alt="Form QR Code"
                    className="w-[150px] h-[150px] block"
                  />
                </div>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/form/${shareForm.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-500 hover:text-amber-400 hover:underline mt-1 font-medium"
                >
                  Download / Open High-Res QR Code
                </a>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-zinc-800">
            <Button
              type="button"
              onClick={() => setShareForm(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RENAME FORM DIALOG */}
      <Dialog open={!!renameForm} onOpenChange={(open) => !open && setRenameForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Edit className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Rename Form</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleRenameFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                New Title
              </label>
              <input
                type="text"
                required
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>
            <DialogFooter className="pt-2 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setRenameForm(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRenameLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MOVE FORM DIALOG */}
      <Dialog open={!!moveForm} onOpenChange={(open) => !open && setMoveForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FolderInput className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Move Form</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleMoveFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Select Destination Folder
              </label>
              <select
                value={moveTargetFolderId || 'root'}
                onChange={(e) => setMoveTargetFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all cursor-pointer"
              >
                <option value="root">Root Folder (No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setMoveForm(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isMoveLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                Move
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE FORM DIALOG */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Create New Form</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex border-b border-zinc-800/80 mb-2">
            <button
              type="button"
              onClick={() => setCreationTab('template')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${
                creationTab === 'template'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Template Gallery
            </button>
            <button
              type="button"
              onClick={() => setCreationTab('ai')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${
                creationTab === 'ai'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Prompt Creator ✨
            </button>
          </div>

          {creationTab === 'template' ? (
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                    Form Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="input-form-title"
                    type="text"
                    required
                    placeholder="e.g. Feedback Survey"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                    Description
                  </label>
                  <input
                    id="input-form-desc"
                    placeholder="Brief purpose of this form…"
                    value={newFormDesc}
                    onChange={(e) => setNewFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-655 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                  Choose Form Layout / Template
                </label>
                <ScrollArea className="h-64 pr-2">
                  <div className="grid grid-cols-2 gap-2.5 p-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId('blank')}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplateId === 'blank'
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-white">Start from Scratch</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5 leading-tight">Blank Canvas</span>
                      </div>
                    </button>
                    {FORM_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          if (!newFormTitle.trim() || newFormTitle === 'Blank Form') {
                            setNewFormTitle(t.title);
                          }
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedTemplateId === t.id
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-white">{t.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 truncate leading-tight">{t.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="pt-2 gap-2 flex-row justify-end border-t border-zinc-800/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-form"
                  type="submit"
                  disabled={isCreateFormLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
                >
                  {isCreateFormLoading ? 'Creating…' : 'Create Form'}
                </button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleCreateFormAI} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                  Describe what you want to build
                </label>
                <textarea
                  id="textarea-ai-prompt"
                  rows={4}
                  required
                  placeholder="e.g. A customer satisfaction survey with rating, feedback, and user details..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Suggestions</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Customer Satisfaction Survey',
                    'Event Registration Form',
                    'Job Application Form',
                    'Newsletter Signup'
                  ].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAiPrompt(`Create a ${p.toLowerCase()}`)}
                      className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-805 hover:border-zinc-700 text-zinc-400 hover:text-zinc-205 text-xs rounded-lg transition-all cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {aiError}
                </div>
              )}

              <DialogFooter className="pt-2 gap-2 flex-row justify-end border-t border-zinc-800/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAI || isCreateFormLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isGeneratingAI ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full"></span>
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                      Generate & Create Form
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE FOLDER DIALOG */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">New Folder</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Folder Name <span className="text-amber-500">*</span>
              </label>
              <input
                id="input-folder-name"
                type="text"
                required
                placeholder="e.g. Feedback Forms"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>

            <DialogFooter className="pt-1 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-create-folder"
                type="submit"
                disabled={isCreateFolderLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                {isCreateFolderLoading ? 'Creating…' : 'Create Folder'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE FORM CONFIRMATION DIALOG */}
      <Dialog open={!!formToDeleteId} onOpenChange={(open) => !open && setFormToDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Delete Form</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete this form? This action cannot be undone and will delete all gathered submissions.
            </p>
          </div>
          <DialogFooter className="pt-2 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFormToDeleteId(null)}
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleteFormLoading}
              onClick={handleDeleteFormConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0 cursor-pointer"
            >
              {isDeleteFormLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE FOLDER CONFIRMATION DIALOG */}
      <Dialog open={!!folderToDeleteId} onOpenChange={(open) => !open && setFolderToDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Delete Folder</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete this folder? Forms inside this folder will remain but will be moved to the root list.
            </p>
          </div>
          <DialogFooter className="pt-2 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFolderToDeleteId(null)}
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleteFolderLoading}
              onClick={handleDeleteFolderConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0 cursor-pointer"
            >
              {isDeleteFolderLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
