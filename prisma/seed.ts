import { db } from '@/lib/db';

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await db.order.deleteMany();
  await db.review.deleteMany();

  // Seed reviews
  const reviews = [
    { name: 'রাকিব হ.', age: 34, city: 'চট্টগ্রাম', text: '৬ বছর পর এই প্রথম মনে হচ্ছে আবার আগের মতো আছি। ৬ সপ্তাহেই পার্থক্য বুঝতে পেরেছি।', stars: 5, weeks: 6, youtubeUrl: '', isVideo: false, isFeatured: true },
    { name: 'আরিফ ম.', age: 41, city: 'ঢাকা', text: 'অনেক product try করেছি। এটা প্রথম যেটায় কোনো side effect নেই, আর result সত্যিকারের।', stars: 5, weeks: 8, youtubeUrl: '', isVideo: false, isFeatured: true },
    { name: 'শাহেদ র.', age: 38, city: 'সিলেট', text: 'আমার wife-ই suggest করেছিল কিছু একটা try করতে। VajraForce নিলাম। সংসারটা অনেক সুখী হয়েছে।', stars: 5, weeks: 10, youtubeUrl: '', isVideo: false, isFeatured: true },
    { name: 'তানভীর ক.', age: 29, city: 'রাজশাহী', text: 'প্রথম সপ্তাহে বেশি পার্থক্য বুঝতে পারিনি, কিন্তু তৃতীয় সপ্তাহ থেকে আসল পরিবর্তন শুরু হলো।', stars: 5, weeks: 3, youtubeUrl: '', isVideo: false, isFeatured: false },
    { name: 'মাহমুদ হ.', age: 32, city: 'খুলনা', text: 'Gym-এ আগে ৩০ মিনিট পারতাম না, এখন ১ ঘন্টা সহজেই করি। Energy level অনেক বেড়েছে।', stars: 5, weeks: 5, youtubeUrl: '', isVideo: false, isFeatured: false },
    { name: 'ফারহান স.', age: 36, city: 'ঢাকা', text: 'Discreet packaging-এ আসাটা ভালো লেগেছে। কেউ কিছু বুঝতে পারেনি। আর result তো অসাধারণ!', stars: 5, weeks: 7, youtubeUrl: '', isVideo: false, isFeatured: false },
    { name: 'সজল আহমেদ', age: 35, city: 'ঢাকা', text: 'VajraForce ব্যবহার করার পর আমার অভিজ্ঞতা শেয়ার করছি। ৪ সপ্তাহেই বড় পরিবর্তন দেখতে পেরেছি।', stars: 5, weeks: 4, youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isVideo: true, isFeatured: true },
    { name: 'ইমরান হোসেন', age: 42, city: 'চট্টগ্রাম', text: '৩ মাসের course শেষ করার পর আমার সম্পূর্ণ জীবন বদলে গেছে। ভিডিওতে বিস্তারিত বলেছি।', stars: 5, weeks: 12, youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isVideo: true, isFeatured: true },
  ];

  for (const review of reviews) {
    await db.review.create({ data: review });
  }
  console.log(`Seeded ${reviews.length} reviews`);

  // Seed sample orders with repeated phone numbers
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const orders = [
    // হাসান আলী - 01712345678 - 5 orders (repeat customer - VIP)
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: 'সামনের গেটে দিবেন', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(90) },
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: '', quantity: 2, amount: 3598, status: 'delivered', createdAt: daysAgo(60) },
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(30) },
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: 'ফ্রি স্যাম্পল চাই', quantity: 3, amount: 5397, status: 'shipped', createdAt: daysAgo(5) },
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'pending', createdAt: daysAgo(1) },

    // কামরুল ইসলাম - 01898765432 - 3 orders (repeat)
    { name: 'কামরুল ইসলাম', phone: '01898765432', address: 'Block C, Agrabad', division: 'চট্টগ্রাম', notes: 'COD', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(45) },
    { name: 'কামরুল ইসলাম', phone: '01898765432', address: 'Block C, Agrabad', division: 'চট্টগ্রাম', notes: '', quantity: 2, amount: 3598, status: 'delivered', createdAt: daysAgo(20) },
    { name: 'কামরুল ইসলাম', phone: '01898765432', address: 'Block C, Agrabad', division: 'চট্টগ্রাম', notes: 'জরুরি', quantity: 1, amount: 1799, status: 'confirmed', createdAt: daysAgo(2) },

    // মোস্তফা করিম - 01534567890 - 2 orders (repeat)
    { name: 'মোস্তফা করিম', phone: '01534567890', address: 'Station Road, Rajshahi', division: 'রাজশাহী', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(55) },
    { name: 'মোস্তফা করিম', phone: '01534567890', address: 'Station Road, Rajshahi', division: 'রাজশাহী', notes: 'অফিসে দিবেন', quantity: 1, amount: 1799, status: 'processing', createdAt: daysAgo(3) },

    // তৌহিদুল ইসলাম - 01612348765 - 1 order (new)
    { name: 'তৌহিদুল ইসলাম', phone: '01612348765', address: 'Zindabazar, Sylhet', division: 'সিলেট', notes: 'Gate 2', quantity: 1, amount: 1799, status: 'pending', createdAt: daysAgo(1) },

    // রাসেল আহমেদ - 01912345678 - 4 orders (repeat - VIP)
    { name: 'রাসেল আহমেদ', phone: '01912345678', address: 'Nikunja 2, Khilkhet', division: 'ঢাকা', notes: '', quantity: 2, amount: 3598, status: 'delivered', createdAt: daysAgo(80) },
    { name: 'রাসেল আহমেদ', phone: '01912345678', address: 'Nikunja 2, Khilkhet', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(50) },
    { name: 'রাসেল আহমেদ', phone: '01912345678', address: 'Nikunja 2, Khilkhet', division: 'ঢাকা', notes: '', quantity: 2, amount: 3598, status: 'delivered', createdAt: daysAgo(25) },
    { name: 'রাসেল আহমেদ', phone: '01912345678', address: 'Nikunja 2, Khilkhet', division: 'ঢাকা', notes: 'regular customer', quantity: 3, amount: 5397, status: 'confirmed', createdAt: daysAgo(4) },

    // জাহিদ হাসান - 01834567890 - 1 order (new)
    { name: 'জাহিদ হাসান', phone: '01834567890', address: 'CDA Avenue, Chattogram', division: 'চট্টগ্রাম', notes: '', quantity: 1, amount: 1799, status: 'pending', createdAt: daysAgo(0) },

    // সাদমান হোসেন - 01698765432 - 2 orders (repeat)
    { name: 'সাদমান হোসেন', phone: '01698765432', address: 'Shantinagar, Dhaka', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(40) },
    { name: 'সাদমান হোসেন', phone: '01698765432', address: 'Shantinagar, Dhaka', division: 'ঢাকা', notes: 'bKash পেমেন্ট করবো', quantity: 1, amount: 1799, status: 'pending', createdAt: daysAgo(1) },

    // আবদুল্লাহ আল মামুন - 01312345678 - 3 orders (repeat)
    { name: 'আবদুল্লাহ আল মামুন', phone: '01312345678', address: 'Shahjadpur, Gazipur', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(70) },
    { name: 'আবদুল্লাহ আল মামুন', phone: '01312345678', address: 'Shahjadpur, Gazipur', division: 'ঢাকা', notes: '', quantity: 1, amount: 1799, status: 'cancelled', createdAt: daysAgo(35) },
    { name: 'আবদুল্লাহ আল মামুন', phone: '01312345678', address: 'Shahjadpur, Gazipur', division: 'ঢাকা', notes: '', quantity: 2, amount: 3598, status: 'shipped', createdAt: daysAgo(7) },

    // ইমতিয়াজ আহমেদ - 01498765432 - 1 order (new)
    { name: 'ইমতিয়াজ আহমেদ', phone: '01498765432', address: 'Bogra Road, Rangpur', division: 'রংপুর', notes: '', quantity: 1, amount: 1799, status: 'pending', createdAt: daysAgo(0) },

    // সোহেল রানা - 01756789012 - 2 orders (repeat)
    { name: 'সোহেল রানা', phone: '01756789012', address: 'New Market, Khulna', division: 'খুলনা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(60) },
    { name: 'সোহেল রানা', phone: '01756789012', address: 'New Market, Khulna', division: 'খুলনা', notes: '', quantity: 1, amount: 1799, status: 'delivered', createdAt: daysAgo(15) },

    // ফারুক হোসেন - 01856789012 - 1 order (new)
    { name: 'ফারুক হোসেন', phone: '01856789012', address: 'Court Road, Mymensingh', division: 'ময়মনসিংহ', notes: '', quantity: 1, amount: 1799, status: 'confirmed', createdAt: daysAgo(3) },

    // শাকিল আহমেদ - 01556789012 - 1 order (new)
    { name: 'শাকিল আহমেদ', phone: '01556789012', address: 'Rail Road, Barishal', division: 'বরিশাল', notes: '', quantity: 1, amount: 1799, status: 'processing', createdAt: daysAgo(2) },
  ];

  for (const order of orders) {
    await db.order.create({ data: order });
  }
  console.log(`Seeded ${orders.length} orders`);

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
