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

export const leviticus = [
  // Leg 1
  c('lev01', 2, 'Which sons of Aaron offered strange fire before the LORD?', 'Nadab and Abihu', ['Eleazar and Ithamar', 'Hophni and Phinehas', 'Korah and Dathan'], 'Leviticus 10:1'),
  c('lev02', 2, 'How many goats were taken on the Day of Atonement?', 'Two', ['One', 'Three', 'Seven'], 'Leviticus 16:7'),
  c('lev03', 3, 'What was the goat sent away into the wilderness called?', 'The scapegoat', ['The sin offering', 'The firstling', 'The wave offering'], 'Leviticus 16:8–10', 'The other goat was the sin offering.'),
  c('lev04', 3, '"Thou shalt love thy neighbour as thyself" is first found in which chapter?', 'Leviticus 19', ['Leviticus 11', 'Leviticus 23', 'Leviticus 25'], 'Leviticus 19:18'),
  c('lev05', 3, 'Which chapter sets out the clean and unclean beasts?', 'Leviticus 11', ['Leviticus 16', 'Leviticus 19', 'Leviticus 23'], 'Leviticus 11'),
  c('lev06', 3, 'Which chapter gives the ritual of the Day of Atonement?', 'Leviticus 16', ['Leviticus 11', 'Leviticus 8', 'Leviticus 25'], 'Leviticus 16'),
  c('lev07', 4, 'When is the Day of Atonement?', 'The tenth day of the seventh month', ['The fourteenth day of the first month', 'The fifteenth day of the seventh month', 'The first day of the seventh month'], 'Leviticus 16:29; 23:27', 'The 15th of the seventh month begins Tabernacles; the 1st is the blowing of trumpets.'),
  // Leg 2
  c('lev08', 4, 'Which year was hallowed as the jubile?', 'The fiftieth', ['The seventh', 'The fortieth', 'The forty-ninth'], 'Leviticus 25:8–11', 'Seven sabbaths of years make forty-nine; the jubile follows.'),
  c('lev09', 4, 'A clean beast must chew the cud and do what?', 'Part the hoof and be clovenfooted', ['Have no horns', 'Be without spot', 'Be a firstling'], 'Leviticus 11:3'),
  c('lev10', 4, "What did Moses put on Aaron's right ear, thumb and great toe?", 'Blood of the ram of consecration', ['Anointing oil', 'Water of the laver', 'Ashes of the altar'], 'Leviticus 8:22–23'),
  c('lev11', 5, 'Why were Nadab and Abihu devoured by fire?', 'They offered strange fire, which the LORD commanded them not', ['They touched the ark', 'They ate the shewbread', 'They offered a lamb with a blemish'], 'Leviticus 10:1–2'),
  c('lev12', 5, 'In mourning for them, Aaron and his sons were told not to do what?', 'Uncover their heads or rend their clothes', ['Fast or weep', 'Shave their beards', 'Sing in the tabernacle'], 'Leviticus 10:6'),
  c('lev13', 5, 'Moses was angry with which sons of Aaron when the goat of the sin offering was burnt?', 'Eleazar and Ithamar', ['Nadab and Abihu', 'Phinehas and Eleazar', 'Gershon and Kohath'], 'Leviticus 10:16'),
  c('lev14', 5, 'What happened to the son of the Israelitish woman who blasphemed the Name?', 'He was stoned by the congregation', ['He was burnt with fire', 'He was cut off and sent from the camp', 'He was struck with leprosy'], 'Leviticus 24:14, 23'),
  // Leg 3
  c('lev15', 5, 'What does Leviticus 17:11 say is in the blood?', 'The life of the flesh', ['The sin of the offerer', 'The strength of the beast', 'The spirit of the man'], 'Leviticus 17:11'),
  c('lev16', 6, "What was the blasphemer's mother's name?", 'Shelomith, the daughter of Dibri', ['Cozbi, the daughter of Zur', 'Maachah, the daughter of Talmai', 'Abihail, the daughter of Eliab'], 'Leviticus 24:11'),
  c('lev17', 6, 'How many days did Aaron and his sons stay at the door of the tabernacle for their consecration?', 'Seven', ['Three', 'Eight', 'Forty'], 'Leviticus 8:33', 'They came out on the eighth day (9:1).'),
  c('lev18', 6, 'What could a poor offerer bring instead of a lamb?', 'Two turtledoves, or two young pigeons', ['A kid of the goats', 'A young bullock', 'A heifer'], 'Leviticus 5:7; 12:8'),
  c('lev19', 6, 'After a son is born, how many days of purifying follow the first seven?', 'Thirty-three', ['Sixty-six', 'Forty', 'Fourteen'], 'Leviticus 12:2–4', 'For a daughter: fourteen, then sixty-six (12:5).'),
  c('lev20', 6, 'Cleansing a leper used two birds, cedar wood, scarlet and what?', 'Hyssop', ['Myrrh', 'Frankincense', 'Salt'], 'Leviticus 14:4'),
  c('lev21', 6, 'Giving one\'s seed to which god is forbidden in Leviticus 18 and 20?', 'Molech', ['Baal', 'Chemosh', 'Dagon'], 'Leviticus 18:21; 20:2'),
];

