import { User } from "@/types";

const indianNames = [
  "Aarav Sharma", "Vihaan Verma", "Aditya Gupta", "Sai Patel", "Arjun Singh",
  "Siddharth Kumar", "Rohan Das", "Dhruv Reddy", "Kabir Joshi", "Riyansh Chauhan",
  "Kiara Nair", "Aadhya Bose", "Ananya Rao", "Diya Mishra", "Myra Pandey",
  "Suhana Yadav", "Pari Malhotra", "Kritika Kapoor", "Riya Mehta", "Avni Chopra",
  "Rahul Sharma", "Amit Verma", "Neha Gupta", "Pooja Patel", "Sneha Singh",
  "Anjali Kumar", "Vikram Das", "Rajesh Reddy", "Sunita Joshi", "Kiran Chauhan",
  "Devansh Trivedi", "Ishaan Bhatia", "Advait Saxena", "Manish Tiwari", "Gaurav Agarwal",
  "Naveen Khatri", "Pranav Dubey", "Varun Sethi", "Karan Ahuja", "Harsh Vardhan",
  "Meera Singhania", "Tanya Sen", "Shruti Iyer", "Kavya Pillai", "Simran Kaur",
  "Navya Deshmukh", "Tanvi Kulkarni", "Isha Bhatnagar", "Radhika Mathur", "Bhavna Shukla",
  "Alok Pandey", "Deepak Rawat", "Suresh Menon", "Manoj Nambiar", "Pankaj Jain",
  "Vikas Choudhary", "Chetan Bhatt", "Ashish Mahajan", "Rameshwar Prasad", "Gurpreet Singh"
];

const cities = [
  "Ayodhya", "Varanasi", "Mathura", "Vrindavan", "Haridwar", "Rishikesh", "Ujjain",
  "Jaipur", "Delhi", "Mumbai", "Pune", "Lucknow", "Ahmedabad", "Indore", "Bangalore",
  "Amritsar", "Nagpur", "Kolkata", "Hyderabad", "Chandigarh"
];

const languages: ("Hindi" | "English" | "Punjabi")[] = ["Hindi", "English", "Punjabi"];

// Seeded pseudorandom generator for deterministic data
let seed = 42;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export let mockUsersList: User[] = Array.from({ length: 60 }).map((_, index) => {
  const id = index + 1;
  const name = indianNames[index % indianNames.length];
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}${id}@example.com`;
  const phone = `${Math.floor(6 + random() * 4)}${Math.floor(100000000 + random() * 900000000)}`;
  const city = cities[Math.floor(random() * cities.length)];
  const language = languages[Math.floor(random() * languages.length)];
  const status: "active" | "disabled" = random() > 0.15 ? "active" : "disabled";
  const daysAgo = Math.floor(random() * 90);
  const joinedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const sankalpCount = Math.floor(random() * 6);
  const orderCount = Math.floor(random() * 5);

  return {
    id,
    name,
    phone,
    email,
    city,
    language,
    status,
    joinedAt,
    sankalpCount,
    orderCount,
  };
});
