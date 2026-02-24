export const getPagination = (page, limit, totalItems) => {
    const currentPage = parseInt(page, 10) || 1;
    const itemsPerPage = parseInt(limit, 10) || 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        startIndex,
        endIndex,
    };
};