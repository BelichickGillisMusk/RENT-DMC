from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

BASE=Path("/Users/silverbackai.agency/Desktop/04-CREATIVE/06-IT/Files/BRYAN-BRIEFS/UNDEFEATED-SOLAR-GOV")
OUT=BASE/'output'/'pdf'; TMP=BASE/'tmp'/'pdfs'
OUT.mkdir(parents=True,exist_ok=True); TMP.mkdir(parents=True,exist_ok=True)
FONT=Path('/Users/silverbackai.agency/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts')
for name,file in [('Sales','LiberationSans-Regular.ttf'),('SalesBold','LiberationSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
pdfmetrics.registerFontFamily('Sales',normal='Sales',bold='SalesBold')
navy=HexColor('#0c1a2e');gold=HexColor('#f0b429');ink=HexColor('#182b40');muted=HexColor('#506073');pale=HexColor('#f1f5f8');line=HexColor('#dbe2e9')
p=OUT/'UNDEFEATED-Manufacturer-Sell-Now-And-If-We.pdf'
c=canvas.Canvas(str(p),pagesize=(612,792))
c.setTitle('UNDEFEATED | What the manufacturer can sell now - and if we added this')
c.setAuthor('UNDEFEATED Solar')
def para(text,x,top,w,size=9.5,leading=12,color=ink,bold=False):
    q=Paragraph(text,ParagraphStyle('p',fontName='SalesBold' if bold else 'Sales',fontSize=size,leading=leading,textColor=color))
    _,h=q.wrap(w,800)
    assert top-h>=16,(text,top,h)
    q.drawOn(c,x,top-h);return h
def txt(text,x,y,size=10,bold=False,color=ink):
    c.setFillColor(color);c.setFont('SalesBold' if bold else 'Sales',size);c.drawString(x,y,text)

c.setFillColor(navy);c.rect(0,674,612,118,fill=1,stroke=0)
c.setFillColor(gold);c.circle(51,755,14,fill=1,stroke=0)
c.setFillColor(navy);c.setFont('SalesBold',11);c.drawCentredString(51,751,'US')
txt('UNDEFEATED',76,754,15,True,white);txt('SOLAR',187,754,15,True,gold)
txt('CALIFORNIA + GOVERNMENT',381,756,8.5,True,gold)
txt('Sell the system we have.',38,710,27,True,white)
para('What the manufacturer offers today - and what a few additions could open up.',38,698,536,10.4,13,white)

txt('THE CURRENT MANUFACTURER PRODUCT',38,653,10.6,True,navy)
para('<b>Tracking solar canopies:</b> STD up to 50 kWp; MEGA up to 75 kWp, with remote monitoring. [1] Published EV configurations support 4, 8 or 16 charging stations and 8, 12 or 16 feet of clearance. [2] Confirm model, chargers, installation scope and current specifications in the quote.',38,640,536,9.5,12.5)

# Exact current-product sales applications.
c.setFillColor(navy);c.roundRect(38,565,536,23,4,fill=1,stroke=0)
txt('POTENTIAL PUBLIC BUYER',49,573,8.7,True,white)
txt('WHAT THE CURRENT SYSTEM CAN BE SOLD AS',219,573,8.7,True,white)
rows=[
('CA offices + public campuses','Parking-lot solar generation and shade; offset suitable daytime building loads.'),
('City / county fleet depots','Solar canopies with a specified charging package for vehicles that dwell and charge onsite.'),
('Water districts + service yards','Onsite solar to offset compatible daytime pumping, building or maintenance loads.'),
('Federal facilities + bases','Parking-area generation and shade supporting site energy plans, subject to agency approval.')]
top=565
for i,(buyer,offer) in enumerate(rows):
    if i%2==0:
        c.setFillColor(pale);c.rect(38,top-39,536,39,fill=1,stroke=0)
    para(buyer,49,top-9,157,9.3,11.5,navy,True)
    para(offer,219,top-8,342,9.4,12.0)
    top-=39
para('<b>Why California has a reason to buy:</b> State agencies have a 2035 renewable and zero-carbon electricity target. Onsite solar can contribute; the target does not require a canopy at every facility. [3]',38,399,536,9.1,11.7)
para('Buyer fit depends on site economics, utility approval and procurement. The base canopy alone does not provide outage backup.',38,369,536,8.4,10.5,muted)

txt('IF WE ADDED THIS...',38,340,11.8,True,navy)
c.setStrokeColor(gold);c.setLineWidth(2);c.line(38,330,574,330)
items=[
('Site assessments + verified reporting','We could sell a public-facility planning and performance service alongside the hardware.'),
('Managed charging','We could target fleet depots with limited electrical capacity by scheduling charging within site limits.'),
('Batteries + engineered islanding','We could offer defined critical-load backup for emergency facilities and federal sites. [4]'),
('Approved AI-load coordination','We could target campuses and labs that can shift explicitly flexible computing to available power.')]
top=318
for i,(title,body) in enumerate(items):
    c.setFillColor(gold);c.circle(47,top-8,9,fill=1,stroke=0)
    c.setFillColor(navy);c.setFont('SalesBold',9);c.drawCentredString(47,top-11,str(i+1))
    para(title,65,top,218,9.7,12,navy,True)
    h=para(body,295,top,279,9.4,12)
    assert h<=36,(title,h)
    top-=43
para('These are proposed additions, not committed releases. Confirm OEM overlap, interfaces, engineering, cybersecurity and economics before offering them.',38,143,536,8.3,10.6,muted)

c.setFillColor(pale);c.roundRect(38,88,536,31,4,fill=1,stroke=0)
para('<b>BEST FIRST MOVE:</b> Prove the site-assessment and reporting service in one pilot, then negotiate how that contribution earns commercial value with the manufacturer.',49,110,514,9.0,11.5)

refs=[
('1. Current product','https://www.scarlet.red/how-to-deploy',38),
('2. EV configurations','https://www.scarlet.red/tiltport-ev-charging',165),
('3. CA 2035 target','https://sd17.senate.ca.gov/news/governor-newsom-signs-clean-energy-jobs-and-affordability-act-2022',307),
('4. DOE microgrids','https://www.energy.gov/cmei/systems/solar-integration-distributed-energy-resources-and-microgrids-basics',443)]
for label,url,x in refs:
    txt(label,x,72,7.1,False,muted)
    c.linkURL(url,(x,69,x+pdfmetrics.stringWidth(label,'Sales',7.1),81),relative=0,thickness=0)
para('Basis: published SCARLET/TILTPORT offering; manufacturer match and supply arrangement need confirmation. Applications above are fit assessments, not identified awards.',38,61,536,7.2,9.0,muted)
c.setStrokeColor(line);c.setLineWidth(.5);c.line(38,35,574,35)
txt('UNDEFEATEDSOLAR.COM',38,21,8.2,True,navy)
txt('Partner discussion sheet | October 12, 2026',371,21,7.5,False,muted)
c.showPage();c.save()
r=PdfReader(str(p));assert len(r.pages)==1
t=r.pages[0].extract_text()
assert all(s in t for s in ['50 kWp','75 kWp','IF WE ADDED THIS','Federal facilities','Managed charging','2035'])
(TMP/'manufacturer-now-extracted.txt').write_text(t)
print(json.dumps({'pdf':str(p),'pages':len(r.pages),'words':len(t.split()),'links':len(r.pages[0].get('/Annots',[]))}))

