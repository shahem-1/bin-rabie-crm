"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  User,
  DollarSign,
  Calendar,
  Clock,
  MessageSquare,
  ListChecks,
  Settings,
  Trash2,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  GripVertical,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { customers, companyName, stageLabels, sources, type Customer, type Stage } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const KANBAN_STAGES: Stage[] = ["lead", "qualified", "proposal", "won", "lost"];

const stageConfig = {
  lead: { color: "slate", label: { ar: "جديد", en: "Lead" }, probability: 10 },
  qualified: { color: "blue", label: { ar: "مؤهل", en: "Qualified" }, probability: 30 },
  proposal: { color: "violet", label: { ar: "عرض سعر", en: "Proposal" }, probability: 60 },
  won: { color: "emerald", label: { ar: "رابح", en: "Won" }, probability: 100 },
  lost: { color: "red", label: { ar: "خاسر", en: "Lost" }, probability: 0 },
} as const;

const stageColorClasses: Record<string, string> = {
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

interface DealCardProps {
  customer: Customer;
  isDragging: boolean;
  onEdit: () => void;
  onConversation: () => void;
  onTask: () => void;
  onView: () => void;
  onDelete: () => void;
}

function DealCard({ customer, onEdit, onConversation, onTask, onView, onDelete }: DealCardProps) {
  const { lang } = useStore();
  const stage = stageConfig[customer.stage];
  const source = sources.find((s) => s.key === customer.source);
  const daysInStage = Math.floor(Math.random() * 30) + 1;
  const expectedClose = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: sortableIsDragging,
    transform,
    transition,
  } = useSortable({ id: customer.id, data: { stage: customer.stage } });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transition || "transform 200ms ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative bg-white rounded-xl border p-4 shadow-sm transition-all duration-200",
        "hover:shadow-lg hover:border-brand/30",
        sortableIsDragging && "opacity-50 rotate-1 shadow-xl ring-2 ring-brand",
        "group"
      )}
    >
      {/* Drag handle */}
      <button
        onMouseDown={(e) => { e.stopPropagation(); }}
        className="absolute -start-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition p-1 cursor-grab"
        aria-label={tx(lang, d.drag || { ar: "سحب", en: "Drag" })}
      >
        <GripVertical size={18} />
      </button>

      {/* Quick actions menu */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{lang === "ar" ? customer.nameAr : customer.nameEn}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className={cn("px-1.5 py-0.5 rounded", stageColorClasses[stage.color])}>
              {tx(lang, stage.label)}
            </span>
            {source && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: source.color }} />
                {tx(lang, source)}
              </span>
            )}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="btn-interactive p-1.5 rounded hover:bg-slate-100"
            aria-label={tx(lang, d.viewAll)}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-brand">
          {customer.value.toLocaleString("en-US")}
          <span className="text-sm font-normal text-muted ml-1">{tx(lang, d.currency)}</span>
        </div>
        <div className="text-xs text-muted flex items-center gap-1">
          <DollarSign size={12} />
          {stage.probability}%
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-3 space-y-2 text-xs text-muted">
        <div className="flex items-center gap-2">
          <User size={12} />
          <span className="truncate">{companyName(customer.companyId, lang)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={12} />
          <span>{tx(lang, d.scheduledFor || { ar: "موعد", en: "Expected" })}: {expectedClose}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} />
          <span>{daysInStage} {tx(lang, d.days || { ar: "أيام", en: "days" })}</span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-line">
        <button
          onClick={(e) => { e.stopPropagation(); onConversation(); }}
          className="btn-interactive flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-line text-xs font-medium hover:bg-blue-50 text-blue-600"
        >
          <MessageSquare size={12} />
          {tx(lang, d.newConversation || { ar: "محادثة", en: "Chat" })}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTask(); }}
          className="btn-interactive flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-line text-xs font-medium hover:bg-amber-50 text-amber-600"
        >
          <ListChecks size={12} />
          {tx(lang, d.newTask || { ar: "مهمة", en: "Task" })}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="btn-interactive p-1.5 rounded-lg border border-line hover:bg-slate-100"
          aria-label={tx(lang, d.edit || { ar: "تعديل", en: "Edit" })}
        >
          <Edit size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="btn-interactive p-1.5 rounded-lg border border-line hover:bg-red-50 text-red-600"
          aria-label={tx(lang, d.delete || { ar: "حذف", en: "Delete" })}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  stage: Stage;
  deals: Customer[];
  onAddDeal: (stage: Stage) => void;
  onMoveDeal: (dealId: string, newStage: Stage) => void;
}

