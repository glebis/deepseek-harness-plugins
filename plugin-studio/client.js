window.__ModuleLoader__.load({
  id: '@local/plugin-studio',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'pluginStudio'
    const ENDPOINT = `${window.location.origin}/plugin-studio`

    const en = {
      tab: 'Plugin studio',
      close: 'Close',
      openStudio: 'Open Plugin studio',
      intro: 'Describe the plugin instead of writing one. The studio reads the MCP sources you enable, runs one query across their tools, and writes an installable bundle.',
      sourcesTitle: 'Sources',
      sourcesNote: 'MCP servers in this profile. Turn on the ones the studio may read.',
      sourcesEmpty: 'No MCP server is configured in this profile. Create one below, or add it under Plugins, then press Refresh.',
      useInStudio: 'Use in studio',
      stConnected: 'connected',
      stFailed: 'failed',
      stDisabled: 'disabled',
      stUnknown: 'unknown',
      previewTools: 'Preview tools',
      previewing: 'Probing…',
      tools: 'tools',
      noTools: 'No tools listed yet',
      builderTitle: 'New plugin',
      kindPanel: 'Data panel',
      kindPanelHint: 'A card that shows the collected information.',
      kindMcp: 'MCP connection',
      kindMcpHint: 'A bundle that only connects a server.',
      name: 'Name',
      nameHint: 'Lowercase, used as the package and row id.',
      title: 'Title',
      titleHint: 'Shown in the plugin list.',
      description: 'Description',
      descriptionHint: 'What the plugin does, in one sentence.',
      query: 'Query',
      queryHint: 'Sent to tools that take a search term. Leave empty to call tools without one.',
      placement: 'Placement',
      placementDock: 'Below the composer',
      placementTurn: 'After each turn',
      readFrom: 'Read from',
      readFromNote: 'Only enabled sources can be read.',
      noEnabled: 'Enable at least one source above.',
      url: 'Server URL',
      command: 'Command',
      generate: 'Generate bundle',
      collecting: 'Collecting…',
      install: 'Install',
      installing: 'Installing…',
      replace: 'Replace existing files',
      outputDir: 'Output directory',
      create: 'Create and install',
      creating: 'Creating…',
      details: 'Details',
      assistant: 'Ask the studio',
      assistantHint: 'It reads your sources and proposes what to build.',
      ask: 'Ask',
      asking: 'Thinking…',
      askAgain: 'Ask again',
      planTitle: 'Looks ready',
      createPlan: 'Build it',
      hypothesis: 'Thinking',
      question: 'Question',
      topic: 'What should it show?',
      topicDigest: 'A digest',
      topicOpen: 'Open questions',
      topicRecent: 'Recent activity',
      topicCustom: 'Custom…',
      addSource: 'Create an MCP connection',
      refresh: 'Refresh',
      retry: 'Retry',
      packageName: 'Package',
      installState: 'Result',
      installFailed: 'Not installed.',
      installedButDown: 'Installed, but the source did not come up.',
      needsToken: 'If the server answered 401, add an access token below and build again.',
      alreadyInstalled: 'Already installed — nothing to change.',
      backToChat: 'Back to chat',
      updateSources: 'Update sources',
      updatingSources: 'Updating…',
      reconnectAll: 'Reconnect all',
      reconnecting: 'Reconnecting…',
      createdTitle: 'Created plugins',
      createdNote: 'Everything this studio installed, including plugins it no longer tracks.',
      createdEmpty: 'Nothing has been created yet.',
      remove: 'Remove',
      removeConfirm: 'Remove for good?',
      disable: 'Disable',
      enable: 'Enable',
      edit: 'Edit',
      createScreenTitle: 'New plugin',
      createScreenOpen: 'Create a plugin',
      bpTitle: 'Build it',
      bpLead: 'Pick three things. The form below fills itself and stays editable.',
      colIntent: 'What it shows',
      colSurface: 'Where it lives',
      colSources: 'Which sources',
      bpDigest: 'Digest',
      bpDigestHint: 'What changed since last time',
      bpRecent: 'Recent',
      bpRecentHint: 'The newest items first',
      bpCompare: 'Compare',
      bpCompareHint: 'Two sources side by side',
      surfaceTurn: 'In the conversation',
      surfaceTurnHint: 'A panel inside this thread',
      surfaceDock: 'In the side dock',
      surfaceDockHint: 'A panel that stays open',
      colSourcesNote: 'Only connected sources can be read.',
      ctaBuildPanel: 'Build the panel',
      bpNeedSource: 'Connect at least one source first.',
      installedConnected: 'Installed and connected.',
      obs401: 'The server answered 401 Unauthorized.',
      adv401: 'The access token was rejected. Refresh it, or sign in again.',
      obsDown: 'No response from the source.',
      advDown: 'Check the address. Nothing is answering at that URL.',
      advCheck: 'Run a connection check to see what the server actually reports.',
      reachable: 'Source connected.',
      stInstalled: 'Installed',
      stSignIn: 'Sign-in required',
      stConnecting: 'Connecting',
      stConnected: 'Connected',
      stError: 'Connection error',
      signIn: 'Sign in',
      signOut: 'Sign out',
      reconnect: 'Refresh',
      check: 'Check',
      connectBrowser: 'Sign in with browser',
      waitingBrowser: 'Waiting for the browser…',
      signedIn: 'Signed in. The token is stored outside the configuration.',
      oauthHint: 'Uses the server’s own OAuth sign-in. No token is copied by hand.',
      token: 'Access token',
      tokenHint: 'Optional. Sent as a bearer token, for servers that answer 401.',
      headerName: 'Header',
      truncatedNote: 'Some results were dropped to stay within the size limit.',
      skippedTitle: 'Skipped',
      resultTitle: 'Bundle',
      collected: 'collected',
      items: 'items',
      skipped: 'skipped',
      files: 'files',
      installed: 'Installed. It appears in the plugin list above; a data panel shows up in the next session.',
      restartRequired: 'Installed, but the Host needs a restart before it loads.',
      overwritten: 'The directory already exists. Confirm replacing its files.',
      failure: 'The request failed.',
      loading: 'Loading…',
    }

    const ru = {
      tab: 'Plugin studio',
      close: 'Закрыть',
      openStudio: 'Открыть Plugin studio',
      intro: 'Опишите плагин вместо того, чтобы писать его. Студия читает выбранные MCP-источники, выполняет один запрос по их инструментам и собирает готовый bundle.',
      sourcesTitle: 'Источники',
      sourcesNote: 'MCP-серверы этого профиля. Включите те, которые студии разрешено читать.',
      sourcesEmpty: 'В этом профиле нет MCP-серверов. Создайте его ниже или добавьте в разделе «Плагины», затем нажмите «Обновить».',
      useInStudio: 'Использовать в студии',
      stConnected: 'подключён',
      stFailed: 'ошибка',
      stDisabled: 'отключён',
      stUnknown: 'неизвестно',
      previewTools: 'Показать инструменты',
      previewing: 'Проверка…',
      tools: 'инструментов',
      noTools: 'Инструменты ещё не получены',
      builderTitle: 'Новый плагин',
      kindPanel: 'Панель данных',
      kindPanelHint: 'Карточка с собранной информацией.',
      kindMcp: 'Подключение MCP',
      kindMcpHint: 'Bundle, который только подключает сервер.',
      name: 'Имя',
      nameHint: 'Строчными буквами: имя пакета и строки.',
      title: 'Заголовок',
      titleHint: 'Показывается в списке плагинов.',
      description: 'Описание',
      descriptionHint: 'Что делает плагин, одной фразой.',
      query: 'Запрос',
      queryHint: 'Передаётся инструментам, которым нужен поисковый запрос. Можно оставить пустым.',
      placement: 'Размещение',
      placementDock: 'Под полем ввода',
      placementTurn: 'После каждого ответа',
      readFrom: 'Читать из',
      readFromNote: 'Доступны только включённые источники.',
      noEnabled: 'Включите хотя бы один источник выше.',
      url: 'URL сервера',
      command: 'Команда',
      generate: 'Собрать bundle',
      collecting: 'Сбор данных…',
      install: 'Установить',
      installing: 'Установка…',
      replace: 'Заменить существующие файлы',
      outputDir: 'Каталог вывода',
      create: 'Создать и установить',
      creating: 'Создаю…',
      details: 'Подробнее',
      assistant: 'Спросить студию',
      assistantHint: 'Она читает ваши источники и предлагает, что собрать.',
      ask: 'Спросить',
      asking: 'Думаю…',
      askAgain: 'Спросить ещё',
      planTitle: 'Готово к сборке',
      createPlan: 'Собрать',
      hypothesis: 'Мысль',
      question: 'Вопрос',
      topic: 'Что показать?',
      topicDigest: 'Дайджест',
      topicOpen: 'Открытые вопросы',
      topicRecent: 'Последние изменения',
      topicCustom: 'Своё…',
      addSource: 'Создать подключение MCP',
      refresh: 'Обновить',
      retry: 'Повторить',
      packageName: 'Пакет',
      installState: 'Результат',
      installFailed: 'Не установлено.',
      installedButDown: 'Установлено, но источник не поднялся.',
      needsToken: 'Если сервер ответил 401, добавьте токен доступа ниже и соберите снова.',
      alreadyInstalled: 'Уже установлено — менять нечего.',
      backToChat: 'К чату',
      updateSources: 'Обновить источники',
      updatingSources: 'Обновляю…',
      reconnectAll: 'Переподключить всё',
      reconnecting: 'Переподключаю…',
      createdTitle: 'Созданные плагины',
      createdNote: 'Всё, что установила эта студия, включая плагины вне её учёта.',
      createdEmpty: 'Пока ничего не создано.',
      remove: 'Удалить',
      removeConfirm: 'Удалить насовсем?',
      disable: 'Отключить',
      enable: 'Включить',
      edit: 'Изменить',
      createScreenTitle: 'Новый плагин',
      createScreenOpen: 'Создать плагин',
      bpTitle: 'Собрать',
      bpLead: 'Выберите три вещи. Форма ниже заполнится сама и останется редактируемой.',
      colIntent: 'Что показывает',
      colSurface: 'Где живёт',
      colSources: 'Какие источники',
      bpDigest: 'Дайджест',
      bpDigestHint: 'Что изменилось с прошлого раза',
      bpRecent: 'Свежее',
      bpRecentHint: 'Сначала новые',
      bpCompare: 'Сравнение',
      bpCompareHint: 'Два источника рядом',
      surfaceTurn: 'В разговоре',
      surfaceTurnHint: 'Панель прямо в этом треде',
      surfaceDock: 'В боковом доке',
      surfaceDockHint: 'Панель, которая остаётся открытой',
      colSourcesNote: 'Читать можно только подключённые источники.',
      ctaBuildPanel: 'Собрать панель',
      bpNeedSource: 'Сначала подключите хотя бы один источник.',
      installedConnected: 'Установлено и подключено.',
      obs401: 'Сервер ответил 401 Unauthorized.',
      adv401: 'Токен доступа отклонён. Обновите его или войдите заново.',
      obsDown: 'Источник не ответил.',
      advDown: 'Проверьте адрес: по этому URL никто не отвечает.',
      advCheck: 'Запустите проверку соединения, чтобы увидеть, что именно сообщает сервер.',
      reachable: 'Источник подключён.',
      stInstalled: 'Установлен',
      stSignIn: 'Нужен вход',
      stConnecting: 'Подключение',
      stConnected: 'Подключён',
      stError: 'Ошибка подключения',
      signIn: 'Войти',
      signOut: 'Выйти',
      reconnect: 'Обновить',
      check: 'Проверить',
      connectBrowser: 'Войти через браузер',
      waitingBrowser: 'Ждём браузер…',
      signedIn: 'Вход выполнен. Токен хранится вне конфигурации.',
      oauthHint: 'Используется OAuth-вход самого сервера, токен не копируется вручную.',
      token: 'Токен доступа',
      tokenHint: 'Необязательно. Передаётся как bearer-токен для серверов с ответом 401.',
      headerName: 'Заголовок',
      truncatedNote: 'Часть результатов отброшена из-за ограничения размера.',
      skippedTitle: 'Пропущено',
      resultTitle: 'Bundle',
      collected: 'собрано',
      items: 'элементов',
      skipped: 'пропущено',
      files: 'файлов',
      installed: 'Установлено. Плагин появился в списке выше; панель данных появится в новой сессии.',
      restartRequired: 'Установлено, но для загрузки нужен перезапуск Host.',
      overwritten: 'Каталог уже существует. Подтвердите замену файлов.',
      failure: 'Запрос не выполнен.',
      loading: 'Загрузка…',
    }

    const zh = {
      tab: 'Plugin studio',
      close: '关闭',
      openStudio: '打开 Plugin studio',
      intro: '描述插件，而不是编写插件。工作室会读取你启用的 MCP 源，在这些工具上执行一次查询，并生成可安装的 bundle。',
      sourcesTitle: '数据源',
      sourcesNote: '此配置中的 MCP 服务器。开启工作室可读取的服务器。',
      sourcesEmpty: '此配置中没有 MCP 服务器。可在下方创建，或在「插件」中添加，然后点击「刷新」。',
      useInStudio: '在工作室中使用',
      stConnected: '已连接',
      stFailed: '失败',
      stDisabled: '已禁用',
      stUnknown: '未知',
      previewTools: '预览工具',
      previewing: '探测中…',
      tools: '个工具',
      noTools: '尚未列出工具',
      builderTitle: '新建插件',
      kindPanel: '数据面板',
      kindPanelHint: '显示已收集信息的卡片。',
      kindMcp: 'MCP 连接',
      kindMcpHint: '仅连接服务器的 bundle。',
      name: '名称',
      nameHint: '小写，用作包名和行 id。',
      title: '标题',
      titleHint: '显示在插件列表中。',
      description: '描述',
      descriptionHint: '用一句话说明插件做什么。',
      query: '查询',
      queryHint: '发送给需要搜索词的工具有。留空则不发送。',
      placement: '位置',
      placementDock: '输入框下方',
      placementTurn: '每轮回复之后',
      readFrom: '读取来源',
      readFromNote: '只有已启用的来源可读取。',
      noEnabled: '请先在上方启用至少一个来源。',
      url: '服务器 URL',
      command: '命令',
      generate: '生成 bundle',
      collecting: '正在收集…',
      install: '安装',
      installing: '正在安装…',
      replace: '替换现有文件',
      outputDir: '输出目录',
      create: '创建并安装',
      creating: '正在创建…',
      details: '详情',
      assistant: '询问工作室',
      assistantHint: '它会读取你的数据源并提议要构建什么。',
      ask: '询问',
      asking: '思考中…',
      askAgain: '再问一次',
      planTitle: '可以构建了',
      createPlan: '构建',
      hypothesis: '推断',
      question: '问题',
      topic: '要显示什么？',
      topicDigest: '摘要',
      topicOpen: '未解决问题',
      topicRecent: '近期动态',
      topicCustom: '自定义…',
      addSource: '创建 MCP 连接',
      refresh: '刷新',
      retry: '重试',
      packageName: '包名',
      installState: '结果',
      installFailed: '未安装。',
      installedButDown: '已安装，但数据源未能启动。',
      needsToken: '如果服务器返回 401，请在下方填写访问令牌并重新构建。',
      alreadyInstalled: '已安装，无需更改。',
      backToChat: '返回对话',
      updateSources: '更新来源',
      updatingSources: '正在更新…',
      reconnectAll: '全部重连',
      reconnecting: '正在重连…',
      createdTitle: '已创建的插件',
      createdNote: '此工作台安装的所有内容，包括它不再跟踪的插件。',
      createdEmpty: '尚未创建任何内容。',
      remove: '删除',
      removeConfirm: '确定永久删除？',
      disable: '停用',
      enable: '启用',
      edit: '编辑',
      createScreenTitle: '新建插件',
      createScreenOpen: '创建插件',
      bpTitle: '开始构建',
      bpLead: '选择三项，下方表单会自动填入，并且随时可以修改。',
      colIntent: '展示什么',
      colSurface: '放在哪里',
      colSources: '使用哪些来源',
      bpDigest: '摘要',
      bpDigestHint: '自上次以来的变化',
      bpRecent: '最新',
      bpRecentHint: '最新的排在前面',
      bpCompare: '对比',
      bpCompareHint: '两个来源并排',
      surfaceTurn: '对话内',
      surfaceTurnHint: '面板显示在此对话中',
      surfaceDock: '侧边停靠',
      surfaceDockHint: '保持打开的面板',
      colSourcesNote: '只能读取已连接的来源。',
      ctaBuildPanel: '构建面板',
      bpNeedSource: '请先连接至少一个来源。',
      installedConnected: '已安装并已连接。',
      obs401: '服务器返回 401 Unauthorized。',
      adv401: '访问令牌被拒绝。请刷新令牌或重新登录。',
      obsDown: '数据源没有响应。',
      advDown: '请检查地址：该 URL 无任何响应。',
      advCheck: '运行连接检查以查看服务器实际返回的内容。',
      reachable: '数据源已连接。',
      stInstalled: '已安装',
      stSignIn: '需要登录',
      stConnecting: '连接中',
      stConnected: '已连接',
      stError: '连接错误',
      signIn: '登录',
      signOut: '退出',
      reconnect: '刷新',
      check: '检查',
      connectBrowser: '通过浏览器登录',
      waitingBrowser: '等待浏览器…',
      signedIn: '已登录。令牌存储在配置之外。',
      oauthHint: '使用服务器自带的 OAuth 登录，无需手动复制令牌。',
      token: '访问令牌',
      tokenHint: '可选。对返回 401 的服务器作为 bearer 令牌发送。',
      headerName: '请求头',
      truncatedNote: '部分结果因大小限制被丢弃。',
      skippedTitle: '已跳过',
      resultTitle: 'Bundle',
      collected: '已收集',
      items: '项',
      skipped: '已跳过',
      files: '个文件',
      installed: '已安装。它会出现在上方插件列表中；数据面板将在新会话中出现。',
      restartRequired: '已安装，但需要重启 Host 才会加载。',
      overwritten: '目录已存在。请确认替换其中的文件。',
      failure: '请求失败。',
      loading: '加载中…',
    }

    const de = {
      tab: 'Plugin studio',
      close: 'Schließen',
      openStudio: 'Plugin studio öffnen',
      intro: 'Beschreibe das Plugin, statt es zu schreiben. Das Studio liest die freigegebenen MCP-Quellen, führt eine Abfrage über deren Werkzeuge aus und schreibt ein installierbares Bundle.',
      sourcesTitle: 'Quellen',
      sourcesNote: 'MCP-Server in diesem Profil. Schalte die frei, die das Studio lesen darf.',
      sourcesEmpty: 'In diesem Profil ist kein MCP-Server eingerichtet. Erstelle unten einen oder füge ihn unter „Plugins“ hinzu und aktualisiere dann.',
      useInStudio: 'Im Studio verwenden',
      stConnected: 'verbunden',
      stFailed: 'Fehler',
      stDisabled: 'deaktiviert',
      stUnknown: 'unbekannt',
      previewTools: 'Werkzeuge anzeigen',
      previewing: 'Prüfe…',
      tools: 'Werkzeuge',
      noTools: 'Noch keine Werkzeuge gelistet',
      builderTitle: 'Neues Plugin',
      kindPanel: 'Datenpanel',
      kindPanelHint: 'Eine Karte mit den gesammelten Informationen.',
      kindMcp: 'MCP-Verbindung',
      kindMcpHint: 'Ein Bundle, das nur einen Server verbindet.',
      name: 'Name',
      nameHint: 'Kleinbuchstaben; dient als Paket- und Zeilen-ID.',
      title: 'Titel',
      titleHint: 'Erscheint in der Plugin-Liste.',
      description: 'Beschreibung',
      descriptionHint: 'Was das Plugin tut, in einem Satz.',
      query: 'Abfrage',
      queryHint: 'Wird an Werkzeuge mit Suchbegriff gesendet. Leer lassen, um ohne zu senden.',
      placement: 'Platzierung',
      placementDock: 'Unter dem Eingabefeld',
      placementTurn: 'Nach jeder Antwort',
      readFrom: 'Lesen aus',
      readFromNote: 'Nur freigegebene Quellen sind lesbar.',
      noEnabled: 'Aktiviere oben mindestens eine Quelle.',
      url: 'Server-URL',
      command: 'Befehl',
      generate: 'Bundle erzeugen',
      collecting: 'Sammle…',
      install: 'Installieren',
      installing: 'Installiere…',
      replace: 'Vorhandene Dateien ersetzen',
      outputDir: 'Ausgabeverzeichnis',
      create: 'Erstellen und installieren',
      creating: 'Erstelle…',
      details: 'Details',
      assistant: 'Das Studio fragen',
      assistantHint: 'Es liest deine Quellen und schlägt vor, was zu bauen ist.',
      ask: 'Fragen',
      asking: 'Denke…',
      askAgain: 'Nochmal fragen',
      planTitle: 'Bereit zum Bauen',
      createPlan: 'Bauen',
      hypothesis: 'Gedanke',
      question: 'Frage',
      topic: 'Was soll es zeigen?',
      topicDigest: 'Eine Übersicht',
      topicOpen: 'Offene Fragen',
      topicRecent: 'Letzte Aktivität',
      topicCustom: 'Eigene…',
      addSource: 'MCP-Verbindung erstellen',
      refresh: 'Aktualisieren',
      retry: 'Wiederholen',
      packageName: 'Paket',
      installState: 'Ergebnis',
      installFailed: 'Nicht installiert.',
      installedButDown: 'Installiert, aber die Quelle kam nicht hoch.',
      needsToken: 'Antwortet der Server mit 401, trage unten ein Zugriffstoken ein und baue erneut.',
      alreadyInstalled: 'Bereits installiert — nichts zu ändern.',
      backToChat: 'Zurück zum Chat',
      updateSources: 'Quellen aktualisieren',
      updatingSources: 'Aktualisiere…',
      reconnectAll: 'Alle neu verbinden',
      reconnecting: 'Verbinde neu…',
      createdTitle: 'Erstellte Plugins',
      createdNote: 'Alles, was dieses Studio installiert hat, auch nicht mehr verfolgte Plugins.',
      createdEmpty: 'Noch nichts erstellt.',
      remove: 'Entfernen',
      removeConfirm: 'Endgültig entfernen?',
      disable: 'Deaktivieren',
      enable: 'Aktivieren',
      edit: 'Bearbeiten',
      createScreenTitle: 'Neues Plugin',
      createScreenOpen: 'Plugin erstellen',
      bpTitle: 'Bauen',
      bpLead: 'Drei Dinge wählen. Das Formular darunter füllt sich selbst und bleibt änderbar.',
      colIntent: 'Was es zeigt',
      colSurface: 'Wo es lebt',
      colSources: 'Welche Quellen',
      bpDigest: 'Überblick',
      bpDigestHint: 'Was sich seit zuletzt geändert hat',
      bpRecent: 'Aktuell',
      bpRecentHint: 'Das Neueste zuerst',
      bpCompare: 'Vergleich',
      bpCompareHint: 'Zwei Quellen nebeneinander',
      surfaceTurn: 'Im Gespräch',
      surfaceTurnHint: 'Ein Panel in diesem Thread',
      surfaceDock: 'Im Seiten-Dock',
      surfaceDockHint: 'Ein Panel, das offen bleibt',
      colSourcesNote: 'Nur verbundene Quellen sind lesbar.',
      ctaBuildPanel: 'Panel bauen',
      bpNeedSource: 'Verbinde zuerst mindestens eine Quelle.',
      installedConnected: 'Installiert und verbunden.',
      obs401: 'Der Server antwortete mit 401 Unauthorized.',
      adv401: 'Das Zugriffstoken wurde abgelehnt. Aktualisiere es oder melde dich neu an.',
      obsDown: 'Die Quelle hat nicht geantwortet.',
      advDown: 'Prüfe die Adresse: Unter dieser URL antwortet nichts.',
      advCheck: 'Starte eine Verbindungsprüfung, um zu sehen, was der Server tatsächlich meldet.',
      reachable: 'Quelle verbunden.',
      stInstalled: 'Installiert',
      stSignIn: 'Anmeldung nötig',
      stConnecting: 'Verbinde',
      stConnected: 'Verbunden',
      stError: 'Verbindungsfehler',
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      reconnect: 'Aktualisieren',
      check: 'Prüfen',
      connectBrowser: 'Im Browser anmelden',
      waitingBrowser: 'Warte auf den Browser…',
      signedIn: 'Angemeldet. Das Token liegt außerhalb der Konfiguration.',
      oauthHint: 'Nutzt die OAuth-Anmeldung des Servers; kein Token wird kopiert.',
      token: 'Zugriffstoken',
      tokenHint: 'Optional. Wird als Bearer-Token für Server mit 401 gesendet.',
      headerName: 'Header',
      truncatedNote: 'Einige Ergebnisse wurden wegen der Größengrenze verworfen.',
      skippedTitle: 'Übersprungen',
      resultTitle: 'Bundle',
      collected: 'gesammelt',
      items: 'Einträge',
      skipped: 'übersprungen',
      files: 'Dateien',
      installed: 'Installiert. Es erscheint in der Plugin-Liste oben; ein Datenpanel zeigt sich in der nächsten Sitzung.',
      restartRequired: 'Installiert, aber der Host muss neu starten, bevor es lädt.',
      overwritten: 'Das Verzeichnis existiert bereits. Bestätige das Ersetzen der Dateien.',
      failure: 'Die Anfrage ist fehlgeschlagen.',
      loading: 'Lädt…',
    }

    const CSS = [
      '.ps-root{container:ps / inline-size;display:flex;flex-direction:column;gap:16px;width:100%;max-width:780px;min-width:0;',
      'color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;}',
      '.ps-head{display:flex;flex-direction:column;gap:3px;}',
      '.ps-h1{margin:0;font-size:15px;font-weight:600;}',
      '.ps-sub{margin:0;color:var(--dsw-alias-label-secondary);max-width:66ch;}',
      '.ps-section{display:flex;flex-direction:column;gap:10px;padding:14px;',
      'border:0.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,12px);',
      'background:var(--dsw-alias-bg-layer-1);}',
      '.ps-sectionHead{display:flex;align-items:baseline;gap:8px;justify-content:space-between;flex-wrap:wrap;}',
      '.ps-h2{margin:0;font-size:13px;font-weight:600;}',
      '.ps-note{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;}',
      '.ps-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;}',
      '.ps-source{display:flex;align-items:center;gap:10px;padding:9px 10px;',
      'border:0.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm,8px);',
      'background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap;}',
      '.ps-dot{width:7px;height:7px;border-radius:999px;flex:none;background:var(--dsw-alias-state-idle-primary);}',
      '.ps-dot[data-state="connected"]{background:var(--dsw-alias-state-success-primary);}',
      '.ps-dot[data-state="failed"]{background:var(--dsw-alias-state-error-primary);}',
      '.ps-dot[data-state="connecting"],.ps-dot[data-state="reconnecting"],.ps-dot[data-state="waiting-credentials"]{',
      'background:var(--dsw-alias-state-warn-primary);}',
      '.ps-sourceMain{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;}',
      '.ps-sourceName{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.ps-meta{color:var(--dsw-alias-label-secondary);font-size:12px;}',
      '.ps-tools{display:flex;flex-wrap:wrap;gap:5px;width:100%;}',
      '.ps-tool{font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, monospace);font-size:11px;padding:1px 7px;',
      'border:0.5px solid var(--dsw-alias-border-l2);border-radius:999px;color:var(--dsw-alias-label-secondary);}',
      '.ps-switch{display:inline-flex;align-items:center;gap:7px;min-height:32px;border:0;background:transparent;',
      'color:inherit;font:inherit;font-size:12px;cursor:pointer;padding:0;}',
      '.ps-switch:disabled{opacity:0.6;cursor:default;}',
      '.ps-track{width:30px;height:17px;border-radius:999px;background:var(--dsw-alias-border-l2);position:relative;',
      'transition:background 140ms ease-out;flex:none;}',
      '.ps-track[data-on="true"]{background:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));}',
      '.ps-knob{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:999px;background:#fff;',
      'transition:transform 140ms ease-out;}',
      '.ps-track[data-on="true"] .ps-knob{transform:translateX(13px);}',
      '.ps-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}',
      '@container ps (max-width:620px){.ps-grid,.ps-kinds{grid-template-columns:1fr;}}',
      '.ps-field{display:flex;flex-direction:column;gap:5px;min-width:0;}',
      '.ps-fieldWide{grid-column:1/-1;}',
      '.ps-label{font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.ps-input,.ps-textarea{width:100%;box-sizing:border-box;',
      'border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);padding:7px 9px;',
      'background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;}',
      '.ps-textarea{min-height:56px;resize:vertical;}',
      '.ps-input:focus-visible,.ps-textarea:focus-visible,.ps-secondary:focus-visible,.ps-chip:focus-visible,',
      '.ps-kind:focus-visible,.ps-switch:focus-visible,',
      '.ps-primary:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)));outline-offset:2px;}',
      '.ps-kinds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}',
      '.ps-kind{display:flex;flex-direction:column;gap:1px;text-align:left;padding:9px 10px;',
      'border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:transparent;',
      'color:inherit;font:inherit;cursor:pointer;}',
      '.ps-kind[aria-pressed="true"]{border-color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));background:var(--dsw-alias-bg-layer-2);}',
      '.ps-kindName{font-weight:600;}',
      '.ps-chips{display:flex;flex-wrap:wrap;gap:6px;}',
      '.ps-chip{border:0.5px solid var(--dsw-alias-border-l2);border-radius:999px;padding:3px 10px;',
      'background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;}',
      '.ps-chip[aria-pressed="true"]{border-color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));}',
      '.ps-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}',
      '@media (hover:hover){',
      '.ps-secondary:hover:not(:disabled),.ps-chip:hover:not(:disabled),.ps-kind:hover{',
      'background:var(--dsw-alias-bg-layer-2);}',
      '.ps-primary:hover:not(:disabled){filter:brightness(1.06);}',
      '}',
      '.ps-secondary:active:not(:disabled),.ps-chip:active:not(:disabled),.ps-kind:active{',
      'transform:translateY(0.5px);}',
      '.ps-primary:active:not(:disabled){filter:brightness(0.96);}',
      '@media (prefers-reduced-motion:reduce){',
      '.ps-track,.ps-knob{transition:none;}',
      '.ps-secondary:active:not(:disabled),.ps-chip:active:not(:disabled),.ps-kind:active{transform:none;}',
      '}',
      '.ps-primary{border:0;border-radius:var(--dsw-radius-sm,8px);padding:8px 14px;',
      'background:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));color:#fff;font:inherit;font-weight:600;cursor:pointer;}',
      '.ps-primary:disabled{opacity:0.5;cursor:default;}',
      '.ps-head[hidden]{display:none;}',
      '.psc-backdrop{position:fixed;inset:0;z-index:59;background:transparent;}',
      '.psc-layer{position:fixed;top:0;right:0;bottom:0;left:auto;width:min(420px,100%);z-index:60;',
      'display:flex;align-items:stretch;pointer-events:none;}',
      '.psc-panel{pointer-events:auto;display:flex;flex-direction:column;width:100%;max-height:100%;',
      'border-radius:var(--dsw-radius-lg,16px) 0 0 var(--dsw-radius-lg,16px);',
      'border:1px solid var(--dsw-alias-border-subtle,rgba(127,127,127,0.25));border-right:0;',
      'background:var(--dsw-alias-bg-base,Canvas);box-shadow:-12px 0 32px rgba(0,0,0,0.16);overflow:hidden;}',
      '.psc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;',
      'padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-subtle,rgba(127,127,127,0.25));}',
      '.psc-title{font-size:var(--dsw-font-size-base,15px);font-weight:600;}',
      '.psc-head-actions{display:flex;align-items:center;gap:8px;}',
      '.ps-chip[data-tone="muted"]{opacity:0.75;font-style:italic;}',
      '.psc-body{overflow:auto;padding:0 16px 16px;}',
      '.ps-blueprint{margin:0 0 14px;padding:14px;border-radius:var(--dsw-radius-md,12px);',
      'border:1px solid var(--dsw-alias-border-subtle,rgba(127,127,127,0.25));',
      'background:var(--dsw-alias-bg-subtle,transparent);container-type:inline-size;}',
      '.ps-blueprint-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;}',
      '.ps-blueprint-head h3{margin:0 0 4px;font-size:var(--dsw-font-size-base,15px);}',
      '.ps-blueprint-head p{margin:0;color:var(--dsw-alias-text-secondary);font-size:var(--dsw-font-size-sm,13px);}',
      '.ps-illus{flex:0 0 auto;width:132px;height:88px;color:var(--dsw-alias-brand-primary,currentColor);opacity:0.9;}',
      '.ps-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0;}',
      '.ps-col{margin:0;padding:0;border:0;min-width:0;}',
      '.ps-col legend{padding:0 0 6px;font-size:var(--dsw-font-size-sm,13px);color:var(--dsw-alias-text-secondary);}',
      '.ps-opt{display:flex;gap:8px;align-items:flex-start;width:100%;margin:0 0 6px;padding:8px 10px;',
      'text-align:left;cursor:pointer;border-radius:var(--dsw-radius-sm,8px);',
      'border:1px solid var(--dsw-alias-border-subtle,rgba(127,127,127,0.25));background:transparent;',
      'color:inherit;font:inherit;}',
      '.ps-opt[aria-pressed="true"]{border-color:var(--dsw-alias-brand-primary,currentColor);',
      'box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary,currentColor);}',
      '.ps-opt svg{flex:0 0 auto;width:18px;height:18px;margin-top:1px;}',
      '.ps-opt span{display:block;min-width:0;}',
      '.ps-opt strong{display:block;font-weight:600;font-size:var(--dsw-font-size-sm,13px);}',
      '.ps-opt small{display:block;color:var(--dsw-alias-text-secondary);font-size:var(--dsw-font-size-xs,12px);}',
      '.ps-cta{width:100%;padding:12px 16px;font-size:var(--dsw-font-size-base,15px);}',
      '.ps-cta-hint{margin:6px 0 0;color:var(--dsw-alias-text-secondary);font-size:var(--dsw-font-size-xs,12px);}',
      '@container (max-width: 620px){.ps-columns{grid-template-columns:1fr;}.ps-illus{display:none;}}',
      '@media (prefers-reduced-motion: reduce){.ps-opt,.ps-cta{transition:none;}}',
      '.ps-secondary{border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);',
      'padding:7px 12px;background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer;}',
      '.ps-secondary:disabled{opacity:0.5;cursor:default;}',
      '.ps-error{margin:0;color:var(--dsw-alias-state-error-primary);}',
      '.ps-probeError{flex:1 0 100%;margin:0;font-size:12px;color:var(--dsw-alias-state-error-primary);}',
      '.ps-skipped{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px;',
      'font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.ps-details{grid-column:1/-1;display:flex;flex-direction:column;gap:8px;}',
      '.ps-summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary);list-style:none;}',
      '.ps-summary::-webkit-details-marker{display:none;}',
      '.ps-summary::before{content:"\\25B8";display:inline-block;width:12px;transition:transform 120ms ease-out;}',
      '.ps-details[open]>.ps-summary::before{transform:rotate(90deg);}',
      '.ps-summary:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)));outline-offset:2px;}',
      '.ps-detailsGrid{padding-top:8px;}',
      '.ps-question{margin:0;font-weight:600;}',
      '.ps-status{font-size:11px;padding:1px 8px;border-radius:999px;border:0.5px solid var(--dsw-alias-border-l2);',
      'color:var(--dsw-alias-label-secondary);white-space:nowrap;}',
      '.ps-status[data-tone="ok"]{color:var(--dsw-alias-state-success-primary);border-color:currentColor;}',
      '.ps-status[data-tone="warn"]{color:var(--dsw-alias-state-warn-primary);border-color:currentColor;}',
      '.ps-status[data-tone="error"]{color:var(--dsw-alias-state-error-primary);border-color:currentColor;}',
      '.ps-status[data-tone="busy"]{color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));border-color:currentColor;}',
      '.ps-askResult,.ps-plan{display:flex;flex-direction:column;gap:8px;}',
      '.ps-plan{padding-top:10px;border-top:0.5px solid var(--dsw-alias-border-l1);}',
      '@media (prefers-reduced-motion:reduce){.ps-summary::before{transition:none;}}',
      '.ps-ok{margin:0;color:var(--dsw-alias-state-success-primary);}',
      '.ps-files{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px;',
      'font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, monospace);font-size:11px;color:var(--dsw-alias-label-secondary);}',
      '.ps-path{font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, monospace);font-size:11px;word-break:break-all;',
      'color:var(--dsw-alias-label-secondary);}',
      '.psa-button{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;border:0;border-radius:var(--dsw-radius-sm,8px);',
      'padding:0 8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;}',
      '.psa-button[aria-expanded="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.psa-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.psa-icon{display:flex;flex:none;align-items:center;justify-content:center;width:20px;height:20px;}',
      '.psw-layer{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;',
      'padding:28px;pointer-events:none;}',
      '.psw-panel{pointer-events:auto;display:flex;flex-direction:column;width:min(880px,100%);max-height:100%;',
      'border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl,16px);',
      'background:var(--dsw-alias-bg-overlay);overflow:hidden;}',
      '.psw-head{display:flex;align-items:center;gap:10px;flex:none;padding:10px 12px 10px 18px;',
      'border-bottom:0.5px solid var(--dsw-alias-border-l1);}',
      '.psw-title{flex:1;min-width:0;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.psw-close{display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex:none;',
      'border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);',
      'font:inherit;font-size:14px;line-height:1;cursor:pointer;}',
      '.psw-body{flex:1;min-height:0;overflow:auto;padding:16px 18px 20px;}',
      '@media (hover:hover){.psw-close:hover,.psa-button:hover{background:var(--dsw-alias-bg-layer-2);}}',
      '.psw-close:focus-visible,.psa-button:focus-visible{',
      'outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)));outline-offset:2px;}',
    ].join('')

    /**
     * Call one studio operation on the Host half.
     * @param {string} method - operation name.
     * @param {Record<string, unknown>} [args] - operation arguments.
     * @returns {Promise<any>} the operation value.
     */
    async function call(method, args) {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method, args: args || {} }),
      })
      const payload = await response.json().catch(() => null)
      if (!payload || payload.ok !== true) {
        const message = payload && payload.error ? payload.error.message : `Request failed (${response.status})`
        const error = new Error(message)
        if (payload && payload.error && payload.error.code) error.code = payload.error.code
        throw error
      }
      return payload.value
    }

    /**
     * Mirror the Host's slug rule so the page can preview the package name.
     * @param {string} value - raw name.
     * @returns {string} slug, possibly empty.
     */
    function slugOf(value) {
      const slug = String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48)
      return slug.length > 0 ? slug : 'data-panel'
    }

    /**
     * Map a connection state to its localized label.
     * @param {string} value - raw connection state.
     * @param {Function} translate - bound translator.
     * @returns {string} display label.
     */
    function stateLabel(value, translate) {
      if (value === 'connected') return translate('stConnected')
      if (value === 'failed') return translate('stFailed')
      if (value === 'disabled') return translate('stDisabled')
      if (value === 'unknown') return translate('stUnknown')
      return value
    }

    /**
     * One labelled control.
     * @param {object} params - label, hint and control.
     * @returns {import('react').ReactElement} the field element.
     */
    function field(params) {
      return h(params.plain ? 'div' : 'label', {
        className: params.wide ? 'ps-field ps-fieldWide' : 'ps-field',
        ...(params.plain ? { role: 'group', 'aria-label': params.label } : {}),
      },
      h('span', { className: 'ps-label' }, params.label),
      params.control,
      params.hint ? h('span', { className: 'ps-note' }, params.hint) : null)
    }

    /**
     * The Plugin studio settings page.
     * @param {object} props - slot props plus the injected translator.
     * @returns {import('react').ReactElement} the page.
     */
    function StudioPage(props) {
      const t = props.t
      const createMode = props.mode === 'create'
      if (typeof props.useLocaleTick === 'function') props.useLocaleTick()

      const [snapshot, setSnapshot] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [busy, setBusy] = React.useState(null)
      const [kind, setKind] = React.useState('panel')
      const seed = createScreen.seed
      const [name, setName] = React.useState(seed && typeof seed.name === 'string' ? seed.name : '')
      const [title, setTitle] = React.useState('')
      const [description, setDescription] = React.useState('')
      const [query, setQuery] = React.useState('')
      const [slot, setSlot] = React.useState('dock')
      const [preset, setPreset] = React.useState('digest')
      const [url, setUrl] = React.useState(seed && typeof seed.url === 'string' ? seed.url : '')
      const [command, setCommand] = React.useState('')
      const [token, setToken] = React.useState('')
      const [headerName, setHeaderName] = React.useState('Authorization')
      const [authChoice, setAuthChoice] = React.useState('header')
      const [oauthFlow, setOauthFlow] = React.useState(null)
      const pollRef = React.useRef(null)
      const [selected, setSelected] = React.useState([])
      const [probes, setProbes] = React.useState({})
      const [result, setResult] = React.useState(null)
      const [installed, setInstalled] = React.useState(null)
      const [blueprint, setBlueprint] = React.useState({ intent: '', surface: '', sources: [] })
      const [confirmRemove, setConfirmRemove] = React.useState('')
      const [goal, setGoal] = React.useState('')
      const [answers, setAnswers] = React.useState([])
      const [assistant, setAssistant] = React.useState(null)
      const restored = React.useRef(false)
      const builderRef = React.useRef(null)
      const urlRef = React.useRef(null)
      const beginSource = () => {
        setKind('mcp')
        const node = builderRef.current
        if (node && typeof node.scrollIntoView === 'function') {
          const reduced = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches
          node.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
        }
        const input = urlRef.current
        if (input && typeof input.focus === 'function') input.focus()
      }
      const refresh = async () => {
        setBusy('refresh')
        await load()
        setBusy(null)
      }

      const load = React.useCallback(async () => {
        try {
          const value = await call('snapshot')
          setSnapshot(value)
          if (!restored.current && value && value.draft && typeof value.draft === 'object') {
            restored.current = true
            if (typeof value.draft.kind === 'string') setKind(value.draft.kind)
            if (typeof value.draft.name === 'string') setName(value.draft.name)
            if (typeof value.draft.title === 'string') setTitle(value.draft.title)
            if (typeof value.draft.description === 'string') setDescription(value.draft.description)
            if (typeof value.draft.query === 'string') setQuery(value.draft.query)
            if (typeof value.draft.slot === 'string') setSlot(value.draft.slot)
            if (typeof value.draft.preset === 'string') setPreset(value.draft.preset)
            if (typeof value.draft.url === 'string') setUrl(value.draft.url)
            if (typeof value.draft.command === 'string') setCommand(value.draft.command)
            if (Array.isArray(value.draft.selected)) setSelected(value.draft.selected.filter(item => typeof item === 'string'))
          }
          setError(null)
        } catch (failure) {
          setError(failure)
        }
      }, [])

      React.useEffect(() => {
        void load()
      }, [load])

      const sources = snapshot && Array.isArray(snapshot.sources) ? snapshot.sources : []
      const enabled = sources.filter(source => source.enabled).map(source => source.name)

      const toggleSource = async (source) => {
        setBusy(`source:${source.name}`)
        setError(null)
        try {
          const next = await call('setSource', { name: source.name, enabled: !source.enabled })
          setSnapshot(next)
          setSelected(current => current.filter(item => (next.sources || []).some(row => row.name === item && row.enabled)))
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const probeSource = async (source) => {
        setBusy(`probe:${source.name}`)
        setError(null)
        try {
          const value = await call('probe', { name: source.name })
          setProbes(current => ({ ...current, [source.name]: value }))
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const stopPolling = () => {
        if (pollRef.current) clearTimeout(pollRef.current)
        pollRef.current = null
      }

      const pollOauth = async name => {
        try {
          const value = await call('oauth/status', { name })
          setOauthFlow(value)
          if (value.state === 'pending') {
            pollRef.current = setTimeout(() => void pollOauth(name), 1500)
            return
          }
          if (value.state === 'authorized') {
            setAuthChoice('oauth')
            await load()
          }
        } catch (failure) {
          setError(failure)
        }
      }

      const connectOauth = async (sourceName) => {
        setBusy(`oauth:${sourceName}`)
        setError(null)
        try {
          const value = await call('oauth/begin', {
            name: sourceName,
            url: sourceName === slugOf(name) ? url : '',
          })
          if (value.state === 'open') {
            setOauthFlow({ state: 'open', detail: value.detail })
            return
          }
          if (value.authorizeUrl) {
            window.open(value.authorizeUrl, '_blank', 'noopener,noreferrer')
            setOauthFlow({ state: 'pending', authorizeUrl: value.authorizeUrl })
            void pollOauth(sourceName)
          }
        } catch (failure) {
          setOauthFlow({ state: 'error', error: failure.message })
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const updateSources = async () => {
        setBusy('sources')
        try {
          await load()
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      React.useEffect(() => {
        if (!createMode) return undefined
        const timer = setInterval(() => { void load() }, 8000)
        return () => clearInterval(timer)
      }, [createMode])

      const reconnectAll = async () => {
        setBusy('reconnect')
        setError(null)
        try {
          const outcome = await call('sources/reconnect', {})
          const failed = Array.isArray(outcome?.results)
            ? outcome.results.filter(entry => entry.application === 'failed')
            : []
          if (failed.length > 0) {
            setError(new Error(`Reconnect failed for: ${failed.map(entry => entry.name).join(', ')}`))
          }
          await load()
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const removeSource = async (sourceRow) => {
        if (confirmRemove !== sourceRow.name) {
          setConfirmRemove(sourceRow.name)
          return
        }
        setConfirmRemove('')
        setBusy(`remove:${sourceRow.name}`)
        setError(null)
        try {
          const outcome = await call('source/remove', { name: sourceRow.name })
          if (outcome && outcome.application === 'failed') {
            setError(new Error(outcome.error || 'The plugin manager refused the removal'))
          }
          await load()
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const toggleSourceActive = async (sourceRow) => {
        setBusy(`toggle:${sourceRow.name}`)
        setError(null)
        try {
          await call('source/setEnabled', { name: sourceRow.name, enabled: sourceRow.disabled === true })
          await load()
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const sourceAction = async (sourceName, method) => {
        setBusy(`auth:${sourceName}`)
        setError(null)
        try {
          await call(method, { name: sourceName })
          await load()
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const statusOf = source => {
        if (!source.installed) return { key: 'stInstalled', tone: 'idle' }
        if (source.auth.flow === 'pending') return { key: 'stConnecting', tone: 'busy' }
        if (source.auth.flow === 'error') return { key: 'stError', tone: 'error' }
        if (source.auth.mode === 'oauth' && !source.auth.tokenSet) return { key: 'stSignIn', tone: 'warn' }
        if (source.connection === 'connected') return { key: 'stConnected', tone: 'ok' }
        if (source.connection === 'error') return { key: 'stError', tone: 'error' }
        return { key: 'stInstalled', tone: 'idle' }
      }

      const runAsk = async (goalText, answerList) => {
        setBusy('ask')
        setError(null)
        try {
          const value = await call('ask', {
            goal: typeof goalText === 'string' ? goalText : goal,
            answers: Array.isArray(answerList) ? answerList : answers,
            sources: selected.length > 0 ? selected : enabled,
            ingest: true,
          })
          setAssistant(value)
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const choose = option => {
        const next = answers.concat([{ question: assistant?.question ?? '', answer: option.value }])
        setAnswers(next)
        void runAsk(goal, next)
      }

      const toggleSelected = (sourceName) => {
        setSelected(current => current.includes(sourceName)
          ? current.filter(item => item !== sourceName)
          : current.concat(sourceName))
      }

      const create = async plan => {
        setBusy('create')
        setError(null)
        setInstalled(null)
        const picked = plan && typeof plan === 'object' ? plan : {}
        const finalTitle = String(picked.title ?? '').trim().length > 0
          ? String(picked.title).trim()
          : title.trim().length > 0 ? title.trim() : presets[preset].label
        const draft = { kind, name, title, description, query, slot, preset, url, command, selected }
        try {
          const value = await call('generate', {
            kind: picked.kind === 'mcp' || picked.kind === 'panel' ? picked.kind : kind,
            name: (picked.name || name).trim().length > 0 ? (picked.name || name) : slugOf(finalTitle),
            title: finalTitle,
            description: picked.description ?? description,
            query: picked.query ?? query,
            slot: picked.slot === 'turn' ? 'turn' : picked.slot === 'dock' ? 'dock' : slot,
            url,
            command,
            token: authChoice === 'oauth' ? undefined : token.trim().length > 0 ? token.trim() : undefined,
            auth: authChoice === 'oauth' ? 'oauth' : undefined,
            headerName,
            sources: Array.isArray(picked.sources) && picked.sources.length > 0 ? picked.sources : selected,
          })
          setResult(value)
          void call('saveDraft', { draft }).catch(() => {})
          const outcome = await call('install', { dir: value.dir })
          setInstalled(outcome)
        } catch (failure) {
          setError(failure)
        } finally {
          setBusy(null)
        }
      }

      const canGenerate = kind === 'mcp'
        ? (url.trim().length > 0 || command.trim().length > 0)
        : selected.length > 0

      const createdRows = (snapshot && Array.isArray(snapshot.plugins) ? snapshot.plugins : []).map(entry => {
        const asSource = { name: entry.name, installed: true, disabled: entry.enabled === false }
        return h('li', { className: 'ps-source', key: `created-${entry.name}` },
          h('span', { className: 'ps-dot', 'data-state': entry.enabled ? 'connected' : 'idle', 'aria-hidden': 'true' }),
          h('div', { className: 'ps-sourceMain' },
            h('span', { className: 'ps-sourceName' }, entry.name),
            h('span', { className: 'ps-meta' }, `${entry.bundle}${entry.version ? ` · ${entry.version}` : ''} · ${entry.enabled ? 'on' : 'off'}`)),
          h('button', {
            type: 'button',
            className: 'ps-secondary',
            onClick: () => void toggleSourceActive(asSource),
            disabled: busy === `toggle:${entry.name}`,
          }, entry.enabled ? t('disable') : t('enable')),
          h('button', {
            type: 'button',
            className: confirmRemove === entry.name ? 'ps-primary' : 'ps-secondary',
            onClick: () => void removeSource(asSource),
            disabled: busy === `remove:${entry.name}`,
            onBlur: () => setConfirmRemove(''),
          }, confirmRemove === entry.name ? t('removeConfirm') : t('remove')))
      })

      const sourceRows = sources.map(source => {
        const probe = probes[source.name]
        const tools = probe && Array.isArray(probe.toolNames) ? probe.toolNames : []
        const toolCount = typeof source.toolCount === 'number' ? source.toolCount : (Array.isArray(source.tools) ? source.tools.length : 0)
        return h('li', { className: 'ps-source', key: source.name },
          h('span', { className: 'ps-dot', 'data-state': source.state, 'aria-hidden': 'true' }),
          h('div', { className: 'ps-sourceMain' },
            h('span', { className: 'ps-sourceName' }, source.name),
            h('span', { className: 'ps-meta' },
              `${stateLabel(source.state, t)}${toolCount > 0 ? ` · ${toolCount} ${t('tools')}` : ''}${source.lastError ? ` · ${source.lastError}` : ''}`)),
          (() => {
            const status = statusOf(source)
            return h('span', { className: 'ps-status', 'data-tone': status.tone, role: 'status' }, t(status.key))
          })(),
          source.installed
            ? h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => setCreateOpen(true, {
                name: source.name,
                url: typeof source.url === 'string' ? source.url : '',
                authMode: source.auth.mode,
              }),
            }, t('edit'))
            : null,
          source.installed
            ? h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void toggleSourceActive(source),
              disabled: busy === `toggle:${source.name}`,
            }, source.disabled === true ? t('enable') : t('disable'))
            : null,
          source.installed
            ? h('button', {
              type: 'button',
              className: confirmRemove === source.name ? 'ps-primary' : 'ps-secondary',
              onClick: () => void removeSource(source),
              disabled: busy === `remove:${source.name}`,
              onBlur: () => setConfirmRemove(''),
            }, confirmRemove === source.name ? t('removeConfirm') : t('remove'))
            : null,
          source.installed
            ? h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void sourceAction(source.name, 'check'),
              disabled: busy === `auth:${source.name}`,
            }, t('check'))
            : null,
          source.auth.mode === 'oauth' && !source.auth.tokenSet
            ? h('button', {
              type: 'button',
              className: 'ps-primary',
              onClick: () => void connectOauth(source.name),
              disabled: busy === `oauth:${source.name}` || source.auth.flow === 'pending',
            }, source.auth.flow === 'pending' ? t('waitingBrowser') : t('signIn'))
            : null,
          source.auth.mode === 'oauth' && source.auth.tokenSet
            ? h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void sourceAction(source.name, 'oauth/refresh'),
              disabled: busy === `auth:${source.name}`,
            }, t('reconnect'))
            : null,
          source.auth.mode === 'oauth' && source.auth.tokenSet
            ? h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void sourceAction(source.name, 'oauth/signout'),
              disabled: busy === `auth:${source.name}`,
            }, t('signOut'))
            : null,
          h('button', {
            type: 'button',
            className: 'ps-switch',
            role: 'switch',
            'aria-checked': String(source.enabled === true),
            'aria-label': `${t('useInStudio')}: ${source.name}`,
            onClick: () => void toggleSource(source),
            disabled: busy === `source:${source.name}`,
          },
          h('span', { className: 'ps-track', 'data-on': String(source.enabled === true) },
            h('span', { className: 'ps-knob' })),
          h('span', null, t('useInStudio'))),
          h('button', {
            type: 'button',
            className: 'ps-secondary',
            onClick: () => void probeSource(source),
            disabled: busy === `probe:${source.name}`,
            'aria-label': `${t('previewTools')}: ${source.name}`,
          }, busy === `probe:${source.name}` ? t('previewing') : t('previewTools')),
          probe && probe.ok === false
            ? h('p', { className: 'ps-probeError', role: 'alert' }, probe.message)
            : null,
          probe && probe.ok === true && tools.length === 0
            ? h('p', { className: 'ps-probeError ps-note' }, t('noTools'))
            : null,
          tools.length > 0
            ? h('div', { className: 'ps-tools' }, tools.slice(0, 12).map(toolName => h('span', { className: 'ps-tool', key: toolName }, toolName)))
            : null)
      })

      const chips = enabled.length === 0
        ? h('p', { className: 'ps-note' }, t('noEnabled'))
        : h('div', { className: 'ps-chips' }, enabled.map(sourceName => h('button', {
          type: 'button',
          className: 'ps-chip',
          key: sourceName,
          'aria-pressed': String(selected.includes(sourceName)),
          onClick: () => toggleSelected(sourceName),
        }, sourceName)))

      const presets = {
        digest: { label: t('topicDigest'), query: '' },
        open: { label: t('topicOpen'), query: 'open' },
        recent: { label: t('topicRecent'), query: 'recent' },
      }
      const choosePreset = choice => {
        setPreset(choice)
        if (choice !== 'custom') {
          setTitle(presets[choice].label)
          setQuery(presets[choice].query)
        }
      }

      const kindsRow = h('div', { className: 'ps-kinds ps-fieldWide', key: 'kinds' },
        h('button', {
          type: 'button',
          className: 'ps-kind',
          'aria-pressed': String(kind === 'panel'),
          onClick: () => setKind('panel'),
        },
        h('span', { className: 'ps-kindName' }, t('kindPanel')),
        h('span', { className: 'ps-note' }, t('kindPanelHint'))),
        h('button', {
          type: 'button',
          className: 'ps-kind',
          'aria-pressed': String(kind === 'mcp'),
          onClick: () => setKind('mcp'),
        },
        h('span', { className: 'ps-kindName' }, t('kindMcp')),
        h('span', { className: 'ps-note' }, t('kindMcpHint'))))

      const detailsBlock = h('details', { className: 'ps-details' },
        h('summary', { className: 'ps-summary' }, t('details')),
        h('div', { className: 'ps-grid ps-detailsGrid' },
          field({
            label: t('title'),
            hint: t('titleHint'),
            control: h('input', {
              className: 'ps-input',
              type: 'text',
              value: title,
              placeholder: presets[preset === 'custom' ? 'digest' : preset].label,
              onChange: event => { setTitle(event.target.value); setPreset('custom') },
            }),
          }),
          field({
            label: t('name'),
            hint: `${t('packageName')}: @local/${slugOf(title)}`,
            control: h('input', {
              className: 'ps-input',
              type: 'text',
              value: name,
              placeholder: slugOf(title),
              onChange: event => setName(event.target.value),
            }),
          }),
          field({
            label: t('query'),
            hint: t('queryHint'),
            wide: true,
            control: h('input', {
              className: 'ps-input',
              type: 'text',
              value: query,
              onChange: event => { setQuery(event.target.value); setPreset('custom') },
            }),
          }),
          field({
            label: t('description'),
            hint: t('descriptionHint'),
            wide: true,
            control: h('textarea', {
              className: 'ps-textarea',
              value: description,
              onChange: event => setDescription(event.target.value),
            }),
          })))

      const panelFields = [
        field({
          label: t('topic'),
          wide: true,
          plain: true,
          control: h('div', { className: 'ps-chips' }, [
            ...['digest', 'open', 'recent'].map(choice => h('button', {
              type: 'button',
              className: 'ps-chip',
              key: choice,
              'aria-pressed': String(preset === choice),
              onClick: () => choosePreset(choice),
            }, presets[choice].label)),
            h('button', {
              type: 'button',
              className: 'ps-chip',
              key: 'custom',
              'aria-pressed': String(preset === 'custom'),
              onClick: () => choosePreset('custom'),
            }, t('topicCustom')),
          ]),
        }),
        field({
          label: t('readFrom'),
          hint: t('readFromNote'),
          wide: true,
          plain: true,
          control: chips,
        }),
        field({
          label: t('placement'),
          wide: true,
          plain: true,
          control: h('div', { className: 'ps-chips' },
            h('button', {
              type: 'button',
              className: 'ps-chip',
              'aria-pressed': String(slot === 'dock'),
              onClick: () => setSlot('dock'),
            }, t('placementDock')),
            h('button', {
              type: 'button',
              className: 'ps-chip',
              'aria-pressed': String(slot === 'turn'),
              onClick: () => setSlot('turn'),
            }, t('placementTurn'))),
        }),
        detailsBlock,
      ]

      const mcpFields = [
        field({
          label: t('url'),
          hint: 'https://example.com/mcp',
          wide: true,
          control: h('input', {
            className: 'ps-input',
            type: 'text',
            value: url,
            ref: urlRef,
            onChange: event => setUrl(event.target.value),
          }),
        }),
        field({
          label: t('command'),
          hint: 'npx -y some-mcp-server --stdio',
          wide: true,
          control: h('input', {
            className: 'ps-input',
            type: 'text',
            value: command,
            onChange: event => setCommand(event.target.value),
          }),
        }),
        h('div', { className: 'ps-actions ps-fieldWide', key: 'oauth' },
          h('button', {
            type: 'button',
            className: authChoice === 'oauth' ? 'ps-primary' : 'ps-secondary',
            onClick: () => void connectOauth(slugOf(name)),
          }, oauthFlow?.state === 'pending' ? t('waitingBrowser') : t('connectBrowser')),
          h('span', { className: 'ps-note' }, t('oauthHint')),
          authChoice === 'oauth' ? h('span', { className: 'ps-ok' }, t('signedIn')) : null,
          oauthFlow?.state === 'error' ? h('span', { className: 'ps-error' }, oauthFlow.error ?? '') : null),
        field({
          label: t('token'),
          hint: t('tokenHint'),
          control: h('input', {
            className: 'ps-input',
            type: 'password',
            autoComplete: 'off',
            value: token,
            onChange: event => setToken(event.target.value),
          }),
        }),
        field({
          label: t('headerName'),
          control: h('input', {
            className: 'ps-input',
            type: 'text',
            value: headerName,
            placeholder: 'Authorization',
            onChange: event => setHeaderName(event.target.value),
          }),
        }),
        detailsBlock,
      ]

      const GLYPHS = {
        digest: ['M4 6h16', 'M4 11h10', 'M4 16h13'],
        recent: ['M12 7v5l3 2', 'M12 3a9 9 0 1 0 9 9'],
        compare: ['M9 4v16', 'M15 4v16', 'M4 9h3', 'M17 9h3', 'M4 15h3', 'M17 15h3'],
        turn: ['M4 5h16v10H9l-5 4V5z'],
        dock: ['M3 4h18v16H3z', 'M15 4v16'],
        source: ['M12 3v6', 'M12 15v6', 'M5 11h14v3H5z'],
      }
      const glyph = name => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, (GLYPHS[name] || []).map((d, index) => h('path', { key: index, d })))

      const pick = (key, id) => setBlueprint(current => ({ ...current, [key]: current[key] === id ? '' : id }))
      const pickSource = (sourceName) => setBlueprint(current => ({
        ...current,
        sources: sourceName === ''
          ? []
          : current.sources.includes(sourceName)
            ? current.sources.filter(item => item !== sourceName)
            : current.sources.concat(sourceName),
      }))
      const blueprintSources = blueprint.sources.length > 0 ? blueprint.sources : enabled
      const blueprintReady = blueprint.intent.length > 0 && blueprint.surface.length > 0 && blueprintSources.length > 0
      const buildFromBlueprint = () => {
        const slot = blueprint.surface === 'dock' ? 'dock' : 'turn'
        const query = blueprint.intent === 'recent'
          ? 'The newest items first'
          : blueprint.intent === 'compare'
            ? 'Compare these sources side by side'
            : 'What changed since last time'
        setKind('panel')
        setSlot(slot)
        setPreset(blueprint.intent === 'recent' ? 'recent' : blueprint.intent === 'compare' ? 'open' : 'digest')
        void create({
          kind: 'panel',
          slot,
          query,
          sources: blueprintSources,
          title: blueprint.intent === 'compare' ? 'Comparison' : blueprint.intent === 'recent' ? 'Recent' : 'Digest',
        })
      }

      const blueprintBlock = h('section', { className: 'ps-blueprint', 'aria-label': t('bpTitle') },
        h('div', { className: 'ps-blueprint-head' },
          h('div', null,
            h('h3', null, t('bpTitle')),
            h('p', null, t('bpLead'))),
          h('svg', { className: 'ps-illus', viewBox: '0 0 132 88', 'aria-hidden': 'true' },
            h('rect', { x: 2, y: 10, width: 26, height: 68, rx: 4, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.5 }),
            h('rect', { x: 34, y: 10, width: 26, height: 68, rx: 4, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.7 }),
            h('rect', { x: 66, y: 10, width: 26, height: 68, rx: 4, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.5 }),
            h('path', { d: 'M96 30h30v28H96z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }),
            h('path', { d: 'M96 44h30', stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.7 }),
            h('path', { d: 'M28 44h6M60 44h6M92 44h4', stroke: 'currentColor', strokeWidth: 1.4 }))),
        h('div', { className: 'ps-columns' },
          h('fieldset', { className: 'ps-col' },
            h('legend', null, t('colIntent')),
            ...[
              { id: 'digest', label: t('bpDigest'), hint: t('bpDigestHint'), glyph: 'digest' },
              { id: 'recent', label: t('bpRecent'), hint: t('bpRecentHint'), glyph: 'recent' },
              { id: 'compare', label: t('bpCompare'), hint: t('bpCompareHint'), glyph: 'compare' },
            ].map(option => h('button', {
              key: option.id,
              type: 'button',
              className: 'ps-opt',
              'aria-pressed': String(blueprint.intent === option.id),
              onClick: () => pick('intent', option.id),
            }, glyph(option.glyph), h('span', null, h('strong', null, option.label), h('small', null, option.hint))))),
          h('fieldset', { className: 'ps-col' },
            h('legend', null, t('colSurface')),
            ...[
              { id: 'turn', label: t('surfaceTurn'), hint: t('surfaceTurnHint'), glyph: 'turn' },
              { id: 'dock', label: t('surfaceDock'), hint: t('surfaceDockHint'), glyph: 'dock' },
            ].map(option => h('button', {
              key: option.id,
              type: 'button',
              className: 'ps-opt',
              'aria-pressed': String(blueprint.surface === option.id),
              onClick: () => pick('surface', option.id),
            }, glyph(option.glyph), h('span', null, h('strong', null, option.label), h('small', null, option.hint))))),
          h('fieldset', { className: 'ps-col' },
            h('legend', null, t('colSources')),
            h('button', {
              type: 'button',
              className: 'ps-opt',
              'aria-pressed': String(blueprint.sources.length === 0),
              onClick: () => pickSource(''),
            }, glyph('source'), h('span', null,
              h('strong', null, `${t('colSources')} · ${enabled.length}`),
              h('small', null, t('colSourcesNote')))),
            ...enabled.map(sourceName => h('button', {
              key: sourceName,
              type: 'button',
              className: 'ps-opt',
              'aria-pressed': String(blueprint.sources.includes(sourceName)),
              onClick: () => pickSource(sourceName),
            }, glyph('source'), h('span', null, h('strong', null, sourceName)))) )),
        h('button', {
          type: 'button',
          className: 'ps-primary ps-cta',
          disabled: !blueprintReady || busy === 'create',
          onClick: buildFromBlueprint,
        }, busy === 'create' ? t('creating') : t('ctaBuildPanel')),
        blueprintReady ? null : h('p', { className: 'ps-cta-hint' }, t('bpNeedSource')))

      const builderFields = kind === 'mcp' ? [kindsRow, ...mcpFields] : [kindsRow, ...panelFields]

      const assistantBlock = h('section', { className: 'ps-section' },
        h('div', { className: 'ps-sectionHead' },
          h('h3', { className: 'ps-h2' }, t('assistant')),
          h('span', { className: 'ps-meta' }, t('assistantHint'))),
        h('div', { className: 'ps-actions' },
          h('input', {
            className: 'ps-input',
            type: 'text',
            value: goal,
            placeholder: t('assistantHint'),
            'aria-label': t('assistant'),
            onChange: event => setGoal(event.target.value),
            onKeyDown: event => {
              if (event.key === 'Enter') void runAsk(goal, answers)
            },
          }),
          h('button', {
            type: 'button',
            className: 'ps-primary',
            onClick: () => void runAsk(goal, answers),
            disabled: busy === 'ask',
          }, busy === 'ask' ? t('asking') : assistant ? t('askAgain') : t('ask'))),
        answers.length > 0
          ? h('div', { className: 'ps-chips', 'aria-label': t('assistant') },
            answers.map((entry, index) => h('span', {
              key: `answer-${index}`,
              className: 'ps-chip',
              'data-tone': 'muted',
            }, `${entry.answer}`)))
          : null,
        assistant && assistant.hypothesis
          ? h('p', { className: 'ps-note' }, `${t('hypothesis')}: ${assistant.hypothesis}`)
          : null,
        assistant && assistant.warning
          ? h('p', { className: 'ps-note' }, assistant.warning)
          : null,
        assistant && assistant.done !== true && Array.isArray(assistant.options) && assistant.options.length > 0
          ? h('div', { className: 'ps-askResult', role: 'status' },
            h('p', { className: 'ps-question' }, assistant.question),
            h('div', { className: 'ps-chips' }, assistant.options.map((option, index) => h('button', {
              type: 'button',
              className: 'ps-chip',
              key: `${index}-${option.label}`,
              onClick: () => choose(option),
              disabled: busy === 'ask',
            }, option.label))))
          : null,
        assistant && assistant.done === true && assistant.plan
          ? h('div', { className: 'ps-plan', role: 'status' },
            h('p', { className: 'ps-question' }, t('planTitle')),
            h('p', { className: 'ps-note' }, [
              assistant.plan.title,
              (assistant.plan.sources || []).join(', ') || '—',
              assistant.plan.slot === 'turn' ? t('placementTurn') : t('placementDock'),
              assistant.plan.query ? `“${assistant.plan.query}”` : '',
            ].filter(Boolean).join(' · ')),
            h('div', { className: 'ps-actions' }, h('button', {
              type: 'button',
              className: 'ps-primary',
              onClick: () => {
                const plan = assistant.plan
                setSelected(plan.sources || selected)
                void create(plan)
              },
              disabled: busy === 'create',
            }, busy === 'create' ? t('creating') : t('createPlan'))))
          : null)

      const resultBlock = result
        ? h('div', { className: 'ps-section', role: 'status' },
          h('div', { className: 'ps-sectionHead' },
            h('h3', { className: 'ps-h2' }, t('resultTitle')),
            h('span', { className: 'ps-meta' },
              `${result.items.length} ${t('items')} · ${result.skipped.length} ${t('skipped')} · ${result.files.length} ${t('files')}`)),
          h('p', { className: 'ps-path' }, `${result.packageName} → ${result.dir}`),
          result.sources.length > 0
            ? h('p', { className: 'ps-note' }, `${t('readFrom')}: ${result.sources.join(', ')}`)
            : null,
          result.skipped.length > 0
            ? h('ul', { className: 'ps-skipped' }, [
              h('li', { key: 'skipped-title' }, `${t('skippedTitle')}:`),
              ...result.skipped.map((entry, index) => h('li', {
                key: `skipped-${index}-${entry.tool}`,
              }, `· ${entry.source} · ${entry.tool} — ${entry.reason}`)),
            ])
            : null,
          result.truncated ? h('p', { className: 'ps-note' }, t('truncatedNote')) : null,
          h('details', { className: 'ps-details' },
            h('summary', { className: 'ps-summary' }, `${t('files')} · ${result.files.length}`),
            h('ul', { className: 'ps-files' }, result.files.map(file => h('li', { key: file.path }, `${file.path} · ${file.size} B`)))))
        : null

      // An observation states what was seen; advice is offered only for a cause that was actually observed.
      const builtName = (() => {
        const dir = result && typeof result.dir === 'string' ? result.dir : ''
        return dir.split(/[\\/]/).filter(Boolean).pop() || ''
      })()
      const builtSource = sources.find(source => source.name === builtName) || null
      const observedText = (() => {
        if (!installed || !installed.error) return ''
        return typeof installed.error === 'string'
          ? installed.error
          : [installed.error.code, installed.error.diagnostic].filter(Boolean).join(' — ')
      })()
      const observedKind = (() => {
        if (!installed) return 'none'
        if (builtSource && builtSource.connection === 'connected' && builtSource.tools.length > 0) return 'connected'
        if (installed.error && installed.error.code === 'already-installed') return 'present'
        if (/\b401\b|unauthorized/i.test(observedText)) return '401'
        if (installed.reachable === false) return 'unreachable'
        if (installed.error && installed.changed !== true) return 'failed'
        if (installed.application === 'restart-required') return 'restart'
        return 'applied'
      })()

      const installedBlock = installed
        ? h('div', { role: 'status' },
          observedKind === 'failed'
            ? h('p', { className: 'ps-error' }, `${t('installFailed')} ${observedText}`)
            : observedKind === 'present'
              ? h('p', { className: 'ps-ok' }, t('alreadyInstalled'))
              : observedKind === 'connected'
                ? h('p', { className: 'ps-ok' }, t('installedConnected'))
                : observedKind === '401'
                  ? h('div', null,
                    h('p', { className: 'ps-error' }, t('obs401')),
                    h('p', { className: 'ps-note' }, t('adv401')),
                    h('p', { className: 'ps-note' }, `${t('installState')}: ${observedText}`))
                  : observedKind === 'unreachable'
                    ? h('div', null,
                      h('p', { className: 'ps-error' }, t('obsDown')),
                      h('p', { className: 'ps-note' }, t('advDown')),
                      h('p', { className: 'ps-note' }, t('advCheck')),
                      observedText ? h('p', { className: 'ps-note' }, `${t('installState')}: ${observedText}`) : null)
                    : observedKind === 'restart'
                      ? h('p', { className: 'ps-note' }, t('restartRequired'))
                      : h('p', { className: 'ps-ok' }, t('installed')),
          observedKind !== 'connected' && builtSource && builtSource.connection === 'connected'
            ? h('p', { className: 'ps-note' }, t('installedConnected'))
            : null,
          installed.reachable === true && observedKind !== 'connected' && observedKind !== '401'
            ? h('p', { className: 'ps-ok' }, t('reachable'))
            : null,
          Array.isArray(installed.warnings) && installed.warnings.length > 0
            ? h('ul', { className: 'ps-skipped' }, installed.warnings.map((warning, index) => h('li', { key: `warn-${index}` }, `· ${warning}`)))
            : null)
        : null

      const errorBlock = error
        ? h('div', { role: 'alert' },
          h('p', { className: 'ps-error' }, `${t('failure')} ${error.message}`),
          snapshot
            ? null
            : h('div', { className: 'ps-actions' }, h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void refresh(),
              disabled: busy === 'refresh',
            }, t('retry'))))
        : null

      return h('div', { className: 'ps-root', 'data-mode': createMode ? 'create' : 'manage' },
        h('style', null, CSS),
        h('header', { className: 'ps-head', hidden: createMode },
          h('p', { className: 'ps-sub' }, t('intro')),
          createMode
            ? null
            : h('button', {
              type: 'button',
              className: 'ps-primary ps-cta',
              onClick: () => setCreateOpen(true),
            }, t('createScreenOpen'))),
        assistantBlock,
        createMode ? null : h('section', { className: 'ps-section' },
          h('div', { className: 'ps-sectionHead' },
            h('h3', { className: 'ps-h2' }, t('sourcesTitle')),
            h('div', { className: 'ps-actions' },
              h('button', {
                type: 'button',
                className: 'ps-secondary',
                onClick: () => void refresh(),
                disabled: busy === 'refresh',
              }, t('refresh')),
              h('button', {
                type: 'button',
                className: 'ps-secondary',
                onClick: beginSource,
              }, t('addSource')))),
          snapshot ? h('p', { className: 'ps-note' }, t('sourcesNote')) : null,
          !snapshot && !error ? h('p', { className: 'ps-note' }, t('loading')) : null,
          sources.length === 0 && snapshot ? h('p', { className: 'ps-note' }, t('sourcesEmpty')) : null,
          sources.length > 0 ? h('ul', { className: 'ps-list' }, sourceRows) : null),
        createMode ? null : h('section', { className: 'ps-section' },
          h('div', { className: 'ps-sectionHead' },
            h('h3', { className: 'ps-h2' }, t('createdTitle')),
            h('div', { className: 'ps-actions' },
              h('span', { className: 'ps-meta' }, `${createdRows.length}`),
              h('button', {
                type: 'button',
                className: 'ps-secondary',
                onClick: () => void reconnectAll(),
                disabled: busy === 'reconnect',
              }, busy === 'reconnect' ? t('reconnecting') : t('reconnectAll')))),
          h('p', { className: 'ps-note' }, t('createdNote')),
          createdRows.length > 0
            ? h('ul', { className: 'ps-list' }, createdRows)
            : h('p', { className: 'ps-note' }, t('createdEmpty'))),
        createMode ? h('section', { className: 'ps-section', ref: builderRef },
          h('div', { className: 'ps-sectionHead' },
            h('h3', { className: 'ps-h2' }, t('builderTitle')),
            h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => void updateSources(),
              disabled: busy === 'sources',
            }, busy === 'sources' ? t('updatingSources') : `${t('updateSources')} · ${enabled.length}`)),
          blueprintBlock,
          h('div', { className: 'ps-grid' }, builderFields),
          h('div', { className: 'ps-actions' },
            h('button', {
              type: 'button',
              className: 'ps-primary',
              onClick: () => void create(),
              disabled: busy === 'create' || !canGenerate,
            }, busy === 'create' ? t('creating') : t('create')))) : null,
        errorBlock,
        resultBlock,
        installedBlock)
    }

    /** Shared open state for the floating studio window. */
    const studioWindow = { open: false, listeners: new Set() }

    /**
     * Set the floating window state and notify mounted readers.
     * @param {boolean} value - desired state.
     * @returns {void}
     */
    function setStudioOpen(value) {
      studioWindow.open = value === true
      for (const listener of [...studioWindow.listeners]) listener()
    }

    /**
     * Subscribe a component to the floating window state.
     * @returns {boolean} whether the window is open.
     */
    function useStudioOpen() {
      const [open, setOpen] = React.useState(studioWindow.open)
      React.useEffect(() => {
        const listener = () => setOpen(studioWindow.open)
        studioWindow.listeners.add(listener)
        listener()
        return () => { studioWindow.listeners.delete(listener) }
      }, [])
      return open
    }

    /**
     * Open state for the creation surface. Kept on the window because a bundle can be
     * loaded more than once in one page (hot reload, duplicate mount); a module-local
     * object then splits into two, and a click on one copy never reaches the other.
     */
    const createScreen = (globalThis.__pluginStudioCreate ??= { open: false, seed: null, listeners: new Set() })

    /**
     * Set the creation-screen state and notify mounted readers.
     * @param {boolean} value - desired state.
     * @returns {void}
     */
    function setCreateOpen(value, seed) {
      createScreen.seed = value === true && seed && typeof seed === 'object' ? seed : null
      createScreen.open = value === true
      for (const listener of [...createScreen.listeners]) listener()
    }

    /**
     * Subscribe a component to the creation-screen state.
     * @returns {boolean} whether the screen is open.
     */
    function useCreateOpen() {
      const [open, setOpen] = React.useState(createScreen.open)
      React.useEffect(() => {
        const listener = () => setOpen(createScreen.open)
        createScreen.listeners.add(listener)
        listener()
        return () => { createScreen.listeners.delete(listener) }
      }, [])
      return open
    }

    /**
     * The studio mark, drawn inline so the sidebar needs no asset URL.
     * @returns {import('react').ReactElement} the glyph.
     */
    function StudioMark() {
      const accent = 'var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary))'
      return h('svg', { viewBox: '0 0 36 36', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false' },
        h('g', { fill: 'currentColor' },
          h('rect', { x: 5, y: 8, width: 9, height: 4, rx: 2 }),
          h('rect', { x: 5, y: 16, width: 9, height: 4, rx: 2 }),
          h('rect', { x: 5, y: 24, width: 9, height: 4, rx: 2 })),
        h('g', { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M14 10h4M14 18h4M14 26h4' }),
          h('path', { d: 'M18 10v16' }),
          h('path', { d: 'M18 18h4' })),
        h('rect', { x: 22, y: 13, width: 9, height: 10, rx: 2.5, fill: accent }))
    }

    /**
     * Sidebar-foot action that opens the studio over the app.
     * @param {object} props - owner `wide` plus the injected translator.
     * @returns {import('react').ReactElement} the action row.
     */
    function SidebarStudioAction(props) {
      if (typeof props.useLocaleTick === 'function') props.useLocaleTick()
      const open = useCreateOpen()
      const t = props.t
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('button', {
          type: 'button',
          className: 'psa-button',
          'aria-label': t('openStudio'),
          title: t('openStudio'),
          'aria-expanded': String(open),
          onClick: () => setCreateOpen(!open),
        },
        h('span', { className: 'psa-icon' }, h(StudioMark, null)),
        props.wide === true ? h('span', { className: 'psa-label' }, t('tab')) : null))
    }

    /**
     * Frame-wide floating studio window, opened from the sidebar action.
     * @param {object} props - injected translator and locale tick.
     * @returns {import('react').ReactElement | null} the window, or null while closed.
     */
    /**
     * Keeps one broken sheet from disappearing without a trace.
     */
    class SheetBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      render() {
        if (this.state.error) {
          return h('div', { className: 'psc-layer' },
            h('div', { className: 'psc-panel' },
              h('div', { className: 'psc-head' }, h('span', { className: 'psc-title' }, 'Plugin studio failed to render')),
              h('div', { className: 'psc-body' },
                h('p', { className: 'ps-error' }, String(this.state.error?.message ?? this.state.error)),
                h('div', { className: 'ps-actions' },
                  h('button', { type: 'button', className: 'ps-secondary', onClick: () => this.setState({ error: null }) }, 'Retry'),
                  h('button', { type: 'button', className: 'ps-secondary', onClick: () => setCreateOpen(false) }, 'Close')))))
        }
        return this.props.children
      }
    }

    function CreateScreen(props) {
      if (typeof props.useLocaleTick === 'function') props.useLocaleTick()
      const open = useCreateOpen()
      const t = props.t
      React.useEffect(() => {
        if (!open) return undefined
        const onKey = keyEvent => {
          if (keyEvent.key === 'Escape') setCreateOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [open])
      if (!open) return null
      return h(React.Fragment, null,
        h('div', { className: 'psc-backdrop', onClick: () => setCreateOpen(false), 'aria-hidden': 'true' }),
        h('div', { className: 'psc-layer' },
        h('style', null, CSS),
        h('div', {
          className: 'psc-panel',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': t('createScreenTitle'),
        },
        h('div', { className: 'psc-head' },
          h('span', { className: 'psc-title' }, t('createScreenTitle')),
          h('div', { className: 'psc-head-actions' },
            h('button', {
              type: 'button',
              className: 'ps-secondary',
              onClick: () => setCreateOpen(false),
            }, t('backToChat')),
            h('button', {
              type: 'button',
              className: 'psw-close',
              'aria-label': t('close'),
              title: t('close'),
              onClick: () => setCreateOpen(false),
            }, '\u2715'))),
        h('div', { className: 'psc-body' }, h(SheetBoundary, null, h(StudioPage, { ...props, mode: 'create' }))))))
    }

    function StudioWindow(props) {
      if (typeof props.useLocaleTick === 'function') props.useLocaleTick()
      const open = useStudioOpen()
      React.useEffect(() => {
        if (!open) return undefined
        const onKey = event => {
          if (event.key === 'Escape') setStudioOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [open])
      if (!open) return null
      const t = props.t
      return h('div', { className: 'psw-layer' },
        h('style', null, CSS),
        h('div', {
          className: 'psw-panel',
          role: 'dialog',
          'aria-modal': 'false',
          'aria-label': t('tab'),
        },
        h('div', { className: 'psw-head' },
          h('span', { className: 'psw-title' }, t('tab')),
          h('button', {
            type: 'button',
            className: 'psw-close',
            'aria-label': t('close'),
            title: t('close'),
            onClick: () => setStudioOpen(false),
          }, '\u2715')),
        h('div', { className: 'psw-body' }, h(StudioPage, props))))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const disposers = []
          const register = (locale, dict) => {
            try {
              disposers.push(ctx.locale.register(NS, locale, dict))
            } catch (error) {
              ctx.logger?.error?.(error)
            }
          }
          register('en', en)
          register('zh', zh)
          register('ru', ru)
          register('de', de)
          return () => {
            for (const dispose of disposers) dispose()
          }
        }, 'plugin-studio: dictionaries')

        const t = ctx.locale.bind(NS)
        const useLocaleTick = () => {
          const [, setRevision] = React.useState(0)
          React.useEffect(() => ctx.locale.subscribe(() => setRevision(value => value + 1)), [])
        }

        ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
          name: 'settings.plugins.tab',
          id: 'studio',
          order: 20,
          label: () => t('tab'),
          locale: NS,
          inject: () => ({ t, useLocaleTick }),
        }, StudioPage))

        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'studio',
          order: 30,
          label: () => t('tab'),
          locale: NS,
          inject: () => ({ t, useLocaleTick }),
        }, SidebarStudioAction))

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'plugin-studio-create',
          order: 89,
          locale: NS,
          inject: () => ({ t, useLocaleTick }),
        }, CreateScreen))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'plugin-studio',
          order: 90,
          locale: NS,
          inject: () => ({ t, useLocaleTick }),
        }, StudioWindow))
      },
    }
  },
})
