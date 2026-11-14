"""Resume PDF extraction and downloadable readiness-report generation."""
from io import BytesIO
from xml.sax.saxutils import escape
import fitz
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def read_resume_pdf(content: bytes) -> str:
    if not content:
        raise ValueError("Please upload a PDF")
    if len(content) > 5 * 1024 * 1024:
        raise ValueError("PDF must be 5 MB or smaller")
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise ValueError("The uploaded file is not a readable PDF") from exc
    try:
        if len(doc) > 12:
            raise ValueError("PDF must be 12 pages or fewer")
        text = "\n".join(page.get_text("text") for page in doc)
        if not text.strip():
            raise ValueError("No selectable text detected; scanned PDFs need OCR.")
        return text[:100_000]
    finally:
        doc.close()

def career_report_pdf(analysis: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title="JobPulse Career Readiness Report")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("JobPulse | Career Readiness Report", styles["Title"]),
        Spacer(1, 16),
        Paragraph("Target role: " + escape(analysis["role"]), styles["Normal"]),
        Paragraph("Keyword alignment score: " + str(analysis["score"]) + "%", styles["Heading2"]),
        Paragraph("This score measures keyword presence only; it does not predict hiring outcomes.", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("Detected skills", styles["Heading2"]),
        Paragraph(escape(", ".join(analysis["skills"]) or "None detected"), styles["Normal"]),
        Paragraph("Skills to develop", styles["Heading2"]),
        Paragraph(escape(", ".join(analysis["missing"]) or "No gaps in checklist"), styles["Normal"]),
        Paragraph("Recommended learning steps", styles["Heading2"]),
    ]
    for step in analysis["recommendations"]:
        line = step["skill"] + ": " + step["title"]
        if step["url"]:
            line += " - " + step["url"]
        story.append(Paragraph(escape(line), styles["Normal"]))
    story += [
        Spacer(1, 16),
        Paragraph("CareerCatalysts | Educational prototype. Skills are detected from keywords, not verified competencies. Demo market data is synthetic.", styles["Italic"])
    ]
    doc.build(story)
    return buffer.getvalue()
