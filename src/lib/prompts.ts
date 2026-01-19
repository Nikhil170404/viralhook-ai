export interface PromptTemplate {
    id: number;
    category: string;
    template: string;
    platform: string;
    viralHook?: string; // The "Clickbait" title
    mechanism?: string; // Director's note on HOW to achieve it
    isCommunity?: boolean;
    copyCount?: number;
    creatorName?: string;
    creatorAvatar?: string;
    mode?: string;
}

export const viralPrompts: PromptTemplate[] = [
    // --- Category A: The Traffic Symphony ---
    {
        id: 1,
        category: "Traffic Symphony 🛺",
        template: "[Camera]: Low angle, fast tracking shot, shaky GoPro style. [Action]: A yellow and black auto-rickshaw drifting sideways on a wet muddy road in Mumbai, mud splashing heavily. The driver is casually looking backward, laughing. [Context]: Heavy monsoon rain, chaotic traffic background. : High contrast, motion blur, 4k realism, action movie grade color grading.",
        platform: "Kling AI",
        viralHook: "Tokyo Drift: Kurla Edition 🛺💨 #HeavyDriver",
        mechanism: "Use high motion settings. Focus on splash physics to sell the drift."
    },
    {
        id: 2,
        category: "Traffic Symphony 🐮",
        template: "[Camera]: Dashcam view, static, wide angle. [Action]: A speeding luxury white SUV slams brakes suddenly, nose dipping down violently, stopping inches from a white {OBJECT} standing calmly in the middle of the highway chewing cud. [Context]: Indian highway, bright harsh sunlight, heat haze. : CCTV grain, timestamp overlay, 15fps look.",
        platform: "Luma Dream Machine",
        viralHook: "Brake check level: Holy Cow 🐮🛑 #FinalDestination",
        mechanism: "Use 'static' camera with 'rapid motion' subject. The cow must remain still."
    },
    {
        id: 3,
        category: "Traffic Symphony 🚌",
        template: "[Camera]: Handheld smartphone vertical, slight zoom in. [Action]: An overcrowded red public bus leans dangerously to the left as it takes a sharp turn. Passengers hanging off the door are smiling and waving. [Context]: Dusty village road, sunset backlight. : Raw footage, vibrant colors, lens flare.",
        platform: "Kling AI",
        viralHook: "Physics left the chat 🚌💀 # रोडवेज",
        mechanism: "Specify 'leaning 45 degrees' to force suspension compression."
    },
    {
        id: 4,
        category: "Traffic Symphony 🚙",
        template: "[Camera]: Drone tracking shot, fast follow. [Action]: A black modified Mahindra Thar driving over a road divider to bypass a traffic jam. Dust and debris flying. [Context]: Gurgaon traffic gridlock, high rise buildings in back. : Cinematic action, slow motion impact.",
        platform: "Kling AI",
        viralHook: "Average day in Gurgaon 🚙🚧 #TharLife",
        mechanism: "Focus on 'suspension articulation' to make the climb realistic."
    },
    {
        id: 5,
        category: "Traffic Symphony 🛵",
        template: "[Camera]: POV from a scooter handle. [Action]: Weaving through tight traffic gap between two buses. The scooter side mirror audibly (visual implication) clips the bus metal, sparks fly slightly. [Context]: Bangalore traffic choke point. : POV, shaky, adrenaline, motion blur on edges.",
        platform: "Kling AI",
        viralHook: "Gap was wide enough... mostly 🛵🤏 #BangaloreTraffic",
        mechanism: "The 'spark' is a visual cue for sound. Use 'tight squeeze' keywords."
    },

    // --- Category B: Culinary Shock ---
    {
        id: 6,
        category: "Culinary Shock 🧀",
        template: "[Camera]: Extreme close-up (Macro), slow push in. [Action]: A street vendor aggressively grating a massive block of yellow cheese over a small {OBJECT}. The cheese pile collapses and buries the {OBJECT} entirely. [Action 2]: Vendor adds another block. : High saturation, food porn lighting but messy, greasy texture.",
        platform: "Kling AI",
        viralHook: "Stop! He's already dead! 🧀💀 #CheeseLover",
        mechanism: "Use 'accumulation' keywords. The prompt must emphasize excess."
    },
    {
        id: 7,
        category: "Culinary Shock 🧈",
        template: "[Camera]: High angle, bird's eye view, slow rotation (Luma Orbit). [Action]: A pav bhaji tawa sizzling. A vendor drops an entire brick of Amul butter onto the steaming {OBJECT}. It melts rapidly, creating a yellow lake. [Context]: Street food cart, steam rising. : Glossy, steamy, hyper-real, high contrast red and yellow.",
        platform: "Luma Dream Machine",
        viralHook: "Heart attack on a plate (literally) 🧈❤️ #DietStartsTomorrow",
        mechanism: "Luma's fluid dynamics for melting. Specify 'rapid melt'."
    },
    {
        id: 8,
        category: "Culinary Shock 🥞",
        template: "[Camera]: Wide shot, tracking motion. [Action]: A street vendor flicks a crispy {OBJECT} into the air like a frisbee. It flies across the frame and lands perfectly on a paper plate held by a customer 5 feet away. [Context]: Night market, neon lights, smoke. : Slow motion arc, cinematic tracking.",
        platform: "Kling AI",
        viralHook: "Dosa or Disc Golf? 🥞🛸 #RajinikanthStyle",
        mechanism: "Requires trajectory physics. Kling is better for 'throw and catch'."
    },
    {
        id: 9,
        category: "Culinary Shock 🖐️",
        template: "[Camera]: Mid-shot, eye level. [Action]: A vendor plunging his bare arm deep into a massive vat of {OBJECT} to stir it. He looks directly at the camera and smiles. [Context]: Crowded Kolkata street. : Gritty documentary style, slight green tint, harsh flash lighting.",
        platform: "Kling AI",
        viralHook: "Extra flavor unlocked 🤢🖐️ #StreetFood",
        mechanism: "Focus on water displacement and 'arm immersion' for shock."
    },
    {
        id: 10,
        category: "Culinary Shock 🪰",
        template: "[Camera]: Crash zoom (rapid zoom in). [Action]: A ladle pouring thick brown curry onto a plate. As it pours, a swarm of large flies buzzes up from the plate chaotically. [Context]: Dirty roadside stall. : Shock aesthetic, shaky cam, sudden movement.",
        platform: "Kling AI",
        viralHook: "Protein shake: Desi Version 🪰🍲 #HygieneCheck",
        mechanism: "'Swarm' particle effects for visceral reaction."
    },
    {
        id: 11,
        category: "Culinary Shock 🔥",
        template: "[Camera]: Low angle looking up. [Action]: A man puts a flaming {OBJECT} into his mouth. Instead of extinguishing, he exhales a massive plume of fire like a dragon. [Context]: Night street, crowd cheering. : High dynamic range (HDR) for fire brightness.",
        platform: "Kling AI",
        viralHook: "Dragonborn found in Delhi 🔥🐲 #FirePaan",
        mechanism: "Fire fluid dynamics. Specify fire leaving mouth to avoid safety flags."
    },

    // --- Category C: Monsoon & Infrastructure ---
    {
        id: 12,
        category: "Monsoon Mayhem 💻",
        template: "[Camera]: Tracking shot, side profile. [Action]: A corporate employee in a formal shirt and tie riding a scooter through waist-deep flood water. He is holding a laptop bag high above his head with one hand. [Context]: Flooded Mumbai street, rain pouring. : Cinematic heroism, slow motion, dramatic rain overlay.",
        platform: "Luma Dream Machine",
        viralHook: "Dedication or Delusion? 💻🌊 #CorporateMajdoor",
        mechanism: "Contrast is key—formal wear vs. disaster zone."
    },
    {
        id: 13,
        category: "Monsoon Mayhem 🕳️",
        template: "[Camera]: Static CCTV angle high up. [Action]: A biker driving through a puddle that looks shallow. Suddenly, the front wheel drops into a massive hidden sinkhole, and the biker flips forward (ragdoll physics). [Context]: Indian city road after rain. : CCTV grain, timestamp overlay, 15fps look.",
        platform: "Kling AI",
        viralHook: "Google Maps didn't show the portal to hell 🕳️🏍️ #Pothole",
        mechanism: "Use 'sudden drop' physics and glitch effect."
    },
    {
        id: 14,
        category: "Monsoon Mayhem 🚣",
        template: "[Camera]: Handheld from a balcony (high angle). [Action]: A white hatchback car floating down a flooded street like a boat. A man is sitting on the roof paddling with a cricket bat. [Context]: Residential colony, heavy rain. : News footage style, grainy, desaturated.",
        platform: "Luma Dream Machine",
        viralHook: "Ola Boat Service launched 🚣🚗 #MumbaiRains",
        mechanism: "'Floating object' physics. Cricket bat adds 'Jugaad' element."
    },
    {
        id: 15,
        category: "Monsoon Mayhem 🚜",
        template: "[Camera]: Wide shot. [Action]: A yellow JCB excavator scoop lifting an entire family on a motorcycle across a flooded river. [Context]: Rural crossing. : Heroic, industrial.",
        platform: "Luma Dream Machine",
        viralHook: "JCB ki Khudai? Nah, JCB ki Bhalaai 🚜🙏 #JCB",
        mechanism: "New interpretation of the JCB meme."
    },

    // --- Category D: Human-Animal Interface ---
    {
        id: 16,
        category: "Animal Chaos 🐒",
        template: "[Camera]: POV (First person). [Action]: Holding a {OBJECT} to take a selfie. Suddenly, a monkey's hand grabs the {OBJECT} from the top of the frame. The view spins wildly as it is dragged up a tree. [Context]: Temple steps, bright day. : Motion blur, chaotic spin, dizzying perspective.",
        platform: "Luma Dream Machine",
        viralHook: "POV: You just lost your property 🐒📱 #MonkeyBusiness",
        mechanism: "'Camera Violence' technique. Spin simulates theft."
    },
    {
        id: 17,
        category: "Animal Chaos 🐘",
        template: "[Camera]: CCTV interior view. [Action]: Inside a small grocery shop. An elephant's trunk smashes through the front window/door, grabbing a bunch of {OBJECT}. Customers dive behind the counter. [Context]: Indian village shop. : CCTV black and white, panic motion, breaking glass.",
        platform: "Kling AI",
        viralHook: "Customer service was too slow 🐘🍌 #Gajraj",
        mechanism: "'Shattering' physics."
    },
    {
        id: 18,
        category: "Animal Chaos 🐆",
        template: "[Camera]: Night vision CCTV (Green/Greyscale). [Action]: A sleepy street dog suddenly jumps up and bolts. A split second later, a sleek leopard leaps across the frame chasing it. [Context]: Residential gate, night. : High grain, eerie silence vibe, glowing eyes.",
        platform: "Kling AI",
        viralHook: "Night shift security is intense 🐆🐕 #WildIndia",
        mechanism: "Speed is key. Use 'blur' to mask imperfections."
    },
    {
        id: 19,
        category: "Animal Chaos 🦅",
        template: "[Camera]: Selfie video mode. [Action]: A person holding a {OBJECT} to their mouth. A massive kite/eagle swoops down (blur) and snatches the food. The person looks shocked. [Context]: Mumbai beach. : Fast action, shock zoom on face.",
        platform: "Luma Dream Machine",
        viralHook: "Gone in 60 milliseconds 🦅🍔 #VadaPav",
        mechanism: "Timing the swoop. Use Luma 'Action' command."
    },

    // --- Category E: Celebration Fails ---
    {
        id: 20,
        category: "Celebration Fail 💍",
        template: "[Camera]: Mid-shot, low angle. [Action]: A bride and groom on a stage. The groom tries to put the garland (jaimala) on the bride, but she dodges. He lunges, they both lose balance and fall off the stage into the crowd. [Context]: Indian wedding stage, flower decorations, smoke machine. : Slow motion fall, dramatic lighting.",
        platform: "Kling AI",
        viralHook: "Love is a battlefield (literally) 💍🤼 #ShaadiFails",
        mechanism: "Complex multi-body physics."
    },
    {
        id: 21,
        category: "Celebration Fail 🏏",
        template: "[Camera]: Ground level, behind the batsman. [Action]: A batsman hits a {OBJECT} hard. The camera whips pan to follow it as it shatters a residential glass window. An angry uncle's face appears instantly in the broken frame. [Context]: Narrow street (gully), laundry hanging. : Fast whip pan, shock zoom, breaking glass sound implication.",
        platform: "Kling AI",
        viralHook: "Run level: 999 🏏🪟 #GullyCricket",
        mechanism: "'Whip Pan' camera move."
    },
    {
        id: 22,
        category: "Celebration Fail 🐍",
        template: "[Camera]: High angle, rotating. [Action]: A man in a suit lying on the floor doing the 'Nagin' (snake) dance aggressively. He rolls too far and knocks over a waiter carrying a tray of {OBJECT}. [Context]: Wedding dance floor, disco lights. : Chaotic energy, bright flashes, datamosh at impact.",
        platform: "Luma Dream Machine",
        viralHook: "Uncleji after 2 drinks 🐍🥃 #NaginDance",
        mechanism: "'Rolling' physics. Datamosh at impact."
    },

    // --- Category F: Delivery Multiverse ---
    {
        id: 23,
        category: "Delivery Multiverse 🐴",
        template: "[Camera]: Side tracking shot from a car window. [Action]: A man wearing a red Zomato t-shirt and carrying a square delivery bag riding a white horse through city traffic. He checks his phone while riding. [Context]: Traffic jam, modern city. : Surreal realism, slight shake.",
        platform: "Luma Dream Machine",
        viralHook: "Petrol prices got us like... 🐴🍕 #Zomato",
        mechanism: "Juxtaposition: Ancient horse vs modern gig worker."
    },
    {
        id: 24,
        category: "Delivery Multiverse 🚀",
        template: "[Camera]: Wide shot, looking up. [Action]: A Blinkit delivery agent flying with a jetpack over a traffic jam, landing on a balcony to hand over a {OBJECT}. [Context]: Futuristic Mumbai skyline, smoggy sunset. : Sci-fi/Cyberpunk India aesthetic.",
        platform: "Luma Dream Machine",
        viralHook: "10 minute delivery explained 🚀📦 #Blinkit",
        mechanism: "Sci-fi elements. Absurd delivery promise."
    },

    // --- Category G: Google Veo Cinematic (New) ---
    {
        id: 25,
        category: "Veo Cinematic 🎥",
        template: "[Camera]: Dolly Zoom (Hitchcock effect), keeping {OBJECT} size constant while background expands. [Action]: The {OBJECT} sitting calmly on a table while the room behind it stretches into infinity. [Context]: Sci-fi interrogation room, cold blue light. : 8k, highly detailed texture, optical illusion.",
        platform: "Google Veo",
        viralHook: "POV: When the realization hits 🤯🎥 #Cinematography",
        mechanism: "Veo specific 'Dolly Zoom' command."
    },
    {
        id: 26,
        category: "Veo Cinematic 🚁",
        template: "[Camera]: Aerial Drone tracking shot, vast scale. [Action]: Reveals a giant {OBJECT} resting in the middle of a football stadium. [Context]: Night time, stadium lights on, thousands of camera flashes in stands. : Photorealistic, 8k, crowd simulation.",
        platform: "Google Veo",
        viralHook: "The biggest drop of 2026 🏟️🔥 #MegaScale",
        mechanism: "Veo handles 'Aerial' and large scale crowds best."
    },
    {
        id: 27,
        category: "Veo Physics 💧",
        template: "[Camera]: Macro, slow motion. [Action]: A water balloon shaped like a {OBJECT} bursting. The water retains the shape of the {OBJECT} for a split second before splashing. [Context]: Studio dark background, rim lighting. : Fluid simulation, caustic reflections.",
        platform: "Google Veo",
        viralHook: "Physics loading... 99% 💧⏸️ #Satisfying",
        mechanism: "Veo 3.1 'Fluid Dynamics' prior."
    },

    // --- Category H: Kling Motion Brush (New) ---
    {
        id: 28,
        category: "Kling Motion 🖌️",
        template: "[Technique]: Motion Brush on subject only. [Action]: The {OBJECT} morphs into a flock of birds flying upwards. The background remains perfectly static. [Context]: Busy city street (frozen in time). : Surreal, high contrast.",
        platform: "Kling AI",
        viralHook: "Glitch in the matrix 🐦🏙️ #KlingEdit",
        mechanism: "Use 'Static Brush' on background, 'Motion Brush' on object."
    },
    {
        id: 29,
        category: "Kling Motion 🌪️",
        template: "[Technique]: Trajectory Path. [Action]: A {OBJECT} spiraling upwards into the sky like a tornado debris. [Context]: Cornfield, stormy sky. : Twister style, dusty atmosphere.",
        platform: "Kling AI",
        viralHook: "Gone with the wind 🌬️🌪️ #Tornado",
        mechanism: "Draw spiral path with Motion Brush."
    },
    // --- Category I: User Requests (New) ---
    {
        id: 30,
        category: "Desi Vibe 🇮🇳",
        template: "[Camera]: Handheld smartphone vertical, slight zoom in. [Action]: An Indian guy in a colorful shirt walks confidently down a chaotic street, narrowly avoiding a speeding autorickshaw. A street vendor's cart tips over behind him, fruits flying. [Context]: Dusty urban alley, golden hour backlight. : Raw footage, vibrant colors, lens flare.",
        platform: "High Quality",
        viralHook: "Main Character Energy in Mumbai 🕶️🛺 #Savage",
        mechanism: "Timing collision avoidance."
    },

    // --- Category J: 90s Nostalgia (New from 2026 Guide) ---
    {
        id: 31,
        category: "90s Bollywood 🎻",
        template: "[Camera]: 35mm Film, Arri 435, Soft Focus. [Action]: A {OBJECT} placed on a swing in a mustard field. The wind blows gently. [Context]: Punjab fields, Golden Hour (Warm 3200K), Pro-Mist diffusion. [Audio Vibe]: Udit Narayan style alaap, sweeping violins, wind chimes.",
        platform: "Kling AI",
        viralHook: "POV: It's 1999 and life is good 🎻🌾 #90sBollywood",
        mechanism: "Use 'Kodak Vision 500T' and 'Pro-Mist' keywords."
    },
    {
        id: 32,
        category: "VHS Horror 📼",
        template: "[Camera]: Handheld Camcorder, Night Vision. [Action]: Walking down a dark hallway towards a {OBJECT}. The image glitches and cuts to static just as the {OBJECT} moves. [Context]: Abandoned hospital, scan lines, chroma noise. [Audio Vibe]: Low frequency hum, VCR tracking noise, sudden static screech.",
        platform: "Runway Gen-3",
        viralHook: "Found footage from the backrooms 📼💀 #Creepy",
        mechanism: "Use 'VHS artifacts', 'tracking error', 'chroma bleeding'."
    },

    // --- Category K: Runway Camera Control (New) ---
    {
        id: 33,
        category: "Runway Cinematic 🔭",
        template: "[Camera Movement]: Slow zoom in (Intensity +3). [Establishing Scene]: A solitary {OBJECT} resting on a mountain peak. [Details]: Volumetric fog rolling over the edge. [Lighting]: Blue hour, cool tones. [Style]: National Geographic documentary.",
        platform: "Runway Gen-3",
        viralHook: "The isolation hits different 🏔️❄️ #Cinematic",
        mechanism: "Strict usage of '[Camera Movement]:' syntax."
    }
];