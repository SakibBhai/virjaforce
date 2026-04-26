'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, MapPin, Phone, User, Package, AlertCircle } from 'lucide-react';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export default function OrderDialog({ open, onOpenChange }: OrderDialogProps) {
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
        else setServerError(data.errors?.general || 'অর্ডার তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch {
      setServerError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (submitted) {
      setSubmitted(false);
      setFormData({ name: '', phone: '', address: '', division: '', notes: '' });
      setErrors({});
      setServerError('');
    }
    onOpenChange(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-vf-dark3 border-vf-gold-dim/30 text-vf-cream max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-vf-gold">
                অর্ডার করুন
              </DialogTitle>
              <DialogDescription className="text-vf-text-muted">
                তথ্য দিন, আমরা দ্রুত ডেলিভারি দেবো। ক্যাশ অন ডেলিভারি।
              </DialogDescription>
            </DialogHeader>

            {serverError && (
              <div className="bg-vf-red/10 border border-vf-red/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-name" className="text-vf-cream2 text-sm font-medium">
                  <User className="inline w-4 h-4 mr-1" />
                  আপনার নাম *
                </Label>
                <Input
                  id="dialog-name"
                  placeholder="পূর্ণ নাম লিখুন"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialog-phone" className="text-vf-cream2 text-sm font-medium">
                  <Phone className="inline w-4 h-4 mr-1" />
                  মোবাইল নম্বর *
                </Label>
                <Input
                  id="dialog-phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold"
                />
                {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialog-address" className="text-vf-cream2 text-sm font-medium">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  সম্পূর্ণ ঠিকানা *
                </Label>
                <Textarea
                  id="dialog-address"
                  placeholder="হাউজ নং, রোড, এলাকা, উপজেলা"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold resize-none"
                  rows={3}
                />
                {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialog-division" className="text-vf-cream2 text-sm font-medium">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  বিভাগ *
                </Label>
                <select
                  id="dialog-division"
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

              <div className="space-y-2">
                <Label htmlFor="dialog-notes" className="text-vf-cream2 text-sm font-medium">
                  <Package className="inline w-4 h-4 mr-1" />
                  অতিরিক্ত নোট (ঐচ্ছিক)
                </Label>
                <Textarea
                  id="dialog-notes"
                  placeholder="কিছু বলতে চাইলে লিখুন..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="bg-vf-dark4 border-vf-gold-dim/30 text-vf-cream placeholder:text-vf-text-muted focus:border-vf-gold resize-none"
                  rows={2}
                />
              </div>

              <div className="bg-vf-dark4 rounded-lg p-4 border border-vf-gold-dim/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-vf-text-muted text-sm">পণ্যের মূল্য</span>
                  <span className="text-vf-text-muted text-sm line-through">৳৩,৬০০</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-vf-text-muted text-sm">Bonus: Diet Guide + WhatsApp Support</span>
                  <span className="text-vf-green-light text-sm font-semibold">Free</span>
                </div>
                <div className="border-t border-vf-gold-dim/20 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-vf-cream font-semibold">মোট</span>
                  <span className="text-vf-gold font-display text-2xl font-bold">৳১,৭৯৯</span>
                </div>
                <p className="text-vf-text-muted text-xs mt-1">ক্যাশ অন ডেলিভারি · Discreet Packaging</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-vf-gold hover:bg-vf-gold-light text-vf-dark font-bold text-base transition-all duration-200 btn-shimmer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    জমা হচ্ছে...
                  </span>
                ) : 'অর্ডার কনফার্ম করুন →'}
              </Button>

              <p className="text-vf-text-muted text-xs text-center">
                📞 আমরা ৩০ মিনিটের মধ্যে কল করবো অর্ডার নিশ্চিত করতে
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-vf-green/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-vf-green-light" />
            </div>
            <h3 className="font-display text-2xl text-vf-gold">অর্ডার সফল হয়েছে! 🎉</h3>
            <p className="text-vf-cream2 text-sm leading-relaxed">
              ধন্যবাদ <strong className="text-vf-cream">{formData.name}</strong>!
              <br />
              আমরা শীঘ্রই আপনার নম্বরে (<strong className="text-vf-cream">{formData.phone}</strong>) কল করবো।
              <br />
              ঢাকায় ২৪ ঘন্টা, সারাদেশে ৪৮-৭২ ঘন্টায় ডেলিভারি।
            </p>
            <Button onClick={handleClose} className="mt-4 bg-vf-dark4 border border-vf-gold-dim/30 text-vf-cream hover:bg-vf-dark3">
              ঠিক আছে
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
