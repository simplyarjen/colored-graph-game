var tokenRow = 0, tokenCol = 0;
var keyOffset = 0;

var playStates = [];
var playStateIndex = -1;

var keys;
var edges;

var place = function($el, row, col, offset) {
    $el.css({
        left: (offset + 40 * col) + "px",
        top:  (offset + 40 * row) + "px",
    });
};

var updateKeyColors = function() {
    $(".key").each(function(index) {
        $(this).removeClass("red green blue")
               .addClass(keys[(keyOffset + index) % 9]);
    });
};

var adoptState = function(state) {
    tokenRow = state.row;
    tokenCol = state.col;
    keyOffset = state.offset;
}

var enterState = function(row, col, offset) {
    var state = {
        row: row, 
        col: col, 
        offset: offset}
    playStates = playStates.slice(0, playStateIndex + 1);
    playStates.push(state);
    playStateIndex += 1;
    adoptState(state);
};

var performUndo = function() {
    if (playStateIndex == 0) {
        return;        
    }
    playStateIndex -= 1;
    adoptState(playStates[playStateIndex]);
    renderState();
};

var performRedo = function() {
    if (playStateIndex == playStates.length - 1) {
        return;        
    }
    playStateIndex += 1;
    adoptState(playStates[playStateIndex]);
    renderState();
};
                     
var placerForPosition = function(row, col) {
    return function() {
        var dist = Math.abs(tokenRow - row) 
            + Math.abs(tokenCol - col);
        if (dist !== 1) {
            return;
        }
        
        var edgeKey;
        if (tokenRow < row || (tokenRow == row && tokenCol < col)) {
            edgeKey = "" + tokenRow + tokenCol + row + col;
        } else {
            edgeKey = "" + row + col + tokenRow + tokenCol;
        }

        if (keys[keyOffset] !== edges[edgeKey]) {
            return;
        }
        enterState(row, col, (keyOffset + 1) % 9);
        renderState();
    };
};

var reset = function() {
    playStates = [];
    playStateIndex = -1;
    enterState(0, 0, 0);
    renderState();
};

var renderState = function() {
    place($("#token"), tokenRow, tokenCol, 10);
    updateKeyColors();
    $("#button-undo").css({
        visibility: (playStateIndex > 0) ? "visible" : "hidden"});
    $("#button-redo").css({
        visibility: (playStateIndex < playStates.length - 1) ? "visible" : "hidden"});
    $("#victory").toggle(tokenRow === 4 && tokenCol === 4);
};

var renderVictory = function() {
    var victory = $("<div><span>Congratulations</span><br />You win!</div>").addClass("victory");
    container.append(victory);
};

$(function() {
    var hash = window.location.hash;
    console.log(hash);
    if (hash === "#hard") {
        keys = ["red", "green", "blue", "blue", "green", "red", "red", "green", "blue"];
        edges = {"0313": "green", "0212": "blue", "4243": "red", "2324": "blue", "0304": "blue", "0001": "red", "1424": "red", "3242": "red", "1222": "green", "0010": "green", "3334": "green", "1314": "green", "1112": "red", "1323": "red", "2131": "red", "2434": "blue", "3040": "green", "2030": "red", "0414": "red", "3141": "red", "3444": "blue", "1020": "green", "0102": "green", "2223": "red", "2021": "blue", "1121": "green", "0203": "red", "4344": "red", "3233": "red", "1213": "blue", "2232": "blue", "3343": "red", "0111": "blue", "2122": "red", "1011": "blue", "3132": "green", "4142": "green", "2333": "red", "4041": "blue", "3031": "green"};
    } else {
        keys = ["red", "red", "green", "green", "blue", "blue", "blue", "red", "green"];
        edges = {"3444": "blue", "2324": "red", "0212": "blue", "1424": "blue", "1213": "red", "4344": "blue", "2030": "green", "1011": "blue", "4041": "blue", "2122": "red", "0111": "red", "3233": "red", "0313": "blue", "0414": "red", "3031": "red", "1121": "blue", "1112": "blue", "0001": "green", "1314": "green", "2232": "green", "1020": "blue", "1323": "green", "4142": "blue", "3141": "blue", "3343": "blue", "3242": "red", "2333": "blue", "0102": "green", "3334": "blue", "2434": "blue", "0010": "red", "1222": "blue", "0304": "blue", "2131": "blue", "2021": "red", "0203": "red", "3132": "blue", "4243": "blue", "2223": "green", "3040": "red"};
    }

    
    var container = $("#container");
    
    var drawNode = function(row, col) {
        var node = $("<div/>");
        node.addClass("node");
        place(node, row, col, 12);
        container.append(node);
    };
    
    var drawHitbox = function(row, col) {
        var hitbox = $("<div/>").addClass("node-hitbox")
        place(hitbox, row, col, 5); 
        hitbox.click(
            placerForPosition(row, col)
        );
        container.append(hitbox);
    };
    
    var drawHorizontalEdge = function(row, col) {
        var edge = $("<div/>").addClass("edge-horizontal");
        var edgeKey = "" + row + col + row + (col + 1);
        edge.addClass(edges[edgeKey]);
        place(edge, row, col, 18);
        container.append(edge);
    };
    
    var drawVerticalEdge = function(row, col) {
        var edge = $("<div/>").addClass("edge-vertical");
        var edgeKey = "" + row + col + (row + 1) + col;
        edge.addClass(edges[edgeKey]);
        place(edge, row, col, 18);
        container.append(edge);
    };
    
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            drawNode(row, col);
            drawHitbox(row, col);
            if (col < 4) {
                drawHorizontalEdge(row, col);
            }
            if (row < 4) {
                drawVerticalEdge(row, col);
            }
        }
    }
    
    var wheel = $("#wheel");
    for (var index = 0; index < 9; index++) {
        var key = $("<div />").addClass("key");
        var x = 80 + Math.sin(6.283 * index / 9) * 60;
        var y = 80 - Math.cos(6.283 * index / 9) * 60;
        key.css({ left: (x - 10) + "px", top: (y - 10) + "px"});
        wheel.append(key);
    }
    
    reset();
    $("#button-undo").click(performUndo);
    $("#button-redo").click(performRedo);
    $("#button-reset").click(reset);
});