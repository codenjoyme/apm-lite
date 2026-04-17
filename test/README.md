# Skills CLI — Smoke Test Framework

## Идея

Smoke-тест запускается в Docker-контейнере (чистый Linux),
выполняет **все** команды CLI с нуля и записывает лог
`command → output` в файл на хостовой машине.

После запуска ты видишь `git diff test/test-log.txt`:
- **diff пустой** → всё как было, можно коммитить.
- **diff есть** → смотришь что изменилось, разбираешься, фиксишь.

Лог коммитится в репозиторий — это «золотой снимок» поведения CLI.

---

## Структура

```
test/
├── README.md          ← ты тут
├── commands.txt       ← список команд для smoke-теста (по одной на строку)
├── run-tests.sh       ← bash-раннер: выполняет команды, пишет лог
├── Dockerfile         ← чистый Linux-контейнер с Node.js + git
└── test-log.txt       ← результат последнего прогона (коммитится)
```

---

## Быстрый старт

### 1. Собрать образ

```bash
cd apm-lite
docker build -t skills-smoke -f test/Dockerfile .
```

### 2. Запустить тест

```bash
docker run --rm -v ./test:/app/test skills-smoke
```

Лог появится в `test/test-log.txt` на хостовой машине.

### 3. Посмотреть результат

```bash
git diff test/test-log.txt
```

Если всё ок:

```bash
git add test/test-log.txt
git commit -m "smoke: update golden log"
```

---

## Как работает

1. **`commands.txt`** — плоский список команд.
   Комментарии (`# ...`) и пустые строки пропускаются.
   `cd` команды меняют рабочую директорию для последующих команд.

2. **`run-tests.sh`** — читает `commands.txt` построчно:
   - выполняет команду;
   - записывает в лог: `$ <команда>`, stdout+stderr, `[exit: N] OK|FAIL`;
   - в конце пишет summary (passed / failed / total).

3. **`Dockerfile`** — образ `node:20-slim` + git.
   Копирует исходники, собирает CLI, запускает `run-tests.sh`.
   Директория `test/` монтируется как volume — лог пишется прямо на хост.

---

## Как добавить новый тест

Просто добавь команду в `commands.txt`:

```
skills create my-new-skill
skills list
```

Запусти контейнер, проверь diff, закоммить новый лог.

---

## FAQ

**Q: Зачем Docker?**
A: Чистое окружение. Никаких артефактов от предыдущих запусков,
никаких зависимостей от хостовой ОС.

**Q: Можно запустить без Docker?**
A: Да, но на Linux. Просто `bash test/run-tests.sh`.
Убедись что `node`, `npm`, `git` установлены и CLI собран.

**Q: Тест упал, что делать?**
A: Открой `test/test-log.txt`, найди `[FAIL]`, посмотри вывод команды.
