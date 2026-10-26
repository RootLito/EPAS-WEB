import XLSX from "xlsx-js-style";
import { Event } from "@/types/event";
import { AttendanceRow } from "@/types/attendance";

export function exportAttendanceToExcel(
    event: Event,
    attendanceRows: AttendanceRow[]
) {
    // Filter to include ONLY users who have at least one scan record
    const scannedRows = attendanceRows.filter(
        (row) =>
            row.firstScanTime !== null ||
            row.time_in !== null ||
            row.break_out !== null ||
            row.break_in !== null ||
            row.time_out !== null
    );

    if (scannedRows.length === 0) return;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return "—";
        return new Date(isoString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formattedStartDate = formatDate(event.start_date);
    const formattedEndDate = formatDate(event.end_date);
    const dateRangeString =
        formattedStartDate === formattedEndDate
            ? formattedStartDate
            : `${formattedStartDate} - ${formattedEndDate}`;

    // Build raw 2D sheet matrix matching your sketch layout
    const sheetData: (string | null)[][] = [
        [(event.title || "EVENT TITLE").toUpperCase()], // Row 1: CAPSLOCK BOLD TITLE
        [event.venue?.address || "N/A"],                 // Row 2: Venue address
        [dateRangeString],                              // Row 3: Start - End Date
        [],                                             // Row 4: Blank Space
        ["Name", "Office", "Time In", "Break Out", "Break In", "Time Out"], // Row 5: Table Header
    ];

    // Append ONLY scanned participant data rows
    scannedRows.forEach((row) => {
        sheetData.push([
            row.name,
            row.office,
            formatTime(row.time_in),
            formatTime(row.break_out),
            formatTime(row.break_in),
            formatTime(row.time_out),
        ]);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Style: Row 1 (Event Title - Bold & Large)
    if (worksheet["A1"]) {
        worksheet["A1"].s = {
            font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0F172A" } },
        };
    }

    // Style: Row 2 (Venue Address)
    if (worksheet["A2"]) {
        worksheet["A2"].s = {
            font: { name: "Arial", sz: 11, color: { rgb: "334155" } },
        };
    }

    // Style: Row 3 (Date Range)
    if (worksheet["A3"]) {
        worksheet["A3"].s = {
            font: { name: "Arial", sz: 11, color: { rgb: "475569" } },
        };
    }

    // Style: Row 5 (Table Headers with #395886 background, bold white text)
    const headerCols = ["A", "B", "C", "D", "E", "F"];
    headerCols.forEach((col) => {
        const cellRef = `${col}5`;
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
                font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "395886" } }, // #395886 background
                alignment: { vertical: "center", horizontal: "left" },
                border: {
                    top: { style: "thin", color: { rgb: "1E293B" } },
                    bottom: { style: "thin", color: { rgb: "1E293B" } },
                    left: { style: "thin", color: { rgb: "1E293B" } },
                    right: { style: "thin", color: { rgb: "1E293B" } },
                },
            };
        }
    });

    // Style: Data Rows (Thin borders)
    const totalRows = sheetData.length;
    for (let r = 6; r <= totalRows; r++) {
        headerCols.forEach((col) => {
            const cellRef = `${col}${r}`;
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = {
                    font: { name: "Arial", sz: 10, color: { rgb: "1E293B" } },
                    border: {
                        top: { style: "thin", color: { rgb: "E2E8F0" } },
                        bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                        left: { style: "thin", color: { rgb: "E2E8F0" } },
                        right: { style: "thin", color: { rgb: "E2E8F0" } },
                    },
                };
            }
        });
    }

    // Column widths
    worksheet["!cols"] = [
        { wch: 28 }, // Name
        { wch: 24 }, // Office
        { wch: 14 }, // Time In
        { wch: 14 }, // Break Out
        { wch: 14 }, // Break In
        { wch: 14 }, // Time Out
    ];

    // Export workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Attendance for ${(event.title || "Report").replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}