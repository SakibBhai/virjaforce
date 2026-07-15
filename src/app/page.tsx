'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Star,
  ChevronDown,
  MessageCircle,
  Check,
  Users,
  LayoutDashboard,
  UserCheck,
  Home as HomeIcon,
  Heart,
  Award,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import OrderDialog from '@/components/landing/order-dialog';
import InlineOrderForm from '@/components/landing/inline-order-form';
import VideoReviewCarousel from '@/components/landing/video-review-carousel';
import AdminPanel from '@/components/admin/admin-panel';
import CustomerDashboard from '@/components/admin/customer-dashboard';

/* ─── Types ─── */
interface Review {
  id: string;
  name: string;
  age: number;
  city: string;
  text: string;
  stars: number;
  weeks: number;
  youtubeUrl: string;
  isVideo: boolean;
  isFeatured: boolean;
}

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/* ─── Static Data ─── */
const painCards = [
  {
    icon: '😔',
    title: 'আত্মবিশ্বাস নেই।',
    desc: 'নিজের ওপর বিশ্বাস হারিয়ে ফেলেছো। দাম্পত্য জীবনে একটা অদৃশ্য দূরত্ব তৈরি হচ্ছে।',
    detail: 'গবেষণায় দেখা গেছে, শারীরিক দুর্বলতা মানুষের আত্মবিশ্বাসে ৭০% পর্যন্ত প্রভাব ফেলতে পারে।',
  },
  {
    icon: '💤',
    title: 'সারাক্ষণ ক্লান্তি।',
    desc: 'রাতে ঘুমাও, সকালে উঠেও ক্লান্ত। শরীরে কোনো প্রাণ নেই।',
    detail: 'হরমোন ইমব্যালেন্সের কারণে শরীর সঠিক বিশ্রাম নিতে পারে না, ফলে প্রতিদিন ক্লান্ত লাগে।',
  },
  {
    icon: '😰',
    title: 'মনে একটা ভয়।',
    desc: 'পার্টনার কি হতাশ? সে কি বুঝতে পারছে? এই চিন্তাটা ঘুমও নষ্ট করছে।',
    detail: 'মানসিক চাপ শারীরিক কর্মক্ষমতাকে আরো কমিয়ে দেয় — এটা একটা ভয়াবহ চক্র।',
  },
  {
    icon: '🏥',
    title: 'কবিরাজে ঠকেছো।',
    desc: 'দোকান থেকে কিনেছো, ফেসবুকের ad দেখে order করেছো — কাজ হয়নি।',
    detail: 'বাংলাদেশে ৯০% হারবাল প্রোডাক্ট ভেজাল বা কম মানের। ল্যাব টেস্টেড প্রোডাক্ট খুঁজে পাওয়া কঠিন।',
  },
];

const ingredients = [
  { name: 'অশ্বগন্ধা', desc: 'Testosterone সরাসরি boost করে, স্ট্রেস কমায়', icon: '🌿', detail: 'আয়ুর্বেদে ৩০০০+ বছর ধরে ব্যবহৃত অ্যাডাপ্টোজেন। ৮টি ক্লিনিক্যাল ট্রায়ালে প্রমাণিত।' },
  { name: 'শিলাজিৎ', desc: 'শারীরিক শক্তি ও সহনশীলতা বাড়ায়', icon: '⛰️', detail: 'হিমালয় থেকে সংগ্রহ করা প্রাকৃতিক মিনারেল। ৮৫+ মাইক্রো নিউট্রিয়েন্ট সমৃদ্ধ।' },
  { name: 'মুসলি সাদা', desc: 'প্রাকৃতিক vitality booster, প্রাচীন আয়ুর্বেদ', icon: '🌱', detail: 'ভারতীয় জিনসেং নামেও পরিচিত। ১০০+ বছর ধরে আয়ুর্বেদিক চিকিৎসায় ব্যবহৃত।' },
  { name: 'তালমাখনা', desc: 'স্পার্ম quality ও libido উন্নত করে', icon: '🥜', detail: 'উপমহাদেশের ঐতিহ্যবাহী পুরুষ স্বাস্থ্য উপাদান। প্রোটিন ও ফ্যাটি অ্যাসিড সমৃদ্ধ।' },
  { name: 'কাউঞ্চ বীজ', desc: 'Dopamine বাড়ায়, মুড ভালো রাখে', icon: '🌿', detail: 'মুড এনহ্যান্সার হিসেবে কাজ করে। Dopamine ও সেরোটোনিন লেভেল উন্নত করে।' },
  { name: 'অর্জুন ছাল', desc: 'রক্ত সঞ্চালন উন্নত করে, স্ট্যামিনা বাড়ায়', icon: '🌳', detail: 'হৃদপিণ্ডের জন্য উপকারী। রক্ত সঞ্চালন ভালো করে সামগ্রিক স্ট্যামিনা বাড়ায়।' },
];

