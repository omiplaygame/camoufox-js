# Camoufox-JS: Git & npm мини-шпаргалка

> ⚠️ Внимание: команды `reset --hard` и `--force-with-lease` переписывают историю. Убедись, что понимаешь последствия.

---

## 1) Проверка и добавление `upstream` (оригинального репо)

```bash
# Показать текущие remotes (origin, upstream, и т. п.)
git remote -v

# Если upstream ещё не добавлен — добавить оригинал
git remote add upstream https://github.com/apify/camoufox-js.git

2) Синхронизация твоего master с upstream/master
bash
Копировать код
# Подтянуть все ветки/обновления из upstream
git fetch upstream

# Переключиться на локальный master
git checkout master

# Полностью выровнять локальный master по upstream/master
git reset --hard upstream/master

# Отправить обновлённый master в свой форк (safe-force)
git push origin master --force-with-lease
Полезные проверки:

bash
Копировать код
# Показать, на какие коммиты указывают локальные ветки и их tracking
git branch -vv

# Подробности по удалённому origin (ветки, HEAD, fetch/push URL)
git remote show origin


3) Работа в фиче-ветке feature/fx
bash
Копировать код
# Переключиться на фиче-ветку
git checkout feature/fx

# Аккуратно "переписать" историю фичи поверх актуального master (линейная история)
git rebase master

# Если был rebase — пушим с безопасным форсом, чтобы обновить удалённую ветку
git push origin feature/fx --force-with-lease
Альтернатива без переписи истории:

bash
Копировать код
# Вместо rebase можно просто слить master в фичу (мердж-коммит)
git merge master

# Обычный пуш без переписи истории
git push origin feature/fx


4) Проверка пакета в npm
bash
Копировать код
# Показать последнюю стабильную версию (dist-tag "latest")
npm view camoufox-js version

# Показать все dist-теги (latest, beta, next, и т. п.)
npm view camoufox-js dist-tags


5) Удобный diff против master (без шумного lock-файла)
bash
Копировать код
# Показать отличия относительно master, исключив package-lock.json
git diff master -- . ':(exclude)package-lock.json'


6) Теги релиза
bash
Копировать код
# Создать локальный тег релиза (замени версию при необходимости)
git tag v0.6.2-fx.2

# Отправить тот же тег в origin
git push origin v0.6.2-fx.2
Если тег надо переопределить:

bash
Копировать код
# Удалить локальный тег
git tag -d v0.6.2-fx.2
# Удалить тег в origin
git push origin :refs/tags/v0.6.2-fx.2
# Пересоздать и снова отправить
git tag v0.6.2-fx.2
git push origin v0.6.2-fx.2


7) Обновление версии в package.json
bash
Копировать код
# Задать новую версию в package.json
npm pkg set version=1.56.0-fx.2

# Зафиксировать изменение версии коммитом
git add package.json
git commit -m "chore: bump version to 1.56.0-fx.2"

# Отправить в удалённый репозиторий
git push