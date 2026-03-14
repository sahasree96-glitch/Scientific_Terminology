async function loadSearches() {
    try {
        const res = await fetch("http://localhost:5000/admin/searches");
        const searches = await res.json();

        if (!searches || searches.length === 0) {
            document.getElementById("data").innerHTML = "<p>No searches found.</p>";
            return;
        }

        let html = "<h3>Search History</h3><table border='1' style='width:100%;text-align:center'>";
        html += "<tr><th>Username</th><th>Search Term</th><th>Explanation</th><th>Time</th></tr>";

        searches.forEach(s => {
            html += `<tr>
                        <td>${s.userId?.username || "Unknown"}</td>
                        <td>${s.term}</td>
                        <td>${s.explanation}</td>
                        <td>${new Date(s.createdAt).toLocaleString()}</td>
                     </tr>`;
        });

        html += "</table>";
        document.getElementById("data").innerHTML = html;
    } catch (err) {
        document.getElementById("data").innerHTML = "<p>Error loading searches.</p>";
    }
}