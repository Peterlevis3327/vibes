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

import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// Example specific fetchers wrapped with React cache (for request deduplication) 
// and Next.js unstable_cache (for persistent data caching across requests)

export const getHomePageData = cache(
  unstable_cache(
    async () => {
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
    },
    ['homePageData'],
    { tags: ['pages'] }
  )
);

export const getPageData = cache(
  (pageId: string) => unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const docRef = doc(db, "pages", pageId);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docSnap.data() : null;
      }, {
          title: null,
          subtitle: null,
          headerBackgroundImage: { url: "", alt: "", caption: "", showCaption: false }
      });
    },
    [`pageData-${pageId}`],
    { tags: ['pages'] }
  )()
);


export const getPortfolioProjects = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "portfolio"), where("status", "==", "Published"), orderBy("year", "desc"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['portfolioProjects'],
    { tags: ['portfolio'] }
  )
);

export const getAllPortfolioProjects = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "portfolio"), orderBy("year", "desc"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allPortfolioProjects'],
    { tags: ['portfolio'] }
  )
);

export const getProjectBySlug = cache(
  (slug: string) => unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const docRef = doc(db, "portfolio", slug);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
      }, null);
    },
    [`project-${slug}`],
    { tags: ['portfolio'] }
  )()
);

export const getPosts = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "posts"), where("status", "==", "Published"), orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['posts'],
    { tags: ['posts'] }
  )
);

export const getPostBySlug = cache(
  (slug: string) => unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const docRef = doc(db, "posts", slug);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as any : null;
      }, null);
    },
    [`post-${slug}`],
    { tags: ['posts'] }
  )()
);

export const getAllPosts = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "posts"), orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allPosts'],
    { tags: ['posts'] }
  )
);

export const getServices = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "services"), where("status", "==", "Published"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['services'],
    { tags: ['services'] }
  )
);

export const getAllServices = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "services"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allServices'],
    { tags: ['services'] }
  )
);

export const getTestimonials = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "testimonials"), where("status", "==", "Published"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['testimonials'],
    { tags: ['testimonials'] }
  )
);

export const getAllTestimonials = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "testimonials"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allTestimonials'],
    { tags: ['testimonials'] }
  )
);

export const getTeamMembers = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "team"), where("status", "==", "Published"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['teamMembers'],
    { tags: ['team'] }
  )
);

export const getAllTeamMembers = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "team"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allTeamMembers'],
    { tags: ['team'] }
  )
);

export const getProcessSteps = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "process"), where("status", "==", "Published"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['processSteps'],
    { tags: ['process'] }
  )
);

export const getAllProcessSteps = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "process"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allProcessSteps'],
    { tags: ['process'] }
  )
);

export const getFaqs = cache(
  unstable_cache(
    async () => {
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
    },
    ['faqs'],
    { tags: ['faqs'] }
  )
);

export const getAllFaqs = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, "faqs"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      }, []);
    },
    ['allFaqs'],
    { tags: ['faqs'] }
  )
);

export const getGlobalSettings = cache(
  unstable_cache(
    async () => {
      return fetchWithFallback(async () => {
          const q = query(collection(db, 'settings'));
          const snapshot = await getDocs(q);
          return snapshot.docs[0]?.data() || { enableAnalytics: false };
      }, {
          siteName: "Tech254",
          enableAnalytics: true,
          defaultSeoTitle: "Tech254 | Digital Product Studio",
          defaultSeoDescription: "We design and build websites and apps that deliver concrete outcomes.",
          primaryColor: "#0f172a", // Default dark accent for light mode
          secondaryColor: "#f1f5f9", // Default subtle secondary
          whatsappNumber: "+1234567890",
          whatsappMessage: "Hi, I'm interested in working with you!"
      });
    },
    ['globalSettings'],
    { tags: ['settings'] }
  )
);

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
    } catch (versionError) {
      console.warn("Version history archiving note (proceeding with main document save):", versionError);
    }
    
    // Save new data
    await setDoc(docRef, {
      ...newData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
  } catch (error) {
    console.error("Failed to save document:", error);
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
