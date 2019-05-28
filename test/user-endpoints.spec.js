const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('User Endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  /**
   * @description Register a user and populate their fields
   **/
  describe(`POST /api/user`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

    const requiredFields = ['username', 'password', 'name']

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
        name: 'test name',
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field]

        return supertest(app)
          .post('/api/user')
          .send(registerAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })

    it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userShortPassword)
        .expect(400, { error: `Password be longer than 8 characters` })
    })

    it(`responds 400 'Password be less than 72 characters' when long password`, () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73),
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userLongPassword)
        .expect(400, { error: `Password be less than 72 characters` })
    })

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' 1Aa!2Bb@',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordStartsSpaces)
        .expect(400, { error: `Password must not start or end with empty spaces` })
    })

    it(`responds 400 error when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        username: 'test username',
        password: '1Aa!2Bb@ ',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordEndsSpaces)
        .expect(400, { error: `Password must not start or end with empty spaces` })
    })

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: 'test username',
        password: '11AAaabb',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordNotComplex)
        .expect(400, { error: `Password must contain one upper case, lower case, number and special character` })
    })

    it(`responds 400 'User name already taken' when username isn't unique`, () => {
      const duplicateUser = {
        username: testUser.username,
        password: '11AAaa!!',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(duplicateUser)
        .expect(400, { error: `Username already taken` })
    })

    describe(`Given a valid user`, () => {
      it(`responds 201, serialized user with no password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.username).to.eql(newUser.username)
            expect(res.body.name).to.eql(newUser.name)
            expect(res.body).to.not.have.property('password')
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
          })
      })

      it(`stores the new user in db with bcryped password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(res =>
            db
              .from('user')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username)
                expect(row.name).to.eql(newUser.name)

                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          )
      })

      it(`inserts 1 language with words for the new user`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        }
        const expectedList = {
          name: 'Russian',
          total_score: 0,
          words: [
            { original: 'А а', translation: 'a', example: `"a" in car`, name: 'ah' },
            { original: 'Б б', translation: 'b', example: `"b" in bat`, name: 'beh' },
            { original: 'В в', translation: 'v', example: `"v" in van`, name: 'veh' },
            { original: 'Г г', translation: 'g', example: `"g" in go`, name: 'geh' },
            { original: 'Д д', translation: 'd', example: `"d" in dog`, name: 'deh' },
            { original: 'Е е', translation: 'ye', example: `"ye" in yet`, name: 'yeh' },
            { original: 'Ё ё', translation: 'yo', example: `"yo" in yonder`, name: 'yo' },
            { original: 'Ж ж', translation: 'zh', example: `"s" in measure or "g" in beige`, name: 'zheh' },
            { original: 'З з', translation: 'z', example: '"z" in zoo', name: 'zeh'},
            { original: 'И и', translation: 'ee', example: '"ee" in see', name: 'ee'},
            { original: 'Й й', translation: 'y', example: '"y" in boy or toy', name: 'ee kratkoyeh'},
            { original: 'К к', translation: 'k', example: '"k" in kitten or "c" in cat', name: 'kah'},
            { original: 'Л л', translation: 'l', example: '"l" in light', name: 'ehl'},
            { original: 'М м', translation: 'm', example: '"m" in mat', name: 'ehm'},
            { original: 'Н н', translation: 'n', example: '"n" in no', name: 'ehn'},
            { original: 'О о', translation: 'o', example: '"o" in bore or "a" in car', name: 'oh'},
            { original: 'П п', translation: 'p', example: '"p" in pot', name: 'peh'},
            { original: 'Р р', translation: 'r', example: '"r" in run', name: 'ehr'},
            { original: 'С с', translation: 's', example: '"s" in sam', name: 'ehs'},
            { original: 'Т т', translation: 't', example: '"t" in tap', name: 'teh'},
            { original: 'У у', translation: 'u', example: '"oo" in boot', name: 'oo'},
            { original: 'Ф ф', translation: 'f', example: '"f" in fat', name: 'ehf'},
            { original: 'Х х', translation: 'kh', example: '"h" in hello or "ch" in Scottish "loch" or German "bach"', name: 'khah'},
            { original: 'Ц ц', translation: 'ts', example: '"ts" in bits', name: 'tseh'},
            { original: 'Ч ч', translation: 'ch', example: '"ch" in chip', name: 'cheh'},
            { original: 'Ш ш', translation: 'sh', example: '"sh" in shut', name: 'shah'},
            { original: 'Щ щ', translation: 'shch', example: '"sh_ch" in fresh_cheese', name: 'schyah'},
            { original: 'Ъ ъ', translation: 'hard sign', example: 'means preceding letter is hard', name: 'tvyordiy znahk'},
            { original: 'Ы ы', translation: 'i', example: '"i" in ill', name: 'i'},
            { original: 'Ь ь', translation: 'soft sign', example: 'means preceding letter is soft', name: 'myagkeey znahk'},
            { original: 'Э э', translation: 'e', example: '"e" in pet', name: 'eh'},
            { original: 'Ю ю', translation: 'yu', example: '"u" in use or university', name: 'yoo'},
            { original: 'Я я', translation: 'ya', example: '"ya" in yard', name: 'yah'},
          ]
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .then(res =>
            /*
            get languages and words for user that were inserted to db
            */
            db.from('language').select(
              'language.*',
              db.raw(
                `COALESCE(
                  json_agg(DISTINCT word)
                  filter(WHERE word.id IS NOT NULL),
                  '[]'
                ) AS words`
              ),
            )
            .leftJoin('word', 'word.language_id', 'language.id')
            .groupBy('language.id')
            .where({ user_id: res.body.id })
          )
          .then(dbLists => {
            expect(dbLists).to.have.length(1)

            expect(dbLists[0].name).to.eql(expectedList.name)
            expect(dbLists[0].total_score).to.eql(0)

            const dbWords = dbLists[0].words
            expect(dbWords).to.have.length(
              expectedList.words.length
            )

            expectedList.words.forEach((expectedWord, w) => {
              expect(dbWords[w].original).to.eql(
                expectedWord.original
              )
              expect(dbWords[w].translation).to.eql(
                expectedWord.translation
              )
              expect(dbWords[w].memory_value).to.eql(1)
            })
          })
      })
    })
  })
})
