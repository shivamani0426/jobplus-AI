"""Safely extract selectable text from small PDFs. No permanent file storage."""
from __future__ import annotations
import pymupdf

MAX_PDF_BYTES = 5 * 1024 * 1024
MAX_PAGES = 12


def extract_pdf(raw: bytes) -> str:
    if not raw or not raw.startswith(b"%PDF-"):
        raise ValueError("Please upload a valid PDF file.")
    if len(raw) > MAX_PDF_BYTES:
        raise ValueError("PDF files must be at most 5 MB.")
    try:
        doc = pymupdf.open(stream=raw, filetype="pdf")
        try:
            if doc.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported.")
            if doc.page_count > MAX_PAGES:
                raise ValueError("Resumes must contain no more than 12 pages.")
            extracted = "\n".join(page.get_text("text") for page in doc)
            if not extracted.strip():
                raise ValueError("No selectable text found. Please paste the resume text instead.")
            return extracted[:120_000]
        finally:
            doc.close()
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("Unable to read the PDF. Try another PDF or paste resume text.") from exc