const bonuses = [
  { title: 'VajraForce 3-মাসের Full Course', desc: '৯০ দিনের complete herbal supplement — সর্বোচ্চ result-এর জন্য minimum dosage', value: '৳৩,৬০০', isFree: false },
  { title: 'Bonus: "৩০ দিনে শক্তি ফিরে পাও" Diet Guide', desc: 'কোন খাবার খাবে, কোনটা বন্ধ করবে — PDF গাইড (বাংলায়)', value: '৳৪৯৯', isFree: true },
  { title: 'Bonus: WhatsApp Support (৩ মাস)', desc: "Expert-এর সাথে সরাসরি যোগাযোগ — তোমার progress track করা হবে", value: '৳৮০০', isFree: true },
  { title: 'Bonus: Discreet Packaging', desc: 'বাইরে থেকে বোঝার কোনো উপায় নেই — সম্পূর্ণ privacy নিশ্চিত', value: null, isFree: true },
];

const faqs = [
  { q: 'VajraForce কি FDA/DGDA অনুমোদিত?', a: 'হ্যাঁ, VajraForce সম্পূর্ণ DGDA রেজিস্টার্ড এবং বাংলাদেশের স্বনামধন্য ল্যাবে টেস্টেড। আমাদের সকল উপাদান প্রমাণিত এবং নিরাপদ।' },
  { q: 'কতদিনে ফলাফল পাবো?', a: 'বেশিরভাগ গ্রাহক ৩-৪ সপ্তাহের মধ্যে প্রাথমিক পার্থক্য অনুভব করেন। সর্বোচ্চ ফলাফলের জন্য ৯০ দিনের কোর্স সম্পূর্ণ করুন।' },
  { q: 'কোনো side effect আছে কি?', a: 'VajraForce সম্পূর্ণ প্রাকৃতিক উপাদান দিয়ে তৈরি। কোনো কৃত্রিম কেমিক্যাল বা সিনথেটিক যোগ করা হয়নি। গত ২ বছরে ৫০০০+ গ্রাহক ব্যবহার করেছেন, কোনো সাইড এফেক্টের রিপোর্ট নেই।' },
  { q: 'ডেলিভারি কতদিনে পাবো?', a: 'ঢাকায় ২৪ ঘন্টায় এবং সারাদেশে ৪৮-৭২ ঘন্টায় ডেলিভারি হয়। সকল পার্সেল Discreet Packaging-এ আসে।' },
  { q: '৯০ দিনের গ্যারান্টি কীভাবে কাজ করে?', a: '৯০ দিন VajraForce নিন। যদি কোনো পার্থক্য না দেখেন, WhatsApp-এ মেসেজ করুন। আমরা কোনো প্রশ্ন ছাড়াই সম্পূর্ণ টাকা ফেরত দেবো।' },
  { q: 'পেমেন্ট কিভাবে করবো?', a: 'ক্যাশ অন ডেলিভারি (COD)। পার্সেল হাতে পেয়ে টাকা দিন। bKash বা নগদ-এও পেমেন্ট করতে পারবেন।' },
];

const stats = [
  { icon: <Users className="w-5 h-5" />, value: 5000, suffix: '+', label: 'সন্তুষ্ট গ্রাহক' },
  { icon: <Star className="w-5 h-5" />, value: 4.9, suffix: '/5', label: 'গড় রেটিং', isDecimal: true },
  { icon: <ShieldCheck className="w-5 h-5" />, value: 90, suffix: ' দিন', label: 'মানি-ব্যাক গ্যারান্টি' },
  { icon: <Truck className="w-5 h-5" />, value: 48, suffix: ' ঘন্টা', label: 'সারাদেশে ডেলিভারি' },
];

