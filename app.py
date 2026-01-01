from db_handler import search, WordEntry, tokenize
import clip_extracter as clipper
import flask
import re

app = flask.Flask(__name__)


def generate_highlights(text: str, tokens: list[str], highlight_method: str = "") -> str:
	if not highlight_method:
		highlight_method = r'<span class="result-match">\1</span>'

	tokens.sort(key=len)

	print("("+'|'.join([tk.replace('\\', '\\\\') for tk in tokens])+")")

	return re.sub(
		"("+'|'.join([tk.lower().replace('\\', '\\\\') for tk in tokens])+")", 
		highlight_method, text, flags=re.IGNORECASE
		)


# application things

@app.route("/")
def index():
	return flask.render_template('index.html')

@app.route('/search', methods=['POST', 'GET'])
def do_search():
	if flask.request.method == 'GET':
		return flask.redirect("/")
	
	query = flask.request.json.get("query", "")
	page = flask.request.json.get("page", 1)
	per_page = flask.request.json.get("per_page", 20)
	highlight_method: str = flask.request.json.get("highlight_method", "")
	
	if query == "":
		return flask.jsonify({"results":[], "has_more":False, "query_tokens":[]})

	print("===")
	print(f"doing {query}")
	print(f"splitted: {tokenize(query)}")
	results = search(query)
	tokenized = tokenize(query)

	results_list = [
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
		for r in results
	]

	return_list = results_list[per_page * (page-1):per_page * page]

	print(flask.jsonify(return_list))
	print(f"{per_page * (page-1)}:{per_page * page}")
	print(len(results_list))

	return flask.jsonify(
		{"results": return_list, "has_more": (len(results_list)-per_page*page)/20 > 0, "query_tokens": tokenized})

@app.route("/results")
def results_redirect():
	return flask.render_template("index.html")

if __name__ == "__main__":
	app.run(debug=True)