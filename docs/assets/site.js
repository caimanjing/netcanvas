const I18N = {
  en: {
    "meta.title":
      "NetCanvas: Interactive Visual Working Memory for LLM-Based IP Network Fault Localization",
    "meta.description":
      "NetCanvas turns the engineer’s live topology map into runtime working memory for LLM agents doing IP fault localization.",
    "hero.kicker": "Problem · Solution · Effect · Next",
    "hero.tagline":
      "Let the agent look at the network the way an engineer does.",
    "hero.paper": "Paper (PDF)",
    "hero.arxiv": "arXiv (soon)",
    "hero.code": "Repo",
    "hero.project": "Project",
    "hero.cite": "Cite",
    "toc.title": "On this page",
    "toc.problem": "Problem",
    "toc.solution": "Solution",
    "toc.results": "Effect",
    "toc.next": "Next",
    "toc.cite": "Cite",
    "problem.kicker": "01 / Problem",
    "problem.title":
      "The evidence was in hand. The agent still named the wrong firewall.",
    "problem.lead":
      "Put an LLM agent into real multi-device, multi-path network troubleshooting and a counterintuitive failure shows up: it can parse every CLI dump, yet adjacency and path forks stay scattered across an ever-growing log, re-assembled from fragments at every hop. We call this failure <em>topology amnesia</em>. It sounds abstract — so start with one real question. It shows the failure cleanly, and it shows the fix on the same case.",
    "problem.case":
      "An office PC cannot reach the internet. The network has a hot-standby firewall pair. The gold answer is that one of them has global HRP off. The text-only agent issued <strong>151</strong> commands and even read the standby state on both firewalls — <strong>the evidence was in hand</strong>. It then blamed the other firewall’s security policy, plus a NAT miss on the egress gateway. Two wrong answers, and the wrong device on the path.",
    "problem.why":
      "What it lacked was not reading skill, and not knowledge: it knows how to check HRP, and it can parse the dumps. What it lacked was spatial memory — which of the two parallel firewalls sits where on this path was never stored in one stable place. The deeper the investigation, the more local facts it held, and the worse the spatial picture collapsed in the long log. Longer context, fine-tuning, RL: none of that maintains network state for the model.",
    "problem.textGif":
      "Same question, the text-only failure: 151 tool calls, all of them CLI, replayed command by command from the failing run.",
    "problem.gif":
      "Same question, a passing NetCanvas run, one physical plane. The full network is not given at kickoff. After each CLI, devices and links grow onto the map; the current focus is highlighted.",
    "problem.turn":
      "Now change exactly one variable. Same question, same backbone, same commands — move “what the network looks like” out of the model’s head and into the system: that is NetCanvas. Watch the two runs side by side. Left: the text-only agent replaying its 151 commands. Right: the map growing frame by frame — probe the core and both firewalls surface; shift focus onto a firewall and the path starts to form; when the egress gateway lands, the whole path sits on the map.",
    "problem.verdict":
      "Once the two firewalls sit side by side on the map, the question stops being “which firewall is sick” and becomes “what this firewall is supposed to do on this path.” This run took <strong>49</strong> tool calls, only <strong>5</strong> of them CLI, and answered right on the first try. 151 versus 49 is not stronger reasoning — it is no longer rebuilding the network from a log at every hop. The 30.3% → 54.5% pair in the results below is made of questions like this one.",
    "solution.kicker": "02 / Solution",
    "solution.title":
      "Close the loop between probing and seeing",
    "solution.lead":
      "Move the camera from the question to the system. The system does not retune the model. It changes the path the model takes to a solution: where evidence goes, what this step shows, and how the next view is framed. <strong>Not expertise in the prompt — the working method in the agent’s runtime.</strong>",
    "solution.see":
      "The same network is not the same object to a person and to an agent. A senior engineer keeps a live map: where traffic enters, where it splits, which hop the firewall sits on. A text-only agent faces a one-dimensional CLI scroll — adjacency, forks, and layers flattened into dumps, rebuilt from fragments at every hop. NetCanvas takes that live map out of the expert’s head and makes it working memory the system can maintain and the model can click.",
    "solution.teaserCaption":
      "Same network, three ways of seeing. Left: the engineer keeps a live map. Middle: a text-only agent rebuilds adjacency from log fragments at every hop. Right: NetCanvas updates the topology with probing and puts an interactive working memory into context.",
    "solution.loopIntro": "The loop is closed:",
    "solution.probeK": "Probe",
    "solution.ingestK": "Ingest",
    "solution.renderK": "Render",
    "solution.actK": "Choose next",
    "solution.probe":
      "<strong>Probe</strong> — issue CLI on a device; the environment returns raw text.",
    "solution.ingest":
      "<strong>Ingest</strong> — a dedicated extractor writes routes, interfaces, and next hops into a growing graph. New evidence goes into the map, not only onto the end of the chat.",
    "solution.render":
      "<strong>Render</strong> — crop this step’s view in an engineer’s layout, plus a clickable index. The agent sees this frame, not a dump of every node.",
    "solution.act":
      "<strong>Choose the next step</strong> — the agent can issue another CLI command; switch the view’s scope or evidence plane; inspect a node or link; trace an L2 or L3 path; or stop probing and answer. Every visual action returns a new frame for the next decision.",
    "solution.archCaption":
      "Four-layer split. The model side holds only the topology image and the clickable index. The backend owns validation, graph updates, and rendering. Graph state does not enter context as JSON.",
    "solution.three":
      "The loop determines how evidence enters working memory and guides the next action. Three design choices make it more than a static picture: <strong>continuous ingestion</strong> keeps spatial state across probes; <strong>on-demand framing</strong> shows only the device, link, or path needed now; and an <strong>engineer-native layout</strong> makes that spatial state directly readable. The next section tests these choices against structured data, static maps, and a generic layout.",
    "fig.forms": "figures/workflow.png",
    "fig.results": "figures/results.png",
    "fig.ablation": "figures/ablation.png",
    "results.kicker": "03 / Effect",
    "results.title": "What we added is not “a figure”",
    "results.intro":
      "One question is not a result. On CTBench Q1–Q66, same backbone, same CLI, same scoring — only the working-memory form changes. Best-of-3, strict set match, no partial credit. First, the four worlds the agent actually receives on the same question.",
    "results.m3": "NetCanvas · 36/66 · 113 steps",
    "results.m2": "Structured graph · 25/66 · 217 steps",
    "results.m1": "Text-only · 20/66 · 159 steps",
    "results.nail":
      "<strong>JSON is not enough.</strong> The same ingest, symbols only in front: 37.9% (25/66), average steps up to 217. The graph lives in the system, not as spatial structure the model can use. <strong>A static global picture is not enough.</strong> 24/66 and 29/66, both below the 36/66 that redraws and highlights. <strong>The wrong layout is not enough either.</strong> Keep ingest and the click protocol; swap only coordinates for a force-directed view, and 54.5% falls back to <strong>37.9%</strong>. With a physical-link prior, NetCanvas reaches <strong>63.6%</strong> (42/66) — the ceiling of working memory plus a base map, not the no-prior 30.3% vs 54.5% contrast.",
    "results.formsCaption":
      "Same question, four worlds in context: raw CLI, a JSON subgraph, a static physical snapshot, and NetCanvas rendering the local path.",
    "results.chartCaption":
      "Pass rate up, steps down. The structured-graph family walks the most. NetCanvas is 54.5% / 113 steps; with a link prior, 63.6% / 107.",
    "results.costCaption":
      "Pass rate against per-run tokens. The visual arms beat every structured-graph variant on both axes, the link prior pushes both further, and the generic-layout ablation (M3g) is worse and costlier. Accuracy here is not bought with cost.",
    "results.close":
      "So: structure alone is not enough, a picture is not enough, and “being able to click” is not enough. The results point back to the same three design choices: <strong>continuous ingestion, on-demand framing, and an engineer-native layout</strong>. Together they turn topology from an extra picture into working memory.",
    "next.kicker": "04 / Next",
    "next.title":
      "The next scaling step for network agents happens outside the model",
    "next.lead":
      "NetCanvas still misses <strong>30</strong> of 66. Almost none of those are “draw more pictures.” The remaining faults sit in extraction (VRF, prefix-lists) and in multi-hop causal close-out after the evidence is already in context. The harness can take over <em>unreliable organisation and memory</em>. It cannot take over those two.",
    "next.body":
      "The gain we can point to is mostly <strong>probe coverage</strong>: the device that used to be skipped gets visited, because the path is visible. On dual-firewall / HRP / ECMP, text-only is about 10% and NetCanvas about 90%. Cross-city VPN stays weak: NetCanvas is only 6.7%. That is the boundary, not a slogan.",
    "next.close":
      "Same backbone: 30.3% as a naked model, 54.5% once the working method sits outside it. You do not have to turn the weights into a senior engineer first. You can first let the system design a smarter way of looking at the network.",
    "cite.title": "Cite this work",
    "cite.copy": "Copy",
    "cite.copied": "Copied",
    "cite.manual": "Select manually",
    "cite.note":
      "Project page: <a href=\"https://caimanjing.github.io/netcanvas/\">https://caimanjing.github.io/netcanvas/</a>. The paper PDF is at the top of this page. This work is not listed on arXiv yet. The repository currently holds the project page and paper materials, not runnable code.",
    "footer.license":
      "This project page and paper materials are licensed under <a rel=\"license\" href=\"https://creativecommons.org/licenses/by-nc-sa/4.0/\">CC BY-NC-SA 4.0</a>.",
  },
  zh: {
    "meta.title":
      "NetCanvas：面向 LLM 网络故障定位的交互式视觉工作记忆",
    "meta.description":
      "把网工脑子里的活图做成 Agent 的运行时工作记忆，用于跨设备 IP 故障定位。",
    "hero.kicker": "问题 · 方案 · 效果 · 下一步",
    "hero.tagline": "让 Agent 像网工一样看着网络排障",
    "hero.paper": "论文 PDF",
    "hero.arxiv": "arXiv（即将）",
    "hero.code": "仓库",
    "hero.project": "主页",
    "hero.cite": "引用",
    "toc.title": "本页目录",
    "toc.problem": "问题",
    "toc.solution": "方案",
    "toc.results": "效果",
    "toc.next": "下一步",
    "toc.cite": "引用",
    "problem.kicker": "01 / 问题",
    "problem.title": "证据都拿到了，Agent 还是认错了防火墙",
    "problem.lead":
      "把 LLM Agent 放进多设备、多路径的真实网络排障，会看到一种反直觉的失效：每一条 CLI 它都读得懂，但设备邻接、路径分叉这些空间关系散落在越滚越长的日志里，每往前一跳都要从碎片里重新拼一遍。我们把这种失效叫做「拓扑失忆」。它听起来抽象，先看一道真实的题——它把这种失效暴露得最干净，也把解法的疗效摆得最直接。",
    "problem.case":
      "题目是一台办公 PC 上不了外网。网里有一对互为热备的双防火墙，标准答案是其中一台没启用全局热备协议（HRP）。纯文本 Agent 发了 <strong>151</strong> 条命令，把两台防火墙的热备状态都查过了——<strong>证据它拿到手了</strong>。但它最后把根因判给了另一台防火墙的安全策略，还捎带上一台出口网关的 NAT 配置：两条都错，而且认错了是哪一台在这条路径上出问题。",
    "problem.why":
      "缺的不是阅读能力，也不是知识：热备该怎么查、命令怎么读，它全都会。缺的是空间记忆——两台并行的防火墙在这条路径上各自站在哪个位置，这件事没有一处稳定地存着。排障越深，局部观测越多，整体空间关系反而在长文本里坍塌。堆更多上下文、上微调和强化学习，都绕不开这一点：模型缺的不是知识，而是持续维护网络空间状态的能力。",
    "problem.textGif":
      "同一道题，纯文本失败侧：151 次工具调用，全部在发命令。逐条命令回放自那条失败轨迹。",
    "problem.gif":
      "同一道题上，NetCanvas 侧的拓扑生长过程（同一张物理平面，逐帧取自一条答对的轨迹）。不是开局给出全网，而是每下发一条 CLI，设备和连线在图上长出来；当前焦点高亮。",
    "problem.turn":
      "现在换掉唯一一个变量。同一道题、同一个底座模型、同一套可用命令，只把「网长什么样」从模型脑子里挪进系统——也就是换成 NetCanvas。下面两条轨迹放在一起看。左边，纯文本那 151 条命令的回放；右边，那张网逐帧在它眼前长出来——探到核心，两侧防火墙先露头；焦点移到防火墙，路径开始成形；出口网关齐了，整条路径才落在图上。",
    "problem.verdict":
      "两台防火墙的并行关系一旦在图上摆开，问题就从「哪台防火墙有毛病」变成了「这条路径上这台防火墙该起什么作用」。这一次它用了 <strong>49</strong> 次工具调用，其中只有 <strong>5</strong> 次是发命令，答案一次就对。151 比 49，赢的不是更强的推理，而是它不再需要在长文本里一遍遍重建那张网。后面效果一节那组 30.3% 到 54.5%，背后就是一道道这样的题。",
    "solution.kicker": "02 / 方案",
    "solution.title": "让 Agent 在探查与看图之间闭环",
    "solution.lead":
      "把镜头从题目移到系统。系统改的不是参数，而是模型解决问题的路径——证据进到哪里、当前这一步看见什么、下一步如何在图上取景。<strong>不是把专家经验写进 Prompt，而是把专家的工作方式写进 Agent 的运行时。</strong>",
    "solution.see":
      "同一张网，在人和 Agent 眼里本来就不是一回事。资深网工排障时，脑子里始终悬着一张活图：流量从哪进、在哪分流、防火墙卡在第几跳。纯文本 Agent 面对的却是一维滚动的 CLI，邻接、分叉、区域层级全被压扁进回显，每往前一跳都要从碎片里重新脑补。NetCanvas 做的，是把那张活图从「只能存在于专家脑子里」，变成系统可以维护、模型可以点选的工作记忆。",
    "solution.teaserCaption":
      "同一张网，在人和 Agent 眼里是两回事。左，工程师脑中维护拓扑；中，纯文本 Agent 必须从日志碎片反复重建关系；右，NetCanvas 让拓扑随探查更新，并作为可交互的工作记忆进入上下文。",
    "solution.loopIntro": "整条链路是一个闭环：",
    "solution.probeK": "探查",
    "solution.ingestK": "入图",
    "solution.renderK": "渲染",
    "solution.actK": "选择下一步",
    "solution.probe":
      "<strong>探查。</strong>对指定设备下发 CLI，环境返回原始文本。",
    "solution.ingest":
      "<strong>入图。</strong>专门的抽取模型把回显写成路由、接口、下一跳，合并进持续累积的图。新证据进图，而不是只追加在对话末尾。",
    "solution.render":
      "<strong>渲染。</strong>按网工习惯切出这一步的视图，并生成可点选的索引。Agent 拿到的是当前画面，不是整库节点清单。",
    "solution.act":
      "<strong>选择下一步。</strong>Agent 可以继续向某台设备发 CLI；切换总览、邻域或路径视图以及证据平面；检查节点或链路属性；追踪二层或三层路径；证据足够时，也可以停止探查并给出答案。每次看图操作都会返回新画面，进入下一轮决策。",
    "solution.archCaption":
      "四层分工。最左是模型侧，上下文里只有拓扑图和那份可点选的索引；后台负责校验调用、更新图状态、动态渲染。图状态不以 JSON 形式进上下文。",
    "solution.three":
      "闭环解决的是证据如何进入工作记忆、又如何参与下一步决策。要让它不只是静态插图，还需要三个设计：<strong>持续入图</strong>，让空间状态随探查累积；<strong>按需取景</strong>，只呈现当前需要的设备、链路或路径；<strong>领域布局</strong>，按照网工熟悉的方式组织空间关系。三者分别保证状态连续、视图聚焦和空间可读。下一节用结构化数据、静态全图和通用布局三组对照验证。",
    "fig.forms": "figures/workflow-zh.png",
    "fig.results": "figures/results-zh.png",
    "fig.ablation": "figures/ablation-zh.png",
    "results.kicker": "03 / 效果",
    "results.title": "补上的不是一张图",
    "results.intro":
      "一道题赢了不算数。CTBench 前 66 道故障定位题，同一个模型、同一套 CLI 与评分规则，只换工作记忆的组织方式。best-of-3，严格集合匹配，不给部分分。先看同一道题上，Agent 实际收到的四种世界。",
    "results.m3": "NetCanvas · 36/66 · 113 步",
    "results.m2": "结构化图 · 25/66 · 217 步",
    "results.m1": "纯文本 · 20/66 · 159 步",
    "results.nail":
      "<strong>结构化数据不够。</strong>后台同样入图，前台只给 JSON：37.9%（25/66），平均探查反而升到 217 步。图在系统里，不在模型能直接用的空间关系里。<strong>开局一张静态全图不够。</strong>24/66 和 29/66，都低于会重绘、会高亮的 36/66。<strong>布局不对同样不行。</strong>入图和交互协议都不变，只把坐标换成通用力导向，54.5% 掉回 <strong>37.9%</strong>。有物理连线底图时 NetCanvas 到 <strong>63.6%</strong>（42/66）——那是「工作记忆 + 底图」的上限，不是 30.3% 对 54.5% 那组无底图净对照。",
    "results.formsCaption":
      "同一道题上的四种工作记忆。左上纯文本，拓扑必须从回显碎片里脑补；右上结构化图，图在系统里，模型仍要从符号推断谁连谁；左下开局静态全图，信息全给但没有焦点；右下 NetCanvas，按当前路径渲染局部。",
    "results.chartCaption":
      "通过率上去，步数下来。结构化图那一栏步数最高。NetCanvas 54.5% / 113 步；加连线底图 63.6% / 107 步。",
    "results.costCaption":
      "通过率对单次 Token。视觉家族（Visual）比所有结构化图（Graph）变体又准又省，加底图后两头再往前推；只换布局的 M3g 则又贵又差。精度不是拿成本换来的。",
    "results.close":
      "所以：有结构不够，有图不够，能交互也不够。实验最终指回方案里的三个设计——<strong>持续入图、按需取景、领域布局</strong>。三者合在一起，拓扑才从额外插图变成工作记忆。",
    "next.kicker": "04 / 下一步",
    "next.title": "网络 Agent 的下一跳 Scaling，发生在模型之外",
    "next.lead":
      "NetCanvas 在 66 道上仍然错了 <strong>30</strong> 道。几乎没有一道是「画得不够多」。剩下的卡在抽取（VRF、前缀列表）和证据到手之后的多跳因果收敛。Harness 能拿走的，是<em>组织和记录不可靠</em>那一层；这两件它拿不走。",
    "next.body":
      "能指着的增益，主要是<strong>探查覆盖率</strong>：原来漏掉的那台设备被查到了，因为路径看得见。双防火墙、HRP、ECMP 这类高度依赖平行路径的子任务，纯文本通过率约 10%，NetCanvas 约 90%。跨城 VPN 上各方案都弱，NetCanvas 也只有 6.7%。这是边界，不是口号。",
    "next.close":
      "同一个底座：30.3% 的模型能力，可以对应 54.5% 的系统能力。不必先让模型变成资深网工，也可以先让系统替它设计一套更聪明的看网方式。",
    "cite.title": "引用",
    "cite.copy": "复制",
    "cite.copied": "已复制",
    "cite.manual": "请手动全选",
    "cite.note":
      "项目页：<a href=\"https://caimanjing.github.io/netcanvas/\">https://caimanjing.github.io/netcanvas/</a>。论文 PDF 见页首。这篇工作还没出现在 arXiv 上。本仓库目前只有项目页和论文材料，不含可运行代码。",
    "footer.license":
      "本项目页与论文材料采用 <a rel=\"license\" href=\"https://creativecommons.org/licenses/by-nc-sa/4.0/\">CC BY-NC-SA 4.0</a> 许可。",
  },
};

