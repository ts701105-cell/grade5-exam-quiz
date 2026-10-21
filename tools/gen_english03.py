# 產生 英文（翰林 Here We Go 5）聽力測驗 50 題（範圍：Starter、Unit 1、Unit 2）
# audio 欄位是要唸出來的英文；陣列代表兩個人的對話。
import json, random
random.seed(503)
Q = []

def mc(cat, q, audio, right, wrongs, exp):
    wrongs = [w for w in dict.fromkeys(wrongs) if w != right][:3]
    assert len(wrongs) == 3, (q, right, wrongs)
    opts = [right] + wrongs
    random.shuffle(opts)
    Q.append({'type': 'mc', 'cat': cat, 'q': q, 'audio': audio, 'opts': opts, 'ans': opts.index(right), 'exp': exp})

# ───── 聽單字，選中文意思（12）─────
words = [('Monday', '星期一'), ('Wednesday', '星期三'), ('Thursday', '星期四'), ('Saturday', '星期六'), ('Sunday', '星期日'),
         ('math', '數學'), ('science', '自然'), ('PE', '體育'), ('art', '美術'), ('music', '音樂'), ('scissors', '剪刀'), ('butterflies', '蝴蝶')]
pool_days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
pool_sub = ['數學', '自然', '體育', '美術', '音樂', '社會', '國語', '英文']
pool_obj = ['剪刀', '橡皮擦', '鉛筆', '電腦', '蝴蝶', '桌子', '籃球']
for w, zh in words:
    pool = pool_days if zh in pool_days else pool_sub if zh in pool_sub else pool_obj
    mc('聽單字', '請按「播放」聽單字，選出它的中文意思。', w, zh, random.sample([p for p in pool if p != zh], 3), f'你聽到的是「{w}」，意思是{zh}。')

# ───── 聽單字，選拼字（8）─────
spell = [('Tuesday', ['Thursday', 'Today', 'Tuesdey']), ('Thursday', ['Tuesday', 'Thirsday', 'Thursdey']),
         ('Friday', ['Fryday', 'Sunday', 'Freeday']), ('Wednesday', ['Wensday', 'Wendsday', 'Weekday']),
         ('science', ['sience', 'silence', 'scene']), ('music', ['magic', 'musik', 'mosaic']),
         ('eraser', ['erazer', 'razor', 'easier']), ('English', ['England', 'Englich', 'Chinese'])]
for w, ws in spell:
    mc('聽拼字', '請聽單字，選出正確的拼字。', w, w, ws, f'你聽到的是「{w}」。')

# ───── 聽數字（8）─────
nums = [('twenty-five', '25', ['52', '15', '35']), ('sixty-five', '65', ['56', '16', '75']), ('forty', '40', ['14', '4', '44']),
        ('fourteen', '14', ['40', '4', '41']), ('seventy-five', '75', ['57', '65', '17']), ('one hundred', '100', ['10', '1000', '110']),
        ('thirty', '30', ['13', '3', '33']), ('ninety-two', '92', ['29', '82', '19'])]
for say, right, ws in nums:
    mc('聽數字', '請聽數字，選出你聽到的數字。', say, right, ws, f'你聽到的是「{say}」＝ {right}。')

