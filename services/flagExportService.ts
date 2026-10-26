import XLSX from "xlsx-js-style";
import { FlagAttendanceRow } from "@/services/flagAttendanceService";

interface FlagExportMetadata {
    ceremonyType: string;
    month: string;
    dayNum: number;
    year: string;
    formattedDate: string;
}

export function exportFlagAttendanceToExcel(
    meta: FlagExportMetadata,
    rows: FlagAttendanceRow[]
) {
    if (rows.length === 0) return;

    const titleString = `${meta.ceremonyType.toUpperCase()} ATTENDANCE`;
    const dateString = `${meta.month} ${meta.dayNum}, ${meta.year}`;

    const sheetData: (string | null)[][] = [
        [titleString],
        ["Admin Grounds"],
        [dateString],
        [],
        ["Name", "Office", "Ceremony Type", "Status", "Scan Time"],
    ];

    rows.forEach((row) => {
        sheetData.push([
            row.user?.fullname || "Unknown User",
            row.user?.office || "—",
            row.ceremony_type,
            row.status,
            row.scan_time || "—",
        ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    if (worksheet["A1"]) {
        worksheet["A1"].s = {
            font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0F172A" } },
        };
    }
    if (worksheet["A2"]) {
        worksheet["A2"].s = {
            font: { name: "Arial", sz: 11, color: { rgb: "334155" } },
        };
    }
    if (worksheet["A3"]) {
        worksheet["A3"].s = {
            font: { name: "Arial", sz: 11, color: { rgb: "475569" } },
        };
    }

    const headerCols = ["A", "B", "C", "D", "E"];
    headerCols.forEach((col) => {
        const cellRef = `${col}5`;
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
                font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "395886" } },
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

    worksheet["!cols"] = [
        { wch: 28 },
        { wch: 24 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flag Attendance");

    const fileName = `Flag_Attendance_${meta.ceremonyType.replace(/\s+/g, "_")}_${meta.year}-${meta.month}-${meta.dayNum}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}