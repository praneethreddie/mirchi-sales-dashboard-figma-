export type ChiliVariety = "Teja" | "334" | "Byadgi" | "Guntur" | "Wrinkled";
export type Grade = "A" | "B" | "C" | "Premium";
export type PaymentMode = "Cash" | "UPI" | "Bank Transfer" | "Cheque";
export type PaymentStatus = "Paid" | "Partial" | "Pending";
export type UserRole = "Admin" | "Manager" | "Inventory Staff" | "Sales Staff";

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  city: string;
  balance: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  balance: number;
  totalPurchased: number;
}

export interface Batch {
  id: string;
  supplierId: string;
  supplierName: string;
  variety: ChiliVariety;
  grade: Grade;
  bags: number;
  weightKg: number;
  purchasePrice: number;
  totalValue: number;
  location: string;
  date: string;
  remainingKg: number;
  remainingBags: number;
}

export interface SaleRecord {
  id: string;
  customerId: string;
  customerName: string;
  batchIds: string[];
  variety: ChiliVariety;
  grade: Grade;
  weightKg: number;
  bags: number;
  salePrice: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  date: string;
  invoiceNo: string;
}

export interface Payment {
  id: string;
  type: "received" | "paid";
  partyId: string;
  partyName: string;
  amount: number;
  mode: PaymentMode;
  date: string;
  reference: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  module: "Sales" | "Purchase" | "Inventory" | "Payments" | "Users";
  action: "Created" | "Updated" | "Deleted" | "Viewed" | "Login";
  description: string;
  timestamp: string;
}

export const suppliers: Supplier[] = [
  { id: "S001", name: "Ramu Traders", phone: "9848012345", city: "Guntur", balance: 45000 },
  { id: "S002", name: "Sri Lakshmi Agencies", phone: "9848023456", city: "Warangal", balance: 12500 },
  { id: "S003", name: "Venkat Reddy & Sons", phone: "9848034567", city: "Khammam", balance: 0 },
  { id: "S004", name: "Chinna Mirchi Farms", phone: "9848045678", city: "Byadgi", balance: 78000 },
  { id: "S005", name: "Suresh Agro", phone: "9848056789", city: "Raichur", balance: 23400 },
];

export const customers: Customer[] = [
  { id: "C001", name: "Mehta Spice Exports", phone: "9912345678", city: "Mumbai", balance: 125000, totalPurchased: 845000 },
  { id: "C002", name: "Patel Food Industries", phone: "9923456789", city: "Ahmedabad", balance: 0, totalPurchased: 620000 },
  { id: "C003", name: "Kumar Masala Works", phone: "9934567890", city: "Delhi", balance: 56700, totalPurchased: 390000 },
  { id: "C004", name: "Reddy Brothers", phone: "9945678901", city: "Hyderabad", balance: 89000, totalPurchased: 275000 },
  { id: "C005", name: "South Indian Spices", phone: "9956789012", city: "Chennai", balance: 34200, totalPurchased: 190000 },
  { id: "C006", name: "Global Chili Trading", phone: "9967890123", city: "Kochi", balance: 0, totalPurchased: 445000 },
];

export const batches: Batch[] = [
  { id: "B-2401", supplierId: "S001", supplierName: "Ramu Traders", variety: "Teja", grade: "A", bags: 120, weightKg: 6000, purchasePrice: 185, totalValue: 1110000, location: "Shed A", date: "2024-05-10", remainingKg: 2400, remainingBags: 48 },
  { id: "B-2402", supplierId: "S002", supplierName: "Sri Lakshmi Agencies", variety: "334", grade: "Premium", bags: 80, weightKg: 4000, purchasePrice: 210, totalValue: 840000, location: "Shed B", date: "2024-05-12", remainingKg: 4000, remainingBags: 80 },
  { id: "B-2403", supplierId: "S004", supplierName: "Chinna Mirchi Farms", variety: "Byadgi", grade: "A", bags: 200, weightKg: 10000, purchasePrice: 165, totalValue: 1650000, location: "Shed A", date: "2024-05-15", remainingKg: 7200, remainingBags: 144 },
  { id: "B-2404", supplierId: "S003", supplierName: "Venkat Reddy & Sons", variety: "Guntur", grade: "B", bags: 60, weightKg: 3000, purchasePrice: 145, totalValue: 435000, location: "Shed C", date: "2024-05-18", remainingKg: 3000, remainingBags: 60 },
  { id: "B-2405", supplierId: "S005", supplierName: "Suresh Agro", variety: "Teja", grade: "Premium", bags: 150, weightKg: 7500, purchasePrice: 220, totalValue: 1650000, location: "Shed B", date: "2024-05-20", remainingKg: 5800, remainingBags: 116 },
  { id: "B-2406", supplierId: "S001", supplierName: "Ramu Traders", variety: "Wrinkled", grade: "C", bags: 40, weightKg: 2000, purchasePrice: 125, totalValue: 250000, location: "Shed D", date: "2024-05-22", remainingKg: 2000, remainingBags: 40 },
];

