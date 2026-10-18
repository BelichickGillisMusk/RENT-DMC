from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
import json

BASE=Path("/Users/silverbackai.agency/Desktop/04-CREATIVE/06-IT/Files/BRYAN-BRIEFS/UNDEFEATED-SOLAR-GOV")
OUT=BASE/'output'/'pdf'
TMP=BASE/'tmp'/'pdfs'
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
FONT=Path('/Users/silverbackai.agency/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts')
pdfmetrics.registerFont(TTFont('Sales',str(FONT/'LiberationSans-Regular.ttf')))
pdfmetrics.registerFont(TTFont('SalesBold',str(FONT/'LiberationSans-Bold.ttf')))
pdfmetrics.registerFontFamily('Sales',normal='Sales',bold='SalesBold')
navy=HexColor('#0c1a2e'); gold=HexColor('#f0b429'); ink=HexColor('#182b40'); muted=HexColor('#506073'); pale=HexColor('#f1f5f8'); line=HexColor('#dbe2e9')
p=OUT/'UNDEFEATED-Solar-CA-Government-Sales-Sheet-2026.pdf'
c=canvas.Canvas(str(p),pagesize=(612,792))
c.setTitle('UNDEFEATED Solar | California + Government | 2028-2036')
c.setAuthor('UNDEFEATED Solar')
c.setSubject('Current solar canopy value and potential upgrade pathway for public facilities')
def para(text,x,top,w,size=9.6,leading=12.6,color=ink,bold=False):
    st=ParagraphStyle('p',fontName='SalesBold' if bold else 'Sales',fontSize=size,leading=leading,textColor=color,spaceBefore=0,spaceAfter=0)
    q=Paragraph(text,st); aw,ah=q.wrap(w,800)
    assert top-ah >= 16, (text,top,ah)
    q.drawOn(c,x,top-ah)
    return ah
def txt(text,x,y,size=10,font='Sales',color=ink):
    c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,text)
def feature(title,body,x,top,w):
    h=para(title,x,top,w,10.3,12.5,navy,True)
    h2=para(body,x,top-h-4,w,9.5,12.3)
    return h+h2+15

# Brand and proposition.
c.setFillColor(navy);c.rect(0,642,612,150,fill=1,stroke=0)
c.setFillColor(gold);c.circle(51,755,14,fill=1,stroke=0)
c.setFillColor(navy);c.setFont('SalesBold',11);c.drawCentredString(51,751,'US')
txt('UNDEFEATED',76,754,15,'SalesBold',white)
txt('SOLAR',187,754,15,'SalesBold',gold)
txt('CALIFORNIA + GOVERNMENT',381,756,8.5,'SalesBold',gold)
txt('Public power today.',38,711,27,'SalesBold',white)
txt('Room to grow tomorrow.',38,681,27,'SalesBold',white)
para('Tracking solar canopies for public facilities, with a path to storage, charging and site controls.',38,667,530,10.4,13.2,white)

# Three sourced demand signals; no market-size implication.
cards=[
('2035','California state-agency renewable and zero-carbon electricity target. [1]'),
('6,000 MW','California reliability capacity ordered for 2030-2032; not solar-only. [2]'),
('11.8%','U.S. data-center share of electricity in 2030, reference forecast. [3]')]
for i,(number,body) in enumerate(cards):
    x=38+i*182
    c.setFillColor(pale);c.roundRect(x,557,172,69,6,fill=1,stroke=0)
    txt(number,x+12,602,18,'SalesBold',navy)
    para(body,x+12,591,148,8.4,10.3,muted)

# Current hardware and conditional additions.
txt('CURRENT OFFER',38,536,10.5,'SalesBold',navy)
txt('POTENTIAL UPGRADES',320,536,10.5,'SalesBold',navy)
c.setStrokeColor(gold);c.setLineWidth(2);c.line(38,526,292,526);c.line(320,526,574,526)
left=[
('Generate where people park','Tracking canopies can offset daytime electricity use and provide shade.'),
('Plan around public fleets','Match the layout to parking, vehicle dwell times and charging requirements.'),
('Specify measurable performance','Contract for site-specific yield, monitoring, warranty and approved engineering. [4]')]
right=[
('Managed charging','Coordinate chargers with site power limits and vehicle departure times.'),
('Storage + resilience','Shift energy to later hours; protect defined loads with engineered islanding. [5]'),
('AI-aware site operation','Coordinate explicitly flexible compute with solar, storage and grid conditions.')]
for x,items in [(38,left),(320,right)]:
    top=513
    for title,body in items:
        top-=feature(title,body,x,top,254)
    assert top>=337,top
