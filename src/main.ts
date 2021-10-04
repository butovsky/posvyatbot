import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const TelegramBot = require('node-telegram-bot-api')
const mysql = require('mysql')
const bot = new TelegramBot('1940171410:AAEJjnatGw21FWUMjWWqpU5hIuf0OADDSU8', {polling: true})

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pop",
  database: "database"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Соединение к базе успешно!");
  let sql = `create table if not exists ids(id int primary key auto_increment, username varchar(250), status varchar(250))`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Чек таблицы')
  });
});

const keyboard = [
  ["Расписание", "Расселение"],
  ["Трансфер", "Бар", "Must-read"],
  ['Медпомощь', 'Вытрезвители', 'Контакты'],
]

bot.on('text', msg => {
  if (msg.text.split(' ')[0] === '/alertmessagetoall' ||
      msg.text.split(' ')[0] === '/alertmessagetoorgs' ||
      msg.text.split(' ')[0] === '/deletebaringredient' ||
      msg.text.split(' ')[0] === '/returnbaringredient' ||
      msg.text.split(' ')[0] === '/deletebarcocktail' ||
      msg.text.split(' ')[0] === '/returnbarcocktail') {
        return
      } else {
  switch(msg.text) {
    case '/getbarcocktails':
    let sqlcocktails = 'select * from cocktails'
    con.query(sqlcocktails, function (err, result) {
      if (err) throw err;
      let message = ''
      result.forEach(query => {
        message += query.name + ": " + query.callback + '\n'
      })
      bot.sendMessage(msg.chat.id, message)
    });
    break
    case '/getbarcomponents':
      let sqlcomponents = 'select * from components'
    con.query(sqlcomponents, function (err, result) {
      if (err) throw err;
      let message = ''
      result.forEach(query => {
        message += query.component + ": " + query.callback + '\n'
      })
      bot.sendMessage(msg.chat.id, message)
    });
      break
    case '/start':
      let sql = `insert ignore into ids(id, username) values(${msg.chat.id}, '${msg.chat.username}')`
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("/start прожато\n" + (result.affectedRows ? 'Новый юзер!' : 'Привет снова'));
      });
      bot.sendMessage(msg.chat.id, "Привет", {
        "reply_markup": {
            "keyboard": keyboard
            }
        });
      break;
    case 'Трансфер':
      bot.sendMessage(msg.chat.id, "Как будешь добираться?", {
        "reply_markup": {
            "inline_keyboard": [
                [
                  {
                      text: "С группой",
                      callback_data: "transferGroups",
                  },
                ],
                [
                  {
                    text: "Своим ходом",
                    callback_data: "transferSelf",
                  }
                ]
            ],
        },
    });
    break;
    case 'Бар':
      bot.sendMessage(msg.chat.id, 'Учти, что чем позже ты зайдешь в этот раздел - тем больше шанс, что какие-то ингридиенты/коктейли уже закончились.\n\nВсегда лучше уточнить у бармена на стойке, если там вообще еще кто-то есть.', {
        "reply_markup": {
            "inline_keyboard": [
                [
                  {
                      text: "Барная карта",
                      callback_data: "barChart",
                  },
                ],
                [
                  {
                    text: "Я не знаю, что заказать",
                    callback_data: "barXZ",
                  }
                ],
                [
                  {
                    text: "Конструктор коктейлей",
                    callback_data: "barConstructor",
                  }
                ]
            ],
        },
    })
    break;
    case 'Медпомощь':
      bot.sendMessage(msg.chat.id, "Раздел в работе");
      break;
    case 'Вытрезвители':
      bot.sendMessage(msg.chat.id, "Раздел в работе");
      break;
    case 'Контакты':
      bot.sendMessage(msg.chat.id, "Раздел в работе");
      break;
    case 'Расписание':
      bot.sendMessage(msg.chat.id, "Раздел в работе")
      break
    case 'Расселение':
      bot.sendMessage(msg.chat.id, "Напиши свою фамилию с большой буквы", {reply_markup: {
        force_reply: true
    }}).then(apiMsg => {
      bot.onReplyToMessage(apiMsg.chat.id, apiMsg.message_id, msg => {
        let sql1 = "select person from rooms where person like '%" + msg.text + "%'"
        con.query(sql1, function (err, result, fields) {
          if (result.length > 1) {
            let messageMultiple = 'Напиши номер, который соответствует твоему имени и фамилии:\n'
            result.forEach(query => {
              messageMultiple += (result.indexOf(query) + 1) + ' - ' + query.person + '\n'
            })
            messageMultiple += '\n ???'
            bot.sendMessage(msg.chat.id, messageMultiple, {reply_markup: {
              force_reply: true
          }}).then(newApiMsg => {
            bot.onReplyToMessage(newApiMsg.chat.id, newApiMsg.message_id, msg => {
              let index = (Number(msg.text) - 1)
              checkPersons("select room from rooms where person = '" + result[index]?.person + "'", msg)
            })
          })    
          } else {
            let index = 0
            checkPersons("select room from rooms where person = '" + result[index]?.person + "'", msg)
          }
        })
      })
    });
      break;
    case 'Must-read':
      bot.sendMessage(msg.chat.id, "Здесь будут ссылки на важнейшие лонгриды.", {
        "reply_markup": {
            "inline_keyboard": [
                [
                  {
                      text: "Правила посвята",
                      callback_data: "rules",
                  },
                ],
                [
                  {
                    text: "Медсправка",
                    callback_data: "medic",
                  }
                ]
            ],
        },
    });
    break;
      }}
})

