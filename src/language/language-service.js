'use strict';

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'example',
        'name',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },
  
  getNextWord(db, user_id) {
    return db
      .from('word')
      .select(
        'original',
        'correct_count',
        'incorrect_count',
        'language_id'
      )
      .join('language', 'language.id', '=', 'word.language_id')
      .where('word.id', db.raw('language.head'))
      .andWhere({'language.user_id': user_id});
  },

  getTotalScore(db, user_id) {
    return db
      .from('language')
      .select('total_score')
      .where({ user_id });
  },

  getHead(db, user_id) {
    return db
      .from('word')
      .select(
        'original',
        'correct_count',
        'incorrect_count',
        'language_id',
        'translation',
        'example',
        //changed 'name' to word.name, not sure if it helped or hurt
        'word.name',
        'memory_value',
        'next',
        //changed 'id' to word.id, not sure if it helped or hurt
        'word.id'
      )
      .join('language', 'language.id', '=', 'word.language_id')
      .where('word.id', db.raw('language.head'))
      .andWhere({'language.user_id': user_id});
  },

  updateUserLanguage(db, user_id, head, total_score) {
    return db
      .into('language')
      .update({
        head,
        total_score
      })
      .where({user_id})
      .returning('total_score');
  },

  updateWord(db, id, update) {
    return db
      .into('word')
      .update({
        next: update.next,
        correct_count: update.correct_count,
        incorrect_count: update.incorrect_count,
        memory_value: update.memory_value,
      })
      .where({id})
      .returning('*');
  }
};

module.exports = LanguageService;
