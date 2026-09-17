from reportlab.pdfgen import canvas
import os

os.makedirs("server/data/bis/raw", exist_ok=True)

def make_pdf(filename, text):
    c = canvas.Canvas(filename)
    y = 800
    for line in text.split('\n'):
        c.drawString(50, y, line)
        y -= 15
        if y < 50:
            c.showPage()
            y = 800
    c.save()

make_pdf("server/data/bis/raw/IS_9873_1_2012.pdf", "IS 9873-1 (2012): Safety Requirements for Toys, Part 1\nScope:\n4.2 Reasonably foreseeable abuse\n4.4 Small parts\n5.2 Small parts test")
make_pdf("server/data/bis/raw/IS_13252_1_2010.pdf", "IS 13252 (Part 1) : 2010\nIEC 60950-1 : 2005\nINFORMATION TECHNOLOGY EQUIPMENT - SAFETY\n1.1 Scope\n1.2.4.1 CLASS I EQUIPMENT")
make_pdf("server/data/bis/raw/IS_14543_2004.pdf", "IS 14543 : 2004\nPACKAGED DRINKING WATER (OTHER THAN PACKAGED NATURAL MINERAL WATER) - SPECIFICATION\n1 SCOPE\n3.2 Packaged Drinking Water\n5.1 Microbiological Requirements")

