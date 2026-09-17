import re

with open('server/ingest-certifications.ts', 'r') as f:
    content = f.read()

# Remove deleteMany
content = re.sub(r'await prisma\.product\.deleteMany\(\{\}\);\n?', '', content)

# Replace the insertion logic
old_logic = """
    batch.push(
      prisma.product.create({
        data: {
          name: title,
          category: s.technicalDepartment || 'General',
          schemeId: scheme.id,
          standardId: s.id
        }
      })
    );
"""

new_logic = """
    const existing = existingProductsMap.get(title + s.id);
    if (!existing) {
      batch.push(
        prisma.product.create({
          data: {
            name: title,
            category: s.technicalDepartment || 'General',
            schemeId: scheme.id,
            standardId: s.id
          }
        })
      );
    }
"""

content = content.replace(old_logic.strip(), new_logic.strip())

# Add existingProductsMap
insertion_point = "const standards = await prisma.standard.findMany();"
map_code = "const existingProducts = await prisma.product.findMany({ select: { name: true, standardId: true } });\n  const existingProductsMap = new Map(existingProducts.map(p => [p.name + p.standardId, true]));"
content = content.replace(insertion_point, insertion_point + "\n  " + map_code)

with open('server/ingest-certifications.ts', 'w') as f:
    f.write(content)
