document.addEventListener('DOMContentLoaded', () => {
    const hmbButton = document.querySelector('header .hmb-button');
    const nav = document.querySelector('header nav');

    if (hmbButton && nav) {
        hmbButton.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
});