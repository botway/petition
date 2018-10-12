var button = document.getElementsByTagName("BUTTON")[0];
var inputs = document.getElementsByTagName("INPUT");
var notice = document.getElementById("notice");
var form = document.getElementById("form");

button.addEventListener("click", () => {
    var hasFilled = true;
    [].slice.call(inputs).forEach(e => {
        if (e.value == "") hasFilled = false;
    });

    if (hasFilled) {
        form.submit();
    } else {
        // notice.style.visibility = "visible";
    }
});
