"""JobPulse | CareerCatalysts: career-intelligence teaching prototype."""
import os
import pandas as pd
import plotly.express as px
import streamlit as st
from jobpulse.core import (
    ROLE_SKILLS, illustrative_market_data, forecast_demand, analyze_resume, readiness_label,
)
from jobpulse.pdf import read_resume_pdf, career_report_pdf

st.set_page_config(page_title="JobPulse | CareerCatalysts", page_icon="📈", layout="wide")
st.markdown("""<style>
.stApp { background:#0c1423; color:#f3f7ff }
.block-container { max-width:1250px; padding-top:2rem }
[data-testid="stMetric"] { background:#152238; border:1px solid #30415d; border-radius:14px; padding:1rem }
h1,h2,h3 {letter-spacing:-.035em}
.stButton>button,.stDownloadButton>button {border-radius:12px}
</style>""", unsafe_allow_html=True)

st.caption("CAREERCATALYSTS / DATA SCIENCE & AUTOMATION")
st.title("JobPulse")
st.markdown("### AI-assisted career intelligence for students")
st.info(
    "DEMONSTRATION DATA: Market posting counts and predictions shown here are **synthetic**. "
    "They are NOT measured hiring data. Resume readiness is keyword alignment, not employment probability."
)

with st.sidebar:
    st.header("Explore")
    role = st.selectbox("Career goal", list(ROLE_SKILLS))
    months = st.slider("Forecast horizon (months)", 1, 12, 6)
    st.divider()
    st.caption("Resume text is analysed in your session. Only a skills summary is saved if you explicitly choose to save it while signed in.")
    st.caption("Streamlit · Pandas · Scikit-learn · Plotly · PyMuPDF · Supabase")

tab_market, tab_resume, tab_roadmap, tab_account = st.tabs([
    "📊 Market overview", "🔍 Resume intelligence", "🧭 Learning roadmap", "💾 Account & history",
])

with tab_market:
    market = illustrative_market_data()
    history = market[market["role"] == role]
    predicted = forecast_demand(market, role, months)
    latest, first = int(history["postings"].iloc[-1]), int(history["postings"].iloc[0])
    col1, col2, col3 = st.columns(3)
    col1.metric("Synthetic latest posting count", f"{latest:,}")
    col2.metric("Synthetic series growth", f"{(latest / first - 1) * 100:+.1f}%")
    col3.metric("Illustrative projected count", f"{int(predicted['postings'].iloc[-1]):,}")
    chart = pd.concat([
        history.assign(type="Synthetic history"),
        predicted.assign(type="Illustrative projection"),
    ], ignore_index=True)
    fig = px.line(
        chart, x="month", y="postings", color="type", markers=True,
        labels={"month":"Month", "postings":"Synthetic posting count", "type":"Data series"},
    )
    fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)",
                      plot_bgcolor="rgba(0,0,0,0)", legend_title_text="")
    st.plotly_chart(fig, use_container_width=True)
    st.caption(
        "The projection uses a simple Ridge trend extrapolation on synthetic counts; "
        "it has no out-of-time validation, uncertainty intervals, or real employer observations."
    )
    st.subheader("Skills checklist")
    st.write(" · ".join(ROLE_SKILLS[role]))

with tab_resume:
    st.subheader("Find skills and gaps from your resume")
    uploaded = st.file_uploader("Upload text-based PDF (max 5 MB, 12 pages)", type=["pdf"])
    pasted = st.text_area(
        "Or paste resume text", height=150,
        placeholder="Experience, projects, skills, tools, coursework…",
    )
    if st.button("Analyse career readiness", type="primary"):
        try:
            content = read_resume_pdf(uploaded.getvalue()) if uploaded else pasted
            st.session_state["analysis"] = analyze_resume(content, role)
        except ValueError as exc:
            st.error(str(exc))
        except Exception:
            st.error("Could not read that resume. Check the PDF and try again.")
    analysis = st.session_state.get("analysis")
    if analysis:
        if analysis["role"] != role:
            st.warning("The current analysis is for another career. Analyse again for the selected goal.")
        else:
            st.metric("Keyword alignment with role checklist", f"{analysis['score']}%")
            st.caption(readiness_label(analysis["score"]))
            matched_col, missing_col = st.columns(2)
            with matched_col:
                st.success("Detected from checklist: " + (", ".join(analysis["matched"]) or "None"))
            with missing_col:
                st.warning("Not detected: " + (", ".join(analysis["missing"]) or "None"))
            st.download_button(
                "Download career readiness report (PDF)", data=career_report_pdf(analysis),
                file_name="jobpulse-career-report.pdf", mime="application/pdf",
            )

