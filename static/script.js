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


/** simply "loads" the page. In reality it just changes the page based on the state */
async function loadPage() {
	if (currentQuery == "") {
		paginationContainer.innerHTML = "";
		displayResults();
		return;
	}

	try { // incase something goes wrong
		const data = await getData(currentPage, currentPerPage); // get the results from the search

		displayResults(data); // display them

		paginationContainer.innerHTML = "";
		if(resultsContainer.innerHTML != "") displayPagination(data); // then display the pagination (if there should be any)
		else displayNothingFound(); // otherwise display that there was no result
	}
	catch (error) {
		handleError(error);
	}
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
function displayResults(data) {
	resultsContainer.innerHTML = "";
	if (data.results) data.results.forEach(entry => {
		const item = document.createElement("li"); // creates a list item element

		const isoStart = entry.start.replace(",", ".")
		const isoEnd = entry.end.replace(",", ".");

		item.innerHTML = /* some things about this; the '<span lang="ja-jp">...' tells google "this is japanese btw" */`
			<h3 class="result-name">
				<span class="result-title">${entry.show}</span>
				<span class="result-meta">
				${
					entry.is_movie ? 
					(
						parseInt(entry.season) > 1 ? // if it is a movie, look if the season is bigger then 1 (also parse in just incase)
						`<span>${entry.season}</span>` : // if so, it isn't the first movie and we add the number
						"" // else we just dont add anything
					):
					( // if it isnt a movie, either add season and episode or just episode
						data.season_amounts[entry.show].length > 1 ?// then we look if the amount of seasons are greater then 1(same here, parse just incase)
						`<span class="keep-together">Season ${entry.season},</span>
						<span class="keep-together">Episode ${entry.episode}</span>` : // if so we print the season
						`<span class="keep-together">Episode ${entry.episode}</span>` // else, we dont need to print the season, like why print the season when there is only 1
					)
				}
				</span>
			</h3>
			<p class="result-text"><span lang="${entry.language}">
				${entry.text}
			</span></p>
			<small class="result-time">
				(from
					<time datetime="${isoStart}">${entry.start}</time>
				to
					<time datetime="${isoEnd}">${entry.end}</time>)
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

	url.search = '';
	url.pathname = pathname;

	for (const [key, val] of Object.entries(state)) url.searchParams.set(key, val);
	
	window.history.pushState({}, "", url);
}

function displayNothingFound() {
	resultsContainer.innerHTML = `<p>Nothing found when searching for "${currentQuery}"`;
}

function handleError(err) {
	console.log(err);
	alert(`<p>Error ocured: ${err}`);
}

function addFilters(data) {
	const menu = document.getElementById("filters");

	// Language setings
	if ('languages' in data) {
		const langnames = new Map([
			["en", "English"],
			["ja-jp", "Japanese"]
		]);

		const filterSection = document.createElement('section');
		filterSection.className = 'filterSection';
		filterSection.innerHTML = '<h3>Languages</h3>';

		const multiCheckboxForm = document.createElement('form');
		multiCheckboxForm.id = 'multiCheckboxForm';
		data.languages.forEach(lang => {
			const inp = document.createElement('input');
			inp.type = "checkbox";
			inp.id = lang;
			inp.value = lang;
			
			const lable = document.createElement('label');
			lable.htmlFor = lang;
			lable.innerHTML = ' '+langnames.get(lang);

			multiCheckboxForm.appendChild(inp);
			multiCheckboxForm.appendChild(lable);
			multiCheckboxForm.appendChild(document.createElement('br'));
		});

		filterSection.appendChild(multiCheckboxForm);
		menu.appendChild(filterSection);
	}
}

searchForm.addEventListener("submit", async event => {
	event.preventDefault();
	currentQuery = searchQuery.value;
	currentPage = 1;

	loadPage();
	pushUrlState("/results", {q:currentQuery, page:currentPage, perPage:currentPerPage});
});

headerText.addEventListener("click", function () {
	searchQuery.value = "";
	currentQuery = "";

	loadPage();
	pushUrlState("/", {});
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

	console.log(BACKENDDATA);
	addFilters(BACKENDDATA);
});

