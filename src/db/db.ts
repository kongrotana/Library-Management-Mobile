import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("library.db");

export type Book = {
  id: number;
  title: string;
  author: string;
  qty: number;
  image_uri: string | null;
};
export type Member = { id: number; name: string; phone: string };
export type Staff  = { id: number; username: string; password: string; role: string };

export type LoanRow = {
  id: number;
  book_id: number;
  member_id: number;
  loan_date: string;
  due_date: string;
  returned_at: string | null;
  received_by: string | null;
  book_title: string;
  member_name: string;
};

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initDb() {
  try { db.execSync("PRAGMA journal_mode = WAL;"); } catch {}
  try { db.execSync("PRAGMA foreign_keys = ON;");  } catch {}

  db.execSync(`CREATE TABLE IF NOT EXISTS books (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    author    TEXT    NOT NULL,
    qty       INTEGER NOT NULL DEFAULT 1,
    image_uri TEXT
  );`);

  try { db.execSync("ALTER TABLE books ADD COLUMN image_uri TEXT;"); } catch {}

  db.execSync(`CREATE TABLE IF NOT EXISTS members (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    phone TEXT NOT NULL
  );`);

  db.execSync(`CREATE TABLE IF NOT EXISTS loans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL,
    member_id   INTEGER NOT NULL,
    loan_date   TEXT    NOT NULL,
    due_date    TEXT    NOT NULL,
    returned_at TEXT,
    received_by TEXT,
    FOREIGN KEY(book_id)   REFERENCES books(id),
    FOREIGN KEY(member_id) REFERENCES members(id)
  );`);

  try { db.execSync("ALTER TABLE loans ADD COLUMN received_by TEXT;"); } catch {}

  db.execSync(`CREATE TABLE IF NOT EXISTS staff (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role     TEXT NOT NULL DEFAULT 'staff'
  );`);

  const count = db.getFirstSync<{ n: number }>("SELECT COUNT(*) as n FROM staff");
  if (!count || count.n === 0) {
    db.runSync(
      "INSERT INTO staff (username, password, role) VALUES (?, ?, ?)",
      ["admin", "1234", "admin"]
    );
  }
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
export function getStaffList(): Staff[] {
  return db.getAllSync<Staff>("SELECT * FROM staff ORDER BY id ASC");
}

export function getStaffByUsername(username: string): Staff | null {
  return db.getFirstSync<Staff>(
    "SELECT * FROM staff WHERE username = ?", [username]
  ) ?? null;
}

export function addStaff(username: string, password: string, role: string) {
  const exists = db.getFirstSync<{ n: number }>(
    "SELECT COUNT(*) as n FROM staff WHERE username = ?", [username]
  );
  if (exists && exists.n > 0) throw new Error("Username already exists");
  db.runSync(
    "INSERT INTO staff (username, password, role) VALUES (?, ?, ?)",
    [username.trim(), password, role]
  );
}

export function updateStaff(id: number, username: string, password: string, role: string) {
  const exists = db.getFirstSync<{ n: number }>(
    "SELECT COUNT(*) as n FROM staff WHERE username = ? AND id != ?", [username, id]
  );
  if (exists && exists.n > 0) throw new Error("Username already taken");
  db.runSync(
    "UPDATE staff SET username = ?, password = ?, role = ? WHERE id = ?",
    [username.trim(), password, role, id]
  );
}

export function deleteStaff(id: number) {
  const s = db.getFirstSync<Staff>("SELECT * FROM staff WHERE id = ?", [id]);
  if (s?.username === "admin") throw new Error("Cannot delete default admin");
  db.runSync("DELETE FROM staff WHERE id = ?", [id]);
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────
export function getBooks(): Book[] {
  return db.getAllSync<Book>("SELECT * FROM books ORDER BY id DESC");
}

export function getBook(id: number): Book | null {
  return db.getFirstSync<Book>("SELECT * FROM books WHERE id = ?", [id]) ?? null;
}

export function addBook(title: string, author: string, qty: number, imageUri?: string | null) {
  db.runSync(
    "INSERT INTO books (title, author, qty, image_uri) VALUES (?, ?, ?, ?)",
    [title, author, qty, imageUri ?? null]
  );
}

export function updateBook(id: number, title: string, author: string, qty: number, imageUri?: string | null) {
  db.runSync(
    "UPDATE books SET title = ?, author = ?, qty = ?, image_uri = ? WHERE id = ?",
    [title, author, qty, imageUri ?? null, id]
  );
}

export function deleteBook(id: number) {
  const active = db.getFirstSync<{ n: number }>(
    "SELECT COUNT(*) as n FROM loans WHERE book_id = ? AND returned_at IS NULL", [id]
  );
  if (active && active.n > 0) throw new Error("Cannot delete a book with active loans");
  db.runSync("DELETE FROM books WHERE id = ?", [id]);
}

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
export function getMembers(): Member[] {
  return db.getAllSync<Member>("SELECT * FROM members ORDER BY id DESC");
}

export function getMember(id: number): Member | null {
  return db.getFirstSync<Member>("SELECT * FROM members WHERE id = ?", [id]) ?? null;
}

export function addMember(name: string, phone: string) {
  db.runSync("INSERT INTO members (name, phone) VALUES (?, ?)", [name, phone]);
}

export function updateMember(id: number, name: string, phone: string) {
  db.runSync(
    "UPDATE members SET name = ?, phone = ? WHERE id = ?",
    [name, phone, id]
  );
}

export function deleteMember(id: number) {
  const active = db.getFirstSync<{ n: number }>(
    "SELECT COUNT(*) as n FROM loans WHERE member_id = ? AND returned_at IS NULL", [id]
  );
  if (active && active.n > 0) throw new Error("Cannot delete a member with active loans");
  db.runSync("DELETE FROM members WHERE id = ?", [id]);
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
export function getActiveLoans(): LoanRow[] {
  return db.getAllSync<LoanRow>(`
    SELECT l.id, l.book_id, l.member_id, l.loan_date, l.due_date,
           l.returned_at, l.received_by,
           b.title AS book_title, m.name AS member_name
    FROM loans l
    JOIN books   b ON b.id = l.book_id
    JOIN members m ON m.id = l.member_id
    WHERE l.returned_at IS NULL
    ORDER BY l.id DESC
  `);
}

// ─── Returns all completed loans (returned_at IS NOT NULL) ───────────────────
export function getLoanHistory(): LoanRow[] {
  return db.getAllSync<LoanRow>(`
    SELECT l.id, l.book_id, l.member_id, l.loan_date, l.due_date,
           l.returned_at, l.received_by,
           b.title AS book_title, m.name AS member_name
    FROM loans l
    JOIN books   b ON b.id = l.book_id
    JOIN members m ON m.id = l.member_id
    WHERE l.returned_at IS NOT NULL
    ORDER BY l.returned_at DESC
  `);
}

export function issueLoan(bookId: number, memberId: number, dueDateISO: string) {
  db.withTransactionSync(() => {
    const book = db.getFirstSync<Book>("SELECT * FROM books WHERE id = ?", [bookId]);
    if (!book)         throw new Error("Book not found");
    if (book.qty <= 0) throw new Error("Book not available (qty = 0)");
    const now = new Date().toISOString();
    db.runSync(
      "INSERT INTO loans (book_id, member_id, loan_date, due_date) VALUES (?, ?, ?, ?)",
      [bookId, memberId, now, dueDateISO]
    );
    db.runSync("UPDATE books SET qty = qty - 1 WHERE id = ?", [bookId]);
  });
}

export function returnLoan(loanId: number, returnedAt: string, receivedBy: string) {
  db.withTransactionSync(() => {
    const loan = db.getFirstSync<{ book_id: number }>(
      "SELECT book_id FROM loans WHERE id = ?", [loanId]
    );
    if (!loan) throw new Error("Loan not found");
    db.runSync(
      "UPDATE loans SET returned_at = ?, received_by = ? WHERE id = ?",
      [returnedAt, receivedBy, loanId]
    );
    db.runSync("UPDATE books SET qty = qty + 1 WHERE id = ?", [loan.book_id]);
  });
}