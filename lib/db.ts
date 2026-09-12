import fs from "fs";
import path from "path";

export interface DBUser {
  id: string;
  fullName: string;
  email: string;
  provider: "email" | "google";
  createdAt: string;
  lastLoginAt: string;
  role?: "admin" | "member";
}

export interface DBSubscriber {
  id: string;
  email: string;
  fullName: string;
  subscribedAt: string;
  source: string;
  status: "active" | "unsubscribed";
}

export interface DBLoginLog {
  id: string;
  userId?: string;
  email: string;
  fullName: string;
  provider: string;
  timestamp: string;
}

export interface DBEmailDispatch {
  id: string;
  type: "thank_you" | "invite" | "blast" | "preview" | "digital_workflow" | "direct_reply";
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyText: string;
  sentAt: string;
  status: "sent" | "preview" | "queued";
}

export interface DBVideoPlay {
  id: string;
  videoId: string;
  videoTitle: string;
  userEmail: string;
  userName: string;
  isSubscriber: boolean;
  timestamp: string;
}

export interface DBVideoStat {
  videoId: string;
  videoTitle: string;
  category: string;
  totalPlays: number;
  subscriberPlays: number;
  nonSubscriberPlays: number;
  lastPlayedAt: string | null;
}

export interface DBGameInquiry {
  id: string;
  fullName: string;
  email: string;
  category: string;
  question: string;
  timestamp: string;
  reply?: {
    text: string;
    repliedAt: string;
    adminEmail: string;
    subject?: string;
  };
  status?: "pending" | "replied";
}

export interface DBPdfDownload {
  id: string;
  pdfId: string;
  pdfTitle: string;
  fileName: string;
  category: string;
  fileSize: string;
  userEmail: string;
  userName: string;
  isSubscriber: boolean;
  timestamp: string;
}

export interface DBPdfStat {
  pdfId: string;
  pdfTitle: string;
  fileName: string;
  category: string;
  fileSize: string;
  totalDownloads: number;
  subscriberDownloads: number;
  nonSubscriberDownloads: number;
  lastDownloadedAt: string | null;
}

export interface NetworkDBData {
  users: DBUser[];
  subscribers: DBSubscriber[];
  loginLogs: DBLoginLog[];
  emailDispatches: DBEmailDispatch[];
  videoPlays?: DBVideoPlay[];
  videoStats?: Record<string, DBVideoStat>;
  gameInquiries?: DBGameInquiry[];
  pdfDownloads?: DBPdfDownload[];
  pdfStats?: Record<string, DBPdfStat>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "network_db.json");

const ADMIN_EMAILS = ["mrdulow12@gmail.com", "qse6209@gmail.com"];

export const BASE_PDF_STATS: Record<string, DBPdfStat> = {
  "plug-and-play-suite-vol1": {
    pdfId: "plug-and-play-suite-vol1",
    pdfTitle: "The Plug-And-Play Production Suite (Vol. 1)",
    fileName: "the_plug_and_play_production_suite_vol1.pdf",
    category: "T2I / I2V Blueprints",
    fileSize: "138 KB",
    totalDownloads: 0,
    subscriberDownloads: 0,
    nonSubscriberDownloads: 0,
    lastDownloadedAt: null,
  },
  "monster-master-set": {
    pdfId: "monster-master-set",
    pdfTitle: "Monster Master Set // Basic Character T2I & I2V",
    fileName: "basic_character_t2i_i2v.pdf",
    category: "Forensic Optics & JSON",
    fileSize: "118 KB",
    totalDownloads: 0,
    subscriberDownloads: 0,
    nonSubscriberDownloads: 0,
    lastDownloadedAt: null,
  },
};

export const BASE_VIDEO_STATS: Record<string, DBVideoStat> = {
  "in-every-section": {
    videoId: "in-every-section",
    videoTitle: "IN EVERY SECTION",
    category: "WEST FRESNO",
    totalPlays: 0,
    subscriberPlays: 0,
    nonSubscriberPlays: 0,
    lastPlayedAt: null,
  },
  "tha-hogg-channel": {
    videoId: "tha-hogg-channel",
    videoTitle: "THA HOGG // VISUAL CREATIONS",
    category: "OFFICIAL YOUTUBE",
    totalPlays: 0,
    subscriberPlays: 0,
    nonSubscriberPlays: 0,
    lastPlayedAt: null,
  },
  "tha-game-should-be-told": {
    videoId: "tha-game-should-be-told",
    videoTitle: "THA GAME SHOULD BE TOLD",
    category: "A.I. TUTORIAL",
    totalPlays: 0,
    subscriberPlays: 0,
    nonSubscriberPlays: 0,
    lastPlayedAt: null,
  },
  "scene-of-screams": {
    videoId: "scene-of-screams",
    videoTitle: "SCENE OF SCREAMS",
    category: "ORIGINAL FILMS",
    totalPlays: 0,
    subscriberPlays: 0,
    nonSubscriberPlays: 0,
    lastPlayedAt: null,
  },
};

