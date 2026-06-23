// Seed list for the Gàidhlig diaspora place-name map.
//
// EVERY entry below should be reviewed by a native Gàidhlig speaker before
// publishing widely. The `verified` flag drives a small "unverified — help us
// confirm" badge in the side panel, so unverified entries are still useful but
// honestly flagged.
//
// Adding a place: drop a new object in the array. The map re-renders from this
// list — no other code changes needed.

export const PLACES = [
  {
    id: 'perth-ny',
    name: 'Perth',
    region: 'New York, USA',
    lng: -74.1707,
    lat: 43.0084,
    gaidhlig: 'Peairt',
    meaning: 'From a Pictish root meaning "wood" or "copse"; later associated with the thorn-bush.',
    why_named: 'Named after Perth, Scotland by Scottish settlers who arrived in the late 18th century.',
    founded: '1779',
    verified: false,
  },
  {
    id: 'broadalbin-ny',
    name: 'Broadalbin',
    region: 'New York, USA',
    lng: -74.1965,
    lat: 43.0640,
    gaidhlig: 'Bràghad Albann',
    meaning: '"The uplands of Alba (Scotland)" — the highland country.',
    why_named: 'Named after the Breadalbane region of Perthshire by emigrants from that area.',
    founded: '1815',
    verified: false,
  },
  {
    id: 'argyle-ny',
    name: 'Argyle',
    region: 'New York, USA',
    lng: -73.4948,
    lat: 43.2425,
    gaidhlig: 'Earra-Ghàidheal',
    meaning: '"The coastland of the Gaels."',
    why_named: 'Named for Argyll, the ancestral kingdom of Dál Riata. Settled by Scottish Presbyterians in the 18th century.',
    founded: '1764',
    verified: false,
  },
  {
    id: 'scotia-ny',
    name: 'Scotia',
    region: 'New York, USA',
    lng: -73.9651,
    lat: 42.8267,
    gaidhlig: 'Alba',
    meaning: 'Scotia is the medieval Latin name for Scotland; the Gàidhlig name is Alba.',
    why_named: 'Named by Alexander Glen in 1658 in honour of his Scottish homeland.',
    founded: '1658',
    verified: false,
  },
  {
    id: 'inverness-ns',
    name: 'Inverness',
    region: 'Nova Scotia, Canada',
    lng: -61.2926,
    lat: 46.2336,
    gaidhlig: 'Inbhir Nis',
    meaning: '"Mouth of the River Ness."',
    why_named: 'Named for Inverness, the Highland capital, by Cape Breton settlers from the Scottish Highlands.',
    founded: '~1803',
    verified: false,
  },
  {
    id: 'glencoe-on',
    name: 'Glencoe',
    region: 'Ontario, Canada',
    lng: -81.7059,
    lat: 42.7501,
    gaidhlig: 'Gleann Comhann',
    meaning: '"The glen of the River Coe" — the glen of the 1692 massacre.',
    why_named: 'Settled in the 1830s by Highland Scots remembering the original Glen Coe.',
    founded: '~1836',
    verified: false,
  },
  {
    id: 'kilmarnock-va',
    name: 'Kilmarnock',
    region: 'Virginia, USA',
    lng: -76.3791,
    lat: 37.7115,
    gaidhlig: 'Cill Mheàrnaig',
    meaning: '"The church of (Saint) Marnoc" — a 7th-century Celtic saint.',
    why_named: 'Named for Kilmarnock in Ayrshire, Scotland.',
    founded: '~1780',
    verified: false,
  },
  {
    id: 'islay-township-on',
    name: 'Islay Township',
    region: 'Ontario, Canada',
    lng: -83.5,
    lat: 46.7,
    gaidhlig: 'Ìle',
    meaning: 'Pre-Celtic origin, uncertain; possibly meaning "swelling" or "island flank."',
    why_named: 'Named for the Hebridean island of Islay.',
    founded: null,
    verified: false,
  },
  {
    id: 'benbecula-ns',
    name: 'Benbecula',
    region: 'Nova Scotia, Canada',
    lng: -60.85,
    lat: 46.05,
    gaidhlig: 'Beinn nam Faoghla',
    meaning: '"Mountain of the fords" — referring to the tidal fords linking the islands.',
    why_named: 'Named after the Outer Hebridean island of Benbecula.',
    founded: null,
    verified: false,
  },
  {
    id: 'ballachulish-oh',
    name: 'Ballachulish',
    region: 'Ohio, USA',
    lng: -82.0,
    lat: 40.4,
    gaidhlig: "Baile a' Chaolais",
    meaning: '"Settlement of the narrows."',
    why_named: 'Named for Ballachulish in Argyllshire, at the mouth of Loch Leven.',
    founded: null,
    verified: false,
  },
  {
    id: 'argyle-wi',
    name: 'Argyle',
    region: 'Wisconsin, USA',
    lng: -89.8664,
    lat: 42.7018,
    gaidhlig: 'Earra-Ghàidheal',
    meaning: '"The coastland of the Gaels."',
    why_named: 'Settled in the 1840s by Scottish lead-miners moving up from the Galena district; named for Argyll.',
    founded: '~1844',
    verified: false,
    body_en: `Far a bheil thu / Where you are
You're in the Driftless Area of southwestern Wisconsin — rolling, unglaciated hill country in Lafayette County. The village of Argyle sits on the East Branch of the Pecatonica River and is best known today as the boyhood home of Robert M. LaFollette. Your neighbors' heritage here is a patchwork: Norwegian and Cornish names dominate the county records, with a strong Irish presence too. Argyle's Scottish thread is narrower, but it's distinct — and it's the reason this village carries a Highland name in the middle of Norwegian dairy country.

Na tha mu do choinneamh / What's around you
The nearest living Scottish cultural calendar runs through the Milwaukee–Waukesha corridor, about 80–100 miles east:

- Milwaukee Highland Games — held each June at Croatian Park in Franklin, WI.
- Wisconsin Highland Games — the larger of the two, held over Labor Day weekend at the Waukesha County Expo, run by Wisconsin Scottish Inc. It includes a clan tent area, genealogy resources, piping and drumming competitions, and Highland dance.

For research into the families themselves, the Wisconsin Historical Society (headquartered in Madison, about 40 miles northeast) holds the state's principal genealogical archive, and Lafayette County's own local history societies keep records specific to the original township plats.

For learning the language: there is currently no active Scottish Gàidhlig program at either UW–Madison or UW–Milwaukee. UW–Madison runs community classes in Irish Gaelic, and UW–Milwaukee's Celtic Studies Center is also Irish-focused. For Scottish Gàidhlig itself, the realistic starting points from Argyle are online: [GlobalCeilidh.com](https://globalceilidh.com), [Colaisde na Gàidhlig](https://gaeliccollege.edu) (the Gaelic College in St. Ann's, Cape Breton), and [ACGA](https://acgamerica.org) (An Comunn Gàidhlig Ameireaganach — the North American Gaelic society).

Mar a ràinig thu an seo / How you got here
Argyle exists because of one man's gratitude. Allan Wright, a Scottish immigrant, settled at a ford on the Pecatonica River in the 1840s and was appointed the settlement's first postmaster in 1844. He named the new post office Argyle after the Duke of Argyll, who had financially sponsored his passage from Scotland.

Wright's arrival became an anchor point for a small, tightly bound group of families. His sister Helen married Allen Mitchell, a Paisley shawl weaver by trade, who staked land near the river in 1847, drawn west by the regional lead-mining boom. When more Scottish families arrived — the Arnots, from the Firth of Forth area, and the Pattersons — they crowded into the Mitchell home together while their own houses were built, a pattern typical of how small Highland and Lowland-Scots beachheads took root across the American frontier.

By 1850, New England settlers had partnered with this original Scottish core to formally plat Argyle's streets — the village's civic shape from the very start was a joint Scottish–Yankee project.

A' Ghàidhlig an seo / Gàidhlig here
Gàidhlig did not take root in Argyle. Unlike the larger, longer-lived Gaelic-speaking communities of places like North Carolina or Nova Scotia, the Argyle settlers were too few, and assimilated too fast, to sustain the language across generations. There were no Gàidhlig churches, newspapers, or schools here — the language likely fell silent within one or two generations of arrival. There is no revival community in Argyle today. The nearest path back to the language runs through the wider region or online, not through any local institution.`,
    body_gd: `Far a bheil thu
Tha thu ann an sgìre Driftless ann an iar-dheas Wisconsin — dùthaich chnocach, gun eigh-shruth, ann an Siorrachd Lafayette. Tha am baile beag Argyle na laighe air Meur an Ear de dh'Abhainn Pecatonica, agus tha e ainmeil an-diugh mar dhachaigh òigridh Robert M. LaFollette. Tha dualchas do choimhearsnaich an seo measgaichte — Nirribheach is Còrnach gu mòr, le buaidh Èireannach làidir cuideachd. Tha an snàithlean Albannach ann an Argyle na chaolas, ach tha e sònraichte — agus is e sin as coireach gu bheil ainm Gàidhealach air a' bhaile am meadhan dùthaich na Nirribhich.

Na tha mu do choinneamh
Tha am mìosachan cultarail Albannach as fhaisge a' ruith tro sgìre Milwaukee-Waukesha, mu 80–100 mìle an ear:

- Geamannan Gàidhealach Milwaukee — anns an Ògmhios gach bliadhna, aig Croatian Park, Franklin, WI.
- Geamannan Gàidhealach Wisconsin — am fear as motha dhiubh, air an cumail thairis air deireadh-seachdain Latha an Luchd-obrach aig Ionad-falbhain Siorrachd Waukesha.

Airson rannsachadh teaghlaich, tha Comann Eachdraidh Wisconsin ann am Madison na phrìomh tasglann sloinntearachd na stàite.

Airson an cànan ionnsachadh: chan eil prògram beò Gàidhlig na h-Alba an-dràsta aig Oilthigh Wisconsin-Madison no Milwaukee — chan eil ann ach Gaeilge na h-Èireann. Airson Gàidhlig na h-Alba fhèin, 's e na puingean tòiseachaidh as practaigiche bho Argyle: [GlobalCeilidh.com](https://globalceilidh.com), [Colaisde na Gàidhlig](https://gaeliccollege.edu) (an Colaisde Ghàidhlig ann an Cidhe Anna, Eilean Cheap Breatainn), agus [ACGA](https://acgamerica.org) (An Comunn Gàidhlig Ameireaganach).

Mar a ràinig thu an seo
Tha Argyle ann air sgàth taingealachd aon duine. Shocraich Allan Wright, eilthireach Albannach, aig àth air Abhainn Pecatonica anns na 1840an, agus chaidh a chur an dreuchd mar phost-mhaighstir an toiseach ann an 1844. Thug e Argyle mar ainm air an oifis-puist ùr, an dèidh Diùc Earra-Ghàidheal, a phàigh airson a thurais bhon Alba.

Thàinig teaghlaichean eile — na Arnotaich, à sgìre Linne Foirthe, agus na Pattersonaich — agus chaidh iad uile a-steach do dhachaigh nan Mitchell gus an deach an taighean fhèin a thogail.

Ro 1850, bha luchd-tuineachaidh à Sasainn Nuadh air com-pàirteachadh leis an teaghlaichean Albannach tùsail seo gus sràidean Argyle a dhealbhadh gu foirmeil.

A' Ghàidhlig an seo
Cha do ghabh a' Ghàidhlig freumh ann an Argyle. An àite na coimhearsnachdan Gàidhlig nas motha agus nas maireannaiche ann an àiteachan mar North Carolina no Alba Nuadh, bha an fheadhainn a thuinich ann an Argyle ro bheag an àireamh, agus ro luath gan co-mheasgachadh, gus an cànan a chumail beò thar ginealaichean. Cha robh eaglaisean, pàipearan-naidheachd, no sgoiltean Gàidhlig ann an seo — is dòcha gun do thuit an cànan sàmhach taobh a-staigh aon no dhà ghinealach às dèidh dhaibh ruighinn. Chan eil coimhearsnachd ath-bheothachaidh ann an Argyle an-diugh. Tha an t-slighe as fhaisge air ais chun a' chànain a' dol tron sgìre nas fharsainge no air loidhne, chan ann tro institiud ionadail sam bith.`,
  },
  {
    id: 'caledonia-wi',
    name: 'Caledonia',
    region: 'Wisconsin, USA',
    lng: -89.51417,
    lat: 43.48361,
    gaidhlig: 'Alba',
    meaning: 'Caledonia is the Latin name the Romans gave to Scotland; the Gàidhlig name for the country is Alba.',
    why_named: 'A settlers\' tribute to the Scottish homeland — one of several Caledonias scattered across the diaspora.',
    founded: '1839',
    verified: false,
    body_en: `Far a bheil thu / Where you are
You're east of Portage, in the rolling bluff country of Columbia County, where the Wisconsin River bends and turns north. This Caledonia is genuinely what its name promises: the town was named by Scottish settlers after the Latin name for Scotland, and the landscape still carries that imprint — locals call the local hills the Caledonia Bluffs, and the town today is known for the same kind of scenic drives and quiet farmland its first Scottish settlers worked.

Na tha mu do choinneamh / What's around you
The nearest living Scottish cultural calendar runs through the Milwaukee area, about 90 miles southeast:

- Wisconsin Highland Games — Labor Day weekend at the Waukesha County Expo.
- Milwaukee Highland Games — each June at Croatian Park in Franklin.
- Saint Andrew's Society of the City of Milwaukee — the region's main Scottish civil-society group, the usual venue for Burns Night and ceilidh events.
- The Center for Celtic Studies, UW–Milwaukee — though, as elsewhere in the state, its language programming runs through Irish rather than Scottish Gàidhlig.

Closer to home, the Caledonia Historical Society of Columbia County maintains local records, and Durward's Glen, a scenic retreat and conference center within the town itself, is the area's most recognizable landmark — worth a visit even setting the history aside.

Mar a ràinig thu an seo / How you got here
This Caledonia's founding story belongs to a real Scottish emigrant. John Pate was born in 1802 at Brown Castle, in the parish of Culbride, Lanarkshire, Scotland. He married Agnes Stewart in 1837, and in the spring of 1842 the couple sailed from Glasgow aboard the ship Perthshire, a seven-week crossing to America. From New York the journey continued by steamboat, canal, and ox-team, ending on unsurveyed land in what was then called Dekorra, in the Wisconsin Territory — land that would become Section 30, Town of Caledonia, Columbia County.

Pate wasn't alone. The 1880 county history records other Scottish families settling alongside him — names like Douglas, with at least one family tracing back to Crosshouse and Ochiltree in Ayrshire. When the township organized out of Dekorra, Pate became its first Town Chairman, later serving as Supervisor, Assessor, and Town Clerk. He farmed 200 acres until his death in 1879, remained a lifelong member of the Presbyterian Church, and — fittingly — composed music, including a piece called "Caledonia" that, by the time of his death, was still sung in the local Presbyterian congregation he'd helped build.

A' Ghàidhlig an seo / Gàidhlig here
There's no record of Gàidhlig surviving here as a spoken community language. The settlers who founded this Caledonia were Lowland Scots — from Lanarkshire and Ayrshire — regions where Gàidhlig had already receded centuries before emigration, replaced by Scots and English. So the silence of the language in Wisconsin's Caledonia isn't really a story of assimilation erasing Gàidhlig; it's that the language wasn't carried across the Atlantic to begin with by this particular wave of settlers. The Scottish identity that took root here — and it clearly did, deeply, judging by Pate's own life — expressed itself instead through Presbyterian church life, music, and the place-name itself. There is no Gàidhlig revival community in Caledonia today. The nearest paths to the language run through these organizations:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — The Gaelic Council of Nova Scotia
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — The Gaelic College, St. Ann's, Nova Scotia
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
    body_gd: `Far a bheil thu
Tha thu an ear air Portage, ann an dùthaich chnocach Siorrachd Columbia, far a bheil Abhainn Wisconsin a' lùbadh agus a' tionndadh gu tuath. Tha an Caledonia seo dha-rìribh mar a tha an ainm a' gealltainn: chaidh am baile ainmeachadh le luchd-tuineachaidh Albannach an dèidh an seann ainm Laideann airson Alba. Tha am fearann fhathast a' giùlan an dìleab sin — canar Caledonia Bluffs ris na cnuic ionadail, agus tha am baile an-diugh ainmeil airson na h-aon seòrsa de shealladh tlachdmhor agus dùthaich thuathanachais sàmhach air an robh an luchd-tuineachaidh Albannach a' saothrachadh an toiseach.

Na tha mu do choinneamh
Tha am mìosachan cultarail Albannach as fhaisge a' ruith tro sgìre Milwaukee, mu 90 mìle an ear-dheas:

- Geamannan Gàidhealach Wisconsin — deireadh-seachdain Latha an Luchd-obrach, aig Ionad-falbhain Siorrachd Waukesha.
- Geamannan Gàidhealach Milwaukee — anns an Ògmhios gach bliadhna, aig Croatian Park, Franklin.
- Comann Naoimh Anndra, Milwaukee — am prìomh chomann sìobhalta Albannach san sgìre.
- Ionad Eòlas Ceilteach, Oilthigh Wisconsin-Milwaukee — ged a tha am prògram cànain ann Èireannach seach Gàidhlig na h-Alba, mar a tha air feadh na stàite.

Nas fhaisge air an taigh, tha Comann Eachdraidh Caledonia, Siorrachd Columbia a' cumail clàran ionadail, agus tha Durward's Glen, ionad-fasgaidh agus co-labhairt a tha taobh a-staigh a' bhaile fhèin, mar an comharra as ainmeile san sgìre.

Mar a ràinig thu an seo
Buinidh sgeulachd stèidheachaidh a' Chaledonia seo do dh'eilthireach Albannach fìor. Rugadh John Pate ann an 1802 aig Brown Castle, ann am paraiste Culbride, Siorrachd Lanark, Alba. Phòs e Agnes Stewart ann an 1837, agus as t-earrach 1842 sheòl an càraid bho Ghlaschu air bòrd na soithich Perthshire, turas seachd seachdainean a-null thairis a dh'Ameireaga. Bho New York chaidh an turas air adhart le bàta-smùid, canàl, agus damh-chairt, a' tighinn gu ceann air fearann gun tomhas anns an Diùc-thabhachd Wisconsin, ris an canar Dekorra aig an àm — fearann a thàinig gu bhith na Earrann 30, Baile Caledonia, Siorrachd Columbia.

Cha robh Pate na aonar. Tha eachdraidh siorrachd 1880 a' clàradh teaghlaichean Albannach eile a thuinich ri thaobh — ainmean mar Douglas, le co-cheangal aig teaghlach dhiubh ri Crosshouse agus Ochiltree ann an Siorrachd Ayr. Nuair a chaidh am baile a chur air dòigh bho Dekorra, b' e Pate an Cathraiche Baile an toiseach, agus an dèidh sin Maoir-roinne, Measadair, agus Clàrc Baile. Bha e na thuathanach air 200 acair gus a bhàsachadh ann an 1879, bha e na bhall den Eaglais Phreasbaiteireach fad a bheatha, agus — gu freagarrach — rinn e ceòl, a' gabhail a-steach pìos air an robh "Caledonia," a bha, ron àm a bhàis, fhathast air a sheinn anns an Eaglais Phreasbaiteireach ionadail a chuidich e a thogail.

A' Ghàidhlig an seo
Chan eil clàr ann gun do mhair a' Ghàidhlig an seo mar chànan coimhearsnachd labhairteach. B' e Gallta Albannach a bha anns an luchd-tuineachaidh a stèidhich an Caledonia seo — bho Siorrachd Lanark agus Siorrachd Ayr, sgìrean far an robh a' Ghàidhlig air a dhol air ais o chionn linntean ron eilthireachd, agus Beurla na h-Alba (Scots) agus Sasannach air tighinn na h-àite. Mar sin, chan eil sàmhchair a' chànain ann an Caledonia, Wisconsin, dha-rìribh na sgeulachd de cho-mheasgachadh a' dubhadh às na Gàidhlig; tha e dha-rìribh nach deach an cànan a ghiùlan thairis air a' Chuan Siar leis an tonn shònraichte seo de luchd-tuineachaidh. Nochd an dearbh-aithne Albannach a ghabh freumh an seo e fhèin tro bheatha-eaglais Phreasbaiteireach, ceòl, agus ainm an àite fhèin. Chan eil coimhearsnachd ath-bheothachaidh Gàidhlig ann an Caledonia an-diugh. Tha na slighean as fhaisge chun a' chànain a' dol tro na buidhnean seo:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — Comhairle na Gàidhlig Alba Nuadh
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — An Colaisde Gàidhealach, St. Ann's, Alba Nuadh
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
  },
  {
    id: 'rock-prairie-wi',
    name: 'Rock Prairie',
    region: 'Wisconsin, USA',
    lng: -88.8750,
    lat: 42.6991,
    gaidhlig: 'Rèidhlean na Creige',
    meaning: '"Rèidhlean na Creige" — "the prairie of the rock"; named for the limestone outcrops on the open prairie of southern Wisconsin.',
    why_named: 'Historic Scottish settlement in Rock County, just south of Janesville; the Rock Prairie community was settled by Scottish immigrants in the 1840s and anchored by a mid-19th-century Presbyterian congregation.',
    founded: null,
    verified: false,
    body_en: `Far a bheil thu / Where you are
You're on the open farmland east of Janesville, in Rock County's Rock Prairie — flat, fertile country that drew settlers for exactly the reason its name suggests. This is one of the genuinely confirmed Scottish settlements in Wisconsin: a 1908 county history records the area as home to farmers from New England and "some industrious Scotch, English and German immigrants," and the Wisconsin Historical Society itself holds a record describing Rock Prairie directly as the "home of Scotch." The Scottish presence here wasn't an isolated household — it was substantial enough to leave behind a church that's still standing and still active nearly two centuries later.

Na tha mu do choinneamh / What's around you
The clearest living trace of the Scottish settlement is the church itself:

- Rock Prairie Presbyterian Church — 8605 E. County Hwy A, Janesville, WI 53545. A working congregation today, this church is the direct institutional descendant of the original Scottish settlers' place of worship.
- Rock County Genealogical Society — holds family records for the area's Scottish settler families, including documented lines such as Morton, Barclay, Gentle, McArthur, Gow, Wilson, Barlass, Kyle, and Harvey.
- The 1879 History of Rock County, Wisconsin — digitized and searchable through the Wisconsin Historical Society and Internet Archive, the primary historical source for the area's settlement record.

Wider afield, Wisconsin's main living Scottish cultural calendar runs through Milwaukee, about 70 miles northeast:

- Wisconsin Highland Games — Labor Day weekend, Waukesha County Expo.
- Milwaukee Highland Games — each June at Croatian Park, Franklin.
- Saint Andrew's Society of the City of Milwaukee — the region's main Scottish civil-society group.

A note on the name: you may see this place referred to elsewhere as "Scotch Grove." That name actually belongs to a different, separate Scottish settlement in Jones County, Iowa, founded by Highland families who migrated overland from the Red River Colony in 1837. It's a distinct community with its own history — not this one — so we've kept this entry under its correct and confirmed name, Rock Prairie.

Mar a ràinig thu an seo / How you got here
The specific founding story here is still being verified — the names most often associated with this settlement (families like Graham, MacFarlane, and Culbertson) appear in some secondary accounts, but haven't yet been confirmed against the primary 1879 county history. What is solidly confirmed is the broader pattern: Scottish families settled Rock Prairie alongside New England Yankees, in numbers substantial enough to be remembered specifically as a Scottish community by local historians, and to sustain a Presbyterian congregation that has now served the area for well over a century.

A' Ghàidhlig an seo / Gàidhlig here
There's no record of Gàidhlig surviving here as a spoken community language. As with Wisconsin's other Scottish settlements, the available evidence points to Lowland Scots and Presbyterian church life as the carriers of identity here, rather than the Gaelic language itself — though this hasn't yet been confirmed in the same depth as other entries, and is worth revisiting if more genealogical detail on the original families' regional origins in Scotland comes to light. There is no Gàidhlig revival community in Rock Prairie today. The nearest paths to the language run through these organizations:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — The Gaelic Council of Nova Scotia
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — The Gaelic College, St. Ann's, Nova Scotia
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
    body_gd: `Far a bheil thu
Tha thu air an fhearann fosgailte fosgailte an ear air Janesville, ann am Rock Prairie, Siorrachd Rock — dùthaich rèidh, torrach a tharraing luchd-tuineachaidh air an aon adhbhar a tha an ainm a' moladh. Is e seo aon de na tuineachaidhean Albannach a tha gu fìor dearbhte ann an Wisconsin: tha eachdraidh siorrachd 1908 a' clàradh na sgìre seo mar dhachaigh do thuathanaich à Sasainn Nuadh agus cuid de dh'eilthirich Albannach, Sasannach, agus Gearmailteach dìcheallach, agus tha Comann Eachdraidh Wisconsin fhèin a' cumail clàr a tha a' toirt cunntas air Rock Prairie mar "dhachaigh nan Albannach." Cha b' e dachaigh aonaranach a bha an làthaireachd Albannach an seo — bha i mòr gu leòr gus eaglais fhàgail air dheireadh a tha fhathast na seasamh agus fhathast gnìomhach faisg air dà linn an dèidh sin.

Na tha mu do choinneamh
Is e an eaglais fhèin an comharra as fhollaisiche air an tuineachadh Albannach:

- Eaglais Phreasbaiteireach Rock Prairie — 8605 E. County Hwy A, Janesville, WI 53545. Coitheanal gnìomhach an-diugh, is e an eaglais seo dìreach sliochd institiudach an àite adhraidh aig na tuineachaidhean Albannach tùsail.
- Comann Sloinntearachd Siorrachd Rock — a' cumail clàran teaghlaich airson teaghlaichean tuineachaidh Albannach na sgìre, a' gabhail a-steach loidhnichean clàraichte mar Morton, Barclay, Gentle, McArthur, Gow, Wilson, Barlass, Kyle, agus Harvey.
- Eachdraidh Siorrachd Rock, 1879 — air a sgrìobhadh gu didseatach agus rannsachail tro Chomann Eachdraidh Wisconsin agus Internet Archive, am prìomh stòr eachdraidheil airson clàr tuineachaidh na sgìre.

Nas fhaide air falbh, tha mìosachan cultarail Albannach as motha Wisconsin a' ruith tro Milwaukee, mu 70 mìle an ear-thuath:

- Geamannan Gàidhealach Wisconsin — deireadh-seachdain Latha an Luchd-obrach, Ionad-falbhain Siorrachd Waukesha.
- Geamannan Gàidhealach Milwaukee — anns an Ògmhios gach bliadhna, aig Croatian Park, Franklin.
- Comann Naoimh Anndra, Milwaukee — am prìomh chomann sìobhalta Albannach san sgìre.

Aire mun ainm: dh'fhaodadh tu am baile seo fhaicinn air ainmeachadh ann an àiteachan eile mar "Scotch Grove." Buinidh an ainm sin dha-rìribh do thuineachadh Albannach eile, fa leth, ann an Siorrachd Jones, Iowa, a chaidh a stèidheachadh le teaghlaichean Gàidhealach a rinn eilthireachd thar-thìreach bhon Choloinidh Abhainn Dheirg ann an 1837. Is e coimhearsnachd fa leth a tha sin le a h-eachdraidh fhèin — chan e seo — mar sin chumadh sinn an t-iomradh seo fon ainm cheart agus dearbhte aige, Rock Prairie.

Mar a ràinig thu an seo
Tha an sgeulachd stèidheachaidh shònraichte an seo fhathast a dhol fo dheuchainn — na h-ainmean as motha co-cheangailte ris an tuineachadh seo (teaghlaichean mar Graham, MacFarlane, agus Culbertson) a' nochdadh ann an cuid de chunntasan dàrnach, ach gun a bhith dearbhte fhathast an aghaidh eachdraidh siorrachd phrìomhach 1879. Is e na tha dearbhte gu math: thuinich teaghlaichean Albannach ann an Rock Prairie ri taobh Iancaich Sasainn Nuadh, ann an àireamhan mòr gu leòr gus a bhith air an cuimhneachadh gu sònraichte mar choimhearsnachd Albannach le luchd-eachdraidh ionadail, agus gus coitheanal Preasbaiteireach a chumail suas a tha air seirbheis a thoirt don sgìre airson còrr is linn.

A' Ghàidhlig an seo
Chan eil clàr ann gun do mhair a' Ghàidhlig an seo mar chànan coimhearsnachd labhairteach. Mar a tha le tuineachaidhean Albannach eile Wisconsin, tha an fhianais a tha ri fhaighinn a' comharrachadh gu Gallta Albannach agus beatha-eaglais Phreasbaiteireach mar luchd-giùlain dearbh-aithne an seo, seach a' Ghàidhlig fhèin — ged nach eil seo air a dhearbhadh fhathast cho domhainn ri tachartasan eile, agus is fhiach ath-bheachdachadh air ma thig barrachd mion-fhiosrachaidh sloinntearachd air freumhan roinneil nan teaghlaichean tùsail ann an Alba am follais. Chan eil coimhearsnachd ath-bheothachaidh Gàidhlig ann an Rock Prairie an-diugh. Tha na slighean as fhaisge chun a' chànain a' dol tro na buidhnean seo:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — Comhairle na Gàidhlig Alba Nuadh
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — An Colaisde Gàidhealach, St. Ann's, Alba Nuadh
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
  },
  {
    id: 'milwaukee-wi',
    name: 'Milwaukee',
    region: 'Wisconsin, USA',
    lng: -87.9240,
    lat: 43.0397,
    gaidhlig: 'Milwaukee',
    meaning: '"Milwaukee" is from an Algonquian (Potawatomi / Ojibwe) root meaning "good / pleasant land" or "gathering place by the water"; there is no traditional Gàidhlig name for the city.',
    why_named: 'Wisconsin\'s largest city and the regional centre for Scottish-American cultural life — home to the Wisconsin and Milwaukee Highland Games, the Saint Andrew\'s Society of the City of Milwaukee, and UW-Milwaukee\'s Center for Celtic Studies.',
    founded: '1846',
    verified: false,
    body_en: `Far a bheil thu / Where you are
You're in Milwaukee, on the shore of Lake Michigan — the largest city in Wisconsin, and the place where the state's Scottish story actually has its deepest roots, even though it's easy to overlook in favor of the smaller, more visibly "Scottish-named" towns inland. Scots were never a large share of Milwaukee's population — fewer than 2,000 people in the metropolitan area claimed Scottish birth as late as 1880 — but they built something disproportionate to their numbers: banks, churches, sporting clubs, and a charitable society still running today, more than 165 years on.

Na tha mu do choinneamh / What's around you
Milwaukee carries the most active, continuously-running Scottish institutional life anywhere in the state:

- [Saint Andrew's Society of the City of Milwaukee](https://saintandrewsmilwaukee.org) — founded in 1859, the city's oldest Scottish institution, hosting an annual Burns Night banquet and ongoing charitable work.
- [Caledonian Scottish Dancers](https://caledonianscottishdancers.com) — founded in 1966, performing Highland and National dance at festivals throughout the Midwest and on tours of Scotland itself.
- [Milwaukee Scottish Country Dancers](https://milwaukeescd.org) — an active social dancing group affiliated with the Royal Scottish Country Dance Society, with weekly classes open to all.
- [Milwaukee Highland Games](https://milwaukeehighlandgames.org) — held each June at Croatian Park in Franklin.
- The Wisconsin Club / Alexander Mitchell Mansion — 900 W Wisconsin Avenue, the standing physical monument to Milwaukee's most prominent Scottish immigrant, and still the regular venue for Saint Andrew's Society events today.
- The Center for Celtic Studies, UW–Milwaukee — though, as elsewhere in the state, its language instruction runs through Irish rather than Scottish Gàidhlig.

Mar a ràinig thu an seo / How you got here
Milwaukee's first permanent Scottish settler arrived in 1835: James Murray, a painter, glazier, and real estate broker who helped found the city's First Presbyterian Church. Four years later, in 1839, a young Alexander Mitchell arrived from Scotland and went on to become one of the most consequential figures in the city's history — eventually running the Chicago, Milwaukee & St. Paul Railway, managing the Wisconsin Marine and Fire Insurance Company bank, serving two terms in Congress, and amassing a fortune estimated at $20 million. The mansion he built still stands today as the Wisconsin Club.

The community organized early and stayed organized. In the early 1840s, Scots took up curling on the frozen Milwaukee River, founding the Milwaukee Curling Club in 1845 with Murray as its first president. In March 1847, Mitchell rallied the local Scottish community to raise relief funds for famine victims back in Scotland — a campaign that, twelve years later, grew into the formal founding of the Saint Andrew's Society of the City of Milwaukee on January 25, 1859, dedicated to relief and mutual support for Scots and their descendants. That society is still active today.

By the early 20th century, Scottish ancestry in metropolitan Milwaukee was a modest but stable presence — fewer than 2,500 people claiming Scottish birth by 1930 — yet by the most recent census estimates, roughly 15,000 people in the metro area report Scottish ancestry, a legacy far larger than the original immigrant numbers alone would suggest.

A' Ghàidhlig an seo / Gàidhlig here
Milwaukee's Scots were overwhelmingly Lowland and urban — bankers, tradesmen, and Presbyterians rather than Highland Gaelic-speaking communities of the kind that settled, say, Cape Breton or parts of North Carolina. There's no record of Gàidhlig ever taking root here as a living, spoken community language. The cultural continuity that did take hold — curling, Burns Night, Highland dance, civic philanthropy — runs through institutions and performance traditions rather than language. There is no Gàidhlig revival community in Milwaukee today. The nearest paths to the language run through these organizations:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — The Gaelic Council of Nova Scotia
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — The Gaelic College, St. Ann's, Nova Scotia
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
    body_gd: `Far a bheil thu
Tha thu ann am Milwaukee, air cladach Lake Michigan — am baile as motha ann an Wisconsin, agus an àite far a bheil na freumhaichean as motha de sgeulachd Albannach na stàite, ged a tha e furasta a leigeil seachad airson na bailtean nas lugha, nas fhollaisiche "Albannach" am broinn na stàite. Cha robh na h-Albannaich a-riamh nam pàirt mhòr de shluagh Milwaukee — nas lugha na 2,000 neach anns a' mheatropoliotan a thuirt gun deach am breith ann an Alba mu 1880 — ach thog iad rudeigin nach robh a' freagairt ris an àireamh sin: bancaichean, eaglaisean, clubaichean spòrs, agus comann carthannas a tha fhathast a' ruith an-diugh, còrr is 165 bliadhna an dèidh sin.

Na tha mu do choinneamh
Tha am beatha institiudach Albannach as gnìomhaiche agus as buan ann an Wisconsin gu lèir ann am Milwaukee:

- [Comann Naoimh Anndra, Baile Milwaukee](https://saintandrewsmilwaukee.org) — air a stèidheachadh ann an 1859, an institiud Albannach as sine sa bhaile, a' cumail cuirm Burns bliadhnail agus obair charthannais leantainneach.
- [Dannsairean Albannach Caledonian](https://caledonianscottishdancers.com) — air a stèidheachadh ann an 1966, a' cluich dannsa Gàidhealach is Nàiseanta aig fèilltean air feadh Meadhan-Iar nan Stàitean agus air chuairtean ann an Alba fhèin.
- [Dannsairean Dùthchail Albannach Milwaukee](https://milwaukeescd.org) — buidheann dannsa sòisealta gnìomhach co-cheangailte ri Comann Rìoghail Dannsa Dùthchail na h-Alba, le clasaichean seachdaineil fosgailte do gach neach.
- [Geamannan Gàidhealach Milwaukee](https://milwaukeehighlandgames.org) — air an cumail anns an Ògmhios gach bliadhna aig Croatian Park, Franklin.
- An Wisconsin Club / Taigh-mòr Alexander Mitchell — 900 W Wisconsin Avenue, an carragh-cuimhne corporra a tha na sheasamh airson eilthireach Albannach as ainmeile Milwaukee, agus fhathast na àite cumanta airson tachartasan Comann Naoimh Anndra an-diugh.
- Ionad Eòlas Ceilteach, Oilthigh Wisconsin-Milwaukee — ged a tha am prògram cànain ann Èireannach seach Gàidhlig na h-Alba, mar a tha air feadh na stàite.

Mar a ràinig thu an seo
Ràinig a' chiad neach-tuineachaidh Albannach maireannach Milwaukee ann an 1835: James Murray, peantair, glainneadair, agus broker seilbh-fhearainn a chuidich le stèidheachadh Ciad Eaglais Phreasbaiteireach a' bhaile. Ceithir bliadhna às a dhèidh, ann an 1839, ràinig Alexander Mitchell òg à Alba, agus thàinig e gu bhith mar aon de na duine as buaidh-mhoire ann an eachdraidh a' bhaile — fa-dheòidh a' ruith Companaidh Rèile Chicago, Milwaukee & St. Paul, a' stiùireadh banca Companaidh Àrachais Mara is Teine Wisconsin, a' frithealadh dà theirm sa Chòmhdhail, agus a' cruinneachadh fortan air a mheas aig $20 millean. Tha an taigh-mòr a thog e fhathast na sheasamh an-diugh mar an Wisconsin Club.

Chuir a' choimhearsnachd dòigh-obrachaidh air dòigh tràth, agus dh'fhan iad eagraichte. Anns na 1840an tràth, ghabh Albannaich ri curladh air Abhainn Milwaukee reòta, a' stèidheachadh Club Curladh Milwaukee ann an 1845 le Murray mar a' chiad cheann-suidhe. Sa Mhàrt 1847, chuir Mitchell a' choimhearsnachd Albannach ionadail air dòigh gus airgead-faochaidh a thogail airson luchd-fulang gort ann an Alba — iomairt a dh'fhàs, dusan bliadhna às a dhèidh, gu bhith na stèidheachadh foirmeil Comann Naoimh Anndra, Baile Milwaukee, air 25 Faoilleach 1859, coisrigte do dh'fhaochadh agus taic dha chèile do dh'Albannaich agus an sliochd. Tha an comann sin fhathast gnìomhach an-diugh.

Ron 20mh linn tràth, bha sloinneadh Albannach ann am metropoliotan Milwaukee na làthaireachd chiùin ach seasmhach — nas lugha na 2,500 neach a' tagradh breith Albannach ro 1930 — ach a-rèir an cunntais-sluaigh as ùire, tha mu 15,000 neach anns a' mheatropoliotan ag aithris sloinneadh Albannach, dìleab fada nas motha na na h-àireamhan eilthireach tùsail leotha fhèin a chomharraicheas.

A' Ghàidhlig an seo
Bha Albannaich Milwaukee gu mòr Gallta is bailteil — bancairean, ceàirdean, agus Preasbaiteirich seach coimhearsnachdan Gàidhealach a bha a' bruidhinn Gàidhlig den t-seòrsa a thuinich, can, ann an Eilean Cheap Breatainn no ann am pàirtean de North Carolina. Chan eil clàr ann gun do ghabh a' Ghàidhlig freumh an seo a-riamh mar chànan beò, labhairteach coimhearsnachd. Tha an leantainneachd chultarach a thug seasamh — curladh, Oidhche Burns, dannsa Gàidhealach, gràdh-cathrach catharra — a' dol tro institiudan agus traidiseanan cluiche seach cànan. Chan eil coimhearsnachd ath-bheothachaidh Gàidhlig ann am Milwaukee an-diugh. Tha na slighean as fhaisge chun a' chànain a' dol tro na buidhnean seo:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — Comhairle na Gàidhlig Alba Nuadh
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — An Colaisde Gàidhealach, St. Ann's, Alba Nuadh
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
  },
  {
    id: 'scotch-lane-wi',
    name: 'Scotch Lane',
    region: 'Wisconsin, USA',
    lng: -89.6275,
    lat: 42.9649,
    gaidhlig: 'Lòn nan Albannach',
    meaning: '"Lòn nan Albannach" — "lane of the Scots."',
    why_named: 'A surviving place-name fragment marking a Scottish settler presence in Dane County, Wisconsin.',
    founded: null,
    verified: false,
    body_en: `Far a bheil thu / Where you are
You're on the Military Ridge in Dane County, in the farmland straddling Springdale and Verona Townships near the small community of Mount Vernon — country still locally remembered as "Scotch Lane." Unlike most of the places GlobalCeilidh has covered so far in Wisconsin, this isn't a single named town or a place-name riding on borrowed Scottish heritage. It's a genuine rural settlement, founded directly by Highland Scots fleeing the Clearances, that held together as a recognizable community for decades.

Na tha mu do choinneamh / What's around you
The clearest living trace of the settlement is the historical marker itself, and the small cemetery it stands beside:

- Pioneer Scottish Settlement Historical Marker — at the intersection of County Road G and County Road J, near Mount Vernon, Dane County. Erected in 1996 by the Dane County Historical Society.
- The Pioneer Scottish Cemetery — adjacent to the marker, the resting place of some of the original Scotch Lane settlers.
- Dane County Historical Society — the institution responsible for documenting and preserving this site's history.

Wider afield, Wisconsin's main living Scottish cultural calendar runs through Milwaukee, about 75 miles east:

- [Saint Andrew's Society of the City of Milwaukee](https://saintandrewsmilwaukee.org)
- [Milwaukee Highland Games](https://milwaukeehighlandgames.org)
- [Wisconsin Highland Games](https://wisconsinscottish.org)
- [Caledonian Scottish Dancers](https://caledonianscottishdancers.com)

Closer to home, Madison — about 20 miles northeast — is the nearest urban hub, home to the Wisconsin Historical Society, which holds much of the documentary record relevant to this settlement.

Mar a ràinig thu an seo / How you got here
The Scotch Lane story begins with the Highland Clearances. As the historical marker records, "Highland Clearances" and 300% hikes in farm rent prompted many Scottish farmers to sail to America in the mid-1800s. Displaced Scots settled on both sides of the Military Ridge, in Springdale and Verona Townships, in a community that became known locally — simply, descriptively — as Scotch Lane.

This was not a small or fleeting settlement. By 1870, nearly 100 families had put down roots here. The community built the institutions that mark a settlement intending to stay: a Presbyterian church, a post office, and two schools — the Henderson School and the McPherson/McGregor School. Some of the earliest settlers are buried in what the marker calls the early "Scottish Cemetery," which still exists today beside the historical marker itself.

The community didn't just survive — it produced people of real consequence in Wisconsin public life. Members of Scotch Lane went on to serve as county board chairmen (James McPherson and Frank Stewart), state legislators (Thomas Stewart, John Stewart, and Joseph Henderson), and even as State Senator and Wisconsin Secretary of State (John S. Donald, later remembered as the "Father of Wisconsin's Good Roads Law"). For a rural farming community of Highland refugees, that's a remarkable civic legacy.

As is common in the long arc of American immigrant settlement, the community gradually changed hands. In later years, neighboring Swiss, German, and Norwegian families acquired many of the original Scotch Lane farms, and few Scottish descendants remain on the home soil today. What remains is the marker, the cemetery, and the name that locals still use for the road.

A' Ghàidhlig an seo / Gàidhlig here
There's no record of Gàidhlig surviving in Scotch Lane as a spoken community language today, though the settlers who founded it were genuinely Highland refugees of the Clearances — the population most associated, historically, with the Gaelic-speaking parts of Scotland. Whether the original Scotch Lane families themselves spoke Gàidhlig on arrival, or had already shifted to English before emigrating, hasn't been confirmed against a primary source, and is worth investigating further given how directly tied this community is to the Clearances themselves. What is certain is that no Gàidhlig-speaking institution — church, school, or newspaper — survived here into the 20th century, and there is no Gàidhlig revival community in the area today. The nearest paths to the language run through these organizations:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — The Gaelic Council of Nova Scotia
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — The Gaelic College, St. Ann's, Nova Scotia
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
    body_gd: `Far a bheil thu
Tha thu air Military Ridge ann an Siorrachd Dane, ann an dùthaich thuathanachais a tha a' sìneadh thairis air Sgìrean Springdale agus Verona faisg air a' choimhearsnachd bheag Mount Vernon — dùthaich air a bheil cuimhne ionadail fhathast mar "Scotch Lane." An àite a' mhòrchuid de na h-àiteachan a tha GlobalCeilidh air a chòmhdach gu seo ann an Wisconsin, chan e seo aon bhaile ainmichte no ainm-àite a tha a' marcachd air dìleab Albannach iasaidte. Is e tuineachadh dùthchail fìor a tha seo, air a stèidheachadh gu dìreach le Gàidheil a theich bho na Fuadaichean, a chùm còmhla mar choimhearsnachd ri fhaicinn airson deicheadan.

Na tha mu do choinneamh
Is e a' chomharra eachdraidheil fhèin, agus an cladh beag ri a thaobh, an comharra as fhollaisiche air an tuineachadh:

- Comharra Eachdraidheil an Tuineachaidh Tùsail Albannach — aig crois Rathad Siorrachd G agus Rathad Siorrachd J, faisg air Mount Vernon, Siorrachd Dane. Air a chur suas ann an 1996 le Comann Eachdraidh Siorrachd Dane.
- An Cladh Tùsail Albannach — ri taobh na comharra, an t-ionad-tàmh aig cuid de na tuineachaidhean Scotch Lane tùsail.
- Comann Eachdraidh Siorrachd Dane — an institiud a tha an urra ri eachdraidh an làraich seo a chlàradh agus a ghleidheadh.

Nas fhaide air falbh, tha mìosachan cultarail Albannach as motha Wisconsin a' ruith tro Milwaukee, mu 75 mìle an ear:

- [Comann Naoimh Anndra, Baile Milwaukee](https://saintandrewsmilwaukee.org)
- [Geamannan Gàidhealach Milwaukee](https://milwaukeehighlandgames.org)
- [Geamannan Gàidhealach Wisconsin](https://wisconsinscottish.org)
- [Dannsairean Albannach Caledonian](https://caledonianscottishdancers.com)

Nas fhaisge air an taigh, tha Madison — mu 20 mìle an ear-thuath — an ionad bailteil as fhaisge, dachaigh do Chomann Eachdraidh Wisconsin, a tha a' cumail mòran den chlàr sgrìobhte co-cheangailte ris an tuineachadh seo.

Mar a ràinig thu an seo
Tha sgeulachd Scotch Lane a' tòiseachadh leis na Fuadaichean Gàidhealach. Mar a tha a' chomharra eachdraidheil a' clàradh, bhrosnaich na "Fuadaichean Gàidhealach" agus àrdachaidhean cìse-fearainn de 300% mòran tuathanaich Albannach gu seòladh a dh'Ameireaga ann am meadhan an 19mh linn. Thuinich Albannaich fuadaichte air an dà thaobh de Military Ridge, ann an Sgìrean Springdale agus Verona, ann an coimhearsnachd a thàinig gu bhith ainmeil gu ionadail — gu sìmplidh, gu tuairisgeulach — mar Scotch Lane.

Cha b' e tuineachadh beag no gun bhuan a bha seo. Ro 1870, bha faisg air 100 teaghlach air freumhan a thogail an seo. Thog a' choimhearsnachd na institiudan a chomharraicheas tuineachadh le rùn fuireach: eaglais Phreasbaiteireach, oifis-puist, agus dà sgoil — Sgoil Henderson agus Sgoil McPherson/McGregor. Tha cuid de na tuineachaidhean as tràithe air an tiodhlacadh anns na tha a' chomharra a' gabhail "Cladh Albannach" tràth, a tha fhathast ann an-diugh ri taobh na comharra eachdraidheil fhèin.

Cha do mhair a' choimhearsnachd a-mhàin — thug i a-mach daoine de bhuaidh fìor ann am beatha phoblach Wisconsin. Chaidh buill Scotch Lane air adhart gu bhith nan cathraichean bòrd siorrachd (James McPherson agus Frank Stewart), neach-reachdaiche stàite (Thomas Stewart, John Stewart, agus Joseph Henderson), agus eadhon mar Sheanadair Stàite agus Rùnaire Stàite Wisconsin (John S. Donald, air a chuimhneachadh às dèidh sin mar "Athair Lagh Rathaidean Math Wisconsin"). Airson coimhearsnachd thuathanachais dùthchail de dh'fhògarraich Gàidhealach, is e dìleab catharra ainmeil a tha sin.

Mar as cumanta ann an cuairt fhada tuineachadh in-imrich Ameireaganach, dh'atharraich a' choimhearsnachd làmhan mean air mhean. Anns na bliadhnaichean an dèidh sin, cheannaich teaghlaichean Eilbheiseach, Gearmailteach, agus Nirribheach faisg air làimh mòran de na tuathanasan Scotch Lane tùsail, agus tha glè bheag de shliochd Albannach a' fuireach air an talamh dachaigh an-diugh. Is e na tha air fhàgail a' chomharra, an cladh, agus an ainm air am bheil muinntir an àite fhathast a' cleachdadh airson an rathaid.

A' Ghàidhlig an seo
Chan eil clàr ann gun do mhair a' Ghàidhlig ann an Scotch Lane mar chànan coimhearsnachd labhairteach an-diugh, ged a b' e fògarraich Ghàidhealach fìor nan Fuadaichean a bha anns an luchd-tuineachaidh a stèidhich e — an t-sluagh as motha co-cheangailte, gu h-eachdraidheil, ri pàirtean Gàidhlig-bruidhneach na h-Alba. Nach do bhruidhinn na teaghlaichean Scotch Lane tùsail fhèin Gàidhlig nuair a ràinig iad, no an robh iad air gluasad gu Beurla mus do dh'fhalbh iad — chan eil seo dearbhte fhathast an aghaidh prìomh stòir, agus is fhiach a rannsachadh nas fhaide leis cho dìreach 's a tha a' choimhearsnachd seo co-cheangailte ris na Fuadaichean fhèin. Is e na tha cinnteach nach do mhair institiud Gàidhlig-bruidhneach sam bith — eaglais, sgoil, no pàipear-naidheachd — an seo a-steach don 20mh linn, agus chan eil coimhearsnachd ath-bheothachaidh Gàidhlig san sgìre an-diugh. Tha na slighean as fhaisge chun a' chànain a' dol tro na buidhnean seo:

- [GlobalCeilidh](https://globalceilidh.com)
- [Comhairle na Gàidhlig](https://gaelic.ca) — Comhairle na Gàidhlig Alba Nuadh
- [Colaisde na Gàidhlig](https://gaeliccollege.edu) — An Colaisde Gàidhealach, St. Ann's, Alba Nuadh
- [Slighe nan Gàidheal](https://slighe.org)
- [An Comunn Gàidhealach Ameireaganach (ACGA)](https://acgamerica.org)`,
  },
  {
    id: 'decorah-prairie-wi',
    name: 'Decorah Prairie',
    region: 'Wisconsin, USA',
    lng: -91.2854,
    lat: 44.0816,
    gaidhlig: 'Rèidhlean Decorah',
    meaning: '"Decorah" honours the Ho-Chunk (Winnebago) leader Wau-kon-haw-kaw, known as Decorah; the "Prairie" describes the open land. There is no traditional Gàidhlig name for this place.',
    why_named: 'Open-prairie settlement area in Trempealeau County, western Wisconsin, near the Mississippi River.',
    founded: null,
    verified: false,
  },
  {
    id: 'glencoe-mn',
    name: 'Glencoe',
    region: 'Minnesota, USA',
    lng: -94.1517,
    lat: 44.7691,
    gaidhlig: 'Gleann Comhann',
    meaning: '"The glen of the River Coe" — the glen of the 1692 massacre.',
    why_named: 'Named in 1855 for Glen Coe in Scotland by founding settler Martin McLeod.',
    founded: '1855',
    verified: false,
  },
  {
    id: 'inverness-ca',
    name: 'Inverness',
    region: 'California, USA',
    lng: -122.8580,
    lat: 38.1010,
    gaidhlig: 'Inbhir Nis',
    meaning: '"Mouth of the River Ness."',
    why_named: 'Founded on Tomales Bay in 1889 by James Shafter, a Scottish-American attorney who said the landscape reminded him of the Highlands.',
    founded: '1889',
    verified: false,
  },
  {
    id: 'glengarry-on',
    name: 'Glengarry',
    region: 'Ontario, Canada',
    lng: -74.6400,
    lat: 45.3800,
    gaidhlig: 'Gleann Garadh',
    meaning: '"The glen of the River Garry."',
    why_named: 'Named for Glen Garry in Inverness-shire, the seat of Clann Dòmhnaill of Glengarry. Settled from 1784 onward by Highland Loyalists who came up from the Mohawk Valley, then by waves of direct emigrants from Knoydart and Glengarry itself — the densest Gàidhlig-speaking county in 19th-century Canada.',
    founded: '1784',
    verified: false,
  },
  {
    id: 'iona-ns',
    name: 'Iona',
    region: 'Nova Scotia, Canada',
    lng: -60.7937,
    lat: 45.9603,
    gaidhlig: 'Ì (Ì Chaluim Chille)',
    meaning: '"The (yew) island" — the second form means "Iona of Columba" after the saint.',
    why_named: "Named for the holy isle of Iona off Mull, the cradle of Gaelic Christianity. Sits on the Bras d'Or Lake at the heart of Cape Breton's Gàidhlig-speaking belt; home to the Highland Village Museum / Baile nan Gàidheal.",
    founded: '~1820s',
    verified: false,
  },

  // ────────────────────────────────────────────────────────────────
  // US — Alabama through Michigan
  // First batch from the Gàidhlig-named US towns doc (2026-06-20).
  // All entries verified: false pending native-speaker review.
  // ────────────────────────────────────────────────────────────────

  // Alabama
  {
    id: 'lenox-al',
    name: 'Lenox',
    region: 'Alabama, USA',
    lng: -86.9869,
    lat: 31.2898,
    gaidhlig: 'Leamhnach',
    meaning: '"Leamhnach" — "place of elms" (leamhan); the Gàidhlig name for the Lennox region around Loch Lomond.',
    why_named: 'Named for the Lennox region of Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcintosh-al',
    name: 'McIntosh',
    region: 'Alabama, USA',
    lng: -88.0264,
    lat: 31.2649,
    gaidhlig: 'Baile ’ic an Tòisich',
    meaning: '"Settlement of MacIntosh" — Mac an Tòisich, "son of the chief."',
    why_named: 'Named for the McIntosh family who settled the area.',
    founded: null,
    verified: false,
  },
  {
    id: 'mckenzie-al',
    name: 'McKenzie',
    region: 'Alabama, USA',
    lng: -86.7141,
    lat: 31.5388,
    gaidhlig: 'Baile ’icCoinnich',
    meaning: '"Settlement of MacKenzie" — Mac Coinnich, "son of Coinneach (Kenneth)."',
    why_named: 'Named for the MacKenzie family.',
    founded: null,
    verified: false,
  },

  // Alaska
  {
    id: 'houston-ak',
    name: 'Houston',
    region: 'Alaska, USA',
    lng: -149.8181,
    lat: 61.6306,
    gaidhlig: 'Baile Eòghainn',
    meaning: '"Settlement of Eòghann (Hugh / Ewan)" — the Gàidhlig rendering of the surname Houston.',
    why_named: 'Named for Sam Houston of Texas; the Houston surname descends from Houston in Renfrewshire, Scotland.',
    founded: '1966',
    verified: false,
  },
  {
    id: 'point-mackenzie-ak',
    name: 'Point MacKenzie',
    region: 'Alaska, USA',
    lng: -149.9678,
    lat: 61.2375,
    gaidhlig: 'Rubha ’icCoinnich',
    meaning: '"Point of MacKenzie" — rubha = headland / point.',
    why_named: 'Named for Alexander Mackenzie, the Scottish-born fur trader and explorer.',
    founded: null,
    verified: false,
  },

  // Arizona
  {
    id: 'elgin-az',
    name: 'Elgin',
    region: 'Arizona, USA',
    lng: -110.5223,
    lat: 31.6336,
    gaidhlig: 'Eilginn',
    meaning: '"Eilginn" — possibly a Pictish root, sometimes glossed as "little Ireland."',
    why_named: 'Named for Elgin in Moray, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'glendale-az',
    name: 'Glendale',
    region: 'Arizona, USA',
    lng: -112.1860,
    lat: 33.5387,
    gaidhlig: 'Gleann Dail',
    meaning: '"Gleann Dail" — "glen of the dale / meadow."',
    why_named: 'Named in the Scottish "Glen-" pattern by founder William J. Murphy.',
    founded: '1892',
    verified: false,
  },

  // Arkansas
  {
    id: 'mcdougal-ar',
    name: 'McDougal',
    region: 'Arkansas, USA',
    lng: -90.4034,
    lat: 36.4631,
    gaidhlig: 'Baile ’icDhùghaill',
    meaning: '"Settlement of MacDougall" — Mac Dhùghaill, "son of Dùghall (the dark stranger)."',
    why_named: 'Named for the MacDougall family.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcnab-ar',
    name: 'McNab',
    region: 'Arkansas, USA',
    lng: -93.8327,
    lat: 33.8540,
    gaidhlig: 'Baile ’ic an Aba',
    meaning: '"Settlement of MacNab" — Mac an Aba, "son of the abbot."',
    why_named: 'Named for the MacNab family / Clan MacNab.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcneil-ar',
    name: 'McNeil',
    region: 'Arkansas, USA',
    lng: -93.2102,
    lat: 33.3460,
    gaidhlig: 'Baile ’icNìll',
    meaning: '"Settlement of MacNeil" — Mac Nèill, "son of Niall (Neil)."',
    why_named: 'Named for the MacNeil family.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcrae-ar',
    name: 'McRae',
    region: 'Arkansas, USA',
    lng: -91.8246,
    lat: 35.1196,
    gaidhlig: 'Baile ’icRàth',
    meaning: '"Settlement of MacRae" — Mac Ràth, "son of grace / fortune."',
    why_named: 'Named for the MacRae family.',
    founded: null,
    verified: false,
  },

  // California — Inverness, CA already on the map as inverness-ca
  {
    id: 'albany-ca',
    name: 'Albany',
    region: 'California, USA',
    lng: -122.2978,
    lat: 37.8869,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland; Albany comes from the Latinised form.',
    why_named: 'Named in 1908 for Albany, NY — itself a tribute to the Duke of Albany.',
    founded: '1908',
    verified: false,
  },
  {
    id: 'loch-lomond-ca',
    name: 'Loch Lomond',
    region: 'California, USA',
    lng: -122.1380,
    lat: 37.0908,
    gaidhlig: 'Loch Laomainn',
    meaning: '"Loch Laomainn" — possibly "the beacon loch" or "loch of the elms."',
    why_named: 'Named for Loch Lomond, Scotland; a reservoir in the Santa Cruz Mountains.',
    founded: null,
    verified: false,
  },

  // Colorado
  {
    id: 'gleneagle-co',
    name: 'Gleneagle',
    region: 'Colorado, USA',
    lng: -104.8327,
    lat: 39.0731,
    gaidhlig: 'Gleann na h-Eaglais',
    meaning: '"Gleann na h-Eaglais" — "the glen of the church"; Scottish Gleneagles is often "glen of notches."',
    why_named: 'Named after Gleneagles in Perthshire, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'lochbuie-co',
    name: 'Lochbuie',
    region: 'Colorado, USA',
    lng: -104.7158,
    lat: 39.9908,
    gaidhlig: 'Loch Buidhe',
    meaning: '"Loch Buidhe" — "the yellow loch."',
    why_named: 'Named for Lochbuie on the Isle of Mull.',
    founded: null,
    verified: false,
  },
  {
    id: 'sterling-co',
    name: 'Sterling',
    region: 'Colorado, USA',
    lng: -103.2077,
    lat: 40.6256,
    gaidhlig: 'Sruighlea',
    meaning: '"Sruighlea" is the Gàidhlig name for Stirling.',
    why_named: 'Named for Sterling, Illinois — which in turn echoes Stirling, Scotland.',
    founded: '1881',
    verified: false,
  },

  // Connecticut
  {
    id: 'scotland-ct',
    name: 'Scotland',
    region: 'Connecticut, USA',
    lng: -72.0925,
    lat: 41.6967,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland.',
    why_named: 'Named by Isaac Magoon, a Scottish settler who arrived in 1700, in tribute to his homeland.',
    founded: '1700',
    verified: false,
  },

  // Delaware
  {
    id: 'dunleith-de',
    name: 'Dunleith',
    region: 'Delaware, USA',
    lng: -75.5891,
    lat: 39.7345,
    gaidhlig: 'Dùn Leith',
    meaning: '"Dùn Leith" — "fort of Leith" or "grey fort."',
    why_named: 'Named in the Scottish style after Leith / Dunleith.',
    founded: null,
    verified: false,
  },
  {
    id: 'glasgow-de',
    name: 'Glasgow',
    region: 'Delaware, USA',
    lng: -75.7460,
    lat: 39.6017,
    gaidhlig: 'Glaschu',
    meaning: '"Glaschu" — traditionally "dear green place"; the older root is likely "green hollow."',
    why_named: 'Named for Glasgow, Scotland.',
    founded: null,
    verified: false,
  },

  // District of Columbia
  {
    id: 'douglass-dc',
    name: 'Douglass',
    region: 'Washington, D.C., USA',
    lng: -76.9881,
    lat: 38.8636,
    gaidhlig: 'Dùbhghlas',
    meaning: '"Dùbhghlas" — "dark stream" (dubh + glas), the source of the surname Douglas.',
    why_named: 'Anacostia / Frederick Douglass area — named for the abolitionist, whose surname descends from the Scottish Clan Douglas.',
    founded: null,
    verified: false,
  },
  {
    id: 'dunbar-dc',
    name: 'Dunbar',
    region: 'Washington, D.C., USA',
    lng: -77.0117,
    lat: 38.9079,
    gaidhlig: 'Dùn Bàrr',
    meaning: '"Dùn Bàrr" — "fort on the summit / point."',
    why_named: 'Named after Dunbar in East Lothian, Scotland (by way of poet Paul Laurence Dunbar).',
    founded: null,
    verified: false,
  },

  // Florida
  {
    id: 'aberdeen-fl',
    name: 'Aberdeen',
    region: 'Florida, USA',
    lng: -80.1278,
    lat: 26.5379,
    gaidhlig: 'Obar Dheathain',
    meaning: '"Obar Dheathain" — "mouth of the Don" (obar = confluence; Don = river name).',
    why_named: 'Named for Aberdeen, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'dundee-fl',
    name: 'Dundee',
    region: 'Florida, USA',
    lng: -81.6231,
    lat: 28.0205,
    gaidhlig: 'Dùn Dé',
    meaning: '"Dùn Dé" — possibly "fort of the Tay" or "fort of God."',
    why_named: 'Named for Dundee, Scotland.',
    founded: '1924',
    verified: false,
  },
  {
    id: 'dunedin-fl',
    name: 'Dunedin',
    region: 'Florida, USA',
    lng: -82.7723,
    lat: 28.0197,
    gaidhlig: 'Dùn Èideann',
    meaning: '"Dùn Èideann" is the Gàidhlig name for Edinburgh — "fort of Eidyn."',
    why_named: 'Named in 1882 by Scottish settlers J.O. Douglas and James Somerville after Edinburgh, Scotland.',
    founded: '1882',
    verified: false,
  },
  {
    id: 'fort-lauderdale-fl',
    name: 'Fort Lauderdale',
    region: 'Florida, USA',
    lng: -80.1373,
    lat: 26.1224,
    gaidhlig: 'Dùn Shrath Labhdair',
    meaning: '"Dùn Shrath Labhdair" — a Gàidhlig rendering: "fort of the strath of Lauder."',
    why_named: 'Named for Major William Lauderdale, who built forts in the area during the Second Seminole War (1838).',
    founded: '1838',
    verified: false,
  },

  // Georgia
  {
    id: 'albany-ga',
    name: 'Albany',
    region: 'Georgia, USA',
    lng: -84.1557,
    lat: 31.5785,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland.',
    why_named: 'Named for Albany, NY — ultimately a tribute to the Duke of Albany / Scotland.',
    founded: '1836',
    verified: false,
  },
  {
    id: 'argyle-ga',
    name: 'Argyle',
    region: 'Georgia, USA',
    lng: -82.6126,
    lat: 30.9633,
    gaidhlig: 'Earra-Ghàidheal',
    meaning: '"Earra-Ghàidheal" — "the coastland of the Gaels."',
    why_named: 'Named for Argyll, the ancestral kingdom of Dál Riata.',
    founded: null,
    verified: false,
  },
  {
    id: 'clyde-ga',
    name: 'Clyde',
    region: 'Georgia, USA',
    lng: -81.31,
    lat: 32.13,
    gaidhlig: 'Cluaidh',
    meaning: '"Cluaidh" — the river name, possibly "the cleansing one."',
    why_named: 'Named for the River Clyde, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'culloden-ga',
    name: 'Culloden',
    region: 'Georgia, USA',
    lng: -84.0938,
    lat: 32.8593,
    gaidhlig: 'Cùl-Lodair',
    meaning: '"Cùl-Lodair" — "the nook of the marsh" (cùl = back / nook; lodair = marshy place).',
    why_named: 'Named after Culloden, where the 1746 Jacobite rising ended.',
    founded: '1812',
    verified: false,
  },

  // Idaho
  {
    id: 'drummond-id',
    name: 'Drummond',
    region: 'Idaho, USA',
    lng: -111.6700,
    lat: 43.7866,
    gaidhlig: 'Dromain',
    meaning: '"Dromain" — "ridge / place on the ridge" (druim = ridge).',
    why_named: 'Named after the Drummond family / Drummond, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'mccall-id',
    name: 'McCall',
    region: 'Idaho, USA',
    lng: -116.0986,
    lat: 44.9111,
    gaidhlig: 'Baile ’icColla',
    meaning: '"Settlement of MacColl" — Mac Colla, "son of Coll."',
    why_named: 'Named for Tom McCall, who founded the town in 1889.',
    founded: '1889',
    verified: false,
  },
  {
    id: 'wallace-id',
    name: 'Wallace',
    region: 'Idaho, USA',
    lng: -115.9242,
    lat: 47.4732,
    gaidhlig: 'Uallas',
    meaning: '"Uallas" — the Gàidhlig rendering of Wallace; from "wealh," "foreigner / Briton."',
    why_named: 'Named for Colonel W.R. Wallace, who founded the silver-mining camp in 1884.',
    founded: '1884',
    verified: false,
  },

  // Illinois
  {
    id: 'dunfermline-il',
    name: 'Dunfermline',
    region: 'Illinois, USA',
    lng: -90.0026,
    lat: 40.5562,
    gaidhlig: 'Dùn Phàrlain',
    meaning: '"Dùn Phàrlain" — Pharlan\'s fort (a personal-name origin).',
    why_named: 'Named for Dunfermline in Fife, ancient capital of the Scottish kings.',
    founded: '1834',
    verified: false,
  },
  {
    id: 'glencoe-il',
    name: 'Glencoe',
    region: 'Illinois, USA',
    lng: -87.7589,
    lat: 42.1378,
    gaidhlig: 'Gleann Comhainn',
    meaning: '"Gleann Comhainn" — "the glen of the River Coe."',
    why_named: 'Named for Glen Coe in Scotland.',
    founded: '1869',
    verified: false,
  },
  {
    id: 'lanark-il',
    name: 'Lanark',
    region: 'Illinois, USA',
    lng: -89.8345,
    lat: 42.1028,
    gaidhlig: 'Lannraig',
    meaning: '"Lannraig" — from a Brittonic root meaning "glade / clear space."',
    why_named: 'Named for Lanark, Scotland.',
    founded: '1861',
    verified: false,
  },

  // Iowa
  {
    id: 'angus-ia',
    name: 'Angus',
    region: 'Iowa, USA',
    lng: -94.1583,
    lat: 41.9286,
    gaidhlig: 'Aonghas',
    meaning: '"Aonghas" — "one choice" (aon + ghus); also the name of the Scottish region.',
    why_named: 'Named for Angus / Aonghas in Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'berwick-ia',
    name: 'Berwick',
    region: 'Iowa, USA',
    lng: -93.5277,
    lat: 41.6494,
    gaidhlig: 'Baraig',
    meaning: '"Baraig" — Gàidhlig rendering of Berwick (Old English "bere-wic," "barley farm").',
    why_named: 'Named for Berwick in the Scottish Borders / Berwickshire.',
    founded: null,
    verified: false,
  },
  {
    id: 'harris-ia',
    name: 'Harris',
    region: 'Iowa, USA',
    lng: -95.4347,
    lat: 43.4413,
    gaidhlig: 'Na Hearadh',
    meaning: '"Na Hearadh" — the Outer Hebridean island of Harris; possibly "high ground."',
    why_named: 'Named for the Hebridean island of Harris.',
    founded: null,
    verified: false,
  },
  {
    id: 'lewis-ia',
    name: 'Lewis',
    region: 'Iowa, USA',
    lng: -95.0768,
    lat: 41.3105,
    gaidhlig: 'Leòdhas',
    meaning: '"Leòdhas" — the Outer Hebridean island of Lewis; origin uncertain (possibly "marshy place").',
    why_named: 'Named for the Hebridean island of Lewis.',
    founded: null,
    verified: false,
  },
  {
    id: 'melrose-ia',
    name: 'Melrose',
    region: 'Iowa, USA',
    lng: -93.0541,
    lat: 40.9806,
    gaidhlig: 'Maol Ros',
    meaning: '"Maol Ros" — "the bare promontory."',
    why_named: 'Named for Melrose in the Scottish Borders.',
    founded: null,
    verified: false,
  },

  // Kansas
  {
    id: 'athol-ks',
    name: 'Athol',
    region: 'Kansas, USA',
    lng: -98.9197,
    lat: 39.7681,
    gaidhlig: 'Athall',
    meaning: '"Athall" — Atholl, a region of Perthshire; possibly "new Ireland" (Ath + Fhódla).',
    why_named: 'Named for Atholl in Perthshire, Scotland.',
    founded: null,
    verified: false,
  },

  // Kentucky
  {
    id: 'aberdeen-ky',
    name: 'Aberdeen',
    region: 'Kentucky, USA',
    lng: -86.9686,
    lat: 37.2531,
    gaidhlig: 'Obar Dheathain',
    meaning: '"Obar Dheathain" — "mouth of the Don."',
    why_named: 'Named for Aberdeen, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'glasgow-ky',
    name: 'Glasgow',
    region: 'Kentucky, USA',
    lng: -85.9117,
    lat: 37.0014,
    gaidhlig: 'Glaschu',
    meaning: '"Glaschu" — traditionally "dear green place"; root likely "green hollow."',
    why_named: 'Named for Glasgow, Scotland.',
    founded: '1799',
    verified: false,
  },
  {
    id: 'glencoe-ky',
    name: 'Glencoe',
    region: 'Kentucky, USA',
    lng: -84.8175,
    lat: 38.7028,
    gaidhlig: 'Gleann Comhainn',
    meaning: '"Gleann Comhainn" — "the glen of the River Coe."',
    why_named: 'Named for Glen Coe in Scotland.',
    founded: null,
    verified: false,
  },

  // Louisiana
  {
    id: 'albany-la',
    name: 'Albany',
    region: 'Louisiana, USA',
    lng: -90.5854,
    lat: 30.5083,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland.',
    why_named: 'A diaspora tribute to Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'henderson-la',
    name: 'Henderson',
    region: 'Louisiana, USA',
    lng: -91.7965,
    lat: 30.3149,
    gaidhlig: 'Baile ’icEanruig',
    meaning: '"Settlement of Henderson" — Mac Eanruig, "son of Henry."',
    why_named: 'Named for the Henderson family.',
    founded: null,
    verified: false,
  },
  {
    id: 'livingston-la',
    name: 'Livingston',
    region: 'Louisiana, USA',
    lng: -90.7479,
    lat: 30.5019,
    gaidhlig: 'Baile DhuinnShléibhe',
    meaning: '"Baile DhuinnShléibhe" — Gàidhlig rendering: "settlement of the brown hill / Dunsleve."',
    why_named: 'Named for the Livingston family, of Scottish Livingston origin.',
    founded: null,
    verified: false,
  },

  // Maine
  {
    id: 'north-berwick-me',
    name: 'North Berwick',
    region: 'Maine, USA',
    lng: -70.7339,
    lat: 43.3015,
    gaidhlig: 'Baraig a Tuath',
    meaning: '"Baraig a Tuath" — "North Berwick" (a tuath = of the north).',
    why_named: 'Named for North Berwick in East Lothian, Scotland.',
    founded: null,
    verified: false,
  },

  // Maryland
  {
    id: 'glenelg-md',
    name: 'Glenelg',
    region: 'Maryland, USA',
    lng: -77.0006,
    lat: 39.2331,
    gaidhlig: 'Gleann Eilg',
    meaning: '"Gleann Eilg" — "the glen of Eilg," an older Gaelic name for Ireland.',
    why_named: 'Named for Glenelg in Lochalsh, Scottish Highlands.',
    founded: null,
    verified: false,
  },
  {
    id: 'lochearn-md',
    name: 'Lochearn',
    region: 'Maryland, USA',
    lng: -76.7397,
    lat: 39.3284,
    gaidhlig: 'Loch Éireann',
    meaning: '"Loch Éireann" — the loch named for an Èireann / personal name.',
    why_named: 'Named for Loch Earn in Perthshire, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'mchenry-md',
    name: 'McHenry',
    region: 'Maryland, USA',
    lng: -79.3578,
    lat: 39.5876,
    gaidhlig: 'Baile ’icEanruig',
    meaning: '"Settlement of McHenry" — Mac Eanruig, "son of Henry."',
    why_named: 'Named for James McHenry, signer of the US Constitution and Secretary of War (Scots-Irish origin).',
    founded: null,
    verified: false,
  },
  {
    id: 'midlothian-md',
    name: 'Midlothian',
    region: 'Maryland, USA',
    lng: -78.9886,
    lat: 39.5048,
    gaidhlig: 'Meadhon Lodainn',
    meaning: '"Meadhon Lodainn" — "the middle of Lothian."',
    why_named: 'Named for Midlothian, the historic county around Edinburgh.',
    founded: null,
    verified: false,
  },
  {
    id: 'montrose-md',
    name: 'Montrose',
    region: 'Maryland, USA',
    lng: -77.1175,
    lat: 39.0270,
    gaidhlig: 'Montrois',
    meaning: '"Montrois" — Gàidhlig rendering; the original "Monadh Rois" means "moor of the peninsula."',
    why_named: 'Named for Montrose in Angus, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'muirkirk-md',
    name: 'Muirkirk',
    region: 'Maryland, USA',
    lng: -76.8616,
    lat: 39.0468,
    gaidhlig: 'Eaglais an t-Sléibh',
    meaning: '"Eaglais an t-Sléibh" — "church of the moor" (Scots: muir = moor + kirk = church).',
    why_named: 'Named for Muirkirk in East Ayrshire, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'scotland-md',
    name: 'Scotland',
    region: 'Maryland, USA',
    lng: -76.4639,
    lat: 38.0936,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland.',
    why_named: 'A diaspora tribute community in St. Mary\'s County.',
    founded: null,
    verified: false,
  },

  // Massachusetts
  {
    id: 'ashfield-ma',
    name: 'Ashfield',
    region: 'Massachusetts, USA',
    lng: -72.7681,
    lat: 42.5256,
    gaidhlig: 'Achadh an Uinnsinn',
    meaning: '"Achadh an Uinnsinn" — "the field of the ash tree."',
    why_named: 'Incorporated 1765; the English "Ashfield" rendered into Gàidhlig.',
    founded: '1765',
    verified: false,
  },
  {
    id: 'south-athol-ma',
    name: 'South Athol',
    region: 'Massachusetts, USA',
    lng: -72.21,
    lat: 42.55,
    gaidhlig: 'Athall a Deas',
    meaning: '"Athall a Deas" — "South Atholl" (a deas = of the south).',
    why_named: 'A village within the town of Athol; named for the Scottish region of Atholl.',
    founded: null,
    verified: false,
  },

  // Michigan
  {
    id: 'alba-mi',
    name: 'Alba',
    region: 'Michigan, USA',
    lng: -84.9711,
    lat: 44.9847,
    gaidhlig: 'Alba',
    meaning: 'Alba is the Gàidhlig name for Scotland.',
    why_named: 'A diaspora tribute — village in Antrim County.',
    founded: null,
    verified: false,
  },
  {
    id: 'argyle-mi',
    name: 'Argyle',
    region: 'Michigan, USA',
    lng: -83.0608,
    lat: 43.5994,
    gaidhlig: 'Earra-Ghàidheal',
    meaning: '"Earra-Ghàidheal" — "the coastland of the Gaels."',
    why_named: 'Argyle Township in Sanilac County; named for Argyll, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'kinross-mi',
    name: 'Kinross',
    region: 'Michigan, USA',
    lng: -84.4936,
    lat: 46.2666,
    gaidhlig: 'Ceann Rois',
    meaning: '"Ceann Rois" — "head of the promontory" (ceann = head; ros = headland).',
    why_named: 'Named for Kinross in Scotland; village in Chippewa County.',
    founded: null,
    verified: false,
  },

  // ────────────────────────────────────────────────────────────────
  // Research follow-up batch (web-confirmed locations / etymology).
  // Added 2026-06-20.
  // ────────────────────────────────────────────────────────────────

  // Illinois
  {
    id: 'croft-il',
    name: 'Croft',
    region: 'Illinois, USA',
    lng: -89.71,
    lat: 40.05,
    gaidhlig: 'Croit',
    meaning: '"Croit" — "croft, smallholding."',
    why_named: 'Unincorporated community in Menard County, south of Middletown; named for the traditional Scottish croft.',
    founded: null,
    verified: false,
  },

  // Indiana
  {
    id: 'caledonia-in',
    name: 'Caledonia',
    region: 'Indiana, USA',
    lng: -87.45,
    lat: 39.06,
    gaidhlig: 'A’ Chailleann',
    meaning: 'Caledonia is the Latin name for Scotland; the Gàidhlig is Alba. "A’ Chailleann" is a poetic Gàidhlig rendering.',
    why_named: 'Former town in Cass Township, Sullivan County; extinct after extensive strip-mining. Post office 1902–1909.',
    founded: '1902',
    verified: false,
  },
  {
    id: 'campbelltown-in',
    name: 'Campbelltown',
    region: 'Indiana, USA',
    lng: -87.20,
    lat: 38.43,
    gaidhlig: 'Ceann Loch Chille Chiarain',
    meaning: '"Ceann Loch Chille Chiarain" — the Gàidhlig name for Campbeltown in Kintyre, Argyll ("head of Loch Kilkerran").',
    why_named: 'Unincorporated community in Patoka Township, Pike County; named for pioneer merchant Samuel Campbell.',
    founded: null,
    verified: false,
  },
  {
    id: 'iona-in',
    name: 'Iona',
    region: 'Indiana, USA',
    lng: -87.43,
    lat: 38.66,
    gaidhlig: 'Ì',
    meaning: '"Ì" — "the (yew) island"; the holy isle of Iona off Mull.',
    why_named: 'Populated place in Johnson Township, Knox County; named for the Scottish island of Iona.',
    founded: null,
    verified: false,
  },
  {
    id: 'perth-in',
    name: 'Perth',
    region: 'Indiana, USA',
    lng: -87.07,
    lat: 39.55,
    gaidhlig: 'Peairt',
    meaning: '"Peairt" — from a Pictish root meaning "wood" or "copse."',
    why_named: 'Unincorporated community in Dick Johnson Township, Clay County. Founded 1870 by Michael McMillan, named for Perth, Scotland, his birthplace; a coal-mining town that peaked around 400 residents in 1910.',
    founded: '1870',
    verified: false,
  },
  {
    id: 'kyle-in',
    name: 'Kyle',
    region: 'Indiana, USA',
    lng: -85.07,
    lat: 39.23,
    gaidhlig: 'Caol',
    meaning: '"Caol" — "narrow / strait."',
    why_named: 'Unincorporated community in Manchester Township, Dearborn County. Post office 1883–1904.',
    founded: '1883',
    verified: false,
  },

  // Iowa
  {
    id: 'dewar-ia',
    name: 'Dewar',
    region: 'Iowa, USA',
    lng: -92.18,
    lat: 42.59,
    gaidhlig: 'Deòir',
    meaning: '"Deòir" — the surname Dewar, from "deòraidh," "pilgrim / relic-keeper."',
    why_named: 'Unincorporated town in Poyner Township, Black Hawk County, NE of Waterloo. Platted 1888 (formerly Emert).',
    founded: '1888',
    verified: false,
  },
  {
    id: 'dumfries-ia',
    name: 'Dumfries',
    region: 'Iowa, USA',
    lng: -95.71,
    lat: 41.13,
    gaidhlig: 'Dùn Phrìs',
    meaning: '"Dùn Phrìs" — "fort of the thicket / copse."',
    why_named: 'Populated place in Lewis Township, Pottawattamie County; named for Dumfries in southern Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcmaster-creek-ia',
    name: 'McMaster Creek',
    region: 'Iowa, USA',
    lng: -95.9781,
    lat: 42.1591,
    gaidhlig: 'Allt ’ic a’ Mhaighstir',
    meaning: '"Allt ’ic a’ Mhaighstir" — "burn of MacMaster" (allt = stream / burn; Mac a’ Mhaighstir = son of the master).',
    why_named: 'Stream in Monona County, western Iowa; named for the MacMaster / McMaster family.',
    founded: null,
    verified: false,
  },

  // Maryland
  {
    id: 'gilmore-md',
    name: 'Gilmore',
    region: 'Maryland, USA',
    lng: -78.9883,
    lat: 39.5547,
    gaidhlig: 'Gille Moire',
    meaning: '"Gille Moire" — "servant of Mary" (gille = lad / servant; Moire = Mary).',
    why_named: 'Unincorporated community in Allegany County, in the Georges Creek valley between Midland and Lonaconing; named for a Gilmore family.',
    founded: null,
    verified: false,
  },
  {
    id: 'glen-burnie-md',
    name: 'Glen Burnie',
    region: 'Maryland, USA',
    lng: -76.6249,
    lat: 39.1626,
    gaidhlig: 'Gleann',
    meaning: '"Gleann" — "valley / glen."',
    why_named: 'Founded 1812 by district attorney Elias Glenn, who named his estate "Glennsburne" — evolving through "Glennsbourne Farm" to "Glenburnie." Now a suburb of Baltimore in Anne Arundel County.',
    founded: '1812',
    verified: false,
  },
  {
    id: 'greenock-md',
    name: 'Greenock',
    region: 'Maryland, USA',
    lng: -76.65,
    lat: 38.83,
    gaidhlig: 'Grianag',
    meaning: '"Grianag" — "sunny knoll / sunny bay" (grian = sun).',
    why_named: 'Hamlet in Anne Arundel County, near Lothian; named for Greenock on the Firth of Clyde, Scotland.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcalpine-md',
    name: 'McAlpine',
    region: 'Maryland, USA',
    lng: -76.7950,
    lat: 39.2727,
    gaidhlig: 'Baile ’icAilpinn',
    meaning: '"Settlement of MacAlpine" — Mac Ailpein, "son of Alpin" (the Pictish king-name).',
    why_named: 'Community in Howard County, just outside historic Ellicott City; notable for one of the few surviving postbellum country houses in the county.',
    founded: null,
    verified: false,
  },
  {
    id: 'mccleans-corner-md',
    name: 'McCleans Corner',
    region: 'Maryland, USA',
    lng: -76.1894,
    lat: 39.1982,
    gaidhlig: 'Oisinn ’ic’Ill’eathain',
    meaning: '"Oisinn ’ic’Ill’eathain" — "corner of MacLean" (oisinn = corner / angle; Mac ’Ill’Eathain = son of the servant of John).',
    why_named: 'Hamlet in Kent County on Maryland\'s Eastern Shore, near Chestertown; named for the MacLean / McLean family.',
    founded: null,
    verified: false,
  },
  {
    id: 'mcghiesport-md',
    name: 'McGhiesport',
    region: 'Maryland, USA',
    lng: -77.13,
    lat: 38.62,
    gaidhlig: 'Port ’icAoidh',
    meaning: '"Port of MacKay / McGhie" — Mac Aoidh, "son of Aodh (Hugh)."',
    why_named: 'Locality in Charles County (ZIP 20616), near Pomonkey Point and the hamlet of Fenwick.',
    founded: null,
    verified: false,
  },
  {
    id: 'mckay-beach-md',
    name: 'McKay Beach',
    region: 'Maryland, USA',
    lng: -76.55,
    lat: 38.13,
    gaidhlig: 'Tràigh ’icAoidh',
    meaning: '"Beach of MacKay" — tràigh = beach / shore; Mac Aoidh = son of Aodh.',
    why_named: 'Small Chesapeake Bay beach community in St. Mary\'s County, near Piney Point and Valley Lee.',
    founded: null,
    verified: false,
  },
  {
    id: 'scarff-md',
    name: 'Scarff',
    region: 'Maryland, USA',
    lng: -76.30,
    lat: 39.55,
    gaidhlig: 'Sgarbh',
    meaning: '"Sgarbh" — "cormorant" (the seabird).',
    why_named: 'Community in Harford County, NE Maryland.',
    founded: null,
    verified: false,
  },
  {
    id: 'st-andrews-md',
    name: 'St. Andrews',
    region: 'Maryland, USA',
    lng: -76.62,
    lat: 38.30,
    gaidhlig: 'Cill Rìmhinn',
    meaning: '"Cill Rìmhinn" — the Gàidhlig name for St Andrews in Fife ("church of Rignidh / the king\'s hill").',
    why_named: 'Community in St. Mary\'s County, off MD Route 4; named for St. Andrew\'s Episcopal Church (built 1767), part of a parish created by the Maryland Provincial Assembly in 1744.',
    founded: '1744',
    verified: false,
  },

  // Massachusetts
  {
    id: 'fife-brook-ma',
    name: 'Fife Brook',
    region: 'Massachusetts, USA',
    lng: -72.95,
    lat: 42.63,
    gaidhlig: 'Allt Fhìobha',
    meaning: '"Allt Fhìobha" — "burn of Fife" (allt = stream / burn; Fìobh = Fife, the Scottish region).',
    why_named: 'Tributary and dam on the Deerfield River in Charlemont, Berkshires; Fife Brook Dam built 1974.',
    founded: null,
    verified: false,
  },
  {
    id: 'renfrew-ma',
    name: 'Renfrew',
    region: 'Massachusetts, USA',
    lng: -73.113,
    lat: 42.638,
    gaidhlig: 'Rinn Friù',
    meaning: '"Rinn Friù" — "point of Friù"; Renfrew is from Cumbric "rhyn-frwd," "point of the current."',
    why_named: 'Populated place within Adams, Berkshire County; site of the 19th-century Renfrew Manufacturing Company, a major Berkshires wool mill.',
    founded: null,
    verified: false,
  },

  // Michigan
  {
    id: 'galloway-mi',
    name: 'Galloway',
    region: 'Michigan, USA',
    lng: -84.30,
    lat: 43.32,
    gaidhlig: 'Gall-Ghàidhealaibh',
    meaning: '"Gall-Ghàidhealaibh" — "the foreign Gaels" / "Norse-Gaels," the SW-Scottish region of Galloway.',
    why_named: 'Unincorporated community at the junction of Saginaw and Gratiot counties (Lakefield / Lafayette townships). Post office opened 1883 with first postmaster Richard Galloway.',
    founded: '1883',
    verified: false,
  },
  {
    id: 'guthrie-mi',
    name: 'Guthrie',
    region: 'Michigan, USA',
    lng: -84.06,
    lat: 42.30,
    gaidhlig: 'Gaothrach',
    meaning: '"Gaothrach" — "windy place" (gaoth = wind).',
    why_named: 'Populated place in Sylvan Township, Washtenaw County.',
    founded: null,
    verified: false,
  },
];
