export function mergeErrors(errorList) {
    // Filtrar y eliminar elementos undefined del array
    const filteredErrors = errorList.filter(error => error !== undefined);

    return filteredErrors.reduce((acc, error) => {
        Object.keys(error).forEach(key => {
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key] = acc[key].concat(error[key]);
        });
        return acc;
    }, {});
}