// Initial baseline authentic administrative data
const DEFAULT_DATA: NetworkDBData = {
  users: [
    {
      id: "usr_admin_dulow",
      fullName: "Tha Hogg",
      email: "mrdulow12@gmail.com",
      provider: "google",
      createdAt: "2026-08-01T12:00:00.000Z",
      lastLoginAt: new Date().toISOString(),
      role: "admin",
    },
    {
      id: "usr_admin_qse",
      fullName: "Quarter Spoon Executive",
      email: "qse6209@gmail.com",
      provider: "google",
      createdAt: "2026-08-10T15:30:00.000Z",
      lastLoginAt: new Date().toISOString(),
      role: "admin",
    },
  ],
  subscribers: [
    {
      id: "sub_1",
      email: "mrdulow12@gmail.com",
      fullName: "Tha Hogg",
      subscribedAt: "2026-08-01T12:05:00.000Z",
      source: "Founding List",
      status: "active",
    },
    {
      id: "sub_2",
      email: "qse6209@gmail.com",
      fullName: "Quarter Spoon Executive",
      subscribedAt: "2026-08-10T15:35:00.000Z",
      source: "Founding List",
      status: "active",
    },
  ],
  loginLogs: [],
  emailDispatches: [],
  videoStats: { ...BASE_VIDEO_STATS },
  videoPlays: [],
  gameInquiries: [],
  pdfStats: { ...BASE_PDF_STATS },
  pdfDownloads: [],
};

function ensureDb(): NetworkDBData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
      return DEFAULT_DATA;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    const parsed: NetworkDBData = JSON.parse(content);
    let dirty = false;
    if (!parsed.videoStats) {
      parsed.videoStats = {};
      dirty = true;
    }
    for (const [k, v] of Object.entries(BASE_VIDEO_STATS)) {
      if (!parsed.videoStats[k]) {
        parsed.videoStats[k] = { ...v };
        dirty = true;
      }
    }
    if (!parsed.videoPlays) {
      parsed.videoPlays = [];
      dirty = true;
    }
    if (!parsed.gameInquiries) {
      parsed.gameInquiries = [];
      dirty = true;
    }
    if (!parsed.pdfStats) {
      parsed.pdfStats = {};
      dirty = true;
    }
    for (const [k, v] of Object.entries(BASE_PDF_STATS)) {
      if (!parsed.pdfStats[k]) {
        parsed.pdfStats[k] = { ...v };
        dirty = true;
      }
    }
    if (!parsed.pdfDownloads) {
      parsed.pdfDownloads = [];
      dirty = true;
    }
    if (dirty) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
      } catch {}
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database, falling back to in-memory:", err);
    return DEFAULT_DATA;
  }
}

function writeDb(data: NetworkDBData): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

