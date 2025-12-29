// Finnaly got enough reading raw code, so i decided to add comments for contributers (and myself)
// so I'll ad some comments for every large, unexplained, wierd magic looking code
// or just when there hasn't been a comment for a while

// set up all variables and objects or whatever they are called
const resultsContainer = document.getElementById("results"); // results list for every result
const paginationContainer = document.getElementById("pagination"); // small thing at bottom to show current page and next/previous buttons
const searchForm = document.getElementById("searchForm"); // the whole form with search bar and submit button
const searchQuery = document.getElementById("searchQuery"); // only the search bar
const headerText = document.getElementById("headerText"); // the text in the header (kinda self explainitory)

// these also are self explainitory
let currentPage = 1;
let currentQuery = "";
let currentPerPage = 20;

/** This adds an "highlight" to where the `tokens` are found in `text`
 * @param {string} text - A normal string
 * @param {string[]} tokens - An array of strings to match in `text`
 * @param {string} [customHighlight="<span class=\"result-match\">$1</span>"] - If you want to specify what to do with the match
 * @returns {string} returns a new string with every match within the set "highlight"
 */
function highlightText(text, tokens, customHighlight=`<span class="result-match">$1</span>`) {
	if (!tokens || tokens.length === 0) return text; // double check if there are any tokens

	tokens.sort((a, b) => b.length - a.length); // sort the tokens from large -> small (so that the small ones dont take priority and "split" a larger match, eg: you check ["a", "av"] with "abc", you wold only match with "a", but with large to small it matches the "ab")
	const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g"); // remove any single backslashes from the tokens just incase, so they dont ruin the regex. And then combine them with a bar for "or" opperation

	return text.replace(regex, customHighlight); // returns the new string, replacing every match with the selected highlight method
}

/** simply "loads" the page. In reality it just changes the page based on the state */
async function loadPage() {
	if (currentQuery == "") { // here it checks if there is any search query. If not; "reload" the page without anything
		paginationContainer.innerHTML = "";
		displayResults();
		pushUrlState("/", {});
		return;
	}

	const [path, params] = getUrlState();

	if (path == "/results") {
		currentQuery = params.q || "";
		currentPage = parseInt(params.page) || 1;
		currentPerPage = parseInt(params.perPage) || 20;
	}
	
	try { // incase something goes wrong
		const data = await getData(currentPage, currentPerPage); // get the results from the search

		displayResults(data.results, data.query_tokens); // display them

		paginationContainer.innerHTML = "";
		if(resultsContainer.innerHTML != "") displayPagination(data); // then display the pagination (if there should be any)
		else displayNothingFound(); // otherwise display that there was no result
	}
	catch (error) {handleError(error);}
	
}

/** gets the data for the current search
 * @param {number} page - page number
 * @param {number} perPage - how many results wanted back
 * @returns {Promise<object[]>}
 */
async function getData(page, perPage) {
	const response = await fetch("/search", { //send the fetch request, this goes to the backend "/search" request.
		method: "POST", // this tells the backend "im gonna send data and i want some back"
		headers: { "Content-Type": "application/json" }, // this tells the backend that the data is json
		body: JSON.stringify({ //self explainitory
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

/**
 * Display the entries from a results array to the `resultsContainer`
 * @param {object[]} results an array of the results to display
 * @param {string[]} tokens the tokens to highlight text with
 */
function displayResults(results, tokens) {
	resultsContainer.innerHTML = "";
	if (results) results.forEach(result => {
		const item = document.createElement("li"); // creates a list item element

		const isoStart = result.start.replace(",", ".")
		const isoEnd = result.end.replace(",", ".");

		item.innerHTML = /* some things about this; the '<span lang="ja-jp">...' tells google "this is japanese btw" */`
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

/**
 * Display the pagination at the bottom (page num and prev/next buttons)
 * @param {object} data full data
 */
function displayPagination(data) {
	if (currentPage > 1) { // if the current page is the first we cant go back, so only display the previous button when the page num is bigger then 1
		const prevButton = document.createElement("button");
		prevButton.textContent = "Previous";
		prevButton.onclick = () => { // add thing on click function
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

/**
 * gets the state of the current
 * @returns {[string, object]}
 */
function getUrlState() {
	const url = new URL(window.location);

	const returnObject = {};

	url.searchParams.forEach((val, key) => { // this is so wierd, idk why but apparently the value is first and key second? why is this???
		returnObject[key] = val; // and here its the other way around??? why does js have to be like this
	});
	return [url.pathname, returnObject];
}

/** Push a state to the url
 * @param {string} pathname - the url path to set the url (such as "/search" or "/results")
 * @param {object} state - the state
 * @param {*} [data={}]
 * @param {string} [unused=""]
 */
function pushUrlState(pathname, state, data={}, unused="") {
	const url = new URL(window.location);

	url.search = ''
	url.pathname = pathname

	for (const [key, val] of Object.entries(state)) url.searchParams.set(key, val);
	
	window.history.pushState({}, "", url);
}

function displayNothingFound() {
	resultsContainer.innerHTML = `<p>Nothing found when searching for "${currentQuery}"`
}

function handleError(err) {
	console.log(err)
	alert(`<p>Error ocured: ${err}`)
}

searchForm.addEventListener("submit", async event => {
	event.preventDefault();
	currentQuery = searchQuery.value;
	currentPage = 1;

	pushUrlState("/results", {q: currentQuery, page: currentPage, perPage: currentPerPage}); //does what it says, pushes state without reloading the page

	loadPage();
});

headerText.addEventListener("click", function (e) {
	searchQuery.value = "";
	currentQuery = "";

	loadPage();
});

window.addEventListener("DOMContentLoaded", async () => {
	const [path, params] = getUrlState();

	if (path == "/results") {
		currentQuery = params.q || "";
		currentPage = parseInt(params.page) || 1;
		currentPerPage = parseInt(params.perPage) || 20;
		searchQuery.value = currentQuery;

		loadPage();
	}
});

