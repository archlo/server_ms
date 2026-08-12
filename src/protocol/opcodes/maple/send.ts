export class MapleSendOpcode {
    // LP
    // CLogin::OnPacket
    static CHECK_PASSWORD_RESULT = new MapleSendOpcode(0);
    static GUEST_ID_LOGIN_RESULT = new MapleSendOpcode(1);
    static ACCOUNT_INFO_RESULT = new MapleSendOpcode(2);
    static CHECK_USER_LIMIT_RESULT = new MapleSendOpcode(3);
    static SET_ACCOUNT_RESULT = new MapleSendOpcode(4);
    static CONFIRM_EULA_RESULT = new MapleSendOpcode(5);
    static CHECK_PIN_CODE_RESULT = new MapleSendOpcode(6);
    static UPDATE_PIN_CODE_RESULT = new MapleSendOpcode(7);
    static VIEW_ALL_CHAR_RESULT = new MapleSendOpcode(8);
    static SELECT_CHARACTER_BY_VAC_RESULT = new MapleSendOpcode(9);
    static WORLD_INFORMATION = new MapleSendOpcode(10);
    static SELECT_WORLD_RESULT = new MapleSendOpcode(11);
    static SELECT_CHARACTER_RESULT = new MapleSendOpcode(12);
    static CHECK_DUPLICATED_ID_RESULT = new MapleSendOpcode(13);
    static CREATE_NEW_CHARACTER_RESULT = new MapleSendOpcode(14);
    static DELETE_CHARACTER_RESULT = new MapleSendOpcode(15);
    static ENABLE_SPW_RESULT = new MapleSendOpcode(21);
    static DELETE_CHARACTER_OTP_REQUEST = new MapleSendOpcode(22);
    static LATEST_CONNECTED_WORLD = new MapleSendOpcode(24);
    static RECOMMEND_WORLD_MESSAGE = new MapleSendOpcode(25);
    static CHECK_EXTRA_CHAR_INFO_RESULT = new MapleSendOpcode(26);
    static CHECK_SPW_RESULT = new MapleSendOpcode(27);
    // CClientSocket::ProcessPacket
    static MIGRATE_COMMAND = new MapleSendOpcode(16);
    static ALIVE_REQ = new MapleSendOpcode(17);
    static AUTHEN_CODE_CHANGED = new MapleSendOpcode(18);
    static AUTHEN_MESSAGE = new MapleSendOpcode(19);
    static SECURITY_PACKET = new MapleSendOpcode(20);
    static CHECK_CRC_RESULT = new MapleSendOpcode(23);
    // CWvsContext::OnPacket
    static INVENTORY_OPERATION = new MapleSendOpcode(28);
    static INVENTORY_GROW = new MapleSendOpcode(29);
    static STAT_CHANGED = new MapleSendOpcode(30);
    static TEMPORARY_STAT_SET = new MapleSendOpcode(31);
    static TEMPORARY_STAT_RESET = new MapleSendOpcode(32);
    static FORCED_STAT_SET = new MapleSendOpcode(33);
    static FORCED_STAT_RESET = new MapleSendOpcode(34);
    static CHANGE_SKILL_RECORD_RESULT = new MapleSendOpcode(35);
    static SKILL_USE_RESULT = new MapleSendOpcode(36);
    static GIVE_POPULARITY_RESULT = new MapleSendOpcode(37);
    static MESSAGE = new MapleSendOpcode(38);
    static SEND_OPEN_FULL_CLIENT_LINK = new MapleSendOpcode(39);
    static MEMO_RESULT = new MapleSendOpcode(40);
    static MAP_TRANSFER_RESULT = new MapleSendOpcode(41);
    static ANTI_MACRO_RESULT = new MapleSendOpcode(42);
    static INITIAL_QUIZ_START = new MapleSendOpcode(43);
    static CLAIM_RESULT = new MapleSendOpcode(44);
    static SET_CLAIM_SVR_AVAILABLE_TIME = new MapleSendOpcode(45);
    static CLAIM_SVR_STATUS_CHANGED = new MapleSendOpcode(46);
    static SET_TAMING_MOB_INFO = new MapleSendOpcode(47);
    static QUEST_CLEAR = new MapleSendOpcode(48);
    static ENTRUSTED_SHOP_CHECK_RESULT = new MapleSendOpcode(49);
    static SKILL_LEARN_ITEM_RESULT = new MapleSendOpcode(50);
    static SKILL_RESET_ITEM_RESULT = new MapleSendOpcode(51);
    static GATHER_ITEM_RESULT = new MapleSendOpcode(52);
    static SORT_ITEM_RESULT = new MapleSendOpcode(53);
    static SUE_CHARACTER_RESULT = new MapleSendOpcode(55);
    static MIGRATE_TO_CASH_SHOP_RESULT = new MapleSendOpcode(56);
    static TRADE_MONEY_LIMIT = new MapleSendOpcode(57);
    static SET_GENDER = new MapleSendOpcode(58);
    static GUILD_BBS = new MapleSendOpcode(59);
    static PET_DEAD_MESSAGE = new MapleSendOpcode(60);
    static CHARACTER_INFO = new MapleSendOpcode(61);
    static PARTY_RESULT = new MapleSendOpcode(62);
    static EXPEDITION_NOTI = new MapleSendOpcode(64);
    static FRIEND_RESULT = new MapleSendOpcode(65);
    static GUILD_REQUEST = new MapleSendOpcode(66);
    static GUILD_RESULT = new MapleSendOpcode(67);
    static ALLIANCE_RESULT = new MapleSendOpcode(68);
    static TOWN_PORTAL = new MapleSendOpcode(69);
    static OPEN_GATE = new MapleSendOpcode(70);
    static BROADCAST_MSG = new MapleSendOpcode(71);
    static INCUBATOR_RESULT = new MapleSendOpcode(72);
    static SHOP_SCANNER_RESULT = new MapleSendOpcode(73);
    static SHOP_LINK_RESULT = new MapleSendOpcode(74);
    static MARRIAGE_REQUEST = new MapleSendOpcode(75);
    static MARRIAGE_RESULT = new MapleSendOpcode(76);
    static WEDDING_GIFT_RESULT = new MapleSendOpcode(77);
    static MARRIED_PARTNER_MAP_TRANSFER = new MapleSendOpcode(78);
    static CASH_PET_FOOD_RESULT = new MapleSendOpcode(79);
    static SET_WEEK_EVENT_MESSAGE = new MapleSendOpcode(80);
    static SET_POTION_DISCOUNT_RATE = new MapleSendOpcode(81);
    static BRIDLE_MOB_CATCH_FAIL = new MapleSendOpcode(82);
    static IMITATED_NPC_RESULT = new MapleSendOpcode(83);
    static IMITATED_NPC_DATA = new MapleSendOpcode(84);
    static LIMITED_NPC_DISABLE_INFO = new MapleSendOpcode(85);
    static MONSTER_BOOK_SET_CARD = new MapleSendOpcode(86);
    static MONSTER_BOOK_SET_COVER = new MapleSendOpcode(87);
    static HOUR_CHANGED = new MapleSendOpcode(88);
    static MINI_MAP_ON_OFF = new MapleSendOpcode(89);
    static CONSULT_AUTHKEY_UPDATE = new MapleSendOpcode(90);
    static CLASS_COMPETITION_AUTHKEY_UPDATE = new MapleSendOpcode(91);
    static WEB_BOARD_AUTHKEY_UPDATE = new MapleSendOpcode(92);
    static SESSION_VALUE = new MapleSendOpcode(93);
    static PARTY_VALUE = new MapleSendOpcode(94);
    static FIELD_SET_VARIABLE = new MapleSendOpcode(95);
    static BONUS_EXP_RATE_CHANGED = new MapleSendOpcode(96);
    static POTION_DISCOUNT_RATE_CHANGED = new MapleSendOpcode(97);
    static FAMILY_CHART_RESULT = new MapleSendOpcode(98);
    static FAMILY_INFO_RESULT = new MapleSendOpcode(99);
    static FAMILY_RESULT = new MapleSendOpcode(100);
    static FAMILY_JOIN_REQUEST = new MapleSendOpcode(101);
    static FAMILY_JOIN_REQUEST_RESULT = new MapleSendOpcode(102);
    static FAMILY_JOIN_ACCEPTED = new MapleSendOpcode(103);
    static FAMILY_PRIVILEGE_LIST = new MapleSendOpcode(104);
    static FAMILY_FAMOUS_POINT_INC_RESULT = new MapleSendOpcode(105);
    static FAMILY_NOTIFY_LOGIN_OR_LOGOUT = new MapleSendOpcode(106);
    static FAMILY_SET_PRIVILEGE = new MapleSendOpcode(107);
    static FAMILY_SUMMON_REQUEST = new MapleSendOpcode(108);
    static NOTIFY_LEVEL_UP = new MapleSendOpcode(109);
    static NOTIFY_WEDDING = new MapleSendOpcode(110);
    static NOTIFY_JOB_CHANGE = new MapleSendOpcode(111);
    static INC_RATE_CHANGED = new MapleSendOpcode(112);
    static MAPLE_TV_USE_RES = new MapleSendOpcode(113);
    static AVATAR_MEGAPHONE_RES = new MapleSendOpcode(114);
    static AVATAR_MEGAPHONE_UPDATE_MESSAGE = new MapleSendOpcode(115);
    static AVATAR_MEGAPHONE_CLEAR_MESSAGE = new MapleSendOpcode(116);
    static CANCEL_NAME_CHANGE_RESULT = new MapleSendOpcode(117);
    static CANCEL_TRANSFER_WORLD_RESULT = new MapleSendOpcode(118);
    static DESTROY_SHOP_RESULT = new MapleSendOpcode(119);
    static FAKEGMNOTICE = new MapleSendOpcode(120);
    static SUCCESS_IN_USE_GACHAPON_BOX = new MapleSendOpcode(121);
    static NEW_YEAR_CARD_RES = new MapleSendOpcode(122);
    static RANDOM_MORPH_RES = new MapleSendOpcode(123);
    static CANCEL_NAME_CHANGE_BY_OTHER = new MapleSendOpcode(124);
    static SET_BUY_EQUIP_EXT = new MapleSendOpcode(125);
    static SET_PASSENSER_REQUEST = new MapleSendOpcode(126);
    static SCRIPT_PROGRESS_MESSAGE = new MapleSendOpcode(127);
    static DATA_CRC_CHECK_FAILED = new MapleSendOpcode(128);
    static CAKE_PIE_EVENT_RESULT = new MapleSendOpcode(129);
    static UPDATE_GM_BOARD = new MapleSendOpcode(130);
    static SHOW_SLOT_MESSAGE = new MapleSendOpcode(131);
    static WILD_HUNTER_INFO = new MapleSendOpcode(132);
    static ACCOUNT_MORE_INFO = new MapleSendOpcode(133);
    static FIND_FIREND = new MapleSendOpcode(134);
    static STAGE_CHANGE = new MapleSendOpcode(135);
    static DRAGON_BALL_BOX = new MapleSendOpcode(136);
    static ASK_USER_WHETHER_USE_PAMS_SONG = new MapleSendOpcode(137);
    static TRANSFER_CHANNEL = new MapleSendOpcode(138);
    static DISALLOWED_DELIVERY_QUEST_LIST = new MapleSendOpcode(139);
    static MACRO_SYS_DATA_INIT = new MapleSendOpcode(140);
    // CStage::OnPacket
    static SET_FIELD = new MapleSendOpcode(141);
    static SET_ITC = new MapleSendOpcode(142);
    static SET_CASH_SHOP = new MapleSendOpcode(143);
    // CMapLoadable::OnPacket
    static SET_BACKGROUND_EFFECT = new MapleSendOpcode(144);
    static SET_MAP_OBJECT_VISIBLE = new MapleSendOpcode(145);
    static CLEAR_BACKGROUND_EFFECT = new MapleSendOpcode(146);
    // CField::OnPacket
    static TRANSFER_FIELD_REQ_IGNORED = new MapleSendOpcode(147);
    static TRANSFER_CHANNEL_REQ_IGNORED = new MapleSendOpcode(148);
    static FIELD_SPECIFIC_DATA = new MapleSendOpcode(149);
    static GROUP_MESSAGE = new MapleSendOpcode(150);
    static WHISPER = new MapleSendOpcode(151);
    static COUPLE_MESSAGE = new MapleSendOpcode(152);
    static MOB_SUMMON_ITEM_USE_RESULT = new MapleSendOpcode(153);
    static FIELD_EFFECT = new MapleSendOpcode(154);
    static FIELD_OBSTACLE_ON_OFF = new MapleSendOpcode(155);
    static FIELD_OBSTACLE_ON_OFF_STATUS = new MapleSendOpcode(156);
    static FIELD_OBSTACLE_ALL_RESET = new MapleSendOpcode(157);
    static BLOW_WEATHER = new MapleSendOpcode(158);
    static PLAY_JUKE_BOX = new MapleSendOpcode(159);
    static ADMIN_RESULT = new MapleSendOpcode(160);
    static QUIZ = new MapleSendOpcode(161);
    static DESC = new MapleSendOpcode(162);
    static CLOCK = new MapleSendOpcode(163);
    static SET_QUEST_CLEAR = new MapleSendOpcode(166);
    static SET_QUEST_TIME = new MapleSendOpcode(167);
    static WARN = new MapleSendOpcode(168);
    static SET_OBJECT_STATE = new MapleSendOpcode(169);
    static DESTROY_CLOCK = new MapleSendOpcode(170);
    static STALK_RESULT = new MapleSendOpcode(172);
    static QUICKSLOT_MAPPED_INIT = new MapleSendOpcode(175);
    static FOOT_HOLD_INFO = new MapleSendOpcode(176);
    static REQUEST_FOOT_HOLD_INFO = new MapleSendOpcode(177);
    static HONTALE_TIMER = new MapleSendOpcode(359);
    static CHAOS_ZAKUM_TIMER = new MapleSendOpcode(360);
    static HONTAIL_TIMER = new MapleSendOpcode(361);
    static ZAKUM_TIMER = new MapleSendOpcode(362);
    static GOLD_HAMMER_RESULT = new MapleSendOpcode(418);
    // CUserPool::OnPacket
    static USER_ENTER_FIELD = new MapleSendOpcode(179);
    static USER_LEAVE_FIELD = new MapleSendOpcode(180);
    // CUserPool::OnUserCommonPacket
    static USER_CHAT = new MapleSendOpcode(181);
    static USER_CHAT_NLCPQ = new MapleSendOpcode(182);
    static USER_AD_BOARD = new MapleSendOpcode(183);
    static USER_MINI_ROOM_BALLOON = new MapleSendOpcode(184);
    static USER_CONSUME_ITEM_EFFECT = new MapleSendOpcode(185);
    static USER_ITEM_UPGRADE_EFFECT = new MapleSendOpcode(186);
    static USER_ITEM_HYPER_UPGRADE_EFFECT = new MapleSendOpcode(187);
    static USER_ITEM_OPTION_UPGRADE_EFFECT = new MapleSendOpcode(188);
    static USER_ITEM_RELEASE_EFFECT = new MapleSendOpcode(189);
    static USER_ITEM_UNRELEASE_EFFECT = new MapleSendOpcode(190);
    static USER_HIT_BY_USER = new MapleSendOpcode(191);
    static USER_TESLA_TRIANGLE = new MapleSendOpcode(192);
    static USER_FOLLOW_CHARACTER = new MapleSendOpcode(193);
    static USER_SHOW_PQ_REWARD = new MapleSendOpcode(194);
    static USER_SET_PHASE = new MapleSendOpcode(195);
    static SET_PORTAL_USABLE = new MapleSendOpcode(196);
    static SHOW_PAMS_SONG_RESULT = new MapleSendOpcode(197);
    // CUser::OnPetPacket
    static PET_ACTIVATED = new MapleSendOpcode(198);
    static PET_EVOL = new MapleSendOpcode(199);
    static PET_TRANSFER_FIELD = new MapleSendOpcode(200);
    static PET_MOVE = new MapleSendOpcode(201);
    static PET_ACTION = new MapleSendOpcode(202);
    static PET_NAME_CHANGED = new MapleSendOpcode(203);
    static PET_LOAD_EXCEPTION_LIST = new MapleSendOpcode(204);
    static PET_ACTION_COMMAND = new MapleSendOpcode(205);
    // CUser::OnDragonPacket
    static DRAGON_ENTER_FIELD = new MapleSendOpcode(206);
    static DRAGON_MOVE = new MapleSendOpcode(207);
    static DRAGON_LEAVE_FIELD = new MapleSendOpcode(208);
    // CUserPool::OnUserRemotePacket
    static USER_MOVE = new MapleSendOpcode(210);
    static USER_MELEE_ATTACK = new MapleSendOpcode(211);
    static USER_SHOOT_ATTACK = new MapleSendOpcode(212);
    static USER_MAGIC_ATTACK = new MapleSendOpcode(213);
    static USER_BODY_ATTACK = new MapleSendOpcode(214);
    static USER_SKILL_PREPARE = new MapleSendOpcode(215);
    static USER_MOVING_SHOOT_ATTACK_PREPARE = new MapleSendOpcode(216);
    static USER_SKILL_CANCEL = new MapleSendOpcode(217);
    static USER_HIT = new MapleSendOpcode(218);
    static USER_EMOTION = new MapleSendOpcode(219);
    static USER_SET_ACTIVE_EFFECT_ITEM = new MapleSendOpcode(220);
    static USER_SHOW_UPGRADE_TOMB_EFFECT = new MapleSendOpcode(221);
    static USER_SET_ACTIVE_PORTABLE_CHAIR = new MapleSendOpcode(222);
    static USER_AVATAR_MODIFIED = new MapleSendOpcode(223);
    static USER_EFFECT_REMOTE = new MapleSendOpcode(224);
    static USER_TEMPORARY_STAT_SET = new MapleSendOpcode(225);
    static USER_TEMPORARY_STAT_RESET = new MapleSendOpcode(226);
    static USER_HP = new MapleSendOpcode(227);
    static USER_GUILD_NAME_CHANGED = new MapleSendOpcode(228);
    static USER_GUILD_MARK_CHANGED = new MapleSendOpcode(229);
    static USER_THROW_GRENADE = new MapleSendOpcode(230);
    // CUserPool::OnUserLocalPacket
    static USER_SIT_RESULT = new MapleSendOpcode(231);
    static USER_EMOTION_LOCAL = new MapleSendOpcode(232);
    static USER_EFFECT_LOCAL = new MapleSendOpcode(233);
    static USER_TELEPORT = new MapleSendOpcode(234);
    static PREMIUM = new MapleSendOpcode(235);
    static MESO_GIVE_SUCCEEDED = new MapleSendOpcode(236);
    static MESO_GIVE_FAILED = new MapleSendOpcode(237);
    static RANDOM_MESOBAG_SUCCEED = new MapleSendOpcode(238);
    static RANDOM_MESOBAG_FAILED = new MapleSendOpcode(239);
    static FIELD_FADE_IN_OUT = new MapleSendOpcode(240);
    static FIELD_FADE_OUT_FORCE = new MapleSendOpcode(241);
    static USER_QUEST_RESULT = new MapleSendOpcode(242);
    static NOTIFY_HP_DEC_BY_FIELD = new MapleSendOpcode(243);
    static USER_PET_SKILL_CHANGED = new MapleSendOpcode(244);
    static USER_BALLOON_MSG = new MapleSendOpcode(245);
    static PLAY_EVENT_SOUND = new MapleSendOpcode(246);
    static PLAY_MINIGAME_SOUND = new MapleSendOpcode(247);
    static USER_MAKER_RESULT = new MapleSendOpcode(248);
    static USER_OPEN_CONSULT_BOARD = new MapleSendOpcode(249);
    static USER_OPEN_CLASS_COMPETITION_PAGE = new MapleSendOpcode(250);
    static USER_OPEN_UI = new MapleSendOpcode(251);
    static USER_OPEN_UI_WITH_OPTION = new MapleSendOpcode(252);
    static SET_DIRECTION_MODE = new MapleSendOpcode(253);
    static SET_STAND_ALONE_MODE = new MapleSendOpcode(254);
    static USER_HIRE_TUTOR = new MapleSendOpcode(255);
    static USER_TUTOR_MSG = new MapleSendOpcode(256);
    static INC_COMBO = new MapleSendOpcode(257);
    static USER_RANDOM_EMOTION = new MapleSendOpcode(258);
    static RESIGN_QUEST_RETURN = new MapleSendOpcode(259);
    static PASS_MATE_NAME = new MapleSendOpcode(260);
    static SET_RADIO_SCHEDULE = new MapleSendOpcode(261);
    static USER_OPEN_SKILL_GUIDE = new MapleSendOpcode(262);
    static USER_NOTICE_MSG = new MapleSendOpcode(263);
    static USER_CHAT_MSG = new MapleSendOpcode(264);
    static USER_BUFFZONE_EFFECT = new MapleSendOpcode(265);
    static USER_GO_TO_COMMODITY_SN = new MapleSendOpcode(266);
    static USER_DAMAGE_METER = new MapleSendOpcode(267);
    static USER_TIME_BOMB_ATTACK = new MapleSendOpcode(268);
    static USER_PASSIVE_MOVE = new MapleSendOpcode(269);
    static USER_FOLLOW_CHARACTER_FAILED = new MapleSendOpcode(270);
    static USER_REQUEST_VENGEANCE = new MapleSendOpcode(271);
    static USER_REQUEST_EX_JABLIN = new MapleSendOpcode(272);
    static USER_ASK_APSP_EVENT = new MapleSendOpcode(273);
    static QUEST_GUIDE_RESULT = new MapleSendOpcode(274);
    static USER_DELIVERY_QUEST = new MapleSendOpcode(275);
    static SKILL_COOLTIME_SET = new MapleSendOpcode(276);
    // CSummonedPool::OnPacket
    static SUMMONED_ENTER_FIELD = new MapleSendOpcode(278);
    static SUMMONED_LEAVE_FIELD = new MapleSendOpcode(279);
    static SUMMONED_MOVE = new MapleSendOpcode(280);
    static SUMMONED_ATTACK = new MapleSendOpcode(281);
    static SUMMONED_SKILL = new MapleSendOpcode(282);
    static SUMMONED_HIT = new MapleSendOpcode(283);
    // CMobPool::OnPacket
    static MOB_ENTER_FIELD = new MapleSendOpcode(284);
    static MOB_LEAVE_FIELD = new MapleSendOpcode(285);
    static MOB_CHANGE_CONTROLLER = new MapleSendOpcode(286);
    static MOB_MOVE = new MapleSendOpcode(287);
    static MOB_CTRL_ACK = new MapleSendOpcode(288);
    static MOB_CTRL_HINT = new MapleSendOpcode(289);
    static MOB_STAT_SET = new MapleSendOpcode(290);
    static MOB_STAT_RESET = new MapleSendOpcode(291);
    static MOB_SUSPEND_RESET = new MapleSendOpcode(292);
    static MOB_AFFECTED = new MapleSendOpcode(293);
    static MOB_DAMAGED = new MapleSendOpcode(294);
    static MOB_SPECIAL_EFFECT_BY_SKILL = new MapleSendOpcode(295);
    static MOB_HP_CHANGE = new MapleSendOpcode(296);
    static MOB_CRC_KEY_CHANGED = new MapleSendOpcode(297);
    static MOB_HP_INDICATOR = new MapleSendOpcode(298);
    static MOB_CATCH_EFFECT = new MapleSendOpcode(299);
    static MOB_EFFECT_BY_ITEM = new MapleSendOpcode(300);
    static MOB_SPEAKING = new MapleSendOpcode(301);
    static MOB_CHARGE_COUNT = new MapleSendOpcode(302);
    static MOB_SKILL_DELAY = new MapleSendOpcode(303);
    static MOB_REQUEST_RESULT_ESCORT_INFO = new MapleSendOpcode(304);
    static MOB_ESCORT_STOP_END_PERMMISION = new MapleSendOpcode(305);
    static MOB_ESCORT_STOP_SAY = new MapleSendOpcode(306);
    static MOB_ESCORT_RETURN_BEFORE = new MapleSendOpcode(307);
    static MOB_NEXT_ATTACK = new MapleSendOpcode(308);
    static MOB_ATTACKED_BY_MOB = new MapleSendOpcode(309);
    // CNpcPool::OnPacket
    static NPC_ENTER_FIELD = new MapleSendOpcode(311);
    static NPC_LEAVE_FIELD = new MapleSendOpcode(312);
    static NPC_CHANGE_CONTROLLER = new MapleSendOpcode(313);
    static NPC_MOVE = new MapleSendOpcode(314);
    static NPC_UPDATE_LIMITED_INFO = new MapleSendOpcode(315);
    static NPC_SPECIAL_ACTION = new MapleSendOpcode(316);
    static NPC_SET_SCRIPT = new MapleSendOpcode(317);
    // CEmployeePool::OnPacket
    static EMPLOYEE_ENTER_FIELD = new MapleSendOpcode(319);
    static EMPLOYEE_LEAVE_FIELD = new MapleSendOpcode(320);
    static EMPLOYEE_MINI_ROOM_BALLOON = new MapleSendOpcode(321);
    // CDropPool::OnPacket
    static DROP_ENTER_FIELD = new MapleSendOpcode(322);
    static DROP_RELEASE_ALL_FREEZE = new MapleSendOpcode(323);
    static DROP_LEAVE_FIELD = new MapleSendOpcode(324);
    // CMessageBoxPool::OnPacket
    static CREATE_MESSGAE_BOX_FAILED = new MapleSendOpcode(325);
    static MESSAGE_BOX_ENTER_FIELD = new MapleSendOpcode(326);
    static MESSAGE_BOX_LEAVE_FIELD = new MapleSendOpcode(327);
    // CAffectedAreaPool::OnPacket
    static AFFECTED_AREA_CREATED = new MapleSendOpcode(328);
    static AFFECTED_AREA_REMOVED = new MapleSendOpcode(329);
    // CTownPortalPool::OnPacket
    static TOWN_PORTAL_CREATED = new MapleSendOpcode(330);
    static TOWN_PORTAL_REMOVED = new MapleSendOpcode(331);
    // COpenGatePool::OnPacket
    static OPEN_GATE_CREATED = new MapleSendOpcode(332);
    static OPEN_GATE_REMOVED = new MapleSendOpcode(333);
    // CReactorPool::OnPacket
    static REACTOR_CHANGE_STATE = new MapleSendOpcode(334);
    static REACTOR_MOVE = new MapleSendOpcode(335);
    static REACTOR_ENTER_FIELD = new MapleSendOpcode(336);
    static REACTOR_LEAVE_FIELD = new MapleSendOpcode(337);
    // CScriptMan::OnPacket
    static SCRIPT_MESSAGE = new MapleSendOpcode(363);
    // CShopDlg::OnPacket
    static OPEN_SHOP_DLG = new MapleSendOpcode(364);
    static SHOP_RESULT = new MapleSendOpcode(365);
    // CAdminShopDlg::OnPacket
    static ADMIN_SHOP_RESULT = new MapleSendOpcode(366);
    static ADMIN_SHOP_COMMODITY = new MapleSendOpcode(367);
    // CTrunkDlg::OnPacket
    static TRUNK_RESULT = new MapleSendOpcode(368);
    // CStoreBankDlg::OnPacket
    static STORE_BANK_GET_ALL_RESULT = new MapleSendOpcode(369);
    static STORE_BANK_RESULT = new MapleSendOpcode(370);
    // CRPSGameDlg::OnPacket
    static RPS_GAME = new MapleSendOpcode(371);
    // CUIMessenger::OnPacket
    static MESSENGER = new MapleSendOpcode(372);
    // CMiniRoomBaseDlg::OnPacketBase
    static MINI_ROOM = new MapleSendOpcode(373);
    // CParcelDlg::OnPacket
    static PARCEL = new MapleSendOpcode(381);
    // CFuncKeyMappedMan::OnPacket
    static FUNC_KEY_MAPPED_INIT = new MapleSendOpcode(398);
    static PET_CONSUME_ITEM_INIT = new MapleSendOpcode(399);
    static PET_CONSUME_MP_ITEM_INIT = new MapleSendOpcode(400);
    // CMapleTVMan::OnPacket
    static MAPLE_TV_UPDATE_MESSAGE = new MapleSendOpcode(405);
    static MAPLE_TV_CLEAR_MESSAGE = new MapleSendOpcode(406);
    static MAPLE_TV_SEND_MESSAGE_RESULT = new MapleSendOpcode(407);
    // CUICharacterSaleDlg::OnPacket
    static CHECK_DUPLICATED_ID_RESULT_IN_CS = new MapleSendOpcode(413);
    static CREATE_NEW_CHARACTER_RESULT_IN_CS = new MapleSendOpcode(414);
    static CREATE_NEW_CHARACTER_FAIL_IN_CS = new MapleSendOpcode(415);
    static CHARACTER_SALE = new MapleSendOpcode(416);
    // CBattleRecordMan::OnPacket
    static BATTLE_RECORD_DOT_DAMAGE_INFO = new MapleSendOpcode(421);
    static BATTLE_RECORD_REQUEST_RESULT = new MapleSendOpcode(422);
    // CUIItemUpgrade::OnPacket
    static ITEM_UPGRADE_RESULT = new MapleSendOpcode(425);
    static ITEM_UPGRADE_FAIL = new MapleSendOpcode(426);
    // CUIVega::OnPacket
    static VEGA_RESULT = new MapleSendOpcode(429);
    // -----------------------------------------------------------------------------------------------------------------
    // CField_ContiMove::OnPacket
    static CONTIMOVE = new MapleSendOpcode(164);
    static CONTISTATE = new MapleSendOpcode(165);
    // CField_Massacre::OnPacket
    static MASSACRE_INC_GAUGE = new MapleSendOpcode(173);
    // CField_MassacreResult::OnPacket
    static MASSACRE_RESULT = new MapleSendOpcode(174);
    // CField_KillCount::OnPacket
    static FIELD_KILL_COUNT = new MapleSendOpcode(178);
    // CField_SnowBall::OnPacket
    static SNOW_BALL_STATE = new MapleSendOpcode(338);
    static SNOW_BALL_HIT = new MapleSendOpcode(339);
    static SNOW_BALL_MSG = new MapleSendOpcode(340);
    static SNOW_BALL_TOUCH = new MapleSendOpcode(341);
    // CField_Coconut::OnPacket
    static COCONUT_HIT = new MapleSendOpcode(342);
    static COCONUT_SCORE = new MapleSendOpcode(343);
    // CField_GuildBoss::OnPacket
    static HEALER_MOVE = new MapleSendOpcode(344);
    static PULLEY_STATE_CHANGE = new MapleSendOpcode(345);
    // CField_MonsterCarnival::OnPacket | CField_MonsterCarnivalRevive::OnPacket
    static M_CARNIVAL_ENTER = new MapleSendOpcode(346);
    static M_CARNIVAL_PERSONAL_CP = new MapleSendOpcode(347);
    static M_CARNIVAL_TEAM_CP = new MapleSendOpcode(348);
    static M_CARNIVAL_RESULT_SUCCESS = new MapleSendOpcode(349);
    static M_CARNIVAL_RESULT_FAIL = new MapleSendOpcode(350);
    static M_CARNIVAL_DEATH = new MapleSendOpcode(351);
    static M_CARNIVAL_MEMBER_OUT = new MapleSendOpcode(352);
    static M_CARNIVAL_GAME_RESULT = new MapleSendOpcode(353);
    // CField_AriantArena::OnPacket
    static SHOW_ARENA_RESULT = new MapleSendOpcode(171);
    static ARENA_SCORE = new MapleSendOpcode(354);
    // CField_Battlefield::OnPacket
    static BATTLEFIELD_ENTER = new MapleSendOpcode(355);
    static BATTLEFIELD_SCORE = new MapleSendOpcode(356);
    static BATTLEFIELD_TEAM_CHANGED = new MapleSendOpcode(357);
    // CField_Witchtower::OnPacket
    static WITCHTOWER_SCORE = new MapleSendOpcode(358);
    // CField_Tournament::OnPacket
    static TOURNAMENT = new MapleSendOpcode(374);
    static TOURNAMENT_MATCH_TABLE = new MapleSendOpcode(375);
    static TOURNAMENT_SET_PRIZE = new MapleSendOpcode(376);
    static TOURNAMENT_NOTICE_UEW = new MapleSendOpcode(377);
    static TOURNAMENT_AVATAR_INFO = new MapleSendOpcode(378);
    // CField_Wedding::OnPacket
    static WEDDING_PROGRESS = new MapleSendOpcode(379);
    static WEDDING_CREMONY_END = new MapleSendOpcode(380);
    // -----------------------------------------------------------------------------------------------------------------
    // CCashShop::OnPacket
    static CASH_SHOP_CHARGE_PARAM_RESULT = new MapleSendOpcode(382);
    static CASH_SHOP_QUERY_CASH_RESULT = new MapleSendOpcode(383);
    static CASH_SHOP_CASH_ITEM_RESULT = new MapleSendOpcode(384);
    static CASH_SHOP_PURCHASE_EXP_CHANGED = new MapleSendOpcode(385);
    static CASH_SHOP_GIFT_MATE_INFO_RESULT = new MapleSendOpcode(386);
    static CASH_SHOP_CHECK_DUPLICATED_ID_RESULT = new MapleSendOpcode(387);
    static CASH_SHOP_CHECK_NAME_CHANGE_POSSIBLE_RESULT = new MapleSendOpcode(388);
    static CASH_SHOP_CHECK_TRANSFER_WORLD_POSSIBLE_RESULT = new MapleSendOpcode(390);
    static CASH_SHOP_GACHAPON_STAMP_ITEM_RESULT = new MapleSendOpcode(391);
    static CASH_SHOP_CASH_ITEM_GACHAPON_RESULT = new MapleSendOpcode(392);
    static CASH_SHOP_CASH_GACHAPON_OPEN_RESULT = new MapleSendOpcode(393);
    static CHANGE_MAPLE_POINT_RESULT = new MapleSendOpcode(394);
    static CASH_SHOP_ONE_A_DAY = new MapleSendOpcode(395);
    static CASH_SHOP_NOTICE_FREE_CASH_ITEM = new MapleSendOpcode(396);
    static CASH_SHOP_MEMBER_SHOP_RESULT = new MapleSendOpcode(397);
    // CITC::OnPacket
    static ITC_CHARGE_PARAM_RESULT = new MapleSendOpcode(410);
    static ITC_QUERY_CASH_RESULT = new MapleSendOpcode(411);
    static ITC_NORMAL_ITEM_RESULT = new MapleSendOpcode(412);
    static LOGOUT_GIFT = new MapleSendOpcode(432);

    code = -2;

    constructor(code: number) {
        this.code = code;
    }

    getValue(): number {
        return this.code;
    }
}
