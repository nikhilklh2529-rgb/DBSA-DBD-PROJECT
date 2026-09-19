import { useEffect, useMemo, useState } from "react";
import "./App.css";

const seedBooks = [
  { id: "RF-001", title: "Data Structures & Algorithms", author: "Narasimha Karumanchi", category: "Computer Science", status: "Available", borrower: "" },
  { id: "RF-002", title: "Operating System Concepts", author: "Silberschatz", category: "Computer Science", status: "Issued", borrower: "Priya Sharma" },
  { id: "RF-003", title: "Computer Networks", author: "Andrew S. Tanenbaum", category: "Networking", status: "Available", borrower: "" },
  { id: "RF-004", title: "Database System Concepts", author: "Korth", category: "Database", status: "Issued", borrower: "Rahul Kumar" },
  { id: "RF-005", title: "Clean Code", author: "Robert C. Martin", category: "Programming", status: "Available", borrower: "" },
  { id: "RF-006", title: "Artificial Intelligence", author: "Stuart Russell", category: "AI", status: "Available", borrower: "" },
];

const seedStudents = [
  { id: "2520030001", name: "Arjun Reddy", email: "arjun@college.edu", books: 2, status: "Active" },
  { id: "2520030002", name: "Priya Sharma", email: "priya@college.edu", books: 2, status: "Active" },
  { id: "2520030003", name: "Rahul Kumar", email: "rahul@college.edu", books: 1, status: "Active" },
  { id: "2520030004", name: "Sneha Reddy", email: "sneha@college.edu", books: 0, status: "Active" },
];

const seedTransactions = [
  { id: 1, student: "Arjun Reddy", book: "Data Structures & Algorithms", action: "Issued", time: "10:42 AM", date: "Today", status: "Success" },
  { id: 2, student: "Priya Sharma", book: "Operating System Concepts", action: "Returned", time: "10:28 AM", date: "Today", status: "Success" },
  { id: 3, student: "Rahul Kumar", book: "Computer Networks", action: "Issued", time: "09:56 AM", date: "Today", status: "Success" },
  { id: 4, student: "Sneha Reddy", book: "Database System Concepts", action: "Returned", time: "09:31 AM", date: "Today", status: "Success" },
];