export const sales: SaleRecord[] = [
  { id: "INV-001", customerId: "C001", customerName: "Mehta Spice Exports", batchIds: ["B-2401"], variety: "Teja", grade: "A", weightKg: 1800, bags: 36, salePrice: 215, totalAmount: 387000, paymentStatus: "Partial", paidAmount: 200000, date: "2024-05-14", invoiceNo: "MY/2024/001" },
  { id: "INV-002", customerId: "C002", customerName: "Patel Food Industries", batchIds: ["B-2403"], variety: "Byadgi", grade: "A", weightKg: 2800, bags: 56, salePrice: 195, totalAmount: 546000, paymentStatus: "Paid", paidAmount: 546000, date: "2024-05-16", invoiceNo: "MY/2024/002" },
  { id: "INV-003", customerId: "C006", customerName: "Global Chili Trading", batchIds: ["B-2405"], variety: "Teja", grade: "Premium", weightKg: 1700, bags: 34, salePrice: 255, totalAmount: 433500, paymentStatus: "Paid", paidAmount: 433500, date: "2024-05-19", invoiceNo: "MY/2024/003" },
  { id: "INV-004", customerId: "C003", customerName: "Kumar Masala Works", batchIds: ["B-2402"], variety: "334", grade: "Premium", weightKg: 800, bags: 16, salePrice: 245, totalAmount: 196000, paymentStatus: "Pending", paidAmount: 0, date: "2024-05-21", invoiceNo: "MY/2024/004" },
  { id: "INV-005", customerId: "C004", customerName: "Reddy Brothers", batchIds: ["B-2401", "B-2403"], variety: "Teja", grade: "A", weightKg: 1200, bags: 24, salePrice: 218, totalAmount: 261600, paymentStatus: "Partial", paidAmount: 172600, date: "2024-05-23", invoiceNo: "MY/2024/005" },
  { id: "INV-006", customerId: "C005", customerName: "South Indian Spices", batchIds: ["B-2405"], variety: "Teja", grade: "Premium", weightKg: 500, bags: 10, salePrice: 258, totalAmount: 129000, paymentStatus: "Pending", paidAmount: 0, date: "2024-05-25", invoiceNo: "MY/2024/006" },
];

export const payments: Payment[] = [
  { id: "P001", type: "received", partyId: "C001", partyName: "Mehta Spice Exports", amount: 200000, mode: "Bank Transfer", date: "2024-05-15", reference: "NEFT/2024/5678", notes: "Advance for INV-001" },
  { id: "P002", type: "received", partyId: "C002", partyName: "Patel Food Industries", amount: 546000, mode: "Cheque", date: "2024-05-17", reference: "CHQ-458921", notes: "Full payment INV-002" },
  { id: "P003", type: "paid", partyId: "S001", partyName: "Ramu Traders", amount: 500000, mode: "Bank Transfer", date: "2024-05-11", reference: "NEFT/2024/4532", notes: "Batch B-2401 payment" },
  { id: "P004", type: "received", partyId: "C006", partyName: "Global Chili Trading", amount: 433500, mode: "UPI", date: "2024-05-20", reference: "UPI/9867543", notes: "Full payment INV-003" },
  { id: "P005", type: "paid", partyId: "S004", partyName: "Chinna Mirchi Farms", amount: 800000, mode: "Bank Transfer", date: "2024-05-16", reference: "NEFT/2024/5123", notes: "Batch B-2403 partial" },
  { id: "P006", type: "received", partyId: "C004", partyName: "Reddy Brothers", amount: 172600, mode: "Cash", date: "2024-05-24", reference: "CASH-2024-056", notes: "Partial INV-005" },
];

