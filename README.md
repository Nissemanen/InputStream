# InputStream

I don’t know what to do with the logo 🤔. Guess that comes a nother time

## prerequisites

1. `Python 3.xx` This project was written to fit a python3 standard. We haven't made sure it works in any other version yet.
2. A web browser (ofc)
3. Some sort of understanding in using the terminal

## Installation

<details>
<summary>Windows</summary>

1. Clone the repository

   ```batch
   git clone https://github.com/nissemanen/InputStream.git
   ```

   or select Code → Download ZIP → extract it

2. Navigate to the project directory and create a virtual environment

   ```batch
   cd InputStream
   python -m venv .venv
   ```

3. Activate the virtual environment

   ```batch
   .\.venv\Scripts\Activate
   ```

4. Install packages

   ```batch
   pip install -r requirements.txt
   ```

</details>

<details>
<summary>Linux / MacOS</summary>

1. Clone the repository

   ```bash
   git clone https://github.com/nissemanen/InputStream.git
   ```

   or select Code → Download ZIP → extract it

2. Navigate to the project directory and create a virtual environment

   ```bash
   cd InputStream
   python3 -m venv .venv
   ```

3. Activate the virtual environment

   ```bash
   source .venv/bin/activate
   ```

4. Install packages

   ```bash
   pip3 install -r requirements.txt
   ```

</details>

## Usage

Right now, to use InputStream you have to locally self-host it. Partially since i dont have any dedicated servers, or any domain to connect it to

to start the website is easy, just run the `app.py` script (Make sure that the Virtual environment is activated ), it is a flask application that will start the website on your computer locally

**Windows**

```batch
python app.py
```

**Linux / MacOS**

```bash
python3 app.py
```

information about how to acces it will be spoted in the terminal

 > [!NOTE]
 > if you want to run it in `debug` mode, just add `--input-stream-debug` as a flag when you run the app
 >
 > ```bash
 > python3 app.py --input-stream-debug
 > ```
 >
 > bash was used in that example, but it works the same in batch, you just add `--input-stream-debug` after the command
