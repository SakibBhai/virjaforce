'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Clock,
  DollarSign,
  PackageCheck,
  Search,
  MoreVertical,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  User,
  FileText,
  Calendar,
  Hash,
  Copy,
  Check,
  X,
  Package,
  Truck,
  AlertTriangle,
  Ban,
  Loader2,
  Inbox,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  division: string;
  notes: string;
  quantity: number;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: StatusCounts;
  totalRevenue: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_CONFIG: Record<
  string,
  { label: string; bnLabel: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pending',
    bnLabel: 'পেন্ডিং',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/30',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    bnLabel: 'কনফার্ম',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    icon: Check,
  },
  processing: {
    label: 'Processing',
    bnLabel: 'প্রসেসিং',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    bnLabel: 'শিপড',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    bnLabel: 'ডেলিভার্ড',
    color: 'text-green-400',
    bgColor: 'bg-green-500/15',
    borderColor: 'border-green-500/30',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Cancelled',
    bnLabel: 'বাতিল',
    color: 'text-red-400',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/30',
    icon: Ban,
  },
};

const STATUS_TAB_KEYS = ['all', ...VALID_STATUSES] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD')}`;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color} ${config.bgColor} ${config.borderColor}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function StatCard({
  title,
  titleBn,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  accentBorder,
  delay = 0,
}: {
  title: string;
  titleBn: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentBorder?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        className={`bg-vf-dark4 border border-[#2A2A25] hover:border-[#3A3A35] transition-colors ${accentBorder || ''}`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-vf-text-muted text-xs font-medium uppercase tracking-wider">
                {title}
              </p>
              <p className="text-vf-text-muted text-[11px]">{titleBn}</p>
              <p className="text-vf-cream text-2xl sm:text-3xl font-bold font-display mt-1">
                {value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-vf-dark4 border border-[#2A2A25]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20 bg-[#2A2A25]" />
            <Skeleton className="h-3 w-16 bg-[#2A2A25]" />
            <Skeleton className="h-8 w-16 bg-[#2A2A25] mt-1" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl bg-[#2A2A25]" />
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-full sm:w-64 bg-[#2A2A25]" />
          <Skeleton className="h-9 w-24 bg-[#2A2A25] hidden sm:block" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-vf-dark3/50"
            >
              <Skeleton className="h-4 w-20 bg-[#2A2A25]" />
              <Skeleton className="h-4 w-24 bg-[#2A2A25]" />
              <Skeleton className="h-4 w-28 bg-[#2A2A25] hidden sm:block" />
              <Skeleton className="h-4 w-16 bg-[#2A2A25] hidden md:block" />
              <Skeleton className="h-6 w-20 bg-[#2A2A25] ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, activeTab }: { searchQuery: string; activeTab: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-10 sm:p-16 text-center"
    >
      <div className="w-20 h-20 bg-[#2A2A25] rounded-full flex items-center justify-center mx-auto mb-5">
        <Inbox className="w-9 h-9 text-vf-text-muted" />
      </div>
      <h3 className="font-display text-xl text-vf-cream mb-2">কোনো অর্ডার পাওয়া যায়নি</h3>
      <p className="text-vf-text-muted text-sm max-w-md mx-auto">
        {searchQuery
          ? `"${searchQuery}" দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি। ভিন্ন কিছু দিয়ে খুঁজুন।`
          : activeTab !== 'all'
            ? `${STATUS_CONFIG[activeTab]?.label || activeTab} স্ট্যাটাসে কোনো অর্ডার নেই।`
            : 'এখনো কোনো অর্ডার আসেনি। নতুন অর্ডার আসলে এখানে দেখাবে।'}
      </p>
    </motion.div>
  );
}

// ─── Order Detail Dialog ─────────────────────────────────────────────────────

function OrderDetailDialog({
  order,
  open,
  onClose,
  onStatusChange,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [changing, setChanging] = useState(false);

  if (!order) return null;

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const handleStatusChange = async (status: string) => {
    setChanging(true);
    try {
      await onStatusChange(order.id, status);
      onClose();
    } finally {
      setChanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-vf-gold font-display text-xl flex items-center gap-2">
              <Package className="w-5 h-5" />
              অর্ডারের বিস্তারিত
            </DialogTitle>
            <StatusBadge status={order.status} />
          </div>
          <DialogDescription className="text-vf-text-muted">
            অর্ডার আইডি: <span className="text-vf-cream font-mono">{order.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Customer Info */}
          <div className="bg-vf-dark3 rounded-xl p-4 space-y-3 border border-[#2A2A25]">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">
              গ্রাহকের তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-vf-text-muted text-[11px]">নাম</p>
                  <p className="text-vf-cream text-sm font-medium">{order.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-vf-text-muted text-[11px]">ফোন নম্বর</p>
                  <p className="text-vf-cream text-sm font-medium">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPin className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-vf-text-muted text-[11px]">ঠিকানা</p>
                  <p className="text-vf-cream text-sm">{order.address}</p>
                  <p className="text-vf-cream2 text-xs mt-0.5">{order.division}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-vf-dark3 rounded-xl p-4 space-y-3 border border-[#2A2A25]">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">
              অর্ডারের তথ্য
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-vf-text-muted text-[11px]">পরিমাণ</p>
                <p className="text-vf-cream text-sm font-semibold">{order.quantity}</p>
              </div>
              <div>
                <p className="text-vf-text-muted text-[11px]">মোট</p>
                <p className="text-vf-gold text-sm font-bold">{formatTaka(order.amount)}</p>
              </div>
              <div>
                <p className="text-vf-text-muted text-[11px]">তৈরি</p>
                <p className="text-vf-cream text-[11px]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-vf-text-muted text-[11px]">আপডেট</p>
                <p className="text-vf-cream text-[11px]">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
            {order.notes && (
              <div className="flex items-start gap-2.5 pt-1">
                <FileText className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-vf-text-muted text-[11px]">নোট</p>
                  <p className="text-vf-cream2 text-sm">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Change */}
          <div className="space-y-2.5">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">
              স্ট্যাটাস পরিবর্তন করুন
            </h4>
            <div className="flex flex-wrap gap-2">
              {VALID_STATUSES.map((status) => {
                const sc = STATUS_CONFIG[status];
                const isActive = order.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => !isActive && handleStatusChange(status)}
                    disabled={isActive || changing}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      isActive
                        ? `${sc.bgColor} ${sc.borderColor} ${sc.color} cursor-default`
                        : 'border-[#2A2A25] text-vf-text-muted hover:border-[#3A3A35] hover:text-vf-cream hover:bg-[#2A2A25]/50'
                    }`}
                  >
                    {changing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <sc.icon className="w-3 h-3" />
                    )}
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]"
          >
            বন্ধ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mobile Order Card ───────────────────────────────────────────────────────

function MobileOrderCard({
  order,
  onView,
  onDelete,
  onStatusChange,
}: {
  order: Order;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-vf-dark3 border border-[#2A2A25] rounded-xl overflow-hidden"
    >
      {/* Main row */}
      <div
        className="p-4 cursor-pointer hover:bg-[#2A2A25]/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-3 h-3 text-vf-text-muted flex-shrink-0" />
              <span className="text-vf-text-muted text-[11px] font-mono truncate">
                {truncateId(order.id)}
              </span>
            </div>
            <p className="text-vf-cream font-semibold text-sm truncate">{order.name}</p>
            <p className="text-vf-cream2 text-xs mt-0.5">{order.phone}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={order.status} />
            <p className="text-vf-gold font-bold text-sm">{formatTaka(order.amount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A25]/50">
          <div className="flex items-center gap-3 text-vf-text-muted text-[11px]">
            <span>{order.division}</span>
            <span>x{order.quantity}</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-vf-text-muted" />
          </motion.div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-[#2A2A25] space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                <p className="text-vf-cream2 text-xs">{order.address}</p>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-vf-gold-dim mt-0.5 flex-shrink-0" />
                  <p className="text-vf-cream2 text-xs">{order.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-vf-gold-dim hover:text-vf-gold hover:bg-vf-gold/10 text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  বিস্তারিত
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25] text-xs h-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      স্ট্যাটাস পরিবর্তন
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-vf-dark4 border-[#2A2A25] min-w-[160px]"
                    side="bottom"
                    align="end"
                  >
                    <DropdownMenuLabel className="text-vf-text-muted text-xs">
                      স্ট্যাটাস নির্বাচন
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#2A2A25]" />
                    {VALID_STATUSES.map((status) => {
                      const sc = STATUS_CONFIG[status];
                      return (
                        <DropdownMenuItem
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(status);
                          }}
                          className={`text-xs ${order.status === status ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <sc.icon className={`w-3.5 h-3.5 mr-2 ${sc.color}`} />
                          <span className="text-vf-cream">{sc.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  মুছুন
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Desktop Order Row ───────────────────────────────────────────────────────

function DesktopOrderRow({
  order,
  onView,
  onDelete,
  onStatusChange,
}: {
  order: Order;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-[#2A2A25]/50 hover:bg-[#2A2A25]/20 transition-colors group"
    >
      <td className="py-3 px-4">
        <button
          onClick={onView}
          className="flex items-center gap-1.5 text-vf-cream text-sm font-mono hover:text-vf-gold transition-colors"
          title={order.id}
        >
          <Hash className="w-3 h-3 text-vf-text-muted" />
          {truncateId(order.id)}
          <Copy className="w-3 h-3 text-vf-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="text-vf-cream text-sm font-medium">{order.name}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-vf-cream2 text-sm">{order.phone}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-vf-text-muted text-sm">{order.division}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-vf-cream text-sm">{order.quantity}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-vf-gold font-semibold text-sm">{formatTaka(order.amount)}</span>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="py-3 px-4">
        <span className="text-vf-text-muted text-xs">{formatDate(order.createdAt)}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10"
            onClick={onView}
            title="বিস্তারিত"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-vf-dark4 border-[#2A2A25] min-w-[180px]"
              side="bottom"
              align="end"
            >
              <DropdownMenuLabel className="text-vf-text-muted text-xs">
                স্ট্যাটাস পরিবর্তন
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2A2A25]" />
              {VALID_STATUSES.map((status) => {
                const sc = STATUS_CONFIG[status];
                return (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(status)}
                    disabled={order.status === status}
                    className={`text-xs ${order.status === status ? 'opacity-50' : ''}`}
                  >
                    <sc.icon className={`w-3.5 h-3.5 mr-2 ${sc.color}`} />
                    <span className="text-vf-cream">{sc.label}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-[#2A2A25]" />
              <DropdownMenuItem
                onClick={onDelete}
                variant="destructive"
                className="text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                অর্ডার মুছুন
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

export default function AdminPanel() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Dialogs
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', '1');
      params.set('limit', '50');

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data: OrdersResponse = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalOrders(data.total);
        setTotalRevenue(data.totalRevenue);
        setStatusCounts(data.statusCounts);
      }
    } catch {
      // Silently fail on network error
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic update: update local state immediately
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
        );
        // Then refresh to get latest counts
        fetchOrders();
      }
    } catch {
      // Silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/orders/${deleteOrder.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        fetchOrders();
        setDeleteOrder(null);
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  const pendingCount = statusCounts.pending || 0;
  const deliveredCount = statusCounts.delivered || 0;

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: totalOrders,
      ...statusCounts,
    };
    return counts;
  }, [totalOrders, statusCounts]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-vf-dark3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-vf-gold">
                অ্যাডমিন প্যানেল
              </h1>
              <p className="text-vf-text-muted text-sm mt-1">
                VajraForce অর্ডার ম্যানেজমেন্ট
              </p>
            </div>
            <Button
              onClick={fetchOrders}
              disabled={loading}
              variant="ghost"
              className="text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10 border border-[#2A2A25]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
          </div>
        </motion.div>

        {loading && !orders.length ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            {/* ── Stats Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Orders"
                titleBn="মোট অর্ডার"
                value={totalOrders}
                icon={ShoppingCart}
                iconColor="text-vf-gold"
                iconBg="bg-vf-gold/10"
                delay={0}
              />
              <StatCard
                title="Pending"
                titleBn="পেন্ডিং"
                value={pendingCount}
                icon={Clock}
                iconColor="text-yellow-400"
                iconBg="bg-yellow-500/10"
                accentBorder={pendingCount > 0 ? 'border-l-2 border-l-yellow-500/50' : ''}
                delay={0.05}
              />
              <StatCard
                title="Revenue"
                titleBn="মোট আয়"
                value={formatTaka(totalRevenue)}
                icon={DollarSign}
                iconColor="text-vf-gold-light"
                iconBg="bg-vf-gold/10"
                delay={0.1}
              />
              <StatCard
                title="Delivered"
                titleBn="ডেলিভার্ড"
                value={deliveredCount}
                icon={PackageCheck}
                iconColor="text-green-400"
                iconBg="bg-green-500/10"
                delay={0.15}
              />
            </div>

            {/* ── Filters & Search ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vf-text-muted" />
                <Input
                  placeholder="নাম, ফোন বা অর্ডার আইডি দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-vf-dark4 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold-dim pl-10 h-11"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vf-text-muted hover:text-vf-cream transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {STATUS_TAB_KEYS.map((tab) => {
                  const isActive = activeTab === tab;
                  const count = tabCounts[tab] ?? 0;
                  const tabLabel =
                    tab === 'all' ? (
                      <span className="text-vf-cream">সব</span>
                    ) : (
                      <span className={isActive ? STATUS_CONFIG[tab]?.color || 'text-vf-cream' : 'text-vf-text-muted'}>
                        {STATUS_CONFIG[tab]?.label || tab}
                      </span>
                    );

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                        isActive
                          ? 'bg-vf-gold/15 border-vf-gold/40 text-vf-gold'
                          : 'border-[#2A2A25] text-vf-text-muted hover:border-[#3A3A35] hover:text-vf-cream hover:bg-[#2A2A25]/50'
                      }`}
                    >
                      {tabLabel}
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-vf-gold/20 text-vf-gold' : 'bg-[#2A2A25] text-vf-text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Orders List ─────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {orders.length === 0 && !loading ? (
                <EmptyState searchQuery={searchQuery} activeTab={activeTab} />
              ) : (
                <>
                  {/* Mobile: Card layout */}
                  <div className="md:hidden space-y-3">
                    <AnimatePresence mode="popLayout">
                      {orders.map((order) => (
                        <MobileOrderCard
                          key={order.id}
                          order={order}
                          onView={() => setDetailOrder(order)}
                          onDelete={() => setDeleteOrder(order)}
                          onStatusChange={(status) => handleStatusChange(order.id, status)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden md:block bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2A2A25]">
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              অর্ডার আইডি
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              নাম
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              ফোন
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              বিভাগ
                            </th>
                            <th className="text-center py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              পরিমাণ
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              মূল্য
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              স্ট্যাটাস
                            </th>
                            <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              তারিখ
                            </th>
                            <th className="text-right py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">
                              অ্যাকশন
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence mode="popLayout">
                            {orders.map((order) => (
                              <DesktopOrderRow
                                key={order.id}
                                order={order}
                                onView={() => setDetailOrder(order)}
                                onDelete={() => setDeleteOrder(order)}
                                onStatusChange={(status) => handleStatusChange(order.id, status)}
                              />
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-3 text-right">
                    <p className="text-vf-text-muted text-xs">
                      মোট {totalOrders}টি অর্ডারের মধ্যে {orders.length}টি দেখাচ্ছে
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Order Detail Dialog ───────────────────────────────────────────── */}
      <OrderDetailDialog
        order={detailOrder}
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        onStatusChange={handleStatusChange}
      />

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <AlertDialog open={!!deleteOrder} onOpenChange={(open) => !open && setDeleteOrder(null)}>
        <AlertDialogContent className="bg-vf-dark4 border-[#2A2A25]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-vf-cream flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              অর্ডার মুছে ফেলুন
            </AlertDialogTitle>
            <AlertDialogDescription className="text-vf-text-muted">
              আপনি কি <strong className="text-vf-cream">{deleteOrder?.name}</strong>-এর অর্ডার মুছে
              ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="border-[#2A2A25] text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]"
            >
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  মুছে ফেলা হচ্ছে...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  মুছে ফেলুন
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