export const users: User[] = [
  { id: "U001", name: "Rajesh Kumar", email: "rajesh@mirchiyard.com", role: "Admin", phone: "9848001234", active: true, lastLogin: "2024-05-28 09:15", createdAt: "2024-01-01" },
  { id: "U002", name: "Sunita Devi", email: "sunita@mirchiyard.com", role: "Manager", phone: "9848002345", active: true, lastLogin: "2024-05-28 08:30", createdAt: "2024-01-15" },
  { id: "U003", name: "Mohan Rao", email: "mohan@mirchiyard.com", role: "Inventory Staff", phone: "9848003456", active: true, lastLogin: "2024-05-27 18:00", createdAt: "2024-02-01" },
  { id: "U004", name: "Priya Singh", email: "priya@mirchiyard.com", role: "Sales Staff", phone: "9848004567", active: true, lastLogin: "2024-05-28 10:00", createdAt: "2024-02-10" },
  { id: "U005", name: "Ramesh Babu", email: "ramesh@mirchiyard.com", role: "Inventory Staff", phone: "9848005678", active: false, lastLogin: "2024-05-20 14:22", createdAt: "2024-03-01" },
];

export const activityLogs: ActivityLog[] = [
  { id: "L001", userId: "U004", userName: "Priya Singh", module: "Sales", action: "Created", description: "Created invoice MY/2024/006 for South Indian Spices — ₹1,29,000", timestamp: "2024-05-25 11:34" },
  { id: "L002", userId: "U003", userName: "Mohan Rao", module: "Purchase", action: "Created", description: "Added batch B-2406 from Ramu Traders — 40 bags, 2000 kg Wrinkled C grade", timestamp: "2024-05-22 09:12" },
  { id: "L003", userId: "U002", userName: "Sunita Devi", module: "Inventory", action: "Updated", description: "Moved 20 bags from Shed A to Shed B for batch B-2401", timestamp: "2024-05-22 10:45" },
  { id: "L004", userId: "U001", userName: "Rajesh Kumar", module: "Users", action: "Updated", description: "Deactivated user account Ramesh Babu (U005)", timestamp: "2024-05-21 16:00" },
  { id: "L005", userId: "U004", userName: "Priya Singh", module: "Payments", action: "Created", description: "Recorded ₹1,72,600 cash receipt from Reddy Brothers against INV-005", timestamp: "2024-05-24 14:20" },
  { id: "L006", userId: "U003", userName: "Mohan Rao", module: "Purchase", action: "Created", description: "Added batch B-2405 from Suresh Agro — 150 bags, 7500 kg Teja Premium", timestamp: "2024-05-20 08:30" },
  { id: "L007", userId: "U002", userName: "Sunita Devi", module: "Sales", action: "Updated", description: "Updated payment status for INV-002 to Paid", timestamp: "2024-05-17 12:00" },
  { id: "L008", userId: "U001", userName: "Rajesh Kumar", module: "Users", action: "Created", description: "Added new user Priya Singh as Sales Staff", timestamp: "2024-02-10 09:00" },
  { id: "L009", userId: "U004", userName: "Priya Singh", module: "Sales", action: "Created", description: "Created invoice MY/2024/005 for Reddy Brothers — ₹2,61,600", timestamp: "2024-05-23 15:10" },
  { id: "L010", userId: "U001", userName: "Rajesh Kumar", module: "Payments", action: "Created", description: "Recorded ₹8,00,000 bank transfer to Chinna Mirchi Farms for batch B-2403", timestamp: "2024-05-16 11:00" },
];

export const weeklyRevenue = [
  { day: "Mon", sales: 387000, purchases: 500000 },
  { day: "Tue", sales: 546000, purchases: 840000 },
  { day: "Wed", sales: 0, purchases: 1650000 },
  { day: "Thu", sales: 433500, purchases: 0 },
  { day: "Fri", sales: 196000, purchases: 435000 },
  { day: "Sat", sales: 261600, purchases: 1650000 },
  { day: "Sun", sales: 129000, purchases: 250000 },
];

export const inventoryByVariety = [
  { name: "Teja", kg: 8200, bags: 164 },
  { name: "334", kg: 4000, bags: 80 },
  { name: "Byadgi", kg: 7200, bags: 144 },
  { name: "Guntur", kg: 3000, bags: 60 },
  { name: "Wrinkled", kg: 2000, bags: 40 },
];

export const monthlyTrend = [
  { month: "Jan", sales: 2100000, purchases: 1800000 },
  { month: "Feb", sales: 2450000, purchases: 2100000 },
  { month: "Mar", sales: 1980000, purchases: 2400000 },
  { month: "Apr", sales: 3200000, purchases: 2800000 },
  { month: "May", sales: 1953100, purchases: 5935000 },
];
