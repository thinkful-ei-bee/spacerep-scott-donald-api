'use strict';

const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
  hasUserWithUserName(db, username) {
    return db('user')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('user')
      .returning('*')
      .then(([user]) => user)
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    }
  },
  populateUserWords(db, user_id) {
    return db.transaction(async trx => {
      const [languageId] = await trx
        .into('language')
        .insert([
          { name: 'Russian', user_id },
        ], ['id'])

      // when inserting words,
      // we need to know the current sequence number
      // so that we can set the `next` field of the linked language
      const seq = await db
        .from('word_id_seq')
        .select('last_value')
        .first()

      const languageWords = [
        ['А а', 'a', '"a" in car', 'ah', 2],
        ['Б б', 'b', '"b" in bat', 'beh', 3],
        ['В в', 'v', '"v" in van', 'veh', 4],
        ['Г г', 'g', '"g" in go', 'geh', 5],
        ['Д д', 'd', '"d" in dog', 'deh', 6],
        ['Е е', 'ye', '"ye" in yet', 'yeh', 7],
        ['Ё ё', 'yo', '"yo" in yonder', 'yo', 8],
        ['Ж ж', 'zh', '"s" in measure or "g" in beige', 'zheh', 9],
        ['З з', 'z', '"z" in zoo', 'zeh', 10],
        ['И и', 'ee', '"ee" in see', 'ee', 11],
        ['Й й', 'y', '"y" in boy or toy', 'ee kratkoyeh', 12],
        ['К к', 'k', '"k" in kitten or "c" in cat', 'kah', 13],
        ['Л л', 'l', '"l" in light', 'ehl', 14],
        ['М м', 'm', '"m" in mat', 'ehm', 15],
        ['Н н', 'n', '"n" in no', 'ehn', 16],
        ['О о', 'o', '"o" in bore or "a" in car', 'oh', 17],
        ['П п', 'p', '"p" in pot', 'peh', 18],
        ['Р р', 'r', '"r" in run', 'ehr', 19],
        ['С с', 's', '"s" in sam', 'ehs', 20],
        ['Т т', 't', '"t" in tap', 'teh', 21],
        ['У у', 'u', '"oo" in boot', 'oo', 22],
        ['Ф ф', 'f', '"f" in fat', 'ehf', 23],
        ['Х х', 'kh', '"h" in hello or "ch" in Scottish "loch" or German "bach"', 'khah', 24],
        ['Ц ц', 'ts', '"ts" in bits', 'tseh', 25],
        ['Ч ч', 'ch', '"ch" in chip', 'cheh', 26],
        ['Ш ш', 'sh', '"sh" in shut', 'shah', 27],
        ['Щ щ', 'shch', '"sh_ch" in fresh_cheese', 'schyah', 28],
        ['Ъ ъ', 'hard sign', 'means preceding letter is hard', 'tvyordiy znahk', 29],
        ['Ы ы', 'i', '"i" in ill', 'i', 30],
        ['Ь ь', 'soft sign', 'means preceding letter is soft', 'myagkeey znahk', 31],
        ['Э э', 'e', '"e" in pet', 'eh', 32],
        ['Ю ю', 'yu', '"u" in use or university', 'yoo', 33],
        ['Я я', 'ya', '"ya" in yard', 'yah', null]
      ]

      const [languageHeadId] = await trx
        .into('word')
        .insert(
          languageWords.map(([original, translation, example, name, nextInc]) => ({
            language_id: languageId.id,
            original,
            translation,
            example,
            name,
            next: nextInc
              ? Number(seq.last_value) + nextInc
              : null
          })),
          ['id']
        )

      await trx('language')
        .where('id', languageId.id)
        .update({
          head: languageHeadId.id,
        })
    })
  },
};

module.exports = UserService;