with tab_roadmap:
    st.subheader("Personalised learning path")
    analysis = st.session_state.get("analysis")
    if not analysis or analysis["role"] != role:
        st.write("Analyse your resume to get personalised recommendations. Here is your role checklist:")
        for number, skill in enumerate(ROLE_SKILLS[role], 1):
            st.write(f"{number}. {skill}")
    else:
        if not analysis["recommendations"]:
            st.success("Every keyword in this checklist was detected. Demonstrate your skills with portfolio projects.")
        for number, item in enumerate(analysis["recommendations"], 1):
            with st.expander(f"Step {number} · {item['skill']}", expanded=number == 1):
                st.write("Study fundamentals, build a small practice project, and document your work.")
                if item["url"]:
                    st.markdown(f"[{item['title']}]({item['url']})")
                else:
                    st.write("Search for the official documentation or a reputable free course.")

with tab_account:
    st.subheader("Private cloud history")
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    if not url or not key:
        st.info("Cloud authentication is not configured. Resume analysis, graphs and reports still work.")
    else:
        from supabase import create_client
        client = create_client(url, key)
        if "sb_access_token" not in st.session_state:
            mode = st.radio("Access", ["Sign in", "Sign up"], horizontal=True)
            email = st.text_input("Email address")
            password = st.text_input("Password", type="password")
            if st.button(mode):
                if not email.strip() or len(password) < 6:
                    st.error("Provide an email address and password (minimum 6 characters).")
                else:
                    try:
                        if mode == "Sign up":
                            client.auth.sign_up({"email": email.strip(), "password": password})
                            st.success("Registration sent. Verify your email if requested, then sign in.")
                        else:
                            response = client.auth.sign_in_with_password({
                                "email": email.strip(), "password": password,
                            })
                            if response.session is None:
                                st.warning("Please verify your email before signing in.")
                            else:
                                st.session_state["sb_access_token"] = response.session.access_token
                                st.session_state["sb_refresh_token"] = response.session.refresh_token
                                st.rerun()
                    except Exception:
                        st.error("Authentication could not be completed. Please check your details.")
        else:
            try:
                session = client.auth.set_session(
                    st.session_state["sb_access_token"],
                    st.session_state["sb_refresh_token"],
                )
                if session and session.session:
                    st.session_state["sb_access_token"] = session.session.access_token
                    st.session_state["sb_refresh_token"] = session.session.refresh_token
                user = client.auth.get_user().user
                if user is None:
                    raise RuntimeError("Session no longer valid")
                st.write(f"Signed in: {user.email}")
                if st.button("Save current analysis"):
                    analysis = st.session_state.get("analysis")
                    if not analysis or analysis["role"] != role:
                        st.warning("Analyse your resume for the selected career first.")
                    else:
                        client.table("resume_analyses").insert({
                            "user_id": user.id,
                            "target_role": analysis["role"],
                            "detected_skills": analysis["skills"],
                            "missing_skills": analysis["missing"],
                            "readiness_score": analysis["score"],
                            "recommendations": analysis["recommendations"],
                        }).execute()
                        st.success("Saved skills summary only; the original PDF and resume text are not stored.")
                records = (client.table("resume_analyses")
                           .select("id,target_role,readiness_score,created_at")
                           .order("created_at", desc=True).limit(15).execute().data)
                if records:
                    st.dataframe(pd.DataFrame(records), hide_index=True, use_container_width=True)
                else:
                    st.caption("No saved analyses yet.")
                if st.button("Sign out"):
                    client.auth.sign_out()
                    for token in ["sb_access_token", "sb_refresh_token"]:
                        st.session_state.pop(token, None)
                    st.rerun()
            except Exception:
                st.error("Cloud history is temporarily unavailable or your session has expired.")
                if st.button("Clear session"):
                    for token in ["sb_access_token", "sb_refresh_token"]:
                        st.session_state.pop(token, None)
                    st.rerun()

st.divider()
st.caption("JobPulse by CareerCatalysts · Educational prototype. Do not use keyword scores for hiring decisions.")
