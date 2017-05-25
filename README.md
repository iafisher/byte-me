# Byte Me
Interactively compile Python 3.4 source code into bytecode for the CPython virtual machine.

### How to run
This website is not currently public on the internet, but you can run the development version yourself. Python 3 and npm are required.

First, install the requirements (preferably in a virtual environment).

```
$ pip3 install -r requirements.txt
```

Then, build the CodeMirror library.

```
$ cd static/CodeMirror
$ npm install
```

Finally, run the Flask app and visit the website in your browser.

```
$ export FLASK_APP=bitten.py
$ flask run
```
