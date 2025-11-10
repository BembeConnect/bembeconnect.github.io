/**
 * IndexedDB Setup für bembe-app
 * Stores: users, orders (Aufträge), submissions (Abrechnungen)
 */

export interface User {
  id: string; // personalNr
  name: string;
  personalNr: string;
  role: "PKL" | "MA"; // Parkettleger oder MA
}

export interface Order {
  id: string; // auftragsId (unique)
  auftragsNr: string;
  baustelle: string;
  personalNr: string; // wem zugewiesen
  datum: string; // creation date
  status: "offen" | "in-bearbeitung" | "abgeschlossen";
}

export interface Submission {
  id: string; // submissionId
  auftragsId: string;
  personalNr: string; // who submitted
  formData: Record<string, any>; // die ausgefüllten Formular-Daten
  submittedAt: string; // ISO timestamp
  status: "ausstehend" | "geprüft" | "genehmigt" | "mit-änderungen";
  notes?: string; // MA Notizen
  changes?: Record<string, any>; // MA Änderungen
  changedAt?: string; // wann MA zuletzt geändert hat
}

let db: IDBDatabase | null = null;

export async function initDb(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bembe-app", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Users store
      if (!database.objectStoreNames.contains("users")) {
        const userStore = database.createObjectStore("users", { keyPath: "id" });
        userStore.createIndex("personalNr", "personalNr", { unique: true });
      }

      // Orders store
      if (!database.objectStoreNames.contains("orders")) {
        const orderStore = database.createObjectStore("orders", { keyPath: "id" });
        orderStore.createIndex("auftragsNr", "auftragsNr", { unique: true });
        orderStore.createIndex("personalNr", "personalNr", { unique: false });
        orderStore.createIndex("status", "status", { unique: false });
      }

      // Submissions store
      if (!database.objectStoreNames.contains("submissions")) {
        const subStore = database.createObjectStore("submissions", { keyPath: "id" });
        subStore.createIndex("auftragsId", "auftragsId", { unique: false });
        subStore.createIndex("personalNr", "personalNr", { unique: false });
        subStore.createIndex("status", "status", { unique: false });
        subStore.createIndex("submittedAt", "submittedAt", { unique: false });
      }
    };
  });
}

export async function seedDemoData() {
  const database = await initDb();

  const demoUsers: User[] = [
    { id: "001", name: "Max Mustermann", personalNr: "001", role: "PKL" },
    { id: "002", name: "Anna Schmidt", personalNr: "002", role: "PKL" },
    { id: "100", name: "Thomas Weber", personalNr: "100", role: "MA" },
  ];

  const demoOrders: Order[] = [
    {
      id: "order-1",
      auftragsNr: "A-2024-001",
      baustelle: "Schulstr. 5, Berlin",
      personalNr: "001",
      datum: new Date().toISOString(),
      status: "offen",
    },
    {
      id: "order-2",
      auftragsNr: "A-2024-002",
      baustelle: "Hauptplatz 10, München",
      personalNr: "001",
      datum: new Date().toISOString(),
      status: "offen",
    },
    {
      id: "order-3",
      auftragsNr: "A-2024-003",
      baustelle: "Marktstr. 7, Hamburg",
      personalNr: "002",
      datum: new Date().toISOString(),
      status: "offen",
    },
  ];

  // Einfügen wenn noch nicht vorhanden
  for (const user of demoUsers) {
    const tx = database.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    await new Promise((resolve, reject) => {
      const req = store.get(user.id);
      req.onsuccess = () => {
        if (!req.result) {
          store.add(user);
        }
        resolve(null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  for (const order of demoOrders) {
    const tx = database.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    await new Promise((resolve, reject) => {
      const req = store.get(order.id);
      req.onsuccess = () => {
        if (!req.result) {
          store.add(order);
        }
        resolve(null);
      };
      req.onerror = () => reject(req.error);
    });
  }
}

// Helper: Query functions
export async function getOrdersByPersonalNr(personalNr: string): Promise<Order[]> {
  const database = await initDb();
  const tx = database.transaction("orders", "readonly");
  const index = tx.objectStore("orders").index("personalNr");

  return new Promise((resolve, reject) => {
    const req = index.getAll(personalNr);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissionsByPersonalNr(personalNr: string): Promise<Submission[]> {
  const database = await initDb();
  const tx = database.transaction("submissions", "readonly");
  const index = tx.objectStore("submissions").index("personalNr");

  return new Promise((resolve, reject) => {
    const req = index.getAll(personalNr);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissionsByStatus(status: Submission["status"]): Promise<Submission[]> {
  const database = await initDb();
  const tx = database.transaction("submissions", "readonly");
  const index = tx.objectStore("submissions").index("status");

  return new Promise((resolve, reject) => {
    const req = index.getAll(status);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addSubmission(submission: Submission): Promise<string> {
  const database = await initDb();
  const tx = database.transaction("submissions", "readwrite");
  const store = tx.objectStore("submissions");

  return new Promise((resolve, reject) => {
    const req = store.add(submission);
    req.onsuccess = () => resolve(req.result as string);
    req.onerror = () => reject(req.error);
  });
}

export async function updateSubmission(submission: Submission): Promise<void> {
  const database = await initDb();
  const tx = database.transaction("submissions", "readwrite");
  const store = tx.objectStore("submissions");

  return new Promise((resolve, reject) => {
    const req = store.put(submission);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  const database = await initDb();
  const tx = database.transaction("submissions", "readonly");
  const store = tx.objectStore("submissions");

  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const database = await initDb();
  const tx = database.transaction("orders", "readonly");
  const store = tx.objectStore("orders");

  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addOrder(order: Order): Promise<string> {
  const database = await initDb();
  const tx = database.transaction("orders", "readwrite");
  const store = tx.objectStore("orders");

  return new Promise((resolve, reject) => {
    const req = store.add(order);
    req.onsuccess = () => resolve(req.result as string);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllOrders(): Promise<Order[]> {
  const database = await initDb();
  const tx = database.transaction("orders", "readonly");
  const store = tx.objectStore("orders");

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
