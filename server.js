const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";
const ALLOW_DEMO_DATA = String(process.env.ALLOW_DEMO_DATA || "true").toLowerCase() !== "false";
const OFFICIAL_STATION_SEARCH_URL = "https://claims.indianrail.gov.in/claims/claims.stnhelp";
const STATION_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

app.use(express.json());
app.use(express.static(ROOT_DIR));

const STATION_MAPPINGS = [
  { keys: ["taj mahal", "agra fort", "agra"], stationName: "Agra Cantt.", stationCode: "AGC" },
  { keys: ["red fort", "india gate", "qutub minar", "lotus temple", "new delhi", "delhi"], stationName: "New Delhi", stationCode: "NDLS" },
  { keys: ["humayun", "nizamuddin"], stationName: "Hazrat Nizamuddin", stationCode: "NZM" },
  { keys: ["mumbai", "gateway of india", "marine drive"], stationName: "Mumbai Central", stationCode: "BCT" },
  { keys: ["csmt", "cst"], stationName: "Mumbai CSMT", stationCode: "CSMT" },
  { keys: ["kolkata", "howrah bridge", "victoria memorial"], stationName: "Howrah Junction", stationCode: "HWH" },
  { keys: ["charminar", "hyderabad"], stationName: "Hyderabad Deccan", stationCode: "HYB" },
  { keys: ["jaipur", "hawa mahal", "amer fort"], stationName: "Jaipur Junction", stationCode: "JP" },
  { keys: ["udaipur"], stationName: "Udaipur City", stationCode: "UDZ" },
  { keys: ["jodhpur"], stationName: "Jodhpur Junction", stationCode: "JU" },
  { keys: ["goa", "baga", "calangute", "anjuna"], stationName: "Thivim", stationCode: "THVM" },
  { keys: ["palolem"], stationName: "Canacona", stationCode: "CNO" },
  { keys: ["varanasi", "kashi", "banaras"], stationName: "Varanasi Junction", stationCode: "BSB" },
  { keys: ["amritsar", "golden temple"], stationName: "Amritsar Junction", stationCode: "ASR" },
  { keys: ["tirupati"], stationName: "Tirupati", stationCode: "TPTY" },
  { keys: ["rameswaram"], stationName: "Rameswaram", stationCode: "RMM" },
  { keys: ["munnar"], stationName: "Aluva", stationCode: "AWY" },
  { keys: ["alleppey", "alappuzha"], stationName: "Alappuzha", stationCode: "ALLP" },
  { keys: ["shimla"], stationName: "Shimla", stationCode: "SML" },
  { keys: ["manali"], stationName: "Joginder Nagar", stationCode: "JDNX" }
];

