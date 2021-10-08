import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const TelegramBot = require('node-telegram-bot-api')
const mysql = require('mysql')
const bot = new TelegramBot('1940171410:AAEJjnatGw21FWUMjWWqpU5hIuf0OADDSU8', {polling: true})

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "popp",
  database: "data",
  charset: "utf8"
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
  ['Медпомощь', 'Служба доверия', 'Контакты'],
]

bot.on('text', async msg => {
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
    case '/barguide228':
      bot.sendMessage(msg.chat.id, "Выбери тип напитка:", {
        "reply_markup": {
          "inline_keyboard": [
            [
              {
                  text: "Шоты",
                  callback_data: 'шот:рецепт',
              },
            ],
            [
              {
                  text: "Лонги",
                  callback_data: 'лонг:рецепт',
              },
            ],
            [
              {
                text: "Безалко",
                callback_data: 'безалко:рецепт',
              }
            ]
        ],
        }
      })
      break
    case '/varenje':
      bot.sendMessage(msg.chat.id, "https://t.me/TruePosvyat2021")
      break
    case '/sashagandon':
      bot.sendMessage(msg.chat.id, "/getbarcocktails")
      bot.sendMessage(msg.chat.id, "/getbarcomponents")
      bot.sendMessage(msg.chat.id, "/deletebarcocktail")
      bot.sendMessage(msg.chat.id, "/returnbarcocktail")
      bot.sendMessage(msg.chat.id, "/deletebarcomponent")
      bot.sendMessage(msg.chat.id, "/returnbarcomponent")
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
      bot.sendMessage(msg.chat.id, 'Учти, что чем позже ты зайдешь в этот раздел - тем больше шанс, что какие-то ингредиенты/коктейли уже закончились.\n\nВсегда лучше уточнить у бармена на стойке, если там вообще еще кто-то есть.', {
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
                ],
                [
                  {
                    text: "Контакты барменов",
                    callback_data: "barcall",
                  }
                ]
            ],
        },
    })
    break;
    case 'Медпомощь':
      await bot.sendMessage(msg.chat.id, "Ниже - контакты медиков на случай экстренных ситуаций.");
      await bot.sendPhoto(msg.chat.id,"./photos/olyamedic.jpg", {caption : "Оля\n\nТелефон - 89852475349\nТелега - @kyrinayanoga\nВК - vk.com/koshcheevna"});
      await bot.sendPhoto(msg.chat.id, "./photos/zoyamedic.jpg", {caption : "Зоя\n\nТелефон - 89215561985\nТелега - @gonehomezoe\nВК - vk.com/id171953220"})
      break;
    case 'Служба доверия':
    case 'Вытрезвители':
      await bot.sendMessage(msg.chat.id, "Ниже - контакты ребят, которые могут подставить плечо, если ты почувствовал(а) себя не в безопасности, а помощи рядом нет.");
      await bot.sendPhoto(msg.chat.id,"./photos/zhenyapolice.jpg", {caption : "Женя\n\nТелефон - 89825719216\nТелега - @gerardofsiberia\nВК - vk.com/bearbarbeer"});
      await bot.sendPhoto(msg.chat.id,"./photos/sashapolice.jpg", {caption : "Саша\n\nТелефон - 89269090131\nТелега - @sanyahan\nВК - vk.com/alex_alex_v"});
      await bot.sendPhoto(msg.chat.id,"./photos/vanyapolice.jpg", {caption : "Ваня\n\nТелефон - 89585023822\nТелега - @DieWeltAlsWilleUndVorstellung \nВК - vk.com/azmul"});
      await bot.sendPhoto(msg.chat.id, "./photos/romapolice.jpg", {caption : "Рома\n\nТелефон - 89821015988\nТелега - @romanzr78\nВК - vk.com/romzr78"})
      break;
    case 'Контакты':
      await bot.sendMessage(msg.chat.id, "Главорг посвята - Ксюша Егорова \n\nОбращаться по критическим вопросам, и если другие контакты не смогли помочь или недоступны.\n\nТелефон - 89855651573\nТелега - @ykseniia\nВК - vk.com/ykseniia");
      await bot.sendMessage(msg.chat.id, "Координатор по логистике - Алина Гавронина \n\nРасселение и трансфер.\n\nТелефон - 89134040557\nТелега - @tommoimi\nВК - vk.com/tommoimi");
      await bot.sendMessage(msg.chat.id, "Координатор по квесту - Кирилл Молотов \n\nВсе вопросы, касающиеся хода сюжетной части (потерял свою команду, возникли неполадки и т.д.).\n\nТелефон - 89859738832\nТелега - @ovoshina_v2\nВК - vk.com/kimolotov");
      await bot.sendMessage(msg.chat.id, "Разработчик бота - Саша Некрашевич \n\nПо проблемам, связанным с функционалом.\nТакже на связи во время всего квеста, если Кирилл недоступен или занят.\n\nТелефон - 89099588883\nТелега - @i11um8\nВК - vk.com/haseldev");
      break;
    case 'Расписание':
      bot.sendMessage(msg.chat.id, "Расписание предварительное! Скорее всего, будут изменения, о которых мы, конечно, сообщим сразу же!\n\n17:40 - прибытие первой группы трансфера с Женей и Надей\n17:55 - прибытие второй группы трансфера с Ваней и Аней\n18:00 - прибытие одинцовской группы трансфера с Зоей, Мишей и Настей\n18:15 - прибытие третей группы трансфера с Ниной и Сашей\n\n18:30 - 20:00 - ужин в столовой\n20:00 - начало официальной части в киноконцертном зале\n20:00 - 22:00 - официальная часть\n22:00 - 6:00 - неофициальная часть в дэнсхолле\n10:00 - 11:30 - завтрак\n\nВыезд до 11:45!", {
        "reply_markup": {
            "inline_keyboard": [
                [
                  {
                      text: "Диджейские сеты",
                      callback_data: "deejay",
                  },
                ],
            ],
        }
      })
      break
    case 'Расселение':
      bot.sendMessage(msg.chat.id, "Важно! Раздел находится в тестовом режиме, и пока что ты можешь только проверить наличие своей фамилии в базе (пока что номер - твой id).\nРаспределение по номерам будет позже, следи за обновлениями!\n\nНапиши свою фамилию с большой буквы", {reply_markup: {
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
                      text: "Что взять с собой",
                      callback_data: "bring",
                  },
                ],
                [
                  {
                    text: "Медсправка",
                    callback_data: "medic",
                  }
                ],
                [
                  {
                    text: "Руководство к боту",
                    callback_data: "documentation",
                  }
                ],
                [
                  {
                    text: "НЕ НАЖИМАТЬ",
                    callback_data: "resistance",
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
      try {
      bot.sendMessage(query.id, message)
      } catch (e) {
        console.log(e)
      }
    })
  })
})

