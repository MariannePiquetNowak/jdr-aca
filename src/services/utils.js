export const openModal = (id) => {
    let modal = document.getElementById(id);
    console.log("que se passe-til ?", modal)
    let body = document.querySelector("body");
    if(!modal.classList.contains('open')) {
        modal.classList.remove('hide');
        modal.classList.add('open');
        body.style.overflow = 'hidden';
    } 
}

export const closeModal = (id) => {
    let modal = document.getElementById(id);
    console.log("que se passe-til ?", modal)
    let body = document.querySelector("body");
    if(modal.classList.contains('open')) {
        modal.classList.remove('open');
        modal.classList.add('hide');
        body.style.overflow = 'auto';
    } 
}