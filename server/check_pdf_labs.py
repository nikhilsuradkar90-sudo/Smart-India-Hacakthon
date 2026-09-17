import fitz
import glob

pdfs = glob.glob("/Users/gauravkumar/.gemini/antigravity/brain/529c779e-925c-4134-a493-9fe3b6b567e6/.user_uploaded/*.pdf")
for pdf in pdfs:
    print(f"Checking {pdf}...")
    try:
        doc = fitz.open(pdf)
        lab_count = 0
        for i in range(min(10, doc.page_count)):  # Check first 10 pages for speed
            text = doc[i].get_text().lower()
            lab_count += text.count('laborator')
        print(f"Found 'laborator' {lab_count} times in first 10 pages.")
    except Exception as e:
        print(f"Error: {e}")
