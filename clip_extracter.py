import subprocess
import random
import time

COMMON_OUTPUT = "output/"
FFMPEG_PATH = r"C:\Users\nisse\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe"

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
	extract_clip("00:00:00,000", "00:00:15,000", "Vinland Saga", 1, 1)