import { useQuery } from "@tanstack/react-query";
import { getDashboardAbsentsQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Pagination from "../../Pagination/Pagination";

export const TeacherDetails = ({ filter }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data: absents } = useQuery({
    ...getDashboardAbsentsQuery({
      ...filter,
      PageIndex: page,
      isDescending: false,
    }),
  });

  return (
    <div className="table-responsive basic-tbl">
      <div id="teacher-table_wrapper" className="dataTables_wrapper no-footer">
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
      </div>
      <Pagination
        onPageChange={(page) => setPage(page)}
        totalPages={absents?.result.totalPages}
      />
    </div>
  );
};
