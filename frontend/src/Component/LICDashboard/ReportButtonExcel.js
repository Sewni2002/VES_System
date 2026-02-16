import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ReportButtonExcel({ schedules }) {
  const generateExcel = () => {
    const worksheetData = schedules.map((s) => ({
      SessionID: s.sessionId,
      GroupTopic: s.groupTopic,
      Instructor: s.instructorId,
      Date: new Date(s.scheduledDateTime).toLocaleDateString(),
      Time: `${s.startTime} - ${s.endTime}`,
      Hall: s.hallNumber,
      Status: s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);

    const colWidths = Object.keys(worksheetData[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...worksheetData.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(maxLength + 5, 50) };
    });

    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "SchedulesReport.xlsx");
  };

  return (
    <button className="btn-p" onClick={generateExcel}>
      Download
    </button>
  );
}

export default ReportButtonExcel;