/* ─── Counter Animation Hook ─── */
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const hasStartedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          let startTime: number | null = null;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(progress * end);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ─── Countdown Component ─── */
function CountdownTimer() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 0);
      const diff = midnight.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {[
        { val: time.h, label: 'ঘন্টা' },
        { val: time.m, label: 'মিনিট' },
        { val: time.s, label: 'সেকেন্ড' },
      ].map((item) => (
        <div key={item.label} className="bg-vf-dark4 border border-vf-gold-dim/20 rounded-md px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[56px] sm:min-w-[72px]">
          <div className="font-display text-2xl sm:text-3xl font-bold text-vf-gold tabular-nums">
            {String(item.val).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-vf-text-muted uppercase tracking-wider mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Section Wrapper ─── */
function AnimatedSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section id={id} className={className} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}>
      {children}
    </motion.section>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ text }: { text: string }) {
  return <div className="text-[11px] font-semibold tracking-[3px] uppercase text-vf-gold text-center mb-4">{text}</div>;
}

/* ─── Stat Counter ─── */
function StatCounter({ stat }: { stat: { icon: React.ReactNode; value: number; suffix: string; label: string; isDecimal?: boolean } }) {
  const { count, ref } = useCounter(stat.value, 2000);
  return (
    <motion.div ref={ref} className="bg-vf-dark3/60 border border-vf-gold-dim/15 rounded-lg p-3 text-center hover:border-vf-gold-dim/30 transition-colors" variants={fadeUp}>
      <div className="flex items-center justify-center gap-1.5 text-vf-gold mb-1">{stat.icon}</div>
      <div className="font-display text-xl sm:text-2xl font-bold text-vf-cream">
        {stat.isDecimal ? count.toFixed(1) : Math.floor(count)}{stat.suffix}
      </div>
      <div className="text-[11px] text-vf-text-muted">{stat.label}</div>
    </motion.div>
  );
}

/* ─── View Type ─── */
type ViewType = 'landing' | 'admin' | 'customer';

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('landing');
  const [orderOpen, setOrderOpen] = useState(false);
  const [expandedPain, setExpandedPain] = useState<number | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [stockPercent, setStockPercent] = useState(0);
  const [whatsappPulse, setWhatsappPulse] = useState(false);

  // Reviews from DB
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videoReviews, setVideoReviews] = useState<Review[]>([]);
  const [textReviews, setTextReviews] = useState<Review[]>([]);
  const [activeReview, setActiveReview] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scrollProgressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Fetch reviews from DB
  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reviews) {
          setReviews(data.reviews);
          setVideoReviews(data.reviews.filter((r: Review) => r.isVideo && r.youtubeUrl));
          setTextReviews(data.reviews.filter((r: Review) => !r.isVideo));
        }
      })
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, []);

  // Stock bar animation
  useEffect(() => {
    const timer = setTimeout(() => setStockPercent(82), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    if (textReviews.length === 0) return;
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % textReviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [textReviews.length]);

  // WhatsApp pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setWhatsappPulse(true);
      setTimeout(() => setWhatsappPulse(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToOrder = useCallback(() => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const navItems: { key: ViewType; label: string; icon: React.ElementType }[] = [
    { key: 'landing', label: 'হোম', icon: HomeIcon },
    { key: 'admin', label: 'অ্যাডমিন', icon: LayoutDashboard },
    { key: 'customer', label: 'অর্ডার ট্র্যাকিং', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#0A0A08' }}>
      {/* Scroll Progress Bar - only on landing */}
      {activeView === 'landing' && (
        <motion.div className="scroll-progress" style={{ width: scrollProgressWidth }} />
      )}

      {/* ═══ TOP BAR ═══ */}
      <div className="bg-vf-red text-center py-2.5 px-4 text-[13px] font-medium tracking-wide relative z-10">
        <span className="text-white">
          ⚡ সীমিত অফার — মাত্র <strong className="text-red-200">৪৭টি Power Pack</strong> বাকি আছে। আজই সিদ্ধান্ত নাও।
        </span>
      </div>

      {/* ═══ NAVIGATION BAR ═══ */}
      <nav className="bg-vf-dark2 border-b border-[#1E1E1B] sticky top-0 z-[50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black text-vf-gold">VajraForce</span>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveView(item.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-vf-gold/15 text-vf-gold border border-vf-gold/30'
                        : 'text-vf-text-muted hover:text-vf-cream hover:bg-vf-dark3 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 relative z-[1]">
        {/* ─── ADMIN PANEL VIEW ─── */}
        {activeView === 'admin' && <AdminPanel />}

        {/* ─── CUSTOMER DASHBOARD VIEW ─── */}
        {activeView === 'customer' && <CustomerDashboard />}

        {/* ─── LANDING PAGE VIEW ─── */}
        {activeView === 'landing' && (
        <>
        {/* ─── HERO ─── */}
        <section className="py-16 sm:py-20 md:py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vf-gold/5 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-[820px] mx-auto px-6 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
              <span className="inline-block border border-vf-gold-dim text-vf-gold text-[11px] font-semibold tracking-[2px] uppercase px-5 py-1.5 rounded-sm mb-6">
                বাংলাদেশের প্রিমিয়াম হারবাল ফর্মুলা · Lab Tested
              </span>
            </motion.div>
            <motion.h1 className="font-display text-[clamp(32px,6vw,60px)] font-black leading-[1.1] text-vf-cream mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
              তোমার শরীরে <span className="text-gradient-gold">আসল শক্তি</span> আছে।<br />
              শুধু জানো না কীভাবে জাগাতে হয়।
            </motion.h1>
            <motion.p className="text-lg sm:text-xl text-vf-cream2 font-light max-w-[560px] mx-auto mb-8 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
              ৯০ দিনের মধ্যে শরীরের হারানো তেজ ফিরিয়ে আনো — সম্পূর্ণ প্রাকৃতিক উপাদানে। নাহলে সম্পূর্ণ টাকা ফেরত।
            </motion.p>
            <motion.div className="inline-block bg-vf-dark3 border border-vf-gold-dim border-l-[3px] border-l-vf-gold px-5 sm:px-7 py-4 rounded text-left max-w-[600px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}>
              <p className="text-[16px] sm:text-[18px] font-medium text-vf-cream leading-relaxed">
                &ldquo;যে পুরুষ নিজের ভেতরে শক্তি অনুভব করে না — সে বাইরেও পিছিয়ে পড়তে থাকে। VajraForce তোমার সেই হারানো ভিত্তি ফেরত দেয়।&rdquo;
              </p>
            </motion.div>
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 max-w-[640px] mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} variants={staggerContainer}>
              {stats.map((stat) => <StatCounter key={stat.label} stat={stat} />)}
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-vf-gold to-transparent" />
        </section>

        {/* ─── PAIN SECTION ─── */}
        <AnimatedSection className="py-16 sm:py-20 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="সমস্যাটা চিনে নাও" />
            <motion.h2 className="font-display text-[clamp(26px,4vw,42px)] font-bold text-center mb-3 text-vf-cream" variants={fadeUp}>তুমি কি এই অবস্থায় আছো?</motion.h2>
            <motion.p className="text-center text-vf-text-muted max-w-[560px] mx-auto mb-10 text-[15px]" variants={fadeUp}>প্রতিদিন হাজার হাজার পুরুষ এই সমস্যায় চুপ করে থাকে। কাউকে বলতে পারে না।</motion.p>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10" variants={staggerContainer}>
              {painCards.map((card, i) => (
                <motion.div
                  key={i}
                  className={`bg-vf-dark3 border rounded cursor-pointer transition-all duration-300 ${expandedPain === i ? 'border-vf-red/60 shadow-lg shadow-vf-red/10' : 'border-[#2A2A25] border-l-[3px] border-l-vf-red hover:border-vf-red/40'}`}
                  variants={fadeUp}
                  onClick={() => setExpandedPain(expandedPain === i ? null : i)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-5">
                    <span className="text-[22px] mb-2.5 block">{card.icon}</span>
                    <p className="text-[15px] text-vf-cream2 leading-relaxed"><strong className="text-vf-cream font-semibold">{card.title}</strong> {card.desc}</p>
                    <AnimatePresence>
                      {expandedPain === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <p className="text-[13px] text-vf-gold-dim mt-3 pt-3 border-t border-[#2A2A25] leading-relaxed">💡 {card.detail}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button className="mt-2 text-[12px] text-vf-gold-dim hover:text-vf-gold flex items-center gap-1 transition-colors">
                      {expandedPain === i ? 'কম দেখুন' : 'আরো জানুন'} <ChevronDown className={`w-3 h-3 transition-transform ${expandedPain === i ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="bg-vf-dark4 border border-[#2A2A25] p-6 sm:p-7 rounded-lg text-center" variants={scaleIn}>
              <p className="text-[17px] sm:text-[19px] font-medium text-vf-cream leading-relaxed">
                এই সমস্যাটা তোমার দোষ না। বাংলাদেশে মার্কেটে <strong className="text-vf-gold">৯০% প্রোডাক্ট</strong> হয় ভেজাল, নয়তো cheap ingredients দিয়ে ভরা।
                <br className="hidden sm:block" />তোমার শরীর সঠিক জিনিস পাচ্ছে না — এটাই মূল সমস্যা।
              </p>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── SOLUTION SECTION ─── */}
        <AnimatedSection className="py-16 sm:py-20 text-center border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="সমাধান" />
            <motion.h2 className="font-display text-[clamp(24px,4vw,40px)] font-bold mb-5" variants={fadeUp}>
              বাংলাদেশের প্রথম<br /><span className="text-gradient-gold">Clinical-Grade Herbal Formula</span><br />পুরুষদের জন্য
            </motion.h2>
            <motion.p className="text-[16px] sm:text-[17px] text-vf-cream2 max-w-[620px] mx-auto mb-10 leading-[1.8]" variants={fadeUp}>
              VajraForce তৈরি হয়েছে ৬টি প্রমাণিত হারবাল উপাদান দিয়ে — যার প্রতিটা শতাব্দী ধরে আয়ুর্বেদিক ও ইউনানি চিকিৎসায় ব্যবহৃত হয়ে আসছে।
            </motion.p>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6" variants={staggerContainer}>
              {ingredients.map((ing, i) => (
                <motion.div
                  key={i}
                  className={`bg-vf-dark3 border rounded p-4 text-center cursor-pointer transition-all duration-300 ${selectedIngredient === i ? 'border-vf-gold-dim border-t-2 border-t-vf-green-light shadow-lg shadow-vf-gold/5' : 'border-[#2E2E28] border-t-2 border-t-vf-green-light hover:border-vf-gold-dim/50 hover:-translate-y-1'}`}
                  variants={fadeUp}
                  onClick={() => setSelectedIngredient(selectedIngredient === i ? null : i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl mb-2 block">{ing.icon}</span>
                  <span className="text-[14px] font-semibold text-vf-gold block mb-1">{ing.name}</span>
                  <span className="text-[12px] text-vf-text-muted leading-relaxed block">{ing.desc}</span>
                  <AnimatePresence>
                    {selectedIngredient === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="text-[11px] text-vf-green-light mt-2 pt-2 border-t border-[#2E2E28] leading-relaxed overflow-hidden">🔬 {ing.detail}</motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] text-vf-text-muted" variants={fadeIn}>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-vf-green-light" /> DGDA Registered</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-vf-green-light" /> Zero Synthetic Additives</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-vf-green-light" /> Lab Tested Bangladesh</span>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── OFFER SECTION ─── */}
        <AnimatedSection className="py-16 sm:py-20 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="Grand Slam Offer" />
            <motion.div className="bg-vf-dark3 border border-vf-gold-dim/40 rounded-xl overflow-hidden glow-gold" variants={scaleIn}>
              <div className="bg-gradient-to-br from-[#1A1400] to-[#2A2000] border-b border-vf-gold-dim/40 p-6 sm:p-8 text-center">
                <div className="font-display text-[13px] font-bold tracking-[3px] uppercase text-vf-gold mb-3">সীমিত সময়ের প্যাকেজ</div>
                <h2 className="font-display text-[clamp(22px,4vw,36px)] font-black text-vf-cream leading-tight">VajraForce 90-Day<br />Power Transformation Pack</h2>
              </div>
              <div className="p-6 sm:p-8">
                <ul className="mb-8">
                  {bonuses.map((bonus, i) => (
                    <motion.li key={i} className="flex items-start gap-3 sm:gap-4 py-4 border-b border-[#252520] last:border-b-0" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <div className="w-6 h-6 bg-vf-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 text-white" /></div>
                      <div className="flex-1 min-w-0">
                        <strong className="text-vf-cream font-semibold block text-[15px] mb-1">{bonus.title}</strong>
                        <span className="text-vf-text-muted text-[13px] leading-relaxed block">{bonus.desc}</span>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {bonus.value && !bonus.isFree && <div className="text-[13px] text-vf-text-muted line-through">{bonus.value}</div>}
                        {bonus.isFree && <div className="text-[13px] text-vf-green-light font-semibold">{bonus.value ? (<><span className="text-vf-text-muted line-through block text-[11px]">{bonus.value}</span>Free</>) : 'Free'}</div>}
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <motion.div className="bg-vf-dark4 border border-[#2A2A22] rounded-lg p-6 sm:p-7 text-center mb-5" variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <div className="text-[15px] text-vf-text-muted line-through mb-1">মোট মূল্য ছিল ৳৪,৮৯৯</div>
                  <div className="font-display text-[clamp(40px,8vw,56px)] font-black text-vf-gold leading-none">৳১,৭৯৯</div>
                  <div className="text-[14px] text-vf-text-muted mt-2">৩ মাসের সম্পূর্ণ প্যাকেজ · ক্যাশ অন ডেলিভারি</div>
                  <div className="inline-block bg-vf-green text-[#A8F0A0] text-[13px] font-semibold px-4 py-1.5 rounded-sm mt-4">তুমি ৳৩,১০০ বাঁচাচ্ছো — ৬৩% ছাড়</div>
                </motion.div>
                <motion.button className="block w-full bg-vf-gold hover:bg-vf-gold-light text-vf-dark font-bold text-[17px] py-4 px-8 rounded transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 btn-shimmer" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => scrollToOrder()}>
                  এখনই অর্ডার করো → ক্যাশ অন ডেলিভারি
                </motion.button>
                <p className="text-[12px] text-vf-text-muted text-center mt-3">📦 ঢাকায় ২৪ ঘন্টা · সারাদেশে ৪৮-৭২ ঘন্টা · Discreet Packaging নিশ্চিত</p>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── SCARCITY SECTION ─── */}
        <AnimatedSection className="py-12 sm:py-14 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <motion.div className="bg-[#160C0C] border border-vf-red rounded-lg p-6 sm:p-7 text-center" variants={scaleIn}>
              <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E05050] mb-3">⚠ সতর্কতা — সীমিত স্টক</div>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold text-vf-cream mb-3">এই মাসের batch শেষ হলে<br />দাম বাড়বে ৳২,৪৯৯-তে।</h3>
              <p className="text-[15px] text-vf-cream2 max-w-[500px] mx-auto mb-5">প্রতি মাসে আমরা সীমিত পরিমাণ তৈরি করি — quality নিশ্চিত করতে। এই মাসের ৪৭টি Power Pack বাকি আছে।</p>
              <div className="max-w-[360px] mx-auto mb-6">
                <div className="flex justify-between text-[12px] text-vf-text-muted mb-2">
                  <span>ইতোমধ্যে বিক্রি হয়েছে</span>
                  <span className="text-[#E05050] font-semibold animate-pulse-red">{stockPercent}% শেষ</span>
                </div>
                <div className="h-2 bg-[#2A1A1A] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-vf-red to-[#C03030] rounded-full" initial={{ width: '0%' }} animate={{ width: `${stockPercent}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                </div>
              </div>
              <CountdownTimer />
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── VIDEO REVIEWS (YouTube) ─── */}
        {videoReviews.length > 0 && (
          <AnimatedSection className="py-14 sm:py-16 border-b border-[#1E1E1B]">
            <div className="max-w-[820px] mx-auto px-6">
              <SectionLabel text="Video Testimonials" />
              <motion.h2 className="font-display text-[clamp(24px,4vw,38px)] font-bold text-center mb-3 text-vf-cream" variants={fadeUp}>
                তারা <span className="text-gradient-gold">ভিডিওতে</span> যা বলছে
              </motion.h2>
              <motion.p className="text-center text-vf-text-muted text-[15px] mb-8" variants={fadeUp}>
                সত্যিকারের গ্রাহকদের অভিজ্ঞতা — নিজের চোখে দেখুন
              </motion.p>
              <motion.div variants={scaleIn}>
                <VideoReviewCarousel videos={videoReviews} />
              </motion.div>
            </div>
          </AnimatedSection>
        )}

        {/* ─── TEXT REVIEWS (from DB) ─── */}
        <AnimatedSection className="py-14 sm:py-16 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="Real Reviews" />
            <motion.h2 className="font-display text-[clamp(26px,4vw,42px)] font-bold text-center mb-8 text-vf-cream" variants={fadeUp}>
              তারা যা বলছে
            </motion.h2>

            {reviewsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-vf-dark3 border border-[#252520] rounded-lg p-5 animate-pulse">
                    <div className="h-4 bg-vf-dark4 rounded w-24 mb-3" />
                    <div className="h-3 bg-vf-dark4 rounded w-full mb-2" />
                    <div className="h-3 bg-vf-dark4 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-vf-dark4 rounded w-32" />
                  </div>
                ))}
              </div>
            ) : textReviews.length > 0 ? (
              <>
                {/* Desktop Grid */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-3">
                  {textReviews.slice(0, 6).map((review) => (
                    <motion.div
                      key={review.id}
                      className="bg-vf-dark3 border border-[#252520] rounded-lg p-5"
                      variants={fadeUp}
                      whileHover={{ y: -4, borderColor: '#3A3A35' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-vf-gold text-sm mb-2.5 tracking-[2px]">{'★'.repeat(review.stars)}</div>
                      <p className="text-[14px] text-vf-cream2 leading-relaxed mb-3 italic">&ldquo;{review.text}&rdquo;</p>
                      <div className="text-[13px] font-semibold text-vf-text-muted">— {review.name}, {review.age}, {review.city}</div>
                      {review.weeks > 0 && (
                        <div className="mt-2 inline-block bg-vf-dark4 text-vf-gold text-[11px] px-2 py-0.5 rounded">{review.weeks} সপ্তাহে ফলাফল</div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Carousel */}
                <div className="sm:hidden">
                  <div className="relative overflow-hidden rounded-lg">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={textReviews[activeReview]?.id || 0}
                        className="bg-vf-dark3 border border-[#252520] rounded-lg p-5"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        {textReviews[activeReview] && (
                          <>
                            <div className="text-vf-gold text-sm mb-2.5 tracking-[2px]">{'★'.repeat(textReviews[activeReview].stars)}</div>
                            <p className="text-[14px] text-vf-cream2 leading-relaxed mb-3 italic">&ldquo;{textReviews[activeReview].text}&rdquo;</p>
                            <div className="text-[13px] font-semibold text-vf-text-muted">— {textReviews[activeReview].name}, {textReviews[activeReview].age}, {textReviews[activeReview].city}</div>
                            {textReviews[activeReview].weeks > 0 && (
                              <div className="mt-2 inline-block bg-vf-dark4 text-vf-gold text-[11px] px-2 py-0.5 rounded">{textReviews[activeReview].weeks} সপ্তাহে ফলাফল</div>
                            )}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {textReviews.map((_, i) => (
                      <button key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeReview ? 'bg-vf-gold w-6' : 'bg-vf-text-muted/30'}`} onClick={() => setActiveReview(i)} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <motion.p className="text-center text-vf-text-muted py-8" variants={fadeIn}>
                এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!
              </motion.p>
            )}
          </div>
        </AnimatedSection>

        {/* ─── FAQ SECTION ─── */}
        <AnimatedSection className="py-14 sm:py-16 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="সাধারণ প্রশ্ন" />
            <motion.h2 className="font-display text-[clamp(24px,4vw,38px)] font-bold text-center mb-8 text-vf-cream" variants={fadeUp}>
              প্রায়ই <span className="text-gradient-gold">জিজ্ঞেস করা হয়</span>
            </motion.h2>
            <motion.div variants={staggerContainer}>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <AccordionItem value={`faq-${i}`} className="bg-vf-dark3 border border-[#252520] rounded-lg overflow-hidden px-0">
                      <AccordionTrigger className="px-5 py-4 text-left text-[15px] font-medium text-vf-cream hover:text-vf-gold hover:no-underline transition-colors [&>svg]:text-vf-gold">{faq.q}</AccordionTrigger>
                      <AccordionContent className="px-5 pb-4 text-[14px] text-vf-cream2 leading-relaxed">{faq.a}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── GUARANTEE SECTION ─── */}
        <AnimatedSection className="py-16 sm:py-20 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="কোনো ঝুঁকি নেই" />
            <motion.h2 className="font-display text-[clamp(24px,4vw,40px)] font-bold text-center mb-8 text-vf-cream" variants={fadeUp}>এটা একটা <span className="text-gradient-gold">No-Brainer</span> সিদ্ধান্ত</motion.h2>
            <motion.div className="flex flex-col sm:flex-row gap-6 sm:gap-7 bg-vf-dark3 border border-[#2A2A25] rounded-xl p-6 sm:p-8" variants={scaleIn}>
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-vf-gold-dim rounded-full flex flex-col items-center justify-center text-center bg-vf-dark4/50">
                  <motion.div className="font-display text-[36px] sm:text-[42px] font-black text-vf-gold leading-none" initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>90</motion.div>
                  <div className="text-[10px] font-semibold tracking-[1px] uppercase text-vf-gold-dim mt-1">দিনের</div>
                  <div className="text-[10px] text-vf-text-muted mt-1 uppercase tracking-[1px]">গ্যারান্টি</div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-[22px] sm:text-[24px] font-bold text-vf-cream mb-3">সম্পূর্ণ টাকা-ফেরত গ্যারান্টি</h3>
                <p className="text-[15px] text-vf-cream2 leading-[1.8]">৯০ দিন VajraForce নাও। যদি কোনো পার্থক্য না দেখো — WhatsApp-এ একটা message করো। আমরা সম্পূর্ণ টাকা ফেরত দেবো। কোনো প্রশ্ন নেই, কোনো ঝামেলা নেই।<br /><br />আমরা জানি এই product কাজ করে। তাই আমরা এই guarantee দিতে পারি। তোমার একমাত্র risk হলো — না নেওয়া।</p>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── FEATURES STRIP ─── */}
        <AnimatedSection className="py-10 border-b border-[#1E1E1B]">
          <div className="max-w-[820px] mx-auto px-6">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={staggerContainer}>
              {[
                { icon: <ShieldCheck className="w-6 h-6" />, title: 'DGDA Registered', desc: 'সরকারি অনুমোদিত' },
                { icon: <Award className="w-6 h-6" />, title: 'Lab Tested', desc: 'স্বনামধন্য ল্যাবে পরীক্ষিত' },
                { icon: <Truck className="w-6 h-6" />, title: 'Discreet Delivery', desc: 'গোপনীয়তা নিশ্চিত' },
                { icon: <Heart className="w-6 h-6" />, title: '100% Natural', desc: 'কোনো কেমিক্যাল নেই' },
              ].map((f, i) => (
                <motion.div key={i} className="text-center" variants={fadeUp}>
                  <div className="w-12 h-12 bg-vf-dark3 border border-vf-gold-dim/20 rounded-full flex items-center justify-center mx-auto mb-3 text-vf-gold">{f.icon}</div>
                  <div className="text-[14px] font-semibold text-vf-cream mb-0.5">{f.title}</div>
                  <div className="text-[12px] text-vf-text-muted">{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ─── INLINE ORDER FORM ─── */}
        <section id="order" className="py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-[820px] mx-auto px-6">
            <SectionLabel text="অর্ডার করুন" />
            <motion.h2 className="font-display text-[clamp(26px,4.5vw,44px)] font-black text-vf-cream mb-3 text-center leading-tight" variants={fadeUp}>
              হয় আজই শুরু করো,<br />
              <span className="text-gradient-gold">নয়তো আরো ৬ মাস</span> এভাবেই থাকো।
            </motion.h2>
            <motion.p className="text-[17px] text-vf-cream2 max-w-[500px] mx-auto mb-10 text-center" variants={fadeUp}>
              তুমি ইতোমধ্যে অনেকদিন সময় নষ্ট করেছো। আজকের decision টা সহজ — ৯০ দিনের guarantee সহ try করো।
            </motion.p>
            <InlineOrderForm />
          </div>
        </section>
        </>)}
      </main>

      {/* ═══ FOOTER ═══ */}
        {activeView === 'landing' && (
        <footer className="border-t border-[#1A1A17] py-8 text-center relative z-[1] mt-auto">
          <div className="max-w-[820px] mx-auto px-6">
            <p className="text-[12px] text-vf-text-muted">VajraForce — Registered Herbal Supplement · DGDA Licensed</p>
            <p className="text-[12px] text-vf-text-muted mt-2">এই প্রোডাক্ট কোনো রোগ নির্ণয় বা চিকিৎসা করে না। সুস্থ জীবনযাপনের সহায়ক।</p>
          </div>
        </footer>
        )}

        {/* ═══ STICKY BOTTOM BAR — always visible (landing only) ═══ */}
        {activeView === 'landing' && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-vf-dark2/95 backdrop-blur-md border-t border-vf-gold/50 py-3 px-4 sm:px-6 flex items-center justify-center gap-4 sm:gap-5 z-[100] shadow-[0_-4px_20px_rgba(201,168,76,0.15)]"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <span className="text-[13px] text-vf-cream2 hidden sm:inline">মাত্র <strong className="text-vf-gold">৪৭টি</strong> বাকি · দাম <strong className="text-vf-gold">৳১,৭৯৯</strong> (৬৩% ছাড়)</span>
            <span className="text-[13px] text-vf-cream2 sm:hidden"><strong className="text-vf-gold">৳১,৭৯৯</strong> · ৬৩% ছাড়</span>
            <motion.button
              className="bg-vf-gold hover:bg-vf-gold-light text-vf-dark font-bold text-[14px] py-2.5 px-6 rounded flex-shrink-0 transition-colors shadow-lg shadow-vf-gold/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOrderOpen(true)}
            >
              এখনই অর্ডার করুন →
            </motion.button>
          </motion.div>
        )}

        {/* ═══ FLOATING WHATSAPP BUTTON (landing only) ═══ */}
        {activeView === 'landing' && (
        <motion.a
        href="#"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[90] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        onClick={(e) => { e.preventDefault(); setOrderOpen(true); }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {whatsappPulse && (
          <motion.span className="absolute inset-0 rounded-full border-2 border-[#25D366]" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1 }} />
        )}
      </motion.a>
      )}

      {/* ═══ ORDER DIALOG ═══ */}
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </div>
  );
}
