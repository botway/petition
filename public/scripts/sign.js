var canv = document.getElementById("canvSig");
var ctx = canv.getContext("2d");
var button = document.getElementById("submit");
var sig = document.getElementById("sig");
var form = document.getElementById("signForm");
var inputs = document.getElementsByTagName("INPUT");
var notice = document.getElementById("notice");
var signed = false;

canv.addEventListener("mousedown", function(e) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.beginPath();
    canv.addEventListener("mousemove", drawSig);
});

canv.addEventListener("mouseup", function() {
    canv.removeEventListener("mousemove", drawSig);
    signed = true;
    sig.value = canv.toDataURL();
});

function drawSig(e) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

button.addEventListener("click", function() {
    [].slice.call(inputs).forEach(e => {
        if (e.value == "") signed = false;
    });
    if (signed) {
        form.submit();
    } else {
        notice.style.visibility = "visible";
    }
});
