// 英文（翰林 Here We Go 5）Starter + Unit 1 What Day Is Today? — 50 題
(function () {
  const C = (cat, q, opts, ans, exp) => ({ type: 'mc', cat, q, opts, ans, exp });
  const T = (cat, q, ok, exp) => ({ type: 'tf', cat, q, opts: ['○ 正確', '✕ 錯誤'], ans: ok ? 0 : 1, exp });

  const Q = [
    // ───── Starter：數字 6 ─────
    C('Starter 數字', '「twenty-five」是多少？', ['25', '52', '205', '15'], 0, 'twenty（20）+ five（5）= 25。'),
    C('Starter 數字', '「sixty-five」是多少？', ['56', '65', '16', '605'], 1, 'sixty（60）+ five（5）= 65。'),
    C('Starter 數字', '「75」的英文怎麼寫？', ['seventy-five', 'seventeen-five', 'fifty-seven', 'seven-five'], 0, '70 是 seventy，75 是 seventy-five。'),
    C('Starter 數字', '「40」的英文是哪一個？', ['fourteen', 'forty', 'fourty', 'four-ten'], 1, '40 是 forty（沒有 u）；fourteen 是 14。'),
    C('Starter 數字', '「one hundred」是多少？', ['10', '100', '1000', '110'], 1, 'one hundred = 100。'),
    C('Starter 數字', '「thirteen」和「thirty」分別是多少？', ['13 和 30', '30 和 13', '13 和 31', '3 和 30'], 0, '-teen 是 13～19，-ty 是 20、30、40……'),

    // ───── Starter：句型 5 ─────
    C('Starter 句型', '「Where’s Rocky?」最適合的回答是？', ["He’s under the table.", "He’s ten.", "Yes, he is.", "It’s Monday."], 0, 'Where 問地點，回答位置：He’s under the table.（他在桌子下面。）'),
    C('Starter 句型', '「What do you see?」最適合的回答是？', ['I see some butterflies.', "It’s blue.", 'Yes, I do.', "I’m fine."], 0, 'What do you see? 你看到什麼？→ I see some butterflies. 我看到一些蝴蝶。'),
    C('Starter 句型', '「Does Mia have a basketball with her?」如果沒有，要怎麼回答？', ["No, she doesn’t.", "No, she isn’t.", "No, he doesn’t.", "No, I don’t."], 0, 'Does 開頭的問句，主詞是 Mia（她），否定回答 No, she doesn’t.'),
    C('Starter 句型', '「under the table」是什麼意思？', ['在桌子上面', '在桌子下面', '在桌子旁邊', '在桌子裡面'], 1, 'under 是「在……下面」；on 是「在……上面」。'),
    C('Starter 句型', '「board game」是什麼？', ['桌上遊戲（桌遊）', '黑板', '籃球', '足球比賽'], 0, 'board game 是需要在桌上玩的遊戲，例如大富翁。'),

    // ───── Starter：Phonics（a） 4 ─────
    C('Phonics', '下列哪一個字的 a 發「長音」（念字母 A 的名字音）？', ['cake', 'cap', 'cat', 'bag'], 0, 'a_e（a + 子音 + 不發音的 e）發長音，像 cake、lake；cap、cat、bag 是短音 a。'),
    C('Phonics', '「rain」和「email」中的 ai 發什麼音？', ['長音 a', '短音 a', '長音 i', '長音 e'], 0, 'ai 通常發長音 a，像 rain、email、train。'),
    C('Phonics', '下列哪一個字有「ay」的組合？', ['today', 'tea', 'tree', 'kite'], 0, 'today、May、play 都有 ay，發長音 a。'),
    T('Phonics', '「lake」和「cake」的 a 都發長音。', true, '兩個字都是 a_e 的組合，發長音 a。'),

    // ───── Unit 1：星期單字 12 ─────
    C('星期單字', '「Monday」是星期幾？', ['星期一', '星期二', '星期三', '星期日'], 0, 'Monday = 星期一。'),
    C('星期單字', '「Wednesday」是星期幾？', ['星期二', '星期三', '星期四', '星期五'], 1, 'Wednesday = 星期三，拼字要注意中間的 d 不發音。'),
    C('星期單字', '「Thursday」是星期幾？', ['星期二', '星期三', '星期四', '星期六'], 2, 'Thursday = 星期四；Tuesday 才是星期二。'),
    C('星期單字', '「Saturday」是星期幾？', ['星期五', '星期六', '星期日', '星期一'], 1, 'Saturday = 星期六。'),
    C('星期單字', '「星期日」的英文是？', ['Sunday', 'Monday', 'Saturday', 'Someday'], 0, '星期日 = Sunday。'),
    C('星期單字', '「星期二」的英文是？', ['Thursday', 'Tuesday', 'Today', 'Twosday'], 1, '星期二 = Tuesday；容易和 Thursday（星期四）搞混。'),
    C('星期單字', '「星期五」的英文是？', ['Friday', 'Fryday', 'Finday', 'Saturday'], 0, '星期五 = Friday。'),
    C('星期單字', 'Tuesday 的下一天是星期幾？', ['Monday', 'Wednesday', 'Thursday', 'Sunday'], 1, 'Tuesday（二）→ Wednesday（三）。'),
    C('星期單字', 'Saturday 的下一天是星期幾？', ['Friday', 'Monday', 'Sunday', 'Thursday'], 2, 'Saturday（六）→ Sunday（日）。'),
    C('星期單字', '下列哪一個拼字正確？', ['Wednesday', 'Wensday', 'Wendsday', 'Wednsday'], 0, '正確拼法是 Wednesday。'),
    C('星期單字', '星期的英文第一個字母要怎麼寫？', ['一定大寫', '一定小寫', '隨便寫', '只有星期日大寫'], 0, '星期的英文是專有名詞，第一個字母要大寫，例如 Monday。'),
    T('星期單字', '週末（weekend）是指 Saturday 和 Sunday。', true, '週末是星期六和星期日。'),

    // ───── Unit 1：句型 13 ─────
    C('Unit 1 句型', '「What day is today?」是在問什麼？', ['今天星期幾？', '今天幾號？', '今天天氣如何？', '現在幾點？'], 0, 'What day is today? 今天星期幾？'),
    C('Unit 1 句型', '「What day is today?」最適合的回答是？', ["It’s Friday.", "It’s sunny.", "It’s ten o’clock.", "I’m ten."], 0, '問星期幾，回答 It’s + 星期。'),
    C('Unit 1 句型', '「Is it Monday today?」今天是星期一，要怎麼回答？', ['Yes, it is.', 'Yes, I am.', 'Yes, I do.', 'Yes, it does.'], 0, 'Is it ...? 的肯定回答是 Yes, it is.'),
    C('Unit 1 句型', '「Is it Monday today?」今天是星期二，要怎麼回答？', ["No, it isn’t. It’s Tuesday.", "No, it isn’t. It’s Monday.", "Yes, it is. It’s Tuesday.", "No, I don’t. It’s Tuesday."], 0, '不是星期一，先說 No, it isn’t.，再說出正確的星期 It’s Tuesday.'),
    C('Unit 1 句型', '「It ____ Sunday today.」空格應填？', ['is', 'are', 'am', 'do'], 0, 'It 搭配 is：It is Sunday today.'),
    C('Unit 1 句型', '「____ day is today?」空格應填？', ['What', 'Where', 'Who', 'How'], 0, '問星期幾用 What day。'),
    C('Unit 1 句型', '「Is there a football game today?」如果有，要怎麼回答？', ['Yes, there is.', 'Yes, it is.', 'Yes, I do.', 'Yes, they are.'], 0, 'Is there ...? 的肯定回答是 Yes, there is.'),
    C('Unit 1 句型', '「What color is it?」最適合的回答是？', ["It’s blue.", "It’s Monday.", "It’s a cat.", "It’s five."], 0, '問顏色，回答 It’s + 顏色。'),
    C('Unit 1 句型', '把句子排列正確：today / is / What / day / ?', ['What day is today?', 'What is day today?', 'Today what day is?', 'Day what is today?'], 0, '正確順序：What day is today?'),
    C('Unit 1 句型', '「It’s Wednesday.」是在回答哪一個問題？', ['What day is today?', 'How are you?', 'What color is it?', 'Where are you?'], 0, '說出星期幾，是在回答 What day is today?'),
    C('Unit 1 句型', '「Where are the kids?」最適合的回答是？', ["They’re in the park.", "It’s Friday.", "Yes, they are.", "They’re ten."], 0, 'Where 問地點，主詞 the kids 是複數，用 They’re ... 回答。'),
    T('Unit 1 句型', '「Is it Friday today?」的否定回答是「No, it isn’t.」', true, 'isn’t 是 is not 的縮寫。'),
    T('Unit 1 句型', '「What day is today?」可以回答「It’s blue.」', false, '問的是星期幾，要回答星期，例如 It’s Monday.'),

    // ───── Unit 1：Phonics（e） 6 ─────
    C('Phonics', '下列哪一個字有「ee」，發長音 e？', ['tree', 'tea', 'ten', 'red'], 0, 'tree、bee 的 ee 發長音 e。'),
    C('Phonics', '下列哪一個字有「ea」，發長音 e？', ['sea', 'see', 'set', 'bed'], 0, 'sea、tea 的 ea 發長音 e。'),
    C('Phonics', '「Pete」和「these」的 e_e 發什麼音？', ['長音 e', '短音 e', '長音 a', '不發音'], 0, 'e_e 的組合，第一個 e 發長音，最後的 e 不發音。'),
    C('Phonics', '下列哪一組字的母音發音「相同」？', ['bee、tea', 'bee、bed', 'tea、ten', 'sea、set'], 0, 'bee 的 ee 和 tea 的 ea 都發長音 e。'),
    C('Phonics', '「bed」的 e 發什麼音？', ['短音 e', '長音 e', '長音 a', '不發音'], 0, 'bed、ten、red 是短音 e。'),
    T('Phonics', '「tree」和「sea」的母音都發長音 e。', true, 'ee 和 ea 都可以發長音 e。'),

    // ───── 文化 4 ─────
    C('文化', 'Unit 1 介紹的國家西班牙（Spain），最受歡迎的運動是什麼？', ['football（足球）', 'ice hockey（冰上曲棍球）', 'baseball（棒球）', 'surfing（衝浪）'], 0, '西班牙人很熱愛足球（football）。'),
    C('文化', '「Sagrada Familia」（聖家堂）位在哪一個國家？', ['Spain（西班牙）', 'Japan（日本）', 'the USA（美國）', 'Taiwan（臺灣）'], 0, '聖家堂在西班牙的巴塞隆納，是著名的建築。'),
    C('文化', '「football」在這一課是指哪一種運動？', ['足球', '美式足球', '籃球', '棒球'], 0, '在英國、西班牙等地，football 指的是足球。'),
    T('文化', '「Park Güell」（奎爾公園）是西班牙有名的公園。', true, '奎爾公園位在西班牙巴塞隆納。')
  ];

  window.QUIZ_BANK = window.QUIZ_BANK || {};
  window.QUIZ_BANK['english-01'] = {
    subject: '英文（翰林）',
    title: 'Starter ＋ Unit 1　What Day Is Today?',
    questions: Q.map((q, i) => Object.assign({ id: 'english-01-' + String(i + 1).padStart(3, '0') }, q))
  };
})();
