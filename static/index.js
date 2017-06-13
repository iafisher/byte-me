// set up the text editor using CodeMirror
var myTextArea = document.getElementById("sourceCodeTextArea");
var editor = CodeMirror.fromTextArea(myTextArea, {
    lineNumbers: true,
    mode: "python",
    indentUnit: 4,
});

$("#compile").click(function() {
    $.ajax({
        url: "/bytecode",
        data: {sourceCode: editor.getValue()},
        dataType: "json",
        method: "POST",
        success: makeEverything,
    });
});


// Make all the new elements on the page from a data package as returned by the Flask interface
function makeEverything(data) {
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
        // this only matters on the first compile, when the tabs bar is initially hidden
        $("#tabs").show();
        setupActiveTabs();
    } else {
        $("#syntaxError").text(data);
    }
}

// Make a single tab header
function makeTabHeader(name, i) {
    return '<li><a href="#tab' + (i + 1) + '" data-toggle="tab">' + name + '</a></li>';
}

// Make a tab panel from a code package
function makeTabPanel(pack, i) {
    var thead = '<thead><tr>' +
                   '<th>Line</th><th>Source Code</th><th>Opname</th><th>Description</th>' +
                '</tr></thead>';
    var tbody = '<tbody>' + makeTableBody(pack) + '</tbody>';
    var table = '<table class="table table-hover bytecode-table">' + thead + tbody + '</table>';
    return '<div id="tab' + (i + 1) + '" class="tab-pane">' + table + '</div>';
}

// Make the body of a table from the code package
function makeTableBody(pack) {
    return pack.map(makeRowGroup).join("");
}

// Make a group of rows from a code package
function makeRowGroup(code) {
    // only the first row in a row group contains the line number and source code
    var firstRow = makeTableRow(code.source, code.lineno, code.bytecode[0], true);
    var otherRows = code.bytecode.slice(1).map(function (b) {
        return makeTableRow('', code.lineno, b, false);
    });
    return firstRow + otherRows.join("");
}

// Make a single row in the table
function makeTableRow(source, lineno, bytecode, firstRow) {
  if (firstRow) {
    var lineCell = '<td class="lineno-cell">' + lineno + '</td>';
    var sourceCell = '<td class="source-cell">' + source + '</td>';
  } else {
    // just delete the additions later for now keep parallel
    var lineCell = '<td class="lineno-cell">' + '' + '</td>';
    var sourceCell = '<td class="source-cell">' + '' + '</td>';
  }
    var opnameCell = '<td class="opname-cell">' + bytecode.opname + '</td>';
    var descCell = '<td class="description-cell">' + getDescription(bytecode) + '</td>';
    if (firstRow) {
      rowInfo = '<tr data-toggle="collapse" data-target=.' + lineno + '>'
      return rowInfo + lineCell + sourceCell + opnameCell + descCell + '</tr>';
    } else {
      //divHide = '<div class="accordian-body collapse ' + lineno + '">';
      return '<tr class = "' + lineno + ' aria-expanded = false collapse">' +
             lineCell + sourceCell + opnameCell + descCell + '</tr>';
    }
}

// Make the dropdown list (a static HTML element)
function makeDropdownList() {
    var button = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" ' +
                    'aria-haspopup="true" aria-expanded="false"><span class="caret"></span></a>';
    var firstDropdown = '<ul class="dropdown-menu" id="dropdownList"></ul>';
    return '<li class="dropdown">' + button + firstDropdown + '</li>';
}

// These functions and global variables handle the active tabs
var activeTab = 1;
var activeTabText = "<module>";
function setupActiveTabs() {
    $("#tabs > li").click(function(event) {
        var tabAnchor = $(this).find("a").first();
        activeTab = tabAnchor.attr("href").slice(-1);
        activeTabText = tabAnchor.text();
    });
    var potentialActiveTab = $("#tabs li:nth-child(" + activeTab + ")");
    if (!potentialActiveTab.length) {
        // default is for first tab to be active
        activeTab = 1;
        activeTabText = "<module>";
    }
    $("#tabs li:nth-child(" + activeTab + ")").addClass("active");
    $("#tabContent div:nth-child(" + activeTab + ")").addClass("active");
}
