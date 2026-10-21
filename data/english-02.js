// 英文（翰林 Here We Go 5）Unit 2 Do You Have PE Class on Monday? — 50 題
(function () {
  const C = (cat, q, opts, ans, exp) => ({ type: 'mc', cat, q, opts, ans, exp });
  const T = (cat, q, ok, exp) => ({ type: 'tf', cat, q, opts: ['○ 正確', '✕ 錯誤'], ans: ok ? 0 : 1, exp });

  // Amy 的課表（看表回答）
  // 表頭縮寫：Mon.=Monday、Tue.=Tuesday、Wed.=Wednesday、Thu.=Thursday、Fri.=Friday；左欄是第幾節
  const TT = [
    ['', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.'],
    ['1', 'math', 'English', 'Chinese', 'math', 'science'],
    ['2', 'PE', 'art', 'music', 'social studies', 'English'],
    ['3', 'Chinese', 'science', 'PE', 'art', 'music']
  ];
  const CT = (...a) => Object.assign(C(...a), { table: TT });
  const TTb = (...a) => Object.assign(T(...a), { table: TT });

  const Q = [
    // ───── 科目單字 12 ─────
    C('科目單字', '「PE」是哪一科？', ['體育', '美術', '音樂', '自然'], 0, 'PE（Physical Education）是體育課。'),
    C('科目單字', '「math」是哪一科？', ['數學', '音樂', '社會', '英文'], 0, 'math = 數學。'),
    C('科目單字', '「science」是哪一科？', ['自然科學', '社會', '國語', '美術'], 0, 'science = 自然（科學）。'),
    C('科目單字', '「art」是哪一科？', ['美術', '音樂', '體育', '數學'], 0, 'art = 美術。'),
    C('科目單字', '「music」是哪一科？', ['音樂', '美術', '自然', '英文'], 0, 'music = 音樂。'),
    C('科目單字', '「social studies」是哪一科？', ['社會', '自然', '國語', '體育'], 0, 'social studies = 社會。'),
    C('科目單字', '「國語」課的英文是？', ['Chinese', 'English', 'China', 'Chinese food'], 0, '國語（中文）課 = Chinese。'),
    C('科目單字', '「英文」課的英文是？', ['English', 'England', 'Chinese', 'art'], 0, '英文課 = English，第一個字母要大寫。'),
    C('科目單字', '下列哪一個「不是」科目？', ['eraser', 'math', 'music', 'science'], 0, 'eraser 是橡皮擦，不是科目。'),
    C('科目單字', '在學校上「PE class」時，最可能做什麼？', ['打球、跑步', '畫畫', '唱歌', '做實驗'], 0, 'PE 是體育課，會做運動。'),
    C('科目單字', '在「science lab」（實驗室）上的最可能是哪一科？', ['science', 'PE', 'Chinese', 'music'], 0, 'lab 是實驗室，通常上自然課。'),
    T('科目單字', '「Chinese」和「English」的第一個字母都要大寫。', true, '語言科目名稱是專有名詞，要大寫。'),

    // ───── 文具與其他單字 5 ─────
    C('單字', '「scissors」是什麼？', ['剪刀', '鉛筆', '橡皮擦', '尺'], 0, 'scissors = 剪刀。'),
    C('單字', '「eraser」是什麼？', ['橡皮擦', '鉛筆盒', '剪刀', '電腦'], 0, 'eraser = 橡皮擦。'),
    C('單字', '「computer」是什麼？', ['電腦', '手機', '書桌', '計算機'], 0, 'computer = 電腦。'),
    C('單字', '「cellphone」是什麼？', ['手機', '電腦', '相機', '電視'], 0, 'cellphone = 手機。'),
    C('單字', '「ice hockey」是哪一種運動？', ['冰上曲棍球', '足球', '溜冰', '棒球'], 0, 'ice hockey = 冰上曲棍球。'),

    // ───── 句型：Do you ... ? 10 ─────
    C('Unit 2 句型', '「Do you have PE class on Monday?」有的話要怎麼回答？', ['Yes, I do.', 'Yes, I am.', 'Yes, it is.', 'Yes, you do.'], 0, 'Do you ...? 的肯定回答是 Yes, I do.'),
    C('Unit 2 句型', '「Do you have math class on Friday?」沒有的話要怎麼回答？', ["No, I don’t.", "No, I’m not.", "No, it isn’t.", "No, you don’t."], 0, 'Do you ...? 的否定回答是 No, I don’t.'),
    C('Unit 2 句型', '「____ you have art class on Tuesday?」空格應填？', ['Do', 'Does', 'Are', 'Is'], 0, '主詞是 you，用 Do。'),
    C('Unit 2 句型', '「Do you have music class ____ Wednesday?」空格應填？', ['on', 'in', 'at', 'of'], 0, '星期幾前面用 on：on Wednesday。'),
    C('Unit 2 句型', '「Do you have English class on Thursday?」這句話的意思是？', ['你星期四有英文課嗎？', '你星期二有英文課嗎？', '你喜歡英文課嗎？', '你今天有英文課嗎？'], 0, 'Thursday 是星期四。'),
    C('Unit 2 句型', '把句子排列正確：class / Do / have / you / science / ?', ['Do you have science class?', 'You do have science class?', 'Do have you science class?', 'Science class do you have?'], 0, '問句順序：Do + you + have + 科目 + class?'),
    C('Unit 2 句型', '「我星期一有體育課。」英文怎麼說？', ['I have PE class on Monday.', 'I has PE class on Monday.', 'I have PE class in Monday.', 'I am PE class on Monday.'], 0, '主詞 I 用 have，星期前面用 on。'),
    C('Unit 2 句型', '「We have math class on Friday.」改成問句，正確的是？', ['Do you have math class on Friday?', 'Does you have math class on Friday?', 'Are you have math class on Friday?', 'Do you has math class on Friday?'], 0, '問「你們」用 Do you have ...?'),
    T('Unit 2 句型', '「Do you have PE class on Monday?」可以回答「Yes, I do.」', true, 'Do you 的肯定回答是 Yes, I do.'),
    T('Unit 2 句型', '「Do you have art class?」可以回答「Yes, I am.」', false, 'Do 開頭的問句要用 do 回答：Yes, I do.'),

    // ───── 句型：Does he/she ... ? 10 ─────
    C('Unit 2 句型', '「Does she have English class on Friday?」有的話要怎麼回答？', ['Yes, she does.', 'Yes, she do.', 'Yes, she is.', 'Yes, he does.'], 0, 'Does she ...? 的肯定回答是 Yes, she does.'),
    C('Unit 2 句型', '「Does he have science class on Monday?」沒有的話要怎麼回答？', ["No, he doesn’t.", "No, he don’t.", "No, he isn’t.", "No, she doesn’t."], 0, 'Does he ...? 的否定回答是 No, he doesn’t.'),
    C('Unit 2 句型', '「____ Edison have art class on Tuesday?」空格應填？', ['Does', 'Do', 'Is', 'Are'], 0, '主詞是 Edison（他，單數第三人稱），用 Does。'),
    C('Unit 2 句型', '「____ Mia and Teddy have PE class today?」空格應填？', ['Do', 'Does', 'Is', 'Has'], 0, 'Mia and Teddy 是兩個人（複數），用 Do。'),
    C('Unit 2 句型', '「Does the girl have PE class on Sunday?」最適合的回答是？', ["No, she doesn’t.", "No, he doesn’t.", "No, I don’t.", "No, it isn’t."], 0, 'the girl 是女生，用 she；星期日通常不上學。'),
    C('Unit 2 句型', '「He ____ music class on Wednesday.」空格應填？', ['has', 'have', 'is', 'do'], 0, '肯定句中，he/she 後面的 have 要變成 has。'),
    C('Unit 2 句型', '「Does she ____ English class?」空格應填？', ['have', 'has', 'is', 'does'], 0, '問句有 Does 時，後面的動詞用原形 have。'),
    C('Unit 2 句型', '「What subject does Edison like?」最適合的回答是？', ['He likes art.', 'He like art.', 'Yes, he does.', 'He is art.'], 0, '問喜歡什麼科目，主詞 he 的動詞要加 s：He likes art.'),
    C('Unit 2 句型', '「What’s your favorite subject?」最適合的回答是？', ["It’s PE.", "It’s Monday.", 'Yes, I do.', "I’m PE."], 0, '問最喜歡的科目，回答 It’s + 科目。'),
    T('Unit 2 句型', '「Does he have math class?」的否定回答是「No, he doesn’t.」', true, 'doesn’t 是 does not 的縮寫。'),

    // ───── 看課表回答 7 ─────
    CT('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：「Does Amy have PE class on Monday?」', ['Yes, she does.', "No, she doesn’t.", 'Yes, he does.', "No, I don’t."], 0, '星期一第 2 節是 PE，所以 Yes, she does.'),
    CT('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：「Does Amy have music class on Tuesday?」', ["No, she doesn’t.", 'Yes, she does.', 'Yes, she is.', "No, she isn’t."], 0, '星期二的課是 English、art、science，沒有 music。'),
    CT('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：星期三第 2 節是什麼課？', ['music', 'PE', 'art', 'Chinese'], 0, '星期三第 2 節是 music。'),
    CT('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：Amy 哪幾天有 math class？', ['Monday and Thursday', 'Tuesday and Friday', 'Monday and Wednesday', 'Thursday and Friday'], 0, 'math 在星期一第 1 節和星期四第 1 節。'),
    CT('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：Amy 在哪一天有 social studies class？', ['Thursday', 'Monday', 'Tuesday', 'Friday'], 0, 'social studies 在星期四第 2 節。'),
    TTb('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：Amy 星期五有 English class。', true, '星期五第 2 節是 English。'),
    TTb('看課表', '看 Amy 的課表（Mon.＝星期一……Fri.＝星期五）：Amy 星期三有 art class。', false, '星期三是 Chinese、music、PE，沒有 art。'),

    // ───── Phonics（i） 4 ─────
    C('Phonics', '下列哪一個字的 i 發「長音」（念字母 I 的名字音）？', ['kite', 'sit', 'pig', 'fish'], 0, 'i_e 發長音 i，像 kite、nine；sit、pig、fish 是短音 i。'),
    C('Phonics', '「tie」和「pie」中的 ie 發什麼音？', ['長音 i', '短音 i', '長音 e', '長音 a'], 0, 'ie 在字尾常發長音 i，像 tie、pie。'),
    C('Phonics', '「fly」和「sky」字尾的 y 發什麼音？', ['長音 i', '長音 e', '短音 i', '不發音'], 0, 'y 在短字的字尾常發長音 i，像 fly、sky、my。'),
    T('Phonics', '「nine」和「kite」的 i 都發長音。', true, '兩個字都是 i_e 的組合。'),

    // ───── 文化 2 ─────
    C('文化', 'Unit 2 介紹各國特別的學校課程，澳洲（Australia）有哪一種特別的課？', ['surfing（衝浪）', 'ice hockey（冰上曲棍球）', 'folk dance（民俗舞蹈）', 'cybersecurity（資訊安全）'], 0, '澳洲四面環海，有學校開設衝浪課。'),
    C('文化', '亞美尼亞（Armenia）的學校有哪一種特別的課？', ['folk dance（民俗舞蹈）', 'surfing（衝浪）', 'football（足球）', 'ice hockey（冰上曲棍球）'], 0, '亞美尼亞的學校有民俗舞蹈課。')
  ];

  window.QUIZ_BANK = window.QUIZ_BANK || {};
  window.QUIZ_BANK['english-02'] = {
    subject: '英文（翰林）',
    title: 'Unit 2　Do You Have PE Class on Monday?',
    questions: Q.map((q, i) => Object.assign({ id: 'english-02-' + String(i + 1).padStart(3, '0') }, q))
  };
})();
