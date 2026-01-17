from db_handler import search, WordEntry, tokenize, get_data, show_seasons
import clip_extracter as clipper
import flask
import re

app = flask.Flask(__name__)

filters: dict = {}

def generate_highlights(text: str, tokens: list[str], highlight_method: str = "") -> str:
	if not highlight_method:
		highlight_method = r'<span class="result-match">\1</span>'

	tokens.sort(key=len)

	# print("("+'|'.join([tk.replace('\\', '\\\\') for tk in tokens])+")")

	return re.sub(
		"("+'|'.join([tk.lower().replace('\\', '\\\\') for tk in tokens])+")", 
		highlight_method, text, flags=re.IGNORECASE
		)


# application things

@app.route("/")
def index():
	return flask.render_template('index.html', data=get_data())

@app.route('/search', methods=['POST', 'GET'])
def do_search():
	if flask.request.method == 'GET':
		return flask.redirect("/")
	
	query = flask.request.json.get("query", "")
	page = flask.request.json.get("page", 1)
	per_page = flask.request.json.get("per_page", 20)
	highlight_method: str = flask.request.json.get("highlight_method", "")
	if flask.request.json.get("type") == "search":
		globals()["filters"] = flask.request.json.get("filters", {});
	filters = globals()["filters"]
	
	if query == "":
		return flask.jsonify({"results":[], "has_more":False, "query_tokens":[]})

	print("===")
	print("request json:", flask.request.json)
	print(f"filters: {filters}")
	print(f"doing {query}")
	print(f"splitted: {tokenize(query)}")
	print(f"filters: {filters}")
	results = search(
		query,
		included_shows=filters.get("included_shows"),
		excluded_shows=filters.get("excluded_shows"),
		seasons=filters.get("seasons"),
		episodes=filters.get("episodes"),
		languages=filters.get("languages"),
		movies_only=filters.get("movies_only", False),
		series_only=filters.get("series_only", False),
		exact_match=filters.get("exact_match", False)
		)
	tokenized = tokenize(query)

	return_list = [
		{
			'text': generate_highlights(r.text, tokenized, highlight_method),
			'show': r.show,
			'season': r.season,
			'episode': r.episode,
			'start': r.start,
			'end': r.end,
			'is_movie': r.is_movie,
			'language': r.language
		}
		for r in results[per_page * (page-1):per_page*page]
	]

	print("===")

	return flask.jsonify(
		{
			"results": return_list, 
			"has_more": (len(results)-per_page*page)/20 > 0, 
			"season_amounts": {
				show:show_seasons(show) # this just uses the unique names in the set below
				for show in {entry["show"] for entry in return_list} # this gets every unique show name in a set
				}
		}
	)

@app.route("/results")
def results_redirect():
	return flask.render_template("index.html", data=get_data())

if __name__ == "__main__":
	app.run(debug=True)