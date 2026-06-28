import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJZqdGvZdx9msdD7zELT81054yo38DtUk",
  authDomain: "healthhalo-a044a.firebaseapp.com",
  projectId: "healthhalo-a044a",
  storageBucket: "healthhalo-a044a.firebasestorage.app",
  messagingSenderId: "261295476274",
  appId: "1:261295476274:web:e8fc28292e924eebd0f62b",
  measurementId: "G-QNM796Q3NC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEMO_USERS = [
  {
    username: "superadmin",
    password: "SuperAdmin@2026",
    role: "super_admin",
    name: "Super Administrator",
    email: "superadmin@healthhalo.demo",
    isActive: true,
    loginMethod: "email",
  },
  {
    username: "doc0001",
    password: "Doctor@2026",
    role: "doctor",
    name: "Dr. John Smith",
    email: "doc0001@healthhalo.demo",
    isActive: true,
    loginMethod: "email",
  },
  {
    username: "icu0001",
    password: "Patient@2026",
    role: "patient",
    name: "Jane Doe",
    email: "icu0001@healthhalo.demo",
    isActive: true,
    loginMethod: "email",
  },
];

async function seedFirebaseUsers() {
  console.log("Starting Firebase user seeding...");
  
  for (const demoUser of DEMO_USERS) {
    try {
      console.log(`Processing user: ${demoUser.username} (${demoUser.role})`);
      
      const now = new Date().toISOString();
      let uid: string;
      
      // Try to create user in Firebase Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          demoUser.email,
          demoUser.password
        );
        uid = userCredential.user.uid;
        console.log(`✓ Created Firebase Auth user: ${demoUser.username}`);
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`⚠ User ${demoUser.username} already exists in Auth, updating Firestore...`);
          // Use a fixed UID for demo users based on username
          uid = `demo-${demoUser.username}`;
        } else {
          throw error;
        }
      }
      
      // Create/update user document in Firestore
      const userData = {
        id: uid,
        openId: uid,
        username: demoUser.username,
        name: demoUser.name,
        email: demoUser.email,
        phone: null,
        role: demoUser.role,
        isActive: demoUser.isActive,
        loginMethod: demoUser.loginMethod,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      };
      
      // Add role-specific data
      if (demoUser.role === "patient") {
        userData.patient = {
          patientId: demoUser.username.toUpperCase(),
          admissionDate: now,
          room: "ICU-101",
        };
      } else if (demoUser.role === "doctor") {
        userData.doctor = {
          doctorId: demoUser.username.toUpperCase(),
          specialization: "General Medicine",
          licenseNumber: "DOC-2026-001",
        };
      }
      
      await setDoc(doc(db, "users", uid), userData);
      console.log(`✓ Firestore document created/updated for: ${demoUser.username}`);
      
      // Sign out to prepare for next user creation
      await auth.signOut();
      
    } catch (error: any) {
      console.error(`✗ Error processing user ${demoUser.username}:`, error.message);
    }
  }
  
  console.log("Firebase user seeding complete!");
  console.log("\nDemo credentials:");
  console.log("Super Admin: superadmin / SuperAdmin@2026");
  console.log("Doctor: doc0001 / Doctor@2026");
  console.log("Patient: icu0001 / Patient@2026");
}

seedFirebaseUsers().catch(console.error);
