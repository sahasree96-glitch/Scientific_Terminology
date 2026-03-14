// Suggest Password Generator
document.getElementById("suggestBtn")?.addEventListener("click", () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("password").value = password;
});

// Toggle Password Visibility
document.getElementById("showPass")?.addEventListener("change", (e) => {
    const field = document.getElementById("password");
    field.type = e.target.checked ? "text" : "password";
});

// Signup Form Handler
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
        const res = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const msg = await res.text();
        alert(msg);

        if (res.ok) {
            window.location.href = "login.html"; // redirect after signup
        }
    } catch (err) {
        alert("Signup failed: " + err.message);
    }
});

// Toggle Password Visibility (Login)
document.getElementById("showLoginPass")?.addEventListener("change", (e) => {
    const field = document.getElementById("loginPassword");
    field.type = e.target.checked ? "text" : "password";
});

// Login Form Handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const msg = await res.text();
        alert(msg);

        if (res.ok && msg.includes("success")) {
            window.location.href = "home.html"; // redirect after login
        }
    } catch (err) {
        alert("Login failed: " + err.message);
    }
});


// Search Handler
document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const term = document.getElementById("searchInput").value;
    if (!term) {
        alert("Please enter a term!");
        return;
    }
    const res = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term })
    });
    const data = await res.json();
    const resultBox = document.getElementById("result");
    resultBox.innerHTML = `<p>✨ You searched for <b>${term}</b></p><p>${data.result}</p>`;
});

// Voice Search
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
    document.getElementById("searchInput").value = event.results[0][0].transcript;
};
document.getElementById("micBtn")?.addEventListener("click", () => recognition.start());


document.getElementById("searchBtn").addEventListener("click", performSearch);

async function performSearch() {
    const term = document.getElementById("searchInput").value.trim();
    const userId = localStorage.getItem("userId");

    if (!term) {
        document.getElementById("result").innerText = "⚠️ Please enter a term.";
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, term })
        });

        const data = await res.json();
        document.getElementById("result").innerHTML = `
            <h3>🔍 Explanation</h3>
            <p>${data.result}</p>
        `;
    } catch (err) {
        document.getElementById("result").innerText = "❌ Error fetching explanation.";
    }
}


// =======================
// Admin Route for User Details + Queries
// =======================
app.get("/admin/users", async (req, res) => {
    try {
        // Get all users and queries
        const users = await User.find();
        const queries = await Query.find();

        // Merge user info with their queries
        const results = queries.map(q => {
            const user = users.find(u => u._id.toString() === q.userId);
            return {
                username: user?.username,
                email: user?.email || "N/A",   // will show N/A unless you add email to schema
                password: user?.password,      // ⚠️ hashed password
                query: q.query,
                response: q.response,
                timestamp: q.timestamp
            };
        });

        res.json(results);
    } catch (err) {
        console.error("Admin users error:", err);
        res.status(500).send("Error fetching user details with queries");
    }
});

// ... your signup, login, query, admin routes ...

// =======================
// Last Query Route
// =======================
app.get("/last-query", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const lastQuery = await Query.findOne({ userId }).sort({ timestamp: -1 });
        if (!lastQuery) return res.json({ message: "No previous query found" });

        res.json(lastQuery);
    } catch (err) {
        console.error("Last query error:", err);
        res.status(500).send("Error fetching last query");
    }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});