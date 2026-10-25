'use strict';
/* All player-facing text, German and British English. Map entries override the shared keys. */
const STR = {
  en: {
    tabs: {play: 'Play', board: 'Leaderboard', how: 'How to play'},
    langLabel: 'Language', mapLabel: 'Map', charLabel: 'Dog', outfitLabel: 'Outfit',
    start: 'Start running', resume: 'Keep running', again: 'Run again', menu: 'Main menu',
    best: 'Best', newBest: 'New best run!', familyBest: 'Family record!',
    eyebrowOver: 'Run complete', eyebrowPause: 'Paused',
    pauseTitle: 'Sniffing a lamppost', pauseBody: 'Take your time. Nobody is going anywhere.',
    hint: 'Tap or <kbd>Space</kbd> to jump, tap again in the air to double jump, hold for extra height. <kbd>P</kbd> pauses.',
    howHint: 'Land on enemies from above to boop them. Running into them costs a heart. Every 1,000 m a boss blocks the path.',
    rotate: 'Turn your phone sideways for the best view.',
    socksBank: n => n + (n === 1 ? ' sock' : ' socks') + ' collected',
    locked: n => n + ' more socks',
    st: {score: ' score', best: ' best', cake: ' cake', balls: ' balls', rare: ' rare', sock: ' sock', socks: ' socks', boops: ' boops', m: ' m', bosses: ' bosses'},
    boop: 'Boop! ', combo: 'Combo x', honk: 'HONK! ', kicked: 'Kicked! ', strike: 'Strike! +', zoomHit: 'Zoom! +',
    stash: 'Sock stash! +1 heart', stashPts: 'Sock stash! +250', stolen: 'Sock stolen! ', zoomies: 'ZOOMIES!', zoomOver: 'Zoomies over',
    spiky: 'Ow! Spiky!', splash: 'Splash!', paddle: 'Doggy paddle!', boing: 'Boing!',
    milestone: ' m! Kältebad earned', noFs: 'Fullscreen is not available here', zoomLabel: 'Zoomies', zenLabel: 'Lick mat',
    bossIncoming: n => n + ' is coming!', bossDown: n => n + ' defeated! Hearts refilled', bossHit: 'Hit!',
    bossEyebrow: 'Boss fight', bossTap: 'Tap to start the fight', bossTip: 'Dodge, then land on its head',
    bossShield: 'Golden hearts: only for this fight', bossWarn: 'Here it comes!',
    bossSteps: (hp, proj) => ['When the red ! flashes, the charge is coming.', 'Jump early and land on its head. ' + hp + ' hits and the boss is beaten.', proj ? 'Jump over the ' + proj + ' too.' : 'It hops about first. Wait for it to land.', 'You get 2 golden bonus hearts for the fight, and 3 hearts afterwards.'],
    honkSmall: 'honk!', cakePop: '+10', rarePop: '+25',
    sky: {sun: 'Golden hour', night: 'Night run', dawn: 'First light'},
    quips: {
      pigeon: ['Pigeon! Nope.', 'Coo... ouch'], high: ['Pigeon air strike!', 'Coo... ouch'],
      turkey: ['Gobble gobble, no thanks', 'Turkey ambush!'], squirrel: ['Squirrel!!', 'Too fast, too fluffy'],
      hedgehog: ['Ow! Spiky!', 'Prickly fellow'], goose: ['HONK. Fair enough.', 'The goose wins this one'],
      hoover: ['Not the hoover!', 'The hoover! Run!'], boss: ['Oof, the boss!', 'Too big to argue with'], proj: ['Incoming!', 'Ouch!']
    },
    rides: {
      capy: {label: 'Capy', go: 'Capy ride! Triple jump', bail: 'Capy bailed!', nap: 'Capy needs a nap'},
      marli: {label: 'Marly', go: 'Marly ride! Triple jump', bail: 'Marly ran off!', nap: 'Marly needs a nap'},
      fluffin: {label: 'Fluffin', go: 'Fluffin piggyback! Triple jump', bail: 'Fluffin hopped off!', nap: 'Fluffin needs a nap'}
    },
    chars: {
      fluffin: {name: 'Fluffin', desc: 'Golden Doodle. Hold jump while falling to glide.'},
      marli: {name: 'Marly', desc: 'Cream Labrador. Every snack counts double.'}
    },
    outfits: {none: 'Just fluffy', raincoat: 'Raincoat', bandana: 'Bandana', shades: 'Sunglasses', santa: 'Santa hat'},
    board: {nick: 'Your name', nickPh: 'e.g. Mama', you: ' (you)', someone: 'Someone', empty: 'No scores yet. The first run counts!',
      loading: 'Loading the leaderboard…', off: 'Your own best scores on this phone. The family leaderboard is coming next.',
      read: 'Your scores are only saved on this phone for now. To join the family leaderboard, ask Julian to invite you via Share with edit access, then reload the game. Your best scores are uploaded automatically.', error: 'The leaderboard could not be loaded. Your score still counts on this device.'},
    aria: {soundOff: 'Turn sound off', soundOn: 'Turn sound on', fsIn: 'Enter fullscreen', fsOut: 'Exit fullscreen', pause: 'Pause'},
    maps: {
      common: {
        name: 'Wimbledon Common', desc: 'Windmill, gorse and far too many pigeons.', day: 'Morning on the Common',
        overBody: m => m + ' m across the Common before the hearts ran out.', boss: 'The Giant Goose',
        st: {cake: ' cake', balls: ' tennis balls'},
        legend: [
          ['pigeon', 'Boop from above', 'Land on pigeons, turkeys and squirrels. Chain boops for double points.'],
          ['squirrel', 'Squirrel', 'Fast and bouncy. Time the jump and land on top.'],
          ['hedgehog', 'Hedgehog', 'Spiky on top. Jump over it, unless you are riding.'],
          ['goose', 'Canada goose', 'Needs two boops and gets very cross after the first.'],
          ['hoover', 'Robot hoover', 'Boop it and it shoots off, clearing everything ahead.'],
          ['plat_bench', 'Benches and logs', 'Jump up for the snacks on top.'],
          ['pit', 'Ponds', 'Falling in costs a heart. Fluffin paddles out.'],
          ['boss', 'The Giant Goose', 'First at 600 m, then every 1,000 m. Three boops on the head.'],
          ['ball', 'Tennis ball +5', 'Grab whole rows.'], ['cake', 'Cake +10', 'The original reason for running.'],
          ['sock', 'Sock +50', 'Steal 5 for an extra heart. Socks also unlock outfits.'],
          ['gold', 'Golden ball', 'Zoomies! 7 seconds of unstoppable.'],
          ['capy', 'Capybara', 'Hop on: takes one hit for you and allows a triple jump.']
        ]
      },
      weiher: {
        name: 'Würzbacher Weiher', desc: 'Annahof, swans, Fleischkäse and Lyoner.', day: 'Morning at the Weiher',
        overBody: m => m + ' m around the Weiher before the hearts ran out.', boss: 'The Swan King', proj: 'feathers',
        overTitles: ['Hauptsach gudd gess!', 'Allez hopp, one more go', 'Fluffin needs a lie-down', 'Beaten by a swan'],
        boop: 'Allez hopp! ', honk: 'HISS! ', honkSmall: 'hiss!', milestone: ' m! Time for a Lyoner', cakePop: 'Fleischkäse! +10', rarePop: 'Lyoner! +25',
        st: {cake: ' Fleischkäse', balls: ' apples', rare: ' Lyoner'},
        quips: {pigeon: ['Quack! Ouch.', 'Duck ambush!'], high: ['Heron dive!', 'Big grey bird, big ouch'], turkey: ['Wild boar! Nope.', 'Oink. Ouch.'], goose: ['Hiss. Fair enough.', 'The swan wins this one'], hoover: ['Runaway Bollerwagen!', 'Mind the cart!']},
        legend: [
          ['duck', 'Boop from above', 'Land on ducks, wild boar and squirrels. Chain boops for double points.'],
          ['boar', 'Wild boar', 'Straight out of the Saarland woods.'],
          ['heron', 'Grey heron', 'Glides in high. Stay low or land on its back.'],
          ['hedgehog', 'Hedgehog', 'Spiky on top. Jump over it, unless you are riding.'],
          ['swan', 'Swan', 'Needs two boops and hisses after the first.'],
          ['cart', 'Bollerwagen', 'Boop it and it rolls off, clearing everything ahead.'],
          ['plat_jetty', 'Jetties and pedalos', 'Hop across the water on them.'],
          ['pit', 'The Weiher', 'Falling in costs a heart.'],
          ['boss_swan', 'The Swan King', 'Every 1,000 m. Watch out for flying feathers.'],
          ['apple', 'Apple +5', 'Grab whole rows.'], ['fk', 'Fleischkäse +10', 'A thick slice in a Weck.'],
          ['lyoner', 'Lyoner +25', 'The whole ring. Rare.'], ['sock', 'Sock +50', 'Steal 5 for an extra heart.'],
          ['gold', 'Golden ball', 'Zoomies! 7 seconds of unstoppable.'],
          ['marli', 'Marly', 'Our cream Labrador. Ride him: one free hit and a triple jump.']
        ]
      },
      garden: {
        name: 'Jörg’s Garden', desc: 'Pool, sauna, carport, Oma Doris and Leberwurst.', day: 'Morning in Jörg’s garden',
        overBody: m => m + ' m through Jörg’s garden before the hearts ran out.', boss: 'The Mega Mower', proj: 'grass clumps',
        boop: 'Boop! ', honk: 'GRR! ', honkSmall: 'grr!', milestone: ' m! Sauna break earned', cakePop: 'Cheese! +10', rarePop: 'Leberwurst! +25',
        st: {cake: ' cheese', balls: ' treats', rare: ' Leberwurst'},
        overTitles: ['Off to the sauna', 'Oma Doris says well done', 'Fluffin needs a lie-down', 'Mown down by the mower'],
        quips: {pigeon: ['Blackbird! Rude.', 'Not the blackbird'], high: ['Magpie attack!', 'Shiny-thief!'], turkey: ['The fox!', 'Foxed again'], goose: ['Angry gnome!', 'Beaten by a gnome'], hoover: ['The mower!', 'Mind your paws!']},
        legend: [
          ['blackbird', 'Boop from above', 'Land on blackbirds, foxes and squirrels. Chain boops for double points.'],
          ['fox', 'Fox', 'Sneaks through the garden at night and in the day.'],
          ['magpie', 'Magpie', 'Swoops in high. Stay low or land on its back.'],
          ['hedgehog', 'Hedgehog', 'Spiky on top. Jump over it, unless you are riding.'],
          ['gnome', 'Garden gnome', 'Needs two boops. Very grumpy.'],
          ['mower', 'Robot mower', 'Boop it and it shoots off, clearing everything ahead.'],
          ['plat_carport', 'Carport and trampoline', 'Run over the carport roof. The trampoline sends you sky-high.'],
          ['pit', 'The pool', 'Falling in costs a heart. Unicorn floaties help.'],
          ['boss_mower', 'The Mega Mower', 'Every 1,000 m. Jump the flying grass.'],
          ['treat', 'Treat +5', 'Grab whole rows.'], ['cheese', 'Cheese +10', 'Little cubes, big joy.'],
          ['liver', 'Leberwurst +25', 'Rare and worth every jump.'],
          ['oma', 'Oma Doris', 'Pops by with an apple. Catch it for an extra heart.'],
          ['lickmat', 'Lick mat', 'Everything slows down for 6 seconds.'],
          ['sock', 'Sock +50', 'Steal 5 for an extra heart.'], ['gold', 'Golden ball', 'Zoomies! 7 seconds of unstoppable.'],
          ['marli', 'Marly', 'Ride him: one free hit and a triple jump.']
        ]
      },
      staden: {
        name: 'Saarbrücker Staden', desc: 'The Saar, Schwenker, Lyoner, Maggi and nutrias.', day: 'Morning on the Staden',
        overBody: m => m + ' m along the Saar before the hearts ran out.', boss: 'The Giant Nutria', proj: 'potatoes',
        overTitles: ['Hauptsach gudd gess!', 'Allez hopp, one more go', 'Ei jo, that was close', 'Out-gnawed by a nutria'],
        boop: 'Ei jo! ', honk: 'HISS! ', honkSmall: 'hiss!', milestone: ' m! Time for a Schwenker', cakePop: 'Schwenker! +10', rarePop: 'Maggi! +25',
        st: {cake: ' Schwenker', balls: ' potatoes', rare: ' Maggi'},
        quips: {pigeon: ['City pigeon! Ouch.', 'Coo... ouch'], high: ['Pigeon air strike!', 'From above!'], turkey: ['Nutria! Nope.', 'The nutria was quicker'], goose: ['Egyptian goose: HISS.', 'The goose wins this one'], hoover: ['Runaway e-scooter!', 'Who leaves these here?']},
        legend: [
          ['nutria', 'Boop from above', 'Land on nutrias, pigeons and squirrels. Chain boops for double points.'],
          ['nutria', 'Nutria', 'The Saar is full of them. Orange teeth, no manners.'],
          ['nilgans', 'Egyptian goose', 'Needs two boops and hisses after the first.'],
          ['scooter', 'E-scooter', 'Boop it and it shoots off, clearing everything ahead.'],
          ['plat_bridge', 'Old bridge and rowing boats', 'Cross the Saar over the stone bridge or hop across the boats.'],
          ['pit', 'The Saar', 'Falling in costs a heart.'],
          ['boss_nutria', 'The Giant Nutria', 'Every 1,000 m. Wears a miner’s helmet and throws potatoes. Glück auf!'],
          ['grumbeer', 'Grumbeer +5', 'Saarland for potato. Grab whole rows.'], ['schwenker', 'Schwenker +10', 'Straight off the swinging grill.'],
          ['maggi', 'Maggi +25', 'Goes on everything. Rare.'],
          ['kalle', 'The Schwenker man', 'Throws you a Lyoner ring. Catch it for an extra heart.'],
          ['sock', 'Sock +50', 'Steal 5 for an extra heart.'], ['gold', 'Golden ball', 'Zoomies! 7 seconds of unstoppable.'],
          ['marli', 'Marly', 'Ride him: one free hit and a triple jump.']
        ]
      }
    }
  },
  de: {
    tabs: {play: 'Spielen', board: 'Bestenliste', how: 'So geht’s'},
    langLabel: 'Sprache', mapLabel: 'Map', charLabel: 'Hund', outfitLabel: 'Outfit',
    start: 'Loslaufen', resume: 'Weiterlaufen', again: 'Nochmal laufen', menu: 'Hauptmenü',
    best: 'Rekord', newBest: 'Neuer Rekord!', familyBest: 'Familienrekord!',
    eyebrowOver: 'Lauf beendet', eyebrowPause: 'Pause',
    pauseTitle: 'Kurz an der Laterne schnüffeln', pauseBody: 'Lass dir Zeit. Hier läuft keiner weg.',
    hint: 'Tippen oder <kbd>Leertaste</kbd> zum Springen, in der Luft nochmal tippen für den Doppelsprung, gedrückt halten für mehr Höhe. <kbd>P</kbd> pausiert.',
    howHint: 'Von oben auf Gegner springen, um sie wegzustupsen. Reinlaufen kostet ein Herz. Alle 1.000 m versperrt ein Boss den Weg.',
    rotate: 'Handy quer halten, dann siehst du am meisten.',
    socksBank: n => n + (n === 1 ? ' Socke' : ' Socken') + ' gesammelt',
    locked: n => 'noch ' + n + ' Socken',
    st: {score: ' Punkte', best: ' Rekord', cake: ' Kuchen', balls: ' Bälle', rare: ' Bonus', sock: ' Socke', socks: ' Socken', boops: ' Stupser', m: ' m', bosses: ' Bosse'},
    boop: 'Stups! ', combo: 'Combo x', honk: 'HONK! ', kicked: 'Gekickt! ', strike: 'Strike! +', zoomHit: 'Zoom! +',
    stash: 'Sockenvorrat! +1 Herz', stashPts: 'Sockenvorrat! +250', stolen: 'Socke geklaut! ', zoomies: 'ZOOMIES!', zoomOver: 'Zoomies vorbei',
    spiky: 'Au! Stachelig!', splash: 'Platsch!', paddle: 'Hundepaddeln!', boing: 'Boing!',
    milestone: ' m! Kältebad verdient', noFs: 'Vollbild ist hier nicht verfügbar', zoomLabel: 'Zoomies', zenLabel: 'Leckmatte',
    bossIncoming: n => n + ' kommt!', bossDown: n => n + ' besiegt! Herzen aufgefüllt', bossHit: 'Treffer!',
    bossEyebrow: 'Bosskampf', bossTap: 'Tippen, um loszulegen', bossTip: 'Ausweichen, dann auf den Kopf springen',
    bossShield: 'Goldene Herzen: nur für diesen Kampf', bossWarn: 'Achtung, er kommt!',
    bossSteps: (hp, proj) => ['Sobald das rote ! blinkt, kommt der Angriff.', 'Früh abspringen und auf dem Kopf landen. ' + hp + ' Treffer, dann ist der Boss besiegt.', proj ? 'Spring auch über die ' + proj + '.' : 'Erst hüpft sie herum. Warte, bis sie landet.', 'Für den Kampf gibt es 2 goldene Bonusherzen, danach wieder 3 Herzen.'],
    honkSmall: 'tröt!', cakePop: '+10', rarePop: '+25',
    sky: {sun: 'Goldene Stunde', night: 'Nachtlauf', dawn: 'Morgendämmerung'},
    quips: {
      pigeon: ['Taube! Nein danke.', 'Gurr... autsch'], high: ['Tauben-Luftangriff!', 'Gurr... autsch'],
      turkey: ['Kollerkoller, nein danke', 'Truthahn-Hinterhalt!'], squirrel: ['Eichhörnchen!!', 'Zu schnell, zu flauschig'],
      hedgehog: ['Au! Stachelig!', 'Pieksiger Kerl'], goose: ['HONK. Na gut.', 'Die Gans gewinnt'],
      hoover: ['Nicht der Staubsauger!', 'Der Staubsauger! Lauf!'], boss: ['Uff, der Boss!', 'Zu groß zum Diskutieren'], proj: ['Achtung!', 'Autsch!']
    },
    rides: {
      capy: {label: 'Capy', go: 'Capy-Ritt! Dreifachsprung', bail: 'Capy ist abgehauen!', nap: 'Capy braucht ein Nickerchen'},
      marli: {label: 'Marly', go: 'Marly-Ritt! Dreifachsprung', bail: 'Marly ist abgehauen!', nap: 'Marly braucht ein Nickerchen'},
      fluffin: {label: 'Fluffin', go: 'Huckepack mit Fluffin! Dreifachsprung', bail: 'Fluffin ist abgesprungen!', nap: 'Fluffin braucht ein Nickerchen'}
    },
    chars: {
      fluffin: {name: 'Fluffin', desc: 'Golden Doodle. Sprung im Fallen halten, um zu gleiten.'},
      marli: {name: 'Marly', desc: 'Cremefarbener Labrador. Jeder Snack zählt doppelt.'}
    },
    outfits: {none: 'Einfach flauschig', raincoat: 'Regencape', bandana: 'Halstuch', shades: 'Sonnenbrille', santa: 'Nikolausmütze'},
    board: {nick: 'Dein Name', nickPh: 'z. B. Mama', you: ' (du)', someone: 'Jemand', empty: 'Noch keine Einträge. Der erste Lauf zählt!',
      loading: 'Bestenliste wird geladen…', off: 'Deine eigenen Rekorde auf diesem Handy. Die Familien-Bestenliste kommt als Nächstes.',
      read: 'Deine Rekorde werden gerade nur auf diesem Handy gespeichert. Damit sie in die Familien-Bestenliste kommen, bitte Julian, dich über „Teilen“ mit Bearbeitungsrechten einzuladen, und lade das Spiel danach neu. Deine Bestwerte werden dann automatisch übertragen.', error: 'Die Bestenliste konnte nicht geladen werden. Dein Rekord zählt trotzdem auf diesem Gerät.'},
    aria: {soundOff: 'Ton aus', soundOn: 'Ton an', fsIn: 'Vollbild', fsOut: 'Vollbild beenden', pause: 'Pause'},
    maps: {
      common: {
        name: 'Wimbledon Common', desc: 'Windmühle, Ginster und viel zu viele Tauben.', day: 'Morgen auf dem Common',
        overBody: m => m + ' m über den Common, bis die Herzen alle waren.', boss: 'Die Riesengans',
        st: {cake: ' Kuchen', balls: ' Tennisbälle'},
        legend: [
          ['pigeon', 'Von oben stupsen', 'Lande auf Tauben, Truthähnen und Eichhörnchen. Mehrere hintereinander geben doppelte Punkte.'],
          ['squirrel', 'Eichhörnchen', 'Schnell und hüpfend. Timing ist alles.'],
          ['hedgehog', 'Igel', 'Oben stachelig. Drüberspringen, außer du reitest.'],
          ['goose', 'Kanadagans', 'Braucht zwei Stupser und wird richtig sauer.'],
          ['hoover', 'Saugroboter', 'Draufspringen, dann schießt er los und räumt alles ab.'],
          ['plat_bench', 'Bänke und Baumstämme', 'Hochspringen, oben liegen Snacks.'],
          ['pit', 'Teiche', 'Reinfallen kostet ein Herz. Fluffin paddelt raus.'],
          ['boss', 'Die Riesengans', 'Zuerst bei 600 m, dann alle 1.000 m. Dreimal auf den Kopf springen.'],
          ['ball', 'Tennisball +5', 'Ganze Reihen einsammeln.'], ['cake', 'Kuchen +10', 'Der eigentliche Grund fürs Laufen.'],
          ['sock', 'Socke +50', '5 Stück geben ein Extra-Herz. Socken schalten auch Outfits frei.'],
          ['gold', 'Goldener Ball', 'Zoomies! 7 Sekunden unaufhaltsam.'],
          ['capy', 'Capybara', 'Aufsteigen: fängt einen Treffer ab, Dreifachsprung.']
        ]
      },
      weiher: {
        name: 'Würzbacher Weiher', desc: 'Annahof, Schwäne, Fleischkäse und Lyoner.', day: 'Morgen am Weiher',
        overBody: m => m + ' m rund um den Weiher, bis die Herzen alle waren.', boss: 'Der Schwanenkönig', proj: 'Federn',
        overTitles: ['Hauptsach gudd gess!', 'Allez hopp, nochmal!', 'Fluffin muss sich ausruhen', 'Vom Schwan besiegt'],
        boop: 'Allez hopp! ', honk: 'ZISCH! ', honkSmall: 'zisch!', milestone: ' m! Zeit für ’ne Lyoner', cakePop: 'Fleischkäse! +10', rarePop: 'Lyoner! +25',
        st: {cake: ' Fleischkäse', balls: ' Äpfel', rare: ' Lyoner'},
        quips: {pigeon: ['Quak! Autsch.', 'Enten-Hinterhalt!'], high: ['Reiher im Sturzflug!', 'Großer grauer Vogel, großes Autsch'], turkey: ['Wildsau! Nee.', 'Grunz. Autsch.'], goose: ['Zisch. Na gut.', 'Der Schwan gewinnt'], hoover: ['Bollerwagen außer Kontrolle!', 'Pass auf den Wagen auf!']},
        legend: [
          ['duck', 'Von oben stupsen', 'Lande auf Enten, Wildschweinen und Eichhörnchen. Mehrere hintereinander geben doppelte Punkte.'],
          ['boar', 'Wildschwein', 'Direkt aus dem Saarland-Wald.'],
          ['heron', 'Graureiher', 'Gleitet hoch heran. Unten bleiben oder auf dem Rücken landen.'],
          ['hedgehog', 'Igel', 'Oben stachelig. Drüberspringen, außer du reitest.'],
          ['swan', 'Schwan', 'Braucht zwei Stupser und faucht nach dem ersten.'],
          ['cart', 'Bollerwagen', 'Draufspringen, dann rollt er los und räumt alles ab.'],
          ['plat_jetty', 'Stege und Tretboote', 'Darauf übers Wasser hüpfen.'],
          ['pit', 'Der Weiher', 'Reinfallen kostet ein Herz.'],
          ['boss_swan', 'Der Schwanenkönig', 'Alle 1.000 m. Vorsicht vor fliegenden Federn.'],
          ['apple', 'Apfel +5', 'Ganze Reihen einsammeln.'], ['fk', 'Fleischkäse +10', 'Eine dicke Scheibe im Weck.'],
          ['lyoner', 'Lyoner +25', 'Der ganze Ring. Selten.'], ['sock', 'Socke +50', '5 Stück geben ein Extra-Herz.'],
          ['gold', 'Goldener Ball', 'Zoomies! 7 Sekunden unaufhaltsam.'],
          ['marli', 'Marly', 'Unser cremefarbener Labrador. Draufreiten: ein Freitreffer und Dreifachsprung.']
        ]
      },
      garden: {
        name: 'Jörgs Garten', desc: 'Pool, Sauna, Carport, Oma Doris und Leberwurst.', day: 'Morgen in Jörgs Garten',
        overBody: m => m + ' m durch Jörgs Garten, bis die Herzen alle waren.', boss: 'Der Mega-Mäher', proj: 'Grasbüschel',
        boop: 'Stups! ', honk: 'GRR! ', honkSmall: 'grr!', milestone: ' m! Saunagang verdient', cakePop: 'Käse! +10', rarePop: 'Leberwurst! +25',
        st: {cake: ' Käse', balls: ' Leckerli', rare: ' Leberwurst'},
        overTitles: ['Ab in die Sauna', 'Oma Doris ist stolz', 'Fluffin braucht eine Pause', 'Vom Mäher erwischt'],
        quips: {pigeon: ['Amsel! Frechheit.', 'Nicht die Amsel'], high: ['Elster im Anflug!', 'Diebische Elster!'], turkey: ['Der Fuchs!', 'Ausgefuchst'], goose: ['Böser Gartenzwerg!', 'Vom Zwerg besiegt'], hoover: ['Der Mähroboter!', 'Pfoten weg vom Mäher!']},
        legend: [
          ['blackbird', 'Von oben stupsen', 'Lande auf Amseln, Füchsen und Eichhörnchen. Mehrere hintereinander geben doppelte Punkte.'],
          ['fox', 'Fuchs', 'Schleicht neuerdings durch den Garten.'],
          ['magpie', 'Elster', 'Fliegt hoch heran. Unten bleiben oder auf dem Rücken landen.'],
          ['hedgehog', 'Igel', 'Oben stachelig. Drüberspringen, außer du reitest.'],
          ['gnome', 'Gartenzwerg', 'Braucht zwei Stupser. Sehr grimmig.'],
          ['mower', 'Mähroboter', 'Draufspringen, dann schießt er los und räumt alles ab.'],
          ['plat_carport', 'Carport und Trampolin', 'Übers Carport-Dach laufen. Das Trampolin schießt dich hoch.'],
          ['pit', 'Der Pool', 'Reinfallen kostet ein Herz. Einhorn-Schwimmringe helfen.'],
          ['boss_mower', 'Der Mega-Mäher', 'Alle 1.000 m. Über das fliegende Gras springen.'],
          ['treat', 'Leckerli +5', 'Ganze Reihen einsammeln.'], ['cheese', 'Käse +10', 'Kleine Würfel, große Freude.'],
          ['liver', 'Leberwurst +25', 'Selten und jeden Sprung wert.'],
          ['oma', 'Oma Doris', 'Kommt mit einem Apfel vorbei. Fangen gibt ein Extra-Herz.'],
          ['lickmat', 'Leckmatte', 'Alles läuft 6 Sekunden in Zeitlupe.'],
          ['sock', 'Socke +50', '5 Stück geben ein Extra-Herz.'], ['gold', 'Goldener Ball', 'Zoomies! 7 Sekunden unaufhaltsam.'],
          ['marli', 'Marly', 'Draufreiten: ein Freitreffer und Dreifachsprung.']
        ]
      },
      staden: {
        name: 'Saarbrücker Staden', desc: 'Saar, Schwenker, Lyoner, Maggi und Nutrias.', day: 'Morgen am Staden',
        overBody: m => m + ' m an der Saar entlang, bis die Herzen alle waren.', boss: 'Die Riesen-Nutria', proj: 'Grumbeere',
        overTitles: ['Hauptsach gudd gess!', 'Allez hopp, nommol!', 'Ei jo, dat war knapp', 'Die Nutria war schneller'],
        boop: 'Ei jo! ', honk: 'ZISCH! ', honkSmall: 'zisch!', milestone: ' m! Zeit für e Schwenker', cakePop: 'Schwenker! +10', rarePop: 'Maggi! +25',
        st: {cake: ' Schwenker', balls: ' Grumbeere', rare: ' Maggi'},
        quips: {pigeon: ['Stadttaube! Autsch.', 'Gurr... aua'], high: ['Tauben-Sturzflug!', 'Von owwe!'], turkey: ['Nutria! Nää.', 'Die Nutria war schneller'], goose: ['Nilgans: ZISCH.', 'Die Nilgans gewinnt'], hoover: ['E-Scooter! Obacht!', 'Wer stellt die Dinger hier ab?']},
        legend: [
          ['nutria', 'Von oben stupsen', 'Lande auf Nutrias, Tauben und Eichhörnchen. Mehrere hintereinander geben doppelte Punkte.'],
          ['nutria', 'Nutria', 'Die Saar ist voll davon. Orange Zähne, keine Manieren.'],
          ['nilgans', 'Nilgans', 'Braucht zwei Stupser und zischt nach dem ersten.'],
          ['scooter', 'E-Scooter', 'Draufspringen, dann schießt er los und räumt alles ab.'],
          ['plat_bridge', 'Alte Brücke und Ruderboote', 'Über die Steinbrücke oder von Boot zu Boot über die Saar.'],
          ['pit', 'Die Saar', 'Reinfallen kostet ein Herz.'],
          ['boss_nutria', 'Die Riesen-Nutria', 'Alle 1.000 m. Mit Grubenhelm, wirft mit Grumbeere. Glück auf!'],
          ['grumbeer', 'Grumbeer +5', 'Ganze Reihen einsammeln.'], ['schwenker', 'Schwenker +10', 'Frisch vom Schwenkgrill.'],
          ['maggi', 'Maggi +25', 'Kommt überall drauf. Selten.'],
          ['kalle', 'Der Schwenker-Mann', 'Wirft dir einen Lyoner-Ring zu. Fangen gibt ein Extra-Herz.'],
          ['sock', 'Socke +50', '5 Stück geben ein Extra-Herz.'], ['gold', 'Goldener Ball', 'Zoomies! 7 Sekunden unaufhaltsam.'],
          ['marli', 'Marly', 'Draufreiten: ein Freitreffer und Dreifachsprung.']
        ]
      }
    }
  }
};
