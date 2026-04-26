import { db } from '@/lib/db';

async function seed() {
  console.log('Seeding database...');

  // Seed reviews with YouTube video links
  const reviews = [
    {
      name: 'রাকিব হ.',
      age: 34,
      city: 'চট্টগ্রাম',
      text: '৬ বছর পর এই প্রথম মনে হচ্ছে আবার আগের মতো আছি। ৬ সপ্তাহেই পার্থক্য বুঝতে পেরেছি।',
      stars: 5,
      weeks: 6,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: true,
    },
    {
      name: 'আরিফ ম.',
      age: 41,
      city: 'ঢাকা',
      text: 'অনেক product try করেছি। এটা প্রথম যেটায় কোনো side effect নেই, আর result সত্যিকারের।',
      stars: 5,
      weeks: 8,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: true,
    },
    {
      name: 'শাহেদ র.',
      age: 38,
      city: 'সিলেট',
      text: 'আমার wife-ই suggest করেছিল কিছু একটা try করতে। VajraForce নিলাম। সংসারটা অনেক সুখী হয়েছে।',
      stars: 5,
      weeks: 10,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: true,
    },
    {
      name: 'তানভীর ক.',
      age: 29,
      city: 'রাজশাহী',
      text: 'প্রথম সপ্তাহে বেশি পার্থক্য বুঝতে পারিনি, কিন্তু তৃতীয় সপ্তাহ থেকে আসল পরিবর্তন শুরু হলো।',
      stars: 5,
      weeks: 3,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: false,
    },
    {
      name: 'মাহমুদ হ.',
      age: 32,
      city: 'খুলনা',
      text: 'Gym-এ আগে ৩০ মিনিট পারতাম না, এখন ১ ঘন্টা সহজেই করি। Energy level অনেক বেড়েছে।',
      stars: 5,
      weeks: 5,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: false,
    },
    {
      name: 'ফারহান স.',
      age: 36,
      city: 'ঢাকা',
      text: 'Discreet packaging-এ আসাটা ভালো লেগেছে। কেউ কিছু বুঝতে পারেনি। আর result তো অসাধারণ!',
      stars: 5,
      weeks: 7,
      youtubeUrl: '',
      isVideo: false,
      isFeatured: false,
    },
    // YouTube video reviews
    {
      name: 'সজল আহমেদ',
      age: 35,
      city: 'ঢাকা',
      text: 'VajraForce ব্যবহার করার পর আমার অভিজ্ঞতা শেয়ার করছি। ৪ সপ্তাহেই বড় পরিবর্তন দেখতে পেরেছি।',
      stars: 5,
      weeks: 4,
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isVideo: true,
      isFeatured: true,
    },
    {
      name: 'ইমরান হোসেন',
      age: 42,
      city: 'চট্টগ্রাম',
      text: '৩ মাসের course শেষ করার পর আমার সম্পূর্ণ জীবন বদলে গেছে। ভিডিওতে বিস্তারিত বলেছি।',
      stars: 5,
      weeks: 12,
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isVideo: true,
      isFeatured: true,
    },
    {
      name: 'রুবেল মিয়া',
      age: 31,
      city: 'সিলেট',
      text: 'প্রথমবার হারবাল supplement ব্যবহার করলাম। VajraForce আমার জন্য জাদুর মতো কাজ করেছে।',
      stars: 5,
      weeks: 5,
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isVideo: true,
      isFeatured: false,
    },
  ];

  for (const review of reviews) {
    await db.review.create({ data: review });
  }
  console.log(`Seeded ${reviews.length} reviews`);

  // Seed some sample orders
  const orders = [
    { name: 'হাসান আলী', phone: '01712345678', address: 'House 12, Road 5, Dhanmondi', division: 'ঢাকা', notes: '', status: 'delivered' },
    { name: 'কামরুল ইসলাম', phone: '01898765432', address: 'Block C, Agrabad', division: 'চট্টগ্রাম', notes: 'COD', status: 'confirmed' },
    { name: 'মোস্তফা করিম', phone: '01534567890', address: 'Station Road, Rajshahi', division: 'রাজশাহী', notes: '', status: 'delivered' },
    { name: 'তৌহিদুল ইসলাম', phone: '01612348765', address: 'Zindabazar, Sylhet', division: 'সিলেট', notes: 'Gate 2', status: 'pending' },
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
