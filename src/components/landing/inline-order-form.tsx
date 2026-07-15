'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Package,
  AlertCircle,
  ShieldCheck,
  Truck,
  CreditCard,
} from 'lucide-react';

const divisions = [
  'ঢাকা',
  'চট্টগ্রাম',
  'রাজশাহী',
  'খুলনা',
  'সিলেট',
  'বরিশাল',
  'রংপুর',
  'ময়মনসিংহ',
];

export default function InlineOrderForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    division: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'নাম লিখুন';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর লিখুন';
    else if (!/^01[3-9]\d{8}$/.test(formData.phone.trim()))
      newErrors.phone = 'সঠিক বাংলাদেশি নম্বর লিখুন (01XXXXXXXXX)';
    if (!formData.address.trim()) newErrors.address = 'ঠিকানা লিখুন';
    if (!formData.division) newErrors.division = 'বিভাগ নির্বাচন করুন';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        if (data.errors) setErrors(data.errors);
        else setServerError('অর্ডার তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch {
      setServerError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-vf-dark3 border border-vf-green-light/30 rounded-xl p-8 sm:p-10 text-center"
      >
        <div className="w-20 h-20 bg-vf-green/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-vf-green-light" />
        </div>
        <h3 className="font-display text-3xl text-vf-gold mb-3">অর্ডার সফল হয়েছে! 🎉</h3>
        <p className="text-vf-cream2 text-base leading-relaxed mb-2">
          ধন্যবাদ <strong className="text-vf-cream">{formData.name}</strong>!
        </p>
        <p className="text-vf-cream2 text-sm leading-relaxed mb-6">
          আমরা শীঘ্রই আপনার নম্বরে{' '}
          <strong className="text-vf-cream">{formData.phone}</strong> কল করবো অর্ডার নিশ্চিত করতে।
          <br />
          ঢাকায় ২৪ ঘন্টা, সারাদেশে ৪৮-৭২ ঘন্টায় ডেলিভারি।
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', phone: '', address: '', division: '', notes: '' });
            setErrors({});
          }}
          className="bg-vf-dark4 border border-vf-gold-dim/30 text-vf-cream hover:bg-vf-dark3"
        >
          আরেকটি অর্ডার করুন
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-vf-dark3 border border-vf-gold-dim/30 rounded-xl overflow-hidden"
    >
      {/* Form Header */}
      <div className="bg-gradient-to-br from-[#1A1400] to-[#2A2000] border-b border-vf-gold-dim/30 p-5 sm:p-6">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-vf-gold text-center mb-3">
          অর্ডার ফর্ম
        </h3>
        <p className="text-vf-text-muted text-center text-sm">
          তথ্য পূরণ করুন, আমরা দ্রুত ডেলিভারি দেবো
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
        {serverError && (
          <div className="bg-vf-red/10 border border-vf-red/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {serverError}
          </div>
        )}

        {/* Two column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="inline-name" className="text-vf-cream2 text-sm font-medium">
              <User className="inline w-4 h-4 mr-1" />
              আপনার নাম *
            </Label>
            <Input
              id="inline-name"
              placeholder="পূর্ণ নাম লিখুন"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="inline-phone" className="text-vf-cream2 text-sm font-medium">
              <Phone className="inline w-4 h-4 mr-1" />
              মোবাইল নম্বর *
            </Label>
            <Input
              id="inline-phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold"
            />
            {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="inline-address" className="text-vf-cream2 text-sm font-medium">
            <MapPin className="inline w-4 h-4 mr-1" />
            সম্পূর্ণ ঠিকানা *
          </Label>
          <Textarea
            id="inline-address"
            placeholder="হাউজ নং, রোড, এলাকা, উপজেলা"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold resize-none"
            rows={3}
          />
          {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="inline-division" className="text-vf-cream2 text-sm font-medium">
              <MapPin className="inline w-4 h-4 mr-1" />
              বিভাগ *
            </Label>
            <select
              id="inline-division"
              value={formData.division}
              onChange={(e) => updateField('division', e.target.value)}
              className="w-full h-10 rounded-md bg-vf-dark4 border border-vf-gold-dim/30 text-vf-cream px-3 py-2 text-sm focus:outline-none focus:border-vf-gold appearance-none cursor-pointer"
            >
              <option value="" disabled>বিভাগ নির্বাচন করুন</option>
              {divisions.map((d) => (
                <option key={d} value={d} className="bg-vf-dark4">{d}</option>
              ))}
            </select>
            {errors.division && <p className="text-red-400 text-xs">{errors.division}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="inline-notes" className="text-vf-cream2 text-sm font-medium">
              <Package className="inline w-4 h-4 mr-1" />
              অতিরিক্ত নোট
            </Label>
            <Textarea
              id="inline-notes"
              placeholder="কিছু বলতে চাইলে লিখুন..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-vf-dark4 rounded-lg p-5 border border-vf-gold-dim/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-vf-text-muted text-sm">VajraForce 3-মাসের Full Course</span>
            <span className="text-vf-text-muted text-sm line-through">৳৩,৬০০</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-vf-text-muted text-sm">Bonus: Diet Guide</span>
            <span className="text-vf-green-light text-sm font-semibold">Free</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-vf-text-muted text-sm">Bonus: WhatsApp Support</span>
            <span className="text-vf-green-light text-sm font-semibold">Free</span>
          </div>
          <div className="border-t border-vf-gold-dim/20 pt-3 flex justify-between items-center">
            <span className="text-vf-cream font-bold text-lg">মোট</span>
            <span className="text-vf-gold font-display text-3xl font-black">৳১,৭৯৯</span>
          </div>
          <div className="inline-block bg-vf-green text-[#A8F0A0] text-[12px] font-semibold px-3 py-1 rounded-sm mt-2">
            ৬৩% ছাড় — ৳৩,১০০ সাশ্রয়
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-13 bg-vf-gold hover:bg-vf-gold-light text-vf-dark font-bold text-lg py-4 transition-all duration-200 btn-shimmer rounded-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              জমা হচ্ছে...
            </span>
          ) : 'অর্ডার কনফার্ম করুন → ক্যাশ অন ডেলিভারি'}
        </Button>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: <Truck className="w-4 h-4" />, text: 'Discreet Delivery' },
            { icon: <CreditCard className="w-4 h-4" />, text: 'COD / bKash' },
            { icon: <ShieldCheck className="w-4 h-4" />, text: '90-Day Guarantee' },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-vf-text-muted text-[11px] justify-center">
              <span className="text-vf-gold-dim">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </div>
      </form>
    </motion.div>
  );
}
