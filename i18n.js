/* Local, reversible interface translations. Never rewrites typed form values or experiment notes. */
(() => {
 'use strict';
 const words = {
  "跳至正文": "Skip to content",
  "主导航": "Main navigation",
  "全部": "All",
  "复制": "Copy",
  "已复制": "Copied",
  "关闭": "Close",
  "繁星会 / Psyverse": "Psyverse",
  "必填": "Required",
  "选填": "Optional",
  "目标": "Goal",
  "执行步骤": "Steps",
  "验收记录": "Acceptance checklist",
  "参考资料": "References",
  "过程与结果": "Process and results",
  "尚未填写": "Not recorded yet",
  "资料待验证": "Not yet verified",
  "样片可预览": "Sample available",
  "技术交付": "Technical services",
  "数字产品": "Digital products",
  "内容制作": "Content production",
  "其他探索": "Further research",
  "蓝果短剧": "BlueFruit Studio",
  "蓝果短剧 · BlueFruit": "BlueFruit Studio",
  "蓝果短剧 BlueFruit · 原创科幻与幻想叙事": "BlueFruit · Original science fiction and fantasy",
  "蓝果短剧 · 让想象，进入画面。": "BlueFruit · Bring imagination to the screen.",
  "蓝果短剧：原创科幻与幻想叙事，从分镜到成片。免费预览现有工程样片，探索十二个故事设定，整理你的制作需求。": "Original science fiction and fantasy, from storyboard to screen. Watch free technical samples, explore twelve story concepts and prepare a production brief.",
  "原创科幻与幻想叙事，从分镜到成片。工程样片免费预览。": "Original science fiction and fantasy, from storyboard to screen. Watch our technical samples for free.",
  "样片": "Screening",
  "故事档案": "Story archive",
  "制作流程": "Our process",
  "制作咨询": "Start a project",
  "让想象，": "Bring imagination",
  "进入画面。": "to the screen.",
  "原创科幻与幻想叙事，从分镜到成片。": "Original science fiction and fantasy, from storyboard to screen.",
  "观看样片": "Watch a sample",
  "工程样片 · 免费预览": "Technical samples · Free preview",
  "加载视频信息…": "Loading video details…",
  "万劫不灭道工程样片播放器": "Player: Path Beyond Calamity technical samples",
  "选集": "Episodes",
  "《万劫不灭道》第一集": "Path Beyond Calamity · Episode 1",
  "查看样片文稿与说明": "Read the script and sample notes",
  "背景为概念视觉，非样片画面": "Concept artwork, not a frame from the samples",
  "从世界观设定到人物命题，探索影像叙事的可能。": "Worlds, characters and ideas for stories on screen.",
  "查看全部设定 →": "Explore all concepts →",
  "收起设定 ↑": "Show fewer concepts ↑",
  "筛选故事类型": "Filter story genres",
  "玄幻": "Eastern fantasy",
  "科幻": "Science fiction",
  "怪谈": "Strange tales",
  "无限流": "Time loops",
  "概念开发": "In development",
  "故事设定": "Story concept",
  "以下为十二个故事开发设定，配图为题材概念视觉，尚无对应成片；可观看视频见上方工程样片。": "Twelve stories in development. Images illustrate each genre; no finished films exist for these concepts. Watch the technical samples above.",
  "阅读设定": "Read the concept",
  "先把故事讲清楚，再把每个镜头做好。": "Start with the story. Give every shot a purpose.",
  "设定": "Development",
  "梳理世界观、角色与视觉基调，明确叙事目标。": "Define the world, characters, visual direction and narrative goals.",
  "分镜": "Storyboards",
  "把剧本拆为可视镜头，确认节奏、构图与台词。": "Break the script into shots. Refine pacing, framing and dialogue.",
  "镜头": "Production",
  "生成与挑选素材，检查角色一致性，记录返工。": "Create and select footage, check character consistency and track revisions.",
  "剪辑": "Editing",
  "整合画面、声音与字幕，按约定规格检查交付。": "Bring picture, sound and subtitles together. Check the agreed delivery specifications.",
  "剧本与分镜提示词资料": "Script and storyboard prompt library",
  "创作参考，不代表这些场景已经完成生成。复制后可按自己的角色与风格修改。": "Creative references, not completed scenes. Adapt the prompts to your own characters and visual direction.",
  "选择题材": "Choose a genre",
  "魔幻": "Dark fantasy",
  "奇幻": "High fantasy",
  "科普": "Science storytelling",
  "复制整套分镜资料": "Copy the storyboard prompts",
  "描述你想呈现的故事、用途与交付规格，先整理一份清楚的需求。": "Tell us the story, its purpose and your delivery needs. Start with a clear project brief.",
  "项目想法": "Your idea",
  "想讲什么故事？给谁看？希望观众记住什么？": "What is the story? Who is it for? What should the audience remember?",
  "项目类型": "Project type",
  "科幻／幻想短片": "Science fiction / fantasy short",
  "科学可视化": "Scientific visualization",
  "品牌／产品叙事": "Brand / product storytelling",
  "其他创作": "Other creative work",
  "目标时长": "Target duration",
  "例如 60–90 秒": "For example, 60–90 seconds",
  "称呼与联系方式": "Name and contact details",
  "方便我们回复的邮箱或联系方式": "Your name and preferred contact details",
  "生成需求简报": "Generate a project brief",
  "需求简报已生成": "Your project brief is ready",
  "尚未发送。可以复制或下载，再通过邮件与我们沟通。": "Not sent yet. Copy or download the brief, then contact us by email.",
  "下载简报": "Download brief",
  "通过邮件沟通 ↗": "Contact by email ↗",
  "联系": "Contact",
  "关闭故事详情": "Close story details",
  "视频可直接播放。启用 JavaScript 可使用选集、故事筛选与需求简报功能。": "Videos play without JavaScript. Enable it to switch episodes, filter stories and generate a brief.",
  "此条目是故事设定，尚无对应成片。现有视频请观看首页工程样片。": "This is a story concept, with no finished film yet. Existing technical samples are available on the homepage.",
  "讨论这个方向 →": "Discuss this direction →",
  "这集暂时无法加载，请重试或选择其他集。": "This episode could not load. Please retry or choose another one.",
  "请点击播放器中的播放按钮。": "Please press Play in the video player.",
  "浏览器限制复制，请手动选择文本或下载简报。": "Copy is unavailable in this browser. Select the text manually or download the brief.",
  "故事资料暂时未能加载，请刷新重试。": "The story archive could not load. Please refresh and try again.",
  "工程样片": "Technical sample",
  "部分资料未能加载，视频仍可直接播放。": "Some information could not load. You can still play the video directly.",
  "开场": "Opening",
  "转折": "Turning point",
  "集尾悬念": "Cliffhanger",
  "声音参考": "Sound direction",
  "蓝果短剧 · 制作需求简报": "BlueFruit · Production brief",
  "项目想法：": "Project idea:",
  "项目类型：": "Project type:",
  "目标时长：": "Target duration:",
  "称呼与联系方式：": "Name and contact:",
  "待讨论": "To discuss",
  "待补充": "To be added",
  "请共同确认：用途与发布渠道、故事与视觉参考、预算范围、交付规格、修改次数与时间安排。": "Please agree on the purpose and release channels, story and visual references, budget, delivery specifications, revision rounds and schedule.",
  "蓝果短剧 · 制作咨询": "BlueFruit · Project inquiry",
  "镇魂碑": "Soul-Sealing Steles",
  "每座碑封印一尊古神。第九座，裂了。": "Each stele seals an ancient god. The ninth has cracked.",
  "九座镇魂碑立在九州之脊，每一座下面压着一尊不肯死的古神。守碑人世代沉默，直到第九座碑出现第一道裂纹。碑可以修，但修碑的材料，是一个活人的名字。": "Nine steles stand along the spine of the realm, each holding down an ancient god who refuses to die. Their keepers remain silent for generations, until the ninth stone cracks. It can be repaired, but the material it requires is the name of a living person.",
  "炼气三千年": "Three Thousand Years of Qi",
  "全宗门飞升那天，他被留了下来。": "When the entire sect ascended, he was left behind.",
  "资质最差的师兄，用三千年炼气一层。同门飞升了一个又一个，只有他记得宗门食堂每一代厨师的手艺。飞升的大门再次打开时，回来找他的，是三千年前欠他一顿饭的人。": "The least gifted disciple spends three thousand years at the first stage of cultivation. Others ascend one by one; he remembers every generation of cooks in the sect kitchen. When the gate of ascension opens again, the visitor is someone who has owed him a meal for three thousand years.",
  "北境妖谱": "Bestiary of the North",
  "妖有百类：可食，可驱，可嫁。": "Some spirits can be eaten. Some ward off evil. Some can be married.",
  "北境捕妖人持一卷妖谱行走雪原：能吃的妖标红，能驱邪的标蓝，能与人成婚的——标了一个问号。她这次接的委托，是给妖谱上从未记录过的东西分类。": "A spirit hunter crosses the northern snowfields with a bestiary: edible spirits marked red, protective ones blue, and those who can marry humans with a question mark. Her latest commission is to classify something the book has never recorded.",
  "斩神台": "The God-Slaying Platform",
  "登台者，斩心中之神。": "To ascend the platform is to slay the god within.",
  "凡人筑台斩神，每一代只登一人。登台者要斩的不是天上的神，是自己心里供了半生的那一个。概念先导片制作中。": "Mortals built a platform to slay a god, but only one person may climb it in each generation. The god they must kill is not in the sky. It is the one they have worshipped in their heart for half a lifetime.",
  "记忆出租屋": "Memories for Rent",
  "记忆按小时出租。有人租走了她的初恋。": "Memories rent by the hour. Someone has borrowed her first love.",
  "2088 年，记忆可以合法出租。她在出租记录里发现一段自己的记忆被人反复租借了十七次——那段记忆里，有一个她已经完全不记得的人。": "In 2088, renting out memories is legal. In her records she finds one memory borrowed seventeen times by the same stranger. Inside it is a person she no longer remembers at all.",
  "深空七日": "Seven Days in Deep Space",
  "信号来自一个不存在的方向。": "The signal comes from a direction that does not exist.",
  "空间站收到一段求救信号，坐标指向的天区在所有星图上都是空白。他们决定去看一眼。往返航程七天，但回到站内时，日历已经过去了七年。": "A space station receives a distress signal from a region absent from every star chart. The crew decides to investigate. The round trip takes seven days, but when they return, seven years have passed.",
  "明日回收站": "The Tomorrow Exchange",
  "回收昨天，兑换明天。": "Recycle yesterday. Receive tomorrow.",
  "城市边缘有一座回收站，专门收人们不要的\"昨天\"。被回收的日子成为他人的\"明天\"。收废品的老人从不收自己的昨天——直到有人送来一份他自己签名的回收单。": "At the edge of the city, a recycling depot collects unwanted yesterdays and turns them into someone else's tomorrows. Its elderly keeper never recycles his own past, until someone brings him a receipt bearing his signature.",
  "晚自习十条": "Ten Rules for Night Study",
  "第五条要求你违反第七条。": "Rule five requires you to break rule seven.",
  "转学第一晚，教室后墙贴出《晚自习守则》十条：不要回应点名时多出来的名字；10:40 后不要看窗外；第五条要求你必须违反第七条。守则保护遵守它的人——除了同时遵守第五条和第七条的那个。": "On her first night at a new school, ten rules appear at the back of the classroom: do not answer the extra name during roll call; do not look outside after 10:40; rule five requires you to break rule seven. The rules protect those who follow them, except the person who follows both five and seven.",
  "末班地铁须知": "The Last Train Instructions",
  "不要看对面车窗。": "Do not look into the opposite window.",
  "末班地铁广播有两条须知：请勿倚靠车门；请勿与对面车窗里的自己对视。他加班到深夜，上车时车厢空无一人——对面车窗里，坐满了乘客。": "The last train announces two instructions: do not lean against the doors, and do not meet your own eyes in the opposite window. After working late, he boards an empty carriage. In the window across from him, every seat is occupied.",
  "旅馆守则": "The Guesthouse Rules",
  "203 房不存在的证明，写在 203 房里。": "Proof that room 203 does not exist is inside room 203.",
  "山间旅馆的守则第九条写着：本旅馆没有 203 房。而住客守则的最后一页，是一张从 203 房内拍摄的、整栋旅馆的照片。拍摄日期，是明天。": "Rule nine of a mountain guesthouse says there is no room 203. The last page of the guest rules contains a photograph of the entire building taken from inside that room. The date on the photograph is tomorrow.",
  "十日轮回": "The Ten-Day Cycle",
  "世界每十日重置一次。只有他记得。": "The world resets every ten days. Only he remembers.",
  "洪水、疫病、大火——世界每十日毁灭一次，再原样重来。所有人带着既视感重新生活，只有他保留全部记忆。第一百日，他决定不再自救，而是去数这十日里到底死过多少个\"第一次\"。": "Floods, plagues and fires destroy the world every ten days, and then it begins again. Everyone returns with a sense of deja vu. Only he remembers everything. On day one hundred, he stops trying to save himself and starts counting how many first lives have ended.",
  "副本编号：人间": "Instance: The Human World",
  "通关条件：让所有玩家相信这是现实。": "To win, make every player believe this is reality.",
  "他觉醒了玩家面板，却发现自己是最后一个觉醒的。系统提示：副本\"人间\"进入最终阶段，通关条件是让所有玩家重新相信这就是现实。而第一个反对的，是劝他清醒的队友。": "He awakens to a player interface, only to discover he is the last to do so. The system announces the final stage of an instance called The Human World: to win, every player must believe this world is real again. The first person to object is the teammate who urged him to wake up.",
  "第 01 集 · 引仙令碎裂": "Episode 01 · The Summoning Token Shatters",
  "天道逆转，凡躯成圣！引仙令碎裂，万道九天雷劫撕裂了青云宗的山门！\n\n被抽去至尊骨的弃子，在万丈剑渊底睁开重瞳！体内沉睡万年的太古凶兽神纹，正一寸寸重组经脉！\n\n九大仙门老祖联手施压，神威撼动三千大千世界！然而少年踏天而立，身后浮现十二品混沌青莲，拔剑斩断万古因果长河！\n\n苍穹突然撕裂，虚空中浮现长达万里的魔尊血眸！下一集：此界当灭！扫码进入蓝果短剧独立站，一元秒级解锁第2集！": "The heavens reverse their course. The summoning token shatters, and countless bolts of lightning tear through the gates of Qingyun Sect.\n\nAt the bottom of the Sword Abyss, a cast-out boy stripped of his sacred bone opens his twin pupils. Ancient beast markings awaken within him and begin to rebuild his body.\n\nThe ancestors of nine immortal sects unite against him. He rises into the sky with a twelve-petalled chaos lotus at his back and cuts through the river of cause and effect.\n\nThe sky tears open. The blood-red eye of a demon sovereign appears across the void. The confrontation continues in Episode 2.",
  "第 02 集 · 剑渊重瞳": "Episode 02 · Twin Pupils in the Sword Abyss",
  "上古结界笼罩万丈剑渊，九幽冥雀喋血坠落！三大魔教长老布下灭神诛仙大阵，欲将少年彻底炼化为血丹！\n\n重瞳本是无敌路，何须再借他人骨！少年黑发如瀑狂舞，双瞳之中阴阳倒转、开天辟地，万古神魔皆在此刻齐齐叩首！\n\n三大长老祭出准帝祖器，崩碎山河！然而少年只伸出一指，轻轻弹落——咔嚓！帝兵当场寸寸崩断，三千魔教大军如流星坠落，化为漫天齑粉！\n\n天门突然大开，九重天上降下真正的仙庭法旨：诛杀重瞳异数！欲知少年如何一人独战九重仙庭？进入蓝果短剧独立站，扫码一元极速解锁第3集！": "An ancient barrier covers the Sword Abyss. Three demonic elders summon a formation to consume the boy and turn him into a blood elixir.\n\nHis twin pupils reveal the forces of creation. Ancient gods and demons bow before their power.\n\nThe elders unleash an ancestral weapon, but he breaks it with one finger. Their army falls from the sky.\n\nThe heavenly gate opens. An imperial decree commands the death of the twin-pupil anomaly. Episode 3 continues the confrontation with the celestial court.",
  "第 03 集 · 仙盟合围与太古神魔觉醒": "Episode 03 · The Alliance and the Awakening",
  "九大仙门至尊老祖携九大镇派圣器同时降临，方圆万里虚空尽数化为狂暴雷狱，誓要将觉醒太古重瞳的少年神魂俱灭！\n\n面对灭顶之灾，少年体内的太古神魔之血彻底狂暴沸腾！亿万金色神纹自骨髓中汹涌爆发，九大老祖的镇派圣器在神魔威压下发出哀鸣！\n\n少年凌空踏出一步，天崩地裂！右手捏碎九天神雷，反手一记神魔灭世印狠狠拍落，九大老祖狂喷鲜血，化神巅峰强者在这一掌之下如蝼蚁般土崩瓦解！\n\n就在此时，九天之上突然撕开一道永恒仙门，真仙巨掌自太古星域缓缓降临！少年能否一剑斩破真仙法旨？进入蓝果短剧主站，免费畅看全集连播！": "The nine immortal ancestors arrive with their sects' sacred weapons, turning the sky into a prison of lightning. They intend to destroy the awakened boy.\n\nAncient divine blood awakens within him. Golden markings rise from his bones, and the sacred weapons tremble.\n\nHe steps into the air, crushes the lightning and strikes with a world-shattering seal. The nine ancestors are defeated.\n\nAn eternal gate opens above the heavens, and the hand of a true immortal descends from an ancient star field. Can his sword break the decree?",
  "第 04 集 · 混沌青莲现世与一剑碎仙门": "Episode 04 · The Chaos Lotus and the Shattered Gate",
  "少年丹田之中，三十六品混沌青莲凌空破体而出！无穷无尽的鸿蒙道韵瞬间照亮三千大世界，令九天真仙尽皆骇然失色！\n\n真仙降下的诛神法旨，在青莲神光照耀之下连一秒都无法支撑，当场化为漫天黑灰！万古仙道因果与法则，皆在此刻被少年彻底颠覆重构！\n\n少年抬手一招，混沌青莲化作三尺青锋！他踏碎星河、挥剑逆斩九天——轰隆！矗立万古的九重仙门轰然坍塌崩碎，无数仙界巨擘被震得神魂战栗！\n\n仙门背后，不可名状的上古魔皇与真仙本尊即将彻底苏醒！第5集万劫归一、第6集终局决战已在主站全量连播，立即扫码免费畅看！": "A thirty-six-petalled chaos lotus emerges from within the boy. Its radiance reaches across countless worlds, alarming the immortals.\n\nThe decree dissolves in the lotus light. The laws of the immortal order are overturned.\n\nHe turns the lotus into a sword and strikes upward through the stars. The nine heavenly gates collapse.\n\nBehind the gates, an ancient demon emperor and the true immortals begin to awaken. The story continues in Episodes 5 and 6.",
  "第 05 集 · 一剑荡灭因果与万界独尊": "Episode 05 · A Sword Beyond Cause and Effect",
  "沉睡千万年的太古魔皇神念自无尽虚空降临！一缕魔威便压碎亿万星辰，整个宇宙的大道法则发出不堪重负的哀鸣！\n\n少年黑发狂舞，将重瞳至尊骨与混沌青莲彻底融为一体！手中三尺青锋迸发出超脱岁月长河的因果神芒，照亮整个多元宇宙！\n\n少年一剑挥出，岁月长河当场截断！不可一世的太古魔皇神念在这一剑之下寸寸瓦解湮灭，诸天万界亿万神魔齐齐跪伏，天地唯我独尊！\n\n魔皇神念虽灭，九天之外真正的主宰本尊却已撕开界壁！欲看少年如何一剑封神登临大道绝巅？立即扫码一元极速解锁第6集大结局！": "The will of an ancient demon emperor descends through the void. A trace of its power crushes stars and strains the laws of the universe.\n\nThe boy fuses his sacred bone, twin pupils and chaos lotus. His sword shines beyond the river of time.\n\nOne strike severs that river. The demon emperor's projection is destroyed, and gods across the worlds bow.\n\nBut the emperor's true form breaks through the boundary beyond the heavens. The final confrontation awaits in Episode 6.",
  "第 06 集 · 终局决战与执掌诸天 (大结局)": "Episode 06 · The Final Battle · Season Finale",
  "九天之外，魔皇真身遮天蔽日！亿万道黑暗神雷轰穿界壁，整座大千世界在这一瞬间濒临彻底坍塌解体！\n\n少年眼眸中倒映亿万星河，他将自身大道彻底燃尽，化作一道横贯古今的绝世剑光！混沌青莲在虚空中彻底绽放！\n\n轰然一声巨响，黑暗被彻底撕碎！魔皇在绝望咆哮中烟消云散，三千大道神链环绕在少年周身，从此诸天共尊，独断万古！\n\n《万劫不灭道》第一季圆满收官！感谢每一位现实主权践行者的支持，蓝果短剧科幻巨作《深空长城》即将重磅上线！": "The demon emperor's true form blots out the sky. Dark lightning breaks through the world boundary, and the realm begins to collapse.\n\nThe boy burns the last of his power into a single sword stroke spanning past and future. The chaos lotus blooms in the void.\n\nDarkness is torn apart. The demon emperor vanishes, and the chains of the great laws gather around the boy. The worlds recognize his authority.\n\nSeason one of Path Beyond Calamity concludes. Thank you for watching these BlueFruit technical samples.",
  "玄幻 · Eastern Fantasy": "Eastern Fantasy",
  "东方神话巨擘风格，青云古宗山门天穹被猩红九霄神雷撕裂，引仙石碑剧烈坍塌爆炸，碎石在超强冲击波中漫天激射。少年林渊白发被狂风吹散，单手直指雷劫中心，眼眸中金色太古骨文急速转动。8k resolution, cinematic lighting, volumetric lightning rays, Unreal Engine 5 render, Masterpiece.": "An ancient Chinese mountain sect. Crimson lightning tears the sky above its gates. A summoning stele shatters, spraying stone through a powerful shockwave. White-haired Lin Yuan points into the storm as golden ancient script turns inside his eyes. Cinematic lighting, volumetric lightning, detailed fantasy production reference.",
  "林渊：‘青云宗欺我三千年无灵根，今日这飞升雷劫——我替诸天万界收了！’": "Lin Yuan: You called me rootless for three thousand years. Today, I will take this heavenly trial for every world.",
  "太古骨文从主角掌心蔓延至整条右臂，玄黄凶兽虚影在黑云后睁开千丈金瞳，山门九位化神期长老剑阵当场碎裂，剑刃倒插于大地，飞沙走石与空间扭曲碎片。dramatic chiaroscuro lighting, slow motion 60fps, particle storm, epic scale.": "Ancient markings spread from his palm along his right arm. Behind black clouds, a vast beast opens golden eyes. The sword formation of nine elders shatters and its blades strike the earth. Dramatic chiaroscuro, slow-motion reference, particle storm, epic scale.",
  "传功长老惊骇倒退：‘不可能……他体内封印的不是废脉，那是吞噬上古仙魔的混沌归墟！’": "An elder: Those are not ruined meridians. He carries the chaos abyss that once devoured the ancient gods.",
  "九霄天劫正上方，虚空中浮现出一只遮蔽整座大陆的冰冷金色眼眸，上苍法旨降临，整片大陆的灵气瞬间归零，主角身后混沌巨兽仰天咆哮。镜头在眼眸凝视主角的瞬间拉成全景黑屏。extreme tension, cliffhanger, glowing runes, dark cinematic depth.": "Above the lightning, an immense cold golden eye appears over the continent. A heavenly decree drains the spiritual energy from the land. The chaos beast behind the hero roars. Pull back as the eye fixes on him, then cut to black. Tense cinematic cliffhanger.",
  "BGM: 原创电影配乐风格重度低音铜管咆哮 + 传统古筝急速刮奏，雷鸣与剑器爆裂声。Voicebox: 沉稳低沉撕裂感青年男声，呼吸声清晰。": "Original cinematic score: low brass, rapid guzheng phrases, thunder and breaking blades. Voice direction: a calm, low young male voice with a strained edge and audible breath.",
  "魔幻 · Dark Magic & Sorcery": "Dark Magic & Sorcery",
  "暗黑哥特中世纪大教堂，十二根古老雕花石柱在紫黑色魔法风暴中化为粉末。首席禁咒法师手握龙骨魔杖，杖尖燃烧着不灭冥火，整座王都天空升起猩红六芒星法阵。8k, hyper-detailed, gothic dark fantasy, glowing purple runes, volumetric smoke, ray tracing.": "A dark medieval Gothic cathedral. Twelve carved stone columns disintegrate inside a violet-black magical storm. A forbidden mage holds a dragon-bone staff burning with spectral fire as a crimson six-pointed sigil rises above the capital. Detailed Gothic fantasy, glowing runes, volumetric smoke.",
  "法师：‘第七任教皇欺瞒世人三百年，这所谓的圣光之下，囚禁的是整整十万名黑魔法受害者的冤魂！’": "The mage: The seventh pope has deceived this city for three hundred years. Beneath that holy light are the trapped souls of a hundred thousand victims.",
  "圣光审判骑士团的铠甲在一秒内被暗黑触手腐蚀成白灰，主教胸前悬挂的圣杯中流淌出滚烫熔岩，反魔法立场屏障瞬间崩解，暗夜恶魔的双翼从圣母雕像后方轰然展开。extreme cinematic tension, hyper-realistic dark fantasy, dynamic camera orbit.": "The judges' armor crumbles under dark tendrils. Molten rock flows from the bishop's chalice. An anti-magic barrier collapses as demonic wings unfold behind a sacred statue. Dynamic orbiting camera, cinematic tension, detailed dark fantasy.",
  "教皇面具脱落：‘你居然敢直视深渊……既然你见到了真正的神明，那就与这座城一起陪葬吧！’": "The pope: You dared to look into the abyss. Now that you have seen our god, this city will be your grave.",
  "主角翻开禁忌法典的最终页，法典内伸出无数枯骨抓住他的双臂，全城法力光芒汇入其身躯，王都地面开始垂直向深渊坠落。黑屏卡点。apocalyptic scale, dark magic singularity, dramatic cliffhanger cut.": "The mage opens the final page of the forbidden codex. Skeletal hands seize his arms. The city's magical light converges on him as its streets begin to sink vertically into the abyss. Cut to black at the turning point.",
  "BGM: 哥特女声重唱圣咏与深邃大提琴交织，管风琴轰鸣与火焰呼啸。Voicebox: 磁性沙哑中音，带轻微空间回响。": "Original score: Gothic choral voices, deep cello and pipe organ, with rushing flame. Voice direction: a magnetic, slightly hoarse middle register with a subtle room echo.",
  "科幻 · Hard Sci-Fi": "Hard Science Fiction",
  "深空柯伊伯带边缘，重型核聚变货运穿梭机剧烈震动，主推进器喷出千米等离子幽蓝尾焰。前方原本空无一物的星图上，突然凭空撕裂出一道长达数万公里的非欧几里得引力裂缝，数千艘外星母舰的几何阴影缓缓浮现。photorealistic 8k, hard sci-fi, Christopher Nolan aesthetic, Interstellar style, dynamic camera shake, cinematic.": "At the edge of the Kuiper Belt, a heavy fusion cargo shuttle shakes violently. Blue plasma stretches behind its main engine. A vast non-Euclidean gravitational fissure opens across an empty star chart, revealing the geometric silhouettes of alien carriers. Photorealistic space cinematography, camera shake, grounded industrial detail.",
  "舰长：‘全舰进入紧急过载状态！这不是自然引力波，是三类文明的维度投射！’": "The captain: Emergency overload, all stations. That is not a natural gravitational wave. It is a dimensional projection from a Type III civilization.",
  "空间站引力环断裂，失重漂浮的工程师隔着强化玻璃注视着太阳在数秒内被戴森球网格锁死变暗，空间站所有全息界面闪烁刺目红光并跳出人类基因灭绝协议。hard sci-fi interior, neon red emergency lights, macro reflection on helmet visor, photorealistic.": "A space station's gravity ring breaks. An engineer floats behind reinforced glass as a Dyson lattice closes around the Sun. Red emergency displays announce an extinction protocol. Fictional hard-science-fiction interior, reflections on the helmet visor.",
  "AI 主脑女声：‘警报，警报：地球总部已于 42 秒前被二维化，全人类仅剩当前舰船 71 名幸存者。’": "The ship AI: Earth headquarters was flattened forty-two seconds ago. The seventy-one people aboard this ship are the last recorded survivors.",
  "主角启动反物质曲率引擎最高过载，穿梭机跃迁入引力透镜中心，前方裂隙中浮现出与地球一模一样但体积庞大万倍的镜面星球。警报声戛然而止，黑屏。Interstellar black hole aesthetic, breathtaking, cliffhanger.": "The pilot overloads the fictional antimatter drive and enters a gravitational lens. Within the fissure appears a mirrored planet like Earth, but ten thousand times larger. Alarms stop. Cut to black. Astonishing scale and a tense cliffhanger.",
  "BGM: 钛金属撞击与次声波低频震荡，机械警报声，宇宙真空窒息感音效。Voicebox: 沉着冷冽中英双语女声，快速倒计时。": "Original score: metallic impacts, low-frequency pulses, mechanical alarms and an oppressive sense of silence. Voice direction: a calm, cold bilingual female voice with a rapid countdown.",
  "奇幻 · High Fantasy & Myth": "High Fantasy & Myth",
  "九万米浮空大陆边缘，巨大古老蒸汽发条齿轮与巨龙肋骨严丝合缝咬合，排气阀喷射出金色蒸汽云海。机械驯兽师踩在飞空艇龙骨尖端，手中缰绳连接着展翅三千米的机械发条青铜巨龙。high fantasy, Hayao Miyazaki meets Steampunk, vibrant colors, epic sky view, golden hour sunlight, 8k render.": "At the edge of a floating continent, enormous clockwork gears mesh with dragon ribs. Valves release golden steam over a sea of clouds. A mechanical beast-tamer stands on an airship's prow, holding reins attached to an immense bronze clockwork dragon. High fantasy, intricate steampunk, warm sunset and expansive sky.",
  "驯兽师：‘只要发条还在转动，天穹诸神的浮空岛就别想踏入人间一步！’": "The tamer: As long as these gears turn, the gods' floating islands will never set foot in our world.",
  "云海深处浮现出一座由纯净光晶体构建的天空圣城，无数光刃天使从圣城城门倾泻而下，发条巨龙的动力核心在光刃轰击下出现裂缝，蓝色源石能量液如瀑布倾泻。epic aerial battle, dynamic depth of field, anime cinematic masterpiece.": "A city made of light crystals emerges above the clouds. Winged guardians pour through its gates. Blades of light fracture the dragon's core, spilling blue energy like a waterfall. Epic aerial action, dynamic depth and expressive cinematic framing.",
  "天界审判官：‘凡人用破铜烂铁拼凑的心脏，也敢自称能载动诸神之怒？’": "The celestial judge: A heart built from scrap metal dares to bear the wrath of gods?",
  "驯兽师扯断自身源石神经接驳线，将其直接插进巨龙心脏，整条机械巨龙爆发出刺目超新星蓝焰，向天空圣城主炮口迎面撞去。巨响前瞬间黑屏。explosive climax, dramatic freeze frame, epic cliffhanger.": "The tamer tears free a neural energy cable and connects it directly to the dragon's heart. Brilliant blue fire erupts from the machine as it charges the sky city's cannon. Cut to black just before impact.",
  "BGM: 激昂管弦乐交响与凯尔特风笛，蒸汽齿轮咔哒声与龙啸。Voicebox: 热血高亢少年音，情绪饱满。": "Original score: full orchestra, Celtic pipes, ticking gears and dragon calls. Voice direction: a passionate, energetic young voice.",
  "科普 · Deep Science Explanatory": "Science Storytelling",
  "微观量子尺度极限放大，两个自旋相反的纠缠电子在普朗克尺度光晶格中高速自旋，虚光子如量子雨般在两个粒子间跳跃。镜头以超光速穿透星系尺度拉远，展现相隔4光年的两个粒子瞬间同时改变偏振态。scientific visualization, quantum entanglement, Planck scale, hyper-realistic scientific documentary, BBC / Cosmos style, 8k render.": "Extreme magnification to a microscopic quantum scale. Two entangled electrons with opposite spins rotate in a Planck-scale light lattice. Virtual photons leap between them like quantum rain. The camera pulls back across galaxies to show two particles four light-years apart changing polarization together. Scientific visualization, quantum entanglement, highly detailed documentary-style creative reference.",
  "旁白：‘爱因斯坦曾称它为幽灵般的超距作用。但在 2026 年，人类终于抓到了它的物理尾巴。’": "Narrator: Einstein called it spooky action at a distance. In 2026, humanity finally caught its physical trail.",
  "从微观量子跃迁至宏观宇宙微波背景辐射图，宇宙大爆炸奇点在纳秒内暴胀展开，引力波在四维时空晶格中激荡出剧烈涟漪，时空曲率被超大质量黑洞垂直撕裂。Cosmic inflation, gravitational waves, 4D spacetime fabric warping, documentary cinematography.": "Move from a microscopic quantum scene to a map of the cosmic microwave background. A Big Bang singularity expands in nanoseconds. Gravitational waves ripple through a four-dimensional spacetime lattice, while a supermassive black hole tears at its curvature. Cosmic inflation, spacetime visualization, documentary cinematography.",
  "科学家：‘如果贝尔不等式在全宇宙尺度破缺，那么我们生活的整个时空，可能只是一张全息投影。’": "Scientist: If Bell inequalities break across the scale of the universe, the spacetime we inhabit might be a holographic projection.",
  "探测器屏幕上的量子干涉条纹在人类眨眼的百分之一毫秒内突然消失，取而代之的是一段用摩尔斯电码排列的宇宙基底常数。镜头瞬间切入纯黑，滴声留白。mind-bending science mystery, chilling realization, documentary cliffhanger.": "Interference fringes on a detector vanish within a tiny fraction of a blink. In their place appear fundamental cosmic constants arranged in Morse code. Cut instantly to black, leaving one electronic tone. A speculative science-fiction mystery and a documentary-style cliffhanger.",
  "BGM: 极简纯净合成器音效与脉冲星射电信号采样，深邃空灵。Voicebox: 理性知性磁性解说音（央视纪录片/BBC解说腔）。": "Original sound direction: minimal synthesizers and pulsar-inspired radio textures, spacious and subtle. Voice direction: calm, clear, rational documentary narration.",
  "请填写项目想法。": "Please enter your project idea.",
  "现有样片主要展示分镜、文字、旁白与播放流程；不是实拍电影或完整生成式影视成片。音频保留原中文；旧录音中有关付费解锁或后续上线的表述已过时，这里六集均可免费预览。": "These technical samples demonstrate storyboards, text, narration and playback. They are not live-action films or finished generative films. Audio remains in Mandarin; the English transcript is available below. Older recordings mention paid unlocks or future releases; those references are out of date. All six samples are free here."
};
 const key = 'psy-site-language';
 const valid = value => value === 'en' || value === 'zh';
 let lang = 'zh';
 try { const explicit = new URLSearchParams(location.search).get('lang'); const saved = localStorage.getItem(key); lang = valid(explicit) ? explicit : valid(saved) ? saved : 'zh'; if(valid(explicit))localStorage.setItem(key,lang); } catch {}
 const sources = new WeakMap();
 const patterns = [
  [/^第\s*(\d+)集$/, (_, n) => `Ep ${n}`],
  [/^展示 (\d+) \/ (\d+) 个设定$/, (_, a, b) => `Showing ${a} of ${b} concepts`],
  [/^共 (\d+) 个项目$/, (_, n) => `${n} projects`],
  [/^显示更多项目（还有 (\d+) 个）$/, (_, n) => `More projects (${n} remaining)`],
  [/^已记录 (\d+) \/ (\d+) 项$/, (_, a, b) => `${a} of ${b} items recorded`],
  [/^(.*) · (\d+) 秒$/, (_, resolution, seconds) => `${resolution} · ${seconds} sec`],
  [/^我想讨论《(.+)》这个故事方向。\n?$/, (_, name) => `I would like to discuss the story direction for ${translate(name)}.\n`]
 ];
 function translate(value) {
  const text = String(value ?? '');
  if (lang !== 'en') return text;
  if (Object.hasOwn(words, text)) return words[text];
  const trimmed = text.trim();
  if (Object.hasOwn(words, trimmed)) return text.replace(trimmed, words[trimmed]);
  for (const [pattern, render] of patterns) if (pattern.test(text)) return text.replace(pattern, render);
  // Rendering combines genre labels and prompt sections with stable delimiters.
  for (const delimiter of ['\n', ' · ']) if (text.includes(delimiter)) return text.split(delimiter).map(translate).join(delimiter);
  return text;
 }
 function record(node, slot, current) {
  let records = sources.get(node); if (!records) { records = {}; sources.set(node, records); }
  const old = records[slot];
  const source = old && current === old.output ? old.source : current;
  const output = translate(source);
  records[slot] = { source, output };
  return output;
 }
 function localize(root) {
  const excluded = 'script,style,textarea,code,[data-i18n-ignore],[translate="no"]';
  function text(node) {
   if (!node.parentElement || node.parentElement.closest(excluded)) return;
   const next = record(node, 'text', node.nodeValue);
   if (node.nodeValue !== next) node.nodeValue = next;
  }
  if (root.nodeType === Node.TEXT_NODE) { text(root); return; }
  if (![Node.ELEMENT_NODE,Node.DOCUMENT_NODE].includes(root.nodeType)) return;
  if (root.nodeType === Node.ELEMENT_NODE && root.closest(excluded)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node; while ((node=walker.nextNode())) text(node);
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root,...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
  elements.forEach(el => {
   if (el.closest(excluded)) return;
   for (const attr of ['placeholder','aria-label','title']) if (el.hasAttribute(attr)) {
    const next=record(el,attr,el.getAttribute(attr)); if(el.getAttribute(attr)!==next)el.setAttribute(attr,next);
   }
   if (el.matches('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')) {
    const next=record(el,'content',el.content);if(el.content!==next)el.content=next;
   }
  });
 }
 function apply() {
  document.documentElement.lang=lang==='en'?'en':'zh-CN';
  document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));
  localize(document);
  document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(['bluefruit.psyverse.fun','ai-for-money.psyverse.fun'].includes(u.hostname)&&u.origin!==location.origin){u.searchParams.set('lang',lang);a.href=u.href;}});
 }
 function setLanguage(next) {
  if(!valid(next)||next===lang)return;
  lang=next;try{localStorage.setItem(key,lang);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
  apply();document.dispatchEvent(new CustomEvent('languagechange',{detail:{language:lang}}));
 }
 window.SiteLanguage={t:translate,get language(){return lang;},set:setLanguage,refresh:apply};
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
  apply();
  new MutationObserver(mutations=>{
   for(const m of mutations) {
    if(m.type==='characterData')localize(m.target);
    else if(m.type==='childList')m.addedNodes.forEach(localize);
    else localize(m.target);
   }
  }).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','content']});
 });
})();
