from srt_parser import TextEntry, parse_srt_file
from dataclasses import dataclass
import janome.tokenizer as t
from pathlib import Path
from tqdm import tqdm
import sqlite3
import json
import re


COMMON_DB_PATH = "data/index.db"
COMMON_SUB_PATH = "subtitles"
Tokenizer = t.Tokenizer()
known_json: dict[str, dict] = {}

@dataclass
class WordEntry:
	word: str
	text: str
	show: str
	start: str
	end: str
	season: int
	episode: int
	language: str
	is_movie: bool

@dataclass
class Metadata:
	show: str
	season: int
	episode: int
	language: str
	is_movie: bool = False

def tokenize(string: str) -> list[str]:
	tokens = [
		token.surface if isinstance(token, t.Token) else token 
		for token in Tokenizer.tokenize(string)
		]
	if " " in tokens:
		tokens.remove(" ")
	return tokens

def get_metadata(srt_path, root_path) -> Metadata: # should look like "show(season)/jap|en/episode.srt"
	parts: list[str] = re.split(r"\\|/", str(Path(srt_path).relative_to(root_path))) #0 is show, 1 is lang, and 2 is episode
	show_match = re.match(r"([^(]+)\(?(\d+)?\)?", parts[0].strip())


	show = ""
	season = 1
	if show_match:
		show = show_match.group(1)
		season = int(show_match.group(2)) if show_match.group(2) is not None else 1
	
	ep = int(parts[2].strip(".")[0]) # part 2 should be "episodenum.srt" so just split and get the episode

	lang = parts[1]

	if parts[0] in known_json.keys():
		info = known_json[parts[0]]

	else:
		debug=f"{root_path}/{parts[0]}/info.json"
		with open(f"{root_path}/{parts[0]}/info.json", 'r') as f:
			info = json.load(f)
			known_json[parts[0]] = info

	is_movie = info["is_movie"]

	return Metadata(show=show, season=season, episode=int(ep), language=lang, is_movie=is_movie)

def ready_database(db_path: str):
	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	index_to_subtitle = """CREATE TABLE IF NOT EXISTS index_to_subtitle (
	id INTEGER NOT NULL PRIMARY KEY,
	text TEXT NOT NULL,
	start TEXT NOT NULL,
	end TEXT NOT NULL,
	show TEXT NOT NULL,
	season INTEGER NOT NULL,
	episode INTEGER NOT NULL,
	language TEXT NOT NULL,
	is_movie BOOLEAN NOT NULL)"""

	word_to_index = """CREATE TABLE IF NOT EXISTS word_to_index (
	word TEXT NOT NULL,
	subtitle_id INTEGER NOT NULL,
	FOREIGN KEY(subtitle_id) REFERENCES subtitles(id)

	)"""

	c.execute(index_to_subtitle)
	c.execute(word_to_index)
	
	conn.commit()
	conn.close()

def build_on_database(root_path: str = COMMON_SUB_PATH, db_path: str = COMMON_DB_PATH, loading_bar=False, langs:list[str]=[]):
	Path(db_path).parent.mkdir(parents=True, exist_ok=True)

	if Path(db_path).exists():
		Path(db_path).unlink()

	
	ready_database(db_path)

	subtitle_dir = Path(root_path)
	srt_files = []
	for lang in langs:
		srt_files += list(subtitle_dir.rglob(f"{lang}/*.srt"))
	
	if not langs: srt_files = list(subtitle_dir.rglob(f'*.srt'))

	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	idx = 0

	for file in tqdm(srt_files) if loading_bar else srt_files:
		text_entries = parse_srt_file(str(file))
		metadata = get_metadata(file, root_path)

		subtitles = [(idx + i, te.text, te.start, te.end, metadata.show, metadata.season, metadata.episode, metadata.is_movie, metadata.language) for i, te in enumerate(text_entries)]

		idx += len(subtitles)

		c.executemany(
			"INSERT INTO index_to_subtitle (id, text, start, end, show, season, episode, is_movie, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			subtitles)
		
		words = []
		for sub in subtitles:
			tokens = tokenize(re.sub(r'[^\w\s]', '', sub[1]))
			tokens = tokens
			words += [(word, sub[0]) for word in tokens]
		
		c.executemany(
			"INSERT INTO word_to_index (word, subtitle_id) VALUES (?, ?)", 
			words)
	
	conn.commit()
	conn.close()

def search(
		search: str,
		included_shows: list[str]|None = None,
		excluded_shows: list[str]|None = None,
		seasons: list[int]|None = None,
		episodes: list[int]|None = None,
		exact_match: bool = False,
		db_path: str = COMMON_DB_PATH
		) -> list[WordEntry]:
	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	splitted_search: list[str] = tokenize(search)

	query = f"""
	SELECT DISTINCT s.*
	FROM index_to_subtitle s
	{' '.join([f'INNER JOIN word_to_index w{i} ON s.id = w{i}.subtitle_id' for i in range(len(splitted_search))])}
	WHERE {' AND '.join([f'LOWER(w{i}.word) = LOWER(?)' for i in range(len(splitted_search))])}
	"""
	# to redisnotblue, there, its not misspelled any more, you happy

	parameters = splitted_search
	# if you are wondering why i dont just put the search right in the string instead of making them question marks, adding an intermediate step where failure can happen.
	# Fuck you.
	# i do what i want.
	# and i dont even know what the fuck im doing,
	# im so tired

	if included_shows:
		query += f" AND s.show IN ({', '.join(['?' for i in range(len(included_shows))])})"
		parameters += included_shows
	
	if excluded_shows:
		query += f" AND s.show NOT IN ({', '.join(['?' for i in range(len(excluded_shows))])})"
		parameters += excluded_shows
	
	if seasons:
		query += f" AND s.season IN ({', '.join(['?' for i in range(len(seasons))])})"
		parameters += seasons

	if episodes:
		query += f" AND s.episode IN ({', '.join(['?' for i in range(len(episodes))])})"
		parameters += episodes

	print(f"log:\n	querry: {query}\n	parameters: {parameters}")
	c.execute(query, parameters)

	results_unstructured = c.fetchall()

	results = [
		WordEntry(
			word=entry[0],
			text=entry[1],
			start=entry[2],
			end=entry[3],
			show=entry[4],
			season=entry[5],
			episode=entry[6],
			is_movie=entry[7],
			language=entry[8]
			) for entry in results_unstructured
		]

	return results


if __name__ == "__main__":
	build_on_database(loading_bar=True)
