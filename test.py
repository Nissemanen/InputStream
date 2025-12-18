import sqlite3
import sys

conn = sqlite3.connect("data/index.db")
c = conn.cursor()

while True:
	try:
		while True:
			inp = input(">>> ")

			print(inp)

			c.executescript(inp)


			if len(c.fetchall()) > 0:
				print(c.fetchall())
			else: print(len(c.fetchall()))

			conn.commit()
	except KeyboardInterrupt:
		conn.close()
		sys.exit(0)

	except Exception as e:
		print(e)