export const numbers = [
  // Leg 1
  c('num01', 2, 'What did the spies carry back from the brook of Eshcol?', 'A cluster of grapes on a staff between two', ['Figs on a cart', 'Honey in jars', 'A sheaf of wheat'], 'Numbers 13:23'),
  c('num02', 2, 'Which two spies urged Israel to go up and take the land?', 'Joshua and Caleb', ['Moses and Aaron', 'Eleazar and Phinehas', 'Caleb and Othniel'], 'Numbers 14:6–9'),
  c('num03', 3, 'Whose ass spoke?', "Balaam's", ["Balak's", "Gideon's", "Saul's"], 'Numbers 22:28'),
  c('num04', 3, 'What did Moses make so the bitten could look and live?', 'A serpent of brass on a pole', ['A golden calf', 'An altar of stone', 'A censer of fire'], 'Numbers 21:8–9'),
  c('num05', 3, 'Who rebelled with Dathan and Abiram, and was swallowed by the earth?', 'Korah', ['Achan', 'Nadab', 'Zimri'], 'Numbers 16:1, 31–33'),
  c('num06', 3, 'Which king of Moab sent for Balaam to curse Israel?', 'Balak', ['Sihon', 'Og', 'Agag'], 'Numbers 22:4–6'),
  c('num07', 4, 'Whose rod budded, bloomed and yielded almonds?', "Aaron's", ["Moses'", "Joshua's", "Korah's"], 'Numbers 17:8'),
  // Leg 2
  c('num08', 4, 'How long did the spies search the land?', 'Forty days', ['Seven days', 'Three days', 'Forty years'], 'Numbers 13:25', 'Israel then wandered a year for each day (14:34).'),
  c('num09', 4, 'When the people lusted for flesh, what did the LORD send?', 'Quails', ['Manna', 'Locusts', 'Ravens'], 'Numbers 11:31'),
  c('num10', 4, 'Why was Moses barred from bringing Israel into the land?', 'He smote the rock at Meribah instead of speaking to it', ['He made the golden calf', 'He married an Ethiopian woman', 'He slew an Egyptian'], 'Numbers 20:8–12'),
  c('num11', 5, 'Which two men prophesied in the camp?', 'Eldad and Medad', ['Hur and Bezaleel', 'Nadab and Abihu', 'Hobab and Jethro'], 'Numbers 11:26'),
  c('num12', 5, 'Why did Miriam and Aaron speak against Moses?', 'Because of the Ethiopian woman he had married', ['Because he struck the rock', 'Because he chose Joshua', 'Because he broke the tables'], 'Numbers 12:1'),
  c('num13', 5, 'Which priest stayed the plague at Baal-peor with a javelin?', 'Phinehas', ['Eleazar', 'Ithamar', 'Aaron'], 'Numbers 25:7–8'),
  c('num14', 5, 'Whose five daughters asked for their father\'s inheritance?', 'Zelophehad', ['Korah', 'Caleb', 'Eliab'], 'Numbers 27:1–7'),
  // Leg 3
  c('num15', 5, 'How long did Israel mourn for Aaron?', 'Thirty days', ['Seven days', 'Forty days', 'Seventy days'], 'Numbers 20:29'),
  c('num16', 6, 'Where did Aaron die?', 'Mount Hor', ['Mount Nebo', 'Mount Sinai', 'Pisgah'], 'Numbers 20:28', 'Moses died on Nebo (Deuteronomy 34:1).'),
  c('num17', 6, 'How many times did Balaam smite his ass?', 'Three', ['Seven', 'Twice', 'Four'], 'Numbers 22:28'),
  c('num18', 6, 'Which two Amorite kings did Israel defeat east of Jordan?', 'Sihon and Og', ['Agag and Amalek', 'Chedorlaomer and Amraphel', 'Jabin and Sisera'], 'Numbers 21:21–35'),
  c('num19', 6, 'Moses asked Hobab to be to Israel "instead of" what?', 'Eyes', ['A shield', 'A judge', 'A father'], 'Numbers 10:29–31'),
  c('num20', 6, 'The ashes of the red heifer made a water of what?', 'Separation', ['Cleansing', 'Atonement', 'Jealousy'], 'Numbers 19:9', 'The "bitter water" of jealousy is Numbers 5.'),
  c('num21', 6, 'Who was the Midianite woman slain with Zimri?', 'Cozbi, the daughter of Zur', ['Zipporah, the daughter of Jethro', 'Jael, the wife of Heber', 'Achsah, the daughter of Caleb'], 'Numbers 25:14–15'),
];