export const db = {
  getAdminEmails(): string[] {
    return ADMIN_EMAILS;
  },

  isAdmin(email: string): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
  },

  getData(): NetworkDBData {
    return ensureDb();
  },

  // Users management
  getUsers(): DBUser[] {
    const data = ensureDb();
    return data.users;
  },

  recordUserLogin(payload: {
    id?: string;
    fullName: string;
    email: string;
    provider: "email" | "google";
  }): DBUser {
    const data = ensureDb();
    const normalizedEmail = payload.email.toLowerCase().trim();
    const now = new Date().toISOString();

    let user = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = {
        id: payload.id || `usr_${Math.random().toString(36).substring(2, 9)}`,
        fullName: payload.fullName || "Quarter Spoon Member",
        email: normalizedEmail,
        provider: payload.provider,
        createdAt: now,
        lastLoginAt: now,
        role: ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "member",
      };
      data.users.push(user);
    } else {
      user.lastLoginAt = now;
      if (payload.fullName && payload.fullName !== "Quarter Spoon Member") {
        user.fullName = payload.fullName;
      }
      user.provider = payload.provider;
    }

    // Add to login log
    const logEntry: DBLoginLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      provider: payload.provider === "google" ? "Google OAuth" : "Password",
      timestamp: now,
    };

    // Prepend to logs, keep last 100
    data.loginLogs = [logEntry, ...data.loginLogs].slice(0, 100);

    writeDb(data);
    return user;
  },

  // Tha Network Subscribers management
  getSubscribers(): DBSubscriber[] {
    const data = ensureDb();
    return data.subscribers;
  },

  isSubscribed(email: string): boolean {
    const data = ensureDb();
    const normalizedEmail = email.toLowerCase().trim();
    return data.subscribers.some(
      (s) => s.email.toLowerCase() === normalizedEmail && s.status === "active"
    );
  },

  addSubscriber(payload: {
    email: string;
    fullName?: string;
    source?: string;
  }): { subscriber: DBSubscriber; alreadySubscribed: boolean } {
    const data = ensureDb();
    const normalizedEmail = payload.email.toLowerCase().trim();
    const existing = data.subscribers.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      if (existing.status !== "active") {
        existing.status = "active";
        existing.subscribedAt = new Date().toISOString();
        writeDb(data);
      }
      return { subscriber: existing, alreadySubscribed: true };
    }

    // Lookup user profile if exists to populate full name
    const existingUser = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    const resolvedName = payload.fullName || existingUser?.fullName || "Tha Network VIP";

    const newSubscriber: DBSubscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      fullName: resolvedName,
      subscribedAt: new Date().toISOString(),
      source: payload.source || "Tha Network Web",
      status: "active",
    };

    data.subscribers.unshift(newSubscriber);
    writeDb(data);
    return { subscriber: newSubscriber, alreadySubscribed: false };
  },

  removeSubscriber(idOrEmail: string): boolean {
    const data = ensureDb();
    const target = idOrEmail.toLowerCase().trim();
    const item = data.subscribers.find(
      (s) => s.id === idOrEmail || s.email.toLowerCase() === target
    );
    if (!item) return false;

    item.status = "unsubscribed";
    return writeDb(data);
  },

  // Non-subscribers helper (registered users who haven't subscribed to Tha Network)
  getNonSubscribers(): DBUser[] {
    const data = ensureDb();
    const subEmailSet = new Set(
      data.subscribers
        .filter((s) => s.status === "active")
        .map((s) => s.email.toLowerCase().trim())
    );

    return data.users.filter(
      (user) => !subEmailSet.has(user.email.toLowerCase().trim())
    );
  },

  // Email dispatch record
  recordDispatch(dispatch: Omit<DBEmailDispatch, "id" | "sentAt">): DBEmailDispatch {
    const data = ensureDb();
    const entry: DBEmailDispatch = {
      id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sentAt: new Date().toISOString(),
      ...dispatch,
    };

    data.emailDispatches.unshift(entry);
    writeDb(data);
    return entry;
  },

  getEmailDispatches(): DBEmailDispatch[] {
    const data = ensureDb();
    return data.emailDispatches;
  },

  // Video Play Telemetry
  recordVideoPlay(payload: {
    videoId: string;
    videoTitle: string;
    userEmail?: string;
    userName?: string;
    isSubscriber?: boolean;
    category?: string;
  }): { play: DBVideoPlay; stat: DBVideoStat } {
    const data = ensureDb();
    if (!data.videoPlays) data.videoPlays = [];
    if (!data.videoStats) data.videoStats = {};

    const now = new Date().toISOString();
    const email = (payload.userEmail || "anonymous@member.qsn").toLowerCase().trim();
    const isSub = payload.isSubscriber ?? db.isSubscribed(email);

    // Record individual play event
    const play: DBVideoPlay = {
      id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      videoId: payload.videoId,
      videoTitle: payload.videoTitle,
      userEmail: email,
      userName: payload.userName || "Quarter Spoon Member",
      isSubscriber: isSub,
      timestamp: now,
    };

    data.videoPlays.unshift(play);
    if (data.videoPlays.length > 500) {
      data.videoPlays = data.videoPlays.slice(0, 500);
    }

    // Update aggregate counters per video
    if (!data.videoStats[payload.videoId]) {
      const base = BASE_VIDEO_STATS[payload.videoId];
      data.videoStats[payload.videoId] = base
        ? { ...base }
        : {
            videoId: payload.videoId,
            videoTitle: payload.videoTitle,
            category: payload.category || "ARCHIVE",
            totalPlays: 0,
            subscriberPlays: 0,
            nonSubscriberPlays: 0,
            lastPlayedAt: now,
          };
    }

    const stat = data.videoStats[payload.videoId];
    stat.totalPlays += 1;
    stat.lastPlayedAt = now;
    if (isSub) {
      stat.subscriberPlays += 1;
    } else {
      stat.nonSubscriberPlays += 1;
    }

    writeDb(data);
    return { play, stat };
  },

  getVideoStats(): DBVideoStat[] {
    const data = ensureDb();
    return Object.values(data.videoStats || BASE_VIDEO_STATS);
  },

  getRecentVideoPlays(limit = 40): DBVideoPlay[] {
    const data = ensureDb();
    return (data.videoPlays || []).slice(0, limit);
  },

  // "Get U Some Game" Question & Inquiry logging
  recordGameInquiry(inquiry: Omit<DBGameInquiry, "id" | "timestamp">): DBGameInquiry {
    const data = ensureDb();
    if (!data.gameInquiries) data.gameInquiries = [];

    const entry: DBGameInquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...inquiry,
    };

    data.gameInquiries.unshift(entry);
    writeDb(data);
    return entry;
  },

  getGameInquiries(limit = 50): DBGameInquiry[] {
    const data = ensureDb();
    return (data.gameInquiries || []).slice(0, limit);
  },

  updateInquiryReply(
    inquiryId: string,
    reply: { text: string; repliedAt: string; adminEmail: string; subject?: string }
  ): DBGameInquiry | null {
    const data = ensureDb();
    if (!data.gameInquiries) return null;

    const inquiry = data.gameInquiries.find((inq) => inq.id === inquiryId);
    if (!inquiry) return null;

    inquiry.reply = reply;
    inquiry.status = "replied";
    writeDb(data);
    return inquiry;
  },

  // PDF Downloads Telemetry & Accurate Counter
  recordPdfDownload(payload: {
    pdfId: string;
    pdfTitle: string;
    fileName: string;
    category?: string;
    fileSize?: string;
    userEmail?: string;
    userName?: string;
    isSubscriber?: boolean;
  }): { download: DBPdfDownload; stat: DBPdfStat } {
    const data = ensureDb();
    if (!data.pdfDownloads) data.pdfDownloads = [];
    if (!data.pdfStats) {
      data.pdfStats = JSON.parse(JSON.stringify(BASE_PDF_STATS));
    }

    const now = new Date().toISOString();
    const email = (payload.userEmail || "anonymous@member.qsn").toLowerCase().trim();
    const isSub = payload.isSubscriber ?? db.isSubscribed(email);

    const download: DBPdfDownload = {
      id: `pdf_dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pdfId: payload.pdfId,
      pdfTitle: payload.pdfTitle,
      fileName: payload.fileName,
      category: payload.category || "Digital Asset",
      fileSize: payload.fileSize || "PDF",
      userEmail: email,
      userName: payload.userName || "Quarter Spoon Member",
      isSubscriber: isSub,
      timestamp: now,
    };

    data.pdfDownloads.unshift(download);
    if (data.pdfDownloads.length > 500) {
      data.pdfDownloads = data.pdfDownloads.slice(0, 500);
    }

    const pdfStats: Record<string, DBPdfStat> =
      data.pdfStats || (data.pdfStats = JSON.parse(JSON.stringify(BASE_PDF_STATS)));

    if (!pdfStats[payload.pdfId]) {
      pdfStats[payload.pdfId] = {
        pdfId: payload.pdfId,
        pdfTitle: payload.pdfTitle,
        fileName: payload.fileName,
        category: payload.category || "Digital Asset",
        fileSize: payload.fileSize || "PDF",
        totalDownloads: 0,
        subscriberDownloads: 0,
        nonSubscriberDownloads: 0,
        lastDownloadedAt: null,
      };
    }

    const stat = pdfStats[payload.pdfId];
    stat.totalDownloads += 1;
    stat.lastDownloadedAt = now;
    if (isSub) {
      stat.subscriberDownloads += 1;
    } else {
      stat.nonSubscriberDownloads += 1;
    }

    writeDb(data);
    return { download, stat };
  },

  getPdfStats(): DBPdfStat[] {
    const data = ensureDb();
    if (!data.pdfStats) {
      data.pdfStats = JSON.parse(JSON.stringify(BASE_PDF_STATS));
      writeDb(data);
    }
    return Object.values(data.pdfStats || {});
  },

  getRecentPdfDownloads(limit = 40): DBPdfDownload[] {
    const data = ensureDb();
    return (data.pdfDownloads || []).slice(0, limit);
  },
};