bot.onText(/\/alertmessagetoall (.+)/, (msg, match) => {
  const message = match[1]
  let sql = 'select id from ids'
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    result.forEach(query => {
      bot.sendMessage(query.id, message)
    })
  })
})

bot.onText(/\/alertmessagetoorgs (.+)/, (msg, match) => {
  const message = "ОРГАМ: " + match[1]
  let sql = "select id from ids where status = 'org'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    result.forEach(query => {
      bot.sendMessage(query.id, message)
    })
  })
})

bot.onText(/\/deletebarcomponent (.+)/, (msg, match) => {
  let sql = "update components set deleted = 1, deleted_on = '" + (new Date()).toTimeString() + "' where callback = '" + match[1] + "'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err
    let sql2 = "select * from components where callback = '" + match[1] + "'"
    con.query(sql2, function (err, result, fields) {
      let message = (result[0] ? result[0]?.component + ' удален(а)' : 'что-то пошло не так, проверь')
      bot.sendMessage(msg.chat.id, message)
    })
  })
})

bot.onText(/\/returnbarcomponent (.+)/, (msg, match) => {
  let sql = "update components set deleted = 0, deleted_on = '' where callback = '" + match[1] + "'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err
    let sql2 = "select * from components where callback = '" + match[1] + "'"
    con.query(sql2, function (err, result, fields) {
      let message = (result[0] ? result[0]?.component + ' возвращен(а)' : 'что-то пошло не так, проверь')
      bot.sendMessage(msg.chat.id, message)
    })
  })
})

bot.onText(/\/deletebarcocktail (.+)/, (msg, match) => {
  let sql = "update cocktails set deleted = 1, deleted_on = '" + (new Date()).toTimeString() + "' where callback = '" + match[1] + "'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err
    let sql2 = "select * from cocktails where callback = '" + match[1] + "'"
    con.query(sql2, function (err, result, fields) {
      let message = (result[0] ? result[0]?.name+ ' удален(а)' : 'что-то пошло не так, проверь')
      bot.sendMessage(msg.chat.id, message)
    })
  })
})

bot.onText(/\/returnbarcocktail (.+)/, (msg, match) => {
  let sql = "update cocktails set deleted = 0, deleted_on = '' where callback = '" + match[1] + "'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err
    let sql2 = "select * from cocktails where callback = '" + match[1] + "'"
    con.query(sql2, function (err, result, fields) {
      let message = (result[0] ? result[0].name + ' возвращен(а)' : 'что-то пошло не так, проверь')
      bot.sendMessage(msg.chat.id, message)
  })
})
})

