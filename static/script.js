let current_page = 1;
let current_query = "";
let current_per_page = 20;

async function search() {
	current_query = document.getElementById("search_query").value;
	current_page = 1;
	await loadPage(current_page, current_per_page);
}

async function loadPage(page, per_page) {
	try {
		console.log("request:", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: {
				query: current_query,
				page: page,
				per_page: per_page
			}
		});
		
		const response = await fetch("/search", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				query: current_query,
				page: page,
				per_page: per_page
			})
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}

		console.log("response:", response);

		const data = await response.json();
		console.log("data:", data);
		const res = displayResults(data.results, data.query_tokens);

		const paginationDiv = document.getElementById("paginationDiv");
		paginationDiv.innerHTML = '';
		if (res) displayPagination(data, paginationDiv);
	} catch (error) {
		console.error('Search failed:', error);
		alert('Search failed. Please try again.')
	}
}

function displayPagination(data, paginationDiv) {
	if (current_page > 1) {
		const prevBtn = document.createElement('button');
		prevBtn.textContent = "Prev";
		prevBtn.onclick = () => {
			current_page--;
			loadPage(current_page, current_per_page);
		};
		paginationDiv.appendChild(prevBtn);
	}

	const pageNum = document.createElement('span');
	pageNum.textContent = ` Page ${current_page} `;
	paginationDiv.appendChild(pageNum);

	if (data.has_more) {
		const nextBtn = document.createElement('button');
		nextBtn.textContent = 'Next';
		nextBtn.onclick = () => {
			current_page++;
			loadPage(current_page, current_per_page);
		};
		paginationDiv.appendChild(nextBtn);
	}
}

function highlight_text(text, tokens, marking = `<mark>$1</mark>`) {
	if (!tokens || tokens.length === 0) return text;

	tokens.sort((a, b) => b.length - a.length);

	const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");

	return text.replace(regex, marking);
}

function displayResults(entries, tokens) {
	const resultDiv = document.getElementById('resultsDiv');
	resultDiv.innerHTML = '';

	entries.forEach(e => {
		const div = document.createElement('div');
		div.innerHTML = `
		<p><strong>${e.show}</strong>${e.season != 1 ? ` s.${e.season}` : ""} - Episode ${e.episode}</p>
		${highlight_text(e.text, tokens, `<strong>$1</strong>`)} <br>
		from ${e.start} to ${e.end}
		<hr>`
		resultDiv.appendChild(div)
	});

	if (resultDiv.innerHTML === '') {
		const div = document.createElement('div');
		div.innerHTML = `<p><strong>No results on "${current_query}"</strong></p>`;
		resultDiv.appendChild(div);
		return false;
	}
	return true;
}