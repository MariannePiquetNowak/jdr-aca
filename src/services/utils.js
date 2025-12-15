export const openModal = (id) => {
    let modal = document.getElementById(id);
    let body = document.querySelector("body");

    if(!modal.classList.contains('open')) {
        modal.classList.remove('hide');
        modal.classList.add('open');
        body.style.overflow = 'hidden';
    } 
    
    // Gestion de fermeture si on change via les liens 
    if (id === "inventory") {
        document.getElementById("notes").classList.remove('open');
        document.getElementById("notes").classList.add('hide');
    }
    
    if (id === "notes") {
        document.getElementById("inventory").classList.remove('open');
        document.getElementById("inventory").classList.add('hide');
    }
}

export const closeModal = (id) => {
    let modal = document.getElementById(id);
    let body = document.querySelector("body");
    if(modal.classList.contains('open')) {
        modal.classList.remove('open');
        modal.classList.add('hide');
        body.style.overflow = 'auto';
    } 
}

/**
 * Build a public image URL using the REACT_APP_BASE_URL env var if present.
 * - `path` should be an absolute path (starting with `/`) or a relative path.
 * - If REACT_APP_BASE_URL is not set, the function returns a path that will
 *   work from the current site root (useful for files served from public/images).
 */
export const remoteImage = (path) => {
    if (!path) return path;
    // If path is already an absolute URL (http://, https://), protocol-relative (//),
    // or a data/blob/other URI scheme (data:, blob:, etc.), return as-is
    if (/^(https?:)?\/\//i.test(path)) return path;
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
    const base = process.env.REACT_APP_BASE_URL || '';
    const normalizedBase = base.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
}