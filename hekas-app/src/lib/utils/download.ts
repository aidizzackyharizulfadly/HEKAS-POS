/**
 * File download helpers (CSV, JSON, PDF, etc).
 */

/** Trigger browser download untuk string content. */
export function downloadFile(
	content: string,
	filename: string,
	mimeType = 'text/plain;charset=utf-8'
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	triggerDownload(url, filename);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Trigger download dari Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	triggerDownload(url, filename);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Trigger download dari URL (signed URL, blob URL, atau URL biasa). */
export function downloadFromUrl(url: string, filename: string): void {
	triggerDownload(url, filename);
}

function triggerDownload(url: string, filename: string): void {
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/** Download CSV dengan BOM (supaya Excel auto-detect UTF-8). */
export function downloadCSV(rows: (string | number)[][], filename: string): void {
	const csv = rows
		.map((row) =>
			row
				.map((cell) => {
					const s = String(cell);
					// Escape quotes & wrap kalau ada koma/newline
					if (s.includes(',') || s.includes('"') || s.includes('\n')) {
						return `"${s.replace(/"/g, '""')}"`;
					}
					return s;
				})
				.join(',')
		)
		.join('\n');
	// Prepend BOM untuk Excel
	downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
}
