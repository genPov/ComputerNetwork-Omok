document.addEventListener("DOMContentLoaded", function() {
    var logoContainer = document.getElementById("logo-container");
    var content = document.getElementById("content");

    setTimeout(function() {
        logoContainer.classList.add("hidden");
        content.style.display = "block";
    }, 1200);
});