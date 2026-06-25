import React from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sparkles, GripVertical, Trash } from 'lucide-react';
import { FormField } from '../../types/shared';

interface FieldWrapperProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  renderContent: () => React.ReactNode;
}

function SortableFieldWrapper({ field, isSelected, onSelect, onDelete, renderContent }: FieldWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 'auto' as any,
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative p-5 bg-surface-900 border rounded-xl shadow-sm transition-all select-none cursor-pointer ${
        isSelected
          ? 'border-brand-500/60 ring-2 ring-brand-500/10 shadow-brand-sm'
          : 'border-surface-800 hover:border-surface-700'
      }`}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          {...listeners}
          {...attributes}
          className="p-1.5 hover:bg-surface-800 text-surface-500 hover:text-white rounded-lg cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-surface-800 text-surface-500 hover:text-red-400 rounded-lg cursor-pointer"
          title="Delete field"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="pr-16 pointer-events-none">
        {renderContent()}
      </div>

      <div className="absolute left-3 bottom-2 text-[9px] text-surface-700 font-mono">
        {field.type} · {field.properties.width}%
      </div>
    </div>
  );
}

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  removeField: (id: string, e: React.MouseEvent) => void;
  sensors: any;
  handleDragEnd: (event: DragEndEvent) => void;
  deviceView?: 'desktop' | 'mobile';
}

export function FormCanvas({
  fields,
  selectedFieldId,
  setSelectedFieldId,
  removeField,
  sensors,
  handleDragEnd,
  deviceView = 'desktop'
}: FormCanvasProps) {

  const renderCanvasFieldPreview = (field: FormField) => {
    const props = field.properties;
    switch (field.type) {
      case 'heading':
        const HeaderTag = `h${props.level || 2}` as any;
        return (
          <div className="py-1">
            <HeaderTag className="text-white font-extrabold tracking-tight" style={{
              fontSize: props.level === '1' ? '1.875rem' : props.level === '2' ? '1.5rem' : props.level === '3' ? '1.25rem' : '1.125rem'
            }}>
              {props.label}
            </HeaderTag>
          </div>
        );
      case 'divider':
        return <div className="border-t border-surface-700 my-2" />;
      case 'markdown':
        return (
          <div className="text-xs text-surface-400 font-mono bg-surface-950 p-2.5 rounded-lg border border-surface-700 whitespace-pre-wrap">
            {props.content || 'Markdown Content...'}
          </div>
        );
      case 'richtext':
        return (
          <div className="p-3 bg-surface-950 rounded-lg border border-surface-700 text-surface-400 text-xs italic">
            [Rich Text Block Preview]
          </div>
        );
      default:
        return (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm font-semibold text-surface-100">{props.label || 'Field Label'}</span>
              {props.required && <span className="text-brand-400 text-xs font-bold">*</span>}
            </div>
            {props.description && <p className="text-xs text-surface-400 mb-2">{props.description}</p>}
            <input
              type="text"
              disabled
              placeholder={props.placeholder || 'Enter value...'}
              className="w-full bg-surface-950 border border-surface-700 text-surface-400 rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
            {props.helpText && <span className="text-[10px] text-surface-500 mt-1 block">{props.helpText}</span>}
          </div>
        );
    }
  };

  const isMobileView = deviceView === 'mobile';

  return (
    <main className="flex-1 bg-[#09090b] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
        <div className={isMobileView ? "max-w-[375px] w-full border-[10px] border-zinc-800 rounded-[36px] bg-zinc-950 px-4 py-8 shadow-2xl relative min-h-[667px] transition-all duration-300 mx-auto" : "max-w-2xl w-full transition-all duration-300 mx-auto"}>
          {isMobileView && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-zinc-900 rounded-full mr-2" />
              <span className="w-8 h-1 bg-zinc-900 rounded-full" />
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {fields.length === 0 ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-surface-800 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-brand-400 animate-glow-pulse" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Your canvas is empty</h4>
                  <p className="text-xs text-surface-500 max-w-xs">
                    Select field types from the left panel to start building your form.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <SortableFieldWrapper
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => setSelectedFieldId(field.id)}
                      onDelete={(e) => removeField(field.id, e)}
                      renderContent={() => renderCanvasFieldPreview(field)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </main>
  );
}
