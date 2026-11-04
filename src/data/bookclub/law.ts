import { c, o } from './helpers';

// Each book: 21 questions, flown as 3 legs of 7 (questions 1–7, 8–14, 15–21), climbing in difficulty.

export const genesis = [
  // Leg 1
  c('gen01', 2, 'Who was the firstborn son of Adam and Eve?', 'Cain', ['Abel', 'Seth', 'Enoch'], 'Genesis 4:1'),
  c('gen02', 2, 'What sign did God set in the cloud after the flood?', 'His bow — a rainbow', ['A star', 'A pillar of fire', 'A dove'], 'Genesis 9:13'),
  c('gen03', 3, 'How were the clean beasts taken into the ark?', 'By sevens', ['By twos', 'By threes', 'By tens'], 'Genesis 7:2', 'Unclean beasts went in by two.'),
  c('gen04', 3, 'How old was Abram when he departed out of Haran?', '75', ['65', '86', '99'], 'Genesis 12:4', 'He was 86 at Ishmael\'s birth (16:16) and 99 at the covenant of circumcision (17:1).'),
  c('gen05', 3, 'What did Esau sell his birthright for?', 'Bread and pottage of lentiles', ['Venison', 'A kid of the goats', 'Barley loaves'], 'Genesis 25:34'),
  c('gen06', 3, "Who was Rebekah's brother?", 'Laban', ['Nahor', 'Bethuel', 'Lot'], 'Genesis 24:29', 'Bethuel was her father; Nahor her grandfather.'),
  c('gen07', 4, 'Jacob renamed the place of his ladder dream Bethel. What had it been called?', 'Luz', ['Salem', 'Zoar', 'Sychem'], 'Genesis 28:19'),
  // Leg 2
  c('gen08', 4, 'How many years in all did Jacob serve Laban for Rachel?', 'Fourteen', ['Seven', 'Twenty', 'Twelve'], 'Genesis 29:20, 27–30', 'He was with Laban twenty years altogether (31:41).'),
  c('gen09', 4, 'Which son of Jacob proposed selling Joseph to the Ishmeelites?', 'Judah', ['Reuben', 'Simeon', 'Levi'], 'Genesis 37:26–27', 'Reuben had tried to rescue him (37:21–22).'),
  c('gen10', 4, 'What did Rachel steal from her father when Jacob fled?', 'His images', ['His signet', 'His silver cup', 'His flocks'], 'Genesis 31:19', "The silver cup belongs to Joseph's story (44:2)."),
  o('gen11', 5, 'Put these in order:', ['The covenant between the pieces', 'Hagar flees and meets the angel', 'Abram is renamed Abraham', 'Sodom is destroyed'], 'Genesis 15; 16; 17; 19'),
  c('gen12', 5, 'Which two sons of Jacob slew the men of Shechem?', 'Simeon and Levi', ['Reuben and Judah', 'Dan and Gad', 'Issachar and Zebulun'], 'Genesis 34:25'),
  c('gen13', 5, "Tamar bore twins to her father-in-law. Who was he?", 'Judah', ['Er', 'Onan', 'Shelah'], 'Genesis 38:6, 27–30', 'Er and Onan were her husbands; Shelah was withheld from her.'),
  c('gen14', 5, 'From whom did Abraham buy the cave of Machpelah?', 'Ephron the Hittite', ['Abimelech the Philistine', 'Hamor the Hivite', 'Mamre the Amorite'], 'Genesis 23:16–17'),
  // Leg 3
  c('gen15', 5, 'Joseph named his firstborn "God hath made me forget all my toil". Who?', 'Manasseh', ['Ephraim', 'Benjamin', 'Machir'], 'Genesis 41:51', 'Ephraim means "fruitful" (41:52).'),
  c('gen16', 6, 'What Egyptian name did Pharaoh give Joseph?', 'Zaphnath-paaneah', ['Belteshazzar', 'Potipherah', 'Rameses'], 'Genesis 41:45'),
  c('gen17', 6, "Who was the father of Asenath, Joseph's wife?", 'Potipherah, priest of On', ['Potiphar, captain of the guard', 'Jethro, priest of Midian', 'Melchizedek, king of Salem'], 'Genesis 41:45', 'Not Potiphar, whose house Joseph served in (39:1).'),
  c('gen18', 6, 'How old was Jacob when he stood before Pharaoh?', '130', ['120', '147', '110'], 'Genesis 47:9', 'He died at 147 (47:28); Joseph died at 110 (50:26).'),
  c('gen19', 6, 'Which son did Jacob call "unstable as water"?', 'Reuben', ['Simeon', 'Dan', 'Issachar'], 'Genesis 49:3–4'),
  c('gen20', 6, 'In Jacob\'s blessing, who is "a hind let loose"?', 'Naphtali', ['Asher', 'Gad', 'Benjamin'], 'Genesis 49:21', 'Benjamin "shall ravin as a wolf" (49:27).'),
  c('gen21', 6, 'Where was Rachel buried?', 'On the way to Ephrath, which is Bethlehem', ['In the cave of Machpelah', 'At Bethel, under an oak', 'At Shechem'], 'Genesis 35:19', 'Leah was buried in Machpelah (49:31); Deborah, Rebekah\'s nurse, under the oak at Bethel (35:8).'),
];

