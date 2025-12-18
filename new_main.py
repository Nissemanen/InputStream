from dataclasses import dataclass
from pathlib import Path
import sqlite3
import fugashi


COMMON_DB_PATH = "data/index.db"

@dataclass
class WordEntry:
	word: str
	text: str
	show: str
	start: str
	end: str
	season: int
	episode: int

def ready_database(db_path: str):
	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	c.execute("""CREATE TABLE IF NOT EXISTS word_subtitle_index (
		   word TEXT NOT NULL,
		   text TEXT NOT NULL,
		   start TEXT NOT NULL,
		   end NOT NULL,
		   show TEXT NOT NULL,
		   season INTEGER NOT NULL,
		   episode INTEGER NOT NULL)""")
	
	conn.commit()
	conn.close()


def save_index_to_db(index: list[WordEntry], db_path: str = COMMON_DB_PATH):
	Path(db_path).parent.mkdir(parents=True, exist_ok=True)

	if Path(db_path).exists():
		Path(db_path).unlink()
	
	ready_database(db_path)

	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	c.executemany(
		"""INSERT INTO word_subtitle_index (word, text, start, end, show, season, episode)
		VALUES (?, ?, ?, ?, ?, ?, ?)""", 
		[(entry.word, entry.text, entry.start, entry.end, entry.show, entry.season, entry.episode) for entry in index])
	
	conn.commit()
	conn.close()

def search(
		search: str,
		show: list[str]|None = None,
		season: list[int]|None = None,
		episode: list[int]|None = None,
		db_path: str = COMMON_DB_PATH
		) -> list[WordEntry]:
	conn = sqlite3.connect(db_path)
	c = conn.cursor()

	spliter = fugashi.tagger() #type: ignore
	splited_search = spliter(search)

	querry = "SELECT * FROM word_subtitle_index WHERE "
	parameters = []

	if len(splited_search) >:
		querry += "word = ?"
	else

	c.execute("SELECT * FROM word_subtitle_index WHERE word = ?", ())

	return []