bot.onText(/\/alertmessagetoorgs (.+)/, (msg, match) => {
  const message = "ОРГАМ: " + match[1]
  let sql = "select id from ids where status = 'org'"
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    result.forEach(query => {
      try {
        bot.sendMessage(query.id, message)
        } catch (e) {
          console.log(e)
        }
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
      .then(async () => {
        if ((callbackQuery.data.indexOf('рецепт') !== -1) && (callbackQuery.data.split(':')[0].indexOf('long') !== -1 ||
        callbackQuery.data.split(':')[0].indexOf('shot') !== -1 ||
        callbackQuery.data.split(':')[0].indexOf('nonalco') !== -1)) {
          let sql = "select * from cocktails where callback = '" + callbackQuery.data.split(':')[0] + "'"
          con.query(sql, function (err, result, fields) {
            if (err) throw err;
            bot.sendMessage(id, result[0].name + '\n\nТип: ' + result[0].type + '\n\nРецепт: ' + result[0].receipt)
          })
        } else if (callbackQuery.data.indexOf('long') !== -1 ||
        callbackQuery.data.indexOf('shot') !== -1 ||
        callbackQuery.data.indexOf('nonalco') !== -1) {
          let sql = "select * from cocktails where callback = '" + callbackQuery.data + "'"
          con.query(sql, function (err, result, fields) {
            if (err) throw err;
            bot.sendMessage(id, result[0].name + '\n\nТип: ' + result[0].type + '\n\nРецепт: ' + result[0].ingredients + '\n\nВкус: ' + result[0].taste + (result[0].strong === 1 ? '\n\nОсторожно: крепко!' : ''))
          })
        } else {
        switch (callbackQuery.data) {
          case 'шот:рецепт':
          case 'лонг:рецепт':
          case 'безалко:рецепт':
            let sqlreceipt = "select * from cocktails where type = '" + callbackQuery.data.split(':')[0] + "' and deleted = 0"
            con.query(sqlreceipt, function (err, result, fields) {
              if (err) throw err;
              let barKeyboard = []
              result.forEach(query => {
                let callback = query.callback + ':рецепт'
                barKeyboard.push([{
                  text: query.name,
                  callback_data: callback
                }])
              })
              bot.sendMessage(id, "Список коктейлей:", {
                "reply_markup": {
                    "inline_keyboard": barKeyboard
                },
            });
            })
          break 
          case 'deejay':
            bot.sendMessage(id, "22:00 - 23:30: dj egotripper\n23:30 - 01:00: dj butovsky & dj daha hot\n01:00 - 02:30: dj lesya & dj sasha p\n02:30 - 04:00: dj babygirl\n04:00 - 06:00: dj liz@ & dj s@sha")
            break
          case 'rules':
            bot.sendMessage(id, "Раздел в работе");
            break
          case 'medic':
            bot.sendMessage(id, "vk.com/@histposvyat21-medicinskaya-pamyatka");
            break
          case 'documentation':
            bot.sendMessage(id, "vk.com/@histposvyat21-iposvyat-bot-v2021-rukovodstvo")
            break
          case 'resistance':
            bot.sendMessage(id, "/varenje");
            break
          case 'bring':
            bot.sendMessage(id, "Раздел в работе")
            break
          case 'barcall':
            bot.sendMessage(id, "Деление на смены - достаточно условное, а сами бармены могут отойти покурить или потанцевать (тоже люди!).\nСтарайся не писать прям всем (для этого как раз деление на смены), и не бомбардируй личку того, кто временно отошел. Спасибо за понимание!\n\nКоординатор бара - Герман (@yunch)\n\nСмена с 22:00 по 00:00\n-\nГерман (@yunch)\nКсюша (@kseniya_tatarnikova)\nДарья (@dariadolmatova)\nСаша (@SunOwl)\n\nСмена с 00:00 по 02:00\n-\nГерман (@yunch) до часу\nСаша (@i11um8) с часу до двух\nСеня (@sench1ck)\nДаша (@qfwjyfh)\n\nСмена с 02:00 по 04:00\n-\nКсюша (@kseniya_tatarnikova)\n+ могут подключиться другие бармены, но лучше им не написывать - время уже будет позднее, и, сами понимаете, основной поток заказов уже позади.\n\nСмена с 04:00 по 06:00\n-\nПрости, но тут ты уже сам по себе.\nМожешь наливать на свой страх и риск, только НЕ ВОРУЙ - это главное правило бара, и его нарушение строго карается в дальнейшем.")
            break
          case 'transferGroup1':
            await bot.sendMessage(id, "1 группа. Сбор возле касс в 16:30, электричка в отправится в 16:44.\n\nВстреча возле пригородных касс Киевского вокзала. Электричка следует до станции Лесного городка. Полная стоимость билета 104 рубля, по студенческой скидке 52 руб, так что не забывайте социалку! Электричка идет около 40 минут, до самого пансионата еще около 15 минут пешком.\n\nВас сопроводят:")
            await bot.sendPhoto(id,"./photos/nadya.jpg", {caption : "Надя\n\nТелефон - 89099121014\nТелега - @reflexnet\nВК - vk.com/reflexiia"});
            await bot.sendPhoto(id, "./photos/jenya.jpg", {caption : "Женя\n\nТелефон - 89825719216\nТелега - @gerardofsiberia\nВК - vk.com/bearbarbeer"})
            break
          case 'transferGroup2':
            await bot.sendMessage(id, "2 группа. Сбор возле касс в в 16:45, электричка отправится в 16:57.\n\nВстреча возле пригородных касс Киевского вокзала. Электричка следует до станции Лесного городка. Полная стоимость билета 104 рубля, по студенческой скидке 52 руб, так что не забывайте социалку! Электричка идет около 40 минут, до самого пансионата еще около 15 минут пешком.\n\nВас сопроводят:")
            await bot.sendPhoto(id,"./photos/anya.jpg", {caption : "Аня\n\nТелефон - 89301670434\nТелега - @anntet25\nВК - vk.com/anntet25"});
            await bot.sendPhoto(id, "./photos/vanya.jpg", {caption : "Ваня\n\nТелефон - 89585023822\nТелега - @DieWeltAlsWilleUndVorstellung \nВК - vk.com/azmul"})
            break
          case 'transferGroup3':
            await bot.sendMessage(id, "3 группа. Сбор возле касс в 17:05, электричка отправится в 17:20.\n\nВстреча возле пригородных касс Киевского вокзала. Электричка следует до станции Лесного городка. Полная стоимость билета 104 рубля, по студенческой скидке 52 руб, так что не забывайте социалку! Электричка идет около 40 минут, до самого пансионата еще около 15 минут пешком.\n\nВас сопроводят:")
            await bot.sendPhoto(id,"./photos/nina.jpg", {caption : "Нина\n\nТелефон - 89689287097\nТелега - @lactevias\nВК - vk.com/lactevias"});
            await bot.sendPhoto(id, "./photos/sasha.jpg", {caption : "Саша\n\nТелефон - 89998309705\nТелега - @SunOwl\nВК - vk.com/id177177548"})
            break
          case 'transferGroup4':
            await bot.sendMessage(id, "Группа из Одинцово. Сбор на привокзальной площади возле лестницы в 17:00. 33 автобус отправится в 17:15, ехать около 35 минут.\n\nРасписание может быть неточным, но автобус точно ходит каждые 15-20 минут, так что вы доберетесь целыми и невредимыми. Стоимость автобуса около 50-70 рублей, лучше захватить наличные.\n\nВас сопроводит:")
            await bot.sendPhoto(id,"./photos/zoya.jpg", {caption : "Зоя\n\nТелефон - 89215561985\nТелега - @gonehomezoe\nВК - vk.com/id171953220"});
            break
          case 'transferGroup5':
            await bot.sendMessage(id, "Группа из Дубков. Сбор на площадке внутри Дубков в 17:10. 33 автобус отправится с остановки в 17:27, ехать около 20 минут.\n\nРасписание может быть неточным, но автобус точно ходит каждые 15-20 минут, так что вы доберетесь целыми и невредимыми. Стоимость автобуса около 50-70 рублей, лучше захватить наличные.\n\nВас сопроводят:")
            await bot.sendPhoto(id,"./photos/nastya.jpg", {caption : "Настя\n\nТелефон - 89027253012\nТелега - @ddarkst0rm\nВК - vk.com/id101385475"});
            await bot.sendPhoto(id,"./photos/misha.jpg", {caption : "Миша\n\nТелефон - 89601168819\nТелега - @ccaaiinnn\nВК - vk.com/cainnn"});
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
                            text: "Москва: 1 группа",
                            callback_data: "transferGroup1",
                        },
                      ],
                      [
                        {
                          text: "Москва: 2 группа",
                          callback_data: "transferGroup2",
                        }
                      ],
                      [
                        {
                          text: "Москва: 3 группа",
                          callback_data: "transferGroup3",
                        }
                      ],
                      [
                        {
                          text: "Одинцово",
                          callback_data: "transferGroup4",
                        }
                      ],
                      [
                        {
                          text: "Дубки",
                          callback_data: "transferGroup5",
                        }
                      ],
                  ],
              },
          });
          break
        case 'accept':
          bot.sendMessage(id, 'Раздел в работе')
          break
        case 'transferSelf':
          bot.sendMessage(id, "vk.com/@histposvyat21-samostoyatelnyi-transfer-gaid", {
            "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                        text: "Контакты встречающих",
                        callback_data: "accept",
                    },
                  ]
                ],
            },
          });
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
