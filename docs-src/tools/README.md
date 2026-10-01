# tools
- `lint-anim.py <папка>`: падает, если в @keyframes есть что-то кроме transform/opacity (исключение `holdfill`). `python3 tools/lint-anim.py components`
- `perf-audit.js`: выполнить на открытой странице (DevTools или Playwright), вернёт запущенные анимации и не-композиторные свойства.
- `perf.py`: трассировка Playwright (Paint/RasterTask); путь к превью правится в начале файла.
- `chk_ov.py <Компонент> <селектор>`: проверка наложений текст/текст, текст/банка, выход за границы.
- `make-can-sizes.py <файл> <папка>`: нарезка банки в XS/S/M/L и цвет диска (Pillow).
