import sqlite3
import sys

conn = sqlite3.connect("data/index.db")
c = conn.cursor()

current_type = "sql"

while True:
	try:
		inp = input(">>> ")

		if inp.startswith("/"):
			current_type = inp[1:].lower()
			continue

		if current_type in ["py", "python"]:
			out = eval(inp)
			if out: print(out)
		
		elif current_type == "sql":
			c.executescript(inp)

			res = c.fetchall()

			if len(res) > 0:
				print(res)
			else: print(len(res))

			conn.commit()

	except KeyboardInterrupt:
		conn.close()
		sys.exit(0)

	except Exception as e:
		print(e)