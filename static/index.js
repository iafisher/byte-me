var my_textarea = document.getElementById("sourceCodeTextarea");
var editor = CodeMirror.fromTextArea(my_textarea, {lineNumbers: true, mode:"python", smartIndent: true});

$("#compile").click(function() {
    $.ajax({
        url: "/bytecode",
        data: {sourceCode: editor.getValue()},
        dataType: "json", 
        method: "POST",
        success: function(data){
	    addBytecode(data);
            // this comes from the tooltip.js script
	    registerTooltips();    
	}
    });
});

function addBytecode(data) {
    if (typeof data !== "string") {
        // clear the error box
        $("#syntaxError").text("");
        // remove the previous bytecode table, if it existed
        $("#bytecodeTable").detach();
        $("#tableColumn").append(makeTabs(data));
    } else {
        $("#syntaxError").text(data);
    }
}

function makeTabs(data) {
    $("#tabs").append('<li class="active"><a href="#">' + data[0]['name'] + '</a></li>');
    for (var i = 1; i < data.length; i++) {
        $("#tabs").append('<li><a href="#">' + data[i]['name'] + '</a></li>');
    }
    var mapped = data.map(function(x, i) { return makeTable(x['package'], i); });
    console.log(mapped);
    var tabs = mapped.join('');
    console.log(tabs);
    return '<div class="tab-content">' + tabs + '</div>';
}

function makeTable(data, i) {
    var id = 'tab' + (i + 1) + '-slug';
    var classAttr = 'tab-pane' + ((i === 0) ? ' active' : '');
    var div = '<div id="' + id + '" class="' + classAttr + '">';
    var thead = '<thead><tr><th>Source Code</th><th>Opname</th><th>Description</th></tr></thead>'
    var ret = div + '<table class="table table-hover" id="bytecodeTable">' + thead + '<tbody>' + makeTableBody(data) + '</tbody></table></div>';
    //console.log(ret);
    return ret;
}

function makeTableBody(data) {
    return data.map(rowsFromCodePack).join("");
}

function rowsFromCodePack(code) {
    var firstRow = makeTableRow(code.source, code.bytecode[0]);
    var otherRows = code.bytecode.slice(1).map(function (b) { return makeTableRow('', b); });
    return firstRow + otherRows.join("");
}

function makeTableRow(source, bytecode) {
    if (bytecode) {
        var desc = getDescription(bytecode);
        return '<tr><td>' + source + '</td><td>' + bytecode.opname + '</td><td>' + desc + '</td></tr>';
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
            return "Retrieve the value stored as " + bytecode.argrepr + " and push it onto the stack";
        case "BINARY_ADD":
            return "Pop the top two values off the stack, add them, and push the result";
        default:
            return "";
    }
}
