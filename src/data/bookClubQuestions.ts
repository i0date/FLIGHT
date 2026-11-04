import type { RawQuestion } from '../types';

// Book Club: five questions per book, climbing levels 3 → 4 → 5 → 6 → 6.
// Written for someone currently studying that book. Books without a set yet
// show as "Boarding soon" in the passport.
export const bookClubQuestions: Record<string, RawQuestion[]> = {
  genesis: [
    { id: 'gen1', level: 3, q: 'How old was Abram when he departed out of Haran?', a: '75', wrong: ['65', '86', '99'], ref: 'Genesis 12:4', note: 'He was 86 when Ishmael was born (16:16) and 99 at the covenant of circumcision (17:1).' },
    { id: 'gen2', level: 4, q: 'Jacob renamed the place of his ladder dream Bethel. What had it been called?', a: 'Luz', wrong: ['Salem', 'Zoar', 'Sychem'], ref: 'Genesis 28:19' },
    { id: 'gen3', level: 5, kind: 'order', q: "Put these in order:", order: ['The covenant between the pieces', 'Hagar flees and meets the angel', 'Abram is renamed Abraham', 'Sodom is destroyed'], ref: 'Genesis 15; 16; 17; 19' },
    { id: 'gen4', level: 6, q: 'What Egyptian name did Pharaoh give Joseph?', a: 'Zaphnath-paaneah', wrong: ['Belteshazzar', 'Potipherah', 'Rameses'], ref: 'Genesis 41:45' },
    { id: 'gen5', level: 6, q: "Who was the father of Asenath, Joseph's wife?", a: 'Potipherah, priest of On', wrong: ['Potiphar, captain of the guard', 'Jethro, priest of Midian', 'Melchizedek, king of Salem'], ref: 'Genesis 41:45', note: 'Not Potiphar, whose house Joseph served in (39:1).' },
  ],
  exodus: [
    { id: 'exo1', level: 3, q: "Who held up Moses' hands during the battle with Amalek?", a: 'Aaron and Hur', wrong: ['Joshua and Caleb', 'Nadab and Abihu', 'Eleazar and Ithamar'], ref: 'Exodus 17:12' },
    { id: 'exo2', level: 4, kind: 'order', q: 'Put these plagues in order:', order: ['Frogs', 'Boils', 'Locusts', 'Darkness'], ref: 'Exodus 8:2; 9:9; 10:4; 10:21' },
    { id: 'exo3', level: 5, q: 'Who was filled "with the spirit of God, in wisdom… to devise cunning works" for the tabernacle?', a: 'Bezaleel', wrong: ['Eleazar', 'Nadab', 'Ithamar'], ref: 'Exodus 31:2–4', note: 'Aholiab of the tribe of Dan was appointed to work alongside him (31:6).' },
    { id: 'exo4', level: 6, q: "Who was Moses' father?", a: 'Amram', wrong: ['Kohath', 'Levi', 'Izhar'], ref: 'Exodus 6:20', note: 'Kohath was his grandfather; Levi his great-grandfather.' },
    { id: 'exo5', level: 6, q: "What was engraved on the gold plate on Aaron's mitre?", a: 'HOLINESS TO THE LORD', wrong: ['THE LORD OUR RIGHTEOUSNESS', 'I AM THAT I AM', 'THE LORD IS THERE'], ref: 'Exodus 28:36', note: 'The others are Jeremiah 23:6, Exodus 3:14 and Ezekiel 48:35.' },
  ],
  ruth: [
    { id: 'rut1', level: 3, q: 'What did Naomi ask to be called on returning to Bethlehem?', a: 'Mara', wrong: ['Naamah', 'Hagar', 'Lo-ruhamah'], ref: 'Ruth 1:20', note: 'Mara means "bitter".' },
    { id: 'rut2', level: 4, q: "What was the name of Naomi's husband?", a: 'Elimelech', wrong: ['Elkanah', 'Salmon', 'Obed'], ref: 'Ruth 1:2' },
    { id: 'rut3', level: 5, q: 'What did the nearer kinsman hand over to confirm the redemption to Boaz?', a: 'His shoe', wrong: ['His ring', 'His staff', 'His cloak'], ref: 'Ruth 4:7–8' },
    { id: 'rut4', level: 6, q: "Who was Ruth's first husband?", a: 'Mahlon', wrong: ['Chilion', 'Elimelech', 'Salmon'], ref: 'Ruth 4:10', note: 'Chilion was married to Orpah.' },
    { id: 'rut5', level: 6, q: "According to the genealogy that closes Ruth, who was Boaz's father?", a: 'Salmon', wrong: ['Nahshon', 'Obed', 'Hezron'], ref: 'Ruth 4:20–21', note: 'Nahshon was his grandfather; Obed was his son.' },
  ],
  esther: [
    { id: 'est1', level: 3, q: "What was Esther's Hebrew name?", a: 'Hadassah', wrong: ['Hannah', 'Hephzibah', 'Huldah'], ref: 'Esther 2:7' },
    { id: 'est2', level: 4, q: 'The feast of Purim takes its name from "Pur". What is Pur?', a: 'The lot', wrong: ['The sceptre', 'The decree', 'The ring'], ref: 'Esther 3:7; 9:24–26' },
    { id: 'est3', level: 5, q: 'How high was the gallows Haman had made?', a: 'Fifty cubits', wrong: ['Ten cubits', 'Thirty cubits', 'Sixty cubits'], ref: 'Esther 5:14; 7:9' },
    { id: 'est4', level: 6, q: 'Which two chamberlains plotted against the king, a plot uncovered by Mordecai?', a: 'Bigthan and Teresh', wrong: ['Hegai and Shaashgaz', 'Hatach and Harbonah', 'Mehuman and Biztha'], ref: 'Esther 2:21–23' },
    { id: 'est5', level: 6, q: 'Haman is "the Agagite"; Mordecai descends from Kish. Which people links the two back to Saul\'s failure in 1 Samuel 15?', a: 'The Amalekites', wrong: ['The Philistines', 'The Moabites', 'The Ammonites'], ref: 'Esther 3:1; 2:5; 1 Samuel 15:8–9', note: 'Saul, son of Kish, spared Agag king of Amalek.' },
  ],
  daniel: [
    { id: 'dan1', level: 3, q: 'What Babylonian name was given to Daniel?', a: 'Belteshazzar', wrong: ['Belshazzar', 'Abednego', 'Shadrach'], ref: 'Daniel 1:7' },
    { id: 'dan2', level: 4, q: "Which king had Daniel cast into the lions' den?", a: 'Darius the Median', wrong: ['Nebuchadnezzar', 'Belshazzar', 'Cyrus the Persian'], ref: 'Daniel 5:31; 6:16' },
    { id: 'dan3', level: 5, q: 'Who came to give Daniel understanding of the seventy weeks?', a: 'Gabriel', wrong: ['Michael', 'Raphael', 'The prince of Persia'], ref: 'Daniel 9:21–24', note: 'Michael is named in Daniel 10 and 12.' },
    { id: 'dan4', level: 6, q: 'What did TEKEL mean, as Daniel read the writing on the wall?', a: 'Weighed in the balances and found wanting', wrong: ['God hath numbered thy kingdom', 'Thy kingdom is divided', 'Thy days are fulfilled'], ref: 'Daniel 5:26–28', note: 'MENE: numbered and finished. PERES: divided and given to the Medes and Persians.' },
    { id: 'dan5', level: 6, q: 'Which section of Daniel is written in Aramaic rather than Hebrew?', a: '2:4 to 7:28', wrong: ['Chapters 1 to 6', 'Chapters 7 to 12', '3:1 to 5:31'], ref: 'Daniel 2:4', note: 'It switches as the Chaldeans answer the king "in Syriack".' },
  ],
  jonah: [
    { id: 'jon1', level: 3, q: 'From which port did Jonah set sail?', a: 'Joppa', wrong: ['Tyre', 'Sidon', 'Caesarea'], ref: 'Jonah 1:3' },
    { id: 'jon2', level: 4, q: "Who was Jonah's father?", a: 'Amittai', wrong: ['Amoz', 'Hilkiah', 'Buzi'], ref: 'Jonah 1:1', note: "Amoz was Isaiah's father; Hilkiah, Jeremiah's; Buzi, Ezekiel's." },
    { id: 'jon3', level: 5, q: 'What did God prepare to destroy the gourd that shaded Jonah?', a: 'A worm', wrong: ['A locust', 'A vehement east wind', 'A fire'], ref: 'Jonah 4:7', note: 'The east wind came after the gourd withered (4:8).' },
    { id: 'jon4', level: 6, q: 'How many people in Nineveh could "not discern between their right hand and their left"?', a: 'More than 120,000', wrong: ['About 12,000', 'More than 60,000', 'About 1,000,000'], ref: 'Jonah 4:11', note: 'KJV: "more than sixscore thousand persons".' },
    { id: 'jon5', level: 6, q: 'Outside his own book, Jonah son of Amittai prophesies in the reign of which king?', a: 'Jeroboam son of Joash', wrong: ['Ahab son of Omri', 'Jehu son of Nimshi', 'Hezekiah son of Ahaz'], ref: '2 Kings 14:23–25' },
  ],
  mark: [
    { id: 'mrk1', level: 3, q: 'What was the name of the blind beggar healed near Jericho?', a: 'Bartimaeus', wrong: ['Zacchaeus', 'Lazarus', 'Jairus'], ref: 'Mark 10:46' },
    { id: 'mrk2', level: 4, q: 'What name did Jesus give James and John?', a: 'Boanerges', wrong: ['Barnabas', 'Cephas', 'Didymus'], ref: 'Mark 3:17', note: 'Boanerges means "sons of thunder".' },
    { id: 'mrk3', level: 5, q: 'To whom did Jesus say "Talitha cumi"?', a: "Jairus's daughter", wrong: ["The widow's son at Nain", 'The Syrophenician woman', 'The deaf man in Decapolis'], ref: 'Mark 5:41', note: 'To the deaf man he said "Ephphatha" (7:34).' },
    { id: 'mrk4', level: 6, q: 'Where did Jesus heal a blind man in two stages ("I see men as trees, walking")?', a: 'Bethsaida', wrong: ['Jericho', 'Siloam', 'Capernaum'], ref: 'Mark 8:22–25', note: 'Only Mark records it. Bartimaeus was at Jericho.' },
    { id: 'mrk5', level: 6, q: 'Simon of Cyrene is described in Mark as the father of whom?', a: 'Alexander and Rufus', wrong: ['James and Joses', 'Ananias and Sapphira', 'Andronicus and Junia'], ref: 'Mark 15:21' },
  ],
  john: [
    { id: 'jhn1', level: 3, q: 'How long had the man at the pool of Bethesda been infirm?', a: '38 years', wrong: ['12 years', '18 years', '40 years'], ref: 'John 5:5' },
    { id: 'jhn2', level: 4, q: 'What was the name of the servant whose ear Peter cut off?', a: 'Malchus', wrong: ['Annas', 'Barabbas', 'Onesimus'], ref: 'John 18:10', note: 'Only John records his name.' },
    { id: 'jhn3', level: 5, q: 'Who said "it is expedient for us, that one man should die for the people"?', a: 'Caiaphas', wrong: ['Annas', 'Pilate', 'Nicodemus'], ref: 'John 11:49–50' },
    { id: 'jhn4', level: 6, q: "John calls the healing of the nobleman's son which of Jesus' signs?", a: 'The second', wrong: ['The first', 'The third', 'The seventh'], ref: 'John 4:54', note: 'The first was water into wine at Cana (2:11).' },
    { id: 'jhn5', level: 6, q: 'How many great fishes were in the net after the resurrection?', a: '153', wrong: ['144', '120', '70'], ref: 'John 21:11' },
  ],
  acts: [
    { id: 'act1', level: 3, q: 'Where were the disciples first called Christians?', a: 'Antioch', wrong: ['Jerusalem', 'Ephesus', 'Damascus'], ref: 'Acts 11:26' },
    { id: 'act2', level: 4, q: "Which young man fell from a third-storey window during Paul's long sermon?", a: 'Eutychus', wrong: ['Trophimus', 'Tychicus', 'Aristarchus'], ref: 'Acts 20:9' },
    { id: 'act3', level: 5, q: 'Who was the chief man of the island where Paul was shipwrecked?', a: 'Publius', wrong: ['Julius', 'Sergius Paulus', 'Gallio'], ref: 'Acts 28:7', note: 'Julius was the centurion; Sergius Paulus, the deputy of Cyprus; Gallio, of Achaia.' },
    { id: 'act4', level: 6, q: 'How many men bound themselves under an oath not to eat until they had killed Paul?', a: 'More than forty', wrong: ['Twelve', 'Seventy', 'Three hundred'], ref: 'Acts 23:12–13', note: "Paul's sister's son exposed the plot (23:16)." },
    { id: 'act5', level: 6, q: 'What was the sign of the ship that carried Paul on from Melita?', a: 'Castor and Pollux', wrong: ['Jupiter and Mercurius', 'Diana of the Ephesians', 'The unknown god'], ref: 'Acts 28:11', note: 'At Lystra, Barnabas and Paul were called Jupiter and Mercurius (14:12).' },
  ],
  romans: [
    { id: 'rom1', level: 3, q: '"The just shall live by faith" (Romans 1:17) quotes which prophet?', a: 'Habakkuk', wrong: ['Isaiah', 'Hosea', 'Micah'], ref: 'Habakkuk 2:4' },
    { id: 'rom2', level: 4, q: 'Who does Paul call "the figure of him that was to come"?', a: 'Adam', wrong: ['Moses', 'Abraham', 'Melchizedek'], ref: 'Romans 5:14' },
    { id: 'rom3', level: 5, q: 'Which servant of the church at Cenchrea does Paul commend?', a: 'Phebe', wrong: ['Priscilla', 'Lydia', 'Junia'], ref: 'Romans 16:1' },
    { id: 'rom4', level: 6, q: 'Who wrote down the epistle to the Romans?', a: 'Tertius', wrong: ['Timotheus', 'Silvanus', 'Erastus'], ref: 'Romans 16:22' },
    { id: 'rom5', level: 6, q: '"Jacob have I loved, but Esau have I hated" (Romans 9:13) quotes which prophet?', a: 'Malachi', wrong: ['Obadiah', 'Hosea', 'Isaiah'], ref: 'Malachi 1:2–3', note: 'Romans 9 also quotes Hosea (v.25) and Isaiah (v.27) — and Obadiah is all about Edom.' },
  ],
  philippians: [
    { id: 'php1', level: 3, q: 'Of which tribe does Paul say he was?', a: 'Benjamin', wrong: ['Judah', 'Levi', 'Ephraim'], ref: 'Philippians 3:5' },
    { id: 'php2', level: 4, q: 'Who was "sick nigh unto death" before Paul sent him back to Philippi?', a: 'Epaphroditus', wrong: ['Epaphras', 'Onesimus', 'Tychicus'], ref: 'Philippians 2:25–27' },
    { id: 'php3', level: 5, q: 'Which two women does Paul urge to "be of the same mind in the Lord"?', a: 'Euodias and Syntyche', wrong: ['Lydia and Damaris', 'Tryphena and Tryphosa', 'Lois and Eunice'], ref: 'Philippians 4:2' },
    { id: 'php4', level: 6, q: 'Whose household does Paul especially send greetings from?', a: "Caesar's household", wrong: ["Aristobulus's household", "Narcissus's household", "Stephanas's household"], ref: 'Philippians 4:22' },
    { id: 'php5', level: 6, q: '"Every knee should bow… every tongue should confess" (Philippians 2:10–11) echoes which prophet?', a: 'Isaiah 45', wrong: ['Daniel 7', 'Zechariah 14', 'Joel 2'], ref: 'Isaiah 45:23', note: 'Paul quotes the same verse in Romans 14:11.' },
  ],
  james: [
    { id: 'jas1', level: 3, q: 'Which woman does James cite as "justified by works"?', a: 'Rahab', wrong: ['Ruth', 'Sarah', 'Deborah'], ref: 'James 2:25' },
    { id: 'jas2', level: 4, q: 'James likens the one who doubts to what?', a: 'A wave of the sea', wrong: ['A reed shaken with the wind', 'A cloud without water', 'A house built on sand'], ref: 'James 1:6' },
    { id: 'jas3', level: 5, q: 'According to James, for how long did it not rain after Elijah prayed?', a: 'Three years and six months', wrong: ['Three years', 'Seven years', 'Forty days'], ref: 'James 5:17' },
    { id: 'jas4', level: 6, q: 'To whom is the letter of James addressed?', a: 'The twelve tribes scattered abroad', wrong: ['The saints at Jerusalem', 'The churches of Galatia', 'The elect strangers of Pontus'], ref: 'James 1:1', note: '"Strangers scattered throughout Pontus" opens 1 Peter.' },
    { id: 'jas5', level: 6, q: 'James says Abraham "was called" what?', a: 'The Friend of God', wrong: ['The father of nations', 'A mighty prince', 'The servant of the LORD'], ref: 'James 2:23', note: 'See also 2 Chronicles 20:7 and Isaiah 41:8.' },
  ],
};
