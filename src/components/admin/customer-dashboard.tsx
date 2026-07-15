'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Phone,
  Package,
  ShoppingCart,
  Wallet,
  CalendarClock,
  ChevronDown,
  MapPin,
  FileText,
  UserCheck,
  Loader2,
  Clock,
  PackageCheck,
  PackageOpen,
  Truck,
  Ban,
  CircleDot,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

/* ─── Types ─── */
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

interface Customer {
  name: string;
  phone: string;
  division: string;
  firstOrderDate: string;
  lastOrderDate: string;
}

interface LookupResult {
  success: boolean;
  orders: Order[];
  count: number;
  totalSpent: number;
  totalQty: number;
  customer: Customer | null;
}

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

/* ─── Helpers ─── */
function validateBangladeshPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone);
}

function formatBanglaDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return id.slice(0, 8) + '...';
}

/* ─── Status Config ─── */
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: {
    label: 'পেন্ডিং',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: 'কনফার্মড',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    icon: <CircleDot className="w-3 h-3" />,
  },
  processing: {
    label: 'প্রসেসিং',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
    icon: <PackageOpen className="w-3 h-3" />,
  },
  shipped: {
    label: 'শিপড',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: 'ডেলিভারড',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    icon: <PackageCheck className="w-3 h-3" />,
  },
  cancelled: {
    label: 'বাতিল',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: <Ban className="w-3 h-3" />,
  },
};

