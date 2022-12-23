export const getFileTag = (fname: String): String => {
    let fsplit = fname.split('-');
    let tag = fsplit[fsplit.length-1];
    tag = tag.replace('.zip', '');

    return tag;
};