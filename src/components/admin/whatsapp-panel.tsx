'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Clock,
  FileText,
  Zap,
  Search,
  X,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  Phone,
  User,
  Hash,
  Loader2,
  Inbox,
  Calendar,
  ChevronDown,
  AlertCircle,
  Copy,
  Play,
  Pause,
  Timer,
  Tag,
  Variable,
  Users,
  Type,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerInfo {
  phone: string;
  name: string;
  orderCount: number;
  lastOrderDate: string;
  lastOrderId: string;
  lastStatus: string;
}

interface TemplateData {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AutomationData {
  id: string;
  name: string;
  triggerType: string;
  triggerValue: string;
  templateId: string;
  templateName: string;
  isActive: boolean;
  delayMinutes: number;
  createdAt: string;
  updatedAt: string;
}

interface MessageRecord {
  id: string;
  phone: string;
  customerName: string;
  message: string;
  status: string;
  type: string;
  templateName: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  order_update: { label: 'অর্ডার আপডেট', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30' },
  promotion: { label: 'প্রমোশন', color: 'text-yellow-400', bgColor: 'bg-yellow-500/15', borderColor: 'border-yellow-500/30' },
  reminder: { label: 'রিমাইন্ডার', color: 'text-orange-400', bgColor: 'bg-orange-500/15', borderColor: 'border-orange-500/30' },
  follow_up: { label: 'ফলো-আপ', color: 'text-green-400', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/30' },
  general: { label: 'সাধারণ', color: 'text-gray-400', bgColor: 'bg-gray-500/15', borderColor: 'border-gray-500/30' },
};

const MSG_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  pending: { label: 'পেন্ডিং', color: 'text-yellow-400', bgColor: 'bg-yellow-500/15', borderColor: 'border-yellow-500/30' },
  sent: { label: 'পাঠানো হয়েছে', color: 'text-green-400', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/30' },
  delivered: { label: 'ডেলিভার্ড', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30' },
  failed: { label: 'ব্যর্থ', color: 'text-red-400', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/30' },
};

const MSG_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  manual: { label: 'ম্যানুয়াল', color: 'text-vf-cream2', bgColor: 'bg-[#2A2A25]' },
  scheduled: { label: 'শিডিউল্ড', color: 'text-purple-400', bgColor: 'bg-purple-500/15' },
  automation: { label: 'অটোমেশন', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15' },
};

const TRIGGER_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  status_change: { label: 'স্ট্যাটাস পরিবর্তন', color: 'text-orange-400', bgColor: 'bg-orange-500/15' },
  new_order: { label: 'নতুন অর্ডার', color: 'text-green-400', bgColor: 'bg-green-500/15' },
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const VARIABLE_HINTS = [
  { key: '{{name}}', desc: 'গ্রাহকের নাম' },
  { key: '{{phone}}', desc: 'ফোন নম্বর' },
  { key: '{{order_id}}', desc: 'অর্ডার আইডি' },
  { key: '{{status}}', desc: 'অর্ডার স্ট্যাটাস' },
  { key: '{{amount}}', desc: 'অর্ডারের পরিমাণ' },
];

const WA_GREEN = '#25D366';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function truncate(text: string, len: number) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div');
  el.className = `fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2 transition-all duration-300 ${type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'}`;
  el.innerHTML = `${type === 'success' ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'}${message}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.color} ${config.bgColor} ${config.borderColor}`}>
      <Tag className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

function MsgStatusBadge({ status }: { status: string }) {
  const config = MSG_STATUS_CONFIG[status] || MSG_STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.color} ${config.bgColor} ${config.borderColor}`}>
      {status === 'pending' && <Clock className="w-2.5 h-2.5" />}
      {status === 'sent' && <Send className="w-2.5 h-2.5" />}
      {status === 'delivered' && <Check className="w-2.5 h-2.5" />}
      {status === 'failed' && <AlertCircle className="w-2.5 h-2.5" />}
      {config.label}
    </span>
  );
}

function MsgTypeBadge({ type }: { type: string }) {
  const config = MSG_TYPE_CONFIG[type] || MSG_TYPE_CONFIG.manual;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-vf-dark4 border border-[#2A2A25] rounded-xl p-10 text-center">
      <div className="w-16 h-16 bg-[#2A2A25] rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-vf-text-muted" />
      </div>
      <p className="text-vf-text-muted text-sm">{message}</p>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full bg-[#2A2A25] rounded-xl" />
      ))}
    </div>
  );
}

// ─── Custom Scrollbar Styles ──────────────────────────────────────────────────

const scrollbarClass = 'scrollbar-thin scrollbar-thumb-[#2A2A25] scrollbar-track-transparent hover:scrollbar-thumb-[#3A3A35]';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type WhatsAppTab = 'send' | 'templates' | 'automation';

export default function WhatsAppPanel() {
  const [activeTab, setActiveTab] = useState<WhatsAppTab>('send');

  const tabs: { key: WhatsAppTab; label: string; shortLabel: string; icon: React.ElementType }[] = [
    { key: 'send', label: 'মেসেজ পাঠান', shortLabel: 'পাঠান', icon: Send },
    { key: 'templates', label: 'টেমপ্লেট', shortLabel: 'টেমপ্লেট', icon: FileText },
    { key: 'automation', label: 'অটোমেশন', shortLabel: 'অটো', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${WA_GREEN}20`, border: `1px solid ${WA_GREEN}40` }}>
            <MessageSquare className="w-5 h-5" style={{ color: WA_GREEN }} />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-vf-gold">WhatsApp মেসেজিং</h2>
            <p className="text-vf-text-muted text-xs">গ্রাহকদের কাছে মেসেজ পাঠান ও অটোমেশন ম্যানেজ করুন</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="flex items-center gap-2 bg-vf-dark4 border border-[#2A2A25] rounded-xl p-1.5 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white border border-transparent'
                    : 'text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]/50 border border-transparent'
                }`}
                style={isActive ? { background: `${WA_GREEN}20`, color: WA_GREEN, borderColor: `${WA_GREEN}40` } : {}}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'send' && (
          <motion.div key="send" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }}>
            <SendMessageTab />
          </motion.div>
        )}
        {activeTab === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
            <TemplatesTab />
          </motion.div>
        )}
        {activeTab === 'automation' && (
          <motion.div key="automation" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
            <AutomationTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEND MESSAGE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function SendMessageTab() {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [messageText, setMessageText] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  // Fetch customers, templates, messages
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCustomers(data.customers || []);
      }
    } catch {}
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplates(data.templates || []);
      }
    } catch {}
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages?limit=20');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setMessages(data.messages || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchTemplates(), fetchMessages()]);
      setLoading(false);
    };
    load();
  }, [fetchCustomers, fetchTemplates, fetchMessages]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return customers;
    const q = debouncedSearch.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, debouncedSearch]);

  const allSelected = filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedPhones.has(c.phone));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPhones(new Set());
    } else {
      setSelectedPhones(new Set(filteredCustomers.map((c) => c.phone)));
    }
  };

  const togglePhone = (phone: string) => {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const insertTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setMessageText(tpl.content);
      setSelectedTemplate(tpl.name);
    }
  };

  const insertVariable = (variable: string) => {
    setMessageText((prev) => prev + variable);
  };

  const handleSend = async (type: 'now' | 'scheduled') => {
    if (selectedPhones.size === 0 || !messageText.trim()) {
      showToast('গ্রাহক এবং মেসেজ নির্বাচন করুন', 'error');
      return;
    }

    setSending(true);
    try {
      const selectedCustomerInfos = customers.filter((c) => selectedPhones.has(c.phone));
      const body = {
        phones: Array.from(selectedPhones),
        message: messageText,
        customerNames: selectedCustomerInfos.map((c) => c.name),
        orderIds: selectedCustomerInfos.map((c) => c.lastOrderId),
        scheduledAt: type === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        type: type === 'scheduled' ? 'scheduled' : 'manual',
        templateName: selectedTemplate || '',
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`${selectedPhones.size} টি মেসেজ ${type === 'scheduled' ? 'শিডিউল' : 'পাঠানো'} হয়েছে`);
        setSelectedPhones(new Set());
        setMessageText('');
        setSelectedTemplate('');
        setScheduledAt('');
        setShowScheduler(false);
        fetchMessages();
        fetchCustomers();
      } else {
        showToast(data.error || 'মেসেজ পাঠাতে সমস্যা হয়েছে', 'error');
      }
    } catch {
      showToast('নেটওয়ার্ক সমস্যা', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshMessages = () => {
    fetchMessages();
    showToast('মেসেজ তালিকা রিফ্রেশ হয়েছে');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[400px] w-full bg-[#2A2A25] rounded-xl" />
          <Skeleton className="h-[400px] w-full bg-[#2A2A25] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Customer Selection ─── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2A25]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-vf-cream font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: WA_GREEN }} />
                গ্রাহক নির্বাচন
              </h3>
              {selectedPhones.size > 0 && (
                <Badge className="text-[11px] font-bold px-2.5" style={{ background: `${WA_GREEN}20`, color: WA_GREEN, borderColor: `${WA_GREEN}40`, border: '1px solid' }}>
                  {selectedPhones.size} জন নির্বাচিত
                </Badge>
              )}
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vf-text-muted" />
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 pl-10 h-10 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vf-text-muted hover:text-vf-cream transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Select All */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366] data-[state=checked]:text-white"
              />
              <span className="text-vf-text-muted text-xs">সব নির্বাচন ({filteredCustomers.length})</span>
            </div>
          </div>
          {/* Customer List */}
          <div className={`max-h-72 overflow-y-auto ${scrollbarClass}`}>
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-8 h-8 text-vf-text-muted mx-auto mb-2" />
                <p className="text-vf-text-muted text-xs">{debouncedSearch ? 'কোনো গ্রাহক খুঁজে পাওয়া যায়নি' : 'কোনো গ্রাহক নেই'}</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="visible" className="divide-y divide-[#2A2A25]/50">
                {filteredCustomers.map((customer) => (
                  <motion.div
                    key={customer.phone}
                    variants={fadeUp}
                    className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                      selectedPhones.has(customer.phone) ? 'bg-[#25D366]/5' : 'hover:bg-[#2A2A25]/30'
                    }`}
                    onClick={() => togglePhone(customer.phone)}
                  >
                    <Checkbox
                      checked={selectedPhones.has(customer.phone)}
                      onCheckedChange={() => togglePhone(customer.phone)}
                      className="data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366] data-[state=checked]:text-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-vf-text-muted flex-shrink-0" />
                        <span className="text-vf-cream text-sm font-medium truncate">{customer.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-vf-text-muted text-[11px] flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {customer.phone}
                        </span>
                        <span className="text-vf-text-muted text-[11px]">{customer.orderCount}x অর্ডার</span>
                      </div>
                    </div>
                    <span className="text-vf-text-muted text-[10px] hidden sm:block">{formatDateShort(customer.lastOrderDate)}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Message Composer ─── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2A25]">
            <h3 className="text-vf-cream font-semibold text-sm flex items-center gap-2 mb-3">
              <Type className="w-4 h-4" style={{ color: WA_GREEN }} />
              মেসেজ কম্পোজার
            </h3>
            {/* Template Dropdown */}
            {templates.length > 0 && (
              <div className="mb-3">
                <Select onValueChange={insertTemplate} value="">
                  <SelectTrigger className="bg-vf-dark3 border-[#2A2A25] text-vf-cream text-sm w-full h-9 focus:border-[#25D366]/50">
                    <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent className="bg-vf-dark4 border-[#2A2A25]">
                    {templates.filter((t) => t.isActive).map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id} className="text-vf-cream text-xs focus:bg-[#2A2A25] focus:text-vf-cream">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-vf-text-muted" />
                          {tpl.name}
                          <CategoryBadge category={tpl.category} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedTemplate && (
              <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs" style={{ background: `${WA_GREEN}10`, border: `1px solid ${WA_GREEN}30` }}>
                <FileText className="w-3 h-3" style={{ color: WA_GREEN }} />
                <span style={{ color: WA_GREEN }}>{selectedTemplate}</span>
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                placeholder="আপনার মেসেজ লিখুন..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 min-h-[140px] text-sm resize-none"
                rows={5}
              />
              <div className="absolute bottom-2 right-2 text-vf-text-muted text-[10px]">
                {messageText.length} অক্ষর
              </div>
            </div>

            {/* Variable Hints */}
            <div>
              <p className="text-vf-text-muted text-[11px] mb-1.5 flex items-center gap-1">
                <Variable className="w-3 h-3" />
                ভ্যারিয়েবল যোগ করুন:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_HINTS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => insertVariable(v.key)}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-medium transition-all duration-200 hover:scale-105 border border-[#2A2A25] text-vf-text-muted hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/5"
                    title={v.desc}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Options */}
            <Separator className="bg-[#2A2A25]" />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleSend('now')}
                disabled={sending || selectedPhones.size === 0 || !messageText.trim()}
                className="flex-1 h-10 text-sm font-semibold text-white transition-all duration-200"
                style={{ background: WA_GREEN }}
                onMouseEnter={(e) => { (e.currentTarget.style.background = '#1EBE57'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.background = WA_GREEN); }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                এখনই পাঠান ({selectedPhones.size})
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScheduler(!showScheduler)}
                className="h-10 text-sm border-[#2A2A25] text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]"
              >
                <Timer className="w-4 h-4 mr-2" />
                টাইমার সেট করুন
              </Button>
            </div>

            {/* Scheduler */}
            <AnimatePresence>
              {showScheduler && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-vf-dark3 border border-[#2A2A25] rounded-lg p-3 space-y-2">
                    <Label className="text-vf-text-muted text-xs">শিডিউলের তারিখ ও সময়</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-vf-dark4 border-[#2A2A25] text-vf-cream text-sm h-9 focus:border-[#25D366]/50"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Button
                      onClick={() => handleSend('scheduled')}
                      disabled={sending || selectedPhones.size === 0 || !messageText.trim() || !scheduledAt}
                      className="w-full h-9 text-sm font-semibold text-vf-gold bg-vf-gold/15 border border-vf-gold/30 hover:bg-vf-gold/25"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                      শিডিউল করুন
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ─── Message History ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="bg-vf-dark4 border border-[#2A2A25] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2A2A25] flex items-center justify-between">
          <h3 className="text-vf-cream font-semibold text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-vf-text-muted" />
            সাম্প্রতিক মেসেজ
          </h3>
          <Button variant="ghost" size="sm" onClick={handleRefreshMessages} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25] h-8 text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            রিফ্রেশ
          </Button>
        </div>
        <div className={`max-h-96 overflow-y-auto ${scrollbarClass}`}>
          {messages.length === 0 ? (
            <EmptyState icon={Inbox} message="এখনো কোনো মেসেজ পাঠানো হয়নি।" />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="divide-y divide-[#2A2A25]/50">
              {messages.map((msg) => (
                <motion.div key={msg.id} variants={fadeUp} className="p-4 hover:bg-[#2A2A25]/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-vf-cream text-sm font-medium">{msg.customerName || 'অজানা'}</span>
                        <span className="text-vf-text-muted text-xs">{msg.phone}</span>
                        <MsgTypeBadge type={msg.type} />
                      </div>
                      <p className="text-vf-cream2 text-xs leading-relaxed">{truncate(msg.message, 100)}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-vf-text-muted text-[10px]">{formatDate(msg.createdAt)}</span>
                        {msg.templateName && (
                          <span className="text-vf-text-muted text-[10px] flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            {msg.templateName}
                          </span>
                        )}
                        {msg.scheduledAt && (
                          <span className="text-purple-400 text-[10px] flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDateShort(msg.scheduledAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <MsgStatusBadge status={msg.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function TemplatesTab() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<TemplateData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formContent, setFormContent] = useState('');
  const [formVariables, setFormVariables] = useState('');

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplates(data.templates || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openNewDialog = () => {
    setEditId(null);
    setFormName('');
    setFormCategory('general');
    setFormContent('');
    setFormVariables('');
    setDialogOpen(true);
  };

  const openEditDialog = (tpl: TemplateData) => {
    setEditId(tpl.id);
    setFormName(tpl.name);
    setFormCategory(tpl.category);
    setFormContent(tpl.content);
    setFormVariables(tpl.variables);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formContent.trim()) {
      showToast('নাম ও কন্টেন্ট আবশ্যক', 'error');
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        category: formCategory,
        content: formContent.trim(),
        variables: formVariables,
      };

      const url = editId ? `/api/messages/templates/${editId}` : '/api/messages/templates';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editId ? 'টেমপ্লেট আপডেট হয়েছে' : 'নতুন টেমপ্লেট তৈরি হয়েছে');
        setDialogOpen(false);
        fetchTemplates();
      } else {
        showToast(data.error || 'সমস্যা হয়েছে', 'error');
      }
    } catch {
      showToast('নেটওয়ার্ক সমস্যা', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/templates/${deleteDialog.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('টেমপ্লেট মুছে ফেলা হয়েছে');
        setTemplates((prev) => prev.filter((t) => t.id !== deleteDialog.id));
        setDeleteDialog(null);
      } else {
        showToast(data.error || 'মুছতে সমস্যা হয়েছে', 'error');
      }
    } catch {} finally {
      setDeleting(false);
    }
  };

  const extractVars = (content: string) => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches)].join(', ');
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-vf-cream font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: WA_GREEN }} />
          সকল টেমপ্লেট ({templates.length})
        </h3>
        <Button
          onClick={openNewDialog}
          className="h-9 text-xs font-semibold text-white"
          style={{ background: WA_GREEN }}
          onMouseEnter={(e) => { (e.currentTarget.style.background = '#1EBE57'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.background = WA_GREEN); }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          নতুন টেমপ্লেট
        </Button>
      </div>

      {/* Template List */}
      {templates.length === 0 ? (
        <EmptyState icon={FileText} message="এখনো কোনো টেমপ্লেট নেই। নতুন টেমপ্লেট তৈরি করুন।" />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((tpl) => (
            <motion.div
              key={tpl.id}
              variants={fadeUp}
              className="bg-vf-dark3 border border-[#2A2A25] rounded-xl overflow-hidden hover:border-[#3A3A35] transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-vf-cream font-semibold text-sm truncate">{tpl.name}</h4>
                      {!tpl.isActive && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-gray-500/15 text-gray-400 border border-gray-500/30">নিষ্ক্রিয়</Badge>
                      )}
                    </div>
                    <CategoryBadge category={tpl.category} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10"
                      onClick={() => openEditDialog(tpl)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-vf-text-muted hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteDialog(tpl)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-vf-cream2 text-xs leading-relaxed mb-2 line-clamp-2">{tpl.content}</p>
                {tpl.variables && (
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.split(',').map((v) => v.trim()).filter(Boolean).map((v) => (
                      <span key={v} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2A2A25] text-vf-gold-dim">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-vf-gold font-display text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editId ? 'টেমপ্লেট সম্পাদনা' : 'নতুন টেমপ্লেট'}
            </DialogTitle>
            <DialogDescription className="text-vf-text-muted text-xs">
              {editId ? 'টেমপ্লেটের তথ্য আপডেট করুন' : 'নতুন মেসেজ টেমপ্লেট তৈরি করুন'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">টেমপ্লেটের নাম *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="যেমন: অর্ডার কনফার্মেশন"
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">ক্যাটাগরি</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="bg-vf-dark3 border-[#2A2A25] text-vf-cream text-sm w-full h-9 focus:border-[#25D366]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-vf-dark4 border-[#2A2A25]">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-vf-cream text-xs focus:bg-[#2A2A25] focus:text-vf-cream">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-vf-text-muted text-xs">কন্টেন্ট *</Label>
                <span className="text-vf-text-muted text-[10px]">{formContent.length} অক্ষর</span>
              </div>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="মেসেজের বিষয়বস্তু লিখুন... {{name}}, {{phone}} ইত্যাদি ভ্যারিয়েবল ব্যবহার করুন"
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 min-h-[120px] text-sm resize-none"
                rows={5}
              />
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_HINTS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setFormContent((prev) => prev + v.key)}
                    className="px-2 py-1 rounded-md text-[10px] font-mono border border-[#2A2A25] text-vf-text-muted hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all"
                    title={v.desc}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">ভ্যারিয়েবল (কমা দিয়ে আলাদা)</Label>
              <Input
                value={formVariables}
                onChange={(e) => setFormVariables(e.target.value)}
                placeholder="name, phone, order_id"
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 h-9 text-sm font-mono"
              />
              {formContent && !formVariables && extractVars(formContent) && (
                <button
                  onClick={() => {
                    const vars = extractVars(formContent);
                    const cleanVars = vars.replace(/\{\{|\}\}/g, '').replace(/,\s*$/, '');
                    setFormVariables(cleanVars);
                  }}
                  className="text-[11px] flex items-center gap-1 hover:underline" style={{ color: WA_GREEN }}
                >
                  <Zap className="w-3 h-3" />
                  কন্টেন্ট থেকে অটো-ডিটেক্ট করুন
                </button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]">
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formContent.trim()}
              className="text-white text-sm"
              style={{ background: WA_GREEN }}
              onMouseEnter={(e) => { (e.currentTarget.style.background = '#1EBE57'); }}
              onMouseLeave={(e) => { (e.currentTarget.style.background = WA_GREEN); }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="bg-vf-dark4 border-[#2A2A25]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-vf-cream">টেমপ্লেট মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription className="text-vf-text-muted">
              &ldquo;{deleteDialog?.name}&rdquo; টেমপ্লেট মুছে ফেলা হবে। এটি পুনরুদ্ধার করা যাবে না।
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

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATION TAB
// ═══════════════════════════════════════════════════════════════════════════════

function AutomationTab() {
  const [automations, setAutomations] = useState<AutomationData[]>([]);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<AutomationData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTriggerType, setFormTriggerType] = useState('status_change');
  const [formTriggerValue, setFormTriggerValue] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formDelay, setFormDelay] = useState(0);

  const fetchAutomations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages/automations');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAutomations(data.automations || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplates((data.templates || []).filter((t: TemplateData) => t.isActive));
      }
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchAutomations(), fetchTemplates()]);
  }, [fetchAutomations, fetchTemplates]);

  const openNewDialog = () => {
    setEditId(null);
    setFormName('');
    setFormTriggerType('status_change');
    setFormTriggerValue('');
    setFormTemplateId('');
    setFormDelay(0);
    setDialogOpen(true);
  };

  const openEditDialog = (auto: AutomationData) => {
    setEditId(auto.id);
    setFormName(auto.name);
    setFormTriggerType(auto.triggerType);
    setFormTriggerValue(auto.triggerValue);
    setFormTemplateId(auto.templateId);
    setFormDelay(auto.delayMinutes);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formTemplateId) {
      showToast('নাম ও টেমপ্লেট আবশ্যক', 'error');
      return;
    }
    if (formTriggerType === 'status_change' && !formTriggerValue) {
      showToast('স্ট্যাটাস নির্বাচন করুন', 'error');
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        triggerType: formTriggerType,
        triggerValue: formTriggerValue,
        templateId: formTemplateId,
        delayMinutes: formDelay,
      };

      const url = editId ? `/api/messages/automations/${editId}` : '/api/messages/automations';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editId ? 'অটোমেশন আপডেট হয়েছে' : 'নতুন অটোমেশন তৈরি হয়েছে');
        setDialogOpen(false);
        fetchAutomations();
      } else {
        showToast(data.error || 'সমস্যা হয়েছে', 'error');
      }
    } catch {
      showToast('নেটওয়ার্ক সমস্যা', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/automations/${deleteDialog.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('অটোমেশন মুছে ফেলা হয়েছে');
        setAutomations((prev) => prev.filter((a) => a.id !== deleteDialog.id));
        setDeleteDialog(null);
      } else {
        showToast(data.error || 'মুছতে সমস্যা হয়েছে', 'error');
      }
    } catch {} finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (auto: AutomationData) => {
    try {
      const res = await fetch(`/api/messages/automations/${auto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !auto.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === auto.id ? { ...a, isActive: !a.isActive } : a))
        );
        showToast(auto.isActive ? 'অটোমেশন নিষ্ক্রিয় করা হয়েছে' : 'অটোমেশন সক্রিয় করা হয়েছে');
      }
    } catch {}
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-vf-cream font-semibold text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: WA_GREEN }} />
          অটোমেশন নিয়ম ({automations.length})
        </h3>
        <Button
          onClick={openNewDialog}
          className="h-9 text-xs font-semibold text-white"
          style={{ background: WA_GREEN }}
          onMouseEnter={(e) => { (e.currentTarget.style.background = '#1EBE57'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.background = WA_GREEN); }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          নতুন অটোমেশন
        </Button>
      </div>

      {/* Automation List */}
      {automations.length === 0 ? (
        <EmptyState icon={Zap} message="এখনো কোনো অটোমেশন নেই। নতুন অটোমেশন তৈরি করুন।" />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          {automations.map((auto) => {
            const triggerConfig = TRIGGER_CONFIG[auto.triggerType] || TRIGGER_CONFIG.status_change;
            return (
              <motion.div
                key={auto.id}
                variants={fadeUp}
                className="bg-vf-dark3 border border-[#2A2A25] rounded-xl overflow-hidden hover:border-[#3A3A35] transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-vf-cream font-semibold text-sm">{auto.name}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${triggerConfig.color} ${triggerConfig.bgColor}`}>
                          <Play className="w-2.5 h-2.5 mr-1" />
                          {triggerConfig.label}
                        </span>
                        {auto.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
                            <Check className="w-2.5 h-2.5 mr-0.5" />সক্রিয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                            <Pause className="w-2.5 h-2.5 mr-0.5" />নিষ্ক্রিয়
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-vf-text-muted">ট্রিগার:</span>
                          <span className="text-vf-cream font-medium">
                            {auto.triggerType === 'status_change' ? `স্ট্যাটাস → ${auto.triggerValue}` : 'নতুন অর্ডার'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-vf-text-muted">টেমপ্লেট:</span>
                          <span className="text-vf-cream font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3 text-vf-gold-dim" />
                            {auto.templateName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-vf-text-muted">ডিলে:</span>
                          <span className="text-vf-cream font-medium">
                            {auto.delayMinutes > 0 ? `${auto.delayMinutes} মিনিট পরে` : 'তাৎক্ষণিক'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Switch
                        checked={auto.isActive}
                        onCheckedChange={() => handleToggleActive(auto)}
                        className="data-[state=checked]:bg-[#25D366] data-[state=unchecked]:bg-[#2A2A25]"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-vf-text-muted hover:text-vf-gold hover:bg-vf-gold/10"
                        onClick={() => openEditDialog(auto)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-vf-text-muted hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteDialog(auto)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-vf-gold font-display text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {editId ? 'অটোমেশন সম্পাদনা' : 'নতুন অটোমেশন'}
            </DialogTitle>
            <DialogDescription className="text-vf-text-muted text-xs">
              কখন ও কোন মেসেজ অটোমেটিক পাঠাবে তা সেট করুন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">অটোমেশনের নাম *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="যেমন: শিপড হলে নোটিফিকেশন"
                className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">ট্রিগার টাইপ *</Label>
              <Select value={formTriggerType} onValueChange={(v) => { setFormTriggerType(v); setFormTriggerValue(''); }}>
                <SelectTrigger className="bg-vf-dark3 border-[#2A2A25] text-vf-cream text-sm w-full h-9 focus:border-[#25D366]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-vf-dark4 border-[#2A2A25]">
                  {Object.entries(TRIGGER_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-vf-cream text-xs focus:bg-[#2A2A25] focus:text-vf-cream">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formTriggerType === 'status_change' && (
              <div className="space-y-2">
                <Label className="text-vf-text-muted text-xs">কোন স্ট্যাটাসে ট্রিগার হবে *</Label>
                <Select value={formTriggerValue} onValueChange={setFormTriggerValue}>
                  <SelectTrigger className="bg-vf-dark3 border-[#2A2A25] text-vf-cream text-sm w-full h-9 focus:border-[#25D366]/50">
                    <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent className="bg-vf-dark4 border-[#2A2A25]">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-vf-cream text-xs focus:bg-[#2A2A25] focus:text-vf-cream">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">টেমপ্লেট *</Label>
              <Select value={formTemplateId} onValueChange={setFormTemplateId}>
                <SelectTrigger className="bg-vf-dark3 border-[#2A2A25] text-vf-cream text-sm w-full h-9 focus:border-[#25D366]/50">
                  <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-vf-dark4 border-[#2A2A25]">
                  {templates.length === 0 ? (
                    <div className="px-3 py-2 text-vf-text-muted text-xs">কোনো টেমপ্লেট নেই</div>
                  ) : (
                    templates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id} className="text-vf-cream text-xs focus:bg-[#2A2A25] focus:text-vf-cream">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-vf-text-muted" />
                          {tpl.name}
                          <CategoryBadge category={tpl.category} />
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-vf-text-muted text-xs">
                ডিলে: ট্রিগারের কত মিনিট পরে পাঠাবেন
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={10080}
                  value={formDelay}
                  onChange={(e) => setFormDelay(parseInt(e.target.value) || 0)}
                  className="bg-vf-dark3 border-[#2A2A25] text-vf-cream placeholder:text-vf-text-muted focus:border-[#25D366]/50 h-9 text-sm w-24"
                  placeholder="0"
                />
                <span className="text-vf-text-muted text-xs">
                  {formDelay > 0 ? `${formDelay} মিনিট পরে পাঠানো হবে` : 'তাৎক্ষণিক পাঠানো হবে'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25]">
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formTemplateId || (formTriggerType === 'status_change' && !formTriggerValue)}
              className="text-white text-sm"
              style={{ background: WA_GREEN }}
              onMouseEnter={(e) => { (e.currentTarget.style.background = '#1EBE57'); }}
              onMouseLeave={(e) => { (e.currentTarget.style.background = WA_GREEN); }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editId ? 'আপডেট করুন' : 'তৈরি করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="bg-vf-dark4 border-[#2A2A25]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-vf-cream">অটোমেশন মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription className="text-vf-text-muted">
              &ldquo;{deleteDialog?.name}&rdquo; অটোমেশন মুছে ফেলা হবে। এটি পুনরুদ্ধার করা যাবে না।
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
