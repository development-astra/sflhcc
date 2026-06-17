from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/board-of-directors')
def board_of_directors():
    return render_template('board-of-directors.html')


@app.route('/honorary-board')
def honorary_board():
    return render_template('honorary-board.html')


@app.route('/presidents-message')
def presidents_message():
    return render_template('presidents-message.html')


@app.route('/chairmans-message')
def chairmans_message():
    return render_template('chairmans-message.html')


@app.route('/recognitions-and-awards')
def recognitions_and_awards():
    return render_template('recognitions-and-awards.html')


@app.route('/committees')
def committees():
    return render_template('committees.html')


@app.route('/our-foundation')
def our_foundation():
    return render_template('our-foundation.html')


if __name__ == '__main__':
    app.run(debug=True)
