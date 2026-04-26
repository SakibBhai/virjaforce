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
  Hash,
  Copy,
  Check,
  X,
  Package,
  Truck,
  Ban,
  Loader2,
  Inbox,
  Eye,
  Users,
  BarChart3,
  Repeat,
  ArrowUpDown,
  TrendingUp,
  CalendarClock,
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

interface CustomerData {
  phone: string;
  name: string;
  division: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  totalQty: number;
  lastOrderDate: string;
  firstOrderDate: string;
  statuses: Record<string, number>;
  orders: { id: string; status: string; quantity: number; amount: number; createdAt: string }[];
}

interface CustomersResponse {
  success: boolean;
  customers: CustomerData[];
  summary: {
    totalCustomers: number;
    repeatCustomers: number;
    totalRevenue: number;
    avgOrderPerCustomer: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bgColor: 'bg-yellow-500/15', borderColor: 'border-yellow-500/30', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30', icon: Check },
  processing: { label: 'Processing', color: 'text-orange-400', bgColor: 'bg-orange-500/15', borderColor: 'border-orange-500/30', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-400', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/30', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-400', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/30', icon: PackageCheck },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/30', icon: Ban },
};

const STATUS_TAB_KEYS = ['all', ...VALID_STATUSES] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' });
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color} ${config.bgColor} ${config.borderColor}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function StatCard({ title, titleBn, value, icon: Icon, iconColor, iconBg, accentBorder, delay = 0 }: {
  title: string; titleBn: string; value: string | number; icon: React.ElementType;
  iconColor: string; iconBg: string; accentBorder?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card className={`bg-vf-dark4 border border-[#2A2A25] hover:border-[#3A3A35] transition-colors ${accentBorder || ''}`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-vf-text-muted text-xs font-medium uppercase tracking-wider">{title}</p>
              <p className="text-vf-text-muted text-[11px]">{titleBn}</p>
              <p className="text-vf-cream text-2xl sm:text-3xl font-bold font-display mt-1">{value}</p>
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

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-10 sm:p-16 text-center">
      <div className="w-20 h-20 bg-[#2A2A25] rounded-full flex items-center justify-center mx-auto mb-5">
        <Inbox className="w-9 h-9 text-vf-text-muted" />
      </div>
      <h3 className="font-display text-xl text-vf-cream mb-2">কোনো তথ্য পাওয়া যায়নি</h3>
      <p className="text-vf-text-muted text-sm max-w-md mx-auto">{message}</p>
    </motion.div>
  );
}

// ─── Order Detail Dialog ─────────────────────────────────────────────────────

function OrderDetailDialog({ order, open, onClose, onStatusChange }: {
  order: Order | null; open: boolean; onClose: () => void; onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [changing, setChanging] = useState(false);
  if (!order) return null;

  const handleStatusChange = async (status: string) => {
    setChanging(true);
    try { await onStatusChange(order.id, status); onClose(); } finally { setChanging(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-vf-gold font-display text-xl flex items-center gap-2"><Package className="w-5 h-5" />অর্ডারের বিস্তারিত</DialogTitle>
            <StatusBadge status={order.status} />
          </div>
          <DialogDescription className="text-vf-text-muted">অর্ডার আইডি: <span className="text-vf-cream font-mono">{order.id}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="bg-vf-dark3 rounded-xl p-4 space-y-3 border border-[#2A2A25]">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">গ্রাহকের তথ্য</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5"><User className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" /><div><p className="text-vf-text-muted text-[11px]">নাম</p><p className="text-vf-cream text-sm font-medium">{order.name}</p></div></div>
              <div className="flex items-start gap-2.5"><Phone className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" /><div><p className="text-vf-text-muted text-[11px]">ফোন নম্বর</p><p className="text-vf-cream text-sm font-medium">{order.phone}</p></div></div>
              <div className="flex items-start gap-2.5 sm:col-span-2"><MapPin className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" /><div><p className="text-vf-text-muted text-[11px]">ঠিকানা</p><p className="text-vf-cream text-sm">{order.address}</p><p className="text-vf-cream2 text-xs mt-0.5">{order.division}</p></div></div>
            </div>
          </div>
          <div className="bg-vf-dark3 rounded-xl p-4 space-y-3 border border-[#2A2A25]">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">অর্ডারের তথ্য</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><p className="text-vf-text-muted text-[11px]">পরিমাণ</p><p className="text-vf-cream text-sm font-semibold">{order.quantity}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">মোট</p><p className="text-vf-gold text-sm font-bold">{formatTaka(order.amount)}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">তৈরি</p><p className="text-vf-cream text-[11px]">{formatDate(order.createdAt)}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">আপডেট</p><p className="text-vf-cream text-[11px]">{formatDate(order.updatedAt)}</p></div>
            </div>
            {order.notes && <div className="flex items-start gap-2.5 pt-1"><FileText className="w-4 h-4 text-vf-gold-dim mt-0.5 flex-shrink-0" /><div><p className="text-vf-text-muted text-[11px]">নোট</p><p className="text-vf-cream2 text-sm">{order.notes}</p></div></div>}
          </div>
          <div className="space-y-2.5">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">স্ট্যাটাস পরিবর্তন করুন</h4>
            <div className="flex flex-wrap gap-2">
              {VALID_STATUSES.map((status) => {
                const sc = STATUS_CONFIG[status];
                const isActive = order.status === status;
                return (
                  <button key={status} onClick={() => !isActive && handleStatusChange(status)} disabled={isActive || changing}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${isActive ? `${sc.bgColor} ${sc.borderColor} ${sc.color} cursor-default` : 'border-[#2A2A25] text-vf-text-muted hover:border-[#3A3A35] hover:text-vf-cream hover:bg-[#2A2A25]/50'}`}>
                    {changing ? <Loader2 className="w-3 h-3 animate-spin" /> : <sc.icon className="w-3 h-3" />}{sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={onClose} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]">বন্ধ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Customer Detail Dialog ──────────────────────────────────────────────────

function CustomerDetailDialog({ customer, open, onClose }: {
  customer: CustomerData | null; open: boolean; onClose: () => void;
}) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-vf-gold font-display text-xl flex items-center gap-2">
            <Users className="w-5 h-5" />গ্রাহকের বিস্তারিত
          </DialogTitle>
          <DialogDescription className="text-vf-text-muted">
            ফোন: <span className="text-vf-cream font-mono">{customer.phone}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {/* Customer Info */}
          <div className="bg-vf-dark3 rounded-xl p-4 space-y-3 border border-[#2A2A25]">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">গ্রাহকের তথ্য</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-vf-text-muted text-[11px]">নাম</p><p className="text-vf-cream text-sm font-medium">{customer.name}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">ফোন</p><p className="text-vf-cream text-sm font-medium">{customer.phone}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">বিভাগ</p><p className="text-vf-cream text-sm">{customer.division}</p></div>
              <div><p className="text-vf-text-muted text-[11px]">ঠিকানা</p><p className="text-vf-cream text-sm">{customer.address || 'N/A'}</p></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-vf-dark3 rounded-xl p-4 border border-[#2A2A25] text-center">
              <p className="text-vf-gold text-2xl font-bold font-display">{customer.orderCount}</p>
              <p className="text-vf-text-muted text-xs">মোট অর্ডার</p>
            </div>
            <div className="bg-vf-dark3 rounded-xl p-4 border border-[#2A2A25] text-center">
              <p className="text-vf-gold text-2xl font-bold font-display">{formatTaka(customer.totalSpent)}</p>
              <p className="text-vf-text-muted text-xs">মোট খরচ</p>
            </div>
          </div>

          {/* Status breakdown */}
          {Object.keys(customer.statuses).length > 0 && (
            <div className="bg-vf-dark3 rounded-xl p-4 space-y-2 border border-[#2A2A25]">
              <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">স্ট্যাটাস অনুযায়ী</h4>
              {Object.entries(customer.statuses).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-vf-cream text-sm font-semibold">{count} টি</span>
                </div>
              ))}
            </div>
          )}

          {/* Orders List */}
          <div className="space-y-2">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">
              অর্ডারের তালিকা ({customer.orders.length} টি)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between bg-vf-dark3 border border-[#2A2A25] rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-vf-text-muted text-[11px] font-mono">#{truncateId(order.id)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-vf-gold text-sm font-bold">{formatTaka(order.amount)}</p>
                    <p className="text-vf-text-muted text-[10px]">{formatDateShort(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={onClose} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]">বন্ধ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mobile Order Card ───────────────────────────────────────────────────────

function MobileOrderCard({ order, onView, onDelete, onStatusChange }: {
  order: Order; onView: () => void; onDelete: () => void; onStatusChange: (status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-vf-dark3 border border-[#2A2A25] rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-[#2A2A25]/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1"><Hash className="w-3 h-3 text-vf-text-muted flex-shrink-0" /><span className="text-vf-text-muted text-[11px] font-mono truncate">{truncateId(order.id)}</span></div>
            <p className="text-vf-cream font-semibold text-sm truncate">{order.name}</p>
            <p className="text-vf-cream2 text-xs mt-0.5">{order.phone}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={order.status} />
            <p className="text-vf-gold font-bold text-sm">{formatTaka(order.amount)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A25]/50">
          <div className="flex items-center gap-3 text-vf-text-muted text-[11px]"><span>{order.division}</span><span>x{order.quantity}</span><span>{formatDate(order.createdAt)}</span></div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-vf-text-muted" /></motion.div>
        </div>
      </div>
      <AnimatePresence>{expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 border-t border-[#2A2A25] space-y-3">
            <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-vf-gold-dim mt-0.5 flex-shrink-0" /><p className="text-vf-cream2 text-xs">{order.address}</p></div>
            {order.notes && <div className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 text-vf-gold-dim mt-0.5 flex-shrink-0" /><p className="text-vf-cream2 text-xs">{order.notes}</p></div>}
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-vf-gold-dim hover:text-vf-gold hover:bg-vf-gold/10 text-xs h-8" onClick={(e) => { e.stopPropagation(); onView(); }}><Eye className="w-3 h-3 mr-1" />বিস্তারিত</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25] text-xs h-8" onClick={(e) => e.stopPropagation()}>স্ট্যাটাস পরিবর্তন<ChevronDown className="w-3 h-3 ml-1" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent className="bg-vf-dark4 border-[#2A2A25] min-w-[160px]" side="bottom" align="end">
                  <DropdownMenuLabel className="text-vf-text-muted text-xs">স্ট্যাটাস নির্বাচন</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2A2A25]" />
                  {VALID_STATUSES.map((status) => { const sc = STATUS_CONFIG[status]; return (
                    <DropdownMenuItem key={status} onClick={(e) => { e.stopPropagation(); onStatusChange(status); }} className={`text-xs ${order.status === status ? 'opacity-50 pointer-events-none' : ''}`}>
                      <sc.icon className={`w-3.5 h-3.5 mr-2 ${sc.color}`} /><span className="text-vf-cream">{sc.label}</span>
                    </DropdownMenuItem>);
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8 ml-auto" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="w-3 h-3 mr-1" />মুছুন</Button>
            </div>
          </div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}

// ─── Customer Analytics Card (Mobile) ────────────────────────────────────────

function MobileCustomerCard({ customer, onView }: {
  customer: CustomerData; onView: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-vf-dark3 border border-[#2A2A25] rounded-xl overflow-hidden cursor-pointer hover:border-[#3A3A35] transition-colors"
      onClick={onView}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-vf-cream font-semibold text-sm truncate">{customer.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3 text-vf-gold-dim" />
              <p className="text-vf-cream2 text-xs">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${customer.orderCount > 1 ? 'bg-vf-gold/15 text-vf-gold border border-vf-gold/30' : 'bg-[#2A2A25] text-vf-text-muted'}`}>
              {customer.orderCount > 1 && <Repeat className="w-3 h-3" />}
              {customer.orderCount}x
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-vf-dark4 rounded-lg p-2 text-center">
            <p className="text-vf-cream text-sm font-bold">{customer.orderCount}</p>
            <p className="text-vf-text-muted text-[10px]">অর্ডার</p>
          </div>
          <div className="bg-vf-dark4 rounded-lg p-2 text-center">
            <p className="text-vf-gold text-sm font-bold">{formatTaka(customer.totalSpent)}</p>
            <p className="text-vf-text-muted text-[10px]">মোট</p>
          </div>
          <div className="bg-vf-dark4 rounded-lg p-2 text-center">
            <p className="text-vf-cream text-sm font-bold">{customer.totalQty}</p>
            <p className="text-vf-text-muted text-[10px]">পিস</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2A2A25]/50">
          <span className="text-vf-text-muted text-[10px]">{customer.division}</span>
          <span className="text-vf-text-muted text-[10px]">সর্বশেষ: {formatDateShort(customer.lastOrderDate)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-vf-dark4 border border-[#2A2A25]"><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between"><div className="space-y-2 flex-1"><Skeleton className="h-3 w-20 bg-[#2A2A25]" /><Skeleton className="h-3 w-16 bg-[#2A2A25]" /><Skeleton className="h-8 w-16 bg-[#2A2A25] mt-1" /></div><Skeleton className="h-10 w-10 rounded-xl bg-[#2A2A25]" /></div></CardContent></Card>
      ))}</div>
      <div className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-4 space-y-4">
        <Skeleton className="h-9 w-full sm:w-64 bg-[#2A2A25]" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-[#2A2A25] rounded-lg" />)}
      </div>
    </div>
  );
}

function CustomersLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-vf-dark4 border border-[#2A2A25]"><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between"><div className="space-y-2 flex-1"><Skeleton className="h-3 w-20 bg-[#2A2A25]" /><Skeleton className="h-3 w-16 bg-[#2A2A25]" /><Skeleton className="h-8 w-16 bg-[#2A2A25] mt-1" /></div><Skeleton className="h-10 w-10 rounded-xl bg-[#2A2A25]" /></div></CardContent></Card>
      ))}</div>
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-vf-dark4 border border-[#2A2A25] rounded-xl" />)}
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

type AdminTab = 'orders' | 'customers';
type SortField = 'orderCount' | 'totalSpent' | 'lastOrder';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="min-h-screen bg-vf-dark3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-vf-gold">অ্যাডমিন প্যানেল</h1>
              <p className="text-vf-text-muted text-sm mt-1">VajraForce অর্ডার ও গ্রাহক ম্যানেজমেন্ট</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 bg-vf-dark4 border border-[#2A2A25] rounded-xl p-1.5 w-fit">
            {[
              { key: 'orders' as AdminTab, label: 'অর্ডার ম্যানেজমেন্ট', icon: ShoppingCart },
              { key: 'customers' as AdminTab, label: 'গ্রাহক ড্যাশবোর্ড', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-vf-gold/15 text-vf-gold border border-vf-gold/30' : 'text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]/50 border border-transparent'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.key === 'orders' ? 'অর্ডার' : 'গ্রাহক'}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
              <OrdersTab />
            </motion.div>
          ) : (
            <motion.div key="customers" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
              <CustomersTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── ORDERS TAB ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeStatusTab !== 'all') params.set('status', activeStatusTab);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', '1');
      params.set('limit', '50');
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data: OrdersResponse = await res.json();
      if (data.success) { setOrders(data.orders); setTotalOrders(data.total); setTotalRevenue(data.totalRevenue); setStatusCounts(data.statusCounts); }
    } catch {} finally { setLoading(false); }
  }, [activeStatusTab, debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 400); return () => clearTimeout(t); }, [searchQuery]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) { setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))); fetchOrders(); }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    try { setDeleting(true); const res = await fetch(`/api/orders/${deleteOrder.id}`, { method: 'DELETE' }); const data = await res.json(); if (data.success) { setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id)); fetchOrders(); setDeleteOrder(null); } } catch {} finally { setDeleting(false); }
  };

  const tabCounts = useMemo(() => ({ all: totalOrders, ...statusCounts }), [totalOrders, statusCounts]);

  if (loading && !orders.length) return <OrdersLoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" titleBn="মোট অর্ডার" value={totalOrders} icon={ShoppingCart} iconColor="text-vf-gold" iconBg="bg-vf-gold/10" />
        <StatCard title="Pending" titleBn="পেন্ডিং" value={statusCounts.pending || 0} icon={Clock} iconColor="text-yellow-400" iconBg="bg-yellow-500/10" accentBorder={(statusCounts.pending || 0) > 0 ? 'border-l-2 border-l-yellow-500/50' : ''} delay={0.05} />
        <StatCard title="Revenue" titleBn="মোট আয়" value={formatTaka(totalRevenue)} icon={DollarSign} iconColor="text-vf-gold-light" iconBg="bg-vf-gold/10" delay={0.1} />
        <StatCard title="Delivered" titleBn="ডেলিভার্ড" value={statusCounts.delivered || 0} icon={PackageCheck} iconColor="text-green-400" iconBg="bg-green-500/10" delay={0.15} />
      </div>

      {/* Search + Status Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vf-text-muted" />
          <Input placeholder="নাম, ফোন বা অর্ডার আইডি দিয়ে খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-vf-dark4 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold-dim pl-10 h-11" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vf-text-muted hover:text-vf-cream transition-colors"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TAB_KEYS.map((tab) => {
            const isActive = activeStatusTab === tab;
            const count = tabCounts[tab] ?? 0;
            return (
              <button key={tab} onClick={() => setActiveStatusTab(tab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${isActive ? 'bg-vf-gold/15 border-vf-gold/40 text-vf-gold' : 'border-[#2A2A25] text-vf-text-muted hover:border-[#3A3A35] hover:text-vf-cream hover:bg-[#2A2A25]/50'}`}>
                <span className={isActive && tab !== 'all' ? STATUS_CONFIG[tab]?.color || 'text-vf-cream' : tab === 'all' && isActive ? 'text-vf-cream' : 'text-vf-text-muted'}>
                  {tab === 'all' ? 'সব' : STATUS_CONFIG[tab]?.label || tab}
                </span>
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-vf-gold/20 text-vf-gold' : 'bg-[#2A2A25] text-vf-text-muted'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 && !loading ? (
        <EmptyState message={searchQuery ? `"${searchQuery}" দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি।` : activeStatusTab !== 'all' ? `${STATUS_CONFIG[activeStatusTab]?.label || activeStatusTab} স্ট্যাটাসে কোনো অর্ডার নেই।` : 'এখনো কোনো অর্ডার আসেনি।'} />
      ) : (
        <>
          <div className="md:hidden space-y-3">
            <AnimatePresence mode="popLayout">{orders.map((order) => (
              <MobileOrderCard key={order.id} order={order} onView={() => setDetailOrder(order)} onDelete={() => setDeleteOrder(order)} onStatusChange={(status) => handleStatusChange(order.id, status)} />
            ))}</AnimatePresence>
          </div>
          <div className="hidden md:block bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A25]">
                    {['আইডি', 'নাম', 'ফোন', 'বিভাগ', 'পরিমাণ', 'মূল্য', 'স্ট্যাটাস', 'তারিখ', 'অ্যাকশন'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <motion.tr key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-[#2A2A25]/50 hover:bg-[#2A2A25]/20 transition-colors group">
                      <td className="py-3 px-4"><button onClick={() => setDetailOrder(order)} className="flex items-center gap-1.5 text-vf-cream text-sm font-mono hover:text-vf-gold transition-colors" title={order.id}><Hash className="w-3 h-3 text-vf-text-muted" />{truncateId(order.id)}</button></td>
                      <td className="py-3 px-4"><span className="text-vf-cream text-sm font-medium">{order.name}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-cream2 text-sm">{order.phone}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-text-muted text-sm">{order.division}</span></td>
                      <td className="py-3 px-4 text-center"><span className="text-vf-cream text-sm">{order.quantity}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-gold font-semibold text-sm">{formatTaka(order.amount)}</span></td>
                      <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                      <td className="py-3 px-4"><span className="text-vf-text-muted text-xs">{formatDate(order.createdAt)}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10" onClick={() => setDetailOrder(order)}><Eye className="w-3.5 h-3.5" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8 text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-vf-dark4 border-[#2A2A25] min-w-[180px]" side="bottom" align="end">
                              <DropdownMenuLabel className="text-vf-text-muted text-xs">স্ট্যাটাস পরিবর্তন</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#2A2A25]" />
                              {VALID_STATUSES.map((status) => { const sc = STATUS_CONFIG[status]; return (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)} disabled={order.status === status} className={`text-xs ${order.status === status ? 'opacity-50' : ''}`}>
                                  <sc.icon className={`w-3.5 h-3.5 mr-2 ${sc.color}`} /><span className="text-vf-cream">{sc.label}</span>
                                </DropdownMenuItem>);
                              })}
                              <DropdownMenuSeparator className="bg-[#2A2A25]" />
                              <DropdownMenuItem onClick={() => setDeleteOrder(order)} variant="destructive" className="text-xs"><Trash2 className="w-3.5 h-3.5 mr-2" />অর্ডার মুছুন</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Dialogs */}
      <OrderDetailDialog order={detailOrder} open={!!detailOrder} onClose={() => setDetailOrder(null)} onStatusChange={handleStatusChange} />
      <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <AlertDialogContent className="bg-vf-dark4 border-[#2A2A25]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-vf-cream">অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription className="text-vf-text-muted">
              {deleteOrder?.name} ({deleteOrder?.phone}) এর অর্ডার মুছে ফেলা হবে। এটি পুনরুদ্ধার করা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25] border-[#2A2A25]">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'মুছুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── CUSTOMERS TAB ───────────────────────────────────────────────────────────

function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('orderCount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detailCustomer, setDetailCustomer] = useState<CustomerData | null>(null);
  const [summary, setSummary] = useState({ totalCustomers: 0, repeatCustomers: 0, totalRevenue: 0, avgOrderPerCustomer: '0' });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortDir);
      const res = await fetch(`/api/orders/customers?${params.toString()}`);
      const data: CustomersResponse = await res.json();
      if (data.success) { setCustomers(data.customers); setSummary(data.summary); }
    } catch {} finally { setLoading(false); }
  }, [debouncedSearch, sortBy, sortDir]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 400); return () => clearTimeout(t); }, [searchQuery]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) { setSortDir((d) => (d === 'desc' ? 'asc' : 'desc')); } else { setSortBy(field); setSortDir('desc'); }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-vf-text-muted hover:text-vf-cream transition-colors">
      {label}
      <ArrowUpDown className={`w-3 h-3 transition-colors ${sortBy === field ? 'text-vf-gold' : ''}`} />
    </button>
  );

  if (loading && !customers.length) return <CustomersLoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" titleBn="মোট গ্রাহক" value={summary.totalCustomers} icon={Users} iconColor="text-vf-gold" iconBg="bg-vf-gold/10" />
        <StatCard title="Repeat Customers" titleBn="পুনরায় অর্ডারকারী" value={summary.repeatCustomers} icon={Repeat} iconColor="text-green-400" iconBg="bg-green-500/10" delay={0.05} />
        <StatCard title="Total Revenue" titleBn="মোট আয়" value={formatTaka(summary.totalRevenue)} icon={TrendingUp} iconColor="text-vf-gold-light" iconBg="bg-vf-gold/10" delay={0.1} />
        <StatCard title="Avg Orders" titleBn="গড় অর্ডার/গ্রাহক" value={summary.avgOrderPerCustomer} icon={BarChart3} iconColor="text-orange-400" iconBg="bg-orange-500/10" delay={0.15} />
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vf-text-muted" />
          <Input placeholder="নাম, ফোন বা বিভাগ দিয়ে খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-vf-dark4 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold-dim pl-10 h-11" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vf-text-muted hover:text-vf-cream transition-colors"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-vf-text-muted text-xs mr-1">সর্ট:</span>
          {([['orderCount', 'অর্ডার সংখ্যা'], ['totalSpent', 'মোট খরচ'], ['lastOrder', 'সর্বশেষ']] as [SortField, string][]).map(([field, label]) => (
            <button key={field} onClick={() => toggleSort(field)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${sortBy === field ? 'bg-vf-gold/15 border-vf-gold/40 text-vf-gold' : 'border-[#2A2A25] text-vf-text-muted hover:border-[#3A3A35] hover:text-vf-cream'}`}>
              {label}
              <ArrowUpDown className="w-3 h-3" />
              {sortBy === field && <span className="text-[10px]">{sortDir === 'desc' ? '↓' : '↑'}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Customers List */}
      {customers.length === 0 && !loading ? (
        <EmptyState message={searchQuery ? `"${searchQuery}" দিয়ে কোনো গ্রাহক খুঁজে পাওয়া যায়নি।` : 'এখনো কোনো গ্রাহক নেই।'} />
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <MobileCustomerCard key={customer.phone} customer={customer} onView={() => setDetailCustomer(customer)} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A25]">
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-4"><SortButton field="orderCount" label="অর্ডার" /></th>
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">নাম</th>
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">ফোন নম্বর</th>
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">বিভাগ</th>
                    <th className="text-left py-3 px-4"><SortButton field="totalSpent" label="মোট খরচ" /></th>
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">পিস</th>
                    <th className="text-left py-3 px-4"><SortButton field="lastOrder" label="সর্বশেষ" /></th>
                    <th className="text-left py-3 px-4 text-vf-text-muted text-[11px] font-semibold uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <motion.tr key={customer.phone} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-[#2A2A25]/50 hover:bg-[#2A2A25]/20 transition-colors group">
                      <td className="py-3 px-4"><span className="text-vf-text-muted text-xs">{(index + 1).toLocaleString('bn-BD')}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-xs font-bold ${customer.orderCount > 1 ? 'bg-vf-gold/15 text-vf-gold border border-vf-gold/30' : 'bg-[#2A2A25] text-vf-text-muted'}`}>
                            {customer.orderCount}x
                          </span>
                          {customer.orderCount > 1 && <Repeat className="w-3 h-3 text-vf-gold" />}
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="text-vf-cream text-sm font-medium">{customer.name}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-vf-gold-dim" />
                          <span className="text-vf-cream2 text-sm font-mono">{customer.phone}</span>
                          <button onClick={() => navigator.clipboard.writeText(customer.phone)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-3 h-3 text-vf-text-muted hover:text-vf-cream" /></button>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="text-vf-text-muted text-sm">{customer.division}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-gold font-semibold text-sm">{formatTaka(customer.totalSpent)}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-cream text-sm">{customer.totalQty}</span></td>
                      <td className="py-3 px-4"><span className="text-vf-text-muted text-xs">{formatDateShort(customer.lastOrderDate)}</span></td>
                      <td className="py-3 px-4">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10" onClick={() => setDetailCustomer(customer)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results count */}
          <div className="text-center text-vf-text-muted text-xs">
            মোট {customers.length.toLocaleString('bn-BD')} জন গ্রাহক পাওয়া গেছে
          </div>
        </>
      )}

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog customer={detailCustomer} open={!!detailCustomer} onClose={() => setDetailCustomer(null)} />
    </div>
  );
}
