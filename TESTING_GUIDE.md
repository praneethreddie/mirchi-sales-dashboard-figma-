# Quick Start Guide - Testing New Features

## 🚀 Starting the Application

The development server is already running at **http://localhost:5173/**

## 🔐 Login to the System

1. Open the application in your browser
2. You'll see the login page
3. Use demo credentials:
   - **Email:** `demo@example.com`
   - **Password:** `demo123`
4. Click "Login"

**or**

Create a new account with "Sign Up":
- Enter any email
- Set a password
- Enter your name
- Enter your organization name

---

## ✅ Feature Testing Checklist

### 1. **Authentication**
- [ ] Login with demo credentials
- [ ] Sign up with new account
- [ ] Verify user info in sidebar
- [ ] Click logout button to sign out
- [ ] Verify redirected to login page

### 2. **Invoice Printing**
**Path:** Dashboard → Sales / Dispatch

- [ ] Click "New Sale" button
- [ ] Fill in form:
  - Customer: Select any customer
  - Batch: Select any batch
  - Weight: 500 kg
  - Bags: 10
  - Sale Price: 200 ₹/kg
  - Advance Paid: 50000 ₹ (optional)
- [ ] Click "Create Invoice"
- [ ] Click eye icon on invoice row
- [ ] Invoice modal opens
- [ ] Click "Print" button
- [ ] New window opens with formatted invoice
- [ ] Browser print dialog appears
- [ ] Print or close

### 3. **WhatsApp Reminder**
**Path:** Sales / Dispatch (Invoice Modal)

- [ ] Open any invoice (eye icon)
- [ ] Click "WhatsApp" button (green button)
- [ ] WhatsApp opens with pre-filled message
- [ ] Message includes:
  - Customer name
  - Invoice number
  - Total amount
  - Payment reminder
- [ ] You can edit and send or close

### 4. **Searchable Supplier Input**
**Path:** Dashboard → Purchase / Inflow

- [ ] Click "Add Batch" button
- [ ] Look for "Supplier" field
- [ ] Click on supplier input
- [ ] Type to search (e.g., "Ramu")
- [ ] See filtered list with:
  - Supplier name
  - City
  - Phone
  - Balance
- [ ] Click a supplier to select
- [ ] Or type a new name and see "Add as new supplier" option
- [ ] Click to add new supplier
- [ ] Form appears for:
  - Supplier name
  - Phone number
  - City
- [ ] Fill and click "Add Supplier"
- [ ] New supplier added and selected

### 5. **Partial Payment Support**
**Path:** Sales / Dispatch → New Sale

- [ ] Create a new sale with:
  - Weight: 1000 kg
  - Rate: 200 ₹/kg
  - Total: 200,000 ₹
- [ ] Enter "Advance Paid": 100,000 ₹
- [ ] See summary showing:
  - Total Amount: 200,000 ₹
  - Pending: 100,000 ₹
- [ ] Create invoice
- [ ] View invoice - shows:
  - Total Amount
  - Paid: 100,000 ₹
  - Pending: 100,000 ₹
  - Status: "Partial"
- [ ] Go to Payments module
- [ ] Click "Record Payment"
- [ ] Select "Received (from customer)"
- [ ] Select customer
- [ ] Enter remaining amount
- [ ] Submit

### 6. **Activity Logs**
**Path:** Dashboard → Activity Logs

- [ ] Click "Activity Logs" in sidebar
- [ ] See list of actions with:
  - Module icon (📤📥📦💰👤)
  - User name
  - Action (Created/Updated/Deleted/Viewed)
  - Module type
  - Description
  - Timestamp
- [ ] Click any log entry to expand
- [ ] See details:
  - Record ID
  - Record Name
  - Changes made
  - Full timestamp
- [ ] Filter by:
  - Module (click stat card)
  - User (dropdown)
  - Action (dropdown)
  - Free text search
- [ ] View logs for:
  - Sales created
  - Invoices printed
  - WhatsApp reminders sent
  - Suppliers added
  - Payments recorded

### 7. **Multi-Tenant Support**
- [ ] Create account with Organization A
- [ ] Create sales/purchases in Organization A
- [ ] Logout and create account with Organization B
- [ ] Data from Organization A is not visible
- [ ] Create data in Organization B
- [ ] Logout and login to Organization A
- [ ] Only Organization A data is visible
- [x] *Infrastructure ready - Full testing requires Supabase integration*

---

## 📊 Features Summary

| Feature | Status | Location | How to Test |
|---------|--------|----------|-------------|
| Login/Signup | ✅ Complete | Login Page | Use demo@example.com |
| Invoice Printing | ✅ Complete | Sales → Print | Click Print button |
| WhatsApp Reminder | ✅ Complete | Sales → WhatsApp | Click WhatsApp button |
| Supplier Search | ✅ Complete | Purchase → Supplier field | Type to search |
| Inline Supplier Add | ✅ Complete | Purchase → Add supplier | Type and add new |
| Partial Payments | ✅ Complete | Sales → Payments | Record partial payment |
| Activity Logs | ✅ Complete | Activity Logs | View all actions |
| Expandable Details | ✅ Complete | Activity Logs → Click | Expand any log |
| Multi-Tenant | ✅ Ready | Everywhere | Create multiple orgs |

---

## 🐛 Testing Tips

1. **Clear Data:** Check browser DevTools → Application → Clear Site Data if you need to reset
2. **Multiple Users:** Open app in different browsers to test multi-tenant features
3. **Activity Logs:** Perform actions and immediately check Activity Logs to see them logged
4. **Print:** Look for "Print" in browser print dialog - the invoice template is formatted for printing
5. **WhatsApp:** Opens wa.me link - requires WhatsApp Web or app installed

---

## 📝 Example Test Scenarios

### Scenario 1: Complete Sale with Payment
1. Create new sale with 1000kg @ ₹200/kg = ₹200,000
2. Mark ₹50,000 as advance paid
3. Print invoice
4. Send WhatsApp reminder
5. Record full payment (₹150,000 more)
6. Check Activity Logs - see all 4 actions

### Scenario 2: Multi-Organization
1. Signup as "Org A"
2. Add 3 suppliers
3. Create 2 sales
4. Logout
5. Signup as "Org B"
6. See no suppliers or sales from Org A
7. Add your own data
8. See different data in Activity Logs

### Scenario 3: Supplier Management
1. Go to Purchase
2. Click Add Batch
3. In supplier: search for existing
4. Add new supplier on the fly
5. Check Activity Logs for supplier creation

---

## 🎯 Acceptance Criteria Met

- [x] No UI design changes
- [x] No layout modifications
- [x] Only functionality added
- [x] Existing colors preserved
- [x] All features working
- [x] Activity logging integrated
- [x] Multi-tenant ready
- [x] Supabase integration ready
- [x] Demo mode fully functional

---

## 📞 Next Steps

1. **Test** all features using this guide
2. **Provide feedback** on functionality
3. **Integrate Supabase** when ready
4. **Migrate data** to production database
5. **Deploy** to production environment

---

**Last Updated:** May 29, 2026  
**Application Status:** ✅ Ready to Test
