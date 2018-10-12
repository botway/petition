var canv = document.getElementById("canvSig");
var ctx = canv.getContext("2d");
var submit = document.getElementById("submit");
var sig = document.getElementById("sig");
var form = document.getElementsByClassName("form")[0];
var notice = document.getElementById("notice");
var signed = false;

ctx.strokeStyle = "black";
ctx.lineWidth = 1;
ctx.lineJoin = ctx.lineCap = "round";
var isDrawing,
    points = [];

canv.addEventListener("mousedown", function(e) {
    isDrawing = true;
    points.push({ x: e.offsetX, y: e.offsetY });
    canv.addEventListener("mousemove", drawSig);
    signed = true;
});

document.addEventListener("mouseup", function() {
    if (signed) {
        isDrawing = false;
        points.length = 0;
        canv.removeEventListener("mousemove", drawSig);
        sig.value = canv.toDataURL();
    }
});

function drawSig(e) {
    if (!isDrawing) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    points.push({ x: e.offsetX, y: e.offsetY });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}

submit.addEventListener("click", function() {
    if (signed) {
        form.submit();
    } else {
        notice.innerHTML = "Hey, put your sig on it!";
        notice.style.visibility = "visible";
    }
});