function getStatusConfig(status: string) {
  return statusConfig[status] || {
    label: status,
    color: 'text-vf-text-muted',
    bg: 'bg-vf-dark4 border-[#2A2A25]',
    icon: <CircleDot className="w-3 h-3" />,
  };
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[12px] font-medium ${config.bg} ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   CUSTOMER DASHBOARD
   ═══════════════════════════════════════════════ */
export default function CustomerDashboard() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setError('ফোন নম্বর লিখুন।');
      return;
    }
    if (!validateBangladeshPhone(trimmed)) {
      setError('সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন (01XXXXXXXXX)।');
      return;
    }

    setError('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(trimmed)}`);
      const data: LookupResult = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'অর্ডার খুঁজতে সমস্যা হয়েছে।');
        setResult(null);
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  const resetSearch = useCallback(() => {
    setPhone('');
    setResult(null);
    setHasSearched(false);
    setError('');
    setExpandedOrder(null);
  }, []);

  /* ─── Summary Card Component ─── */
  function SummaryCard({
    icon,
    label,
    value,
    subtext,
    delay = 0,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext?: string;
    delay?: number;
  }) {
    return (
      <motion.div variants={fadeUp} transition={{ delay }}>
        <div className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-5 text-center hover:border-vf-gold-dim/30 transition-all duration-300 group h-full">
          <div className="w-11 h-11 bg-vf-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3 text-vf-gold group-hover:bg-vf-gold/20 transition-colors">
            {icon}
          </div>
          <div className="font-display text-2xl font-bold text-vf-cream mb-1">{value}</div>
          <div className="text-[13px] text-vf-text-muted">{label}</div>
          {subtext && (
            <div className="text-[11px] text-vf-gold-dim mt-1">{subtext}</div>
          )}
        </div>
      </motion.div>
    );
  }

  /* ─── Order Card Component ─── */
  function OrderCard({ order, index }: { order: Order; index: number }) {
    const isExpanded = expandedOrder === order.id;
    const statusConf = getStatusConfig(order.status);

    return (
      <motion.div variants={fadeUp} className="relative">
        {/* Timeline connector */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#2A2A25]" />

        <Collapsible
          open={isExpanded}
          onOpenChange={(open) => setExpandedOrder(open ? order.id : null)}
        >
          <div className="relative pl-12 pb-6">
            {/* Timeline dot */}
            <div
              className={`absolute left-2.5 top-5 w-3.5 h-3.5 rounded-full border-2 z-10 ${
                order.status === 'delivered'
                  ? 'bg-green-500/20 border-green-500'
                  : order.status === 'cancelled'
                    ? 'bg-red-500/20 border-red-500'
                    : order.status === 'shipped'
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-vf-gold/20 border-vf-gold'
              }`}
            />

            <CollapsibleTrigger asChild>
              <div className="bg-vf-dark3 border border-[#2A2A25] rounded-xl p-5 cursor-pointer hover:border-[#3A3A35] transition-all duration-200 group text-left w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] text-vf-text-muted font-mono">
                        #{truncateId(order.id)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-vf-cream2">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-vf-text-muted" />
                        {formatDateShort(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-vf-text-muted" />
                        {order.quantity} পিস
                      </span>
                    </div>
                  </div>

                  {/* Amount and expand */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-vf-gold">
                        ৳{order.amount.toLocaleString('bn-BD')}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-vf-dark4 border border-[#2A2A25] flex items-center justify-center group-hover:border-vf-gold-dim/30 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 text-vf-text-muted group-hover:text-vf-gold transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <AnimatePresence>
              {isExpanded && (
                <CollapsibleContent forceMount>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 ml-0 bg-vf-dark4 border border-[#2A2A25] rounded-xl p-5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DetailRow
                          icon={<UserCheck className="w-4 h-4" />}
                          label="নাম"
                          value={order.name}
                        />
                        <DetailRow
                          icon={<Phone className="w-4 h-4" />}
                          label="ফোন"
                          value={order.phone}
                        />
                        <DetailRow
                          icon={<MapPin className="w-4 h-4" />}
                          label="ঠিকানা"
                          value={order.address || 'নেই'}
                          full
                        />
                        <DetailRow
                          icon={<MapPin className="w-4 h-4" />}
                          label="বিভাগ"
                          value={order.division || 'নেই'}
                        />
                        <DetailRow
                          icon={<Package className="w-4 h-4" />}
                          label="পরিমাণ"
                          value={`${order.quantity} পিস`}
                        />
                        <DetailRow
                          icon={<Wallet className="w-4 h-4" />}
                          label="মোট মূল্য"
                          value={`৳${order.amount.toLocaleString('bn-BD')}`}
                        />
                      </div>
                      {order.notes && (
                        <div className="pt-3 border-t border-[#2A2A25]">
                          <DetailRow
                            icon={<FileText className="w-4 h-4" />}
                            label="নোট"
                            value={order.notes}
                            full
                          />
                        </div>
                      )}
                      <div className="pt-3 border-t border-[#2A2A25] flex items-center justify-between text-[12px] text-vf-text-muted">
                        <span>
                          তৈরি: {formatBanglaDate(order.createdAt)}
                        </span>
                        <span>
                          আপডেট: {formatBanglaDate(order.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              )}
            </AnimatePresence>
          </div>
        </Collapsible>
      </motion.div>
    );
  }

  /* ─── Detail Row ─── */
  function DetailRow({
    icon,
    label,
    value,
    full = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    full?: boolean;
  }) {
    return (
      <div className={`flex items-start gap-2.5 ${full ? 'sm:col-span-2' : ''}`}>
        <div className="text-vf-gold-dim mt-0.5 flex-shrink-0">{icon}</div>
        <div>
          <div className="text-[11px] text-vf-text-muted uppercase tracking-wider mb-0.5">
            {label}
          </div>
          <div className="text-[14px] text-vf-cream2">{value}</div>
        </div>
      </div>
    );
  }

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-[#0A0A08] relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-vf-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* ─── INITIAL STATE ─── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Welcome header */}
              <motion.div
                className="text-center mb-10"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-vf-gold/10 border border-vf-gold-dim/20 rounded-2xl mb-5">
                    <UserCheck className="w-8 h-8 text-vf-gold" />
                  </div>
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-4xl font-black text-vf-cream mb-3"
                >
                  আপনার <span className="text-gradient-gold">অর্ডার</span> ট্র্যাক করুন
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="text-[15px] text-vf-cream2 max-w-md mx-auto leading-relaxed"
                >
                  আপনার মোবাইল নম্বর দিলে আমরা আপনার সকল অর্ডারের
                  তথ্য, স্ট্যাটাস ও হিসাব দেখাবো।
                </motion.p>
              </motion.div>

              {/* Search box */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                <div className="bg-vf-dark3 border border-[#2A2A25] rounded-2xl p-6 sm:p-8">
                  <div className="text-[11px] font-semibold tracking-[2px] uppercase text-vf-gold text-center mb-5">
                    আপনার মোবাইল নম্বর দিন
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vf-text-muted" />
                      <Input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/[^0-9]/g, ''));
                          if (error) setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={11}
                        className="h-12 pl-11 text-[16px] bg-vf-dark4 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted/60 focus:border-vf-gold-dim focus:ring-vf-gold-dim/20 rounded-xl"
                        dir="ltr"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={isLoading || phone.length === 0}
                      className="h-12 px-6 bg-vf-gold hover:bg-vf-gold-light text-[#0A0A08] font-bold rounded-xl text-[15px] transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-vf-gold/10"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                      <span className="sm:inline">খুঁজুন</span>
                    </Button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-[13px] mt-3 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-vf-text-muted">
                    <Sparkles className="w-3 h-3 text-vf-gold-dim" />
                    <span>বাংলাদেশি মোবাইল নম্বর (01 দিয়ে শুরু, ১১ সংখ্যা)</span>
                  </div>
                </div>
              </motion.div>

              {/* Feature hints */}
              <motion.div
                className="grid grid-cols-3 gap-3 mt-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {[
                  { icon: <Package className="w-4 h-4" />, text: 'সকল অর্ডার' },
                  { icon: <Clock className="w-4 h-4" />, text: 'লাইভ স্ট্যাটাস' },
                  { icon: <Wallet className="w-4 h-4" />, text: 'মোট হিসাব' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="text-center py-3 px-2"
                  >
                    <div className="text-vf-gold-dim mb-1.5 flex justify-center">
                      {item.icon}
                    </div>
                    <div className="text-[12px] text-vf-text-muted">{item.text}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ─── LOADING STATE ─── */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="w-14 h-14 border-2 border-vf-gold-dim/30 border-t-vf-gold rounded-full animate-spin mb-5" />
              <p className="text-[15px] text-vf-cream2">অর্ডার খুঁজছি...</p>
            </motion.div>
          )}

          {/* ─── RESULTS STATE ─── */}
          {!isLoading && hasSearched && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Customer found */}
              {result.customer && (
                <>
                  {/* Customer greeting */}
                  <motion.div
                    className="text-center mb-8"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                  >
                    <motion.div variants={fadeUp} className="mb-2">
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[2px] uppercase text-vf-green-light bg-vf-green/10 border border-vf-green-light/20 px-4 py-1.5 rounded-full">
                        <UserCheck className="w-3.5 h-3.5" />
                        গ্রাহক পাওয়া গেছে
                      </span>
                    </motion.div>
                    <motion.h2
                      variants={fadeUp}
                      className="font-display text-2xl sm:text-3xl font-bold text-vf-cream"
                    >
                      স্বাগতম, <span className="text-gradient-gold">{result.customer.name}</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-[14px] text-vf-text-muted mt-1">
                      {result.customer.division} · {result.customer.phone}
                    </motion.p>
                  </motion.div>

                  {/* Summary Cards */}
                  <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 mb-10"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                  >
                    <SummaryCard
                      icon={<ShoppingCart className="w-5 h-5" />}
                      label="মোট অর্ডার"
                      value={`${result.count} টি`}
                      subtext="সফল অর্ডার"
                      delay={0}
                    />
                    <SummaryCard
                      icon={<Package className="w-5 h-5" />}
                      label="মোট পণ্য"
                      value={`${result.totalQty} পিস`}
                      subtext="অর্ডারকৃত"
                      delay={0.05}
                    />
                    <SummaryCard
                      icon={<Wallet className="w-5 h-5" />}
                      label="মোট খরচ"
                      value={`৳${result.totalSpent.toLocaleString('bn-BD')}`}
                      subtext="সকল অর্ডার মিলিয়ে"
                      delay={0.1}
                    />
                    <SummaryCard
                      icon={<CalendarClock className="w-5 h-5" />}
                      label="প্রথম অর্ডার"
                      value={formatDateShort(result.customer.firstOrderDate)}
                      subtext="গ্রাহক হিসেবে"
                      delay={0.15}
                    />
                  </motion.div>
                </>
              )}

              {/* No orders found */}
              {result.customer === null && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  <motion.div variants={scaleIn} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-vf-dark4 border border-[#2A2A25] rounded-2xl mb-5">
                      <Package className="w-8 h-8 text-vf-text-muted" />
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-vf-cream mb-3">
                      এই নম্বরে কোনো অর্ডার{' '}
                      <span className="text-vf-gold">পাওয়া যায়নি</span>
                    </h2>
                    <p className="text-[15px] text-vf-cream2 max-w-md mx-auto leading-relaxed">
                      আপনি যে নম্বর দিয়েছেন সেটিতে কোনো অর্ডার নেই।
                      আমাদের ল্যান্ডিং পেজ থেকে অর্ডার করতে পারেন।
                    </p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="text-center">
                    <Button
                      onClick={resetSearch}
                      className="bg-vf-gold hover:bg-vf-gold-light text-[#0A0A08] font-bold rounded-xl px-6 h-11 text-[14px] transition-all duration-200"
                    >
                      অন্য নম্বর দিয়ে খুঁজুন
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Order History */}
              {result.orders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg font-bold text-vf-cream flex items-center gap-2">
                      <Clock className="w-5 h-5 text-vf-gold" />
                      অর্ডারের তালিকা
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-vf-text-muted border-[#2A2A25] text-[12px]"
                    >
                      {result.count} টি অর্ডার
                    </Badge>
                  </div>

                  <motion.div
                    className="space-y-0"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                  >
                    {result.orders.map((order, index) => (
                      <OrderCard key={order.id} order={order} index={index} />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Back button */}
              <motion.div
                className="mt-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={resetSearch}
                  variant="ghost"
                  className="text-vf-text-muted hover:text-vf-cream hover:bg-vf-dark4 text-[14px]"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 mr-1" />
                  অন্য নম্বর দিয়ে খুঁজুন
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ─── ERROR STATE (no result, has error) ─── */}
          {!isLoading && hasSearched && !result && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
                <Ban className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-vf-cream mb-2">
                সমস্যা হয়েছে
              </h3>
              <p className="text-[14px] text-vf-text-muted mb-6">{error}</p>
              <Button
                onClick={resetSearch}
                className="bg-vf-gold hover:bg-vf-gold-light text-[#0A0A08] font-bold rounded-xl px-6 h-11 text-[14px] transition-all duration-200"
              >
                আবার চেষ্টা করুন
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
