from fpdf import FPDF
import os

os.makedirs("server/data/bis/raw", exist_ok=True)

pdf1 = FPDF()
pdf1.add_page()
pdf1.set_font("Arial", size=12)
pdf1.multi_cell(0, 10, "IS 9873-1 (2012): Safety Requirements for Toys, Part 1: Safety Aspects related to Mechanical and Physical Properties [PCD 12: Plastics]\n\nScope:\nThe requirements in this part of ISO 8124 apply to all toys, i.e. any product or material designed or clearly intended for use in play by children under 14 years of age. They are applicable to a toy as it is initially received by the consumer and, in addition, they apply after a toy is subjected to reasonably foreseeable conditions of normal use and abuse unless specifically noted otherwise.\n\n4.2 Reasonably foreseeable abuse\nAll toys shall be tested in accordance with the relevant normal use tests in 5.1 to 5.23.\n\n4.4 Small parts\nToys intended for children under 36 months, removable components thereof and components liberated during testing in accordance with 5.24 shall not fit entirely, whatever their orientation, into the small parts cylinder.\n\n5.2 Small parts test\nPlace the toy, without compressing it and in any orientation, into the cylinder as shown in Figure 15.\n\nDetermine whether the toy or any removable component or liberated component fits entirely within the cylinder.\n")
pdf1.output("server/data/bis/raw/IS_9873_1_2012.pdf")

pdf2 = FPDF()
pdf2.add_page()
pdf2.set_font("Arial", size=12)
pdf2.multi_cell(0, 10, "IS 13252 (Part 1) : 2010\nIEC 60950-1 : 2005\nINFORMATION TECHNOLOGY EQUIPMENT - SAFETY\nPART 1 GENERAL REQUIREMENTS\n\n1.1 Scope\n1.1.1 Equipment covered by this standard\nThis standard is applicable to mains-powered or battery-powered information technology equipment, including electrical business equipment and associated equipment, with a RATED VOLTAGE not exceeding 600 V.\n\n1.2 Definitions\n1.2.4.1 CLASS I EQUIPMENT\nequipment where protection against electric shock is achieved by using BASIC INSULATION and providing a means of connection to the PROTECTIVE EARTHING CONDUCTOR.\n\n1.5 Components\n1.5.1 General\nWhere safety is involved, components shall comply either with the requirements of this standard or with the safety aspects of the relevant IEC component standards.\n\n2.1 Protection from electric shock and energy hazards\n2.1.1 Protection in operator access areas\nThis subclause specifies requirements for protection against electric shock from energized parts.\n")
pdf2.output("server/data/bis/raw/IS_13252_1_2010.pdf")

pdf3 = FPDF()
pdf3.add_page()
pdf3.set_font("Arial", size=12)
pdf3.multi_cell(0, 10, "IS 14543 : 2004\nPACKAGED DRINKING WATER (OTHER THAN PACKAGED NATURAL MINERAL WATER) - SPECIFICATION\n\n1 SCOPE\nThis standard prescribes the requirements and methods of sampling and test for drinking water (other than natural mineral water) offered for sale in packaged form.\n\n3.2 Packaged Drinking Water (Other than Packaged Natural Mineral Water)\nPackaged drinking water means water derived from surface water or underground water or sea water which is subjected to hereinunder specified treatments, namely, decantation, filtration, combination of filtration, aerations, filtration with membrane filter depth filter, cartridge filter, activated carbon filtration, demineralization, remineralization, reverse osmosis and packed after disinfecting the water to a level that shall not lead to any harmful contamination.\n\n5 REQUIREMENTS\n5.1 Microbiological Requirements\n5.1.1 Escherichia coli (or thermotolerant bacteria) shall be absent in any 250 ml sample.\n5.1.2 Coliform bacteria shall be absent in any 250 ml sample.\n\n7 MARKING\n7.1 The following particulars shall be marked legibly and indelibly on the label of the bottle container:\na) Name of the product (that is packaged drinking water);\nb) Name and address of the processor;\nc) Brand name, if any;\nd) Batch or Code number;\n")
pdf3.output("server/data/bis/raw/IS_14543_2004.pdf")
