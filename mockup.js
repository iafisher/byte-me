var my_textarea = document.getElementById("source_code_textarea");
var editor = CodeMirror.fromTextArea(my_textarea, {lineNumbers: true, mode:"python", smartIndent: true});

$("#compile").click(function() {
    $(".bytecode-row").show("slow");
    /*
    var my_textarea2 = document.getElementById("submittedTextArea");
    var editor2 = CodeMirror.fromTextArea(my_textarea2, {mode:"python", readOnly:true});
    */
});
