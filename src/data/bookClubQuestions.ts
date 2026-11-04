import type { RawQuestion } from '../types';

// Book Club: five questions per book, ordered from hardest-but-fair (1) to
// very hard (5). Each set is meant for someone currently studying that book.
// Books without a set yet show as "Boarding soon" in the passport.
export const bookClubQuestions: Record<string, RawQuestion[]> = {
  genesis: [
    { id: 'gen1', q: 'On which day of creation were the sun, moon and stars made?', a: 'The fourth day', wrong: ['The first day', 'The second day', 'The fifth day'], ref: 'Genesis 1:14–19', note: 'Light itself appears on day one (1:3); the lights in the firmament on day four.' },
    { id: 'gen2', q: 'How old was Abram when he departed out of Haran?', a: '75', wrong: ['65', '86', '99'], ref: 'Genesis 12:4' },
    { id: 'gen3', q: 'What did Jacob name the place where he dreamed of the ladder?', a: 'Bethel', wrong: ['Peniel', 'Mahanaim', 'Beersheba'], ref: 'Genesis 28:19', note: 'The city had been called Luz.' },
    { id: 'gen4', q: 'What Egyptian name did Pharaoh give Joseph?', a: 'Zaphnath-paaneah', wrong: ['Belteshazzar', 'Potipherah', 'Rameses'], ref: 'Genesis 41:45' },
    { id: 'gen5', q: "Who was the father of Asenath, Joseph's wife?", a: 'Potipherah, priest of On', wrong: ['Potiphar, captain of the guard', 'Jethro, priest of Midian', 'Melchizedek, king of Salem'], ref: 'Genesis 41:45', note: 'Not to be confused with Potiphar, whose house Joseph served in (39:1).' },
  ],
  exodus: [
    { id: 'exo1', q: 'Whom did Moses marry in Midian?', a: 'Zipporah', wrong: ['Miriam', 'Jochebed', 'Elisheba'], ref: 'Exodus 2:21' },
    { id: 'exo2', q: 'Which plague came ninth?', a: 'Thick darkness', wrong: ['Hail', 'Locusts', 'Boils'], ref: 'Exodus 10:21–23' },
    { id: 'exo3', q: "Who held up Moses' hands during the battle with Amalek?", a: 'Aaron and Hur', wrong: ['Joshua and Caleb', 'Nadab and Abihu', 'Eleazar and Ithamar'], ref: 'Exodus 17:12' },
    { id: 'exo4', q: 'Who was filled "with the spirit of God, in wisdom… to devise cunning works" for the tabernacle?', a: 'Bezaleel', wrong: ['Eleazar', 'Nadab', 'Ithamar'], ref: 'Exodus 31:2–4', note: 'Aholiab of the tribe of Dan was appointed to work alongside him (31:6).' },
    { id: 'exo5', q: "How many rows of stones were set in the high priest's breastplate?", a: 'Four', wrong: ['Three', 'Six', 'Twelve'], ref: 'Exodus 28:17–21', note: 'Four rows of three — twelve stones for the twelve tribes.' },
  ],
  ruth: [
    { id: 'rut1', q: 'From which land did Ruth come?', a: 'Moab', wrong: ['Edom', 'Ammon', 'Midian'], ref: 'Ruth 1:4' },
    { id: 'rut2', q: 'What did Naomi ask to be called on returning to Bethlehem?', a: 'Mara', wrong: ['Naamah', 'Hagar', 'Lo-ruhamah'], ref: 'Ruth 1:20', note: 'Mara means "bitter".' },
    { id: 'rut3', q: "What was the name of Naomi's husband?", a: 'Elimelech', wrong: ['Elkanah', 'Salmon', 'Obed'], ref: 'Ruth 1:2' },
    { id: 'rut4', q: 'What did the nearer kinsman hand over to confirm the redemption to Boaz?', a: 'His shoe', wrong: ['His ring', 'His staff', 'His cloak'], ref: 'Ruth 4:7–8' },
    { id: 'rut5', q: "Who was Ruth's first husband?", a: 'Mahlon', wrong: ['Chilion', 'Elimelech', 'Salmon'], ref: 'Ruth 4:10', note: 'Chilion was married to Orpah.' },
  ],
  esther: [
    { id: 'est1', q: 'Which queen did Esther replace?', a: 'Vashti', wrong: ['Zeresh', 'Jezebel', 'Athaliah'], ref: 'Esther 1:19, 2:17' },
    { id: 'est2', q: "What was Esther's Hebrew name?", a: 'Hadassah', wrong: ['Hannah', 'Hephzibah', 'Huldah'], ref: 'Esther 2:7' },
    { id: 'est3', q: 'How high was the gallows Haman had made?', a: 'Fifty cubits', wrong: ['Ten cubits', 'Thirty cubits', 'Sixty cubits'], ref: 'Esther 5:14, 7:9' },
    { id: 'est4', q: 'The feast of Purim takes its name from "Pur". What is Pur?', a: 'The lot', wrong: ['The sceptre', 'The decree', 'The ring'], ref: 'Esther 3:7, 9:24–26' },
    { id: 'est5', q: 'Which two chamberlains plotted against the king, a plot uncovered by Mordecai?', a: 'Bigthan and Teresh', wrong: ['Hegai and Shaashgaz', 'Hatach and Harbonah', 'Mehuman and Biztha'], ref: 'Esther 2:21–23' },
  ],
  daniel: [
    { id: 'dan1', q: 'The writing on the wall appeared during whose feast?', a: 'Belshazzar', wrong: ['Nebuchadnezzar', 'Darius', 'Cyrus'], ref: 'Daniel 5:1–5' },
    { id: 'dan2', q: "What did Daniel ask to eat instead of the king's meat?", a: 'Pulse and water', wrong: ['Bread and water', 'Locusts and honey', 'Manna and quail'], ref: 'Daniel 1:12' },
    { id: 'dan3', q: 'What Babylonian name was given to Daniel?', a: 'Belteshazzar', wrong: ['Belshazzar', 'Abednego', 'Shadrach'], ref: 'Daniel 1:7' },
    { id: 'dan4', q: "Which king had Daniel cast into the lions' den?", a: 'Darius the Median', wrong: ['Nebuchadnezzar', 'Belshazzar', 'Cyrus the Persian'], ref: 'Daniel 5:31, 6:16' },
    { id: 'dan5', q: 'Who came to give Daniel understanding of the seventy weeks?', a: 'Gabriel', wrong: ['Michael', 'Raphael', 'The prince of Persia'], ref: 'Daniel 9:21–24', note: 'Michael is named in Daniel 10 and 12.' },
  ],
  jonah: [
    { id: 'jon1', q: 'Instead of Nineveh, where was Jonah fleeing to?', a: 'Tarshish', wrong: ['Tyre', 'Egypt', 'Babylon'], ref: 'Jonah 1:3' },
    { id: 'jon2', q: 'From which port did Jonah set sail?', a: 'Joppa', wrong: ['Tyre', 'Sidon', 'Caesarea'], ref: 'Jonah 1:3' },
    { id: 'jon3', q: "Who was Jonah's father?", a: 'Amittai', wrong: ['Amoz', 'Hilkiah', 'Buzi'], ref: 'Jonah 1:1', note: 'Amoz was Isaiah\'s father; Hilkiah, Jeremiah\'s; Buzi, Ezekiel\'s.' },
    { id: 'jon4', q: 'What did God prepare to destroy the gourd that shaded Jonah?', a: 'A worm', wrong: ['A locust', 'A vehement east wind', 'A fire'], ref: 'Jonah 4:7', note: 'The east wind came next, after the gourd withered (4:8).' },
    { id: 'jon5', q: 'How many people in Nineveh could "not discern between their right hand and their left"?', a: 'More than 120,000', wrong: ['About 12,000', 'More than 60,000', 'About 1,000,000'], ref: 'Jonah 4:11', note: 'KJV: "more than sixscore thousand persons".' },
  ],
  mark: [
    { id: 'mrk1', q: 'What did John the Baptist eat?', a: 'Locusts and wild honey', wrong: ['Bread and water', 'Pulse and figs', 'Manna'], ref: 'Mark 1:6' },
    { id: 'mrk2', q: 'What was the name of the blind beggar healed near Jericho?', a: 'Bartimaeus', wrong: ['Zacchaeus', 'Lazarus', 'Jairus'], ref: 'Mark 10:46' },
    { id: 'mrk3', q: 'What name did Jesus give James and John?', a: 'Boanerges', wrong: ['Barnabas', 'Cephas', 'Didymus'], ref: 'Mark 3:17', note: 'Boanerges means "sons of thunder".' },
    { id: 'mrk4', q: 'To whom did Jesus say "Talitha cumi"?', a: "Jairus's daughter", wrong: ["The widow's son at Nain", 'The Syrophenician woman', 'The deaf man in Decapolis'], ref: 'Mark 5:41', note: 'To the deaf man he said "Ephphatha" (7:34).' },
    { id: 'mrk5', q: 'Simon of Cyrene is described in Mark as the father of whom?', a: 'Alexander and Rufus', wrong: ['James and Joses', 'Ananias and Sapphira', 'Andronicus and Junia'], ref: 'Mark 15:21' },
  ],
  john: [
    { id: 'jhn1', q: "Where did Jesus perform the first of his signs?", a: 'Cana of Galilee', wrong: ['Capernaum', 'Bethany', 'Nazareth'], ref: 'John 2:11' },
    { id: 'jhn2', q: 'Who came to Jesus by night?', a: 'Nicodemus', wrong: ['Joseph of Arimathaea', 'Zacchaeus', 'Gamaliel'], ref: 'John 3:1–2' },
    { id: 'jhn3', q: 'How long had the man at the pool of Bethesda been infirm?', a: '38 years', wrong: ['12 years', '18 years', '40 years'], ref: 'John 5:5' },
    { id: 'jhn4', q: "What was the name of the servant whose ear Peter cut off?", a: 'Malchus', wrong: ['Annas', 'Barabbas', 'Onesimus'], ref: 'John 18:10', note: 'Only John records his name.' },
    { id: 'jhn5', q: 'How many great fishes were in the net after the resurrection?', a: '153', wrong: ['144', '120', '70'], ref: 'John 21:11' },
  ],
  acts: [
    { id: 'act1', q: 'Who was chosen to replace Judas among the twelve?', a: 'Matthias', wrong: ['Barsabas', 'Barnabas', 'Stephen'], ref: 'Acts 1:23–26', note: 'Joseph called Barsabas was the other candidate.' },
    { id: 'act2', q: 'Who in Samaria offered money to receive the power to give the Holy Ghost?', a: 'Simon', wrong: ['Elymas', 'Bar-jesus', 'Demetrius'], ref: 'Acts 8:9–20' },
    { id: 'act3', q: 'Where were the disciples first called Christians?', a: 'Antioch', wrong: ['Jerusalem', 'Ephesus', 'Damascus'], ref: 'Acts 11:26' },
    { id: 'act4', q: "Which young man fell from a third-storey window during Paul's long sermon?", a: 'Eutychus', wrong: ['Trophimus', 'Tychicus', 'Aristarchus'], ref: 'Acts 20:9' },
    { id: 'act5', q: 'Who was the chief man of the island where Paul was shipwrecked?', a: 'Publius', wrong: ['Julius', 'Sergius Paulus', 'Gallio'], ref: 'Acts 28:7', note: 'Julius was the centurion; Sergius Paulus the deputy of Cyprus; Gallio of Achaia.' },
  ],
  romans: [
    { id: 'rom1', q: 'Which chapter opens "There is therefore now no condemnation to them which are in Christ Jesus"?', a: 'Romans 8', wrong: ['Romans 5', 'Romans 6', 'Romans 12'], ref: 'Romans 8:1' },
    { id: 'rom2', q: 'In Romans 1:17 Paul quotes "The just shall live by faith" from which prophet?', a: 'Habakkuk', wrong: ['Isaiah', 'Hosea', 'Micah'], ref: 'Romans 1:17; Habakkuk 2:4' },
    { id: 'rom3', q: 'Who does Paul call "the figure of him that was to come"?', a: 'Adam', wrong: ['Moses', 'Abraham', 'Melchizedek'], ref: 'Romans 5:14' },
    { id: 'rom4', q: 'Which servant of the church at Cenchrea does Paul commend?', a: 'Phebe', wrong: ['Priscilla', 'Lydia', 'Junia'], ref: 'Romans 16:1' },
    { id: 'rom5', q: 'Who wrote down the epistle to the Romans?', a: 'Tertius', wrong: ['Timotheus', 'Silvanus', 'Erastus'], ref: 'Romans 16:22' },
  ],
  philippians: [
    { id: 'php1', q: 'Finish the verse: "For to me to live is Christ, and to die is…"', a: 'gain', wrong: ['life', 'rest', 'glory'], ref: 'Philippians 1:21' },
    { id: 'php2', q: 'Of which tribe does Paul say he was?', a: 'Benjamin', wrong: ['Judah', 'Levi', 'Ephraim'], ref: 'Philippians 3:5' },
    { id: 'php3', q: 'Who was "sick nigh unto death" before Paul sent him back to Philippi?', a: 'Epaphroditus', wrong: ['Epaphras', 'Onesimus', 'Tychicus'], ref: 'Philippians 2:25–27' },
    { id: 'php4', q: 'Which two women does Paul urge to "be of the same mind in the Lord"?', a: 'Euodias and Syntyche', wrong: ['Lydia and Damaris', 'Tryphena and Tryphosa', 'Lois and Eunice'], ref: 'Philippians 4:2' },
    { id: 'php5', q: 'Whose household does Paul especially send greetings from?', a: "Caesar's household", wrong: ["Aristobulus's household", "Narcissus's household", "Stephanas's household"], ref: 'Philippians 4:22' },
  ],
  james: [
    { id: 'jas1', q: 'Whose patience does James hold up as an example?', a: 'Job', wrong: ['Abraham', 'Joseph', 'Jeremiah'], ref: 'James 5:11' },
    { id: 'jas2', q: 'Which woman does James cite as "justified by works"?', a: 'Rahab', wrong: ['Ruth', 'Sarah', 'Deborah'], ref: 'James 2:25' },
    { id: 'jas3', q: 'James likens the one who doubts to what?', a: 'A wave of the sea', wrong: ['A reed shaken with the wind', 'A cloud without water', 'A house built on sand'], ref: 'James 1:6' },
    { id: 'jas4', q: 'For how long did it not rain after Elijah prayed, according to James?', a: 'Three years and six months', wrong: ['Three years', 'Seven years', 'Forty days'], ref: 'James 5:17' },
    { id: 'jas5', q: 'To whom is the letter of James addressed?', a: 'The twelve tribes scattered abroad', wrong: ['The saints at Jerusalem', 'The churches of Galatia', 'The elect strangers of Pontus'], ref: 'James 1:1', note: '"Strangers scattered throughout Pontus" opens 1 Peter.' },
  ],
};

export const ALTITUDES = [
  { ft: '10,000 ft', label: 'Take-off' },
  { ft: '18,000 ft', label: 'Climb' },
  { ft: '26,000 ft', label: 'Cruise' },
  { ft: '33,000 ft', label: 'High altitude' },
  { ft: '41,000 ft', label: 'Ceiling' },
];
