const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");
const searchForm = document.getElementById("searchForm");
const searchQuery = document.getElementById("searchQuery");

let currentPage = 1;
let currentQuery = "";
let currentPerPage = 20;

// I have no idea what this is.

// its to highlight wherever the searched word is in the found text, 
// dunno why i chose to do that in the frontend though - nisse
function highlightText(text, tokens) {
	if (!tokens || tokens.length === 0) return text;

	tokens.sort((a, b) => b.length - a.length);
	const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");

	return text.replace(regex, `<span class="result-match">$1</span>`);
}

async function loadPage() {
	const data = await getData(currentPage, currentPerPage);
	displayResults(data.results, data.query_tokens);
	console.log("length:", resultsContainer.length);
	console.log("container:", resultsContainer);

	paginationContainer.innerHTML = "";
	if(resultsContainer.innerHTML != "") displayPagination(data);
	else displayNothingFound();
}

async function getData(page, perPage) {
	const response = await fetch("/search", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: currentQuery,
			page: page,
			per_page: perPage
		})
	});
	if (!response.ok) {
		throw new Error(response.status);
	} else {
		return await response.json();
	}
}

function displayResults(results, tokens) {
	resultsContainer.innerHTML = "";
	results.forEach(result => {
		const item = document.createElement("li");

		const isoStart = result.start.replace(",", ".")
		const isoEnd = result.end.replace(",", ".");

		item.innerHTML = `
			<h3 class="result-name">
				<span class="result-title">${result.show}</span>
				<span>Season ${result.season}, Episode ${result.episode}</span>
			</h3>
			<p class="result-text"><span lang="ja-jp">
				${highlightText(result.text, tokens)}
			</span></p>
			<small class="result-time">
				(from
					<time datetime="${isoStart}">${result.start}</time>
				to
					<time datetime="${isoEnd}">${result.end}</time>)
			</small>`;
		resultsContainer.appendChild(item);
	});
}

function displayPagination(data) {
	if (currentPage > 1) {
		const prevButton = document.createElement("button");
		prevButton.textContent = "Previous";
		prevButton.onclick = () => {
			currentPage--;
			loadPage();
		};
		paginationContainer.appendChild(prevButton);
	}

	const pageNumber = document.createElement("span");
	pageNumber.innerText = `Page ${currentPage}`;
	paginationContainer.appendChild(pageNumber);

	if (data.has_more) {
		const nextButton = document.createElement("button");
		nextButton.textContent = "Next";
		nextButton.onclick = () => {
			currentPage++;
			loadPage();
		};
		paginationContainer.appendChild(nextButton);
	}
}

searchForm.addEventListener("submit", async event => {
	event.preventDefault();
	currentQuery = searchQuery.value;
	currentPage = 1;

	loadPage();
	setStateOfUrl(currentQuery, currentPage, currentPerPage);
});

window.addEventListener("DOMContentLoaded", async () => {
	const url = new URLSearchParams(window.location.search);

	currentQuery = url.get("q") || "";
	currentPage = parseInt(url.get("page")) || 1;
	currentPerPage = parseInt(url.get("perPage")) || 20;

	searchQuery.value = currentQuery;
	loadPage()
});

function setStateOfUrl(query, page, perPage) {
	const url = new URL(window.location);

	if (query) url.searchParams.set("q", query);
	else url.searchParams.delete("q");

	if (page) url.searchParams.set("page", page);
	else url.searchParams.delete("page");

	if (perPage) url.searchParams.set("perPage", perPage);
	else url.searchParams.delete("perPage");

	window.history.pushState({}, "", url);
}

function displayNothingFound() {
	resultsContainer.innerHTML = `<p>Nothing found when searching for "${currentQuery}"`
}
