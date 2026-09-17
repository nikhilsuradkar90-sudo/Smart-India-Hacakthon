import re

with open('server/prisma/schema.prisma', 'r') as f:
    content = f.read()

new_models = """model Group {
  id               String     @id @default(uuid())
  name             String     @unique
  subGroups        SubGroup[]
  standards        StandardGroup[]
  createdAt        DateTime   @default(now())
}

model SubGroup {
  id               String     @id @default(uuid())
  groupId          String
  name             String
  group            Group      @relation(fields: [groupId], references: [id])
  standards        StandardSubGroup[]
  createdAt        DateTime   @default(now())

  @@unique([groupId, name])
}

model StandardGroup {
  id               String     @id @default(uuid())
  standardId       String
  groupId          String
  standard         Standard   @relation(fields: [standardId], references: [id], onDelete: Cascade)
  group            Group      @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([standardId, groupId])
}

model StandardSubGroup {
  id               String     @id @default(uuid())
  standardId       String
  subGroupId       String
  standard         Standard   @relation(fields: [standardId], references: [id], onDelete: Cascade)
  subGroup         SubGroup   @relation(fields: [subGroupId], references: [id], onDelete: Cascade)

  @@unique([standardId, subGroupId])
}
"""

if "model Group" not in content:
    content += "\n" + new_models

# Update Standard model fields
old_standard = r"model Standard \{.*?\n\}"
new_standard = """model Standard {
  id               String     @id @default(uuid())
  isNumber         String     @unique
  title            String
  edition          String?
  revision         String?
  year             Int?
  status           String?
  publicationYear  Int?
  amendmentInformation String?
  reaffirmationInformation String?
  technicalDepartment String?
  sectionalCommittee  String?
  sector           String?
  sourceUrl        String?
  sourceName       String?
  sourceDocument   String?
  sourcePage       String?
  lastVerifiedAt   DateTime?
  documentId       String?
  embedding        String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  
  document         Document?  @relation(fields: [documentId], references: [id])
  groups           StandardGroup[]
  subGroups        StandardSubGroup[]
}"""

content = re.sub(old_standard, new_standard, content, flags=re.DOTALL)

with open('server/prisma/schema.prisma', 'w') as f:
    f.write(content)
