import fs from "fs";
import path from "path";

export interface SampleProductItem {
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  storageType: string;
  typicalPurchasePrice: number;
  typicalSellingPrice: number;
  hasExpiry: boolean;
  shelfLifeDays?: number;
}

export const TAMIL_NADU_DISTRICTS = [
  { district: "Chennai", market: "Koyambedu Wholesale Market" },
  { district: "Chennai", market: "George Town Commodity Market" },
  { district: "Coimbatore", market: "MGR Wholesale Vegetable Mandi" },
  { district: "Coimbatore", market: "RS Puram Trade Centre" },
  { district: "Madurai", market: "Mattuthavani Vegetable Market" },
  { district: "Madurai", market: "Simmakkal Wholesale Mandi" },
  { district: "Tiruchirappalli", market: "Gandhi Market Mandi" },
  { district: "Salem", market: "Shevapet Wholesale Grain Market" },
  { district: "Erode", market: "Nethaji Daily Market" },
  { district: "Tiruppur", market: "Thennampalayam Daily Market" },
  { district: "Thanjavur", market: "Kamaraj Daily Market" },
  { district: "Tirunelveli", market: "Nainar Kulam Wholesale Market" },
  { district: "Vellore", market: "Katpadi Wholesale Mandi" },
  { district: "Dindigul", market: "Oddanchatram Vegetable Market" },
  { district: "Nilgiris", market: "Ooty Municipal Market" },
  { district: "Theni", market: "Chinnamanur Banana Auction Center" },
  { district: "Thoothukudi", market: "VOC Port Salt & Provisions Terminal" },
  { district: "Cuddalore", market: "Panruti Jackfruit & Cashew Market" },
];

export const TAMIL_NADU_SUPPLIERS = [
  { code: "SUP-TN-01", name: "Kongu Agro Supplies", district: "Coimbatore" },
  { code: "SUP-TN-02", name: "Chennai Metro Spices & FMCG", district: "Chennai" },
  { code: "SUP-TN-03", name: "Cauvery Delta Farmers Collective", district: "Tiruchirappalli" },
  { code: "SUP-TN-04", name: "Madurai Meenakshi Dairy & Provisions", district: "Madurai" },
  { code: "SUP-TN-05", name: "Salem Sago & Staples Traders", district: "Salem" },
  { code: "SUP-TN-06", name: "Erode Turmeric & Agri Logistics", district: "Erode" },
  { code: "SUP-TN-07", name: "Nilgiris High-Range Organic Produce", district: "Nilgiris" },
  { code: "SUP-TN-08", name: "Nellai Wholesale Mandi Corporation", district: "Tirunelveli" },
  { code: "SUP-TN-09", name: "Thanjavur Grain & Rice Mills Depot", district: "Thanjavur" },
  { code: "SUP-TN-10", name: "Oddanchatram Farm Logistics Network", district: "Dindigul" },
];