para('Upgrade concepts require compatible equipment, OEM access and engineering validation; they are not committed product releases.',320,350,254,8.0,10.1,muted)

# Outlook: proposed sales sequence, not a demand forecast.
txt('A 2-10 YEAR SALES OUTLOOK',38,317,11,'SalesBold',navy)
txt('Planning pathway from October 2026; timing follows each site and procurement.',38,302,8.8,'Sales',muted)
phases=[
('2 YEARS | THROUGH 2028','Sell the base system','Target public parking, fleet depots, campuses and suitable daytime loads. Price future electrical and data provisions upfront.'),
('3-5 YEARS | 2029-2031','Add value as loads grow','Offer validated charging control, storage dispatch and performance reporting. Engineer outage support where the mission requires it.'),
('6-10 YEARS | 2032-2036','Expand around proven sites','Support the 2035 state-agency target. Evaluate approved microgrid and flexible-compute integration; refresh components as needed.')]
for i,(year,title,body) in enumerate(phases):
    x=38+h*182
    c.setFillColor(gold);c.circle(x+4,281,3,fill=1,stroke=0)
    if i<2:
        c.setStrokeColor(line);c.setLineWidth(1);c.line(x+10,281,x+176,281)
    txt(year,x,266,8.4,'SalesBold',muted)
    para(title,x,255,172,10.6,13,navy,True)
    para(body,x,235,167,9.0,11.8)

# Public-sector fit, ownership neutral, no certification claim.
c.setFillColor(pale);c.roundRect(38,132,536,45,5,fill=1,stroke=0)
para('<b>PUBLIC BUYERS:</b> State and local agencies, public campuses, water districts and federal installations. Match each opportunity to its buying rules. SB/WBE/WOSB advantages apply only where eligibility and certification are verified.',50,166,512,8.7,11.2)

# Concrete buyer next step.
txt('START WITH ONE SITE.',38,111,12,'SalesBold',navy)
para('Bring the utility bill, interval load data, parking plan and fleet or critical-load priorities. Build a current-spec offer with separately priced upgrade options.',38,101,536,9.4,12.1)

# Clickable primary references; concise and readable in print.
sources=[
('1. CA Senate - SB 1020','https://sd17.senate.ca.gov/news/governor-newsom-signs-clean-energy-jobs-and-affordability-act-2022'),
('2. CPUC - Procurement orders','https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-power-procurement/long-term-procurement-planning/more-information-on-authorizing-procurement/irp-procurement-track'),
('3. Berkeley Lab - June 2026 update','https://datacenters.lbl.gov/publications/united-states-data-center-energy-2025'),
('4. Supplier - Current offering','https://www.scarlet.red/how-to-deploy'),
('5. DOE - Microgrid basics','https://www.energy.gov/cmei/systems/solar-integration-distributed-energy-resources-and-microgrids-basics')]
txt('EVIDENCE',38,61,7.2,'SalesBold',muted)
for label,url,x,y in [(sources[0][0],sources[0][1],87,61),(sources[1][0],sources[1][1],245,61),(sources[2][0],sources[2][1],411,61),(sources[3][0],sources[3][1],87,48),(sources[4][0],sources[4][1],245,48)]:
    txt(label,x,y,7.0,'Sales',muted)
    width=pdfmetrics.stringWidth(label,'Sales',7.0)
    c.linkURL(url,(x,y-2,x+width,y+8),relative=0,thickness=0)
c.setStrokeColor(line);c.line(38,36,574,36)
txt('UNDEFEATEDSOLAR.COM',38,22,8.2,'SalesBold',navy)
c.linkURL('https://undefeatedsolar.com',(38,19,167,31),relative=0,thickness=0)
txt('Planning sheet | October 12, 2026 | Site-specific performance and approvals',250,22,7,'Sales',muted)
c.showPage();c.save()
r=PdfReader(str(p));assert len(r.pages)==1
t=r.pages[0].extract_text()
for expected in ['2035','6,000 MW','11.8%','2028','2029-2031','2032-2036','CURRENT OFFER','POTENTIAL UPGRADES']:
    assert expected in t,expected
(TMP/'sales-sheet-extracted.txt').write_text(t)
print(json.dumps({'pdf':str(p),'pages':len(r.pages),'words':len(t.split()),'links':len(r.pages[0].get('/Annots',[]))}))

