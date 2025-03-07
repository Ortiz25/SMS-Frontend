// Generate page numbers for pagination

export const getPageNumbers = (searchParams, count) => {
  // Pagination state
  const itemsPerPage = 5;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const totalPages = Math.ceil(count / itemsPerPage);
  const pageNumbers = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're at the start or end
    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 2);
    }

    // Add ellipsis if needed before middle pages
    if (startPage > 2) {
      pageNumbers.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis if needed after middle pages
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Always show last page
    pageNumbers.push(totalPages);
  }

  return pageNumbers;
};
