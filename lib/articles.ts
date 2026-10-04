export type ArticleLevel = "B2" | "C1" | "C2";

export type KnowledgeArticle = {
  id: string;
  title: string;
  kicker: string;
  category: string;
  level: ArticleLevel;
  minutes: number;
  summary: string;
  paragraphs: string[];
  keyIdeas: string[];
  vocabulary: { word: string; meaning: string }[];
};

export const ARTICLES: KnowledgeArticle[] = [
  {
    id: "green-economy",
    title: "The Green Economy Is More Than Renewable Energy",
    kicker: "ECONOMICS • CLIMATE",
    category: "Economy",
    level: "B2",
    minutes: 4,
    summary: "Why a green economy changes how countries produce, consume, invest and measure progress.",
    paragraphs: [
      "When people hear the phrase green economy, they often think of solar panels, electric cars and wind farms. Those technologies matter, but the concept is much broader. A green economy tries to improve human well-being while reducing environmental risks and the pressure placed on natural resources.",
      "That means the transition is not only about replacing fossil fuels. It can also involve energy-efficient buildings, cleaner public transport, less waste, sustainable agriculture and financial rules that encourage long-term investment. Even the way governments measure success may change. Gross domestic product can rise while forests disappear or air quality declines, so some economists argue that environmental damage should be treated as a real economic cost.",
      "The difficult part is that green policies create both winners and losers. A city may gain thousands of jobs in battery manufacturing while a coal-producing region loses its traditional source of income. This is why the idea of a just transition has become important: climate policy is easier to sustain when workers and communities are helped to adapt.",
      "In practice, the green economy is therefore not one industry. It is a redesign of incentives. It asks a simple question: can economic activity create prosperity without continuously increasing pollution and resource consumption?"
    ],
    keyIdeas: [
      "Green growth covers production, transport, finance and resource use, not only renewable energy.",
      "GDP alone may ignore environmental costs.",
      "A just transition tries to distribute the costs and benefits of change more fairly."
    ],
    vocabulary: [
      { word: "well-being", meaning: "sức khỏe và chất lượng cuộc sống" },
      { word: "incentive", meaning: "động lực hoặc cơ chế khuyến khích" },
      { word: "transition", meaning: "quá trình chuyển đổi" }
    ]
  },
  {
    id: "blue-economy",
    title: "The Blue Economy: How Much Is the Ocean Really Worth?",
    kicker: "ECONOMICS • OCEANS",
    category: "Economy",
    level: "B2",
    minutes: 4,
    summary: "The ocean is an economic system, but treating it only as a resource creates a dangerous contradiction.",
    paragraphs: [
      "The blue economy refers to economic activities connected to oceans, seas and coastlines. Fishing, shipping and tourism are obvious examples, but the term now includes offshore wind, marine biotechnology, coastal restoration and even new forms of ocean data.",
      "The central challenge is unusual: the ocean can generate income only if the ecosystems behind that income remain healthy. Overfishing may increase short-term revenue, yet it can destroy the fish population that future communities depend on. Coastal development can attract tourists while damaging mangroves that protect the same coast from storms.",
      "This makes the blue economy different from the old idea of simply extracting more value from the sea. A sustainable blue economy treats natural systems as productive assets. A coral reef, for example, may support tourism, fish populations and coastal protection at the same time. Destroying it can therefore create several economic losses that are easy to overlook.",
      "For countries with long coastlines, the opportunity is significant. The strongest blue-economy strategies try to combine business growth with conservation, so the ocean remains economically useful precisely because it remains ecologically alive."
    ],
    keyIdeas: [
      "The blue economy includes both traditional ocean industries and newer sectors such as offshore wind.",
      "Healthy ecosystems can be treated as economic assets.",
      "Short-term extraction can reduce long-term ocean value."
    ],
    vocabulary: [
      { word: "coastline", meaning: "đường bờ biển" },
      { word: "overfishing", meaning: "đánh bắt quá mức" },
      { word: "conservation", meaning: "bảo tồn" }
    ]
  },
  {
    id: "orange-economy",
    title: "Why Creativity Has a Color: Inside the Orange Economy",
    kicker: "ECONOMICS • CREATIVITY",
    category: "Economy",
    level: "B2",
    minutes: 4,
    summary: "Music, games, design, film and digital culture form an economy in which ideas can become scalable assets.",
    paragraphs: [
      "The orange economy is a name often used for the creative and cultural economy. It includes industries in which ideas, stories, design and intellectual property create much of the value. Film, music, fashion, architecture, advertising, games, publishing and digital content all fit naturally inside it.",
      "Creative products behave differently from many physical goods. A chair must be manufactured again for every new customer, but a song, game or digital illustration can be reproduced at almost no additional cost. This makes successful creative work highly scalable, although success is also unpredictable because taste changes quickly.",
      "Technology has expanded the orange economy. A small creator can now distribute a video, game or design globally without owning a television network or a chain of shops. At the same time, platforms can concentrate power: algorithms influence what people discover, and creators may become dependent on rules they do not control.",
      "The most interesting feature of the orange economy is that culture becomes both an identity and an export. A country can create economic value not only by selling manufactured products, but also by exporting characters, aesthetics, music, stories and experiences."
    ],
    keyIdeas: [
      "Creative industries turn ideas and intellectual property into economic value.",
      "Digital creative goods can scale with very low reproduction costs.",
      "Platforms create global access but also new forms of dependency."
    ],
    vocabulary: [
      { word: "intellectual property", meaning: "sở hữu trí tuệ" },
      { word: "scalable", meaning: "có khả năng mở rộng với chi phí tăng chậm" },
      { word: "aesthetics", meaning: "thẩm mỹ, phong cách cảm quan" }
    ]
  },
  {
    id: "circular-economy",
    title: "What If Waste Became a Design Failure?",
    kicker: "ECONOMICS • DESIGN",
    category: "Economy",
    level: "B2",
    minutes: 4,
    summary: "Circular economy thinking begins before recycling: products are designed to stay useful for longer.",
    paragraphs: [
      "Most modern production follows a linear pattern: take resources, make a product, use it and throw it away. The circular economy challenges this model by asking companies to keep materials and products in use for as long as possible.",
      "Recycling is only one part of the idea. A circular product may be easier to repair, upgrade, disassemble or resell. A company might lease equipment instead of selling it, giving the producer a reason to build something durable because the same item can generate value repeatedly.",
      "This approach changes design decisions. If a phone battery is glued permanently into the device, repair becomes difficult. If components are standardized and replaceable, the useful life of the phone may increase. The environmental benefit comes from reducing the need for new raw materials, but there can also be economic benefits from maintenance, refurbishment and resale.",
      "The circular economy does not eliminate waste completely. Its ambition is more practical: make waste less inevitable by treating the end of a product's life as a design problem that should have been considered at the beginning."
    ],
    keyIdeas: [
      "Circular systems prioritize reuse, repair, refurbishment and recycling.",
      "Business models can reward durability rather than constant replacement.",
      "Waste can often be reduced through better product design."
    ],
    vocabulary: [
      { word: "refurbishment", meaning: "tân trang" },
      { word: "durable", meaning: "bền, sử dụng lâu" },
      { word: "disassemble", meaning: "tháo rời" }
    ]
  },
  {
    id: "doughnut-economics",
    title: "Doughnut Economics: Living Between Two Boundaries",
    kicker: "ECONOMICS • SYSTEMS",
    category: "Economy",
    level: "C1",
    minutes: 5,
    summary: "A visual economic model asks societies to meet human needs without overshooting planetary limits.",
    paragraphs: [
      "Doughnut economics uses a surprisingly simple image. Imagine a doughnut with an inner ring and an outer ring. Falling inside the inner ring means people lack essentials such as food, housing, education or healthcare. Going beyond the outer ring means human activity is placing excessive pressure on systems such as the climate, biodiversity or freshwater.",
      "The desirable space lies between these two boundaries. The goal is therefore not unlimited growth for its own sake, but an economy that allows people to thrive without destabilizing the ecological systems that support them.",
      "The framework is interesting because it changes the question economists ask. Instead of starting with 'How fast is the economy growing?', it begins with 'Are people's needs being met, and are we staying within environmental limits?' Growth may still happen, but it becomes a means rather than the ultimate objective.",
      "Critics point out that the boundaries can be difficult to measure and that different countries face very different conditions. Still, the model is useful because it compresses a complicated debate into a memorable picture: a society can fail by having too little for people or by demanding too much from the planet."
    ],
    keyIdeas: [
      "The inner boundary represents basic human needs.",
      "The outer boundary represents ecological limits.",
      "Economic growth is treated as a tool rather than the final objective."
    ],
    vocabulary: [
      { word: "overshoot", meaning: "vượt quá một giới hạn" },
      { word: "thrive", meaning: "phát triển tốt, thịnh vượng" },
      { word: "destabilize", meaning: "làm mất ổn định" }
    ]
  },
  {
    id: "attention-economy",
    title: "Your Attention Is a Scarce Resource",
    kicker: "TECH • BEHAVIOR",
    category: "Technology",
    level: "B2",
    minutes: 4,
    summary: "When services are free, companies may compete not for your money but for your limited attention.",
    paragraphs: [
      "Every person has twenty-four hours in a day, which makes attention fundamentally scarce. The attention economy describes markets in which companies compete to capture and retain that scarce resource.",
      "Social feeds, short videos, games, streaming platforms and news sites often use similar techniques: notifications, endless scrolling, recommendations and visible social rewards. Each feature can be useful, but together they can make disengagement surprisingly difficult.",
      "The business logic is straightforward. More time on a platform can create more opportunities to show advertising, sell products or collect information about preferences. This does not mean every design choice is manipulative, but it creates a strong incentive to maximize engagement.",
      "For users, the important insight is that attention has an opportunity cost. Ten minutes spent on one activity cannot be spent on another. Once attention is viewed as a resource rather than an unlimited background state, decisions about notifications, app placement and screen habits start to resemble budgeting."
    ],
    keyIdeas: [
      "Attention is limited, so platforms compete for it.",
      "Engagement features can align with business incentives.",
      "Time spent on one activity always carries an opportunity cost."
    ],
    vocabulary: [
      { word: "scarce", meaning: "khan hiếm" },
      { word: "retain", meaning: "giữ lại" },
      { word: "opportunity cost", meaning: "chi phí cơ hội" }
    ]
  },
  {
    id: "dark-patterns",
    title: "Dark Patterns: When Good Design Works Against You",
    kicker: "TECH • PSYCHOLOGY",
    category: "Technology",
    level: "C1",
    minutes: 4,
    summary: "Interfaces can be easy to use while still steering people toward choices they did not intend to make.",
    paragraphs: [
      "Good interface design is usually associated with clarity, convenience and fewer mistakes. Dark patterns use many of the same design skills for a different purpose: influencing users to make choices that benefit the service more than the user.",
      "Examples include making a subscription easy to start but difficult to cancel, using a large bright button for the profitable option and a faint link for the alternative, or creating artificial urgency with countdown timers. None of these techniques needs to force the user directly. The design changes the probability of a decision.",
      "Dark patterns are important because digital choices are rarely made in a neutral environment. The order of options, default settings, colors and wording all affect behavior. A technically legal choice can still be ethically questionable when the interface is deliberately structured to exploit inattention or confusion.",
      "The broader lesson is that usability and user interest are not identical. An interface can be extremely effective at guiding behavior while guiding people in a direction they would not have chosen with full attention."
    ],
    keyIdeas: [
      "Dark patterns use interface design to steer decisions.",
      "Defaults, visual hierarchy and friction influence user behavior.",
      "A usable interface is not automatically an ethical interface."
    ],
    vocabulary: [
      { word: "artificial urgency", meaning: "cảm giác cấp bách được tạo ra có chủ ý" },
      { word: "exploit", meaning: "khai thác, lợi dụng" },
      { word: "friction", meaning: "trở lực hoặc bước gây bất tiện trong trải nghiệm" }
    ]
  },
  {
    id: "jevons-paradox",
    title: "Jevons Paradox: Efficiency Can Increase Consumption",
    kicker: "ECONOMICS • ENERGY",
    category: "Economy",
    level: "C1",
    minutes: 4,
    summary: "Making something more efficient does not always reduce total resource use.",
    paragraphs: [
      "It seems obvious that more efficient technology should reduce resource consumption. If a machine uses half as much energy, surely total energy use should fall. In the nineteenth century, economist William Stanley Jevons noticed that reality could move in the opposite direction.",
      "When an activity becomes cheaper because it is more efficient, people may do more of it. Efficient lighting lowers the cost of illumination, so homes, streets and buildings may use much more light. Fuel-efficient travel can reduce the cost per kilometer and make longer or more frequent journeys attractive.",
      "This does not mean efficiency is useless. The key idea is that engineers and policymakers should distinguish efficiency per unit from total consumption. A data center may require less electricity for each computation while total electricity use still rises because the number of computations grows much faster.",
      "The paradox is a reminder that human behavior responds to prices and convenience. Technology changes not only how efficiently we do something, but also how much of that thing we choose to do."
    ],
    keyIdeas: [
      "Efficiency lowers the resource cost of each unit of activity.",
      "Lower cost can encourage additional consumption.",
      "Total resource use can rise even while each unit becomes more efficient."
    ],
    vocabulary: [
      { word: "consumption", meaning: "mức tiêu thụ" },
      { word: "per unit", meaning: "trên mỗi đơn vị" },
      { word: "policymaker", meaning: "người xây dựng chính sách" }
    ]
  },
  {
    id: "cobra-effect",
    title: "The Cobra Effect: When Incentives Backfire",
    kicker: "BEHAVIOR • POLICY",
    category: "Psychology",
    level: "B2",
    minutes: 4,
    summary: "A badly designed incentive can make the exact problem it targets even worse.",
    paragraphs: [
      "The cobra effect describes a situation in which an attempted solution makes a problem worse because people respond strategically to the incentive. The name comes from a famous story about authorities supposedly paying rewards for dead cobras. Once snakes had a price, people had a reason to breed them.",
      "Whether every detail of the historical story is accurate matters less than the mechanism. Humans optimize around rules. A school that rewards teachers only for test scores may encourage teaching narrowly to the test. A company that measures customer-service workers only by call length may receive shorter calls but less satisfied customers.",
      "The problem is not measurement itself. It is the assumption that a simple metric perfectly represents a complicated goal. Once a reward becomes attached to the metric, behavior shifts toward maximizing the number rather than the underlying purpose.",
      "Good incentive design therefore asks a second question: if people understood this rule perfectly and tried to exploit it, what would they do?"
    ],
    keyIdeas: [
      "People adapt their behavior to rewards and penalties.",
      "A metric can become a poor proxy once rewards depend on it.",
      "Policies should be tested against strategic or unintended responses."
    ],
    vocabulary: [
      { word: "backfire", meaning: "phản tác dụng" },
      { word: "proxy", meaning: "chỉ số đại diện cho một mục tiêu khác" },
      { word: "underlying", meaning: "nằm phía sau, cốt lõi" }
    ]
  },
  {
    id: "antifragility",
    title: "Beyond Resilience: What Does Antifragile Mean?",
    kicker: "SYSTEMS • RISK",
    category: "Systems",
    level: "C1",
    minutes: 5,
    summary: "Some systems do not merely survive stress; limited stress can actually make them improve.",
    paragraphs: [
      "A fragile object is harmed by shocks. A resilient object resists them and returns to its previous state. The idea of antifragility describes something different: a system that can become better because it experiences variability, stress or small failures.",
      "The human body provides intuitive examples. Muscles become stronger after manageable training stress followed by recovery. An immune system learns from exposure. In engineering and organizations, the analogy is more complicated, but the principle can still be useful.",
      "A software team that conducts small experiments may discover weaknesses before they become catastrophic. A business with several independent suppliers may adapt more easily when one supplier fails. In both cases, small disturbances provide information and reduce dependence on a single fragile structure.",
      "Antifragility should not be confused with seeking unlimited stress. Too much pressure can destroy a system. The interesting question is whether a system has mechanisms that learn from manageable volatility instead of merely trying to eliminate every possible disturbance."
    ],
    keyIdeas: [
      "Fragile systems are harmed by shocks; resilient systems recover.",
      "Antifragile systems can improve through manageable stress and feedback.",
      "Redundancy, experimentation and learning can reduce fragility."
    ],
    vocabulary: [
      { word: "volatility", meaning: "sự biến động" },
      { word: "redundancy", meaning: "phần dự phòng hoặc dư thừa có chủ đích" },
      { word: "catastrophic", meaning: "mang tính thảm họa" }
    ]
  },
  {
    id: "fifteen-minute-city",
    title: "The 15-Minute City Is Really About Time",
    kicker: "CITIES • DESIGN",
    category: "Cities",
    level: "B2",
    minutes: 4,
    summary: "Urban design can treat daily travel time as a quality-of-life problem.",
    paragraphs: [
      "The 15-minute city is an urban-planning idea in which most daily needs should be reachable within a short walk or bicycle ride. The exact number is less important than the principle: people should not need a long car journey for every ordinary task.",
      "A neighborhood designed this way mixes homes with schools, shops, parks, healthcare and workplaces. That is different from areas where housing, offices and shopping are separated into distant zones. When destinations are closer together, walking and cycling become more practical.",
      "Supporters argue that this can reduce traffic, pollution and time lost to commuting while making local streets more active. Critics point out that transforming existing cities is difficult, housing prices may change, and not every job or specialist service can be local.",
      "The concept is useful because it reframes transport. Instead of asking only how fast vehicles can move, it asks how much of a person's day must be spent reaching the things they need."
    ],
    keyIdeas: [
      "The model focuses on proximity rather than vehicle speed.",
      "Mixed-use neighborhoods can reduce the need for long daily trips.",
      "The core resource being protected is people's time."
    ],
    vocabulary: [
      { word: "proximity", meaning: "sự gần gũi về khoảng cách" },
      { word: "commuting", meaning: "đi lại thường xuyên giữa nhà và nơi làm việc" },
      { word: "mixed-use", meaning: "kết hợp nhiều mục đích sử dụng trong cùng khu vực" }
    ]
  },
  {
    id: "network-effects",
    title: "Why Networks Become More Valuable as They Grow",
    kicker: "TECH • BUSINESS",
    category: "Technology",
    level: "B2",
    minutes: 4,
    summary: "Some products become more useful simply because more people use them.",
    paragraphs: [
      "A telephone with only one owner is useless. Add a second person and a connection becomes possible. Add millions of people and the network becomes enormously valuable. This is the basic logic behind a network effect.",
      "Messaging apps, payment systems, marketplaces and social networks can all benefit from this phenomenon. A marketplace with more buyers attracts more sellers; more sellers then attract more buyers. The cycle can accelerate growth and make established networks difficult to challenge.",
      "However, bigger is not always better. A social platform can become noisy, a marketplace can attract low-quality sellers, and congestion can reduce the experience for everyone. Economists sometimes call these negative network effects.",
      "Understanding network effects helps explain why some digital companies grow unusually quickly and why switching to a technically better competitor can still be difficult. The value of a network often lives not only in the software, but in the people already connected through it."
    ],
    keyIdeas: [
      "Some products gain value as their user base grows.",
      "Network effects can create self-reinforcing growth.",
      "Large networks may also suffer congestion or declining quality."
    ],
    vocabulary: [
      { word: "phenomenon", meaning: "hiện tượng" },
      { word: "self-reinforcing", meaning: "tự củng cố, tự làm mạnh thêm" },
      { word: "congestion", meaning: "sự quá tải, tắc nghẽn" }
    ]
  },
  {
    id: "digital-twins",
    title: "A Digital Twin Is More Than a 3D Model",
    kicker: "TECH • INDUSTRY",
    category: "Technology",
    level: "C1",
    minutes: 4,
    summary: "A digital twin stays connected to a real system and can help predict what happens next.",
    paragraphs: [
      "A digital twin is a digital representation of a physical object or system that is continuously informed by real-world data. The important part is not the visual model; it is the connection between the digital version and the real thing.",
      "A factory may create a twin of a production line using sensor data about temperature, vibration, speed and energy consumption. Engineers can then monitor performance, test scenarios or detect patterns that suggest a machine is likely to fail.",
      "Digital twins can also represent buildings, vehicles, power grids or even entire cities. Their usefulness increases when the model can simulate consequences before a decision is made. For example, operators might test how changing traffic signals affects congestion without first changing the physical streets.",
      "The limitation is that a twin is only as reliable as its data and assumptions. A detailed model can still produce misleading predictions when sensors are inaccurate or important variables are missing."
    ],
    keyIdeas: [
      "A digital twin is linked to a real system through data.",
      "It can support monitoring, prediction and simulation.",
      "Model quality depends on data quality and assumptions."
    ],
    vocabulary: [
      { word: "representation", meaning: "sự biểu diễn, mô hình đại diện" },
      { word: "simulate", meaning: "mô phỏng" },
      { word: "variable", meaning: "biến số" }
    ]
  },
  {
    id: "sleep-memory",
    title: "Why Sleep Is Part of Learning, Not Time Away From It",
    kicker: "BRAIN • LEARNING",
    category: "Science",
    level: "B2",
    minutes: 4,
    summary: "The brain continues processing newly learned information after studying stops.",
    paragraphs: [
      "Studying feels active and sleep feels passive, so it is easy to imagine that learning happens only while we are awake. In reality, sleep plays an important role in memory consolidation: the process through which new information becomes more stable and easier to retrieve later.",
      "Different stages of sleep appear to support different kinds of memory. Researchers have found links between sleep and the strengthening of factual knowledge, motor skills and emotional memories. This is one reason a late-night study session followed by very little sleep can be less effective than expected.",
      "Sleep also affects attention. A tired brain may still spend an hour looking at material, but concentration, error detection and decision-making can deteriorate. More study time is therefore not automatically more learning.",
      "For language learners, the practical lesson is simple. Repeated exposure matters, but so does the period after exposure. Learning five words today and sleeping properly may be more valuable than forcing twenty words into an exhausted brain."
    ],
    keyIdeas: [
      "Memory consolidation continues after active studying ends.",
      "Sleep supports both memory and attention.",
      "More study time is not useful if cognitive quality collapses."
    ],
    vocabulary: [
      { word: "consolidation", meaning: "quá trình củng cố trí nhớ" },
      { word: "retrieve", meaning: "truy xuất, nhớ lại" },
      { word: "deteriorate", meaning: "xấu đi" }
    ]
  },
  {
    id: "linguistic-relativity",
    title: "Does Language Change the Way You Think?",
    kicker: "LANGUAGE • MIND",
    category: "Language",
    level: "C1",
    minutes: 5,
    summary: "Language probably does not imprison thought, but it can influence what speakers notice and remember.",
    paragraphs: [
      "A famous question in linguistics asks whether the language we speak influences the way we think. The strongest version of this idea would claim that language determines thought completely. Modern evidence does not support such an extreme conclusion, but more subtle effects are interesting.",
      "Languages divide experience in different ways. Some use grammatical gender extensively; some describe spatial direction using north, south, east and west instead of left and right; some divide colors into categories differently. These linguistic habits can influence attention and memory in particular tasks.",
      "That does not mean speakers are unable to understand concepts their language does not encode. An English speaker can learn precise compass directions, and a speaker whose language uses fewer basic color terms can still perceive color differences.",
      "A more useful interpretation is that language acts like a set of mental habits. Repeatedly expressing certain distinctions can make those distinctions easier to notice. Learning another language may therefore add not only new words, but also new routines for organizing experience."
    ],
    keyIdeas: [
      "Language does not rigidly determine what people can think.",
      "Linguistic categories can influence attention and memory.",
      "Learning another language can introduce new cognitive habits."
    ],
    vocabulary: [
      { word: "linguistic", meaning: "thuộc ngôn ngữ học hoặc ngôn ngữ" },
      { word: "encode", meaning: "mã hóa hoặc biểu đạt thông tin" },
      { word: "distinction", meaning: "sự phân biệt" }
    ]
  },
  {
    id: "right-to-repair",
    title: "The Right to Repair Is an Argument About Ownership",
    kicker: "TECH • CONSUMERS",
    category: "Technology",
    level: "B2",
    minutes: 4,
    summary: "Repair debates ask what it really means to own a modern device filled with software and proprietary parts.",
    paragraphs: [
      "When a product breaks, should the owner be free to repair it anywhere? The right-to-repair movement argues that manufacturers should provide reasonable access to parts, tools, manuals and diagnostic information.",
      "The debate has become more important as products have become more complex. A modern phone, tractor or car may contain software locks and specialized components. Even when a local technician can physically replace a part, the device may reject it without manufacturer authorization.",
      "Supporters of repair rights say competition can reduce costs, extend product life and reduce electronic waste. Manufacturers respond that unrestricted repair may create safety, cybersecurity or intellectual-property risks, especially for complex equipment.",
      "Behind the technical arguments is a philosophical question about ownership. If you buy a device but cannot choose how or where it is repaired, how complete is that ownership?"
    ],
    keyIdeas: [
      "Repair access depends increasingly on software as well as physical parts.",
      "Repairability can affect cost, product lifetime and electronic waste.",
      "The debate tests the meaning of ownership in software-controlled products."
    ],
    vocabulary: [
      { word: "diagnostic", meaning: "liên quan đến chẩn đoán lỗi" },
      { word: "authorization", meaning: "sự cho phép, ủy quyền" },
      { word: "proprietary", meaning: "độc quyền thuộc một công ty hoặc chủ sở hữu" }
    ]
  },
  {
    id: "vertical-farming",
    title: "Can Farms Grow Up Instead of Out?",
    kicker: "FOOD • TECHNOLOGY",
    category: "Science",
    level: "B2",
    minutes: 4,
    summary: "Vertical farms trade land and weather dependence for electricity, engineering and precise control.",
    paragraphs: [
      "Vertical farming grows crops in stacked indoor layers rather than across large outdoor fields. Light, water, temperature and nutrients can be controlled precisely, allowing production close to cities and throughout the year.",
      "The system can use much less water than conventional agriculture because water is recirculated. Pesticide use may also fall in a controlled environment. And because farms can be located near consumers, some transport and storage requirements are reduced.",
      "The major challenge is energy. Sunlight is free; artificial lighting is not. Climate control, pumps and LEDs can make indoor production expensive, so vertical farms are currently better suited to high-value crops such as leafy vegetables than staple crops such as wheat or rice.",
      "Vertical farming is therefore unlikely to replace ordinary agriculture. Its more realistic role may be as one specialized layer in a larger food system, especially where land is expensive, water is scarce or reliable local production has unusual value."
    ],
    keyIdeas: [
      "Indoor farms can tightly control growing conditions.",
      "They can save land and water but require significant energy.",
      "The technology is better suited to some crops than others."
    ],
    vocabulary: [
      { word: "recirculate", meaning: "tuần hoàn để sử dụng lại" },
      { word: "staple crop", meaning: "cây lương thực chủ lực" },
      { word: "conventional", meaning: "thông thường, truyền thống" }
    ]
  },
  {
    id: "tragedy-of-the-commons",
    title: "The Tragedy of the Commons: When Rational Choices Add Up Badly",
    kicker: "ECONOMICS • SOCIETY",
    category: "Economy",
    level: "C1",
    minutes: 5,
    summary: "Individually reasonable decisions can collectively damage a shared resource.",
    paragraphs: [
      "Imagine a shared field where several farmers can graze their animals. Each farmer gains the full benefit from adding one more animal, while the damage from extra grazing is spread across everyone. For each individual, adding another animal can appear rational. If everyone reasons the same way, the field may be destroyed.",
      "This structure is known as the tragedy of the commons. Similar problems can appear in fisheries, groundwater, traffic, clean air and even shared digital systems. The key feature is a resource that many people can use but no single user has a strong incentive to protect alone.",
      "The phrase can sound pessimistic, yet shared resources do not always collapse. Communities have created rules, norms, monitoring and ownership arrangements that successfully manage common resources. Government regulation and pricing can also change incentives.",
      "The deeper lesson is not that cooperation is impossible. It is that individual incentives and collective outcomes can diverge, so sustainable cooperation often needs institutions rather than goodwill alone."
    ],
    keyIdeas: [
      "Individual benefits and collective costs can be distributed differently.",
      "Shared resources are vulnerable when no user bears the full cost of overuse.",
      "Rules and institutions can realign individual and collective incentives."
    ],
    vocabulary: [
      { word: "graze", meaning: "chăn thả gia súc ăn cỏ" },
      { word: "collective", meaning: "thuộc tập thể" },
      { word: "diverge", meaning: "đi theo hướng khác nhau, phân kỳ" }
    ]
  },
  {
    id: "bioeconomy",
    title: "The Bioeconomy Turns Biology Into an Industrial Platform",
    kicker: "SCIENCE • ECONOMICS",
    category: "Economy",
    level: "C1",
    minutes: 5,
    summary: "Cells, enzymes and biological processes are increasingly used to produce materials, food, chemicals and medicines.",
    paragraphs: [
      "The bioeconomy refers to economic activity that uses renewable biological resources, biological knowledge or biotechnology to produce goods and services. Agriculture has always been biological, but modern biotechnology has expanded what biology can manufacture.",
      "Microorganisms can be engineered to produce medicines, enzymes, food ingredients and chemicals. Agricultural waste can become feedstock for fuels or materials. Researchers are even developing alternatives to petroleum-based plastics using biological processes.",
      "The attraction is partly environmental: biological production can sometimes use renewable inputs and operate under milder conditions than traditional industrial chemistry. But biological does not automatically mean sustainable. Land use, water demand, fertilizer and energy still matter.",
      "The bioeconomy is interesting because it blurs the line between a factory and a living system. Instead of shaping metal or refining oil, some future industries may program cells to perform part of the manufacturing process."
    ],
    keyIdeas: [
      "Biological systems can be used as production technologies.",
      "Renewable inputs do not guarantee sustainability by themselves.",
      "Biotechnology is expanding the range of goods that living systems can manufacture."
    ],
    vocabulary: [
      { word: "feedstock", meaning: "nguyên liệu đầu vào cho một quy trình công nghiệp" },
      { word: "enzyme", meaning: "enzym, chất xúc tác sinh học" },
      { word: "refine", meaning: "tinh chế" }
    ]
  },
  {
    id: "prediction-markets",
    title: "Can a Market Predict the Future?",
    kicker: "ECONOMICS • FORECASTING",
    category: "Economy",
    level: "C1",
    minutes: 4,
    summary: "Prediction markets try to combine dispersed information by giving beliefs a price.",
    paragraphs: [
      "A prediction market allows people to trade contracts whose value depends on a future event. If a contract pays one unit when an event occurs, a market price of 0.70 can roughly be interpreted as the crowd assigning a seventy-percent chance to that event.",
      "The idea is powerful because participants may possess different fragments of information. One person knows industry data, another understands local conditions, and another notices a trend others missed. Prices can aggregate these dispersed beliefs into a single changing signal.",
      "Prediction markets are not magical. They can be distorted by low participation, unclear rules, biased participants or events that are difficult to define. A crowd is not automatically wise simply because it is a crowd.",
      "Still, the mechanism illustrates an important idea: forecasts can improve when people have both information and an incentive to reveal how strongly they believe it."
    ],
    keyIdeas: [
      "Market prices can act as aggregated probability estimates.",
      "Different participants contribute different pieces of information.",
      "The mechanism depends on participation, incentives and clearly defined outcomes."
    ],
    vocabulary: [
      { word: "dispersed", meaning: "phân tán" },
      { word: "aggregate", meaning: "tổng hợp" },
      { word: "distort", meaning: "làm sai lệch" }
    ]
  },
  {
    id: "whale-pump",
    title: "Whales Can Move Nutrients Through an Ocean",
    kicker: "NATURE • SYSTEMS",
    category: "Science",
    level: "C1",
    minutes: 4,
    summary: "Large animals can influence entire ecosystems through surprisingly ordinary biological processes.",
    paragraphs: [
      "Whales are often discussed as individual animals, but ecologists also study them as moving parts of ocean systems. One striking idea is known as the whale pump: whales can help transport nutrients from deeper water toward the ocean surface.",
      "Many whales feed at depth and later release nutrient-rich waste nearer the surface. Those nutrients can support phytoplankton, microscopic organisms that form the base of marine food webs and absorb carbon dioxide during photosynthesis.",
      "Whales also move nutrients geographically during migration, and when a whale dies its body can transport carbon and nutrients to the deep ocean floor. These processes do not mean whales alone control ocean carbon, but they show how an animal population can influence cycles far beyond direct predator-prey relationships.",
      "The larger lesson is ecological: removing or restoring a species can change flows of nutrients and energy in ways that are not obvious when we study organisms one at a time."
    ],
    keyIdeas: [
      "Whales can transport nutrients vertically and geographically.",
      "Those nutrients can support phytoplankton and marine food webs.",
      "Species can influence ecosystems through indirect physical and chemical processes."
    ],
    vocabulary: [
      { word: "phytoplankton", meaning: "sinh vật phù du quang hợp" },
      { word: "nutrient", meaning: "chất dinh dưỡng" },
      { word: "migration", meaning: "sự di cư theo mùa hoặc chu kỳ" }
    ]
  }
];

export const ARTICLES_BY_ID = Object.fromEntries(
  ARTICLES.map((article) => [article.id, article])
) as Record<string, KnowledgeArticle>;
