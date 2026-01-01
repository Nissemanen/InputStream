# InputStream

I don’t know what to do with the logo 🤔. Guess that comes a nother time

I have no clue on how to make a good README file, nor how to make a good github repo.
So if anyone has time to help me set it up, please do contact me

## prerequisites

1. `Python 3.xx` This project was written to fit a python3 standard. We haven't made sure it works in any other version yet.
2. A web browser (ofc)
3. Some sort of understanding in using the terminal, or some code editor that can run the backside.

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/nissemanen/InputStream.git
   ```

   or select Code → Download ZIP → extract it

2. Navigate to the project directory and create a virtual environment (preferably with python3)

   ```bash
   cd InputStream
   python3 -m venv .venv
   ```

3. Activate the virtual environment
   **Linux/macOS:**

   ```bash
   source .venv/bin/activate
   ```

   **Windows:**

   ```batch
   .\.venv\Scripts\Activate
   ```

4. Install packages

   ```bash
   pip install -r requirements.txt
   ```

## Usage

Right now, to use InputStream you have to locally self-host it. Partially since i dont have any dedicated servers, or any domain to connect it to

to start the website is easy, just run the `app.py` script, it is a flask application that will start the website on your computer locally

```bash
python app.py
```

you shouldn't need to specify the usage of `python3` to run the script if you use the venv. But if the script doesn't work, try running it with python3