export const exodus = [
  // Leg 1
  c('exo01', 2, 'Who found baby Moses in the ark of bulrushes?', "Pharaoh's daughter", ['Miriam', 'Jochebed', 'Zipporah'], 'Exodus 2:5–6'),
  c('exo02', 2, 'At the burning bush, what name did God give for Himself?', 'I AM THAT I AM', ['The LORD of hosts', 'The Ancient of days', 'The Holy One of Israel'], 'Exodus 3:14'),
  c('exo03', 3, 'Whom did Moses marry in Midian?', 'Zipporah', ['Miriam', 'Jochebed', 'Elisheba'], 'Exodus 2:21'),
  c('exo04', 3, 'Whom did God give Moses as his spokesman?', 'Aaron', ['Joshua', 'Hur', 'Caleb'], 'Exodus 4:14–16'),
  c('exo05', 3, "Before Pharaoh, whose rod swallowed up the magicians' rods?", "Aaron's", ["Moses'", "Jethro's", "Hur's"], 'Exodus 7:10–12'),
  c('exo06', 3, "Who held up Moses' hands during the battle with Amalek?", 'Aaron and Hur', ['Joshua and Caleb', 'Nadab and Abihu', 'Eleazar and Ithamar'], 'Exodus 17:12'),
  c('exo07', 4, 'In Exodus, what did manna taste like?', 'Wafers made with honey', ['Fresh oil', 'Barley bread', 'Figs'], 'Exodus 16:31', 'Numbers 11:8 compares it to fresh oil.'),
  // Leg 2
  o('exo08', 4, 'Put these plagues in order:', ['Frogs', 'Boils', 'Locusts', 'Darkness'], 'Exodus 8:2; 9:9; 10:4; 10:21'),
  c('exo09', 4, 'Who advised Moses to appoint rulers of thousands, hundreds, fifties and tens?', 'Jethro', ['Aaron', 'Joshua', 'Eleazar'], 'Exodus 18:17–21'),
  c('exo10', 4, 'Where the people tempted the LORD for water from the rock, Moses named the place what?', 'Massah and Meribah', ['Marah', 'Elim', 'Kadesh'], 'Exodus 17:7', 'Marah was where bitter water was made sweet (15:23).'),
  c('exo11', 4, 'At Marah, what made the bitter waters sweet?', 'A tree cast into the waters', ['Salt cast into the spring', 'Moses striking the water', 'Aaron\'s rod laid in it'], 'Exodus 15:25', 'Elisha healed Jericho\'s waters with salt (2 Kings 2:21).'),
  c('exo12', 5, 'Who was filled "with the spirit of God, in wisdom… to devise cunning works" for the tabernacle?', 'Bezaleel', ['Eleazar', 'Nadab', 'Ithamar'], 'Exodus 31:2–4', 'Aholiab of the tribe of Dan worked alongside him (31:6).'),
  c('exo13', 5, 'What did the Israelites find at Elim?', 'Twelve wells and threescore and ten palm trees', ['Seven wells and seventy palm trees', 'Twelve wells and forty palm trees', 'Seventy wells and twelve palm trees'], 'Exodus 15:27'),
  c('exo14', 5, 'What did Moses do with the golden calf?', 'Burnt it, ground it to powder, strewed it on water and made Israel drink it', ['Broke it in pieces and buried it beneath the mount', 'Hid it in the tabernacle as a warning', 'Cast it whole into the Red Sea'], 'Exodus 32:20'),
  // Leg 3
  c('exo15', 5, 'Which tribe gathered to Moses at "Who is on the LORD\'s side?"', 'Levi', ['Judah', 'Ephraim', 'Benjamin'], 'Exodus 32:26'),
  c('exo16', 6, "Who was Moses' father?", 'Amram', ['Kohath', 'Levi', 'Izhar'], 'Exodus 6:20', 'Kohath was his grandfather.'),
  c('exo17', 6, "What was engraved on the gold plate on Aaron's mitre?", 'HOLINESS TO THE LORD', ['THE LORD OUR RIGHTEOUSNESS', 'I AM THAT I AM', 'THE LORD IS THERE'], 'Exodus 28:36', 'The others are Jeremiah 23:6, Exodus 3:14 and Ezekiel 48:35.'),
  c('exo18', 6, "How many rows of stones were set in the high priest's breastplate?", 'Four', ['Three', 'Six', 'Twelve'], 'Exodus 28:17–21', 'Four rows of three: twelve stones for the twelve tribes.'),
  c('exo19', 6, 'How old was Aaron when he and Moses spoke to Pharaoh?', '83', ['80', '85', '77'], 'Exodus 7:7', 'Moses was 80.'),
  c('exo20', 6, "What were the names of Moses' two sons?", 'Gershom and Eliezer', ['Nadab and Abihu', 'Eleazar and Ithamar', 'Gershon and Kohath'], 'Exodus 18:3–4', "Nadab, Abihu, Eleazar and Ithamar were Aaron's sons; Gershon and Kohath were Levi's."),
  c('exo21', 6, 'Besides Moses, Aaron, Nadab and Abihu, who went up and "saw the God of Israel"?', 'Seventy of the elders of Israel', ['The twelve princes of the tribes', 'Joshua and Caleb', 'All the Levites'], 'Exodus 24:9–10'),
];