const SEARCH_STATIONS = [
  { stationName: "New Delhi", stationCode: "NDLS", aliases: ["new delhi", "delhi", "ndls"] },
  { stationName: "New Chandigarh", stationCode: "NCH", aliases: ["new chandigarh", "nch", "chandigarh"] },
  { stationName: "New Jalpaiguri", stationCode: "NJP", aliases: ["new jalpaiguri", "njp", "jalpaiguri"] },
  { stationName: "Hazrat Nizamuddin", stationCode: "NZM", aliases: ["hazrat nizamuddin", "nizamuddin", "nzm"] },
  { stationName: "Old Delhi Junction", stationCode: "DLI", aliases: ["old delhi", "dli", "delhi junction"] },
  { stationName: "Anand Vihar Terminal", stationCode: "ANVT", aliases: ["anand vihar", "anvt"] },
  { stationName: "Mumbai Central", stationCode: "BCT", aliases: ["mumbai central", "mumbai", "bct"] },
  { stationName: "Mumbai CSMT", stationCode: "CSMT", aliases: ["mumbai csmt", "csmt", "cst"] },
  { stationName: "Bandra Terminus", stationCode: "BDTS", aliases: ["bandra terminus", "bdts", "bandra"] },
  { stationName: "Howrah Junction", stationCode: "HWH", aliases: ["howrah", "kolkata", "hwh"] },
  { stationName: "Sealdah", stationCode: "SDAH", aliases: ["sealdah", "sdah"] },
  { stationName: "Chennai Central", stationCode: "MAS", aliases: ["chennai", "chennai central", "mas"] },
  { stationName: "KSR Bengaluru", stationCode: "SBC", aliases: ["bengaluru", "bangalore", "ksr bengaluru", "sbc"] },
  { stationName: "Hyderabad Deccan", stationCode: "HYB", aliases: ["hyderabad", "hyb"] },
  { stationName: "Secunderabad", stationCode: "SC", aliases: ["secunderabad", "sc"] },
  { stationName: "Chandigarh", stationCode: "CDG", aliases: ["chandigarh", "cdg"] },
  { stationName: "Ghaziabad", stationCode: "GZB", aliases: ["ghaziabad", "gzb"] },
  { stationName: "Meerut City", stationCode: "MTC", aliases: ["meerut", "meerut city", "mtc"] },
  { stationName: "Muzaffarnagar", stationCode: "MOZ", aliases: ["muzaffarnagar", "moz"] },
  { stationName: "Tapri Junction", stationCode: "TPZ", aliases: ["tapri", "tpz"] },
  { stationName: "Madgaon", stationCode: "MAO", aliases: ["goa", "madgaon", "mao"] },
  { stationName: "Thivim", stationCode: "THVM", aliases: ["thivim", "north goa", "goa thivim"] },
  { stationName: "Jaipur Junction", stationCode: "JP", aliases: ["jaipur", "jp"] },
  { stationName: "Varanasi Junction", stationCode: "BSB", aliases: ["varanasi", "banaras", "kashi", "bsb"] },
  { stationName: "Saharanpur Junction", stationCode: "SRE", aliases: ["saharanpur", "saharanpur junction", "sre"] },
  { stationName: "Pune Junction", stationCode: "PUNE", aliases: ["pune", "pune junction", "pune jn"] },
  { stationName: "Ahmedabad Junction", stationCode: "ADI", aliases: ["ahmedabad", "adi", "kalupur"] },
  { stationName: "Surat", stationCode: "ST", aliases: ["surat", "st"] },
  { stationName: "Vadodara Junction", stationCode: "BRC", aliases: ["vadodara", "baroda", "brc"] },
  { stationName: "Lucknow NR", stationCode: "LKO", aliases: ["lucknow", "lko"] },
  { stationName: "Kanpur Central", stationCode: "CNB", aliases: ["kanpur", "kanpur central", "cnb"] },
  { stationName: "Patna Junction", stationCode: "PNBE", aliases: ["patna", "pnbe", "patna jn"] },
  { stationName: "Prayagraj Junction", stationCode: "PRYJ", aliases: ["prayagraj", "allahabad", "pryj"] },
  { stationName: "Gorakhpur Junction", stationCode: "GKP", aliases: ["gorakhpur", "gkp"] },
  { stationName: "Jammu Tawi", stationCode: "JAT", aliases: ["jammu", "jammu tawi", "jat"] },
  { stationName: "Amritsar Junction", stationCode: "ASR", aliases: ["amritsar", "asr"] },
  { stationName: "Haridwar Junction", stationCode: "HW", aliases: ["haridwar", "hw"] },
  { stationName: "Dehradun", stationCode: "DDN", aliases: ["dehradun", "ddn"] },
  { stationName: "Ajmer Junction", stationCode: "AII", aliases: ["ajmer", "aii"] },
  { stationName: "Kota Junction", stationCode: "KOTA", aliases: ["kota", "kota junction"] },
  { stationName: "Udaipur City", stationCode: "UDZ", aliases: ["udaipur", "udz"] },
  { stationName: "Jodhpur Junction", stationCode: "JU", aliases: ["jodhpur", "ju"] },
  { stationName: "Bhopal Junction", stationCode: "BPL", aliases: ["bhopal", "bpl"] },
  { stationName: "Indore Junction", stationCode: "INDB", aliases: ["indore", "indb"] },
  { stationName: "Nagpur", stationCode: "NGP", aliases: ["nagpur", "ngp"] },
  { stationName: "Raipur Junction", stationCode: "R", aliases: ["raipur", "raipur junction"] },
  { stationName: "Bilaspur Junction", stationCode: "BSP", aliases: ["bilaspur", "bsp"] },
  { stationName: "Ranchi", stationCode: "RNC", aliases: ["ranchi", "rnc"] },
  { stationName: "Bhubaneswar", stationCode: "BBS", aliases: ["bhubaneswar", "bbs"] },
  { stationName: "Puri", stationCode: "PURI", aliases: ["puri"] },
  { stationName: "Guwahati", stationCode: "GHY", aliases: ["guwahati", "ghy"] },
  { stationName: "Visakhapatnam", stationCode: "VSKP", aliases: ["visakhapatnam", "vizag", "vskp"] },
  { stationName: "Vijayawada Junction", stationCode: "BZA", aliases: ["vijayawada", "bza"] },
  { stationName: "Coimbatore Junction", stationCode: "CBE", aliases: ["coimbatore", "cbe"] },
  { stationName: "Madurai Junction", stationCode: "MDU", aliases: ["madurai", "mdu"] },
  { stationName: "Ernakulam Junction", stationCode: "ERS", aliases: ["kochi", "cochin", "ernakulam", "ers"] },
  { stationName: "Thiruvananthapuram Central", stationCode: "TVC", aliases: ["trivandrum", "thiruvananthapuram", "tvc"] },
  { stationName: "Mysuru Junction", stationCode: "MYS", aliases: ["mysuru", "mysore", "mys"] },
  { stationName: "Tirupati", stationCode: "TPTY", aliases: ["tirupati", "tpty"] },
  { stationName: "Rameswaram", stationCode: "RMM", aliases: ["rameswaram", "rmm"] },
  { stationName: "Siliguri Junction", stationCode: "SGUJ", aliases: ["siliguri", "sguj"] }
];