export const deuteronomy = [
  // Leg 1
  c('deu01', 2, 'Who succeeded Moses to lead Israel into the land?', 'Joshua', ['Caleb', 'Eleazar', 'Aaron'], 'Deuteronomy 31:7; 34:9'),
  c('deu02', 2, 'From which mountain did Moses view the promised land?', 'Nebo, the top of Pisgah', ['Sinai', 'Carmel', 'Hor'], 'Deuteronomy 34:1'),
  c('deu03', 3, '"Hear, O Israel: The LORD our God is one LORD" — which chapter?', 'Deuteronomy 6', ['Deuteronomy 5', 'Deuteronomy 10', 'Deuteronomy 28'], 'Deuteronomy 6:4'),
  c('deu04', 3, 'Where are the Ten Commandments repeated in Deuteronomy?', 'Chapter 5', ['Chapter 6', 'Chapter 10', 'Chapter 28'], 'Deuteronomy 5:6–21'),
  c('deu05', 3, 'Which chapter sets out the long blessings and curses?', 'Chapter 28', ['Chapter 5', 'Chapter 18', 'Chapter 32'], 'Deuteronomy 28'),
  c('deu06', 3, 'Who buried Moses?', 'The LORD', ['Joshua', 'Eleazar', 'The elders of Israel'], 'Deuteronomy 34:5–6', '"No man knoweth of his sepulchre unto this day."'),
  c('deu07', 4, '"Man doth not live by bread only" is first spoken where?', 'Deuteronomy 8', ['Exodus 16', 'Psalm 78', 'Isaiah 55'], 'Deuteronomy 8:3; Matthew 4:4'),
  // Leg 2
  c('deu08', 4, 'Upon which mount was the blessing to be put?', 'Gerizim', ['Ebal', 'Zion', 'Hermon'], 'Deuteronomy 11:29', 'The curse upon mount Ebal.'),
  c('deu09', 4, 'Moses says the LORD will raise up a prophet like him from among whom?', 'Thy brethren', ['The Levites', 'The nations', 'The house of David'], 'Deuteronomy 18:15'),
  c('deu10', 4, 'How many witnesses establish a matter?', 'Two or three', ['One', 'Seven', 'Twelve'], 'Deuteronomy 19:15'),
  c('deu11', 5, 'Which chapter holds the Song of Moses in Deuteronomy?', 'Chapter 32', ['Chapter 15', 'Chapter 33', 'Chapter 28'], 'Deuteronomy 31:30–32:43', 'Exodus 15 is the song at the Red Sea.'),
  c('deu12', 5, 'What is Deuteronomy 33?', "Moses' blessing of the tribes", ['The Song of Moses', 'The renewal of the covenant', 'The cities of refuge'], 'Deuteronomy 33:1'),
  c('deu13', 5, 'How many cities of refuge does Deuteronomy 19 first set apart in the land?', 'Three', ['Six', 'Two', 'Seven'], 'Deuteronomy 19:2', 'Three more could be added (19:9); there were six in all.'),
  c('deu14', 5, 'Which king had a bedstead of iron nine cubits long?', 'Og king of Bashan', ['Sihon king of Heshbon', 'Balak king of Moab', 'Agag king of Amalek'], 'Deuteronomy 3:11'),
  // Leg 3
  c('deu15', 5, 'Israel was told to "blot out the remembrance of" whom?', 'Amalek', ['Moab', 'Edom', 'The Philistines'], 'Deuteronomy 25:17–19'),
  c('deu16', 6, 'Where did Moses speak the words of Deuteronomy?', 'In the land of Moab, on this side Jordan', ['At mount Sinai', 'At Gilgal', 'At Shechem'], 'Deuteronomy 1:5; 29:1'),
  c('deu17', 6, '"Ye shall not tempt the LORD your God" — which verse did Jesus quote?', 'Deuteronomy 6:16', ['Deuteronomy 8:3', 'Deuteronomy 10:20', 'Deuteronomy 5:7'], 'Matthew 4:7'),
  c('deu18', 6, 'Unlike Egypt, how is the promised land watered?', 'It drinketh water of the rain of heaven', ['By rivers from the mountains', 'By the floods of Jordan', 'By wells the fathers digged'], 'Deuteronomy 11:10–11'),
  c('deu19', 6, 'At most, how many stripes could a guilty man be given?', 'Forty', ['Thirty-nine', 'Twelve', 'Seven'], 'Deuteronomy 25:3', 'Paul received "forty stripes save one" (2 Corinthians 11:24).'),
  c('deu20', 6, 'The king must not multiply which three things?', 'Horses, wives, and silver and gold', ['Chariots, servants and cities', 'Horses, servants and land', 'Wives, cattle and armies'], 'Deuteronomy 17:16–17'),
  c('deu21', 6, "Which tribe is missing from Moses' blessing in Deuteronomy 33?", 'Simeon', ['Levi', 'Benjamin', 'Zebulun'], 'Deuteronomy 33'),
];
