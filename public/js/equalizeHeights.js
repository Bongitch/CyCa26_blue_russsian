function equalizeHeights() {
    const elements = document.querySelectorAll('.equal-height .col-md-6');
    let maxHeight = 200;

    elements.forEach(element => {
        maxHeight = Math.max(maxHeight, element.offsetHeight);
    });

    elements.forEach(element => {
        element.style.height = maxHeight + 'px';
    });
}

window.addEventListener('load', equalizeHeights);
window.addEventListener('resize', equalizeHeights);