bot.on("callback_query", (callbackQuery) => {
  const id = callbackQuery.message.chat.id
  bot.answerCallbackQuery(callbackQuery.id)
      .then(() => {
        if (callbackQuery.data.indexOf('long') !== -1 ||
        callbackQuery.data.indexOf('shot') !== -1 ||
        callbackQuery.data.indexOf('nonalco') !== -1) {
          let sql = "select * from cocktails where callback = '" + callbackQuery.data + "'"
          con.query(sql, function (err, result, fields) {
            if (err) throw err;
            bot.sendMessage(id, result[0].name + '\n\nТип: ' + result[0].type + '\n\nРецепт: ' + result[0].ingredients + '\n\nВкус: ' + result[0].taste + (result[0].strong === 1 ? '\n\nОсторожно: крепко!' : ''))
          })
        } else {
        switch (callbackQuery.data) {
          case 'rules':
            bot.sendMessage(id, "Раздел в работе");
            break
          case 'medic':
            bot.sendMessage(id, "Раздел в работе");
            break
          case 'transferGroup1':
            bot.sendMessage(id, "Имена, фотографии, номера телефонов ответственных 1 группы");
            break
          case 'transferGroup2':
            bot.sendMessage(id, 'Имена, фотографии, номера телефонов ответственных 2 группы')
            break
          case 'transferGroup3':
            bot.sendMessage(id, 'Имена, фотографии, номера телефонов ответственных 3 группы')
            break
          case 'кислый':
          case 'горький':
          case 'сладкий':
            const variants = ['водка', 'джин', 'виски', 'ром', 'текила']
            let message = 'Напиши номер ключевого ингредиента\n\n'
            variants.forEach(query => {
              message += (variants.indexOf(query) + 1) + ': ' + query + '\n'
            })
            message += '\nТолько число из приведенных!'
            bot.sendMessage(id, message, {reply_markup: {
              force_reply: true
          }}).then(apiMsg => {
            bot.onReplyToMessage(apiMsg.chat.id, apiMsg.message_id, msg => {
              const taste = callbackQuery.data
              const ingredient = variants[(Number(msg.text) - 1)]
              let sql = "select * from cocktails where taste = '" + taste + "' and key_ingr like '%" + ingredient + "%' and deleted = 0"
              con.query(sql, function (err, result, fields) {
                if (err) throw err;
                let barKeyboard = []
                result.forEach(query => {
                  barKeyboard.push([{
                    text: query.name,
                    callback_data: query.callback
                  }])
                }) 
                let message = (barKeyboard.length == 0 ? 'Ничего не найдено по твоему запросу :(\n\nПопробуй еще раз!' : 'Список коктейлей по твоему запросу:')
                bot.sendMessage(id, message, {
                  "reply_markup": {
                      "inline_keyboard": barKeyboard,
                  },
              });
                bot.sendMessage(id, "Также есть шанс, что, возможно, какие-то ингредиенты/коктейли уже закончились, либо ты неверно ввел свой запрос.", {
                  "reply_markup": {
                      "keyboard": keyboard,
                  },
              });
              })
            })
          })
            break
          case 'barConstructor':
            let sql1 = "select component from components where type = 'alco' and deleted = 0"
            con.query(sql1, function (err, result, fields) {
              if (err) throw err;
              let messageAlco = 'Вот список всех доступных алкогольных напитков:\n\n'
              let allAlco = []
              result.forEach(query => {
                allAlco.push(query.component)
              })
              messageAlco += allAlco.join(', ')
              bot.sendMessage(id, messageAlco, {reply_markup: {
                force_reply: true
            }}).then(apiMsg1 => {
              bot.onReplyToMessage(apiMsg1.chat.id, apiMsg1.message_id, msg1 => {
                const responseAlco = msg1.text
                let sql2 = "select component from components where type = 'non-alco' and deleted = 0"
                con.query(sql2, function (err, result, fields) {
              if (err) throw err;
              let messageNonAlco = 'Вот список всех доступных безалкогольных напитков:\n\n'
              let allNonAlco = []
              result.forEach(query => {
                allNonAlco.push(query.component)
              })
              messageNonAlco += allNonAlco.join(', ')
              bot.sendMessage(id, messageNonAlco, {reply_markup: {
                force_reply: true
            }}).then(apiMsg2 => {
              bot.onReplyToMessage(apiMsg2.chat.id, apiMsg2.message_id, msg2 => {
                const responseNonAlco = msg2.text
                let sql3 = "select component from components where type = 'syrup' and deleted = 0"
                con.query(sql3, function (err, result, fields) {
              if (err) throw err;
              let messageSyrups = 'Вот список всех доступных добавок:\n\n'
              let allSyrups = []
              result.forEach(query => {
                allSyrups.push(query.component)
              })
              messageSyrups += allSyrups.join(', ')
              bot.sendMessage(id, messageSyrups, {reply_markup: {
                force_reply: true
            }}).then(apiMsg3 => {
              bot.onReplyToMessage(apiMsg3.chat.id, apiMsg3.message_id, msg3 => {
              const responseSyrups = msg3.text
              const finalMessage = 'Выбранный алкоголь: ' + responseAlco + '\n\nВыбранная запивка: ' + responseNonAlco + '\n\nВыбранные добавки: ' + responseSyrups
              bot.sendMessage(id, finalMessage, {
                "reply_markup": {
                    "keyboard": keyboard,
                },
            })
            })
            })
          })
        })
            })
              })
            });
          })
        })
            break
          case 'barChart':
            bot.sendMessage(id, "Выбери тип напитка:", {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                        text: "Шоты",
                        callback_data: "шот",
                    },
                  ],
                  [
                    {
                        text: "Лонги",
                        callback_data: "лонг",
                    },
                  ],
                  [
                    {
                      text: "Безалко",
                      callback_data: "безалко",
                    }
                  ]
              ],
              }
            })
            break
          case 'шот':
          case 'лонг':
          case 'безалко':
            let sql = "select * from cocktails where type = '" + callbackQuery.data + "' and deleted = 0"
            con.query(sql, function (err, result, fields) {
              if (err) throw err;
              let barKeyboard = []
              result.forEach(query => {
                barKeyboard.push([{
                  text: query.name,
                  callback_data: query.callback
                }])
              })
              bot.sendMessage(id, "Список коктейлей:", {
                "reply_markup": {
                    "inline_keyboard": barKeyboard
                },
            });
            })
          break 
          case 'barXZ':
            bot.sendMessage(id, "Какой вкус ты хочешь?", {
              "reply_markup": {
                  "inline_keyboard": [
                      [
                        {
                            text: 'горький',
                            callback_data: 'горький',
                        },
                      ],
                      [
                        {
                          text: 'сладкий',
                          callback_data: 'сладкий',
                        }
                      ],
                      [
                        {
                          text: 'кислый',
                          callback_data: 'кислый',
                        }
                      ]
                  ],
              },
          });
          break;
          case 'transferGroups':
            bot.sendMessage(id, "Выбери свою группу", {
              "reply_markup": {
                  "inline_keyboard": [
                      [
                        {
                            text: "1 группа (15:00)",
                            callback_data: "transferGroup1",
                        },
                      ],
                      [
                        {
                          text: "2 группа (16:00)",
                          callback_data: "transferGroup2",
                        }
                      ],
                      [
                        {
                          text: "3 группа (17:00)",
                          callback_data: "transferGroup3",
                        }
                      ]
                  ],
              },
          });
          break
        case 'transferSelf':
          bot.sendMessage(id, "Здесь будет ссылка на гайд по трансферу в группе ВК");
          break
        }}
      });
});

function checkPersons(sql, msg) {
  con.query(sql, function (err, result, fields) {
    if (!err) {
      let messageText = 'Твоя комната: ' + result[0]?.room + '\n\nВ ней прописаны: \n'
      let sql3 = `select person from rooms where room = ${result[0]?.room}`
      con.query(sql3, function (err, result, fields) {
        if (!err) {
        result.forEach(query => {
          messageText += `${query.person}\n`
        })
        messageText += '\nПриятного отдыха!'
        bot.sendMessage(msg.chat.id, messageText, {
          "reply_markup": {
              "keyboard": keyboard
              }
          })
      } else {
        bot.sendMessage(msg.chat.id, 'Какая-то ошибка... Не можем найти твою фамилию!', {
          "reply_markup": {
              "keyboard": keyboard
              }
          })
      }
      })
      } else {
        bot.sendMessage(msg.chat.id, 'Какая-то ошибка... Не можем найти твою фамилию!', {
          "reply_markup": {
              "keyboard": keyboard
              }
          })
      }
    })
}

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
