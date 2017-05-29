var my_textarea = document.getElementById("sourceCodeTextarea");
var editor = CodeMirror.fromTextArea(my_textarea, {lineNumbers: true, mode:"python", smartIndent: true});

$("#compile").click(function() {
    $.ajax({
        url: "/bytecode",
        data: {sourceCode: editor.getValue()},
        dataType: "json", 
        method: "POST",
        success: addBytecode,
    });
});

function addBytecode(data) {
    // console.log(data);
    if (typeof data !== "string") {
        if (data.length > 0) {
            // clear the error box
            $("#syntaxError").text("");
            // remove all previous bytecode elements
            $(".bytecode-row").detach();
            for (var i = 0; i < data.length; i++) {
                $("#mainContainer").append(createBytecodeRow(data[i]));
            }
        }
    } else {
        $("#syntaxError").text(data);
    }
}

function createBytecodeRow(codeObj) {
    // I hope there's a better way to do this
    var row = document.createElement("div");
    row.setAttribute("class", "row bytecode-row");
    var emptyColumn = document.createElement("div");
    emptyColumn.setAttribute("class", "col-md-3");
    var sourceColumn = document.createElement("div");
    sourceColumn.setAttribute("class", "col-md-3 code-pair");
    sourceColumn.appendChild(document.createTextNode(codeObj.source));
    var byteColumn = document.createElement("div");
    byteColumn.setAttribute("class", "col-md-4 code-pair");
    for (var i = 0; i < codeObj.bytecode.length; i++) {
        var preElement = document.createElement("pre");
        preElement.appendChild(document.createTextNode(codeObj.bytecode[i]));
        byteColumn.appendChild(preElement);
    }
    row.appendChild(emptyColumn);
    row.appendChild(sourceColumn);
    row.appendChild(byteColumn);
    return row;
}
