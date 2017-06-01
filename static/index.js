var my_textarea = document.getElementById("sourceCodeTextarea");
var editor = CodeMirror.fromTextArea(my_textarea, {lineNumbers: true,
                                                   mode: "python",
                                                   smartIndent: true});

$("#compile").click(function() {
    $("#tabs").show();
    $.ajax({
        url: "/bytecode",
        data: {sourceCode: editor.getValue()},
        dataType: "json",
        method: "POST",
        success: function(data){
	    addBytecode(data);
	}
    });
});

function addBytecode(data) {
    if (typeof data !== "string") {
        // clear the error box
        $("#syntaxError").text("");
        // remove all tabs
        $("#tabs").empty();
        // remove the previous bytecode table, if it existed
        $("#tabContent").empty();
        // make the new tab headers
        for (var i = 0; i < data.length; i++) {
            $("#tabs").append(makeTabHeader(data[i]['name'], i));
        }
        // make the new tab panels (with bytecode panels)
        $("#tabContent").append(makeTabPanels(data));
        // activate the first tab
        $("#tabs li:first").addClass("active");
        $("#tabContent div:first").addClass("active");
    } else {
        $("#syntaxError").text(data);
    }
}

// Make the tab panels, each of which containing a bytecode table
function makeTabPanels(data) {
    var tabsArray = data.map(function(x, i) {
        var table = makeTable(x['package']);
        return '<div id="tab' + (i + 1) + '" class="tab-pane">' + table + '</div>';
    });
    return tabsArray.join('');
}

// Make a single tab header
function makeTabHeader(name, i) {
    return '<li><a href="#tab' + (i + 1) + '" data-toggle="tab">' + name + '</a></li>';
}

// Make a bytecode table from the code package
function makeTable(pack) {
    var thead = '<thead><tr><th>Source Code</th><th>Opname</th><th>Description</th></tr></thead>'
    var tbody = '<tbody>' + makeTableBody(pack) + '</tbody>';
    return '<table class="table table-hover bytecode-table">' + thead + tbody + '</table>';
}

// Make the body of a table from the code package
function makeTableBody(pack) {
    return pack.map(rowsFromCodePack).join("");
}

function rowsFromCodePack(code) {
    var firstRow = makeTableRow(code.source, code.bytecode[0]);
    var otherRows = code.bytecode.slice(1).map(function (b) { return makeTableRow('', b); });
    return firstRow + otherRows.join("");
}

function makeTableRow(source, bytecode) {
    if (bytecode) {
        var desc = getDescription(bytecode);
        return '<tr><td>' + source + '</td><td>' + bytecode.opname + '</td><td>' +
               desc + '</td></tr>';
    } else {
        return '<tr><td>' + source + '</td><td></td><td></td></tr>';
    }
}

function getDescription(bytecode) {
    switch (bytecode.opname) {
        case "LOAD_CONST":
            return "Push " + bytecode.argrepr + " onto the stack";
        case "STORE_NAME":
            return "Pop the top value off the stack and store it as " + bytecode.argrepr;
        case "LOAD_NAME":
            return "Retrieve the value stored as " + bytecode.argrepr +
                   " and push it onto the stack";
        case "BINARY_ADD":
            return "Pop the top two values off the stack, add them, and push the result";
        default:
            return "";
    }
}
