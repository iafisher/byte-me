var my_textarea = document.getElementById("sourceCodeTextarea");
var editor = CodeMirror.fromTextArea(my_textarea, {
    lineNumbers: true, 
    mode: "python", 
    indentUnit: 4,
});

$("#compile").click(function() {
    $("#tabs").show();
    $.ajax({
        url: "/bytecode",
        data: {sourceCode: editor.getValue()},
        dataType: "json",
        method: "POST",
        success: function(data) {
	    addBytecode(data);
	}
    });
});

function addBytecode(data) {
    if (typeof data !== "string") {
        // clear the error box
        $("#syntaxError").text("");
        // remove all tabs and tab panels
        $("#tabs").empty();
        $("#tabContent").empty();
        // make the new tab headers
        var regTabNum = Math.min(data.length, 6);
        for (var i = 0; i < regTabNum; i++) {
            $("#tabs").append(makeTabHeader(data[i]['name'], i));
        }
        if (data.length >= 6) {
            $("#tabs").append(makeDropdownList());
            for (var i = 6; i < data.length; i++) {
                $("#dropdownList").append(makeTabHeader(data[i]['name'], i));
            }
        }
        // make the new tab panels
        for (var i = 0; i < data.length; i++) {
            $("#tabContent").append(makeTabPanel(data[i]['package'], i));
        }
        // activate the first tab
        $("#tabs li:first").addClass("active");
        $("#tabContent div:first").addClass("active");
    } else {
        $("#syntaxError").text(data);
    }
}

// Make a single tab header
function makeTabHeader(name, i) {
    return '<li><a href="#tab' + (i + 1) + '" data-toggle="tab">' + name + '</a></li>';
}

// Make a tab panel from the code package
function makeTabPanel(pack, i) {
    var thead = '<thead><tr><th>Line</th><th>Source Code</th><th>Opname</th><th>Description</th></tr></thead>';
    var tbody = '<tbody>' + makeTableBody(pack) + '</tbody>';
    var table = '<table class="table table-hover bytecode-table">' + thead + tbody + '</table>';
    return '<div id="tab' + (i + 1) + '" class="tab-pane">' + table + '</div>';
}

// Make the body of a table from the code package
function makeTableBody(pack) {
    return pack.map(makeRowGroup).join("");
}

function makeRowGroup(code) {
    var firstRow = makeTableRow(code.source, code.lineno, code.bytecode[0]);
    var otherRows = code.bytecode.slice(1).map(function (b) { return makeTableRow('', '', b); });
    return firstRow + otherRows.join("");
}

function makeTableRow(source, lineno, bytecode) {
    var desc = getDescription(bytecode);
    return '<tr><td>' + lineno + '<td class="source">' + source + '</td><td class="opname">' + bytecode.opname + '</td><td class="desc">' + desc + '</td></tr>';
}

// Make the dropdown list (a static HTML element)
function makeDropdownList() {
    var button = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></a>';
    var firstDropdown = '<ul class="dropdown-menu" id="dropdownList"></ul>';
    return '<li class="dropdown">' + button + firstDropdown + '</li>';
}
