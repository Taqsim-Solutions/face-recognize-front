import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getDashboardAbsentsQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";

export const TeacherDetails = ({ filter }) => {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const { data: absents } = useQuery({
    ...getDashboardAbsentsQuery({
      ...filter,
      DateFrom: "2023-09-01Z",
      PageIndex: page,
    }),
  });

  return (
    absents?.result.totalPages > 0 && (
      <div className="table-responsive basic-tbl">
        <div
          id="teacher-table_wrapper"
          className="dataTables_wrapper no-footer"
        >
          <table
            id="teacher-table"
            className="tech-data dataTable no-footer"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("school")}</th>
                <th>{t("class")}</th>
                <th className="text-end">{t("date_of_absent")}</th>
              </tr>
            </thead>
            <tbody>
              {absents?.result?.data.map((item, ind) => (
                <tr key={ind}>
                  <td>
                    {item.firstName} {item.lastName}
                  </td>
                  <td>{item.school.name}</td>
                  <td>
                    {item.class.degree}-{item.class.symbol}
                  </td>
                  <td>{item.notComingDate.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {absents?.result.totalPages > 1 && (
            <div>
              <div className="col-12 ps-3">
                <nav>
                  <ul
                    className="pagination pagination-gutter pagination-primary pagination-sm no-bg"
                    style={{
                      margin: "30px 0",
                      display: "flex",
                      justifyContent: "right",
                    }}
                  >
                    <li className="page-item page-indicator">
                      <p
                        className="page-link"
                        to="/email-inbox"
                        onClick={() => page > 0 && setPage(page - 1)}
                      >
                        <i className="la la-angle-left"></i>
                      </p>
                    </li>
                    {"page"
                      .repeat(absents?.result.totalPages - 1)
                      .split("page")
                      .map((number, i) => (
                        <li
                          key={i}
                          className={`page-item  ${
                            page === i + 1 ? "active" : ""
                          } `}
                          onClick={() => setPage(i + 1)}
                        >
                          <p className="page-link" to="/email-inbox">
                            {i + 1}
                          </p>
                        </li>
                      ))}

                    <li className="page-item page-indicator">
                      <p
                        className="page-link"
                        to="/email-inbox"
                        onClick={() =>
                          page + 1 < absents?.result.totalPages &&
                          setPage(page + 1)
                        }
                      >
                        <i className="la la-angle-right"></i>
                      </p>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};
