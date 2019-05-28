BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Russian', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "example", "name", "next")
VALUES
  (1, 1, 'А а', 'a', "'a' in car", 'ah', 2),
  (2, 1, 'Б б', 'b', "'b' in bat", 'beh', 3),
  (3, 1, 'В в', 'v', "'v' in van", 'veh', 4),
  (4, 1, 'Г г', 'g', "'g' in go", 'geh', 5),
  (5, 1, 'Д д', 'd', "'d' in dog", 'deh', 6),
  (6, 1, 'Е е', 'ye', "'ye' in yet", 'yeh', 7),
  (7, 1, 'Ё ё', 'yo', "'yo' in yonder", 'yo', 8),
  (8, 1, 'Ж ж', 'zh', "'s' in measure or 'g' in beige", 'zheh', 9),
  (9, 1, 'З з', 'z', "'z' in zoo", 'zeh', 10),
  (10, 1, 'И и', 'ee', "'ee' in see", 'ee', 11),
  (11, 1, 'Й й', 'y', "'y' in boy or toy", 'ee kratkoyeh', 12),
  (12, 1, 'К к', 'k', "'k' in kitten or 'c' in cat", 'kah', 13),
  (13, 1, 'Л л', 'l', "'l' in light", 'ehl', 14),
  (14, 1, 'М м', 'm', "'m' in mat", 'ehm', 15),
  (15, 1, 'Н н', 'n', "'n' in no", 'ehn', 16),
  (16, 1, 'О о', 'o', "'o' in bore or 'a' in car", 'oh', 17),
  (17, 1, 'П п', 'p', "'p' in pot", 'peh', 18),
  (18, 1, 'Р р', 'r', "'r' in run", 'ehr', 19),
  (19, 1, 'С с', 's', "'s' in sam", 'ehs', 20),
  (20, 1, 'Т т', 't', "'t' in tap", 'teh', 21),
  (21, 1, 'У у', 'u', "'oo' in boot", 'oo', 22),
  (22, 1, 'Ф ф', 'f', "'f' in fat", 'ehf', 23),
  (23, 1, 'Х х', 'kh', "'h' in hello or 'ch' in Scottish 'loch' or German 'bach'", 'khah', 24),
  (24, 1, 'Ц ц', 'ts', "'ts' in bits", 'tseh', 25),
  (25, 1, 'Ч ч', 'ch', "'ch' in chip", 'cheh', 26),
  (26, 1, 'Ш ш', 'sh', "'sh' in shut", 'shah', 27),
  (27, 1, 'Щ щ', 'shch', "'sh_ch' in fresh_cheese", 'schyah', 28),
  (28, 1, 'Ъ ъ', 'hard sign', "means preceding letter is hard", 'tvyordiy znahk', 29),
  (29, 1, 'Ы ы', 'i', "'i' in ill", 'i', 30),
  (30, 1, 'Ь ь', 'soft sign', "means preceding letter is soft", 'myagkeey znahk', 31),
  (31, 1, 'Э э', 'e', "'e' in pet", 'eh', 32),
  (32, 1, 'Ю ю', 'yu', "'u' in use or university", 'yoo', 33),
  (33, 1, 'Я я', 'ya', "'ya' in yard", 'yah', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