export const PRODUCT_TEMPLATES: SampleProductItem[] = [
  // 1. Vegetables
  { name: "Country Tomato (Naatu Thakkali)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 28, typicalSellingPrice: 40, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Hybrid Red Tomato (Bangalore Thakkali)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 24, typicalSellingPrice: 35, hasExpiry: true, shelfLifeDays: 9 },
  { name: "Salem Big Red Onion (Vengayam)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 32, typicalSellingPrice: 46, hasExpiry: true, shelfLifeDays: 20 },
  { name: "Perambalur Small Shallots (Chinna Vengayam)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 55, typicalSellingPrice: 78, hasExpiry: true, shelfLifeDays: 18 },
  { name: "Nilgiris Fresh Ooty Carrot", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 42, typicalSellingPrice: 62, hasExpiry: true, shelfLifeDays: 12 },
  { name: "Kodaikanal Special Potato (Urulaikizhangu)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 26, typicalSellingPrice: 38, hasExpiry: true, shelfLifeDays: 30 },
  { name: "Madurai Round Purple Brinjal (Kathirikai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 30, typicalSellingPrice: 45, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Tirunelveli Green Chilli (Pachai Milagai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 48, typicalSellingPrice: 70, hasExpiry: true, shelfLifeDays: 10 },
  { name: "Thanjavur Country Drumstick (Murungakkai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 50, typicalSellingPrice: 75, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Oddanchatram Tender Okra (Vendakkai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 34, typicalSellingPrice: 50, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Hosur Fresh Green Cabbage", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 20, typicalSellingPrice: 30, hasExpiry: true, shelfLifeDays: 14 },
  { name: "Hosur Compact White Cauliflower", category: "Vegetables", subcategory: "Fresh Produce", unit: "piece", storageType: "COLD_STORAGE", typicalPurchasePrice: 25, typicalSellingPrice: 40, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Ooty Tender French Beans", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 50, typicalSellingPrice: 75, hasExpiry: true, shelfLifeDays: 8 },
  { name: "Kovakkai (Ivy Gourd)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 28, typicalSellingPrice: 42, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Snake Gourd (Pudalangai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 22, typicalSellingPrice: 35, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Ridge Gourd (Peerkangai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 32, typicalSellingPrice: 48, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Bitter Gourd (Pavakkai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 36, typicalSellingPrice: 52, hasExpiry: true, shelfLifeDays: 8 },
  { name: "Fresh Ginger (Inji)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 85, typicalSellingPrice: 120, hasExpiry: true, shelfLifeDays: 25 },
  { name: "Country Garlic (Naatu Poondu)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 160, typicalSellingPrice: 220, hasExpiry: false },
  { name: "Fresh Curry Leaves (Karuveppilai)", category: "Vegetables", subcategory: "Herbs", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 25, typicalSellingPrice: 45, hasExpiry: true, shelfLifeDays: 4 },
  { name: "Fresh Coriander Leaves (Kothamalli)", category: "Vegetables", subcategory: "Herbs", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 30, typicalSellingPrice: 55, hasExpiry: true, shelfLifeDays: 4 },
  { name: "Fresh Mint Leaves (Pudina)", category: "Vegetables", subcategory: "Herbs", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 28, typicalSellingPrice: 50, hasExpiry: true, shelfLifeDays: 4 },
  { name: "Raw Cooking Banana (Vazhaikkai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 6, typicalSellingPrice: 10, hasExpiry: true, shelfLifeDays: 10 },
  { name: "Ash Gourd (Poosanikkai)", category: "Vegetables", subcategory: "Fresh Produce", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 18, typicalSellingPrice: 30, hasExpiry: true, shelfLifeDays: 25 },

  // 2. Fruits
  { name: "Salem Malgova Mango", category: "Fruits", subcategory: "Seasonal Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 110, typicalSellingPrice: 160, hasExpiry: true, shelfLifeDays: 8 },
  { name: "Dharmapuri Alphonso Mango", category: "Fruits", subcategory: "Seasonal Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 130, typicalSellingPrice: 190, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Trichy Poovan Banana", category: "Fruits", subcategory: "Fresh Fruits", unit: "dozen", storageType: "ROOM_TEMP", typicalPurchasePrice: 40, typicalSellingPrice: 60, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Theni Red Banana (Sevvazhai)", category: "Fruits", subcategory: "Fresh Fruits", unit: "dozen", storageType: "ROOM_TEMP", typicalPurchasePrice: 75, typicalSellingPrice: 110, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Pollachi Robusta Green Banana", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 28, typicalSellingPrice: 42, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Dindigul Country Pink Guava (Koyya)", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 45, typicalSellingPrice: 70, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Panruti Honey Jackfruit Pods (Pala Pazham)", category: "Fruits", subcategory: "Fresh Fruits", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 60, typicalSellingPrice: 90, hasExpiry: true, shelfLifeDays: 4 },
  { name: "Madurai Striped Sweet Watermelon", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 14, typicalSellingPrice: 25, hasExpiry: true, shelfLifeDays: 14 },
  { name: "Erode Ripe Red Papaya", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 22, typicalSellingPrice: 38, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Nagapattinam Sweet Lime (Sathukudi)", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 50, typicalSellingPrice: 75, hasExpiry: true, shelfLifeDays: 12 },
  { name: "Kodai Mandarins / Oranges", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 70, typicalSellingPrice: 105, hasExpiry: true, shelfLifeDays: 12 },
  { name: "Ruby Red Pomegranate (Mathulai)", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 130, typicalSellingPrice: 185, hasExpiry: true, shelfLifeDays: 18 },
  { name: "Dindigul Sapota (Chikoo)", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "ROOM_TEMP", typicalPurchasePrice: 35, typicalSellingPrice: 55, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Theni Paneer Drakshi (Black Grapes)", category: "Fruits", subcategory: "Fresh Fruits", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 65, typicalSellingPrice: 95, hasExpiry: true, shelfLifeDays: 8 },

  // 3. Beverages
  { name: "Pollachi Tender Coconut (Elaneer)", category: "Beverages", subcategory: "Natural Beverages", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 35, typicalSellingPrice: 50, hasExpiry: true, shelfLifeDays: 7 },
  { name: "Nilgiris Strong CTC Dust Tea 500g", category: "Beverages", subcategory: "Tea & Coffee", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 140, typicalSellingPrice: 195, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Kumbakonam Special Degree Coffee Powder 500g", category: "Beverages", subcategory: "Tea & Coffee", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 220, typicalSellingPrice: 295, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Bovonto Heritage Grape Soda 600ml", category: "Beverages", subcategory: "Soft Drinks", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 26, typicalSellingPrice: 38, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Torino Orange Carbonated Drink 500ml", category: "Beverages", subcategory: "Soft Drinks", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 24, typicalSellingPrice: 35, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Aavin Badam Flavoured Milk 200ml Tetra", category: "Beverages", subcategory: "Packaged Drinks", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 22, typicalSellingPrice: 30, hasExpiry: true, shelfLifeDays: 120 },
  { name: "Alangudi Nannari Sharbat Syrup 750ml", category: "Beverages", subcategory: "Syrups", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 90, typicalSellingPrice: 135, hasExpiry: true, shelfLifeDays: 240 },
  { name: "Packaged Spring Water 1 Litre Bottle", category: "Beverages", subcategory: "Packaged Water", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 10, typicalSellingPrice: 20, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Madurai Spiced Masala Buttermilk 200ml", category: "Beverages", subcategory: "Packaged Drinks", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 11, typicalSellingPrice: 18, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Filter Coffee Liquid Decoction 200ml Pouch", category: "Beverages", subcategory: "Tea & Coffee", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 45, typicalSellingPrice: 65, hasExpiry: true, shelfLifeDays: 30 },

  // 4. Fast-food ingredients
  { name: "Classic Sesame Burger Buns (Pack of 6)", category: "Fast-food ingredients", subcategory: "Bakery Staples", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 38, typicalSellingPrice: 55, hasExpiry: true, shelfLifeDays: 5 },
  { name: "8-Inch Pre-Baked Pizza Crust (Pack of 2)", category: "Fast-food ingredients", subcategory: "Bakery Staples", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 42, typicalSellingPrice: 65, hasExpiry: true, shelfLifeDays: 6 },
  { name: "Mozzarella Pizza Cheese Block 1kg", category: "Fast-food ingredients", subcategory: "Dairy Staples", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 360, typicalSellingPrice: 480, hasExpiry: true, shelfLifeDays: 60 },
  { name: "Eggless Premium Mayonnaise 1kg Pouch", category: "Fast-food ingredients", subcategory: "Sauces & Dressings", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 125, typicalSellingPrice: 180, hasExpiry: true, shelfLifeDays: 120 },
  { name: "Spicy Peri Peri Seasoning 500g Jar", category: "Fast-food ingredients", subcategory: "Seasonings", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 140, typicalSellingPrice: 210, hasExpiry: true, shelfLifeDays: 240 },
  { name: "Frozen Crisp French Fries 9mm 1kg", category: "Fast-food ingredients", subcategory: "Frozen Foods", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 115, typicalSellingPrice: 165, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Frozen Vegetable Burger Patties 1kg", category: "Fast-food ingredients", subcategory: "Frozen Foods", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 160, typicalSellingPrice: 230, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Durum Wheat Penne Rigate Pasta 1kg", category: "Fast-food ingredients", subcategory: "Pasta & Noodles", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 90, typicalSellingPrice: 135, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Authentic Hakka Chinese Noodles 500g", category: "Fast-food ingredients", subcategory: "Pasta & Noodles", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 38, typicalSellingPrice: 60, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Refined Sunflower Cooking Oil 15L Commercial Tin", category: "Fast-food ingredients", subcategory: "Oils", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 1850, typicalSellingPrice: 2150, hasExpiry: true, shelfLifeDays: 270 },
  { name: "Rich Tomato Puree / Sauce 1.2kg Can", category: "Fast-food ingredients", subcategory: "Sauces & Dressings", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 75, typicalSellingPrice: 110, hasExpiry: true, shelfLifeDays: 365 },

  // 5. Grains and staples
  { name: "Tanjore Deluxe Ponni Boiled Rice 25kg Bag", category: "Grains and staples", subcategory: "Rice", unit: "box", storageType: "DRY_VENTILATED", typicalPurchasePrice: 1350, typicalSellingPrice: 1650, hasExpiry: false },
  { name: "Thanjavur Kuruvai Raw Rice 25kg Bag", category: "Grains and staples", subcategory: "Rice", unit: "box", storageType: "DRY_VENTILATED", typicalPurchasePrice: 1200, typicalSellingPrice: 1480, hasExpiry: false },
  { name: "Seeraga Samba Traditional Biryani Rice 5kg", category: "Grains and staples", subcategory: "Rice", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 520, typicalSellingPrice: 680, hasExpiry: false },
  { name: "Sharbati Whole Wheat Atta 10kg Bag", category: "Grains and staples", subcategory: "Flours", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 410, typicalSellingPrice: 520, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Superior Quality Maida Flour 5kg", category: "Grains and staples", subcategory: "Flours", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 180, typicalSellingPrice: 240, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Roasted Sooji Rava 1kg", category: "Grains and staples", subcategory: "Flours", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 42, typicalSellingPrice: 60, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Erode Premium Toor Dal (Thuvaram Paruppu) 1kg", category: "Grains and staples", subcategory: "Pulses & Lentils", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 135, typicalSellingPrice: 175, hasExpiry: false },
  { name: "Nellai Special Urad Dal Gota (Ulunthu) 1kg", category: "Grains and staples", subcategory: "Pulses & Lentils", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 120, typicalSellingPrice: 160, hasExpiry: false },
  { name: "Yellow Moong Dal Split (Paasi Paruppu) 1kg", category: "Grains and staples", subcategory: "Pulses & Lentils", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 105, typicalSellingPrice: 140, hasExpiry: false },
  { name: "Bengal Gram Chana Dal (Kadalai Paruppu) 1kg", category: "Grains and staples", subcategory: "Pulses & Lentils", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 82, typicalSellingPrice: 110, hasExpiry: false },
  { name: "Whole Green Gram (Pachai Payaru) 1kg", category: "Grains and staples", subcategory: "Pulses & Lentils", unit: "kg", storageType: "DRY_VENTILATED", typicalPurchasePrice: 98, typicalSellingPrice: 132, hasExpiry: false },
  { name: "Organic Finger Millet Flour (Kezhvaragu / Ragi) 1kg", category: "Grains and staples", subcategory: "Millets", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 48, typicalSellingPrice: 70, hasExpiry: true, shelfLifeDays: 120 },
  { name: "Kodo Millet Rice (Varagu Arisi) 1kg", category: "Grains and staples", subcategory: "Millets", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 72, typicalSellingPrice: 105, hasExpiry: false },
  { name: "Little Millet (Samai Arisi) 1kg", category: "Grains and staples", subcategory: "Millets", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 75, typicalSellingPrice: 110, hasExpiry: false },
  { name: "Foxtail Millet (Thinai Arisi) 1kg", category: "Grains and staples", subcategory: "Millets", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 70, typicalSellingPrice: 100, hasExpiry: false },
  { name: "Barnyard Millet (Kuthiraivali Arisi) 1kg", category: "Grains and staples", subcategory: "Millets", unit: "packet", storageType: "DRY_VENTILATED", typicalPurchasePrice: 76, typicalSellingPrice: 112, hasExpiry: false },

  // 6. Dairy
  { name: "Aavin Full Cream Milk (Orange) 500ml", category: "Dairy", subcategory: "Milk", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 26, typicalSellingPrice: 30, hasExpiry: true, shelfLifeDays: 2 },
  { name: "Aavin Standardized Cow Milk (Green) 500ml", category: "Dairy", subcategory: "Milk", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 21, typicalSellingPrice: 25, hasExpiry: true, shelfLifeDays: 2 },
  { name: "Fresh Thick Farm Curd (Thayir) 1kg Tub", category: "Dairy", subcategory: "Curd & Yoghurt", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 60, typicalSellingPrice: 80, hasExpiry: true, shelfLifeDays: 5 },
  { name: "Traditional Pure Cow Ghee (Nei) 500ml", category: "Dairy", subcategory: "Ghee & Butter", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 310, typicalSellingPrice: 420, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Fresh Soft Malai Paneer 500g Pack", category: "Dairy", subcategory: "Paneer & Cheese", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 175, typicalSellingPrice: 240, hasExpiry: true, shelfLifeDays: 14 },
  { name: "Unsalted Creamery Butter 500g Brick", category: "Dairy", subcategory: "Ghee & Butter", unit: "piece", storageType: "COLD_STORAGE", typicalPurchasePrice: 220, typicalSellingPrice: 290, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Fresh Milk Khoya / Mawa 250g", category: "Dairy", subcategory: "Traditional Dairy", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 95, typicalSellingPrice: 140, hasExpiry: true, shelfLifeDays: 10 },
  { name: "Sweetened Condensed Milk 400g Tin", category: "Dairy", subcategory: "Processed Dairy", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 98, typicalSellingPrice: 135, hasExpiry: true, shelfLifeDays: 240 },

  // 7. Bakery products
  { name: "Classic Sandwich Sliced White Bread 400g", category: "Bakery products", subcategory: "Breads", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 26, typicalSellingPrice: 38, hasExpiry: true, shelfLifeDays: 4 },
  { name: "100% Whole Wheat Brown Bread 400g", category: "Bakery products", subcategory: "Breads", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 34, typicalSellingPrice: 48, hasExpiry: true, shelfLifeDays: 4 },
  { name: "Rich Plum Fruit Cake 500g Box", category: "Bakery products", subcategory: "Cakes", unit: "box", storageType: "ROOM_TEMP", typicalPurchasePrice: 130, typicalSellingPrice: 190, hasExpiry: true, shelfLifeDays: 30 },
  { name: "Crispy Elaichi Butter Rusk 400g", category: "Bakery products", subcategory: "Biscuits & Rusks", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 45, typicalSellingPrice: 65, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Nilgiris Fresh Coconut Macaroons 250g", category: "Bakery products", subcategory: "Confectionery", unit: "box", storageType: "ROOM_TEMP", typicalPurchasePrice: 90, typicalSellingPrice: 140, hasExpiry: true, shelfLifeDays: 45 },
  { name: "Osmania Salt Tea Biscuits 300g", category: "Bakery products", subcategory: "Biscuits & Rusks", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 42, typicalSellingPrice: 65, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Active Instant Dry Baking Yeast 100g", category: "Bakery products", subcategory: "Baking Supplies", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 35, typicalSellingPrice: 55, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Dutch Processed Cocoa Powder 250g Box", category: "Bakery products", subcategory: "Baking Supplies", unit: "box", storageType: "ROOM_TEMP", typicalPurchasePrice: 110, typicalSellingPrice: 165, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Tri-Color Tutti Frutti Papaya Cubes 500g", category: "Bakery products", subcategory: "Baking Supplies", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 48, typicalSellingPrice: 75, hasExpiry: true, shelfLifeDays: 180 },

  // 8. Spices and condiments
  { name: "Erode Pure Ground Turmeric Powder (Manjal) 500g", category: "Spices and condiments", subcategory: "Powdered Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 85, typicalSellingPrice: 125, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Guntur Dry Red Chilli Powder (Milagai Thool) 500g", category: "Spices and condiments", subcategory: "Powdered Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 130, typicalSellingPrice: 185, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Coriander Seed Powder (Malli Thool) 500g", category: "Spices and condiments", subcategory: "Powdered Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 80, typicalSellingPrice: 115, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Chettinad Spicy Garam Masala Blend 200g", category: "Spices and condiments", subcategory: "Masala Blends", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 75, typicalSellingPrice: 110, hasExpiry: true, shelfLifeDays: 270 },
  { name: "Whole Malabar Black Pepper (Milagu) 250g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 160, typicalSellingPrice: 235, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Aromatic Cumin Seeds (Jeeragam) 250g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 110, typicalSellingPrice: 160, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Mustard Seeds Tiny (Kadugu) 250g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 32, typicalSellingPrice: 48, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Fenugreek Seeds (Vendhayam) 250g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 30, typicalSellingPrice: 45, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Compounded Asafoetida Powder (Perungayam) 50g", category: "Spices and condiments", subcategory: "Seasonings", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 45, typicalSellingPrice: 65, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Tuticorin Pure Iodized Salt 1kg Pouch", category: "Spices and condiments", subcategory: "Salts", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 14, typicalSellingPrice: 22, hasExpiry: false },
  { name: "Tuticorin Natural Crystal Rock Salt (Kal Uppu) 1kg", category: "Spices and condiments", subcategory: "Salts", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 10, typicalSellingPrice: 18, hasExpiry: false },
  { name: "Green Cardamom Extra Bold (Elaichi) 100g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 240, typicalSellingPrice: 340, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Cinnamon Bark Sticks (Dalchini) 100g", category: "Spices and condiments", subcategory: "Whole Spices", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 65, typicalSellingPrice: 95, hasExpiry: true, shelfLifeDays: 365 },

  // 9. Meat and frozen food
  { name: "Tamil Nadu Country Chicken (Naatu Kozhi) Cut", category: "Meat and frozen food", subcategory: "Poultry", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 320, typicalSellingPrice: 420, hasExpiry: true, shelfLifeDays: 2 },
  { name: "Fresh Broiler Chicken Curry Cut Skinless", category: "Meat and frozen food", subcategory: "Poultry", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 160, typicalSellingPrice: 220, hasExpiry: true, shelfLifeDays: 2 },
  { name: "Fresh Mutton Bone-in Curry Cut", category: "Meat and frozen food", subcategory: "Mutton", unit: "kg", storageType: "COLD_STORAGE", typicalPurchasePrice: 680, typicalSellingPrice: 850, hasExpiry: true, shelfLifeDays: 2 },
  { name: "Rameshwaram Vanjaram (Seer Fish) Slices", category: "Meat and frozen food", subcategory: "Fish & Seafood", unit: "kg", storageType: "FROZEN", typicalPurchasePrice: 720, typicalSellingPrice: 960, hasExpiry: true, shelfLifeDays: 30 },
  { name: "Cuddalore Tiger Prawns Deveined 500g", category: "Meat and frozen food", subcategory: "Fish & Seafood", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 340, typicalSellingPrice: 470, hasExpiry: true, shelfLifeDays: 60 },
  { name: "Frozen Sweet Green Peas (Pattani) 1kg", category: "Meat and frozen food", subcategory: "Frozen Veg", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 110, typicalSellingPrice: 160, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Frozen American Sweet Corn Kernels 1kg", category: "Meat and frozen food", subcategory: "Frozen Veg", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 105, typicalSellingPrice: 155, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Frozen Crispy Veg Cocktail Samosas 500g", category: "Meat and frozen food", subcategory: "Frozen Snacks", unit: "packet", storageType: "FROZEN", typicalPurchasePrice: 85, typicalSellingPrice: 130, hasExpiry: true, shelfLifeDays: 120 },

  // 10. Grocery and packaged foods
  { name: "Refined Sulphur-Free Crystal Sugar 1kg", category: "Grocery and packaged foods", subcategory: "Sweeteners", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 38, typicalSellingPrice: 48, hasExpiry: false },
  { name: "Tirunelveli Pure Palm Jaggery (Karupatti) 500g", category: "Grocery and packaged foods", subcategory: "Sweeteners", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 140, typicalSellingPrice: 210, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Traditional Cane Jaggery Block (Mandai Vellam) 1kg", category: "Grocery and packaged foods", subcategory: "Sweeteners", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 65, typicalSellingPrice: 90, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Dharmapuri Seedless Sour Tamarind (Puli) 500g", category: "Grocery and packaged foods", subcategory: "Cooking Essentials", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 95, typicalSellingPrice: 145, hasExpiry: false },
  { name: "Chettinad Special Crispy Appalam (Pack of 50)", category: "Grocery and packaged foods", subcategory: "Snacks & Papads", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 40, typicalSellingPrice: 60, hasExpiry: true, shelfLifeDays: 120 },
  { name: "Cold Pressed Gingelly / Sesame Oil (Nallennai) 1L", category: "Grocery and packaged foods", subcategory: "Edible Oils", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 260, typicalSellingPrice: 340, hasExpiry: true, shelfLifeDays: 240 },
  { name: "Cold Pressed Groundnut Oil (Kadalai Ennai) 1L", category: "Grocery and packaged foods", subcategory: "Edible Oils", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 185, typicalSellingPrice: 245, hasExpiry: true, shelfLifeDays: 240 },
  { name: "Pure Filtered Coconut Oil (Thengai Ennai) 1L", category: "Grocery and packaged foods", subcategory: "Edible Oils", unit: "piece", storageType: "ROOM_TEMP", typicalPurchasePrice: 210, typicalSellingPrice: 285, hasExpiry: true, shelfLifeDays: 240 },
  { name: "Salem Fried Gram (Pottukadalai) 500g", category: "Grocery and packaged foods", subcategory: "Cooking Essentials", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 55, typicalSellingPrice: 80, hasExpiry: true, shelfLifeDays: 90 },
  { name: "Raw Peanuts (Verkadalai) 500g", category: "Grocery and packaged foods", subcategory: "Cooking Essentials", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 60, typicalSellingPrice: 88, hasExpiry: true, shelfLifeDays: 120 },
  { name: "Roasted Wheat Vermicelli (Semiya) 500g", category: "Grocery and packaged foods", subcategory: "Breakfast Staples", unit: "packet", storageType: "ROOM_TEMP", typicalPurchasePrice: 32, typicalSellingPrice: 48, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Fresh Idli / Dosa Fermented Batter 1kg Pouch", category: "Grocery and packaged foods", subcategory: "Fresh Staples", unit: "packet", storageType: "COLD_STORAGE", typicalPurchasePrice: 30, typicalSellingPrice: 45, hasExpiry: true, shelfLifeDays: 5 },
];

/**
 * Generates records for CSV dataset
 */
export function generateDataset(count: number = 220) {
  const records = [];
  const baseCount = PRODUCT_TEMPLATES.length;

  for (let i = 0; i < count; i++) {
    const template = PRODUCT_TEMPLATES[i % baseCount];
    const locIndex = (i * 7 + 3) % TAMIL_NADU_DISTRICTS.length;
    const location = TAMIL_NADU_DISTRICTS[locIndex];
    const supIndex = (i * 3 + 2) % TAMIL_NADU_SUPPLIERS.length;
    const supplier = TAMIL_NADU_SUPPLIERS[supIndex];

    const iteration = Math.floor(i / baseCount);
    const suffix = iteration > 0 ? ` (Grade-${String.fromCharCode(65 + iteration)})` : "";
    const codeNumber = String(i + 1).padStart(4, "0");
    const productCode = `TN-SKU-${codeNumber}`;

    // Price variation +-15%
    const priceVariance = 0.88 + ((i * 13) % 25) / 100;
    const purchasePrice = Math.round(template.typicalPurchasePrice * priceVariance);
    const sellingPrice = Math.round(template.typicalSellingPrice * priceVariance);

    // Quantity distributions including normal, low-stock, and out-of-stock
    let currentQuantity: number;
    const minStockLevel = template.unit === "box" || template.unit === "piece" ? 8 : 15;
    const reorderQuantity = minStockLevel * 4;

    if (i % 23 === 0) {
      currentQuantity = 0; // OUT OF STOCK test cases
    } else if (i % 11 === 0) {
      currentQuantity = Math.max(1, Math.floor(minStockLevel * 0.6)); // LOW STOCK test cases
    } else {
      currentQuantity = minStockLevel * 2 + ((i * 17) % 150);
    }

    // Manufacture and Expiry dates
    let manufactureDate = "";
    let expiryDate = "";
    const today = new Date();

    if (template.hasExpiry) {
      const shelfDays = template.shelfLifeDays || 30;
      const mfg = new Date(today);

      if (i % 17 === 0) {
        // EXPIRED test case
        mfg.setDate(today.getDate() - shelfDays - 3);
        const exp = new Date(mfg);
        exp.setDate(mfg.getDate() + shelfDays);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      } else if (i % 13 === 0) {
        // EXPIRING SOON test case (within 3-5 days)
        mfg.setDate(today.getDate() - shelfDays + 4);
        const exp = new Date(today);
        exp.setDate(today.getDate() + 4);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      } else {
        // Normal valid batch
        mfg.setDate(today.getDate() - Math.floor(shelfDays * 0.3));
        const exp = new Date(mfg);
        exp.setDate(mfg.getDate() + shelfDays);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      }
    }

    const batchNumber = `TN-BCH-${2026}${String((i % 50) + 1).padStart(3, "0")}`;

    records.push({
      product_id: productCode,
      product_name: `${template.name}${suffix}`,
      category: template.category,
      subcategory: template.subcategory,
      product_code: productCode,
      unit: template.unit,
      district: location.district,
      market_location: location.market,
      supplier_id: supplier.code,
      supplier_name: supplier.name,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      current_quantity: currentQuantity,
      minimum_stock_level: minStockLevel,
      reorder_quantity: reorderQuantity,
      batch_number: batchNumber,
      manufacture_date: manufactureDate,
      expiry_date: expiryDate,
      storage_type: template.storageType,
      last_updated: new Date().toISOString(),
      data_source: "TAMIL_NADU_RETAIL_SYNTHETIC_DATA_V1",
      is_sample_data: "true",
    });
  }

  return records;
}

// CLI Execution
if (require.main === module || process.argv[1]?.includes("generate-dataset")) {
  const args = process.argv.slice(2);
  const countArg = args.find((a) => a.startsWith("--count="));
  const recordCount = countArg ? parseInt(countArg.split("=")[1], 10) : 220;

  console.log(`Generating ${recordCount} Tamil Nadu inventory records...`);
  const records = generateDataset(recordCount);

  // Ensure public/data directory
  const publicDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const headers = Object.keys(records[0]);
  const csvLines = [
    headers.join(","),
    ...records.map((r) =>
      headers
        .map((h) => {
          const val = String((r as Record<string, unknown>)[h] ?? "");
          return val.includes(",") ? `"${val}"` : val;
        })
        .join(",")
    ),
  ];

  const filePath = path.join(publicDir, "tamilnadu_inventory_sample_200.csv");
  fs.writeFileSync(filePath, csvLines.join("\n"), "utf-8");
  console.log(`Successfully generated ${records.length} records to ${filePath}`);
}