# ───── 聽問句，選最適合的回答（12）─────
qa = [
    ('What day is today?', "It's Friday.", ["It's blue.", 'Yes, I do.', "I'm fine."]),
    ('Is it Monday today?', 'Yes, it is.', ['Yes, I do.', 'Yes, she does.', "It's blue."]),
    ('Do you have PE class on Monday?', 'Yes, I do.', ['Yes, it is.', "It's Monday.", 'Yes, she is.']),
    ('Does she have English class on Friday?', 'Yes, she does.', ['Yes, I do.', 'Yes, it is.', 'Yes, he does.']),
    ("Does he have music class on Tuesday?", "No, he doesn't.", ["No, I don't.", "No, it isn't.", "No, she doesn't."]),
    ("What's your favorite subject?", "It's art.", ["It's Monday.", 'Yes, I do.', "It's blue."]),
    ("Where's Rocky?", "He's under the table.", ["It's Sunday.", "He's ten.", 'Yes, he is.']),
    ('What do you see?', 'I see some butterflies.', ["It's Tuesday.", 'Yes, I do.', "I'm Mia."]),
    ('What color is it?', "It's blue.", ["It's Friday.", "It's a dog.", 'Yes, it is.']),
    ('Is there a football game today?', 'Yes, there is.', ['Yes, I do.', 'Yes, he does.', "It's football."]),
    ('What subject does Edison like?', 'He likes art.', ['He like art.', 'Yes, he does.', "It's Monday."]),
    ('Where are the kids?', "They're in the park.", ["It's Friday.", 'Yes, they are.', "They're ten."]),
]
for say, right, ws in qa:
    mc('聽問句', '請聽問句，選出最適合的回答。', say, right, ws, f'問句是「{say}」，最適合的回答是「{right}」。')

# ───── 聽對話，回答問題（10）─────
dlg = [
    (['What day is today?', "It's Tuesday."], '今天星期幾？', '星期二', ['星期四', '星期一', '星期日'], '對話中說 It\'s Tuesday.（星期二）。'),
    (['Is it Saturday today?', "No, it isn't. It's Sunday."], '今天星期幾？', '星期日', ['星期六', '星期一', '星期五'], '回答說不是星期六，是 Sunday（星期日）。'),
    (['Do you have math class on Wednesday?', "No, I don't. I have music class."], '他星期三有什麼課？', '音樂課', ['數學課', '美術課', '體育課'], '他說 No, I don\'t. I have music class.'),
    (['Does Mia have art class on Thursday?', 'Yes, she does.'], 'Mia 星期四有什麼課？', '美術課', ['音樂課', '自然課', '英文課'], 'Yes, she does. 表示她星期四有 art class。'),
    (["What's your favorite subject?", "It's science."], '他最喜歡哪一科？', '自然', ['數學', '體育', '社會'], 'It\'s science.（自然）'),
    (['Does Teddy have PE class on Friday?', "No, he doesn't. He has PE class on Monday."], 'Teddy 哪一天有體育課？', '星期一', ['星期五', '星期三', '星期二'], '他星期五沒有，星期一（Monday）才有 PE class。'),
    (['Is there a football game today?', 'Yes, there is.'], '今天有什麼活動？', '足球比賽', ['籃球比賽', '音樂會', '沒有活動'], 'Yes, there is. 表示今天有 football game。'),
    (["Where's Rocky?", "He's under the table."], 'Rocky 在哪裡？', '桌子下面', ['桌子上面', '公園裡', '教室外面'], 'under the table 是在桌子下面。'),
    (['What do you see?', 'I see some butterflies.'], '他看到什麼？', '一些蝴蝶', ['一隻狗', '一顆籃球', '一張桌子'], 'butterflies 是蝴蝶。'),
    (['What subject does Edison like?', 'He likes art. He likes to draw.'], 'Edison 喜歡哪一科？', '美術', ['音樂', '數學', '英文'], 'He likes art.（美術），他喜歡畫畫。'),
]
for audio, q, right, ws, exp in dlg:
    mc('聽對話', f'請聽對話，回答問題：{q}', audio, right, ws, exp)

assert len(Q) == 50, len(Q)
for i, q in enumerate(Q):
    q['id'] = 'english-03-%03d' % (i + 1)
js = ('// 英文（翰林 Here We Go 5）聽力測驗 — 50 題（由 tools/gen_english03.py 產生）\n'
      'window.QUIZ_BANK = window.QUIZ_BANK || {};\n'
      "window.QUIZ_BANK['english-03'] = " + json.dumps({'subject': '英文（翰林）', 'title': '聽力測驗（Starter～Unit 2）', 'questions': Q}, ensure_ascii=False) + ';\n')
open('/home/claude/grade5-quiz/data/english-03.js', 'w', encoding='utf-8').write(js)
from collections import Counter
print(len(Q), Counter(q['cat'] for q in Q))
