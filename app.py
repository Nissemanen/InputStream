from db_handler import search, WordEntry, tokenize
import clip_extracter as clipper
import flask

app = flask.Flask(__name__)

@app.route("/")
def index():
	return flask.render_template('index.html')

@app.route('/search', methods=['POST', 'GET'])
def do_search():
	if flask.request.method == 'GET':
		return flask.redirect("/")
	
	print("===")
	query = flask.request.json['query']
	page = flask.request.json.get("page", 1)
	per_page = flask.request.json.get("per_page", 20)
	print(f"doing {query}")
	print(f"splitted: {tokenize(query)}")
	results: list = search(query)

	results_list = [
		{
			'text': r.text,
			'show': r.show,
			'season': r.season,
			'episode': r.episode,
			'start': r.start,
			'end': r.end
		}
		for r in results
	]

	return_list = results_list[per_page * (page-1):per_page * page]

	print(flask.jsonify(return_list))
	print(f"{per_page * (page-1)}:{per_page * page}")
	print(len(results_list))

	return flask.jsonify({"results": return_list, "has_more": (len(results_list)-per_page*page)/20 > 0, "query_tokens": [token for token in tokenize(query)]})

@app.route("/results")
def results_redirect():
	return flask.render_template("index.html")

if __name__ == "__main__":
	app.run(debug=True)