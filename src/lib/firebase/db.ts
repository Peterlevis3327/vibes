import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./client";

// Generic fetch function with fallback
export async function fetchWithFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    // If db is not initialized properly (e.g., missing env vars), this might fail
    if (!db) return fallback;
    const result = await fetcher();
    
    // If it's an array and empty, we might want to return fallback if we rely on initial data
    if (Array.isArray(result) && result.length === 0) {
        return fallback;
    }
    
    // If it's an object and null/undefined, return fallback
    if (!result) {
        return fallback;
    }
    
    return result;
  } catch (error) {
    console.warn("Firestore fetch failed, using fallback data:", error);
    return fallback;
  }
}

// Example specific fetchers
export async function getHomePageData() {
    return fetchWithFallback(async () => {
        const docRef = doc(db, "pages", "home");
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    }, {
        availabilityBadge: "",
        heroHeadline: "",
        heroSubheadline: "",
        primaryCtaText: "",
        secondaryCtaText: ""
    });
}

export async function getPortfolioProjects() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "portfolio"), where("status", "==", "Published"), orderBy("year", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getAllPortfolioProjects() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "portfolio"), orderBy("year", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getProjectBySlug(slug: string) {
    return fetchWithFallback(async () => {
        const docRef = doc(db, "portfolio", slug);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
    }, null);
}

export async function getPosts() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "posts"), where("status", "==", "Published"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getPostBySlug(slug: string) {
    return fetchWithFallback(async () => {
        const docRef = doc(db, "posts", slug);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
    }, null);
}

export async function getAllPosts() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "posts"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getServices() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "services"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getAllServices() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "services"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getTestimonials() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "testimonials"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getAllTestimonials() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "testimonials"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getTeamMembers() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "team"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getAllTeamMembers() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "team"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getProcessSteps() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "process"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getAllProcessSteps() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "process"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getFaqs() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "faqs"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, [
        {
            id: "faq-1",
            question: "How long does a typical project take?",
            answer: "Most of our website projects take between 4-8 weeks from kickoff to launch. Mobile apps typically take 3-6 months depending on complexity.",
            status: "Published"
        },
        {
            id: "faq-2",
            question: "Do you provide ongoing support after launch?",
            answer: "Yes, we offer flexible retainer packages for ongoing support, maintenance, and iterative improvements to keep your digital product performing at its best.",
            status: "Published"
        },
        {
            id: "faq-3",
            question: "What is your pricing model?",
            answer: "We typically work on a fixed-bid basis for clearly scoped projects, or time-and-materials for ongoing product development. Minimum engagement starts at $10,000.",
            status: "Published"
        }
    ]);
}

export async function getAllFaqs() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, "faqs"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }, []);
}

export async function getGlobalSettings() {
    return fetchWithFallback(async () => {
        const q = query(collection(db, 'settings'));
        const snapshot = await getDocs(q);
        return snapshot.docs[0]?.data() || { enableAnalytics: false };
    }, {
        enableAnalytics: true,
        defaultSeoTitle: "Agency | Digital Product Studio",
        defaultSeoDescription: "We design and build websites and apps that deliver concrete outcomes.",
        primaryColor: "#0f172a", // Default dark accent for light mode
        secondaryColor: "#f1f5f9", // Default subtle secondary
        whatsappNumber: "+1234567890",
        whatsappMessage: "Hi, I'm interested in working with you!"
    });
}

import { addDoc, deleteDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function generateUniqueSlug(collectionName: string, baseSlug: string): Promise<string> {
  if (!db) return baseSlug;
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const docRef = doc(db, collectionName, slug);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function saveWithVersionHistory(collectionName: string, docId: string, newData: any) {
  // If no real DB is configured, just mock it
  if (!db) {
    console.log(`Mock save to ${collectionName}/${docId}`, newData);
    return;
  }
  
  const docRef = doc(db, collectionName, docId);
  try {
    const currentDoc = await getDoc(docRef);
    if (currentDoc.exists()) {
      // Save current version to _versions subcollection before overwriting
      const versionsRef = collection(docRef, "_versions");
      await addDoc(versionsRef, {
        ...currentDoc.data(),
        archivedAt: serverTimestamp(),
      });

      // Prune old versions if > 10
      const q = query(versionsRef, orderBy("archivedAt", "desc"));
      const snapshot = await getDocs(q);
      
      if (snapshot.size > 10) {
        // Delete all versions beyond the 10th
        const docsToDelete = snapshot.docs.slice(10);
        await Promise.all(docsToDelete.map(d => deleteDoc(d.ref)));
      }
    }
    
    // Save new data
    await setDoc(docRef, {
      ...newData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
  } catch (error) {
    console.error("Failed to save with version history:", error);
    throw error;
  }
}

export async function getDocumentVersions(collectionName: string, docId: string) {
  if (!db) return [];
  try {
    const docRef = doc(db, collectionName, docId);
    const versionsRef = collection(docRef, "_versions");
    const q = query(versionsRef, orderBy("archivedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return [];
  }
}
