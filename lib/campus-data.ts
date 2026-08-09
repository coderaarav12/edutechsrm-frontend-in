export type BuildingCategory =
  | "academic"
  | "facilities"
  | "accommodation"
  | "transport"
  | "food"
  | "sports"
  | "landmarks"
  | "services"

export interface Building {
  id: number
  icon: string
  name: string
  shortDesc: string
  longDesc: string
  category: BuildingCategory
  lat: number
  lng: number
}

export const CATEGORY_ORDER: BuildingCategory[] = ["academic", "facilities", "accommodation", "transport", "food", "sports", "landmarks", "services"]

export const CATEGORY_META: Record<BuildingCategory, { label: string; color: string }> = {
  academic: { label: "Academic Blocks", color: "#34d399" },
  facilities: { label: "Facilities", color: "#38bdf8" },
  accommodation: { label: "Hostels", color: "#a78bfa" },
  transport: { label: "Transport", color: "#fb923c" },
  food: { label: "Food & Cafés", color: "#f472b6" },
  sports: { label: "Sports & Outdoors", color: "#fbbf24" },
  landmarks: { label: "Landmarks & Worship", color: "#a3e635" },
  services: { label: "Banks & Pharmacy", color: "#f87171" },
}

// Verified coordinates from OpenStreetMap (2025) — comprehensive campus mapping
// Campus center: 12.8240, 80.0444
// Potheri Railway Station (POTI): 12.8220, 80.0385
export const BUILDINGS: Building[] = [
  // Academic Blocks
  { id: 1, icon: "🏛️", name: "University Building (UB Block)", shortDesc: "15-storey central tower", longDesc: "The tallest building on campus at 15 storeys. Houses the Central Library (1.5L sq ft), administrative offices, university management, examination wing, and multiple lecture halls across its floors.", category: "academic", lat: 12.8233083, lng: 80.0424496 },
  { id: 2, icon: "💻", name: "Tech Park (TP1)", shortDesc: "15-storey twin tower", longDesc: "First of the Tech Park Twin Towers — a 15-storey technology hub with state-of-the-art computer labs, AI & ML research labs, incubation centre for startups, and dedicated IT-enabled learning floors.", category: "academic", lat: 12.82464806, lng: 80.045329973 },
  { id: 3, icon: "💻", name: "Tech Park (TP2)", shortDesc: "15-storey twin tower", longDesc: "Second of the Tech Park Twin Towers adjoining TP1. Houses additional research labs, clean rooms, smart classrooms, and collaborative innovation spaces for industry partnerships.", category: "academic", lat: 12.82474118, lng: 80.04584598 },
  { id: 4, icon: "🔬", name: "High Tech Block", shortDesc: "Engineering labs & research", longDesc: "Houses sophisticated engineering laboratories, nanotechnology research center, advanced materials science labs, and collaborative research spaces for postgraduate scholars.", category: "academic", lat: 12.821037078, lng: 80.038873433 },
  { id: 5, icon: "🖥️", name: "Main Block", shortDesc: "Central admin & lecture halls", longDesc: "Central administrative and academic building housing registrar, examination wing, and large-capacity lecture halls for common courses and major lectures.", category: "academic", lat: 12.820300614, lng: 80.038988014 },
  { id: 6, icon: "⚡", name: "Electrical Sciences Block", shortDesc: "EEE/ECE departments", longDesc: "Home to the Electrical & Electronics Engineering (EEE) and Electronics & Communication Engineering (ECE) departments. Features electronics labs, circuit design studios, and VLSI design centers.", category: "academic", lat: 12.819943733, lng: 80.03908885 },
  { id: 7, icon: "🔧", name: "Mechanical Block", shortDesc: "Workshops & labs", longDesc: "Houses mechanical engineering workshops, CAD/CAM labs, thermodynamics labs, fluid mechanics labs, and a full-fledged production shop floor.", category: "academic", lat: 12.820863560, lng: 80.039716700 },
  { id: 8, icon: "🏗️", name: "Aerospace Block", shortDesc: "Aerospace engineering", longDesc: "Houses the Aerospace Engineering department with wind tunnel facilities, propulsion labs, aircraft structural testing rigs, and simulator rooms for aeronautical studies.", category: "academic", lat: 12.820224, lng: 80.04012412 },
  { id: 9, icon: "🧬", name: "Bio-Tech Block", shortDesc: "Biotechnology & genetic eng.", longDesc: "State-of-the-art biotechnology labs, genetic engineering research facilities, bioinformatics center, tissue culture rooms, and advanced molecular biology instrumentation.", category: "academic", lat: 12.824926156, lng: 80.043958678 },
  { id: 10, icon: "📊", name: "MBA Block", shortDesc: "School of Management", longDesc: "The SRM School of Management building featuring case-study classrooms, a business library, computer lab with financial software, seminar halls, and placement cell.", category: "academic", lat: 12.823636383, lng: 80.04406165 },
  { id: 11, icon: "🏗️", name: "Architecture Block", shortDesc: "Architecture & design labs", longDesc: "Dedicated block for the Department of Architecture with design studios, CAD labs, material testing labs, and drafting facilities.", category: "academic", lat: 12.82424512, lng: 80.04394846 },
  { id: 12, icon: "🎓", name: "C V Raman Block", shortDesc: "Science & engineering labs", longDesc: "Advanced science and engineering research block with state-of-the-art laboratory facilities for physics, chemistry, and interdisciplinary research projects.", category: "academic", lat: 12.82544028, lng: 80.04430042 },

  // Facilities
  { id: 13, icon: "🎭", name: "Dr. T.P. Ganesan Auditorium", shortDesc: "3,100 seat multipurpose venue", longDesc: "One of the largest university auditoriums in India with 3,100 seats. Hosts cultural events, conferences, guest lectures, film festivals, and the annual SRM cultural fest.", category: "facilities", lat: 12.824652193, lng: 80.046600700 },
  { id: 14, icon: "📚", name: "Central Library", shortDesc: "1.5L sq ft knowledge hub", longDesc: "The Central Library spans 1,50,000 sq ft with a collection of over 1.5 lakh books, 10,000+ e-journals, digital resource center, reading halls, and a Braille section.", category: "facilities", lat: 12.8232845, lng: 80.0425857 },
  { id: 15, icon: "🏥", name: "SRM Medical College Hospital", shortDesc: "1,200 bed super specialty", longDesc: "A 1,200-bed multi-super specialty hospital providing healthcare to students, staff, and the public. Features emergency services, outpatient clinics, diagnostic imaging, and specialized departments.", category: "facilities", lat: 12.823506, lng: 80.047803 },
  { id: 16, icon: "🏨", name: "SRM Hotel", shortDesc: "3-star campus hotel", longDesc: "A 3-star hotel on campus serving visiting faculty, parents, and guests. Amenities include a swimming pool, restaurant, conference rooms, and comfortable accommodation.", category: "facilities", lat: 12.8237973, lng: 80.0416258 },
  { id: 17, icon: "🍽️", name: "Canteen", shortDesc: "Multi-cuisine food courts", longDesc: "Main canteen building with multiple food courts offering North Indian, South Indian, Chinese, and fast food options. Separate mess facilities for hostel residents.", category: "facilities", lat: 12.82331468, lng: 80.04444996 },
  { id: 18, icon: "🕌", name: "Temple", shortDesc: "Prayer & meditation space", longDesc: "Campus temple and prayer hall reflecting the spiritual ethos of SRM. Serves as a peaceful space for meditation and religious activities for all community members.", category: "facilities", lat: 12.823187660, lng: 80.0429429 },

  // Boys Hostels
  { id: 19, icon: "🏠", name: "Paari Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Boys hostel with single, double, and triple occupancy rooms. Equipped with Wi-Fi, 24/7 security, mess, laundry services, and recreational facilities.", category: "accommodation", lat: 12.8225308, lng: 80.0435961 },
  { id: 20, icon: "🏠", name: "Kaari Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Boys hostel with modern amenities, spacious rooms, common recreation areas, dedicated study spaces, and round-the-clock security.", category: "accommodation", lat: 12.8221717, lng: 80.0435951 },
  { id: 21, icon: "🏠", name: "Oori Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Boys hostel offering comfortable residential facilities with Wi-Fi, mess services, laundry, sports facilities, and regular maintenance.", category: "accommodation", lat: 12.8218209, lng: 80.0436927 },
  { id: 22, icon: "🏠", name: "Adhiyaman Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Boys hostel with well-maintained facilities including attached mess, laundry, security, and recreational activities for residents.", category: "accommodation", lat: 12.821426680, lng: 80.043637660 },
  { id: 23, icon: "🏠", name: "Nelson Mandela Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Modern boys hostel named after the iconic leader, featuring contemporary rooms, common study areas, and comprehensive amenities.", category: "accommodation", lat: 12.821024256, lng: 80.0436765 },
  { id: 24, icon: "🏠", name: "Manoranjitham Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Boys hostel providing comfortable living spaces with modern facilities, mess services, and a supportive residential community.", category: "accommodation", lat: 12.820431133, lng: 80.043987117 },
  { id: 25, icon: "🏠", name: "Agasthiyar Hostel (Boys)", shortDesc: "Boys accommodation", longDesc: "Named after the ancient Tamil sage, this boys hostel offers quality accommodation with comprehensive campus living facilities.", category: "accommodation", lat: 12.820679256, lng: 80.0436264 },
  { id: 26, icon: "🏠", name: "D-Block Mens Hostel", shortDesc: "Boys accommodation", longDesc: "Modern boys hostel with spacious rooms, excellent facilities, proximity to academic blocks, and dedicated support services.", category: "accommodation", lat: 12.821943880, lng: 80.049217360 },
  { id: 27, icon: "🏠", name: "N Block Mens Hostel", shortDesc: "Boys accommodation", longDesc: "Well-equipped boys hostel offering comfortable living with proximity to campus facilities and strong community support.", category: "accommodation", lat: 12.8207445, lng: 80.0465476 },

  // Girls Hostels
  { id: 28, icon: "🏠", name: "M Block Girls Hostel", shortDesc: "Girls accommodation", longDesc: "Modern girls hostel with comfortable rooms, dedicated study areas, mess facilities, 24/7 security, and recreational amenities.", category: "accommodation", lat: 12.8206515, lng: 80.0459960 },
  { id: 29, icon: "🏠", name: "M Block (Kopperundevi)", shortDesc: "Girls accommodation", longDesc: "Girls hostel block with well-maintained facilities, dedicated support services, and a secure living environment.", category: "accommodation", lat: 12.8208628, lng: 80.0455475 },
  { id: 30, icon: "🏠", name: "Kalpana Chawla Hostel (Girls)", shortDesc: "Girls accommodation", longDesc: "Named after the renowned astronaut, this girls hostel inspires excellence with modern facilities and supportive environment.", category: "accommodation", lat: 12.820405020, lng: 80.0453550 },
  { id: 31, icon: "🏠", name: "Meenakshi Hostel Block (Girls)", shortDesc: "Girls accommodation", longDesc: "Girls hostel offering spacious rooms, modern amenities, mess services, laundry, and a vibrant residential community.", category: "accommodation", lat: 12.8223185, lng: 80.0423595 },
  { id: 32, icon: "🏠", name: "Sannasi C Block (Girls)", shortDesc: "Girls accommodation", longDesc: "Girls hostel with comfortable living spaces, comprehensive facilities, and strong community engagement programs.", category: "accommodation", lat: 12.8219571, lng: 80.0441753 },

  // Facilities (continued)
  { id: 33, icon: "⚽", name: "Sports Complex", shortDesc: "Athletics & indoor sports", longDesc: "Extensive sports facilities including cricket and football grounds, basketball and tennis courts, an indoor badminton hall, table tennis rooms, gymnasium, and swimming pool.", category: "facilities", lat: 12.8248, lng: 80.0455 },
  { id: 34, icon: "🚌", name: "Transport Office", shortDesc: "Bus & shuttle booking", longDesc: "The campus transport office handles bus pass issuance, SRM shuttle booking, and transport queries for daily commuters. Located near the main gate bus bay.", category: "transport", lat: 12.8209, lng: 80.0392 },
  { id: 35, icon: "🚉", name: "Potheri Railway Station Gate", shortDesc: "Railway access point", longDesc: "A dedicated gate providing direct walkable access to Potheri Railway Station. Primary railway access for students commuting to/from Chennai and surrounding areas.", category: "transport", lat: 12.8220075, lng: 80.0384608 },

  // Academic (new)
  { id: 36, icon: "🧪", name: "Innovation & Incubation Center", shortDesc: "Startup & research hub", longDesc: "Dedicated center supporting student startups, industry incubation, and applied research with maker labs, mentorship spaces, and funding guidance.", category: "academic", lat: 12.823635, lng: 80.043586 },
  { id: 37, icon: "⚙️", name: "Mechanical PG Block", shortDesc: "PG engineering labs", longDesc: "Postgraduate block for mechanical engineering with advanced research labs, simulation studios, and seminar rooms for M.Tech and PhD scholars.", category: "academic", lat: 12.820911, lng: 80.039332 },
  { id: 38, icon: "🏭", name: "Mechanical Hanger", shortDesc: "Aircraft & vehicle hangar", longDesc: "Large workshop hangar used for automotive and heavy machinery practicals, chassis work, and vehicle assembly projects.", category: "academic", lat: 12.820488, lng: 80.040316 },
  { id: 39, icon: "⚖️", name: "SRM School of Law", shortDesc: "New law school (2025)", longDesc: "Newly established law school with moot courts, a legal resource library, and modern lecture halls for the BA-LLB and BBA-LLB programs.", category: "academic", lat: 12.8230, lng: 80.0438 },

  // Facilities (new)
  { id: 40, icon: "🛠️", name: "Maintenance Department", shortDesc: "Campus upkeep office", longDesc: "Central department managing campus infrastructure upkeep, civil works, electrical maintenance, and repairs across all blocks.", category: "facilities", lat: 12.820847, lng: 80.049206 },
  { id: 41, icon: "📮", name: "Post Office", shortDesc: "Mail & courier services", longDesc: "Campus post office handling mail, parcels, and courier services for students and staff.", category: "facilities", lat: 12.8240, lng: 80.0430 },
  { id: 42, icon: "🛏️", name: "SRM Guest House", shortDesc: "Faculty & visitor stay", longDesc: "Guest house accommodation for visiting faculty, parents, and campus guests with dining and Wi-Fi facilities.", category: "facilities", lat: 12.8237, lng: 80.0450 },

  // Food & Cafés
  { id: 43, icon: "🍜", name: "Java Green Food Court", shortDesc: "20-stall food hub", longDesc: "The campus food hub near the Clock Tower with roughly 20 stalls — Shawarma, Subway, Emo Restaurant (Shop 8), North Indian, South Indian and fast-food counters. The go-to spot between classes.", category: "food", lat: 12.8236, lng: 80.0440 },
  { id: 44, icon: "🥤", name: "Amul Canteen (UB, 6th Floor)", shortDesc: "UB rooftop canteen", longDesc: "Amul kiosk and canteen on the 6th floor of the University Building with milkshakes, snacks, and quick bites overlooking the campus.", category: "food", lat: 12.8237, lng: 80.0453 },
  { id: 45, icon: "🍱", name: "SRMIST Canteen – Tech Park", shortDesc: "650-seat canteen", longDesc: "Large multi-cuisine canteen on the Tech Park ground floor seating 650 people. Popular for lunch between blocks at TP1/TP2.", category: "food", lat: 12.8243, lng: 80.0460 },
  { id: 46, icon: "☕", name: "Vendhar Square Café", shortDesc: "Café in Vendhar Square", longDesc: "Café inside Vendhar Square, a newer commercial block on campus serving coffee, pastries, and light meals.", category: "food", lat: 12.823756, lng: 80.045633 },
  { id: 47, icon: "🍔", name: "Sunny Days Food Court", shortDesc: "Snacks, softy & hot dogs", longDesc: "Student favorite for softy ice cream, Oreo Blast, hot dogs, burgers, and pastas near the main academic walkway.", category: "food", lat: 12.8235, lng: 80.0435 },
  { id: 48, icon: "🍰", name: "Slice of Life Café", shortDesc: "Café by the medical college", longDesc: "Cozy café beside the medical college serving coffee, sandwiches, cakes, and quick bites — a popular study-and-hangout spot.", category: "food", lat: 12.8230, lng: 80.0405 },
  { id: 49, icon: "☕", name: "The Madras Café", shortDesc: "Hospital 1st floor café", longDesc: "Café on the 1st floor of the SRM hospital block offering affordable South Indian food, tea, and coffee for students and staff.", category: "food", lat: 12.8231, lng: 80.0406 },
  { id: 50, icon: "🍛", name: "Milan Restaurant", shortDesc: "Pure-veg restaurant", longDesc: "Pure-vegetarian South Indian restaurant on Dr. Radhakrishnan Road — one of the only pure-veg dine-ins near campus, loved by hostelers.", category: "food", lat: 12.8238, lng: 80.0430 },
  { id: 51, icon: "🧇", name: "Waffestry SRM", shortDesc: "Waffles & desserts", longDesc: "Trendy dessert café near Potheri known for waffles, milkshakes, and Insta-worthy bakes — a weekend hangout for students.", category: "food", lat: 12.8235, lng: 80.0410 },
  { id: 52, icon: "🍲", name: "Sannasi Hostel Mess", shortDesc: "Hostel mess", longDesc: "Mess serving the Sannasi hostel blocks with daily South Indian thali meals, snacks, and late-evening refreshments.", category: "food", lat: 12.821390, lng: 80.044534 },
  { id: 53, icon: "☕", name: "Tea Stall", shortDesc: "Quick chai & snacks", longDesc: "Popular roadside tea stall near the academic blocks serving chai, filter coffee, and quick evening snacks.", category: "food", lat: 12.819931, lng: 80.041467 },
  { id: 54, icon: "🌙", name: "Medical Canteen", shortDesc: "Open late near hospital", longDesc: "Canteen near the hospital that stays open late, a lifeline for night owls with light meals, tea, and snacks.", category: "food", lat: 12.8235, lng: 80.0478 },
  { id: 55, icon: "🍵", name: "Chai Kings Potheri", shortDesc: "Tea café chain", longDesc: "Chai Kings outlet in Potheri serving their famous tea range, momos, and street-style snacks off campus.", category: "food", lat: 12.8225, lng: 80.0385 },
  { id: 56, icon: "🥭", name: "Punjabi Lassi & Juices", shortDesc: "Lassi & fresh juices", longDesc: "Small juice bar famous for thick Punjabi lassi and fresh fruit juices on Bajanai Kovil Street — a cheap post-class refreshment.", category: "food", lat: 12.81927, lng: 80.03665 },
  { id: 57, icon: "🍗", name: "KFC Thailavaram", shortDesc: "Fried chicken outlet", longDesc: "KFC near the Thailavaram junction (~1.2 km from campus) — the nearest global fast-food chain for students.", category: "food", lat: 12.8300, lng: 80.0340 },
  { id: 58, icon: "🍽️", name: "V Five Hotel", shortDesc: "Multi-cuisine dining", longDesc: "Hotel and restaurant near campus serving multi-cuisine buffets and a la carte — a favorite for birthday and farewell dinners.", category: "food", lat: 12.8290, lng: 80.0430 },

  // Sports & Outdoors
  { id: 59, icon: "🏊", name: "Dr. T.R. Paarivendhar Aquatic Complex", shortDesc: "Olympic-size pool", longDesc: "International-standard 50m aquatic complex with competitive pools for swimming events and training, including an underwater viewing area.", category: "sports", lat: 12.8243, lng: 80.0460 },
  { id: 60, icon: "🏟️", name: "A.G. Milkha Singh Stadium", shortDesc: "Multi-sport stadium", longDesc: "Named after the sprint legend, this stadium hosts athletics, football, and major campus sports events and fests.", category: "sports", lat: 12.8250, lng: 80.0460 },
  { id: 61, icon: "🏸", name: "Indoor Stadium", shortDesc: "Badminton, TT & basketball", longDesc: "A/C indoor hall for badminton, table tennis, and indoor basketball with spectator seating for inter-department tournaments.", category: "sports", lat: 12.8245, lng: 80.0460 },
  { id: 62, icon: "🎾", name: "Floodlit Tennis Courts", shortDesc: "Night-lit tennis courts", longDesc: "Multiple hard tennis courts with floodlights for evening practice and competitions.", category: "sports", lat: 12.8247, lng: 80.0416 },
  { id: 63, icon: "🏀", name: "Basketball Courts", shortDesc: "Outdoor hoops", longDesc: "Outdoor basketball courts near the sports zone, active all day with student leagues and pickup games.", category: "sports", lat: 12.8249, lng: 80.0423 },
  { id: 64, icon: "🏞️", name: "SRM Lake", shortDesc: "Scenic photo spot", longDesc: "The campus lake with walking paths and seating — a calm evening spot and one of the most photographed places on campus.", category: "sports", lat: 12.8228, lng: 80.0401 },
  { id: 65, icon: "🏋️", name: "Central Gym", shortDesc: "Campus gymnasium", longDesc: "Fully equipped gymnasium with cardio, strength, and free-weights zones for students and staff.", category: "sports", lat: 12.8240, lng: 80.0430 },
  { id: 66, icon: "🏋️", name: "Barzell Gym Potheri", shortDesc: "Popular off-campus gym", longDesc: "Highly recommended student gym in Potheri (barzell.co.in) with modern equipment, group classes, and affordable memberships.", category: "sports", lat: 12.8218, lng: 80.0375 },

  // Landmarks & Worship
  { id: 67, icon: "🏛️", name: "Vendhar Museum", shortDesc: "Modern art museum", longDesc: "Vendhar Museum, opened in October 2024, showcases contemporary art, sculptures, and curated exhibits — a must-visit cultural landmark on campus.", category: "landmarks", lat: 12.8235, lng: 80.0445 },
  { id: 68, icon: "🕰️", name: "Clock Tower", shortDesc: "Iconic campus landmark", longDesc: "The iconic Clock Tower at the center of campus — the classic meeting point, photo spot, and reference landmark for directions.", category: "landmarks", lat: 12.8235, lng: 80.0435 },
  { id: 69, icon: "🛕", name: "Shiva Temple", shortDesc: "Campus temple", longDesc: "Campus Shiva temple, a peaceful space for prayer and meditation for students and staff.", category: "landmarks", lat: 12.821280, lng: 80.044900 },
  { id: 70, icon: "🛕", name: "Ganesh Temple", shortDesc: "Campus temple", longDesc: "Dedicated Ganesh temple on the campus edge, frequently visited before exams and major events.", category: "landmarks", lat: 12.819110, lng: 80.040127 },
  { id: 71, icon: "🛕", name: "Sai Temple", shortDesc: "Campus temple", longDesc: "Sai Baba temple serving the campus community with daily aarti and a quiet prayer ambience.", category: "landmarks", lat: 12.825104, lng: 80.041624 },
  { id: 72, icon: "🕌", name: "Mosque & Church", shortDesc: "Places of worship", longDesc: "Campus mosque and church located together, supporting the spiritual needs of the diverse student community.", category: "landmarks", lat: 12.822733, lng: 80.043672 },

  // Banks & Pharmacy
  { id: 73, icon: "🏦", name: "Indian Bank Potheri", shortDesc: "Opposite the station", longDesc: "Indian Bank branch opposite Potheri station — convenient for account opening and cash withdrawals near the railway gate.", category: "services", lat: 12.8209, lng: 80.0370 },
  { id: 74, icon: "🏦", name: "HDFC Bank SRMIST Branch", shortDesc: "On-campus branch", longDesc: "HDFC Bank branch located on campus for account services, cash handling, and student banking needs.", category: "services", lat: 12.8235, lng: 80.0438 },
  { id: 75, icon: "🏦", name: "SBI Potheri", shortDesc: "State Bank branch", longDesc: "State Bank of India branch at Ram Complex, Potheri — commonly used for scholarship and fee accounts.", category: "services", lat: 12.8215, lng: 80.0375 },
  { id: 76, icon: "💊", name: "Apollo Pharmacy Potheri", shortDesc: "24/7 pharmacy", longDesc: "Apollo Pharmacy near the railway gate for medicines, first aid, and wellness products.", category: "services", lat: 12.8205, lng: 80.0365 },
  { id: 77, icon: "💊", name: "Sri Krishna Medicals", shortDesc: "Chemist & medical store", longDesc: "Pharmacy and medical store near the medical college area for prescription and OTC medicines.", category: "services", lat: 12.831221, lng: 80.046830 },
  { id: 78, icon: "🩸", name: "SRM Blood Bank", shortDesc: "Donation & storage", longDesc: "Hospital blood bank supporting emergency transfusions and student blood donation camps.", category: "services", lat: 12.823165, lng: 80.049120 },

  // Transport (new)
  { id: 79, icon: "🚉", name: "Potheri Railway Station", shortDesc: "POTI — EMU terminus", longDesc: "Potheri railway station (POTI) on the Chennai–Tambaram–Chengalpattu EMU line. The main boarding point for students commuting by local train.", category: "transport", lat: 12.820757, lng: 80.036874 },
  { id: 80, icon: "🚪", name: "Main Arch Gate", shortDesc: "Main campus entrance", longDesc: "The grand arch entrance to SRMIST on the Chennai–Trichy highway — the primary gate for pedestrians, buses, and vehicles.", category: "transport", lat: 12.8210, lng: 80.0385 },

  // Food & Cafés (research sweep 2)
  { id: 81, icon: "🍛", name: "Being Punjabi", shortDesc: "North Indian near back gate", longDesc: "Top-rated Punjabi North Indian eatery near the SRM back gate — popular for big portions and student prices.", category: "food", lat: 12.82049, lng: 80.04248 },
  { id: 82, icon: "🥞", name: "Shri Balaajee Bhavan", shortDesc: "Pure-veg South Indian", longDesc: "Large pure-vegetarian South Indian restaurant on Pillayar Koil St near GST Road — the classic veg dining spot.", category: "food", lat: 12.82854, lng: 80.04290 },
  { id: 83, icon: "🥘", name: "A2B Adyar Ananda Bhavan", shortDesc: "Veg chain — meals & sweets", longDesc: "A2B vegetarian chain near the Potheri signal serving full meals, sweets, and snacks.", category: "food", lat: 12.83304, lng: 80.04772 },
  { id: 84, icon: "🍲", name: "Agrawal Bhojnalaya", shortDesc: "Budget thali & chaat", longDesc: "Budget North Indian thali and chaat place near Potheri station — a cheap fill-up spot.", category: "food", lat: 12.81961, lng: 80.03694 },
  { id: 85, icon: "🥟", name: "SRM University Canteen (Gate 4)", shortDesc: "Gate 4 canteen", longDesc: "Canteen at the main Gate 4 entrance known for samosas, snacks, and fresh juices.", category: "food", lat: 12.82128, lng: 80.03815 },
  { id: 86, icon: "🌶️", name: "Godavari – Spice of Andhra", shortDesc: "Andhra biryani & cuisine", longDesc: "Andhra-style biryani and spicy Andhra cuisine in Potheri — a go-to for hostelers craving South Indian heat.", category: "food", lat: 12.81994, lng: 80.04061 },
  { id: 87, icon: "🌯", name: "Nawab's Choice", shortDesc: "Rolls & North Indian", longDesc: "Student-favourite rolls and North Indian food near the back gate.", category: "food", lat: 12.82092, lng: 80.04262 },
  { id: 88, icon: "🥙", name: "Al Sham", shortDesc: "Shawarma & Arabian grill", longDesc: "Shawarma and Arabian grill spot on Pillayar Koil Street, Potheri.", category: "food", lat: 12.82034, lng: 80.03737 },
  { id: 89, icon: "🍽️", name: "Taj Multicuisine", shortDesc: "Multicuisine, GST Road", longDesc: "Multicuisine restaurant on GST Road, Potheri near the station.", category: "food", lat: 12.81995, lng: 80.03709 },
  { id: 90, icon: "🧋", name: "Chai Ok Please", shortDesc: "Chai, shakes & street food", longDesc: "Chai, shakes, and street food near Potheri railway station.", category: "food", lat: 12.81927, lng: 80.03665 },
  { id: 91, icon: "🥐", name: "Bread & Brew", shortDesc: "Café & bakery, Thailavaram", longDesc: "Café and bakery at the Thailavaram signal serving coffee, baked goods, and desserts.", category: "food", lat: 12.83093, lng: 80.04565 },
  { id: 92, icon: "🍊", name: "Crown Juice Park", shortDesc: "Juices & snacks, GST Rd", longDesc: "Fresh juice and snack shop on GST Road, Thailavaram.", category: "food", lat: 12.83015, lng: 80.04487 },
  { id: 93, icon: "🥤", name: "Juice Magic", shortDesc: "24-hr juice bar", longDesc: "24-hour juice bar on GST Road, Thailavaram.", category: "food", lat: 12.82943, lng: 80.04491 },
  { id: 94, icon: "🍧", name: "Lassi Shop (GST Road)", shortDesc: "Lassi & falooda", longDesc: "Lassi and falooda shop on the Kattankulathur GST Road stretch.", category: "food", lat: 12.83054, lng: 80.04606 },
  { id: 95, icon: "🥪", name: "Seema's Cafe", shortDesc: "Budget street food in UB", longDesc: "Budget street-food café inside the SRM University Building.", category: "food", lat: 12.82303, lng: 80.04442 },
  { id: 96, icon: "🍢", name: "New Ifthar Restaurant", shortDesc: "Biryani & Arabian meals", longDesc: "Biryani and Arabian meals on GST Road, Potheri.", category: "food", lat: 12.82735, lng: 80.04377 },
  { id: 97, icon: "🍝", name: "Bliss Fusion", shortDesc: "Fusion café", longDesc: "Fusion café in the Perumal Koil St area serving pasta and milkshakes.", category: "food", lat: 12.81730, lng: 80.04090 },
  { id: 98, icon: "🌭", name: "GST Food Street (Westeros)", shortDesc: "Street-food truck hub", longDesc: "Street-food truck hub on the GST stretch near Maraimalai Nagar.", category: "food", lat: 12.83327, lng: 80.04909 },
  { id: 99, icon: "🥪", name: "Butty", shortDesc: "Rolls, shawarma & sandwiches", longDesc: "Rolls, shawarma, and sandwiches on Dr Radhakrishnan Road at the campus food court.", category: "food", lat: 12.82337, lng: 80.04441 },
  { id: 100, icon: "🥟", name: "Evergreen Momo Shop", shortDesc: "Momos at the back gate", longDesc: "Momos and fast food at the SRM back gate.", category: "food", lat: 12.81844, lng: 80.03924 },
  { id: 101, icon: "🫓", name: "Delhi 6", shortDesc: "North Indian, Pillaiyar Koil St", longDesc: "North Indian eatery on Pillaiyar Koil Street near the SRM back gate.", category: "food", lat: 12.81992, lng: 80.04055 },
  { id: 102, icon: "🍵", name: "Bombay Tea Stall", shortDesc: "Kadai chai, GST Rd", longDesc: "Famous kadai chai and snacks on GST Road, Kattankulathur.", category: "food", lat: 12.82066, lng: 80.03215 },
  { id: 103, icon: "🥡", name: "Beach House", shortDesc: "Budget eatery, back gate", longDesc: "Budget eatery near the SRM back gate.", category: "food", lat: 12.81932, lng: 80.03949 },
  { id: 104, icon: "🍗", name: "Faruuzi Multi Cuisine", shortDesc: "Student favourite, Urapakkam", longDesc: "Popular multi-cuisine restaurant on GST Road at Urapakkam, about 5 km from campus.", category: "food", lat: 12.87105, lng: 80.07645 },
  { id: 105, icon: "🍔", name: "Rock N Roll", shortDesc: "Burger joint, food court", longDesc: "Burger joint in the campus food-court hub.", category: "food", lat: 12.82246, lng: 80.04444 },
  { id: 106, icon: "🍹", name: "Sharjah Juices", shortDesc: "Juice stall near Potheri stn", longDesc: "Juice stall near Potheri railway station.", category: "food", lat: 12.82070, lng: 80.03690 },
  { id: 107, icon: "🍦", name: "Thickshake Factory", shortDesc: "Shakes at the food court", longDesc: "Shake stall in the campus food-court hub.", category: "food", lat: 12.82246, lng: 80.04444 },
  { id: 108, icon: "🍰", name: "Lava Cakes", shortDesc: "Bakery & café, Potheri", longDesc: "Bakery and café on Kambar Street off GST Road, Potheri.", category: "food", lat: 12.81970, lng: 80.03680 },
  { id: 109, icon: "🥐", name: "The Little Bakes", shortDesc: "Bakery, Maraimalai Nagar", longDesc: "Bakery on Railnagar 8th Street, Maraimalai Nagar.", category: "food", lat: 12.79730, lng: 80.03910 },

  // Accommodation (research sweep 2)
  { id: 110, icon: "🏨", name: "SMS Gents Hostel", shortDesc: "Boys PG, back gate", longDesc: "Popular boys paying-guest hostel near the SRM back gate, Potheri.", category: "accommodation", lat: 12.8204451, lng: 80.0421962 },
  { id: 111, icon: "🏢", name: "SRM Green Pearl", shortDesc: "SRM off-campus hostel", longDesc: "SRM-run off-campus hostel plus 364-unit apartment complex in Potheri, with shuttle to campus.", category: "accommodation", lat: 12.81381, lng: 80.038103 },
  { id: 112, icon: "🏙️", name: "Estancia Township", shortDesc: "82-acre gated township", longDesc: "Arun Excello 82-acre gated township on GST Road with 2,000+ units.", category: "accommodation", lat: 12.8270585, lng: 80.050528 },
  { id: 113, icon: "🏢", name: "Lancor Abode Valley", shortDesc: "Student township, 22 blocks", longDesc: "688-apartment student township in Potheri with 22 blocks.", category: "accommodation", lat: 12.8162269, lng: 80.0404121 },
  { id: 114, icon: "🏢", name: "Jains Avalon Springs", shortDesc: "Gated community + PG", longDesc: "Gated 152-unit community about 5 minutes from SRM; hosts Myroomie PGs.", category: "accommodation", lat: 12.81694454, lng: 80.05006263 },
  { id: 115, icon: "🏢", name: "Dr. B.C. Roy Hostel", shortDesc: "Girls medical hostel", longDesc: "Girls hostel for medical/dental students near the SRM hospital.", category: "accommodation", lat: 12.8223, lng: 80.0478 },
  { id: 116, icon: "🏢", name: "Nightingale Hostel", shortDesc: "Girls medical hostel", longDesc: "Girls hostel for medical and health-science students.", category: "accommodation", lat: 12.8221, lng: 80.0487 },
  { id: 117, icon: "🏢", name: "Dr. Muthulakshmi Hostel", shortDesc: "Girls hostel, medical side", longDesc: "Girls hostel on the medical college campus side.", category: "accommodation", lat: 12.8229, lng: 80.0486 },
  { id: 118, icon: "🏢", name: "Pierre Fauchard Hostel", shortDesc: "Boys dental hostel", longDesc: "Boys hostel serving SRM Dental College students.", category: "accommodation", lat: 12.8216, lng: 80.048 },
  { id: 119, icon: "🏢", name: "VGN Southern Country", shortDesc: "Gated apartments, Potheri", longDesc: "VGN gated apartments heavily rented by SRM students.", category: "accommodation", lat: 12.82, lng: 80.038 },
  { id: 120, icon: "🏘️", name: "Pillayar Koil St PG Cluster", shortDesc: "PG cluster, back gate", longDesc: "Sri Vinayaga, Sai Balaji, and Royal Inn PGs near the back gate.", category: "accommodation", lat: 12.8197, lng: 80.0415 },
  { id: 121, icon: "🏢", name: "Began Hostel", shortDesc: "Boys hostel, AC rooms", longDesc: "Boys hostel with AC rooms and common washrooms.", category: "accommodation", lat: 12.8208, lng: 80.0442 },
  { id: 122, icon: "🏢", name: "Thamarai Block", shortDesc: "Girls hostel", longDesc: "Girls hostel, non-AC 2-sharing with common washroom.", category: "accommodation", lat: 12.82, lng: 80.0449 },
  { id: 123, icon: "🏢", name: "Mullai Block", shortDesc: "Girls hostel", longDesc: "Girls hostel, non-AC 3-sharing with common washroom.", category: "accommodation", lat: 12.8198, lng: 80.0454 },
  { id: 124, icon: "🏢", name: "Senbagam Block", shortDesc: "Budget girls hostel", longDesc: "Budget girls hostel with non-AC 6-sharing rooms.", category: "accommodation", lat: 12.8203, lng: 80.0459 },
  { id: 125, icon: "🏢", name: "ESQ A & B Blocks", shortDesc: "Girls hostel flats", longDesc: "Girls hostel flats with non-AC attached washrooms.", category: "accommodation", lat: 12.821, lng: 80.0452 },
  { id: 126, icon: "🏢", name: "Malligai Block", shortDesc: "Girls hostel", longDesc: "Girls hostel, non-AC 2-sharing with common washroom.", category: "accommodation", lat: 12.8201, lng: 80.0457 },

  // Services (research sweep 2)
  { id: 127, icon: "👓", name: "Vision Plus Optics", shortDesc: "Optical shop, GST Rd", longDesc: "Optical shop on the Thailavaram GST Road strip.", category: "services", lat: 12.831187, lng: 80.046775 },
  { id: 128, icon: "🧺", name: "Vanga Laundry & Dry Cleaning", shortDesc: "Laundry, Potheri", longDesc: "Laundry and dry-cleaning service in Potheri.", category: "services", lat: 12.820043, lng: 80.045447 },
  { id: 129, icon: "🛒", name: "Shell Select", shortDesc: "Convenience store, GST Rd", longDesc: "Convenience store on GST Road, Kattankulathur.", category: "services", lat: 12.832382, lng: 80.046680 },
  { id: 130, icon: "🛠️", name: "Shree Caarwing", shortDesc: "Tyres & 2-wheeler service", longDesc: "Tyres and two-wheeler service on GST Road.", category: "services", lat: 12.832153, lng: 80.046867 },
  { id: 131, icon: "🚗", name: "Kia Motors Kattankulathur", shortDesc: "Car dealer & workshop", longDesc: "Kia dealership and workshop on GST Road.", category: "services", lat: 12.831280, lng: 80.047326 },
  { id: 132, icon: "🏧", name: "ICICI ATM @ SRM", shortDesc: "24h ATM, GST Rd entrance", longDesc: "ICICI 24-hour ATM at the GST Road campus entrance.", category: "services", lat: 12.822913, lng: 80.045853 },
  { id: 133, icon: "🏧", name: "Axis Bank ATM @ SRM Nagar", shortDesc: "ATM near University Building", longDesc: "Axis Bank ATM near the SRM University Building.", category: "services", lat: 12.823145, lng: 80.043613 },
  { id: 134, icon: "🏧", name: "ICICI ATM @ Adobevalley", shortDesc: "ATM, Kakkan St", longDesc: "ICICI ATM on Kakkan Street behind SRM.", category: "services", lat: 12.817096, lng: 80.039909 },
  { id: 135, icon: "💪", name: "King Fitness Centre", shortDesc: "Gym, Pillayar Koil St", longDesc: "Gym on Pillayar Koil Street, Potheri.", category: "services", lat: 12.818950, lng: 80.040878 },
  { id: 136, icon: "💪", name: "Easy Fit Unisex Gym", shortDesc: "Gym, Potheri", longDesc: "Unisex fitness centre in Potheri.", category: "services", lat: 12.820219, lng: 80.040662 },
  { id: 137, icon: "💪", name: "Nitro 2.0 Gym", shortDesc: "Gym, Thailavaram", longDesc: "Gym and fitness studio on GST Road, Thailavaram.", category: "services", lat: 12.828762, lng: 80.044268 },
  { id: 138, icon: "💪", name: "Fit N Life Unisex Gym", shortDesc: "Gym, Thailavaram", longDesc: "Unisex gym in Thailavaram.", category: "services", lat: 12.829103, lng: 80.046071 },
  { id: 139, icon: "🎮", name: "Varianz Gym & Gaming Hub", shortDesc: "Gym + esports hub", longDesc: "Gym and esports/gaming hub on GST Road, Thailavaram.", category: "services", lat: 12.828981, lng: 80.044491 },
  { id: 140, icon: "💪", name: "Estancia Gym", shortDesc: "Gym, Estancia IT Park", longDesc: "Gym at the Estancia IT Park.", category: "services", lat: 12.826400, lng: 80.051858 },
  { id: 141, icon: "🏍️", name: "Friends Bike & Car Rental", shortDesc: "Bike/car rental", longDesc: "Bike and car rental on Kakkan Street near Adobevalley.", category: "services", lat: 12.817300, lng: 80.040100 },
  { id: 142, icon: "📱", name: "Salala Mobile Shop", shortDesc: "Mobile repair", longDesc: "Mobile repair shop on Pillayar Koil Street.", category: "services", lat: 12.819500, lng: 80.040300 },
  { id: 143, icon: "🏛️", name: "SRM University Estate Office", shortDesc: "Campus admin office", longDesc: "Campus administration office in SRM Nagar.", category: "facilities", lat: 12.823600, lng: 80.042100 },
  { id: 144, icon: "🖨️", name: "SRM General Stores", shortDesc: "Stationery & general store", longDesc: "Stationery and general store on Mahatma Gandhi Road, Potheri.", category: "services", lat: 12.821000, lng: 80.038500 },
  { id: 145, icon: "🔧", name: "The Mobile Service Centre", shortDesc: "Mobile repair", longDesc: "Mobile repair on Bharathiyar Street off Pillayar Koil Street.", category: "services", lat: 12.822900, lng: 80.042500 },
  { id: 146, icon: "📦", name: "DTDC Courier (SRM-Potheri)", shortDesc: "Courier franchise", longDesc: "DTDC courier franchise near GST Road.", category: "services", lat: 12.829600, lng: 80.045800 },
  { id: 147, icon: "🛒", name: "Blue Berry Super Market", shortDesc: "Supermarket, Perumal Koil St", longDesc: "Supermarket on Perumal Koil Street, Potheri.", category: "services", lat: 12.821500, lng: 80.043500 },
  { id: 148, icon: "🛒", name: "Amirtham Stores", shortDesc: "Grocery, Thiruvalluvar Salai", longDesc: "Grocery store on Thiruvalluvar Salai.", category: "services", lat: 12.820500, lng: 80.037800 },
  { id: 149, icon: "🛒", name: "Hari Super Market", shortDesc: "Grocery, University Bldg", longDesc: "Grocery store at the SRM University building ground floor, Potheri.", category: "services", lat: 12.81992, lng: 80.03815 },

  // Sports & Outdoors (research sweep 2)
  { id: 150, icon: "⚽", name: "Freedom Sports Turf", shortDesc: "24/7 turf, Thailavaram", longDesc: "Cricket/football turf on Pillayarkovil Street, Thailavaram, open 24/7.", category: "sports", lat: 12.8313, lng: 80.0451 },
  { id: 151, icon: "⚽", name: "El Clasico Turf", shortDesc: "Premium 5-a-side football", longDesc: "Premium 5/6-a-side football turf with floodlights in SRM Nagar, open 24/7.", category: "sports", lat: 12.82707, lng: 80.04256 },
  { id: 152, icon: "🏸", name: "Zafe Badminton Club", shortDesc: "Indoor badminton", longDesc: "Indoor badminton court on EVP Padma Avenue, Thailavaram (10am–10pm).", category: "sports", lat: 12.83285, lng: 80.05029 },
  { id: 153, icon: "🎱", name: "The Den (Potheri)", shortDesc: "Billiards & indoor games", longDesc: "24/7 billiards, snooker, carrom, and indoor games hall.", category: "sports", lat: 12.8295, lng: 80.0452 },
  { id: 154, icon: "🏏", name: "Turf 7 Sports & Cafe", shortDesc: "Cricket ground + café", longDesc: "Cricket ground with café and changing rooms, Veerabathra Nagar.", category: "sports", lat: 12.8278, lng: 80.0458 },
  { id: 155, icon: "🏏", name: "The Barbarian Turf", shortDesc: "Turf ground, SRM Nagar", longDesc: "Turf ground on Pillayar Koil Street, SRM Nagar.", category: "sports", lat: 12.8290, lng: 80.0445 },
  { id: 156, icon: "🌳", name: "Potheri Park", shortDesc: "Park near the station", longDesc: "Small park near Potheri railway station.", category: "landmarks", lat: 12.8200, lng: 80.0390 },

  // Landmarks (research sweep 2)
  { id: 157, icon: "🎬", name: "Sri Venkateswara Theatre", shortDesc: "4K AC theatre, Guduvanchery", longDesc: "4K air-conditioned single-screen theatre on the NH service road, Guduvanchery (~5 km).", category: "landmarks", lat: 12.84749, lng: 80.06318 },
  { id: 158, icon: "🛕", name: "Kalyana Anjaneya Temple", shortDesc: "Hanuman temple, Thailavaram", longDesc: "Temple of Hanuman with consort Suvarchala Devi at Thailavaram.", category: "landmarks", lat: 12.831146, lng: 80.044785 },
  { id: 159, icon: "🛕", name: "Sri Kaalathiswarar Temple", shortDesc: "1500-yr Rahu-Kethu temple", longDesc: "Ancient Rahu-Kethu Shiva temple near the Kattankulathur bus stand.", category: "landmarks", lat: 12.806000, lng: 80.024300 },
  { id: 160, icon: "🛕", name: "Om Shri Selva Vinayagar Temple", shortDesc: "Ganesha temple, SRM Nagar", longDesc: "Ganesha temple near the SRM Central Library and hotel.", category: "landmarks", lat: 12.822500, lng: 80.043500 },

  // Transport (research sweep 2)
  { id: 161, icon: "🚏", name: "SRM University Bus Stop (VPT)", shortDesc: "Main GST-road stop", longDesc: "Main GST-road bus stop opposite the campus.", category: "transport", lat: 12.827029, lng: 80.041689 },
  { id: 162, icon: "🚏", name: "SRM Java Bus Stop", shortDesc: "Shuttle stop, Java Green", longDesc: "SRM shuttle stop near the Java Green canteen.", category: "transport", lat: 12.822862, lng: 80.044392 },
  { id: 163, icon: "🚪", name: "SRM In/Out Gate Bus Stops", shortDesc: "GST-road gate stops", longDesc: "Shuttle stops at the campus GST-road gate.", category: "transport", lat: 12.823119, lng: 80.041044 },
  { id: 164, icon: "🚏", name: "SRM Hospital Bus Stop", shortDesc: "Stop near medical college", longDesc: "SRM-operated bus stop near the medical college.", category: "transport", lat: 12.823118, lng: 80.047199 },
  { id: 165, icon: "🚉", name: "Kattankulathur Railway Station (CTM)", shortDesc: "4-platform suburban station", longDesc: "Chennai suburban railway station serving Kattankulathur town.", category: "transport", lat: 12.805700, lng: 80.026500 },
  { id: 166, icon: "🚌", name: "Kattankulathur Bus Stand", shortDesc: "Main GST Rd bus stand", longDesc: "Main bus stand on GST Road near the Kattankulathur station.", category: "transport", lat: 12.805984, lng: 80.026733 },
  { id: 167, icon: "🚏", name: "Thailavaram Bus Junction", shortDesc: "GST Rd stop", longDesc: "GST Road bus stop at the Thailavaram junction.", category: "transport", lat: 12.831000, lng: 80.043800 },
  { id: 168, icon: "🚪", name: "SRM Gate 1 (VPT)", shortDesc: "Gate to auditorium/hostels", longDesc: "Numbered campus gate near the VPT/Valliammai Polytechnic bus stop.", category: "transport", lat: 12.825700, lng: 80.041500 },

  // Academic (research sweep 2)
  { id: 169, icon: "🏫", name: "SRM Valliammai Engineering College", shortDesc: "Autonomous engineering college", longDesc: "Autonomous engineering college beside NH-45, adjacent to the main campus.", category: "academic", lat: 12.825720, lng: 80.042819 },
  { id: 170, icon: "🧪", name: "SRM Chemical Block", shortDesc: "Chemical engineering block", longDesc: "Chemical engineering block on Intra College Road.", category: "academic", lat: 12.824081, lng: 80.043000 },
  { id: 171, icon: "🔬", name: "C.V. Raman Research Park", shortDesc: "Central research park", longDesc: "Multi-storey central research park near the Tech Park.", category: "academic", lat: 12.824500, lng: 80.044000 },
]

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function getDirectionsUrl(lat: number, lng: number): string {
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
  if (isIOS) return `https://maps.apple.com/?daddr=${lat},${lng}`
  if (isAndroid) return `https://maps.google.com/maps?daddr=${lat},${lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export const CAMPUS_CENTER: [number, number] = [12.8236, 80.0442]