function KanbanColumn({ stage, deals, onAddDeal, onMoveDeal }: KanbanColumnProps) {
  const { lang } = useStore();
  const config = stageConfig[stage];
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  const {
    attributes,
    listeners,
    setNodeRef,
    overIndex,
  } = useSortable({
    id: `column-${stage}`,
    strategy: verticalListSortingStrategy,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex flex-col min-h-[500px] max-h-[70vh] flex-shrink-0 w-80"
    >
      {/* Column Header */}
      <div className="sticky top-0 z-10 mb-3 rounded-t-xl px-4 py-3 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", stageColorClasses[config.color].replace("bg-", "").replace("text-", "bg-").replace("border-", ""))} />
          <h3 className="font-semibold text-sm">{tx(lang, config.label)}</h3>
          <span className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded-full", stageColorClasses[config.color])}>
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">{config.probability}%</span>
          <span className="text-sm font-semibold text-brand">{totalValue.toLocaleString("en-US")}</span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pb-4 pr-2"
        role="list"
        aria-label={tx(lang, config.label)}
      >
        {deals.map((customer, index) => (
          <DealCard
            key={customer.id}
            customer={customer}
            isDragging={false}
            onEdit={() => {}}
            onConversation={() => {}}
            onTask={() => {}}
            onView={() => {}}
            onDelete={() => {}}
          />
        ))}

        {/* Empty state / Add deal */}
        {deals.length === 0 && (
          <button
            onClick={() => onAddDeal(stage)}
            className="w-full flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand transition"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">{tx(lang, d.newCustomer || { ar: "إضافة عميل", en: "Add Customer" })}</span>
          </button>
        )}

        {/* Drop indicator */}
        {overIndex !== undefined && overIndex !== deals.length && (
          <div className="h-4 border-t-2 border-dashed border-brand/50 rounded-t-xl" />
        )}
      </div>

      {/* Column Footer */}
      <div className="sticky bottom-0 z-10 mt-auto pt-3 border-t border-line px-2">
        <button
          onClick={() => onAddDeal(stage)}
          className="w-full btn-interactive flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-line text-sm font-medium hover:bg-muted/50"
        >
          <Plus size={14} />
          {tx(lang, d.newCustomer || { ar: "إضافة", en: "Add" })}
        </button>
      </div>
    </div>
  );
}

export default function PipelineKanban() {
  const { lang, companyId, customers: allCustomers } = useStore();
  const [viewMode, setViewMode] = useState<"kanban" | "funnel">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployee, setFilterEmployee] = useState<string | "all">("all");
  const [selectedDeal, setSelectedDeal] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    let result = allCustomers.filter((c) => {
      if (companyId && c.companyId !== companyId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.nameAr.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return result;
  }, [allCustomers, companyId, searchQuery]);

  const columns = useMemo(() => {
    const cols: Record<Stage, Customer[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      won: [],
      lost: [],
    };
    filteredCustomers.forEach((c) => {
      if (cols[c.stage]) cols[c.stage].push(c);
    });
    return cols;
  }, [filteredCustomers]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (overId.startsWith("column-")) {
      const newStage = overId.replace("column-", "") as Stage;
      const customer = filteredCustomers.find((c) => c.id === activeId);
      if (customer && customer.stage !== newStage) {
        // In real app, update via store
        console.log(`Move ${activeId} to ${newStage}`);
      }
    }
  }, [filteredCustomers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">{tx(lang, d.pipeline || { ar: "خط الأنابيب", en: "Pipeline" })}</h1>
          <p className="text-sm text-muted">{tx(lang, d.kanbanView || { ar: "عرض كانبان", en: "Kanban View" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tx(lang, d.searchCustomers || { ar: "ابحث...", en: "Search..." })}
              className="w-64 rounded-xl border border-line py-2 pe-3 ps-9 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-1 border border-line rounded-xl p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition",
                viewMode === "kanban" ? "bg-brand text-foreground" : "text-muted hover:text-foreground"
              )}
            >
              <GripVertical size={14} />
            </button>
            <button
              onClick={() => setViewMode("funnel")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition",
                viewMode === "funnel" ? "bg-brand text-white" : "text-muted hover:text-foreground"
              )}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label={tx(lang, d.pipeline || { ar: "خط الأنابيب", en: "Pipeline" })}>
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={columns[stage]}
              onAddDeal={() => {}}
              onMoveDeal={() => {}}
            />
          ))}
        </div>
      </DndContext>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {KANBAN_STAGES.map((stage) => {
          const deals = columns[stage];
          const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
          const config = stageConfig[stage];
          return (
            <div
              key={stage}
              className={cn("rounded-xl p-4 text-center card-interactive border", stageColorClasses[config.color].replace("bg-", "border-"))}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
                {tx(lang, config.label)}
              </div>
              <div className="text-2xl font-bold">{deals.length}</div>
              <div className="text-sm font-semibold text-brand mt-1">
                {totalValue.toLocaleString("en-US")} {tx(lang, d.currency)}
              </div>
              <div className="text-[10px] text-muted mt-1">{config.probability}% {tx(lang, d.probability || { ar: "احتمالية", en: "probability" })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}