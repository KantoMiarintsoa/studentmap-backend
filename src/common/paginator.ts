export interface PaginatedResult<T> {
    nextPage: number | null;
    previousPage: number | null;
    data: T[];
}

export function paginate<T>(
    { data, page = 1, pageSize = 20 }: { data: T[], page: number, pageSize?: number }): PaginatedResult<T> {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
        nextPage,
        previousPage: prevPage,
        data: paginatedData,
    }
}