const navItems = [
  ["Dashboard", "⌂"],
  ["Books", "▣"],
  ["Students", "♙"],
  ["RFID Scanner", "◉"],
  ["Transactions", "↔"],
  ["Analytics", "◒"],
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [books, setBooks] = useState(seedBooks);
  const [students, setStudents] = useState(seedStudents);
  const [transactions, setTransactions] = useState(seedTransactions);
  const [bookSearch, setBookSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activityRange, setActivityRange] = useState("7");
  const [studentSearch, setStudentSearch] = useState("");
  const [scannerState, setScannerState] = useState("ready");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexa-library-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.books) setBooks(data.books);
        if (data.students) setStudents(data.students);
        if (data.transactions) setTransactions(data.transactions);
      } catch {
        // Keep starter data if saved data is invalid.
      }
    }
    const theme = localStorage.getItem("nexa-library-theme");
    if (theme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("nexa-library-data", JSON.stringify({ books, students, transactions }));
  }, [books, students, transactions]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("nexa-library-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const availableBooks = books.filter((b) => b.status === "Available").length;
  const issuedBooks = books.filter((b) => b.status === "Issued").length;
  const activeStudents = students.filter((s) => s.status === "Active").length;

  const filteredBooks = useMemo(() => {
    const q = bookSearch.toLowerCase().trim();
    return books.filter((b) => {
      const matchesSearch = !q || [b.id, b.title, b.author, b.category, b.borrower].some((x) => x.toLowerCase().includes(q));
      const matchesCategory = categoryFilter === "All Categories" || b.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || b.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, bookSearch, categoryFilter, statusFilter]);

  const filteredStudents = students.filter((s) =>
    [s.id, s.name, s.email].some((x) => x.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const globalResults = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return [];
    return [
      ...books.filter((b) => `${b.title} ${b.author} ${b.id}`.toLowerCase().includes(q)).map((b) => ({ type: "Book", label: b.title, meta: b.id })),
      ...students.filter((s) => `${s.name} ${s.id}`.toLowerCase().includes(q)).map((s) => ({ type: "Student", label: s.name, meta: s.id })),
      ...navItems.filter(([name]) => name.toLowerCase().includes(q)).map(([name]) => ({ type: "Page", label: name, meta: "Open page" })),
    ].slice(0, 8);
  }, [globalSearch, books, students]);

  const showToast = (message) => setToast(message);

  const addTransaction = (student, book, action) => {
    const now = new Date();
    setTransactions((prev) => [{
      id: Date.now(),
      student,
      book,
      action,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: "Today",
      status: "Success",
    }, ...prev]);
  };

  const addBook = (data) => {
    if (books.some((b) => b.id.toLowerCase() === data.id.toLowerCase())) {
      showToast("RFID tag already exists.");
      return;
    }
    setBooks((prev) => [{ ...data, borrower: "" }, ...prev]);
    setModal(null);
    showToast("Book added successfully.");
  };

  const registerStudent = (data) => {
    if (students.some((s) => s.id === data.id)) {
      showToast("Student ID already exists.");
      return;
    }
    setStudents((prev) => [{ ...data, books: 0, status: "Active" }, ...prev]);
    setModal(null);
    showToast("Student registered successfully.");
  };

  const issueBook = (book, student) => {
    if (book.status === "Issued") {
      showToast("This book is already issued.");
      return;
    }
    setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, status: "Issued", borrower: student.name } : b));
    setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, books: s.books + 1 } : s));
    addTransaction(student.name, book.title, "Issued");
    setModal(null);
    setSelectedBook(null);
    showToast(`${book.title} issued to ${student.name}.`);
  };

  const returnBook = (book) => {
    if (book.status !== "Issued") {
      showToast("This book is already available.");
      return;
    }
    const borrower = book.borrower || "Unknown student";
    setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, status: "Available", borrower: "" } : b));
    setStudents((prev) => prev.map((s) => s.name === borrower ? { ...s, books: Math.max(0, s.books - 1) } : s));
    addTransaction(borrower, book.title, "Returned");
    setModal(null);
    setSelectedBook(null);
    showToast(`${book.title} returned successfully.`);
  };

  const deleteBook = (book) => {
    if (book.status === "Issued") {
      showToast("Return the book before deleting it.");
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== book.id));
    setModal(null);
    showToast("Book removed.");
  };

  const simulateScan = () => {
    setScannerState("scanning");
    setTimeout(() => {
      const target = books.find((b) => b.status === "Available") || books[0];
      setScannerState("found");
      setSelectedBook(target);
      showToast(`RFID detected: ${target.id}`);
    }, 1400);
  };

  const exportReport = () => {
    const rows = [["RFID", "Book", "Author", "Category", "Status", "Borrower"], ...books.map((b) => [b.id, b.title, b.author, b.category, b.status, b.borrower || ""])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexa-library-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Library report exported.");
  };

  const resetDemo = () => {
    setBooks(seedBooks);
    setStudents(seedStudents);
    setTransactions(seedTransactions);
    showToast("Demo data restored.");
  };

  const renderDashboard = () => (
    <>
      <PageHeader eyebrow="LIBRARY CONTROL CENTER" title="Good evening, Librarian ✦" subtitle="Monitor RFID activity, book circulation and members from one place."
        action={<button className="primary-button" onClick={() => setModal({ type: "addBook" })}>＋ Add New Book</button>} />

      <div className="stats-grid">
        <Stat label="Total Books" value={books.length} icon="▣" note="Live collection" />
        <Stat label="Available" value={availableBooks} icon="✓" tone="green" note={`${Math.round((availableBooks / Math.max(books.length, 1)) * 100)}% of collection`} />
        <Stat label="Currently Issued" value={issuedBooks} icon="↗" tone="orange" note="Active circulation" />
        <Stat label="Active Students" value={activeStudents} icon="♙" tone="purple" note="Registered members" />
      </div>

      <div className="dashboard-grid">
        <section className="rfid-card">
          <div className="card-heading">
            <div><span className="live-label"><i className="live-dot" /> LIVE SYSTEM</span><h2>RFID Access Terminal</h2><p>{scannerState === "scanning" ? "Scanning for a registered tag..." : "Ready to identify your next book."}</p></div>
            <span className="signal">◉ RFID</span>
          </div>
          <ScannerVisual state={scannerState} />
          <div className="scanner-status"><strong>{scannerState === "scanning" ? "Reader is scanning" : "RFID reader is online"}</strong><span>Use the scanner page to issue or return books.</span></div>
          <button className="scan-button" onClick={() => setActivePage("RFID Scanner")}>Open RFID Scanner <span>→</span></button>
        </section>

        <section className="chart-card">
          <div className="card-heading"><div><span className="card-label">CIRCULATION</span><h2>Library Activity</h2></div>
            <select value={activityRange} onChange={(e) => setActivityRange(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select>
          </div>
          <div className="chart">
            <div className="chart-values"><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div>
            <div className="chart-area">{[1,2,3,4].map((x) => <div className={`chart-grid-line line-${x}`} key={x} />)}
              <div className={`chart-line range-${activityRange}`} />
              <div className="chart-points">{[34,52,43,72,58,86,65,92].map((h,i)=><span key={i} style={{bottom:`${h}%`}} />)}</div>
            </div>
          </div>
          <div className="chart-days">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=><span key={d}>{d}</span>)}</div>
          <div className="chart-legend"><span><i /> Book Issues</span><span><i className="returned" /> Returns</span></div>
        </section>
      </div>

      <div className="content-grid">
        <section className="table-card">
          <div className="section-header"><div><span className="card-label">RECENT ACTIVITY</span><h2>Latest Transactions</h2></div><button className="text-button" onClick={() => setActivePage("Transactions")}>View all →</button></div>
          <div className="transaction-list">{transactions.slice(0,5).map((t)=><div className="transaction" key={t.id}>
            <div className="avatar">{t.student.charAt(0)}</div><div className="transaction-info"><strong>{t.student}</strong><span>{t.book}</span></div>
            <div className="transaction-action"><span className={t.action === "Issued" ? "issued" : "returned"}>{t.action}</span><small>{t.time}</small></div>
          </div>)}</div>
        </section>
        <section className="availability-card">
          <div className="section-header"><div><span className="card-label">COLLECTION</span><h2>Book Availability</h2></div></div>
          <div className="availability-circle"><div><strong>{Math.round((availableBooks / Math.max(books.length,1))*100)}%</strong><span>Available</span></div></div>
          <div className="availability-details"><div><span className="dot available-dot" />Available <strong>{availableBooks}</strong></div><div><span className="dot issued-dot" />Issued <strong>{issuedBooks}</strong></div></div>
        </section>
      </div>
    </>
  );

  const renderBooks = () => (
    <>
      <PageHeader eyebrow="COLLECTION MANAGEMENT" title="Books" subtitle="Search, add, issue, return and manage every RFID-tagged book."
        action={<button className="primary-button" onClick={() => setModal({ type: "addBook" })}>＋ Add New Book</button>} />
      <div className="toolbar">
        <div className="toolbar-search"><span>⌕</span><input value={bookSearch} onChange={(e)=>setBookSearch(e.target.value)} placeholder="Search title, author or RFID..." /></div>
        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}><option>All Categories</option>{[...new Set(books.map(b=>b.category))].map(c=><option key={c}>{c}</option>)}</select>
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}><option>All Status</option><option>Available</option><option>Issued</option></select>
      </div>
      <div className="result-count">{filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} shown</div>
      <div className="large-table-card"><table><thead><tr><th>RFID TAG</th><th>BOOK</th><th>AUTHOR</th><th>CATEGORY</th><th>STATUS</th><th>ACTION</th></tr></thead>
        <tbody>{filteredBooks.map(book=><tr key={book.id}><td><span className="rfid-tag">◉ {book.id}</span></td><td><strong>{book.title}</strong>{book.borrower && <small className="borrower">Issued to {book.borrower}</small>}</td><td>{book.author}</td><td><span className="category-pill">{book.category}</span></td><td><span className={`status-badge ${book.status.toLowerCase()}`}>● {book.status}</span></td><td><button className="more-button" onClick={()=>setSelectedBook(book)}>•••</button></td></tr>)}</tbody>
      </table>{filteredBooks.length===0 && <Empty text="No books match your search." />}</div>
    </>
  );

  const renderStudents = () => (
    <>
      <PageHeader eyebrow="MEMBER MANAGEMENT" title="Students" subtitle="Register members and track their current book activity."
        action={<button className="primary-button" onClick={() => setModal({ type: "addStudent" })}>＋ Register Student</button>} />
      <div className="toolbar"><div className="toolbar-search full"><span>⌕</span><input value={studentSearch} onChange={(e)=>setStudentSearch(e.target.value)} placeholder="Search student name, ID or email..." /></div></div>
      <div className="student-cards">{filteredStudents.map(s=><div className="student-card" key={s.id}>
        <div className="student-card-top"><div className="student-avatar">{initials(s.name)}</div><button className="student-menu" onClick={()=>setSelectedStudent(s)}>•••</button></div>
        <h3>{s.name}</h3><span className="student-id">{s.id}</span><span className="student-email">{s.email}</span>
        <div className="student-footer"><div><small>Books Issued</small><strong>{s.books}</strong></div><span className="member-status">{s.status}</span></div>
      </div>)}</div>
    </>
  );

  const renderScanner = () => (
    <>
      <PageHeader eyebrow="RFID CONTROL" title="RFID Scanner" subtitle="Simulate a connected RFID reader and process book circulation."
        action={<div className="reader-online"><i /> Reader Online</div>} />
      <div className="scanner-page-card">
        <div className="big-scanner"><ScannerVisual state={scannerState} big /></div>
        <div className="scanner-instructions"><span className="eyebrow">HOW IT WORKS</span><h2>Place an RFID tag near the reader</h2><p>The demo reader detects a registered tag and lets you issue or return the selected book.</p>
          <div className="scanner-steps"><Step n="01" text="Place RFID tag"/><Step n="02" text="Reader detects tag"/><Step n="03" text="Process record"/></div>
          <button className="primary-button" onClick={simulateScan} disabled={scannerState==="scanning"}>{scannerState==="scanning" ? "Scanning..." : "Simulate RFID Scan →"}</button>
          {scannerState==="found" && selectedBook && <div className="scan-result"><span className="success-icon">✓</span><div><strong>{selectedBook.title}</strong><small>{selectedBook.id} · {selectedBook.status}{selectedBook.borrower ? ` · ${selectedBook.borrower}` : ""}</small></div><button onClick={()=>setModal({type:selectedBook.status==="Available"?"issueBook":"returnBook"})}>Process →</button></div>}
        </div>
      </div>
    </>
  );

  const renderTransactions = () => (
    <>
      <PageHeader eyebrow="CIRCULATION" title="Transactions" subtitle="Track all book issue and return activity."
        action={<button className="secondary-button" onClick={exportReport}>⇩ Export Report</button>} />
      <div className="transaction-summary"><Summary label="Total Transactions" value={transactions.length}/><Summary label="Issued Today" value={transactions.filter(t=>t.action==="Issued").length}/><Summary label="Returned Today" value={transactions.filter(t=>t.action==="Returned").length}/><Summary label="Success Rate" value="100%"/></div>
      <div className="large-table-card"><table><thead><tr><th>STUDENT</th><th>BOOK</th><th>ACTION</th><th>TIME</th><th>STATUS</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td><div className="student-table"><div className="mini-avatar">{t.student.charAt(0)}</div><strong>{t.student}</strong></div></td><td>{t.book}</td><td><span className={t.action==="Issued"?"action-issued":"action-returned"}>{t.action}</span></td><td>{t.time}</td><td><span className="status-badge available">● {t.status}</span></td></tr>)}</tbody></table></div>
    </>
  );

  const renderAnalytics = () => {
    const categoryCounts = books.reduce((acc,b)=>(acc[b.category]=(acc[b.category]||0)+1,acc),{});
    const topCategories = Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]);
    return <>
      <PageHeader eyebrow="INSIGHTS" title="Analytics" subtitle="Live metrics calculated from your current demo data." />
      <div className="analytics-grid">
        <div className="analytics-card"><span className="card-label">TOTAL CIRCULATION</span><h2>{transactions.length}</h2><div className="analytics-change">↑ Live <span>recorded transactions</span></div><div className="mini-bars">{[35,55,45,72,58,82,65,92,70,88].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></div>
        <div className="analytics-card"><span className="card-label">RETURN RATE</span><h2>{transactions.length ? Math.round(transactions.filter(t=>t.action==="Returned").length/transactions.length*100) : 0}%</h2><div className="progress"><span style={{width:`${transactions.length ? Math.round(transactions.filter(t=>t.action==="Returned").length/transactions.length*100) : 0}%`}}/></div><div className="analytics-note">✓ Based on recorded transactions</div></div>
        <div className="analytics-card"><span className="card-label">COLLECTION MIX</span><h2>{topCategories[0]?.[0] || "—"}</h2><p>Largest category in current collection</p>{topCategories.slice(0,4).map(([cat,count])=><div className="popular-category" key={cat}><span/>{cat}<strong>{count}</strong></div>)}</div>
      </div>
      <div className="analytics-bottom"><div className="insight-card"><h3>Collection health</h3><p>{availableBooks} of {books.length} books are available. {issuedBooks} are currently circulating.</p><div className="health-bar"><span style={{width:`${availableBooks/Math.max(books.length,1)*100}%`}}/></div></div><div className="insight-card"><h3>Quick actions</h3><div className="quick-actions"><button onClick={()=>setModal({type:"addBook"})}>＋ Add book</button><button onClick={()=>setModal({type:"addStudent"})}>＋ Add student</button><button onClick={exportReport}>⇩ Export CSV</button><button onClick={resetDemo}>↻ Reset demo</button></div></div></div>
    </>;
  };

  const renderSettings = () => (
    <><PageHeader eyebrow="SYSTEM" title="Settings" subtitle="Customize the demo application and manage local data." />
      <div className="settings-grid"><div className="settings-card"><div><h3>Appearance</h3><p>Switch between light and dark interface.</p></div><button className={`toggle ${darkMode?"on":""}`} onClick={()=>setDarkMode(!darkMode)}><span/></button></div>
      <div className="settings-card"><div><h3>Local demo storage</h3><p>Your changes are saved in this browser using localStorage.</p></div><button className="secondary-button" onClick={resetDemo}>Reset Data</button></div>
      <div className="settings-card"><div><h3>Export collection</h3><p>Download the current book list as a CSV report.</p></div><button className="secondary-button" onClick={exportReport}>Export CSV</button></div></div>
    </>
  );

  const renderPage = () => {
    if (activePage==="Dashboard") return renderDashboard();
    if (activePage==="Books") return renderBooks();
    if (activePage==="Students") return renderStudents();
    if (activePage==="RFID Scanner") return renderScanner();
    if (activePage==="Transactions") return renderTransactions();
    if (activePage==="Analytics") return renderAnalytics();
    return renderSettings();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-logo"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 10.5C7 8.57 8.57 7 10.5 7H20c3.31 0 6 2.69 6 6v27c-1.75-2.25-4.55-3.7-7.9-3.7h-7.6C8.57 36.3 7 34.73 7 32.8V10.5Z"/><path d="M41 10.5C41 8.57 39.43 7 37.5 7H28c-3.31 0-6 2.69-6 6v27c1.75-2.25 4.55-3.7 7.9-3.7h7.6c1.93 0 3.5-1.57 3.5-3.5V10.5Z" opacity=".6"/><path d="M31 14c3.8 1.1 6.3 3.4 7.4 6.8M33.5 10.8c5.2 1.5 8.4 4.6 9.8 9.2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg></div><div className="brand-copy"><strong>NEXA</strong><span>RFID LIBRARY</span></div></div>
        <div className="menu-label">MAIN MENU</div>
        <nav>{navItems.map(([name,icon])=><button key={name} className={`nav-item ${activePage===name?"active":""}`} onClick={()=>setActivePage(name)}><span className="nav-icon">{icon}</span><span className="nav-text">{name}</span>{name==="RFID Scanner"&&<i className="nav-live"/>}</button>)}</nav>
        <div className="sidebar-divider"/><div className="menu-label">SYSTEM</div>
        <button className={`nav-item ${activePage==="Settings"?"active":""}`} onClick={()=>setActivePage("Settings")}><span className="nav-icon">⚙</span><span className="nav-text">Settings</span></button>
        <div className="sidebar-bottom"><div className="system-card"><div className="system-icon">✓</div><div><strong>System Online</strong><span>RFID Reader Connected</span></div></div><div className="profile"><div className="profile-avatar">L</div><div><strong>Librarian</strong><span>Administrator</span></div><span className="profile-more">•••</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb"><span>Nexa Library</span><b>/</b><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <div className="search"><span>⌕</span><input value={globalSearch} onChange={(e)=>setGlobalSearch(e.target.value)} onKeyDown={(e)=>e.key==="Escape"&&setGlobalSearch("")} placeholder="Search books, students..." /><kbd>⌘ K</kbd>
              {globalSearch && <div className="search-results">{globalResults.length ? globalResults.map((r,i)=><button key={i} onClick={()=>{if(r.type==="Page")setActivePage(r.label);else if(r.type==="Book"){setActivePage("Books");setBookSearch(r.meta)}else{setActivePage("Students");setStudentSearch(r.meta)}setGlobalSearch("")}}><span>{r.type}</span><strong>{r.label}</strong><small>{r.meta}</small></button>) : <div className="no-results">No matches found</div>}</div>}
            </div>
            <button className="icon-button" onClick={()=>setNotificationsOpen(!notificationsOpen)}>🔔<i/></button>
            {notificationsOpen&&<div className="notification-popover"><strong>Notifications</strong><p>RFID reader is online.</p><p>{issuedBooks} books are currently issued.</p><button onClick={()=>setNotificationsOpen(false)}>Close</button></div>}
            <div className="top-profile"><div className="profile-avatar">L</div><div><strong>Librarian</strong><span>Admin</span></div></div>
          </div>
        </header>
        <div className="page-content">{renderPage()}</div>
      </main>

      {selectedBook && !modal && <BookActions book={selectedBook} onClose={()=>setSelectedBook(null)} onIssue={()=>setModal({type:"issueBook"})} onReturn={()=>setModal({type:"returnBook"})} onDelete={()=>deleteBook(selectedBook)} />}
      {selectedStudent && !modal && <StudentActions student={selectedStudent} onClose={()=>setSelectedStudent(null)} />}
      {modal?.type==="addBook"&&<AddBookModal onClose={()=>setModal(null)} onSubmit={addBook}/>}
      {modal?.type==="addStudent"&&<AddStudentModal onClose={()=>setModal(null)} onSubmit={registerStudent}/>}
      {modal?.type==="issueBook"&&selectedBook&&<IssueModal book={selectedBook} students={students} onClose={()=>setModal(null)} onIssue={issueBook}/>}
      {modal?.type==="returnBook"&&selectedBook&&<ConfirmModal title="Return Book" message={`Return “${selectedBook.title}” from ${selectedBook.borrower || "the current borrower"}?`} confirm="Return Book" onClose={()=>setModal(null)} onConfirm={()=>returnBook(selectedBook)}/>}
      {toast&&<div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function PageHeader({eyebrow,title,subtitle,action}) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function Stat({label,value,icon,tone="",note}) { return <div className="premium-stat"><div className="stat-top"><span>{label}</span><div className={`stat-symbol ${tone}`}>{icon}</div></div><h2>{value}</h2><div className="stat-change positive">● <span>{note}</span></div></div>; }
function Summary({label,value}) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function Step({n,text}) { return <div><span>{n}</span><p>{text}</p></div>; }
function Empty({text}) { return <div className="empty">{text}</div>; }
function initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();}

function ScannerVisual({state,big=false}) {
  return <div className={`scanner-visual ${big?"scanner-visual-big":""} ${state}`}><div className="scanner-ring ring-one"/><div className="scanner-ring ring-two"/><div className="scanner-ring ring-three"/><div className="scanner-center"><span>◉</span><small>{state==="scanning"?"SCANNING":state==="found"?"DETECTED":"READY"}</small></div></div>;
}

function BookActions({book,onClose,onIssue,onReturn,onDelete}) {
  return <div className="overlay" onMouseDown={onClose}><div className="action-panel" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">BOOK RECORD</span><h2>{book.title}</h2></div><button className="close-button" onClick={onClose}>×</button></div><div className="book-detail"><span>RFID</span><strong>{book.id}</strong><span>Author</span><strong>{book.author}</strong><span>Status</span><strong>{book.status}{book.borrower&&` · ${book.borrower}`}</strong><span>Category</span><strong>{book.category}</strong></div><div className="modal-actions">{book.status==="Available"?<button className="primary-button" onClick={onIssue}>Issue Book</button>:<button className="primary-button" onClick={onReturn}>Return Book</button>}<button className="secondary-button danger" onClick={onDelete}>Delete</button></div></div></div>;
}
function StudentActions({student,onClose}) {
  return <div className="overlay" onMouseDown={onClose}><div className="action-panel" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MEMBER RECORD</span><h2>{student.name}</h2></div><button className="close-button" onClick={onClose}>×</button></div><div className="student-detail-large"><div className="student-avatar">{initials(student.name)}</div><div><strong>{student.name}</strong><span>{student.id}</span><span>{student.email}</span></div></div><div className="book-detail"><span>Books currently issued</span><strong>{student.books}</strong><span>Membership</span><strong>{student.status}</strong></div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button></div></div></div>;
}
function ModalShell({title,children,onClose,eyebrow="NEW RECORD"}) { return <div className="overlay" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="close-button" onClick={onClose}>×</button></div>{children}</div></div>; }

function AddBookModal({onClose,onSubmit}) {
  const [data,setData]=useState({id:`RF-${String(Date.now()).slice(-3)}`,title:"",author:"",category:"Computer Science",status:"Available"});
  const update=e=>setData({...data,[e.target.name]:e.target.value});
  return <ModalShell title="Add New Book" onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(!data.title||!data.author||!data.id)return;onSubmit(data)}}><label>RFID Tag<input name="id" value={data.id} onChange={update}/></label><label>Book Title<input name="title" value={data.title} onChange={update} placeholder="e.g. Operating System Concepts" required/></label><label>Author<input name="author" value={data.author} onChange={update} placeholder="Author name" required/></label><label>Category<select name="category" value={data.category} onChange={update}><option>Computer Science</option><option>Programming</option><option>Networking</option><option>Database</option><option>AI</option><option>Other</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Add Book</button></div></form></ModalShell>;
}
function AddStudentModal({onClose,onSubmit}) {
  const [data,setData]=useState({id:"",name:"",email:""});
  return <ModalShell title="Register Student" onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(data.id&&data.name&&data.email)onSubmit(data)}}><label>Student ID<input value={data.id} onChange={e=>setData({...data,id:e.target.value})} placeholder="e.g. 2520030010" required/></label><label>Full Name<input value={data.name} onChange={e=>setData({...data,name:e.target.value})} placeholder="Student name" required/></label><label>Email<input type="email" value={data.email} onChange={e=>setData({...data,email:e.target.value})} placeholder="student@college.edu" required/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Register Student</button></div></form></ModalShell>;
}
function IssueModal({book,students,onClose,onIssue}) {
  const [id,setId]=useState(students[0]?.id||"");
  const student=students.find(s=>s.id===id);
  return <ModalShell title="Issue Book" eyebrow="CIRCULATION" onClose={onClose}><div className="selected-record"><span>Selected book</span><strong>{book.title}</strong><small>{book.id}</small></div><label>Choose student<select value={id} onChange={e=>setId(e.target.value)}>{students.filter(s=>s.status==="Active").map(s=><option key={s.id} value={s.id}>{s.name} · {s.id}</option>)}</select></label>{student&&<div className="notice">This student currently has {student.books} issued book{student.books===1?"":"s"}.</div>}<div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={()=>student&&onIssue(book,student)}>Confirm Issue</button></div></ModalShell>;
}
function ConfirmModal({title,message,confirm,onClose,onConfirm}) { return <ModalShell title={title} eyebrow="CONFIRM ACTION" onClose={onClose}><p className="confirm-message">{message}</p><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onConfirm}>{confirm}</button></div></ModalShell>; }

export default App;