const LANG_KEY = "netcanvas-lang";

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("zh") ? "zh" : "en";
}

let currentLang = detectLang();
const langListeners = [];

function t(key, vars) {
  const table = I18N[currentLang] || I18N.en;
  let s = table[key] || I18N.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}

function applyI18n() {
  document.documentElement.lang = currentLang;
  document.title = t("meta.title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("meta.description"));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-src]").forEach((el) => {
    const key = el.getAttribute("data-i18n-src");
    if (key) el.setAttribute("src", t(key));
  });

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
  });
}

function setLang(lang) {
  if (lang !== "zh" && lang !== "en") return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
  applyI18n();
  langListeners.forEach((fn) => fn());
}

function initLang() {
  applyI18n();
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
  });
}

function initBibtex() {
  const btn = document.querySelector("[data-copy-bibtex]");
  const code = document.querySelector("#bibtex-code");
  if (!btn || !code) return;
  btn.addEventListener("click", async () => {
    const text = code.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = t("cite.copied");
      setTimeout(() => {
        btn.textContent = t("cite.copy");
      }, 1600);
    } catch {
      btn.textContent = t("cite.manual");
    }
  });
}

function initToc() {
  const links = [...document.querySelectorAll(".toc a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + 96;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= y) current = section;
    }
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current.id}`);
    });
  };
  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initLang();
  initBibtex();
  initToc();
});
