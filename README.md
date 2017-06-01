# Byte Me
Interactively compile Python 3.4 source code into bytecode for the CPython virtual machine.

### How to run
This website is not currently public on the internet, but you can run the development version yourself. Python 3.4+ and npm are required.

Clone the repository and its submodules (currently Bootstrap and CodeMirror) with

```
$ git clone https://github.com/elpez/byte-me.git
$ git submodule init
$ git submodule update
```

Next, build the CodeMirror and Bootstrap libraries.

```
$ cd static/CodeMirror
$ npm install
```

Instructions for building Bootstrap can be found [here](http://getbootstrap.com/getting-started/).

After that, install the requirements (preferably in a virtual environment).

```
$ pip3 install -r requirements.txt
```

Finally, run the Flask app and visit the website at`localhost:5000` in your browser.

```
$ export FLASK_APP=bitten.py
$ flask run
```
