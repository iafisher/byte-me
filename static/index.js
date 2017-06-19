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
        setupCollapsibleRows();
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
                   '<th><span class="glyphicon glyphicon-menu-up row-fold"></span></th>' +
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
        return makeTableRow('', '', b, false);
    });
    return firstRow + otherRows.join("");
}

// Make a single row in the table
function makeTableRow(source, lineno, bytecode, firstRow) {
    var lineCell = '<td class="lineno-cell">' + lineno + '</td>';
    var sourceCell = '<td class="source-cell">' + source + '</td>';
    var opnameCell = '<td class="opname-cell">' + bytecode.opname + '</td>';
    var descCell = '<td class="description-cell">' + getDescription(bytecode) + '</td>';
    var body = lineCell + sourceCell + opnameCell + descCell;
    if (firstRow) {
        var glyph = '<td><span class="glyphicon glyphicon-menu-up" aria-hidden="true"></span></td>';
        return '<tr class="header-row">' + body + glyph + '</tr>';
    } else {
        return '<tr class="non-header-row">' + body + '</tr>';
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


var upGlyph = "glyphicon-menu-up";
var downGlyph = "glyphicon-menu-down";
function setupCollapsibleRows() {
    // folding on individual rows
    $(".header-row").click(function() {
        $(this).nextUntil("tr.header-row").slideToggle(0);
        $(".glyphicon", this).toggleClass(upGlyph + " " + downGlyph);
    });
    // folding on all rows (the menu-up icon in the table head)
    $("th span.row-fold").click(function() {
        var table = $(this).parents("table");
        if ($(this).hasClass(downGlyph)) {
            $(this).removeClass(downGlyph).addClass(upGlyph);
            $("tr.header-row .glyphicon", table).removeClass(downGlyph).addClass(upGlyph);
            $("tr.header-row", table).nextUntil("tr.header-row").slideDown(0);
        } else {
            $(this).toggleClass(upGlyph + " " + downGlyph);
            $("tr.header-row .glyphicon", table).removeClass(upGlyph).addClass(downGlyph);
            $("tr.header-row", table).nextUntil("tr.header-row").slideUp(0);
        }
    });
}