const LOCAL_ROUTE_CATALOG = {
  "NDLS-BCT": {
    insight: "Rajdhani and premium overnight trains are usually the best balance of time, comfort, and meal service on this route.",
    trains: [
      {
        trainNumber: "12952",
        trainName: "Mumbai Rajdhani Express",
        departure: "16:55",
        arrival: "08:35",
        duration: "15h 40m",
        fare: "Rs 2,955",
        availability: "High chance of confirmation",
        classes: ["3A", "2A", "1A"],
        classDetails: {
          "3A": { fare: "Rs 2,955", availability: "Available 32" },
          "2A": { fare: "Rs 4,180", availability: "Available 11" },
          "1A": { fare: "Rs 6,890", availability: "Available 3" }
        },
        food: "Meals included on board",
        foodNote: "Dinner, breakfast, and tea are typically covered in Rajdhani classes.",
        ticketTip: "Best if you want a fast direct overnight train.",
        tags: ["Fastest", "Meals Included"]
      },
      {
        trainNumber: "12910",
        trainName: "NZM BDTS Garib Rath",
        departure: "15:35",
        arrival: "08:10",
        duration: "16h 35m",
        fare: "Rs 1,570",
        availability: "Budget-friendly seats",
        classes: ["3A"],
        classDetails: {
          "3A": { fare: "Rs 1,570", availability: "Available 27" }
        },
        food: "Buy-on-board and station vendors",
        foodNote: "Carry snacks or pre-order e-catering for smoother dinner timing.",
        ticketTip: "Good lower-cost AC option.",
        tags: ["Budget", "AC Travel"]
      },
      {
        trainNumber: "22222",
        trainName: "CSMT Rajdhani",
        departure: "16:15",
        arrival: "10:05",
        duration: "17h 50m",
        fare: "Rs 2,650",
        availability: "Waitlist likely during peak days",
        classes: ["3A", "2A"],
        classDetails: {
          "3A": { fare: "Rs 2,650", availability: "WL 18" },
          "2A": { fare: "Rs 3,980", availability: "WL 6" }
        },
        food: "Meals included in premium classes",
        foodNote: "Works well if you want premium service and flexible arrival timing.",
        ticketTip: "Strong backup if the primary Rajdhani fills up.",
        tags: ["Premium", "Backup Pick"]
      }
    ],
    nextAlternative: {
      trainNumber: "82902",
      trainName: "Tejas Special",
      departure: "09:30",
      arrival: "23:05",
      dayOffset: 1,
      fare: "Rs 2,550"
    },
    tracking: {
      trainNumber: "12952",
      trainName: "Mumbai Rajdhani Express",
      status: "Running on time",
      progress: 58,
      lastUpdated: "Updated 3 mins ago",
      nextStop: "Surat",
      arrivalIn: "19 mins",
      stations: ["New Delhi", "Kota", "Ratlam", "Vadodara", "Surat", "Mumbai Central"]
    }
  },
  "BCT-NDLS": {
    insight: "Mumbai to Delhi works best with Rajdhani and premium overnight trains because they protect next-morning arrival and meal timing.",
    stations: ["Mumbai Central", "Surat", "Vadodara", "Ratlam", "Kota", "New Delhi"],
    trains: [
      {
        trainNumber: "12951",
        trainName: "Mumbai Rajdhani Express",
        departure: "16:35",
        arrival: "08:32",
        duration: "15h 57m",
        fare: "Rs 2,955",
        availability: "Good confirmation chance",
        classes: ["3A", "2A", "1A"],
        classDetails: {
          "3A": { fare: "Rs 2,955", availability: "Available 29" },
          "2A": { fare: "Rs 4,180", availability: "Available 8" },
          "1A": { fare: "Rs 6,890", availability: "Available 2" }
        },
        classAvailability: {
          "3A": "Available 29",
          "2A": "Available 8",
          "1A": "Available 2"
        },
        food: "Meals included on board",
        foodNote: "Dinner and breakfast service are usually the smoothest on Rajdhani runs.",
        ticketTip: "Best premium overnight option if you want Delhi by early morning.",
        tags: ["Premium", "Fastest"]
      },
      {
        trainNumber: "12953",
        trainName: "August Kranti Rajdhani",
        departure: "17:40",
        arrival: "10:55",
        duration: "17h 15m",
        fare: "Rs 2,760",
        availability: "Moderate",
        classes: ["3A", "2A"],
        classDetails: {
          "3A": { fare: "Rs 2,760", availability: "WL 4" },
          "2A": { fare: "Rs 4,020", availability: "RAC 3" }
        },
        classAvailability: {
          "3A": "WL 4",
          "2A": "RAC 3"
        },
        food: "Meals included with premium classes",
        foodNote: "Keep this as your backup if the main Rajdhani is tight.",
        ticketTip: "Good backup with similar comfort and timing.",
        tags: ["Backup Pick", "Overnight"]
      }
    ],
    nextAlternative: {
      trainNumber: "22917",
      trainName: "Bandra Hazrat Nizamuddin Express",
      departure: "12:15",
      arrival: "05:10",
      dayOffset: 1,
      fare: "Rs 1,940"
    },
    tracking: {
      trainNumber: "12951",
      trainName: "Mumbai Rajdhani Express",
      status: "Expected on time",
      progress: 47,
      lastUpdated: "Updated 1 min ago",
      nextStop: "Vadodara",
      arrivalIn: "24 mins",
      stations: ["Mumbai Central", "Surat", "Vadodara", "Ratlam", "Kota", "New Delhi"]
    }
  },
  "NDLS-HWH": {
    insight: "For Delhi to Kolkata, Rajdhani is the smoothest premium option, while Duronto and Poorva give strong alternatives.",
    trains: [
      {
        trainNumber: "12302",
        trainName: "Howrah Rajdhani",
        departure: "16:50",
        arrival: "10:05",
        duration: "17h 15m",
        fare: "Rs 2,870",
        availability: "Good in advance",
        classes: ["3A", "2A", "1A"],
        classDetails: {
          "3A": { fare: "Rs 2,870", availability: "Available 26" },
          "2A": { fare: "Rs 4,210", availability: "Available 8" },
          "1A": { fare: "Rs 6,940", availability: "Available 2" }
        },
        food: "Meals included on board",
        foodNote: "One of the easier long routes for full meal service.",
        ticketTip: "Ideal for business or short-stay trips.",
        tags: ["Reliable", "Meals Included"]
      },
      {
        trainNumber: "12274",
        trainName: "Duronto Express",
        departure: "12:55",
        arrival: "06:15",
        duration: "17h 20m",
        fare: "Rs 2,340",
        availability: "Moderate",
        classes: ["3A", "2A"],
        classDetails: {
          "3A": { fare: "Rs 2,340", availability: "Available 19" },
          "2A": { fare: "Rs 3,760", availability: "Available 7" }
        },
        food: "Pantry plus e-catering",
        foodNote: "Pre-order dinner if you want more choice than the pantry menu.",
        ticketTip: "Great backup for a similar time band.",
        tags: ["Direct", "Pantry Car"]
      }
    ],
    nextAlternative: {
      trainNumber: "12304",
      trainName: "Poorva Express",
      departure: "17:40",
      arrival: "12:20",
      dayOffset: 1,
      fare: "Rs 2,120"
    },
    tracking: {
      trainNumber: "12302",
      trainName: "Howrah Rajdhani",
      status: "Running with small delay",
      progress: 64,
      lastUpdated: "Updated 4 mins ago",
      nextStop: "Dhanbad",
      arrivalIn: "18 mins",
      stations: ["New Delhi", "Kanpur", "Prayagraj", "Gaya", "Dhanbad", "Howrah"]
    }
  },
  "HWH-NDLS": {
    insight: "Howrah to Delhi is strongest with Rajdhani-style trains because they compress the long run into one premium overnight plan.",
    stations: ["Howrah", "Dhanbad", "Gaya", "Prayagraj", "Kanpur", "New Delhi"],
    trains: [
      {
        trainNumber: "12301",
        trainName: "Howrah Rajdhani",
        departure: "16:50",
        arrival: "10:00",
        duration: "17h 10m",
        fare: "Rs 2,870",
        availability: "Good in advance",
        classes: ["3A", "2A", "1A"],
        classDetails: {
          "3A": { fare: "Rs 2,870", availability: "Available 25" },
          "2A": { fare: "Rs 4,210", availability: "Available 7" },
          "1A": { fare: "Rs 6,940", availability: "Available 2" }
        },
        classAvailability: {
          "3A": "Available 25",
          "2A": "Available 7",
          "1A": "Available 2"
        },
        food: "Meals included on board",
        foodNote: "Best for a full-service overnight run into Delhi.",
        ticketTip: "Pick this if you want the cleanest all-in-one premium option.",
        tags: ["Reliable", "Meals Included"]
      }
    ],
    nextAlternative: {
      trainNumber: "12273",
      trainName: "Howrah Duronto",
      departure: "08:25",
      arrival: "03:50",
      dayOffset: 1,
      fare: "Rs 2,340"
    },
    tracking: {
      trainNumber: "12301",
      trainName: "Howrah Rajdhani",
      status: "Running on time",
      progress: 39,
      lastUpdated: "Updated 2 mins ago",
      nextStop: "Gaya",
      arrivalIn: "21 mins",
      stations: ["Howrah", "Dhanbad", "Gaya", "Prayagraj", "Kanpur", "New Delhi"]
    }
  },
  "SBC-MAS": {
    insight: "This short intercity route works best with Shatabdi-style timings if you want same-day arrival.",
    trains: [
      {
        trainNumber: "12028",
        trainName: "Shatabdi Express",
        departure: "06:00",
        arrival: "10:55",
        duration: "4h 55m",
        fare: "Rs 1,245",
        availability: "Usually strong on weekdays",
        classes: ["CC", "EC"],
        classDetails: {
          CC: { fare: "Rs 1,245", availability: "Available 36" },
          EC: { fare: "Rs 2,090", availability: "Available 9" }
        },
        food: "Meals included",
        foodNote: "Breakfast and tea service are typically included.",
        ticketTip: "Best pick for speed and comfort.",
        tags: ["Fastest", "Day Trip"]
      },
      {
        trainNumber: "12608",
        trainName: "Lalbagh Express",
        departure: "15:30",
        arrival: "21:15",
        duration: "5h 45m",
        fare: "Rs 885",
        availability: "Strong",
        classes: ["CC", "2S"],
        classDetails: {
          CC: { fare: "Rs 885", availability: "Available 24" },
          "2S": { fare: "Rs 265", availability: "Available 72" }
        },
        food: "Station food and e-catering",
        foodNote: "Better to grab packed food before departure for evening runs.",
        ticketTip: "Great value pick.",
        tags: ["Budget", "Popular"]
      }
    ],
    nextAlternative: {
      trainNumber: "12610",
      trainName: "Mysuru Chennai Express",
      departure: "22:45",
      arrival: "05:50",
      dayOffset: 1,
      fare: "Rs 760"
    },
    tracking: {
      trainNumber: "12028",
      trainName: "Shatabdi Express",
      status: "Running on time",
      progress: 51,
      lastUpdated: "Updated 2 mins ago",
      nextStop: "Jolarpettai",
      arrivalIn: "17 mins",
      stations: ["KSR Bengaluru", "Bangarapet", "Jolarpettai", "Katpadi", "Chennai Central"]
    }
  },
  "MAS-SBC": {
    insight: "Chennai to Bengaluru works best with fast intercity runs if you want a smooth same-day arrival with simple class choices.",
    stations: ["Chennai Central", "Katpadi", "Jolarpettai", "Bangarapet", "KSR Bengaluru"],
    trains: [
      {
        trainNumber: "12027",
        trainName: "Shatabdi Express",
        departure: "17:30",
        arrival: "22:25",
        duration: "4h 55m",
        fare: "Rs 1,245",
        availability: "Usually strong",
        classes: ["CC", "EC"],
        classDetails: {
          CC: { fare: "Rs 1,245", availability: "Available 31" },
          EC: { fare: "Rs 2,090", availability: "Available 6" }
        },
        classAvailability: {
          CC: "Available 31",
          EC: "Available 6"
        },
        food: "Meals included",
        foodNote: "Good fit if you want a comfortable evening intercity run.",
        ticketTip: "Best pick for speed and predictable arrival.",
        tags: ["Fastest", "Day Trip"]
      }
    ],
    nextAlternative: {
      trainNumber: "12607",
      trainName: "Lalbagh Express",
      departure: "15:35",
      arrival: "21:15",
      dayOffset: 0,
      fare: "Rs 885"
    },
    tracking: {
      trainNumber: "12027",
      trainName: "Shatabdi Express",
      status: "Expected on time",
      progress: 34,
      lastUpdated: "Updated just now",
      nextStop: "Jolarpettai",
      arrivalIn: "29 mins",
      stations: ["Chennai Central", "Katpadi", "Jolarpettai", "Bangarapet", "KSR Bengaluru"]
    }
  },
  "HYB-SBC": {
    insight: "Overnight Hyderabad to Bengaluru trains are usually the most practical because they save hotel time and reach early enough for workdays.",
    trains: [
      {
        trainNumber: "12785",
        trainName: "Kacheguda Mysuru Express",
        departure: "20:30",
        arrival: "08:15",
        duration: "11h 45m",
        fare: "Rs 1,180",
        availability: "Moderate",
        classes: ["SL", "3A", "2A"],
        classDetails: {
          SL: { fare: "Rs 420", availability: "Available 58" },
          "3A": { fare: "Rs 1,180", availability: "Available 16" },
          "2A": { fare: "Rs 1,790", availability: "Available 5" }
        },
        food: "E-catering recommended",
        foodNote: "Carry dinner or pre-order because pantry coverage varies by coach and day.",
        ticketTip: "Good overnight balance for comfort and price.",
        tags: ["Overnight", "Flexible"]
      },
      {
        trainNumber: "17603",
        trainName: "Kacheguda Yelahanka Express",
        departure: "17:30",
        arrival: "07:10",
        duration: "13h 40m",
        fare: "Rs 940",
        availability: "Budget-friendly",
        classes: ["SL", "3A"],
        classDetails: {
          SL: { fare: "Rs 330", availability: "Available 73" },
          "3A": { fare: "Rs 940", availability: "Available 21" }
        },
        food: "Vendor-based food access",
        foodNote: "Snacks and dinner are easier if you board with food already packed.",
        ticketTip: "Best for lower budget planning.",
        tags: ["Budget", "Sleeper"]
      }
    ],
    nextAlternative: {
      trainNumber: "12707",
      trainName: "AP Sampark Kranti",
      departure: "18:35",
      arrival: "08:25",
      dayOffset: 1,
      fare: "Rs 1,260"
    }
  },
  "NDLS-SRE": {
    insight: "Delhi to Saharanpur works best with short-distance express and intercity options, and class choice matters more than onboard extras here.",
    stations: ["New Delhi", "Ghaziabad", "Meerut City", "Muzaffarnagar", "Tapri", "Saharanpur"],
    trains: [
      {
        trainNumber: "12055",
        trainName: "Dehradun Jan Shatabdi",
        departure: "15:20",
        arrival: "18:28",
        duration: "3h 08m",
        fare: "Rs 545",
        availability: "Good same-day availability",
        classes: ["CC", "2S"],
        classDetails: {
          CC: { fare: "Rs 545", availability: "Available 42" },
          "2S": { fare: "Rs 185", availability: "Available 96" }
        },
        classAvailability: {
          CC: "Available 42",
          "2S": "Available 96"
        },
        food: "Light meal service plus station snacks",
        foodNote: "Short route, so snacks and tea are the practical choice here.",
        ticketTip: "Fastest pick if you want an evening arrival.",
        tags: ["Fastest", "Short Route"]
      },
      {
        trainNumber: "19019",
        trainName: "Dehradun Express",
        departure: "22:25",
        arrival: "02:40",
        duration: "4h 15m",
        fare: "Rs 210",
        availability: "Sleeper usually easier than AC on busy dates",
        classes: ["SL", "3A", "2S"],
        classDetails: {
          SL: { fare: "Rs 210", availability: "RAC 12" },
          "3A": { fare: "Rs 810", availability: "WL 5" },
          "2S": { fare: "Rs 120", availability: "Available 71" }
        },
        classAvailability: {
          SL: "RAC 12",
          "3A": "WL 5",
          "2S": "Available 71"
        },
        food: "Vendor-based food and e-catering",
        foodNote: "Carry dinner before boarding for a smoother late-night run.",
        ticketTip: "Best when you want separate sleeper and 3AC choices.",
        tags: ["Sleeper", "Night Option"]
      },
      {
        trainNumber: "14681",
        trainName: "New Delhi Jalandhar Intercity",
        departure: "13:10",
        arrival: "16:55",
        duration: "3h 45m",
        fare: "Rs 390",
        availability: "Moderate",
        classes: ["CC", "2S"],
        classDetails: {
          CC: { fare: "Rs 390", availability: "Available 18" },
          "2S": { fare: "Rs 140", availability: "Available 63" }
        },
        classAvailability: {
          CC: "Available 18",
          "2S": "Available 63"
        },
        food: "Station pickup recommended",
        foodNote: "Quick daylight ride, so pre-packed food is enough for most travelers.",
        ticketTip: "Balanced daytime choice with simple seating classes.",
        tags: ["Day Train", "Budget"]
      }
    ],
    nextAlternative: {
      trainNumber: "14545",
      trainName: "Saharanpur Express",
      departure: "06:10",
      arrival: "10:05",
      dayOffset: 1,
      fare: "Rs 235"
    },
    tracking: {
      trainNumber: "12055",
      trainName: "Dehradun Jan Shatabdi",
      status: "Running on time",
      progress: 62,
      lastUpdated: "Updated 2 mins ago",
      nextStop: "Muzaffarnagar",
      arrivalIn: "14 mins",
      stations: ["New Delhi", "Ghaziabad", "Meerut City", "Muzaffarnagar", "Tapri", "Saharanpur"]
    }
  }
};

