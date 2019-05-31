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
      //checking for guess in req
      if (!guess)
        return res.status(400).json({
          error: `Missing 'guess' in request body`,
        })

      //getting head from db
      const head = await LanguageService.getHead(
        req.app.get('db'),
        req.user.id
      );
      
      //getting words from db
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        head[0].language_id
      );

      //finding the next head in words with nextHeadId
      const nextHeadId = head[0].next
      const nextHead = words.filter(word => word.id === nextHeadId)

      //getting language from db
      const lang = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      );

      //creating the blank linked list, LL
      const LL = new LinkedList;
      
      //inserting words into LL in next order
      buildLL(LL, head[0], words);

      //correct answer
      const correct = head[0].translation

      //declaring variables for guess check and later response
      let isCorrect;
      let memory_value;
      let wordCorrectCount = head[0].correct_count;
      let wordIncorrectCount = head[0].incorrect_count;
      let totalScore;

      //if guess is correct, memory_value times 2, correctCount and totalScore + 1
      //if incorrect, memory_value reset to 1 and incorrectCount + 1
      if (guess === correct) {
        isCorrect = true;
        memory_value = head[0].memory_value*2;
        wordCorrectCount = head[0].correct_count + 1;
        totalScore = lang.total_score + 1;
      } else {
        isCorrect = false;
        memory_value = 1;
        wordIncorrectCount = head[0].incorrect_count + 1;
        totalScore = lang.total_score;
      }

      //newIndex for current head
      let newIndex = memory_value;
      let overflow = false;

      //removing head from LL, re-insert at newIndex, or end if overflowing
      LL.remove(head[0]);

      //if newIndex overflowing list, reinsert head last, adjust newIndex, set overflow true
      //else, reinsert head at newIndex
      if(newIndex >= words.length - 1) {
        LL.insertLast(head[0]);
        newIndex = words.length - 1;
        overflow = true;
      } else{
        LL.insertAt(head[0], newIndex);
      }
      
      //create array with updated LL
      const newWords = display(LL);

      //build object to update current head in db
      //updating next, correcttCount, incorrectCount, and memory_value
      const headUpdate = {
        next: overflow ? null : newWords[newIndex + 1].id,
        correct_count: wordCorrectCount,
        incorrect_count: wordIncorrectCount,
        memory_value
      };
      
      //update current head in db
      await LanguageService.updateWord(
        req.app.get('db'),
        head[0].id,
        headUpdate
      );

      //build object to update item pointing to new head position
      //updating next, other values stay the same
      const prevUpdate = {
        next: head[0].id,
        correct_count: newWords[newIndex-1].correct_count,
        incorrect_count: newWords[newIndex-1].incorrect_count,
        memory_value: newWords[newIndex-1].memory_value
      }
      
      //update prev in db
      await LanguageService.updateWord(
        req.app.get('db'),
        newWords[newIndex - 1].id,
        prevUpdate
      );

      //update language in db with new totalScore and next head
      totalScore = await LanguageService.updateUserLanguage(
        req.app.get('db'),
        req.user.id,
        nextHeadId,
        totalScore
      );

      //example and name for res Obj
      const {example, name} = head[0];

      //res with nextWord and nextWord's data, current score, and answer to question
      res.json({
        nextWord: newWords[0].original,
        wordCorrectCount: nextHead[0].correct_count,
        wordIncorrectCount: nextHead[0].incorrect_count,
        totalScore: totalScore[0],
        // answer: `Correct Answer: '${correct}' Sound: ${example} Letter Name: '${name}'`,
        answer: {correct, example, name},
        isCorrect
      })
      next()
    } catch (error) {
      next(error)
    }
  });

module.exports = languageRouter;
