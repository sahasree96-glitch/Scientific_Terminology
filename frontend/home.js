async function performSearch() {
    const term = document.getElementById("searchInput").value;
    const userId = localStorage.getItem("userId"); // store userId after login

    const res = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, term })
    });

    const data = await res.json();
    document.getElementById("result").innerText = data.result; // show explanation
}