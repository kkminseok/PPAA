export const getOneYearsAgo = () => {
    var today = new Date();
    return today.getFullYear() -1 + "/" + today.getMonth();
}
