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
        var regTabNum = Math.min(data.length, 6)
        for (var i = 0; i < regTabNum; i++) {
            $("#tabs").append(makeTabHeader(data[i]['name'], i));
        }
        var button = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></a>'
        var firstDropdown = '<ul class="dropdown-menu" id = "dropdown"></ul>'
        var dropdown = '<li class = "dropdown">' + button + firstDropdown + '</li>';
        if(data.length>=6){
          $("#tabs").append(dropdown)
        }
        for( var i = 6; i < data.length; i++) {
            console.log("6")
            $("#dropdown").append(makeTabHeader(data[i]['name'], i));
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
        return '<tr><td class="source">' + source + '</td><td class="opname">' + bytecode.opname + '</td><td class="desc">' +
               desc + '</td></tr>';
    } else {
        return '<tr><td>' + source + '</td><td></td><td></td></tr>';
    }
}
