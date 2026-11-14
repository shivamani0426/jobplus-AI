"""PDF output from validated analysis data; XML-escape user-influenced content."""
from __future__ import annotations
from io import BytesIO
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def render_pdf(analysis: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=52, bottomMargin=48)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("titlejp", parent=styles["Title"], fontSize=21, textColor=colors.HexColor("#17213C"), spaceAfter=12)
    body = ParagraphStyle("bodyjp", parent=styles["BodyText"], fontSize=10, leading=15, spaceAfter=10)
    note = ParagraphStyle("notejp", parent=body, textColor=colors.HexColor("#555F73"), fontSize=9)
    safe = lambda s: escape(str(s))
    story = [Paragraph("JOBPULSE / Career intelligence", title),
             Paragraph("Your personal skill-gap report", styles["Heading2"]),
             Paragraph("Target role: " + safe(analysis["role"]), body),
             Paragraph("Weighted keyword alignment: " + str(analysis["score"]) + "%", styles["Heading2"]),
             Paragraph("<b>What this means:</b> A weighted match against a curated keyword checklist. It does not measure proficiency or hiring probability.", note),
             Spacer(1, 8)]
    for name, items in (("Detected role skills", analysis["matched"]), ("Skills to strengthen", analysis["missing"])):
        story.append(Paragraph(name, styles["Heading2"]))
        story.append(Paragraph(safe(", ".join(item["skill"] for item in items) or "None in checklist"), body))
    story.append(Paragraph("Suggested learning actions", styles["Heading2"]))
    for i, item in enumerate(analysis["roadmap"], 1):
        story.append(Paragraph(f"<b>{i}. {safe(item['skill'])}</b> — {safe(item['resource_title'])}", body))
        if item.get("resource_url"):
            story.append(Paragraph(safe(item["resource_url"]), note))
    story.append(Spacer(1, 16))
    story.append(Paragraph("JobPulse by CareerCatalysts · Educational prototype. Resume text is processed transiently and isn't saved in the report database.", note))
    doc.build(story)
    return buf.getvalue()
