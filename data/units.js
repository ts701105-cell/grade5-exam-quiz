// 十全國小 五年級上學期 第一次段考範圍
// ready: true 表示題庫已完成；file 為題庫檔名（放在 data/ 資料夾）
window.SUBJECTS = [
  {
    id: 'chinese', name: '國語', version: '康軒', color: '#d9534f',
    units: [
      { id: 'chinese-01', title: '第一課　蚊帳大使', ready: true, file: 'chinese-01.js' },
      { id: 'chinese-02', title: '第二課　從空中看臺灣', ready: true, file: 'chinese-02.js' },
      { id: 'chinese-03', title: '第三課　攀岩高手', ready: true, file: 'chinese-03.js' },
      { id: 'chinese-04', title: '第四課　恆久的美', ready: true, file: 'chinese-04.js' },
      { id: 'chinese-05', title: '第五課　它抓得住你——商標的故事', ready: true, file: 'chinese-05.js' },
      { id: 'chinese-06', title: '第六課　故事「動」起來', ready: true, file: 'chinese-06.js' }
    ]
  },
  {
    id: 'math', name: '數學', version: '南一', color: '#2f7ed8',
    units: [
      { id: 'math-01', title: '第一單元　折線圖', ready: true, file: 'math-01.js' },
      { id: 'math-02', title: '第二單元　因數和倍數', ready: true, file: 'math-02.js' },
      { id: 'math-03', title: '第三單元　多邊形', ready: true, file: 'math-03.js' },
      { id: 'math-04', title: '第四單元　擴分、約分和通分', ready: false },
      { id: 'math-05', title: '第五單元　線對稱圖形', ready: false }
    ]
  },
  {
    id: 'social', name: '社會', version: '康軒', color: '#e08a1e',
    units: [
      { id: 'social-01', title: '第一單元', ready: false },
      { id: 'social-02', title: '第二單元', ready: false }
    ]
  },
  {
    id: 'science', name: '自然', version: '康軒', color: '#3a9d5d',
    units: [
      { id: 'science-01', title: '第一單元', ready: false },
      { id: 'science-02', title: '第二單元', ready: false }
    ]
  }
];
