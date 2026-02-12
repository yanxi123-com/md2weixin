let app = new Vue({
  el: "#app",
  data: function () {
    let d = {
      output: "",
      source: "",
      editorThemes: [
        { label: "base16-light", value: "base16-light" },
        { label: "duotone-light", value: "duotone-light" },
        { label: "monokai", value: "monokai" },
      ],
      editor: null,
      builtinFonts: [
        {
          label: "无衬线",
          value: "fonts-no-cx",
        },
        {
          label: "衬线",
          value: "fonts-cx",
        },
      ],
      sizeOption: [
        { label: "17px", value: "size17", desc: "很大-默认" },
        { label: "16px", value: "size16", desc: "稍大" },
        { label: "15px", value: "size15", desc: "正常" },
        { label: "14px", value: "size14", desc: "稍小" },
      ],
      themeOption: [
        { label: "默认主题", value: "default", author: "" },
        { label: "橙心", value: "chengxin", author: "zhning12" },
        { label: "墨黑", value: "mohei", author: "Mayandev" },
        { label: "姹紫", value: "chazi", author: "djmaxwow" },
        { label: "嫩青", value: "nenqing", author: "画手" },
        { label: "绿意", value: "lvyi", author: "夜尽天明" },
        { label: "红绯", value: "hongfei", author: "HeyRain" },
        { label: "WeChat-Format", value: "wechat-format", author: "画手" },
        { label: "蓝莹", value: "lanying", author: "谭松宸" },
        { label: "科技蓝", value: "kejilan", author: "夜尽天明" },
        { label: "兰青", value: "lanqing", author: "Krahets" },
        { label: "山吹", value: "shanchui", author: "ElyhG" },
        { label: "前端之巅同款", value: "qianduan", author: "HeyRain" },
        { label: "极客黑", value: "jikehei", author: "hyper-xx" },
        { label: "简", value: "jian", author: "aco" },
        { label: "蔷薇紫", value: "qiangweizi", author: "HeyRain" },
        { label: "萌绿", value: "menglv", author: "koala" },
        { label: "全栈蓝", value: "quanzhanlan", author: "Nealyang" },
      ],
      aboutDialogVisible: false,
    };
    d.currentEditorTheme = d.editorThemes[0].value;
    d.currentFont = d.builtinFonts[0].value;
    d.currentSize = d.sizeOption[0].value;
    d.currentTheme = d.themeOption[0].value;
    return d;
  },
  mounted() {
    let self = this;
    this.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
      lineNumbers: false,
      lineWrapping: true,
      styleActiveLine: true,
      theme: this.currentEditorTheme,
      mode: "text/x-markdown",
    });
    this.editor.on("change", function (cm, change) {
      self.refresh();
      self.saveEditorContent();
    });
    // 如果有编辑内容被保存则读取，否则加载默认文档
    if (localStorage.getItem("__editor_content")) {
      this.editor.setValue(localStorage.getItem("__editor_content"));
    } else {
      this.setMarkdownContent();
    }
  },
  methods: {
    setMarkdownContent: function (name) {
      axios({
        method: "get",
        url: "./assets/md/" + (name || "default") + ".md",
      }).then(function (resp) {
        app.editor.setValue(resp.data);
      });
    },
    renderWeChat: function (source) {
      if (typeof window.renderWechatMarkdown === "function") {
        return window.renderWechatMarkdown(source);
      }

      let wxRenderer = new WxRenderer();
      let output = marked(source, { renderer: wxRenderer.getRenderer() });
      if (wxRenderer.hasFootnotes()) {
        output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
        output += wxRenderer.buildFootnotes();
        output += wxRenderer.buildAddition();
      }
      return output;
    },
    editorThemeChanged: function (editorTheme) {
      this.editor.setOption("theme", editorTheme);
    },
    // 刷新右侧预览
    refresh: function () {
      this.output = this.renderWeChat(this.editor.getValue(0));
    },
    // 将左侧编辑器内容保存到 LocalStorage
    saveEditorContent: function () {
      let content = this.editor.getValue(0);
      if (content) {
        localStorage.setItem("__editor_content", content);
      } else {
        localStorage.removeItem("__editor_content");
      }
    },
    copy: function () {
      const html =
        typeof window.exportWechatHtml === "function"
          ? window.exportWechatHtml("md-root")
          : document.getElementById("md-root").outerHTML;

      // 创建一个带有 HTML 的 ClipboardItem 对象
      var blob = new Blob([html], { type: "text/html" });
      var clipboardItem = new ClipboardItem({ "text/html": blob });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          this.$message({
            message: "已复制到剪贴板",
            type: "success",
          });
        })
        .catch((err) => {
          this.$message({
            message: "未能复制到剪贴板，请全选后右键复制",
            type: "warning",
          });
        });
    },
    openWindow: function (url) {
      window.open(url);
    },
  },
  updated: function () {
    this.$nextTick(function () {
      if (typeof window.runWechatPrettyPrint === "function") {
        window.runWechatPrettyPrint();
        return;
      }
      prettyPrint();
    });
  },
});
