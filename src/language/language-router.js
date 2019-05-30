'use strict';

const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { LinkedList } = require('../LinkedList');
const { buildLL, display } = require('../LL-helpers')

const jsonBodyParser = express.json()
const languageRouter = express.Router();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
    try {

      const word = await LanguageService.getNextWord(
        req.app.get('db'),
        req.user.id,
      );

      const score = await LanguageService.getTotalScore(
        req.app.get('db'),
        req.user.id,
      );
      
      res.json({
        nextWord: word[0].original,
        totalScore: score[0].total_score,
        wordCorrectCount: word[0].correct_count,
        wordIncorrectCount: word[0].incorrect_count 
      })
      next()
    } catch (error) {
      next(error)
    }
  });



languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {

    const { guess } = req.body
    
    try {

      if (!guess)
        return res.status(400).json({
          error: `Missing 'guess' in request body`,
        })

      const head = await LanguageService.getHead(
        req.app.get('db'),
        req.user.id
      );

      // console.log('head', head[0])

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        head[0].language_id
      );

      // console.log('words', words)

      const nextHead = words.filter(word => word.id === head[0].next)
    

      const lang = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      );


      const LL = new LinkedList;
      
      buildLL(LL, head[0], words);

      const correct = head[0].translation

      let isCorrect;
      let memory_value;
      let wordCorrectCount = head[0].correct_count;
      let wordIncorrectCount = head[0].incorrect_count;
      let totalScore;

      if (guess === correct) {
        isCorrect = true;
        memory_value = head[0].memory_value*2;
        wordCorrectCount = head[0].correct_count + 1;
        totalScore = lang.total_score + 1;
      } else {
        isCorrect = false;
        memory_value = 1;
        wordIncorrectCount = head[0].incorrect_count + 1;
        // totalScore = lang.total_score - 1;
        totalScore = lang.total_score;
      }

      const newHead = head[0].next


      //shifting the head within the linked list and
      //accounting for memory_value that's greater than number of words
      const newIndex = memory_value;

      LL.remove(head[0]);
      if(memory_value >= words.length) {
        LL.insertLast(head[0]);
        newIndex = words.length - 1;
      } else{
        LL.insertAt(head[0], memory_value);
      }
      

      const newWords = display(LL);
      console.log('newWords', newWords);

     

      //head.next = newWords[memory_value + 1].id
      //head.memory_value = memory_value
      //head.wordCorrectCount = wordCorrectCount
      //head.wordIncorrectCount = wordIncorrectCount
      const headUpdate = {
        next: newWords[newIndex + 1].id,
        correct_count: wordCorrectCount,
        incorrect_count: wordIncorrectCount,
        memory_value
      };
      // console.log('headUpdate:', headUpdate)
      // console.log('headUpdate ID:', head[0].id)

      await LanguageService.updateWord(
        req.app.get('db'),
        head[0].id,
        headUpdate
      );

      //newWords[memory_value].next = head.id
      const prevUpdate = {
        next: head[0].id,
        correct_count: newWords[newIndex-1].correct_count,
        incorrect_count: newWords[newIndex-1].incorrect_count,
        memory_value: newWords[newIndex-1].memory_value
      }
      // console.log('prevUpdate:', prevUpdate)
      // console.log('prevUpdate ID:', newWords[memory_value - 1].id)

      await LanguageService.updateWord(
        req.app.get('db'),
        newWords[newIndex - 1].id,
        prevUpdate
      );


      // next: update.next,
      //   correct_count: update.correct_count,
      //   incorrect_count: update.incorrect_count,
      //   memory_value: update.memory_value,



      //language.head = newHead
      //language.total_score = totalScore
      totalScore = await LanguageService.updateUserLanguage(
        req.app.get('db'),
        req.user.id,
        newHead,
        totalScore
      );

      const {example, name} = head[0];

      const resObj = {
        nextWord: newWords[0].original,
        wordCorrectCount,
        wordIncorrectCount,
        // totalScore,
        totalScore: totalScore[0],
        answer: `Correct Answer: '${correct}' Sound: ${example} Letter Name: '${name}'`,
        isCorrect
      }

      console.log('resObj', resObj)

      res.json({
        nextWord: newWords[0].original,
        // wordCorrectCount,
        wordCorrectCount: nextHead[0].correct_count,
        // wordIncorrectCount,
        wordIncorrectCount: nextHead[0].incorrect_count,
        // totalScore,
        totalScore: totalScore[0],
        answer: `Correct Answer: '${correct}' Sound: ${example} Letter Name: '${name}'`,
        isCorrect
      })
      next()
    } catch (error) {
      next(error)
    }
  });

module.exports = languageRouter;
