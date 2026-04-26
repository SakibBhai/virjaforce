---
Task ID: 1
Agent: Main Agent
Task: Build Admin Panel with Order Management and Customer Dashboard

Work Log:
- Analyzed existing project structure: Next.js 16 with Prisma, shadcn/ui, Tailwind CSS
- Found existing Order model and API routes already in place
- Found existing AdminPanel and CustomerDashboard components
- Created Customer Analytics API: GET /api/orders/customers
- Completely rewrote Admin Panel with two tabs:
  1. **Orders Tab**: Order listing, search, status tabs, status change, delete, detail dialog
  2. **Customers Tab**: All unique phone numbers with order counts, total spent, sort options, detail dialog
- Updated seed file with 26 sample orders (12 unique customers, 7 repeat customers)
- Verified all APIs working correctly

Stage Summary:
- Admin Panel now has two main sections: "অর্ডার ম্যানেজমেন্ট" and "গ্রাহক ড্যাশবোর্ড"
- Customer Dashboard shows "ei number theke kotobar order asche" with:
  - Total customers, repeat customers, total revenue, avg orders stats
  - Sortable table (by order count, total spent, last order)
  - Search by name, phone, division
  - Customer detail dialog with all orders for that phone
- 26 sample orders seeded across 12 unique phone numbers
  - Top customer: হাসান আলী (01712345678) with 5 orders
  - রাসেল আহমেদ (01912345678) with 4 orders
  - 7 repeat customers, 5 new customers
