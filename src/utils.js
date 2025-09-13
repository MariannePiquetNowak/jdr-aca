const toggleClass = () => {
    let modal = document.getElementById("modal");
    let body = document.querySelector("body");
    if(modal.classList.contains('open')) {
        modal.classList.remove('open');
        modal.classList.add('hide');
        body.style.overflow = 'auto';
    } else {
        modal.classList.remove('hide');
        modal.classList.add('open');
        body.style.overflow = 'hidden';
    }
}

export default toggleClass;