function jsonError(res, status, message, extras = {}) {
  res.status(status).json({ success: false, error: message, ...extras });
}

function extractStationCode(value) {
  if (!value) return "";
  const bracketMatch = value.match(/\(([A-Z]{2,5})\)/);
  if (bracketMatch) return bracketMatch[1];
  const directCode = value.trim().toUpperCase();
  if (/^[A-Z]{2,5}$/.test(directCode)) return directCode;
  return "";
}

function findStationFromQuery(query) {
  const normalized = String(query || "").trim().toLowerCase();
  const match = STATION_MAPPINGS.find((item) => item.keys.some((key) => normalized.includes(key)));
  return match || { stationName: "Not Found", stationCode: "N/A" };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveSearchStation(input) {
  const code = extractStationCode(input);
  if (code) {
    const byCode = SEARCH_STATIONS.find((station) => station.stationCode === code);
    if (byCode) return byCode;
    const nameMatch = String(input || "").match(/^(.*?)\s*\(([A-Z0-9]{2,5})\)/);
    return {
      stationName: nameMatch ? nameMatch[1].trim() : code,
      stationCode: code,
      aliases: [normalizeText(input), code.toLowerCase()].filter(Boolean)
    };
  }

  const normalized = normalizeText(input);
  return SEARCH_STATIONS.find((station) => station.aliases.some((alias) => normalized.includes(alias))) || null;
}

function searchStations(query) {
  const normalized = normalizeText(query);
  if (!normalized) {
    return SEARCH_STATIONS.slice(0, 8);
  }

  return SEARCH_STATIONS
    .filter((station) => {
      const haystack = [station.stationName, station.stationCode, ...station.aliases].join(" ").toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((a, b) => {
      const aStarts = a.stationName.toLowerCase().startsWith(normalized) ? 0 : 1;
      const bStarts = b.stationName.toLowerCase().startsWith(normalized) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.stationName.localeCompare(b.stationName);
    })
    .slice(0, 8);
}

const stationSuggestionCache = new Map();

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"');
}

function dedupeStations(stations) {
  const seen = new Set();
  return stations.filter((station) => {
    const key = `${station.stationCode}-${station.stationName}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchOfficialStationSuggestions(query) {
  const normalized = normalizeText(query);
  if (!normalized) {
    return [];
  }

  const cached = stationSuggestionCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(`${OFFICIAL_STATION_SEARCH_URL}?btnGo=Go&txtlocal=frmRR.txtstnto&txtstnname=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 RailMate/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Official station lookup failed with ${response.status}`);
  }

  const html = await response.text();
  const text = decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
  );

  const matches = Array.from(text.matchAll(/(^|\n)\s*([A-Z0-9]{1,5})\s*-\s*([^\n(]+?)\s+\(Rly\s*-\s*([^)]+)\)/gm))
    .map((match) => ({
      stationCode: match[2].trim(),
      stationName: match[3].replace(/\s+/g, " ").trim(),
      label: `${match[3].replace(/\s+/g, " ").trim()} (${match[2].trim()})`,
      source: "official-indianrail"
    }))
    .filter((station) => station.stationName && station.stationCode)
    .slice(0, 40);

  const data = dedupeStations(matches);
  stationSuggestionCache.set(normalized, {
    expiresAt: Date.now() + STATION_CACHE_TTL_MS,
    data
  });

  return data;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatDisplayStation(station, fallback) {
  if (!station) return fallback;
  return `${station.stationName} (${station.stationCode})`;
}

function getNextDateLabel(date, dayOffset = 1) {
  const [year, month, day] = String(date).split("-").map(Number);
  if (!year || !month || !day) return "next day";
  const base = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return base.toISOString().slice(0, 10);
}

function buildGenericTrainSearch(fromStation, toStation, date) {
  return {
    insight: `RailMate route knowledge is showing a practical shortlist from ${formatDisplayStation(fromStation, "your source")} to ${formatDisplayStation(toStation, "your destination")}.`,
    stations: [formatDisplayStation(fromStation, "Origin"), "Mid Route", formatDisplayStation(toStation, "Destination")],
    trains: [
      {
        trainNumber: "RM101",
        trainName: `${fromStation?.stationCode || "SRC"} ${toStation?.stationCode || "DST"} Connector`,
        departure: "06:45",
        arrival: "14:10",
        duration: "7h 25m",
        fare: "Rs 845",
        availability: "Seats usually open",
        classes: ["CC", "2S"],
        classAvailability: {
          CC: "Available 23",
          "2S": "Available 64"
        },
        food: "Station pickup plus e-catering",
        foodNote: "Best for daytime routes with flexible meal breaks.",
        ticketTip: "Good value choice for same-day arrival.",
        tags: ["Balanced", "Value"]
      },
      {
        trainNumber: "RM221",
        trainName: `${fromStation?.stationCode || "SRC"} Overnight Express`,
        departure: "21:10",
        arrival: "06:35",
        duration: "9h 25m",
        fare: "Rs 1,240",
        availability: "Moderate",
        classes: ["SL", "3A"],
        classAvailability: {
          SL: "Available 31",
          "3A": "Available 9"
        },
        food: "Pre-order dinner recommended",
        foodNote: "Ideal if you want to save hotel time with an overnight run.",
        ticketTip: "Best backup if daytime seats get tight.",
        tags: ["Overnight", "Popular"]
      }
    ],
    nextAlternative: {
      trainNumber: "RM301",
      trainName: "Next Day Special",
      departure: "09:15",
      arrival: "17:40",
      dayOffset: 1,
      fare: "Rs 930",
      date: getNextDateLabel(date, 1)
    },
    tracking: {
      trainNumber: "RM101",
      trainName: `${fromStation?.stationCode || "SRC"} ${toStation?.stationCode || "DST"} Connector`,
      status: "Expected on time",
      progress: 48,
      lastUpdated: "Updated 1 min ago",
      nextStop: "Mid Route",
      arrivalIn: "22 mins",
      stations: [formatDisplayStation(fromStation, "Origin"), "Mid Route", formatDisplayStation(toStation, "Destination")]
    }
  };
}

function buildLocalTrainSearch(from, to, date) {
  const fromStation = resolveSearchStation(from);
  const toStation = resolveSearchStation(to);
  const routeKey = fromStation && toStation
    ? `${String(fromStation.stationCode || "").trim().toUpperCase()}-${String(toStation.stationCode || "").trim().toUpperCase()}`
    : "";
  const route = routeKey && Object.prototype.hasOwnProperty.call(LOCAL_ROUTE_CATALOG, routeKey)
    ? cloneData(LOCAL_ROUTE_CATALOG[routeKey])
    : buildGenericTrainSearch(fromStation, toStation, date);

  if (!route.nextAlternative.date) {
    route.nextAlternative.date = getNextDateLabel(date, route.nextAlternative.dayOffset || 1);
  }

  return {
    journey: {
      from: formatDisplayStation(fromStation, from),
      to: formatDisplayStation(toStation, to),
      date
    },
    insight: route.insight,
    routeStations: route.stations || [],
    trains: route.trains,
    nextAlternative: route.nextAlternative,
    tracking: route.tracking || null
  };
}

function demoPnrStatus(pnr) {
  const lastDigit = Number(String(pnr).slice(-1));
  if (lastDigit % 3 === 0) {
    return {
      pnr,
      trainNumber: "12952",
      trainName: "Mumbai Rajdhani Express",
      chartStatus: "Chart Prepared",
      passengers: [
        { passenger: 1, bookingStatus: "CNF/B2/41", currentStatus: "CNF/B2/41" },
        { passenger: 2, bookingStatus: "CNF/B2/42", currentStatus: "CNF/B2/42" }
      ]
    };
  }

  if (lastDigit % 2 === 0) {
    return {
      pnr,
      trainNumber: "12260",
      trainName: "Sealdah Duronto",
      chartStatus: "Chart Not Prepared",
      passengers: [
        { passenger: 1, bookingStatus: "WL/35", currentStatus: "WL/12" }
      ]
    };
  }

  return {
    pnr,
    trainNumber: "12627",
    trainName: "Karnataka Express",
    chartStatus: "Chart Not Prepared",
    passengers: [
      { passenger: 1, bookingStatus: "RAC/18", currentStatus: "RAC/7" }
    ]
  };
}

function demoTrainSearch(from, to, date) {
  return {
    journey: { from, to, date },
    trains: [
      {
        trainNumber: "12951",
        trainName: "Mumbai Rajdhani",
        departure: "16:00",
        arrival: "08:15",
        duration: "16h 15m",
        fare: "₹2,955",
        availability: "Available",
        classes: ["3A", "2A", "1A"],
        tags: ["Fastest", "Food Included"]
      },
      {
        trainNumber: "12909",
        trainName: "NZM BDTS Garib Rath",
        departure: "17:15",
        arrival: "09:15",
        duration: "16h 00m",
        fare: "₹1,570",
        availability: "Limited seats",
        classes: ["3A"],
        tags: ["Budget"]
      },
      {
        trainNumber: "22221",
        trainName: "NZM CSMT Rajdhani",
        departure: "16:55",
        arrival: "11:50",
        duration: "18h 55m",
        fare: "₹2,650",
        availability: "WL/23",
        classes: ["3A", "2A"],
        tags: ["Waitlist"]
      }
    ]
  };
}

function demoTrainSearch(from, to, date) {
  return buildLocalTrainSearch(from, to, date);
}

function localTripPlan(query) {
  const [originRaw, destinationRaw] = String(query).split(/\s+to\s+/i);
  const origin = (originRaw || "your city").trim();
  const destination = (destinationRaw || query || "your destination").trim();
  return {
    title: `Smart plan for ${destination}`,
    summary: `A quick travel plan from ${origin} to ${destination} with simple train-first suggestions.`,
    sections: [
      {
        title: "Getting There",
        icon: "transport",
        details: [
          `Check overnight trains from ${origin} to ${destination} first for the best value.`,
          "Keep a backup sleeper or 3A option in case your preferred train waitlists quickly."
        ],
        tags: ["Train-first", "Budget-friendly"]
      },
      {
        title: "Stay Plan",
        icon: "stay",
        details: [
          `Book your first night close to the main station or city center in ${destination}.`,
          "Choose a place with early check-in if your train arrives in the morning."
        ],
        tags: ["Convenient", "Flexible"]
      },
      {
        title: "Day 1",
        icon: "sightseeing",
        details: [
          `Arrive, drop bags, and explore the top local area in ${destination}.`,
          "Keep food and local transport plans light on the first day."
        ],
        tags: ["Explore", "Easy pace"]
      },
      {
        title: "Day 2",
        icon: "food",
        details: [
          "Use local transport for one major attraction cluster and one food stop.",
          "Leave a 60-90 minute buffer before your return journey."
        ],
        tags: ["Food", "Buffer time"]
      }
    ]
  };
}

function getValue(source, keys, fallback = null) {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return fallback;
}

function normalizePnrResponse(raw, pnr) {
  const payload = raw.data || raw.body || raw;
  const passengers = Array.isArray(payload.passengerList)
    ? payload.passengerList.map((item, index) => ({
        passenger: index + 1,
        bookingStatus: getValue(item, ["bookingStatus", "booking_status"], "Unknown"),
        currentStatus: getValue(item, ["currentStatus", "current_status"], "Unknown")
      }))
    : Array.isArray(payload.passengers)
      ? payload.passengers
      : [];

  return {
    pnr,
    trainNumber: getValue(payload, ["trainNumber", "train_number"], "N/A"),
    trainName: getValue(payload, ["trainName", "train_name"], "Train status"),
    chartStatus: getValue(payload, ["chartStatus", "chart_status", "chartPrepared"], "Unavailable"),
    passengers
  };
}

function normalizeTrainSearchResponse(raw, journey) {
  const payload = raw.data || raw.body || raw;
  const list =
    (Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload.trains) && payload.trains) ||
    (Array.isArray(payload.result) && payload.result) ||
    (Array.isArray(payload) && payload) ||
    [];

  const trains = list.slice(0, 6).map((item) => ({
    trainNumber: getValue(item, ["trainNumber", "train_number", "number"], "N/A"),
    trainName: getValue(item, ["trainName", "train_name", "name"], "Train"),
    departure: getValue(item, ["departureTime", "from_std", "departure"], "TBD"),
    arrival: getValue(item, ["arrivalTime", "to_sta", "arrival"], "TBD"),
    duration: getValue(item, ["duration", "travel_time"], "Unavailable"),
    fare: getValue(item, ["fare", "minimum_fare", "price"], "Check IRCTC"),
    availability: getValue(item, ["availability", "availablity", "status"], "Check availability"),
    classes: Array.isArray(item.classs) ? item.classs : Array.isArray(item.classes) ? item.classes : [],
    tags: []
  }));

  return {
    journey,
    trains
  };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const message = data.message || data.error || `Request failed with ${response.status}`;
      throw new Error(message);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function buildNvidiaPrompt(query) {
  return [
    "You are a train travel planner for India.",
    "Return JSON only with this shape:",
    '{"title":"string","summary":"string","sections":[{"title":"string","icon":"transport|stay|food|sightseeing","details":["string"],"tags":["string"]}]}',
    "Keep it concise, practical, and train-focused.",
    `User request: ${query}`
  ].join("\n");
}

function extractAssistantText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.text === "string") return item.text;
        return "";
      })
      .join("");
  }
  return "";
}

function parseJsonObject(text) {
  const normalized = String(text || "").replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(normalized);
  } catch {
    const match = normalized.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("The model did not return valid JSON.");
  }
}

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    backend: "online",
    liveRailwayApiConfigured: Boolean(RAPIDAPI_KEY),
    nvidiaConfigured: Boolean(NVIDIA_API_KEY)
  });
});

app.get("/api/pnr-status", async (req, res) => {
  const pnr = String(req.query.pnr || "").trim();
  if (!/^\d{10}$/.test(pnr)) {
    return jsonError(res, 400, "Please provide a valid 10-digit PNR number.");
  }

  if (!RAPIDAPI_KEY) {
    return res.json({ success: true, source: "demo", data: demoPnrStatus(pnr), note: "Add RAPIDAPI_KEY for live PNR data." });
  }

  try {
    const raw = await fetchJson(`https://pnr-status-indian-railway.p.rapidapi.com/pnr-check?pnr_number=${encodeURIComponent(pnr)}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "pnr-status-indian-railway.p.rapidapi.com"
      }
    });

    res.json({ success: true, source: "live", data: normalizePnrResponse(raw, pnr) });
  } catch (error) {
    if (ALLOW_DEMO_DATA) {
      return res.json({
        success: true,
        source: "demo",
        data: demoPnrStatus(pnr),
        note: `Live PNR lookup failed, so demo data is being shown instead. ${error.message}`
      });
    }

    jsonError(res, 502, `Failed to fetch live PNR status. ${error.message}`);
  }
});

