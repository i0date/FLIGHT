import type { RawQuestion } from '../types';

// Daily Flight levels 3–6: connections, sequence, synthesis and scholar-level
// questions. Wrong answers are chosen to be near misses, and notes explain the trap.
export const harderQuestions: RawQuestion[] = [
  // Level 3 · Cruise — who said it, the New Testament quoting the Old, parallel accounts
  { id: 'h301', level: 3, cat: 'People', q: '"Shall not the Judge of all the earth do right?" Who said it?', a: 'Abraham', wrong: ['Moses', 'Job', 'David'], ref: 'Genesis 18:25', note: 'Abraham, interceding for Sodom.' },
  { id: 'h302', level: 3, cat: 'Connections', q: 'Matthew says "Out of Egypt have I called my son" was fulfilled. Which prophet is he quoting?', a: 'Hosea', wrong: ['Isaiah', 'Jeremiah', 'Micah'], ref: 'Matthew 2:15; Hosea 11:1' },
  { id: 'h303', level: 3, cat: 'Connections', q: 'The scribes tell Herod the Christ will be born in Bethlehem. Which prophet do they cite?', a: 'Micah', wrong: ['Isaiah', 'Zechariah', 'Malachi'], ref: 'Matthew 2:5–6; Micah 5:2' },
  { id: 'h304', level: 3, cat: 'Connections', q: '"Behold, a virgin shall be with child" (Matthew 1:23) quotes which prophet?', a: 'Isaiah', wrong: ['Jeremiah', 'Micah', 'Hosea'], ref: 'Isaiah 7:14' },
  { id: 'h305', level: 3, cat: 'Connections', q: '"My God, my God, why hast thou forsaken me?" from the cross opens which psalm?', a: 'Psalm 22', wrong: ['Psalm 23', 'Psalm 51', 'Psalm 110'], ref: 'Matthew 27:46; Psalm 22:1' },
  { id: 'h306', level: 3, cat: 'People', q: '"Speak; for thy servant heareth." Who said it?', a: 'Samuel', wrong: ['Eli', 'Isaiah', 'Elisha'], ref: '1 Samuel 3:10', note: 'Eli taught him to answer "Speak, LORD" (3:9) — Samuel left out "LORD" when he said it.' },
  { id: 'h307', level: 3, cat: 'People', q: '"Thou art the man." Who said it, and to whom?', a: 'Nathan to David', wrong: ['Samuel to Saul', 'Elijah to Ahab', 'Gad to David'], ref: '2 Samuel 12:7' },
  { id: 'h308', level: 3, cat: 'People', q: '"What is truth?" Who asked it?', a: 'Pilate', wrong: ['Herod', 'Caiaphas', 'Festus'], ref: 'John 18:38' },
  { id: 'h309', level: 3, cat: 'People', q: '"Almost thou persuadest me to be a Christian." Who said it?', a: 'King Agrippa', wrong: ['Felix', 'Festus', 'Gallio'], ref: 'Acts 26:28', note: 'Festus, at the same hearing, said "Paul, thou art beside thyself" (26:24).' },
  { id: 'h310', level: 3, cat: 'Connections', q: 'Which Gospel alone records the raising of Lazarus?', a: 'John', wrong: ['Luke', 'Mark', 'Matthew'], ref: 'John 11', note: 'Luke 16 has a Lazarus too — in a parable, not a miracle.' },
  { id: 'h311', level: 3, cat: 'Connections', q: 'How many Gospels record the feeding of the five thousand?', a: 'All four', wrong: ['Three — not John', 'Two — Matthew and Mark', 'Only John'], ref: 'Matthew 14; Mark 6; Luke 9; John 6', note: 'It is the only miracle besides the resurrection recorded in all four.' },
  { id: 'h312', level: 3, cat: 'Connections', q: 'Which Gospel alone records the visit of the wise men?', a: 'Matthew', wrong: ['Luke', 'Mark', 'John'], ref: 'Matthew 2:1–12', note: 'Luke records the shepherds instead.' },
  { id: 'h313', level: 3, cat: 'Connections', q: '"Abraham believed God, and it was counted unto him for righteousness" — Paul quotes which verse?', a: 'Genesis 15:6', wrong: ['Genesis 12:3', 'Genesis 17:5', 'Genesis 22:18'], ref: 'Romans 4:3; Galatians 3:6' },
  { id: 'h314', level: 3, cat: 'People', q: 'Whom did Jesus call "an Israelite indeed, in whom is no guile"?', a: 'Nathanael', wrong: ['Nicodemus', 'Philip', 'Andrew'], ref: 'John 1:47' },
  { id: 'h315', level: 3, cat: 'People', q: '"As for me and my house, we will serve the LORD." Who said it?', a: 'Joshua', wrong: ['Caleb', 'Samuel', 'Moses'], ref: 'Joshua 24:15' },

  // Level 4 · High altitude — order of events and precise detail
  { id: 'h401', level: 4, kind: 'order', q: "Put Jacob's journey in order:", order: ['Dreams of a ladder at Bethel', 'Meets Rachel at the well', 'Wrestles at Peniel', 'Reconciles with Esau'], ref: 'Genesis 28; 29; 32; 33' },
  { id: 'h402', level: 4, kind: 'order', q: 'Put the Exodus in order:', order: ['The burning bush', 'The first Passover', 'Crossing the Red Sea', 'The Ten Commandments'], ref: 'Exodus 3; 12; 14; 20' },
  { id: 'h403', level: 4, kind: 'order', q: 'Put these kings in order of reign:', order: ['Saul', 'David', 'Solomon', 'Rehoboam'], ref: '1 Samuel 10 – 1 Kings 12' },
  { id: 'h404', level: 4, kind: 'order', q: 'Put the last week before the crucifixion in order:', order: ['Triumphal entry into Jerusalem', 'Cleansing the temple', 'The Last Supper', 'Praying in Gethsemane'], ref: 'Mark 11:1–11; 11:15–17; 14:17–25; 14:32' },
  { id: 'h405', level: 4, kind: 'order', q: 'Put the days of creation in order:', order: ['Light', 'The firmament', 'Dry land and plants', 'Sun, moon and stars'], ref: 'Genesis 1:3–19' },
  { id: 'h406', level: 4, q: 'How old was Moses when he died?', a: '120', wrong: ['110', '100', '130'], ref: 'Deuteronomy 34:7', note: 'Joshua died at 110 (Joshua 24:29).' },
  { id: 'h407', level: 4, q: "Who was Leah's firstborn son?", a: 'Reuben', wrong: ['Judah', 'Levi', 'Simeon'], ref: 'Genesis 29:32' },
  { id: 'h408', level: 4, q: 'At the feeding of the four thousand in Mark, how many loaves were there?', a: 'Seven', wrong: ['Five', 'Twelve', 'Three'], ref: 'Mark 8:5', note: 'Five loaves fed the five thousand (6:38).' },
  { id: 'h409', level: 4, q: 'Which tribe received no territory of its own in Canaan?', a: 'Levi', wrong: ['Judah', 'Dan', 'Simeon'], ref: 'Joshua 13:14, 33', note: 'Simeon received land within Judah (Joshua 19:1).' },
  { id: 'h410', level: 4, q: 'About how many were added to the church on the day of Pentecost?', a: 'Three thousand', wrong: ['Five thousand', 'One hundred and twenty', 'Seventy'], ref: 'Acts 2:41', note: 'Five thousand is Acts 4:4; one hundred and twenty is Acts 1:15.' },
  { id: 'h411', level: 4, q: 'Which prophet was told to take "a wife of whoredoms"?', a: 'Hosea', wrong: ['Ezekiel', 'Jeremiah', 'Amos'], ref: 'Hosea 1:2', note: 'Jeremiah was told not to marry at all (Jeremiah 16:2).' },

  // Level 5 · Ceiling — "which is NOT", cross-book synthesis, harder sequences
  { id: 'h501', level: 5, kind: 'order', q: "Put Paul's story in Acts in order:", order: ['Conversion on the Damascus road', 'First journey with Barnabas', 'The council at Jerusalem', 'Shipwreck on Melita'], ref: 'Acts 9; 13; 15; 27–28' },
  { id: 'h502', level: 5, kind: 'order', q: 'Put these judges in the order they appear:', order: ['Ehud', 'Deborah', 'Gideon', 'Samson'], ref: 'Judges 3; 4; 6; 13' },
  { id: 'h503', level: 5, kind: 'order', q: 'Put these books in Bible order:', order: ['Hosea', 'Joel', 'Amos', 'Obadiah'], ref: 'The Minor Prophets' },
  { id: 'h504', level: 5, q: 'Which is NOT an "I am" saying in John\'s Gospel?', a: 'I am the bright and morning star', wrong: ['I am the bread of life', 'I am the true vine', 'I am the door'], ref: 'John 6:35; 15:1; 10:9', note: '"The bright and morning star" is Revelation 22:16.' },
  { id: 'h505', level: 5, q: 'Which is NOT listed as fruit of the Spirit in Galatians 5?', a: 'Wisdom', wrong: ['Meekness', 'Temperance', 'Longsuffering'], ref: 'Galatians 5:22–23' },
  { id: 'h506', level: 5, q: 'Which is NOT part of the armour of God in Ephesians 6?', a: 'The breastplate of faith', wrong: ['The shield of faith', 'The helmet of salvation', 'The girdle of truth'], ref: 'Ephesians 6:14–17', note: 'Ephesians has the breastplate of righteousness. "The breastplate of faith and love" is 1 Thessalonians 5:8.' },
  { id: 'h507', level: 5, q: 'In Galatians 4, Paul treats which two women as an allegory of two covenants?', a: 'Hagar and Sarah', wrong: ['Leah and Rachel', 'Ruth and Orpah', 'Sarah and Rebekah'], ref: 'Galatians 4:22–26' },
  { id: 'h508', level: 5, q: 'Which is NOT one of the seven churches in Revelation 2–3?', a: 'Colosse', wrong: ['Thyatira', 'Sardis', 'Philadelphia'], ref: 'Revelation 1:11', note: 'Colosse was near Laodicea, which is on the list.' },
  { id: 'h509', level: 5, q: 'Which of these books never uses the word "God"?', a: 'Esther', wrong: ['Ruth', 'Jonah', 'Nahum'], ref: 'Esther (KJV)', note: "God's providence runs through Esther without His name being spoken." },
  { id: 'h510', level: 5, q: 'Which New Testament book develops the priesthood of Melchisedec most fully?', a: 'Hebrews', wrong: ['Romans', 'Galatians', 'Revelation'], ref: 'Hebrews 5–7; Genesis 14:18; Psalm 110:4' },
  { id: 'h511', level: 5, q: 'Which was NOT one of the twelve apostles named in Matthew 10?', a: 'Barnabas', wrong: ['Thaddaeus', 'Bartholomew', 'Simon the Canaanite'], ref: 'Matthew 10:2–4', note: 'Barnabas is called an apostle in Acts 14:14, but was not one of the twelve.' },
  { id: 'h512', level: 5, q: 'Which prophet was "an herdman, and a gatherer of sycomore fruit"?', a: 'Amos', wrong: ['Micah', 'Habakkuk', 'Joel'], ref: 'Amos 7:14' },
  { id: 'h513', level: 5, q: "Who was Timothy's mother?", a: 'Eunice', wrong: ['Lois', 'Lydia', 'Priscilla'], ref: '2 Timothy 1:5', note: 'Lois was his grandmother.' },
  { id: 'h514', level: 5, q: "How many years did the LORD add to Hezekiah's life?", a: 'Fifteen', wrong: ['Ten', 'Twelve', 'Twenty'], ref: '2 Kings 20:6' },
  { id: 'h515', level: 5, q: 'Which prophetic book is directed entirely against Edom?', a: 'Obadiah', wrong: ['Nahum', 'Habakkuk', 'Joel'], ref: 'Obadiah 1', note: 'Nahum is against Nineveh.' },
  { id: 'h516', level: 5, q: 'How many years did it take Solomon to build the temple?', a: 'Seven', wrong: ['Three', 'Twelve', 'Thirteen'], ref: '1 Kings 6:38', note: 'His own house took thirteen (7:1).' },

  // Level 6 · Stratosphere — scholar-level detail and traps
  { id: 'h601', level: 6, q: 'Stephen says Abraham bought a tomb in Sychem from the sons of Emmor (Acts 7:16). Genesis records a purchase at Shechem from Hamor\'s sons by someone else. Who?', a: 'Jacob — Genesis 33', wrong: ['Abraham — Genesis 23', 'Joseph — Genesis 50', 'Isaac — Genesis 26'], ref: 'Genesis 33:19; Acts 7:16', note: 'Genesis 23 is Abraham buying Machpelah from Ephron the Hittite.' },
  { id: 'h602', level: 6, q: 'Jude quotes a prophecy from which figure whose words appear nowhere in the Old Testament?', a: 'Enoch', wrong: ['Elijah', 'Noah', 'Moses'], ref: 'Jude 14', note: 'Moses appears in Jude 9, where Michael disputes about his body.' },
  { id: 'h603', level: 6, q: 'Hebrews says Levi paid tithes to Melchisedec while still "in the loins of" whom?', a: 'Abraham', wrong: ['Isaac', 'Jacob', 'Aaron'], ref: 'Hebrews 7:9–10' },
  { id: 'h604', level: 6, q: 'Which king of Judah was struck with leprosy for burning incense in the temple?', a: 'Uzziah', wrong: ['Hezekiah', 'Jehoshaphat', 'Ahaz'], ref: '2 Chronicles 26:16–21' },
  { id: 'h605', level: 6, q: 'The shadow went back ten degrees on the dial of Ahaz as a sign to which king?', a: 'Hezekiah', wrong: ['Ahaz', 'Josiah', 'Manasseh'], ref: '2 Kings 20:8–11', note: 'The dial was named after Ahaz, his father.' },
  { id: 'h606', level: 6, q: 'Maher-shalal-hash-baz was the son of which prophet?', a: 'Isaiah', wrong: ['Hosea', 'Ezekiel', 'Jeremiah'], ref: 'Isaiah 8:3', note: "Hosea's children also had prophetic names — Jezreel, Lo-ruhamah and Lo-ammi." },
  { id: 'h607', level: 6, q: 'Matthew attributes the "thirty pieces of silver" prophecy to which prophet, though the closest wording is in Zechariah 11?', a: 'Jeremiah', wrong: ['Zechariah', 'Isaiah', 'Malachi'], ref: 'Matthew 27:9; Zechariah 11:12–13' },
  { id: 'h608', level: 6, q: 'Where does Paul quote a Cretan "prophet of their own" saying "The Cretians are alway liars"?', a: 'Titus', wrong: ['1 Timothy', 'Acts', '1 Corinthians'], ref: 'Titus 1:12', note: 'Acts 17:28 also cites Greek poets, at Athens.' },
  { id: 'h609', level: 6, kind: 'order', q: 'Put these kings of the northern kingdom of Israel in order:', order: ['Jeroboam', 'Ahab', 'Jehu', 'Hoshea'], ref: '1 Kings 12; 16; 2 Kings 9; 17' },
  { id: 'h610', level: 6, kind: 'order', q: 'Put these events from the life of Abraham in order:', order: ['Called out of Haran', 'Rescues Lot and meets Melchizedek', 'Hagar bears Ishmael', 'Isaac is born'], ref: 'Genesis 12; 14; 16; 21' },
];
