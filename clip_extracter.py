import subprocess
import random
import time
import re

COMMON_OUTPUT = "output/"
FFMPEG_PATH = r"C:\Users\nisse\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe"

def get_new_times(start:str, end: str, show:str, season:int, episode: int) -> tuple[str, str]|None:
	sub_path = f"subtitles/{show}{f'({season})' if season > 1 else ''}/{episode}.srt"
	pattern = re.compile(rf"(\d\d:\d\d:\d\d,\d\d\d) --> \d\d:\d\d:\d\d,\d\d\d\n.*\n\n\d+\n{start} --> {end}\n.*\n\n\d+\n\d\d:\d\d:\d\d,\d\d\d --> (\d\d:\d\d:\d\d,\d\d\d)")

	with open(sub_path, 'r', encoding="utf-8-sig") as f:
		full_file = f.read().strip()

	time_match = re.search(pattern, full_file)

	if time_match:
		return (time_match.group(1), time_match.group(2))
	print(pattern)
	return (start, end) #kolla om du kann få ett särkert sätt att lägga in denna i main funktionen


def extract_clip(start: str, end: str, show:str, season:int, episode: int, output_path:str = COMMON_OUTPUT):
	video_path = f"videos/{show}{f'({season})' if season > 1 else ''}/{episode}.mp4"
	random.seed(int(time.time()* 1e6))
	output_path += f'output{random.randint(0, 100)}.mp4'

	subprocess.run([
		FFMPEG_PATH,
		'-i', video_path,
		'-ss', start.replace(',', '.'),
		'-to', end.replace(',', '.'),
		'-c', 'copy', output_path
	])

if __name__ == "__main__":
	pass