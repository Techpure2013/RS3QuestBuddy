# RS3QuestBuddy

RS3QuestBuddy is a tool built upon the foundations of `Alt1`, utilizing OCR data to guide you through quests in RuneScape 3.

This project is a direct fork of the original, the features included in this version significantly offload data being parsed on the client side.
Thus reducing the load size of the github repo, a CDN is used in place and can be accessed from the public as well.

---

# Adding to Alt1
You may add this to your Alt1 via the following URL:
`alt1://addapp/https://techpure.dev/RS3QuestBuddy/appconfig.prod.json`

# Building from Source
**Run install**
```bash
$ npm run install
```

**Build project out to `./dist`**
```bash
$ npm run build
```

**Run project on localhost:3000**
```bash
$ npm run start
```