app.get("/api/search-trains", async (req, res) => {
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();
  const date = String(req.query.date || "").trim();

  if (!from || !to || !date) {
    return jsonError(res, 400, "Please provide from, to, and date values.");
  }

  if (normalizeText(from) === normalizeText(to)) {
    return jsonError(res, 400, "Choose different source and destination stations.");
  }

  res.json({
    success: true,
    source: "local",
    data: demoTrainSearch(from, to, date),
    note: "Showing RailMate booking knowledge with train options, food guidance, and next-train alternatives."
  });
});

app.get("/api/find-station", async (req, res) => {
  const query = String(req.query.query || "").trim();
  if (!query) {
    return jsonError(res, 400, "Please enter a place name.");
  }

  const localMatch = findStationFromQuery(query);
  if (localMatch.stationCode !== "N/A") {
    return res.json({ success: true, source: "local", data: localMatch });
  }

  res.json({
    success: true,
    source: "local",
    data: {
      stationName: "Not Found",
      stationCode: "N/A"
    },
    note: "Add more station mappings or a geocoding provider for wider coverage."
  });
});

app.get("/api/station-suggestions", async (req, res) => {
  const query = String(req.query.query || "").trim();
  const localSuggestions = searchStations(query).map((station) => ({
    label: `${station.stationName} (${station.stationCode})`,
    stationName: station.stationName,
    stationCode: station.stationCode,
    source: "local"
  }));

  try {
    const officialSuggestions = await fetchOfficialStationSuggestions(query);
    const data = officialSuggestions.length ? officialSuggestions : localSuggestions;
    return res.json({
      success: true,
      source: officialSuggestions.length ? "official-indianrail" : "local",
      data
    });
  } catch {
    res.json({
      success: true,
      source: "local",
      data: localSuggestions
    });
  }
});

app.post("/api/plan-trip", async (req, res) => {
  const query = String(req.body.query || "").trim();
  if (!query) {
    return jsonError(res, 400, "Please enter a trip request.");
  }

  if (!NVIDIA_API_KEY) {
    return res.json({ success: true, source: "demo", data: localTripPlan(query), note: "Add NVIDIA_API_KEY for AI-generated itineraries." });
  }

  try {
    const raw = await fetchJson("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: buildNvidiaPrompt(query)
          }
        ]
      })
    });

    const content = extractAssistantText(raw.choices?.[0]?.message?.content);
    const parsed = parseJsonObject(content);
    res.json({ success: true, source: "nvidia", data: parsed });
  } catch (error) {
    if (ALLOW_DEMO_DATA) {
      return res.json({
        success: true,
        source: "demo",
        data: localTripPlan(query),
        note: `NVIDIA itinerary generation failed, so a local fallback plan is being shown instead. ${error.message}`
      });
    }

    jsonError(res, 502, `Failed to generate trip plan. ${error.message}`);
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`RailMate is running at http://localhost:${PORT}`);
});
