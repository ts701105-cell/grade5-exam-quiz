// 英文（翰林 Here We Go 5）期中考模擬卷（Starter～Unit 2）— 50 題（含聽力 10 題）
// 正確答案都放在第一個選項，網頁會自動打亂順序。
(function () {
  const C = (cat, q, opts, exp, extra) => Object.assign({ type: 'mc', cat, q, opts, ans: 0, exp }, extra || {});
  const T = (cat, q, ok, exp) => ({ type: 'tf', cat, q, opts: ['○ 正確', '✕ 錯誤'], ans: ok ? 0 : 1, exp });
  const L = '一、聽力', W = '二、單字', S = '三、句型', P = '四、Phonics', R = '五、閱讀';
  const TT = [['', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.'],
    ['1', 'Chinese', 'math', 'English', 'math', 'science'],
    ['2', 'PE', 'art', 'music', 'social studies', 'Chinese'],
    ['3', 'math', 'science', 'PE', 'English', 'art']];
  const STORY = '【Read】\nHi, I’m Ben. Today is Wednesday. I have English class, music class, and PE class today. I like PE. It’s my favorite subject. I play basketball with my friends. On Friday, I have art class. I like to draw. Do you have art class on Friday?';

  const Q = [
    // ───── 一、聽力（10）─────
    C(L, '請按「播放」，選出你聽到的星期。', ['Thursday', 'Tuesday', 'Saturday', 'Sunday'], '你聽到的是 Thursday（星期四）。', { audio: 'Thursday' }),
    C(L, '請按「播放」，選出你聽到的數字。', ['84', '48', '18', '80'], '你聽到的是 eighty-four ＝ 84。', { audio: 'eighty-four' }),
    C(L, '請按「播放」，選出你聽到的數字。', ['13', '30', '33', '3'], '你聽到的是 thirteen ＝ 13；thirty 是 30。', { audio: 'thirteen' }),
    C(L, '請按「播放」，選出你聽到的科目。', ['social studies', 'science', 'music', 'math'], '你聽到的是 social studies（社會）。', { audio: 'social studies' }),
    C(L, '請按「播放」聽問句，選出最適合的回答。', ['No, it isn’t. It’s Saturday.', 'Yes, I do.', 'It’s red.', 'No, she doesn’t.'], '問句是 Is it Friday today?，用 Yes, it is. 或 No, it isn’t. 回答。', { audio: 'Is it Friday today?' }),
    C(L, '請按「播放」聽問句，選出最適合的回答。', ['Yes, she does.', 'Yes, I do.', 'Yes, it is.', 'Yes, he does.'], '問句是 Does Mia have music class on Tuesday?，Mia 是女生，用 Yes, she does.', { audio: 'Does Mia have music class on Tuesday?' }),
    C(L, '請按「播放」聽問句，選出最適合的回答。', ['It’s English.', 'It’s Monday.', 'Yes, I do.', 'I see a dog.'], '問句是 What’s your favorite subject?，要回答一個科目。', { audio: "What's your favorite subject?" }),
    C(L, '請聽對話，回答問題：男孩星期一有什麼課？', ['自然課', '體育課', '數學課', '美術課'], '男孩說 No, I don’t. I have science class.', { audio: ['Do you have PE class on Monday?', "No, I don't. I have science class."] }),
    C(L, '請聽對話，回答問題：今天星期幾？', ['星期三', '星期二', '星期四', '星期一'], '對話：Is it Tuesday today? No, it isn’t. It’s Wednesday.', { audio: ['Is it Tuesday today?', "No, it isn't. It's Wednesday."] }),
    C(L, '請聽對話，回答問題：Rocky 在哪裡？', ['在桌子下面', '在椅子上面', '在公園裡', '在教室外面'], 'He’s under the table.', { audio: ["Where's Rocky?", "He's under the table."] }),

    // ───── 二、單字（12）─────
    C(W, 'Monday 的前一天是星期幾？', ['Sunday', 'Tuesday', 'Saturday', 'Friday'], 'Monday 的前一天是 Sunday（星期日）。'),
    C(W, 'Wednesday 和 Friday 中間是星期幾？', ['Thursday', 'Tuesday', 'Saturday', 'Monday'], 'Wednesday（三）→ Thursday（四）→ Friday（五）。'),
    C(W, '下列哪一個星期的拼字「正確」？', ['Saturday', 'Saterday', 'Thrusday', 'Wensday'], '正確拼法：Saturday、Thursday、Wednesday。'),
    C(W, '「週末」是哪兩天？', ['Saturday and Sunday', 'Friday and Saturday', 'Sunday and Monday', 'Monday and Tuesday'], 'weekend 是 Saturday 和 Sunday。'),
    C(W, '「seventy-two」是多少？', ['72', '27', '702', '17'], 'seventy ＝ 70，seventy-two ＝ 72。'),
    C(W, '「100」的英文是？', ['one hundred', 'ten', 'one thousand', 'ten hundred'], '100 ＝ one hundred。'),
    C(W, '在學校跑步、打球的課是哪一科？', ['PE', 'math', 'music', 'art'], 'PE 是體育課。'),
    C(W, '在學校畫畫的課是哪一科？', ['art', 'science', 'Chinese', 'social studies'], 'art 是美術課。'),
    C(W, '「science」是哪一科？', ['自然科學', '社會', '數學', '音樂'], 'science 是自然科學。'),
    C(W, '下列哪一個「不是」科目？', ['scissors', 'music', 'English', 'math'], 'scissors 是剪刀。'),
    C(W, '「eraser」是什麼？', ['橡皮擦', '剪刀', '鉛筆盒', '尺'], 'eraser 是橡皮擦。'),
    C(W, '「butterflies」是什麼？', ['蝴蝶', '小鳥', '蜜蜂', '花朵'], 'butterfly 的複數是 butterflies。'),

    // ───── 三、句型（14）─────
    C(S, '「What day is today?」最適合的回答是？', ['It’s Monday.', 'It’s math.', 'Yes, it is.', 'I’m fine.'], '問星期幾，用 It’s + 星期 回答。'),
    C(S, '今天是星期五。「Is it Thursday today?」要怎麼回答？', ['No, it isn’t. It’s Friday.', 'Yes, it is.', 'No, I don’t.', 'Yes, I do.'], '今天不是星期四，所以 No, it isn’t. It’s Friday.'),
    C(S, '「Do you have math class on Monday?」有的話要怎麼回答？', ['Yes, I do.', 'Yes, it is.', 'Yes, I am.', 'Yes, he does.'], 'Do you ...? 用 Yes, I do. / No, I don’t. 回答。'),
    C(S, '「Does Teddy have art class today?」沒有的話要怎麼回答？', ['No, he doesn’t.', 'No, she doesn’t.', 'No, I don’t.', 'No, it isn’t.'], 'Teddy 是男生，用 he；Does ...? 用 doesn’t 回答。'),
    C(S, '「____ she have English class on Friday?」空格應填？', ['Does', 'Do', 'Is', 'Are'], '主詞是 she（第三人稱單數），問句用 Does。'),
    C(S, '「____ you have PE class on Tuesday?」空格應填？', ['Do', 'Does', 'Is', 'Am'], '主詞是 you，問句用 Do。'),
    C(S, '「Mia ____ music class on Thursday.」空格應填？', ['has', 'have', 'is', 'do'], 'Mia 是第三人稱單數，用 has。'),
    C(S, '「We have science class ____ Monday.」空格應填？', ['on', 'in', 'at', 'under'], '在星期幾，用 on + 星期。'),
    C(S, '把句子排列正確：class / Do / PE / have / you / ?', ['Do you have PE class?', 'You do have PE class?', 'Do PE you have class?', 'Have you do PE class?'], 'Do + 主詞 + have + 科目 + class?'),
    C(S, '「我們星期三有音樂課。」英文怎麼說？', ['We have music class on Wednesday.', 'We has music class on Wednesday.', 'We have Wednesday on music class.', 'We are music class on Wednesday.'], 'We 用 have；on Wednesday 放在後面。'),
    C(S, '「Where’s Rocky?」最適合的回答是？', ['He’s under the table.', 'He’s ten.', 'It’s Monday.', 'Yes, he is.'], '問在哪裡，要回答位置。'),
    C(S, '「What do you see?」最適合的回答是？', ['I see some butterflies.', 'I’m Mia.', 'It’s Tuesday.', 'Yes, I do.'], '問看到什麼，用 I see ... 回答。'),
    C(S, '「What subject does Edison like?」最適合的回答是？', ['He likes art.', 'He like art.', 'Yes, he does.', 'It’s Friday.'], 'he 後面的動詞要加 s：likes。'),
    T(S, '「Does he have math class?」可以回答「Yes, he does.」', true, 'Does he ...? → Yes, he does. / No, he doesn’t.'),

    // ───── 四、Phonics（6）─────
    C(P, '下列哪一個字的 a 發「長音」？', ['cake', 'cat', 'bag', 'hat'], 'a_e 的 a 發長音，例如 cake、lake。'),
    C(P, '下列哪一個字的 ai 和「rain」的 ai 發音相同？', ['train', 'cat', 'apple', 'map'], 'ai 發長音 a。'),
    C(P, '下列哪一個字的母音發「長音 e」？', ['tree', 'bed', 'pen', 'egg'], 'ee、ea、e_e 發長音 e。'),
    C(P, '下列哪一組字的母音發音「相同」？', ['sea、bee', 'bed、tree', 'cake、cat', 'kite、sit'], 'sea（ea）和 bee（ee）都發長音 e。'),
    C(P, '下列哪一個字的 i 發「長音」？', ['kite', 'sit', 'pig', 'fish'], 'i_e 的 i 發長音，例如 kite、nine。'),
    C(P, '「fly」和「sky」字尾的 y 發什麼音？', ['長音 i', '長音 e', '短音 i', '不發音'], '單字字尾的 y（一個音節）發長音 i，例如 fly、sky、my。'),

    // ───── 五、閱讀（8）─────
    C(R, '看 Amy 的課表：Amy 星期二第 1 節是什麼課？', ['math', 'art', 'science', 'Chinese'], 'Tue. 第 1 節是 math。', { table: TT }),
    C(R, '看 Amy 的課表：「Does Amy have PE class on Wednesday?」', ['Yes, she does.', 'No, she doesn’t.', 'Yes, he does.', 'No, it isn’t.'], 'Wed. 第 3 節是 PE。', { table: TT }),
    C(R, '看 Amy 的課表：Amy 哪一天有 social studies class？', ['Thursday', 'Monday', 'Tuesday', 'Friday'], 'Thu. 第 2 節是 social studies。', { table: TT }),
    C(R, '看 Amy 的課表：Amy 一個星期有幾節 math class？', ['3 節', '2 節', '1 節', '4 節'], 'Mon. 第 3 節、Tue. 第 1 節、Thu. 第 1 節，共 3 節。', { table: TT }),
    C(R, STORY + '\n\n今天是星期幾？', ['星期三', '星期五', '星期一', '星期二'], 'Today is Wednesday.'),
    C(R, STORY + '\n\nBen 最喜歡哪一科？', ['體育', '美術', '英文', '音樂'], 'I like PE. It’s my favorite subject.'),
    C(R, STORY + '\n\nBen 哪一天有美術課？', ['星期五', '星期三', '星期四', '星期一'], 'On Friday, I have art class.'),
    T(R, STORY + '\n\nBen 和朋友一起打足球。', false, '文章說 I play basketball with my friends.（籃球）')
  ];

  window.QUIZ_BANK = window.QUIZ_BANK || {};
  window.QUIZ_BANK['english-mid'] = {
    subject: '英文（翰林）',
    title: '期中考模擬卷',
    questions: Q.map((q, i) => Object.assign({ id: 'english-mid-' + String(i + 1).padStart(3, '0') }, q))
  };
})();
