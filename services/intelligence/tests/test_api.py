from io import BytesIO
import pytest
from fastapi.testclient import TestClient
from reportlab.pdfgen.canvas import Canvas
from app.analysis import analyze, extract_skills
from app.market import market
from app.main import app

c=TestClient(app)

SAMPLE="I built a team data product using Python, SQL, Pandas, NumPy, scikit-learn, Git, and statistics."

def test_health():
    assert c.get('/healthz').json()['version']=='3.0.0'

def test_roles():
    x=c.get('/v1/roles').json()['roles']
    assert len(x)==6 and all(len(z['skills'])==10 for z in x)

@pytest.mark.parametrize('role',["data-scientist","data-analyst","ml-engineer","backend-engineer","frontend-engineer","cybersecurity-analyst"])
def test_market_explicitly_synthetic(role):
    res=c.get('/v1/market',params={'role_id':role,'horizon':6})
    assert res.status_code==200
    data=res.json()
    assert data['data_status']=='synthetic_demo'
    assert data['can_make_real_world_claims'] is False
    assert len(data['history'])==18 and len(data['forecast'])==6
    assert all(item['count']>=0 for item in data['forecast'])

def test_market_invalid_role():
    assert c.get('/v1/market',params={'role_id':'not-a-role'}).status_code==422

def test_market_invalid_window():
    assert c.get('/v1/market',params={'horizon':100}).status_code==422

def test_skill_boundaries():
    out=extract_skills('JavaScript, NoSQL, React and GitHub')
    assert 'Java' not in out
    assert 'SQL' not in out
    assert 'JavaScript' in out
    assert 'Git' in out

def test_analyze_score_and_evidence():
    response=c.post('/v1/analyze/text',json={'role_id':'data-scientist','text':SAMPLE})
    assert response.status_code==200
    data=response.json()
    assert data['score_type']=='weighted_keyword_alignment'
    assert any(x['skill']=='SQL' for x in data['matched'])
    assert any(x['skill']=='Cloud' for x in data['missing'])
    assert 'SQL' in data['detected_skills']
    assert 0<=data['score']<=100

def test_analyze_too_short():
    assert c.post('/v1/analyze/text',json={'role_id':'data-scientist','text':'abc'}).status_code==422

def test_analyze_unknown_role():
    assert c.post('/v1/analyze/text',json={'role_id':'fake','text':SAMPLE}).status_code==422

def test_analyze_pdf():
    buf=BytesIO()
    canvas=Canvas(buf)
    canvas.drawString(40,700,'I built data dashboards with Python SQL Pandas and Statistics for clients')
    canvas.save()
    data=c.post('/v1/analyze/pdf',data={'role_id':'data-scientist'},files={'file':('resume.pdf',buf.getvalue(),'application/pdf')})
    assert data.status_code==200
    assert data.json()['score']>0

def test_reject_nonpdf():
    res=c.post('/v1/analyze/pdf',data={'role_id':'data-scientist'},files={'file':('resume.txt',b'not a pdf','text/plain')})
    assert res.status_code==415

def test_reject_fake_pdf():
    res=c.post('/v1/analyze/pdf',data={'role_id':'data-scientist'},files={'file':('resume.pdf',b'not a pdf','application/pdf')})
    assert res.status_code==422

def test_reject_large_pdf():
    res=c.post('/v1/analyze/pdf',data={'role_id':'data-scientist'},files={'file':('large.pdf',b'%PDF-'+b'x'*(5*1024*1024+1),'application/pdf')})
    assert res.status_code==413

def test_report_roundtrip():
    raw=analyze(SAMPLE,'data-scientist')
    res=c.post('/v1/report',json=raw)
    assert res.status_code==200
    assert res.content.startswith(b'%PDF')
    assert res.headers.get('cache-control')=='no-store'

def test_report_reject_invalid():
    raw=analyze(SAMPLE,'data-scientist')
    raw['score']=900
    assert c.post('/v1/report',json=raw).status_code==422
