document.addEventListener("DOMContentLoaded", () => {
    let hmbButton = document.querySelector("header .hmb-button");
    let nav = document.querySelector("header nav");

    if (hmbButton && nav) {
        hmbButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle("hidden");
        });
    }
});
