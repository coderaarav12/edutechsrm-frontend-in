// Auto-generated from studique.in/mealmap on 2026-06-28
// Hostels: Sannasi, M-Block, NRI

export interface MealMenu {
  [day: string]: {
    breakfast: string[]
    lunch: string[]
    snacks: string[]
    dinner: string[]
  }
}

export const HOSTELS = ["Sannasi", "M-Block", "NRI"] as const
export type Hostel = (typeof HOSTELS)[number]

export const MESS_MENUS: Record<Hostel, MealMenu> = {
  "Sannasi": {
    Monday: {
      breakfast: ["Bread", "Butter", "Jam", "Ghee Pongal", "Sambar", "Coconut Chutney", "Vadai", "Chappathi", "Aloo Channa", "Tea / Coffee / Milk", "Curd Rice", "Herbal Kanji"],
      lunch: ["Payasam", "Ghee Chappathi", "Green Peas Masala", "Variety Rice", "Steamed Rice", "Dal Lasooni", "Sambar", "Tomato Rasam", "Gobi-65 / Bitter Guard - 65", "Raw Banana Chops", "Pickle", "Fryums", "Special Fryums", "Butter Milk", "Millet Kanji"],
      snacks: ["Pav Bajji", "Tea / Coffee"],
      dinner: ["Malabar Paratha", "Mix Veg Kuruma", "Dosa", "Idly Podi", "Special Chutney", "Variety Rice", "Fried Rice", "Steamed Rice", "Jeera Dal", "Chilli Sambar", "Rasam", "Aloo Capsicum", "Pickle", "Fryums", "Veg-Salad", "Banana", "Millet Kanji"],
    },
    Tuesday: {
      breakfast: ["Bread", "Butter", "Jam", "Idly", "Spl Chutney", "Veg Kosthu", "Poha", "Mint Chutney", "Tea / Coffee / Milk", "Masala Omelette"],
      lunch: ["Millet Sweet", "Luchi", "Kashmiri Dum Aloo", "Jeera Pulao", "Steamed Rice", "Bagara Dal (Mix Veg)", "Masala Sambar", "Pepper Rasam", "Usili", "Lauki Subji", "Pickle", "Fryums", "Butter Milk", "Millet Kanji"],
      snacks: ["Boiled Peanut / Black Channa Sundal", "Tea / Coffee"],
      dinner: ["Chappathi", "Aloo Channa Khurma", "Paratha", "Manchurian Gravy / Crispy Vegetable", "Fried Rice / Noodles", "Steamed Rice", "Dal Fry", "Rasam", "Pickle", "Fryums", "Veg-Salad", "Milk", "Spl Fruits", "Millet Kanji", "***Chicken Gravy***"],
    },
    Wednesday: {
      breakfast: ["Bread", "Butter", "Jam", "Millet Dosa", "Idly Podi", "Arachivitta Sambar", "Chutney", "Butter Chappathi", "Aloo Rajma Masala (Kanji)", "Tea / Coffee / Milk", "Banana"],
      lunch: ["Chappathi", "Soya Kasa", "Sultani Pulao", "Steamed Rice", "Mysore Dal Fry", "Kadi Pakoda", "Garlic Rasam", "Aloo Pariyal / Aloo Fry", "Yam Mochai Roast", "Pickle", "Fryums", "Butter Milk", "Millet Kanji"],
      snacks: ["Veg Puff / Sweet Bun", "Tea / Coffee"],
      dinner: ["Chappathi", "Chicken Masala / Panneer Butter Masala", "Steamed Rice", "Dal Tadka", "Rasam", "Pickle", "Fryums", "Veg Salad", "Milk", "Banana", "***Chicken Gravy***"],
    },
    Thursday: {
      breakfast: ["Bread", "Butter", "Jam", "Set Dosa", "Coconut Chutney", "Chappathi", "Karamani Makkan Wala", "Veg Semiya Khichadi", "Tea / Coffee / Milk", "Boiled Egg", "Banana", "Herbal Kanji"],
      lunch: ["Poori", "Ghee Veg Paneer", "Aloo Palak", "Paneer Tadka", "Steamed Rice", "Drumstick Sambar", "Pineapple Rasam", "Kadai Vegetables", "Beetroot Poriyal", "Pickle", "Fryums", "Butter Milk", "Millet Kanji"],
      snacks: ["Pani Poori / Mixture", "Tea / Coffee"],
      dinner: ["Chappathi", "Raima Panneer", "Ghee Pulao / Kaju Pulao", "Steamed Rice", "Chole Dal Fry", "Rasam", "Aloo Peanut Masala", "Pickle", "Fryums", "Veg Salad", "Milk", "Ice Cream", "***Chicken Gravy***"],
    },
    Friday: {
      breakfast: ["Bread", "Butter", "Jam", "Set Dosa", "Idly Podi", "Vada Curry", "Ghee Chappathi", "Tomato Dal", "Tea / Coffee / Milk", "Boiled Egg", "Herbal Kanji"],
      lunch: ["Spl Dry Jamun / Bread Halwa", "Veg Biryani", "Mix Raitha", "Bisibelebath", "Curd Rice", "Steamed Rice", "Moongdal Tadka", "Tomato Rasam", "Gobi-65", "Pickle", "Potato Chips", "Millet Kanji"],
      snacks: ["Bonda / Sambar/Vada", "Chutney", "Tea / Coffee"],
      dinner: ["Chole Bhatura", "Veg Upma", "Idly Podi", "Chutney", "Tiffen Sambar", "Steamed Rice", "Tomato Dal", "Rasam", "Pickle", "Fryums", "Veg Salad", "Milk", "Special Fruit", "***Fish Gravy***"],
    },
    Saturday: {
      breakfast: ["Bread", "Butter", "Jam", "Chappathi", "Veg Khurma", "Kasa", "Idiyappam (Lemon / Masala / Coconut Milk)", "Coconut Chutney", "Tea / Coffee / Milk", "Boiled Egg", "Herbal Kanji"],
      lunch: ["Butter Roti", "Paneer / Double Beans Masala", "Briyani", "Veg Pulao", "Steamed Rice", "Dal Makhni", "Pappu Charu", "Jeera Rasam", "Kootu", "Pickle", "Fryums", "Butter Milk", "Millet Kanji"],
      snacks: ["Cake / Brownie", "Tea / Coffee"],
      dinner: ["Sweet", "Punjabi Paratha", "Rajma Makan wala", "Idly", "Idly Podi", "Chutney", "Tiffen Sambar", "Steamed Rice", "Rasam", "French Fry", "Pickle", "Fryums", "Veg Salad", "Milk", "Special Fruit", "***Fish Gravy***"],
    },
    Sunday: {
      breakfast: ["Bread", "Butter", "Jam", "Chole Poori", "Veg Upma", "Coconut Chutney", "Tea / Coffee / Milk", "Herbal Kanji"],
      lunch: ["Chappathi", "Chicken (Pepper / Kadai)", "Panneer Butter Masala / Kadai Paneer", "Mint Pulao", "Steamed Rice", "Dal Dhadka", "Garlic Rasam", "Poriyal", "Pickle", "Fryums", "Butter Milk", "Millet Kanji", "***Chicken Gravy***"],
      snacks: ["Corn / Bajji Chutney / Juice", "Tea / Coffee"],
      dinner: ["Variety Stuffing Paratha", "Curd", "Steamed Rice", "Moong Dal Tadka", "Kathiramba Sambar", "Rasam", "Poriyal", "Pickle", "Fryums", "Veg Salad", "Milk", "Ice Cream", "Millet Kanji", "***Chicken Gravy***"],
    },
  },
  "M-Block": {
    Monday: {
      breakfast: ["Bread", "Butter", "Jam", "Pongal", "Sambar", "Coconut Chutney", "Chappathi", "Soya Aloo", "Tea / Coffee / Milk", "Boiled Egg", "Banana"],
      lunch: ["Payasam", "Methi Chappathi", "Black Channa Masala", "Jeera Pulao", "Steamed Rice", "Yellow Dal", "Arachivitta Sambar", "Rasam", "Keerai Kootu", "Pickle", "Fryums", "Buttermilk"],
      snacks: ["Samosa / Veg Roll", "Tea / Coffee / Lemon Juice / Milk", "Bread", "Butter", "Jam"],
      dinner: ["Idli", "Sambar", "Chutney", "Idli Podi", "Oil", "Chappathi", "Tomato Dal", "Steamed Rice", "Rasam", "Pickle", "Salad", "Buttermilk", "Milk", "Fish Gravy (Flavored Gravy)"],
    },
    Tuesday: {
      breakfast: ["Bread", "Butter", "Jam", "Aloo Mava Paratha / Vegetable Paratha", "Curd", "Chutney", "Upma", "Tea / Coffee / Milk", "Banana"],
      lunch: ["Chappathi", "Rajma Masala", "Jeera Pulao", "Steamed Rice", "Yellow Dal", "Arachivitta Sambar", "Rasam", "Beetroot Poriyal", "Cabbage Kootu", "Pickle", "Fryums", "Buttermilk", "Payasam"],
      snacks: ["Pani Puri / Pav Bhaji", "Tea / Coffee / Milk", "Bread", "Butter", "Jam"],
      dinner: ["Kal Dosa", "Sambar", "Chutney", "Millet Chappathi", "Dal Fry", "Steamed Rice", "Rasam", "Idli Podi", "Oil", "Pickle", "Salad", "Buttermilk", "Milk", "Mutton Kulambu (Flavored Gravy) / Chicken Gravy (Flavored Gravy)"],
    },
    Wednesday: {
      breakfast: ["Bread", "Butter", "Jam", "Idiyappam", "Veg Curry / Veg Stew", "Poha", "Mint Chutney", "Tea / Coffee / Milk", "Banana"],
      lunch: ["Chappathi", "Paneer Butter Masala / Kadai Paneer", "Variety Rice", "Curd Rice", "Steamed Rice", "Dal Fry", "Mirchi Kara Curry", "Rasam", "Stirred Rice", "Pickle", "Appalam"],
      snacks: ["Cream Bun / Brownie / Cookies", "Tea / Coffee / Milk", "Masala Tea", "Bread", "Butter", "Jam"],
      dinner: ["Chappathi", "Paneer Butter Masala", "Steamed Rice", "Sambar", "Jeera Rasam", "Pickle", "Buttermilk", "Milk", "Chicken Gravy (Flavored Gravy) / Chicken Biryani"],
    },
    Thursday: {
      breakfast: ["Bread", "Butter", "Jam", "Idli", "Groundnut Chutney", "Sambar", "Chappathi", "White Peas Masala", "Tea / Coffee / Milk", "Banana"],
      lunch: ["Sweet Pongal / Boondhi", "Chappathi", "White Channa Masala", "Veg Pulao", "Steamed Rice", "Green Rice", "Dal Fry", "Vegetable Kootu", "Rasam", "Pickle", "Fryums", "Buttermilk", "Kesari / Semia"],
      snacks: ["Navadhaniyam Channa / Sundal", "Tea / Coffee / Ginger Tea / Milk", "Bread", "Butter", "Jam"],
      dinner: ["Uthappam", "Sambar", "Chutney", "Chhole Poori", "Steamed Rice", "Dal Makhni", "Rasam", "Pickle", "Salad", "Buttermilk", "Milk", "Cup Ice Cream", "Mutton Kulambu (Flavored Gravy)"],
    },
    Friday: {
      breakfast: ["Bread", "Butter", "Jam", "Kal Dosa", "Sambar", "Onion / Tomato Chutney", "Chappathi", "Tea / Coffee / Milk", "Omelette", "Banana", "Idli Podi", "Oil"],
      lunch: ["Chappathi", "Dal Tadka", "Peas Pulao", "Curd Rice", "Steamed Rice", "Sambar", "Mix Veg Poriyal", "Rasam", "Pickle", "Fryums", "Buttermilk"],
      snacks: ["Bajji / Chutney / Murukku", "Tea / Coffee / Rose Milk / Badam Milk", "Bread", "Butter", "Jam"],
      dinner: ["Soup", "Chappathi", "Veg Manchurian Gravy", "Fried Rice / Noodles", "Pista (White) / Tomato (Red) Veg", "Steamed Rice", "Dal Fry", "Rasam", "Pickle", "Salad", "Buttermilk", "Milk", "Chicken Gravy (Flavored Gravy)"],
    },
    Saturday: {
      breakfast: ["Bread", "Butter", "Jam", "Idli", "Sambar", "Groundnut Chutney", "Masala Dosa / Paratha", "Tea / Coffee / Milk", "Boiled Egg", "Banana"],
      lunch: ["Chappathi", "Meal Maker Curry", "Veg Biryani", "Raitha", "Curd Rice", "Steamed Rice", "Rasam", "Keerai Kootu", "Chilli Rice", "Pickle", "Fryums", "Gulab Jamun / Kheer / Semia"],
      snacks: ["Cake Variety / Rusk", "Tea / Coffee / Milk", "Masala Tea", "Bread", "Butter", "Jam"],
      dinner: ["Uthappam", "Sambar", "Chutney", "Paratha", "Veg Salna", "Steamed Rice", "Rasam", "Idli Podi", "Oil", "Pickle", "Salad", "Buttermilk", "Milk", "Chicken Gravy (Flavored Gravy)"],
    },
    Sunday: {
      breakfast: ["Bread", "Butter", "Jam", "Chole Bhature", "Chenna Masala", "Rava Upma", "Coconut Chutney", "Sambar", "Tea / Coffee / Milk", "Banana"],
      lunch: ["Chappathi", "Paneer Mutter Masala", "Steamed Rice", "Sambar", "Garlic Rasam", "Poriyal", "Pickle", "Fryums", "Buttermilk"],
      snacks: ["Channa Sundal (White) / Black", "Tea / Coffee / Milk", "Ginger Tea", "Bread", "Butter", "Jam"],
      dinner: ["Chappathi", "Mix Veg Curry", "Dal Fry", "Steamed Rice", "Kadamba Sambar", "Rasam", "Poriyal", "Pickle", "Salad", "Buttermilk", "Milk", "Cone Ice Cream", "Chicken Gravy (Flavored Gravy)"],
    },
  },
  "NRI": {
    Monday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Veg Upma", "Sambar", "Coconut Chutney", "Coffee", "Milk"],
      lunch: ["Chapathi", "Subzi Kurchan", "Egg Masala", "Urulai Pattani Masala", "Steam Rice", "Brinjal Drumstick Sambar", "Rasam", "Curd", "Tamarind Rice", "Vadams", "Paneer Fried Rice", "Veg Ball Manchurian"],
      snacks: ["Muffins or Fruit/Banana Cake", "Bread Butter Jam", "Cucumber", "Tomato Slice", "Tea", "Milk"],
      dinner: ["Aloo Chat", "Chapathi", "Rajma Masala", "Veg Kaliya", "Steam Rice", "Sambar", "Rasam", "Thanjavur Fried Rice", "Chicken Chettinad", "Dosa", "Kara Chutney", "Fresh Fruit"],
    },
    Tuesday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Aloo Paratha", "Curd", "Pickle", "Coffee", "Milk"],
      lunch: ["Poori", "Ghugni Mutter", "Dum Aloo Banarasi", "Beet Root Poriyal", "Morkuzhambu", "Steam Rice", "Rasam", "Singapore Noodle", "Chilly Garlic Cauliflower", "Curd", "Vadam"],
      snacks: ["Veg Samosa", "Bread Butter Jam", "Tea", "Milk"],
      dinner: ["Green Salad", "Chapathi", "Paneer Mutter", "Shangai Chilly Cauliflower", "Dal", "Veg Pulao", "Idly", "Pudhina Chutney", "Steam Rice", "Sambar", "Rasam", "Ice Cream"],
    },
    Wednesday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Set Dosa", "Vada Curry", "Sambar", "Coconut Chutney", "Coffee", "Milk"],
      lunch: ["Poori", "Meloni Subzi", "Chat Pat Chole", "Sambar", "Cabbage Thovaran", "Tomato Rasam", "Lemon Rice", "Steam Rice", "Curd", "Corn Fried Rice", "Stir Fried Chilly Paneer", "South Indian Payasam or Sweet", "Vadam"],
      snacks: ["Aloo Bonda with Coconut Chutney", "Bread Butter Jam", "Cucumber", "Tomato Slice", "Tea", "Milk"],
      dinner: ["Tossed Salad", "Chapathi", "Dum Ka Khim Mutter", "Hara Moong Dal", "Steam Rice", "Rasam", "Dragon Chicken", "Shangai Fried Rice", "Fresh Fruit"],
    },
    Thursday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Ajwin Poori", "Aloo Masala", "Coffee", "Milk"],
      lunch: ["Chapathi", "Aloo Gobi Shimla Mirchi", "Dal Maharani", "Keerai Masiyal", "Karakuzhambu", "Curd", "Peanut Butter Noodle", "Three King Vegetables", "Vadam"],
      snacks: ["Veg Puffs", "Bread Butter Jam", "Tea", "Milk"],
      dinner: ["Green Salad", "Chapathi", "Egg Masala", "Dal Makhani", "Steam Rice", "Rasam", "Jeera Pulao", "Chilly Potato", "Idly Sambar", "Chutney", "Fresh Fruit"],
    },
    Friday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Pongal", "Medu Vada", "Sambar", "Chutney", "Coffee", "Milk"],
      lunch: ["Chapathi", "Kadi Pakodi", "Makmali Subzi", "Tomato Rice", "Urulai Podimas", "Curd", "Vadam", "Dhaba Style Fried Rice", "Chilly Raw Banana", "Rava Kasari or Spl Kasari"],
      snacks: ["Masala Vada with Coconut Chutney", "Bread Butter Jam", "Cucumber", "Tomato Slice", "Tea", "Milk"],
      dinner: ["Kutchumber Salad", "Tava Paratha", "Murgh Rogan Josh or Butter Chicken Masala", "Paneer Butter Masala", "Jeera Dal", "Steam Rice", "Rasam", "Three Pepper Fried Rice", "Fresh Fruits", "Ice Cream"],
    },
    Saturday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Masala Poha", "Medu Vada", "Sambar", "Coconut Chutney", "Coffee", "Milk"],
      lunch: ["Poori", "Channa Masala", "Aloo Singh Poosthu", "Snack Gourd Poriyal", "South Indian Dal", "Rasam", "Steam Rice", "Curd", "Vadam", "Shangai Noodle", "Assorted Veg in Szechwan Sauce"],
      snacks: ["South Indian Snacks", "Bread Butter Jam", "Tea", "Milk"],
      dinner: ["Green Salad", "Chapathi", "Thalippu Dosa", "Sambhar", "Chutney", "Aloo Mutter Dal Panchaarangi", "Steam Rice", "Pepper Rasam", "Schezwan Potato", "Mutter Pulao", "Fresh Fruits"],
    },
    Sunday: {
      breakfast: ["One seasonal fruit", "Cornflakes with hot milk", "Toast", "Butter Jam", "Egg preparation", "Idly", "Medu Vada", "Sambar", "Chutney", "Coffee", "Milk"],
      lunch: ["Chapathi", "Mix Veg Poriyal", "Steam Rice", "Avaraka Sambar", "Rasam", "Subzi Malai Kofta", "Subzi Saagwala", "Vadam", "Curd", "Ice Cream", "South Indian Fish Curry"],
      snacks: ["Bread Bhaji", "Bread Butter Jam", "Tea", "Milk"],
      dinner: ["Tossed Salad", "Chicken Biryani", "Mushroom and Veg Biryani", "Raita", "Mirchi Ka Salan", "Fresh Fruit", "Steam Rice", "Rasam", "Banana"],
    },
  },
} as const
