import React, { useState } from "react";

const Pagination = ({ totalPages, onPageChange }) => {
  // Set initial state for the current page
  const [currentPage, setCurrentPage] = useState(1);

  const maxPagesToShow = 5; // Number of pages to show in the pagination
  const half = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    onPageChange(newPage);
  };

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    totalPages > 1 && (
      <div
        className="pagination-container my-10"
        style={{
          margin: "25px 75px",
          display: "flex",
          justifyContent: "right",
        }}
      >
        <ul className="pagination pagination-sm no-bg">
          <li
            className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          >
            <span className="page-link">
              <i className="la la-angle-left"></i>
            </span>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item" onClick={() => handlePageChange(1)}>
                <span className="page-link">1</span>
              </li>
              {startPage > 2 && (
                <li className="page-item">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {pages.map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              <span className="page-link">{page}</span>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item">
                  <span className="page-link">...</span>
                </li>
              )}
              <li
                className="page-item"
                onClick={() => handlePageChange(totalPages)}
              >
                <span className="page-link">{totalPages}</span>
              </li>
            </>
          )}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
          >
            <span className="page-link">
              <i className="la la-angle-right"></i>
            </span>
          </li>
        </ul>
      </div>
    )
  );
};

export default Pagination;
